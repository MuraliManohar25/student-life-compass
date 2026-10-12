import { distance, point } from '@turf/turf';
import { StudentSpot, PriceStatus, OpenStatus, AvailabilityStatus } from '../types';

/**
 * Calculates straight-line distance in meters between user and spot using Turf.js
 */
export function calculateDistanceMeters(
  userLat: number,
  userLon: number,
  destLat: number,
  destLon: number
): number {
  const from = point([userLon, userLat]);
  const to = point([destLon, destLat]);
  const distKm = distance(from, to, { units: 'kilometers' });
  return Math.round(distKm * 1000);
}

/**
 * Formats distance according to requirements:
 * < 1000m -> "350 m"
 * >= 1000m -> "1.2 km"
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

interface OverpassTagMap {
  name?: string;
  amenity?: string;
  leisure?: string;
  shop?: string;
  tourism?: string;
  fee?: string;
  charge?: string;
  access?: string;
  opening_hours?: string;
  'addr:street'?: string;
  'addr:housenumber'?: string;
  'addr:suburb'?: string;
  'addr:city'?: string;
}

interface OverpassElement {
  id: number;
  type: string;
  lat: number;
  lon: number;
  tags?: OverpassTagMap;
}

// In-memory cache keyed by rounded lat,lon,radius,category
const overpassCache = new Map<string, { timestamp: number; spots: StudentSpot[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

/**
 * Parse price status strictly according to guidelines:
 * fee=no -> free
 * fee=yes OR charge exists -> paid
 * No reliable information -> unavailable
 */
export function parsePriceStatus(tags: OverpassTagMap = {}): PriceStatus {
  const fee = (tags.fee || '').toLowerCase().trim();
  const charge = tags.charge;
  const amenity = (tags.amenity || '').toLowerCase();
  const leisure = (tags.leisure || '').toLowerCase();

  if (fee === 'no') {
    return 'free';
  }
  if (fee === 'yes' || (charge && charge !== 'no')) {
    return 'paid';
  }
  // Standard public parks and university libraries without fees are generally free
  if (leisure === 'park' || amenity === 'library' || amenity === 'university') {
    if (fee === 'no') return 'free';
  }
  return 'unavailable';
}

/**
 * Parse opening status strictly according to guidelines:
 * open -> OPEN
 * closed -> CLOSED
 * missing -> unknown
 */
export function parseOpeningStatus(tags: OverpassTagMap = {}): {
  status: OpenStatus;
  hoursText: string;
} {
  const rawHours = (tags.opening_hours || '').trim();
  if (!rawHours) {
    return { status: 'unknown', hoursText: '' };
  }

  if (rawHours === '24/7') {
    return { status: 'open', hoursText: 'Open 24/7' };
  }

  // Basic check for standard opening hours format (e.g., "08:00-20:00")
  const currentHour = new Date().getHours();
  const timeMatch = rawHours.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);

  if (timeMatch) {
    const startHour = parseInt(timeMatch[1], 10);
    const endHour = parseInt(timeMatch[3], 10);
    if (currentHour >= startHour && currentHour < endHour) {
      return { status: 'open', hoursText: rawHours };
    } else {
      return { status: 'closed', hoursText: rawHours };
    }
  }

  return { status: 'unknown', hoursText: rawHours };
}

/**
 * Map OSM tags to StudentSpot category
 */
function mapCategory(tags: OverpassTagMap = {}): {
  category: StudentSpot['category'];
  categoryLabel: string;
} {
  const amenity = (tags.amenity || '').toLowerCase();
  const shop = (tags.shop || '').toLowerCase();
  const leisure = (tags.leisure || '').toLowerCase();
  const tourism = (tags.tourism || '').toLowerCase();

  if (['cafe', 'restaurant', 'fast_food', 'pub', 'food_court', 'ice_cream'].includes(amenity)) {
    return { category: 'food', categoryLabel: 'Food & Drink' };
  }
  if (['library', 'university', 'college', 'school'].includes(amenity)) {
    return { category: 'study', categoryLabel: 'Study Spot' };
  }
  if (['cinema', 'theatre'].includes(amenity)) {
    return { category: 'movies', categoryLabel: 'Entertainment' };
  }
  if (
    ['pharmacy', 'hospital', 'clinic', 'bank', 'post_office', 'supermarket'].includes(amenity) ||
    ['supermarket', 'convenience', 'pharmacy', 'chemist', 'books'].includes(shop)
  ) {
    return { category: 'essentials', categoryLabel: 'Essentials' };
  }
  if (['bus_station', 'subway_entrance', 'train_station'].includes(amenity)) {
    return { category: 'transport', categoryLabel: 'Transit' };
  }
  if (['park', 'fitness_centre', 'sports_centre'].includes(leisure) || tourism) {
    return { category: 'lifestyle', categoryLabel: 'Recreation' };
  }

  return { category: 'study', categoryLabel: 'Spot' };
}

/**
 * Format human readable address from OSM tags
 */
export function formatAddress(tags: OverpassTagMap = {}): string {
  const num = tags['addr:housenumber'] || '';
  const street = tags['addr:street'] || '';
  const suburb = tags['addr:suburb'] || tags['addr:city'] || '';

  const parts = [num, street, suburb].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Campus Area';
}

/**
 * Fetch nearby places dynamically from Overpass API (or backend API)
 */
export async function fetchNearbyPlacesOverpass(
  userLat: number,
  userLon: number,
  radiusMeters: number = 3000,
  categoryFilter: string = 'all'
): Promise<StudentSpot[]> {
  // Quantize coordinates to ~100m grid for caching key
  const latKey = userLat.toFixed(3);
  const lonKey = userLon.toFixed(3);
  const cacheKey = `${latKey}_${lonKey}_${radiusMeters}_${categoryFilter}`;

  const cached = overpassCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return recomputeDistances(cached.spots, userLat, userLon);
  }

  // Overpass QL Query for dynamic places
  const query = `[out:json][timeout:12];
(
  node["amenity"~"cafe|restaurant|library|fast_food|pharmacy|bank|cinema|hospital|university|bus_station"](around:${radiusMeters},${userLat},${userLon});
  node["leisure"~"park|fitness_centre|sports_centre"](around:${radiusMeters},${userLat},${userLon});
  node["shop"~"supermarket|convenience|books|pharmacy"](around:${radiusMeters},${userLat},${userLon});
);
out body 35;`;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass HTTP status ${response.status}`);
    }

    const data = await response.json();
    const elements: OverpassElement[] = data.elements || [];

    const spots: StudentSpot[] = [];

    for (const elem of elements) {
      const tags = elem.tags || {};
      const name = tags.name;
      if (!name) continue;

      const distMeters = calculateDistanceMeters(userLat, userLon, elem.lat, elem.lon);
      const catInfo = mapCategory(tags);

      // Filter by category if specific category selected
      if (categoryFilter !== 'all' && catInfo.category !== categoryFilter) {
        continue;
      }

      const priceStatus = parsePriceStatus(tags);
      const opening = parseOpeningStatus(tags);
      const address = formatAddress(tags);

      spots.push({
        id: `osm-${elem.id}`,
        name,
        category: catInfo.category,
        categoryLabel: catInfo.categoryLabel,
        rating: 4.5,
        distance: formatDistance(distMeters),
        distanceMeters: distMeters,
        tags: [catInfo.categoryLabel, priceStatus.toUpperCase()].filter(Boolean),
        crowdInfo: 'Live campus spot',
        actionType: 'navigate',
        actionLabel: 'Directions',
        imageUrl: getCategoryFallbackImage(catInfo.category),
        lat: elem.lat,
        lon: elem.lon,
        address,
        priceStatus,
        openStatus: opening.status,
        openingHoursText: opening.hoursText,
        availabilityStatus: 'unknown', // Strict rule: default unknown unless backend provides actual availability
      });
    }

    // Sort by distance
    spots.sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));

    overpassCache.set(cacheKey, { timestamp: Date.now(), spots });
    return spots;
  } catch (err) {
    console.warn('Overpass API fetch failed, falling back:', err);
    return [];
  }
}

/**
 * Recalculate distances for existing spots without refetching API
 */
export function recomputeDistances(
  spots: StudentSpot[],
  userLat: number,
  userLon: number
): StudentSpot[] {
  return spots
    .map((spot) => {
      if (spot.lat != null && spot.lon != null) {
        const distMeters = calculateDistanceMeters(userLat, userLon, spot.lat, spot.lon);
        return {
          ...spot,
          distanceMeters: distMeters,
          distance: formatDistance(distMeters),
        };
      }
      return spot;
    })
    .sort((a, b) => (a.distanceMeters || 0) - (b.distanceMeters || 0));
}

function getCategoryFallbackImage(category: StudentSpot['category']): string {
  switch (category) {
    case 'food':
      return 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=60';
    case 'study':
      return 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=500&auto=format&fit=crop&q=60';
    case 'movies':
      return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60';
    case 'essentials':
      return 'https://images.unsplash.com/photo-1576602976047-174e57a47881?w=500&auto=format&fit=crop&q=60';
    case 'transport':
      return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&auto=format&fit=crop&q=60';
    case 'lifestyle':
    default:
      return 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&auto=format&fit=crop&q=60';
  }
}
