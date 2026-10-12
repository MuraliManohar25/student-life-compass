import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StudentSpot } from '../types';
import { ExploreMap } from './ExploreMap';
import { PlaceCard } from './PlaceCard';
import {
  fetchNearbyPlacesOverpass,
  recomputeDistances,
  calculateDistanceMeters,
} from '../services/placesService';

interface ExploreScreenProps {
  spots: StudentSpot[];
  savedIds?: Set<string>;
  saveBusyId?: string | null;
  isLoading?: boolean;
  onToggleSave?: (spot: StudentSpot) => Promise<void>;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  spots: initialSpots,
  savedIds,
  saveBusyId,
  isLoading: initialLoading,
  onToggleSave,
}) => {
  // Geolocation state
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [geoState, setGeoState] = useState<'prompt' | 'loading' | 'active' | 'denied' | 'error'>(
    'loading'
  );
  const [geoErrorMessage, setGeoErrorMessage] = useState<string>('');

  // Nearby spots & filter state
  const [nearbySpots, setNearbySpots] = useState<StudentSpot[]>([]);
  const [isFetchingPlaces, setIsFetchingPlaces] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);

  // Notification feedback
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // References for threshold check & cleanup
  const watchIdRef = useRef<number | null>(null);
  const lastFetchedPosRef = useRef<{ lat: number; lon: number } | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const categories = [
    { id: 'all', label: 'All Spots', icon: 'apps' },
    { id: 'food', label: 'Food', icon: 'restaurant' },
    { id: 'study', label: 'Study Spots', icon: 'school' },
    { id: 'movies', label: 'Movies', icon: 'movie' },
    { id: 'essentials', label: 'Essentials', icon: 'local_pharmacy' },
    { id: 'transport', label: 'Transport', icon: 'directions_subway' },
    { id: 'lifestyle', label: 'Recreation', icon: 'park' },
  ];

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = setTimeout(() => setActionFeedback(null), 3500);
  };

  // Helper to load nearby places with Overpass / fallback
  const loadNearbyPlaces = useCallback(
    async (lat: number, lon: number, category: string) => {
      setIsFetchingPlaces(true);
      try {
        const fetched = await fetchNearbyPlacesOverpass(lat, lon, 3000, category);

        if (fetched.length > 0) {
          setNearbySpots(fetched);
        } else {
          // Fallback to initial spots catalog centered on user location
          const updatedFallback = recomputeDistances(initialSpots, lat, lon);
          setNearbySpots(updatedFallback);
        }
        lastFetchedPosRef.current = { lat, lon };
      } catch {
        const updatedFallback = recomputeDistances(initialSpots, lat, lon);
        setNearbySpots(updatedFallback);
      } finally {
        setIsFetchingPlaces(false);
      }
    },
    [initialSpots]
  );

  // Start watching live browser geolocation
  const startGeolocationWatch = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoState('error');
      setGeoErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGeoState('loading');
    setGeoErrorMessage('');

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setUserLat(lat);
        setUserLon(lon);
        setGeoState('active');

        // Check if movement exceeds 100m threshold for refetching places
        if (!lastFetchedPosRef.current) {
          loadNearbyPlaces(lat, lon, selectedCategory);
        } else {
          const movedMeters = calculateDistanceMeters(
            lastFetchedPosRef.current.lat,
            lastFetchedPosRef.current.lon,
            lat,
            lon
          );

          if (movedMeters >= 100) {
            loadNearbyPlaces(lat, lon, selectedCategory);
          } else {
            // Minor movement: recalculate distances locally using Turf.js without network refetch
            setNearbySpots((prev) => recomputeDistances(prev, lat, lon));
          }
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoState('denied');
          setGeoErrorMessage(
            '📍 Location permission is disabled. Please enable location access to discover spots near you.'
          );
        } else if (error.code === error.TIMEOUT) {
          setGeoState('error');
          setGeoErrorMessage('📍 Geolocation request timed out. Tap retry to attempt again.');
        } else {
          setGeoState('error');
          setGeoErrorMessage('📍 Unable to retrieve current location.');
        }

        // Fallback: populate initial catalog spots
        setNearbySpots(initialSpots);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 10000,
      }
    );
  }, [loadNearbyPlaces, selectedCategory, initialSpots]);

  useEffect(() => {
    startGeolocationWatch();
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [startGeolocationWatch]);

  // Handle category change
  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
    if (userLat != null && userLon != null) {
      loadNearbyPlaces(userLat, userLon, catId);
    }
  };

  // Synchronize selection between Map and Place Cards
  const handleSelectSpot = (spot: StudentSpot) => {
    setSelectedSpotId(spot.id);
    const cardEl = cardRefs.current.get(spot.id);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleToggleSave = async (spot: StudentSpot) => {
    if (!onToggleSave) return;
    try {
      await onToggleSave(spot);
      showFeedback(
        savedIds?.has(spot.id)
          ? `Removed ${spot.name} from your saved spots.`
          : `Saved ${spot.name} — saved to your compass list.`
      );
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Could not save this spot.');
    }
  };

  // Filtered places based on category and search query
  const filteredSpots = nearbySpots.filter((spot) => {
    const matchesCategory =
      selectedCategory === 'all' || spot.category === selectedCategory;
    const matchesSearch =
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      spot.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (spot.address || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 space-y-6 max-w-[1400px] mx-auto pb-8 pt-1 lg:pt-2">
      {/* Search Header & Category Scroller */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              Explore Spots
            </h1>
            <p className="text-xs text-gray-500">
              Interactive live location discovery for UW students and surroundings.
            </p>
          </div>

          {/* Location Status Badge */}
          <div className="flex items-center gap-2">
            {geoState === 'loading' && (
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>📍 Finding your location...</span>
              </span>
            )}
            {geoState === 'active' && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Live GPS Active</span>
              </span>
            )}
            {(geoState === 'denied' || geoState === 'error') && (
              <button
                onClick={startGeolocationWatch}
                type="button"
                className="px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100 transition-colors cursor-pointer shadow-xs"
              >
                <span>📍 Retry Location Access</span>
              </button>
            )}
          </div>
        </div>

        {/* Location Banner Warning if permission denied / error */}
        {geoState === 'denied' && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">location_disabled</span>
              <span>{geoErrorMessage}</span>
            </div>
            <button
              onClick={startGeolocationWatch}
              className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold shrink-0 cursor-pointer"
              type="button"
            >
              Enable / Retry
            </button>
          </div>
        )}

        {/* Search Bar */}
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[20px] text-gray-400">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search nearby cafes, quiet study spots, pharmacies, libraries..."
            className="w-full h-11 pl-11 pr-10 rounded-xl bg-white border border-gray-200 text-xs text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none focus:border-indigo-600 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer text-xs hover:bg-gray-200"
              type="button"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 py-0.5 sm:mx-0 sm:px-0">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Toast Feedback */}
      {actionFeedback && (
        <div className="p-3 rounded-2xl bg-indigo-900 text-white text-xs font-medium flex items-center gap-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span className="flex-1">{actionFeedback}</span>
        </div>
      )}

      {/* Responsive Layout Grid (Desktop Side-by-Side, Mobile Stacked) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* MAP COLUMN (Upper on Mobile, Left 7 Columns on Desktop) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-base font-bold text-gray-900">Interactive Map</h2>
            <span className="text-xs text-gray-500 font-medium">
              {userLat != null ? 'Centered on live location' : 'Default UW Campus'}
            </span>
          </div>

          <ExploreMap
            userLat={userLat ?? undefined}
            userLon={userLon ?? undefined}
            spots={filteredSpots}
            selectedSpotId={selectedSpotId}
            onSelectSpot={handleSelectSpot}
            onRecenterUser={startGeolocationWatch}
          />
        </div>

        {/* NEARBY SPOTS LIST COLUMN (Below Map on Mobile, Right 5 Columns on Desktop) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-0.5">
            <h2 className="text-base font-bold text-gray-900">Nearby Spots</h2>
            <span className="text-xs text-gray-500 font-medium">
              {isFetchingPlaces
                ? 'Updating...'
                : `${filteredSpots.length} spot${filteredSpots.length === 1 ? '' : 's'} found`}
            </span>
          </div>

          {/* Empty / Loading State */}
          {filteredSpots.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 space-y-2">
              <span className="material-symbols-outlined text-[36px] text-gray-400">
                {isFetchingPlaces ? 'progress_activity' : 'location_off'}
              </span>
              <p className="text-xs font-semibold text-gray-800">
                {isFetchingPlaces
                  ? 'Finding spots near your coordinates...'
                  : 'No nearby spots found'}
              </p>
              <p className="text-xs text-gray-500">
                {isFetchingPlaces
                  ? 'Querying OpenStreetMap place data.'
                  : 'Try expanding the search radius or clearing search filters.'}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  if (userLat != null && userLon != null) {
                    loadNearbyPlaces(userLat, userLon, 'all');
                  }
                }}
                className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer shadow-xs"
                type="button"
              >
                Reset Filters & Search Radius
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1 no-scrollbar">
              {filteredSpots.map((spot) => (
                <div
                  key={spot.id}
                  ref={(el) => {
                    if (el) cardRefs.current.set(spot.id, el);
                    else cardRefs.current.delete(spot.id);
                  }}
                >
                  <PlaceCard
                    spot={spot}
                    userLat={userLat ?? undefined}
                    userLon={userLon ?? undefined}
                    isSelected={spot.id === selectedSpotId}
                    isSaved={savedIds?.has(spot.id)}
                    isSaveBusy={saveBusyId === spot.id}
                    onSelectCard={handleSelectSpot}
                    onToggleSave={handleToggleSave}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
