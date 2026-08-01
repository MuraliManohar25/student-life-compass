import React, { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import { budgetApi } from "../services/api";

type Coordinates = [number, number];
type CategoryId = "hostel" | "library" | "hospital" | "medical" | "restaurant" | "atm";

interface Place {
  id: string;
  category: CategoryId;
  name: string;
  coordinates: Coordinates;
  address?: string;
  price?: number;
  priceLabel?: string;
}

interface SearchResult {
  id: string;
  label: string;
  coordinates: Coordinates;
}

const DEFAULT_LOCATION: Coordinates = [12.9716, 77.5946];
const ORS_BASE_URL = "https://api.openrouteservice.org";
const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY as string | undefined;

// IDs from ORS's OpenPOI category taxonomy: guest_house/hostel, library,
// hospital, pharmacy, fast_food/restaurant, and ATM.
const CATEGORIES: Record<CategoryId, { label: string; icon: string; ids: number[] }> = {
  hostel: { label: "Hostel / PG", icon: "bed", ids: [106, 107] },
  library: { label: "Library", icon: "local_library", ids: [133] },
  hospital: { label: "Hospital", icon: "local_hospital", ids: [206] },
  medical: { label: "Medical Store", icon: "medication", ids: [208] },
  restaurant: { label: "Budget Restaurant", icon: "restaurant", ids: [566, 570] },
  atm: { label: "ATM", icon: "account_balance", ids: [191] },
};

const placeCache = new Map<string, Promise<Place[]>>();

const pinIcon = (user = false) => L.divIcon({
  className: "",
  html: `<div class="${user ? "map-user-pin" : "map-pin"}" style="width:16px;height:16px"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const haversineDistance = (from: Coordinates, to: Coordinates) => {
  const earthRadius = 6_371_000;
  const rad = (value: number) => value * Math.PI / 180;
  const dLat = rad(to[0] - from[0]);
  const dLng = rad(to[1] - from[1]);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from[0])) * Math.cos(rad(to[0])) * Math.sin(dLng / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const formatDistance = (meters: number) => meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`;

const formatAddress = (tags: Record<string, string>) => {
  const parts = [tags["addr:housenumber"], tags["addr:street"], tags["addr:suburb"], tags["addr:city"]].filter(Boolean);
  return parts.length ? parts.join(", ") : undefined;
};

const numericPrice = (tags: Record<string, string>) => {
  const raw = tags.price_range || tags.price || tags.charge || tags.fee;
  if (!raw) return undefined;
  const values = raw.match(/\d+(?:\.\d+)?/g)?.map(Number).filter(Number.isFinite);
  if (!values?.length) return undefined;
  return { amount: Math.max(...values), label: raw };
};

const affordability = (place: Place, remainingBudget: number | null) => {
  if (place.category !== "restaurant" || !place.price || remainingBudget === null || remainingBudget <= 0) return null;
  if (place.price <= remainingBudget * 0.01) return { label: "Affordable", className: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
  if (place.price <= remainingBudget * 0.03) return { label: "Consider", className: "bg-amber-500/20 text-amber-200 border-amber-500/30" };
  return { label: "Expensive", className: "bg-red-500/20 text-red-200 border-red-500/30" };
};

async function loadPlaces(category: CategoryId, location: Coordinates): Promise<Place[]> {
  if (!ORS_API_KEY) throw new Error("Missing VITE_ORS_API_KEY");
  const cacheKey = `${category}:${location[0].toFixed(2)}:${location[1].toFixed(2)}`;
  const cached = placeCache.get(cacheKey);
  if (cached) return cached;

  const request = fetch(`${ORS_BASE_URL}/pois`, {
    method: "POST",
    headers: { Authorization: ORS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      request: "pois",
      geometry: { geojson: { type: "Point", coordinates: [location[1], location[0]] }, buffer: 2000 },
      filters: { category_ids: CATEGORIES[category].ids },
      limit: 30,
      sortby: "distance",
    }),
  }).then(async (response) => {
    if (!response.ok) throw new Error(`ORS POI request failed (${response.status})`);
    const data = await response.json();
    return (data.features || []).flatMap((feature: any): Place[] => {
      const [lng, lat] = feature.geometry?.coordinates || [];
      const tags = feature.properties?.osm_tags || {};
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return [];
      const parsedPrice = numericPrice(tags);
      return [{
        id: `${category}-${feature.properties?.osm_type}-${feature.properties?.osm_id}`,
        category,
        name: tags.name || "Unnamed place",
        coordinates: [lat, lng],
        address: formatAddress(tags),
        price: parsedPrice?.amount,
        priceLabel: parsedPrice?.label,
      }];
    });
  }).catch((error) => {
    placeCache.delete(cacheKey);
    throw error;
  });
  placeCache.set(cacheKey, request);
  return request;
}

function MapViewport({ center }: { center: Coordinates }) {
  const map = useMap();
  useEffect(() => { map.setView(center, Math.max(map.getZoom(), 14)); }, [center, map]);
  return null;
}

export const NearbyPlacesView: React.FC = () => {
  const [userLocation, setUserLocation] = useState<Coordinates>(DEFAULT_LOCATION);
  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_LOCATION);
  const [locationMessage, setLocationMessage] = useState("Requesting your location...");
  const [activeCategories, setActiveCategories] = useState<Set<CategoryId>>(() => new Set(Object.keys(CATEGORIES) as CategoryId[]));
  const [places, setPlaces] = useState<Record<CategoryId, Place[]>>({ hostel: [], library: [], hospital: [], medical: [], restaurant: [], atm: [] });
  const [loading, setLoading] = useState(true);
  const [placeError, setPlaceError] = useState<string | null>(null);
  const [remainingBudget, setRemainingBudget] = useState<number | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [route, setRoute] = useState<Coordinates[]>([]);
  const [routeSummary, setRouteSummary] = useState<{ distance: number; duration: number } | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationMessage("Location is unavailable. Showing the default map area.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const location: Coordinates = [coords.latitude, coords.longitude];
        setUserLocation(location);
        setMapCenter(location);
        setLocationMessage("");
      },
      () => setLocationMessage("Location permission was denied. Showing the default map area."),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  useEffect(() => {
    budgetApi.getRemainingBudget().then(({ remaining_budget }) => setRemainingBudget(remaining_budget)).catch(() => setRemainingBudget(null));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setPlaceError(null);
    Promise.allSettled((Object.keys(CATEGORIES) as CategoryId[]).map(async (category) => [category, await loadPlaces(category, mapCenter)] as const))
      .then((results) => {
        if (cancelled) return;
        const next = { hostel: [], library: [], hospital: [], medical: [], restaurant: [], atm: [] } as Record<CategoryId, Place[]>;
        let failed = false;
        results.forEach((result) => {
          if (result.status === "fulfilled") next[result.value[0]] = result.value[1];
          else failed = true;
        });
        setPlaces(next);
        if (failed) setPlaceError("Couldn't load some places right now. Check your ORS key or try again shortly.");
        else if (Object.values(next).every((items) => items.length === 0)) setPlaceError("No results found nearby.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [mapCenter]);

  useEffect(() => {
    if (!ORS_API_KEY || searchText.trim().length < 3) { setSearchResults([]); return; }
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(`${ORS_BASE_URL}/geocode/autocomplete?api_key=${encodeURIComponent(ORS_API_KEY)}&text=${encodeURIComponent(searchText)}&size=5`);
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setSearchResults((data.features || []).flatMap((feature: any): SearchResult[] => {
          const [lng, lat] = feature.geometry?.coordinates || [];
          return Number.isFinite(lat) && Number.isFinite(lng) ? [{ id: feature.properties?.gid || `${lat}-${lng}`, label: feature.properties?.label || "Unnamed result", coordinates: [lat, lng] }] : [];
        }));
      } catch { setSearchResults([]); }
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchText]);

  const visiblePlaces = useMemo(() => (Object.entries(places) as [CategoryId, Place[]][]).flatMap(([category, items]) => activeCategories.has(category) ? items : []), [places, activeCategories]);
  const toggleCategory = (category: CategoryId) => setActiveCategories((current) => {
    const next = new Set(current);
    next.has(category) ? next.delete(category) : next.add(category);
    return next;
  });

  const getDirections = async (place: Place) => {
    setSelectedPlace(place);
    setRouteError(null);
    setRoute([]);
    setRouteSummary(null);
    if (!ORS_API_KEY) { setRouteError("Add VITE_ORS_API_KEY to use directions."); return; }
    try {
      const response = await fetch(`${ORS_BASE_URL}/v2/directions/foot-walking/geojson`, {
        method: "POST",
        headers: { Authorization: ORS_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: [[userLocation[1], userLocation[0]], [place.coordinates[1], place.coordinates[0]]] }),
      });
      if (!response.ok) throw new Error("Route request failed");
      const data = await response.json();
      const feature = data.features?.[0];
      const summary = feature?.properties?.summary;
      const coordinates = feature?.geometry?.coordinates?.map(([lng, lat]: [number, number]) => [lat, lng] as Coordinates) || [];
      if (!coordinates.length || !summary) throw new Error("No walking route available");
      setRoute(coordinates);
      setRouteSummary(summary);
    } catch { setRouteError("Couldn't load walking directions right now."); }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-5">
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#c3c0ff] uppercase">STUDENT LOCAL COMPASS</p>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">Nearby essentials</h1>
          <p className="text-xs text-[#c7c4d8] mt-1">Real OpenStreetMap places, with walking directions when you need them.</p>
        </div>
        <div className="relative w-full lg:w-96">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-base text-[#c7c4d8]">search</span>
          <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search an area, college, or landmark" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-xs text-white placeholder:text-[#918fa1] focus:outline-none focus:border-[#c3c0ff]" />
          {searchResults.length > 0 && <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1e] shadow-xl">
            {searchResults.map((result) => <button key={result.id} onClick={() => { setMapCenter(result.coordinates); setSearchText(result.label); setSearchResults([]); }} className="block w-full px-3 py-3 text-left text-xs text-[#e5e2e3] hover:bg-white/5">{result.label}</button>)}
          </div>}
        </div>
      </div>

      {locationMessage && <p className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-xs text-amber-100">{locationMessage}</p>}
      {!ORS_API_KEY && <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-xs text-red-100">Add VITE_ORS_API_KEY to frontend/.env to load nearby places and directions.</p>}

      <div className="flex flex-wrap gap-2">
        {(Object.entries(CATEGORIES) as [CategoryId, typeof CATEGORIES[CategoryId]][]).map(([id, category]) => <button key={id} onClick={() => toggleCategory(id)} className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${activeCategories.has(id) ? "border-[#4f46e5] bg-[#4f46e5]/20 text-white" : "border-white/10 bg-white/5 text-[#c7c4d8] hover:bg-white/10"}`}><span className="material-symbols-outlined mr-1 align-[-2px] text-sm">{category.icon}</span>{category.label}</button>)}
      </div>

      {placeError && <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-xs text-red-100">{placeError}</p>}
      {routeError && <p className="rounded-xl border border-red-400/25 bg-red-400/10 px-4 py-3 text-xs text-red-100">{routeError}</p>}
      {routeSummary && <p className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-100">Walking route: {formatDistance(routeSummary.distance)} , about {Math.ceil(routeSummary.duration / 60)} min.</p>}

      <div className="nearby-map overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1e] shadow-xl shadow-black/20">
        <MapContainer center={mapCenter} zoom={14} className="h-[560px] w-full" scrollWheelZoom>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://openrouteservice.org/">openrouteservice</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapViewport center={mapCenter} />
          <Marker position={userLocation} icon={pinIcon(true)}><Popup><p className="m-0 text-xs font-bold">Your location</p></Popup></Marker>
          {visiblePlaces.map((place) => {
            const tag = affordability(place, remainingBudget);
            return <Marker key={place.id} position={place.coordinates} icon={pinIcon()} eventHandlers={{ click: () => setSelectedPlace(place) }}><Popup><div className="min-w-52 space-y-2"><p className="m-0 text-sm font-bold text-white">{place.name}</p><p className="m-0 text-[11px] text-[#c3c0ff]">{CATEGORIES[place.category].label}</p>{place.address && <p className="m-0 text-xs text-[#c7c4d8]">{place.address}</p>}<p className="m-0 text-xs text-[#c7c4d8]">{formatDistance(haversineDistance(userLocation, place.coordinates))} from you</p>{tag && <p className={`inline-block rounded-full border px-2 py-1 text-[10px] font-bold ${tag.className}`}>{tag.label}{place.priceLabel ? ` (${place.priceLabel})` : ""}</p>}<button onClick={() => getDirections(place)} className="w-full rounded-lg bg-[#4f46e5] px-3 py-2 text-xs font-bold text-white hover:brightness-110">Get Directions</button></div></Popup></Marker>;
          })}
          {route.length > 0 && <Polyline positions={route} pathOptions={{ color: "#c3c0ff", weight: 5, opacity: 0.9 }} />}
        </MapContainer>
      </div>
      {loading && <p className="text-center text-xs text-[#c7c4d8]">Loading nearby places...</p>}
      {!loading && !placeError && visiblePlaces.length === 0 && <p className="text-center text-xs text-[#c7c4d8]">No results found nearby for the selected categories.</p>}
      {selectedPlace && <p className="text-center text-[11px] text-[#918fa1]">Selected: {selectedPlace.name}</p>}
    </div>
  );
};
