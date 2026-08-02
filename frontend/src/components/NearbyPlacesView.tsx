import React, { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, Popup, Polyline, TileLayer, useMap } from "react-leaflet";
import {
  fetchRealNearbyPlaces,
  reverseGeocodeAddress,
  RealPlace,
  Coordinates,
  calculateDistanceMeters,
} from "../services/overpassApi";
import {
  LocalDiscoveryEngine,
  EvaluatedPlace,
  VisitedRecord,
} from "../services/localDiscoveryEngine";
import { getCurrentMonthKey } from "../services/budgetEngine";
import { useAppData } from "../context/AppDataContext";
import { VisitedExpenseModal } from "./Discovery/VisitedExpenseModal";

const DEFAULT_LOCATION: Coordinates = [18.0560, 83.4024]; // Default College Campus coordinates

// Custom Leaflet pins
const userPulseIcon = L.divIcon({
  className: "",
  html: `<div class="relative flex items-center justify-center w-6 h-6">
          <span class="absolute inline-flex w-full h-full rounded-full bg-cyan-400 opacity-75 animate-ping"></span>
          <span class="relative inline-flex w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg"></span>
         </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const getPlacePinIcon = (score: number) => {
  let colorClass = "bg-emerald-500 border-emerald-300";
  if (score < 50) colorClass = "bg-rose-500 border-rose-300";
  else if (score < 70) colorClass = "bg-amber-500 border-amber-300";
  else if (score < 85) colorClass = "bg-cyan-500 border-cyan-300";

  return L.divIcon({
    className: "",
    html: `<div class="w-6 h-6 rounded-full ${colorClass} border-2 text-black text-[10px] font-black flex items-center justify-center shadow-lg shadow-black/40">
            ${score}
           </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

function MapViewport({ center }: { center: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 15));
  }, [center, map]);
  return null;
}

export const NearbyPlacesView: React.FC = () => {
  const { budgetSummary, refreshBudget, refreshNearbyPlaces, recordNearbySearch } = useAppData();
  const monthKey = getCurrentMonthKey();
  const budgetCalcs = budgetSummary;

  const [activeMainTab, setActiveMainTab] = useState<"Discovery" | "Favorites" | "Visited">("Discovery");

  // Geolocation states
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [mapCenter, setMapCenter] = useState<Coordinates>(DEFAULT_LOCATION);
  const [locationAddress, setLocationAddress] = useState<string>("Requesting GPS Location...");
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>("");
  const [locationError, setLocationError] = useState<boolean>(false);
  const [loadingLocation, setLoadingLocation] = useState<boolean>(true);

  // Raw & Evaluated Places
  const [rawPlaces, setRawPlaces] = useState<RealPlace[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [maxDistance, setMaxDistance] = useState<number>(3000);
  const [maxBudgetCost, setMaxBudgetCost] = useState<number>(1000);
  const [affordableOnly, setAffordableOnly] = useState<boolean>(false);
  const [studentFriendlyOnly, setStudentFriendlyOnly] = useState<boolean>(false);

  // Selected Place & Route
  const [selectedPlace, setSelectedPlace] = useState<EvaluatedPlace | null>(null);
  const [routeLine, setRouteLine] = useState<Coordinates[]>([]);

  // Favorites & Visited History
  const [favoritesList, setFavoritesList] = useState<string[]>(() => LocalDiscoveryEngine.getFavorites());
  const [visitedHistory, setVisitedHistory] = useState<VisitedRecord[]>(() => LocalDiscoveryEngine.getVisitedHistory());

  // Visited Expense Modal
  const [visitedModalOpen, setVisitedModalOpen] = useState<boolean>(false);
  const [visitedPlaceTarget, setVisitedPlaceTarget] = useState<EvaluatedPlace | null>(null);

  // Request Browser Geolocation
  const requestLocation = () => {
    setLoadingLocation(true);
    setLocationError(false);

    if (!navigator.geolocation) {
      setLocationError(true);
      setLoadingLocation(false);
      setLocationAddress("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const loc: Coordinates = [coords.latitude, coords.longitude];
        setUserLocation(loc);
        setMapCenter(loc);
        setLocationAccuracy(Math.round(coords.accuracy || 15));
        setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        setLoadingLocation(false);

        // Reverse Geocode Address
        const addr = await reverseGeocodeAddress(coords.latitude, coords.longitude);
        setLocationAddress(addr);

        // Fetch real OSM places
        loadPlacesForLocation(loc, addr);
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        setLocationError(true);
        setLoadingLocation(false);
        // Fallback to default college campus coordinates
        setUserLocation(DEFAULT_LOCATION);
        setMapCenter(DEFAULT_LOCATION);
        setLocationAddress("College Campus, Vizianagaram (Fallback)");
        loadPlacesForLocation(DEFAULT_LOCATION, "College Campus, Vizianagaram (Fallback)");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const loadPlacesForLocation = async (loc: Coordinates, addressLabel?: string) => {
    setLoadingPlaces(true);
    try {
      const fetched = await fetchRealNearbyPlaces(loc);
      setRawPlaces(fetched);
      recordNearbySearch(addressLabel || locationAddress || "Unknown location", fetched.length);
    } catch {
      /* fallbackhandled */
    } finally {
      setLoadingPlaces(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // Evaluated Places with dynamic AI scores
  const evaluatedPlaces = useMemo(() => {
    if (!budgetCalcs) return [];
    return LocalDiscoveryEngine.evaluatePlaces(rawPlaces, monthKey);
  }, [rawPlaces, budgetCalcs, monthKey]);

  // AI Student Insights Highlights
  const highlights = useMemo(() => {
    return LocalDiscoveryEngine.getStudentHighlights(evaluatedPlaces);
  }, [evaluatedPlaces]);

  // Filtered Places & Smart Search
  const filteredPlaces = useMemo(() => {
    let result = [...evaluatedPlaces];
    const q = searchQuery.toLowerCase().trim();

    // Natural Smart Search Handling
    if (q) {
      if (q.includes("cheap") || q.includes("affordable")) {
        result = result.filter((p) => p.status === "Highly Recommended" || p.status === "Affordable" || (budgetCalcs && p.estimatedCost <= budgetCalcs.safeDailyLimit));
      } else if (q.includes("study") || q.includes("library") || q.includes("wifi")) {
        result = result.filter((p) => p.category === "Library" || p.hasWifi || p.isStudentFriendly);
      } else if (q.includes("lunch") || q.includes("food") || q.includes("cafe")) {
        result = result.filter((p) => p.category === "Cafe" || p.category === "Restaurant" || p.category === "Fast Food");
      } else if (q.includes("medical") || q.includes("hospital") || q.includes("pharmacy")) {
        result = result.filter((p) => p.category === "Hospital" || p.category === "Medical Store");
      } else if (q.includes("gym")) {
        result = result.filter((p) => p.category === "Gym");
      } else {
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            p.address.toLowerCase().includes(q)
        );
      }
    }

    if (selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    result = result.filter((p) => p.distanceMeters <= maxDistance);
    result = result.filter((p) => p.estimatedCost <= maxBudgetCost);

    if (affordableOnly && budgetCalcs) {
      result = result.filter((p) => p.estimatedCost <= budgetCalcs.safeDailyLimit);
    }

    if (studentFriendlyOnly) {
      result = result.filter((p) => p.isStudentFriendly || p.hasWifi);
    }

    return result.sort((a, b) => b.aiScorePercent - a.aiScorePercent);
  }, [
    evaluatedPlaces,
    searchQuery,
    selectedCategory,
    maxDistance,
    maxBudgetCost,
    affordableOnly,
    studentFriendlyOnly,
    budgetCalcs?.safeDailyLimit,
  ]);

  // Handle Place Selection & Route Line
  const handleSelectPlace = (place: EvaluatedPlace) => {
    setSelectedPlace(place);
    if (userLocation) {
      setRouteLine([userLocation, place.coordinates]);
    }
  };

  // Toggle Favorite
  const handleToggleFavorite = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = LocalDiscoveryEngine.toggleFavorite(placeId);
    setFavoritesList(updated);
  };

  // Open Visited Modal
  const handleMarkVisitedOpen = (place: EvaluatedPlace, e: React.MouseEvent) => {
    e.stopPropagation();
    setVisitedPlaceTarget(place);
    setVisitedModalOpen(true);
  };

  // Confirm Visited Expense & Sync with Budget Engine
  const handleConfirmVisitedSpend = (amountSpent: number) => {
    if (!visitedPlaceTarget) return;
    const updatedHistory = LocalDiscoveryEngine.recordVisit(visitedPlaceTarget, amountSpent, monthKey);
    setVisitedHistory(updatedHistory);
    refreshBudget();
    refreshNearbyPlaces();
  };

  // One-Click Navigation
  const handleNavigate = (place: EvaluatedPlace, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.coordinates[0]},${place.coordinates[1]}&travelmode=walking`;
    window.open(url, "_blank");
  };

  const currency = budgetCalcs?.currency || "₹";

  if (!budgetCalcs) {
    return (
      <div className="min-h-screen pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-center">
        <div className="text-sm text-[#c7c4d8] flex items-center gap-2">
          <span className="material-symbols-outlined text-sm animate-spin text-cyan-400">autorenew</span>
          <span>Loading shared budget data…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. PAGE HEADER & GPS LOCATION BAR */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1a2e]/80 via-[#16162a]/70 to-[#0f0f1b]/90 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-bold uppercase tracking-widest">
                Student Local Discovery
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                100% Real GPS & OSM Places
              </span>
            </div>

            <h1 className="font-headline font-black text-3xl sm:text-4xl text-white tracking-tight">
              Where can I go today that I can afford?
            </h1>
            <p className="text-xs text-[#c7c4d8] mt-1 max-w-xl">
              AI-powered location assistant matching real nearby places with your live GPS position and daily budget runway.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/10 shrink-0">
            {(["Discovery", "Favorites", "Visited"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveMainTab(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeMainTab === tab
                    ? "bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/30"
                    : "text-[#c7c4d8] hover:text-white"
                }`}
              >
                {tab === "Discovery" ? "Discovery Map" : tab === "Favorites" ? `Favorites (${favoritesList.length})` : `Visited (${visitedHistory.length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Live GPS Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 md:col-span-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-cyan-400 text-xl">my_location</span>
              <div>
                <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">Current GPS Location</span>
                <p className="text-xs font-bold text-white truncate max-w-xs">{locationAddress}</p>
              </div>
            </div>
            {loadingLocation ? (
              <span className="material-symbols-outlined text-xs animate-spin text-cyan-400">autorenew</span>
            ) : (
              <button
                onClick={requestLocation}
                className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] text-[#c3c0ff] hover:text-white"
                title="Refresh GPS Location"
              >
                Refresh
              </button>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">Coordinates & Accuracy</span>
              <p className="text-xs font-mono font-bold text-white">
                {userLocation ? `${userLocation[0].toFixed(4)}°, ${userLocation[1].toFixed(4)}°` : "Acquiring..."}
              </p>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold">±{locationAccuracy || 15}m</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">Last GPS Update</span>
              <p className="text-xs font-bold text-white font-mono">{lastUpdatedTime || "Just now"}</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>

        {/* 2. DYNAMIC BUDGET INTEGRATION BAR */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-[#4f46e5]/10 to-transparent border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-xl">account_balance_wallet</span>
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Budget Integration</span>
              <p className="text-xs text-white font-medium">
                Remaining Monthly Budget: <strong className="text-white font-bold">{currency}{budgetCalcs.remainingBudget.toLocaleString()}</strong> • Today's Safe Daily Limit: <strong className="text-emerald-400 font-bold">{currency}{budgetCalcs.safeDailyLimit}/day</strong>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#c3c0ff] shrink-0 self-start sm:self-auto">
            {budgetCalcs.budgetUtilization}% Budget Utilized
          </span>
        </div>
      </div>

      {/* LOCATION DENIED / PERMISSION ERROR WARNING */}
      {locationError && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-200">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-400 text-2xl">location_off</span>
            <div>
              <h3 className="font-headline font-bold text-base text-white">We couldn't access your location</h3>
              <p className="text-xs text-rose-200/80 mt-0.5">
                Enable location services to discover real affordable places near your campus. Showing fallback campus area.
              </p>
            </div>
          </div>
          <button
            onClick={requestLocation}
            className="px-5 py-2.5 rounded-2xl bg-rose-500 text-white font-bold text-xs hover:brightness-110 shadow-lg shadow-rose-500/30 shrink-0"
          >
            Retry Location
          </button>
        </div>
      )}

      {/* TAB 1: DISCOVERY MAP & RECOMMENDATIONS */}
      {activeMainTab === "Discovery" && (
        <div className="space-y-8">
          {/* 3. AI STUDENT INSIGHTS HIGHLIGHTS BANNER */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="font-headline font-bold text-xl text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c3c0ff]">psychology</span>
                <span>AI Student Highlights</span>
              </h2>
              <span className="text-xs text-[#c7c4d8]">Top picks for your daily budget</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {highlights.affordableLunch && (
                <div
                  onClick={() => handleSelectPlace(highlights.affordableLunch!)}
                  className="p-3 rounded-2xl glass-card border border-white/10 hover:border-white/20 cursor-pointer space-y-1"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 block">Affordable Lunch</span>
                  <p className="text-xs font-bold text-white truncate">{highlights.affordableLunch.name}</p>
                  <p className="text-[10px] text-[#c7c4d8]">{currency}{highlights.affordableLunch.estimatedCost} • {highlights.affordableLunch.walkingTimeMins}m walk</p>
                </div>
              )}

              {highlights.studyCafe && (
                <div
                  onClick={() => handleSelectPlace(highlights.studyCafe!)}
                  className="p-3 rounded-2xl glass-card border border-white/10 hover:border-white/20 cursor-pointer space-y-1"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-300 block">Best Study Cafe</span>
                  <p className="text-xs font-bold text-white truncate">{highlights.studyCafe.name}</p>
                  <p className="text-[10px] text-[#c7c4d8]">{currency}{highlights.studyCafe.estimatedCost} • Wi-Fi</p>
                </div>
              )}

              {highlights.groupStudy && (
                <div
                  onClick={() => handleSelectPlace(highlights.groupStudy!)}
                  className="p-3 rounded-2xl glass-card border border-white/10 hover:border-white/20 cursor-pointer space-y-1"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-[#c3c0ff] block">Group Study</span>
                  <p className="text-xs font-bold text-white truncate">{highlights.groupStudy.name}</p>
                  <p className="text-[10px] text-[#c7c4d8]">{highlights.groupStudy.category}</p>
                </div>
              )}

              {highlights.nearestHospital && (
                <div
                  onClick={() => handleSelectPlace(highlights.nearestHospital!)}
                  className="p-3 rounded-2xl glass-card border border-white/10 hover:border-white/20 cursor-pointer space-y-1"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-rose-300 block">Nearest Medical</span>
                  <p className="text-xs font-bold text-white truncate">{highlights.nearestHospital.name}</p>
                  <p className="text-[10px] text-[#c7c4d8]">{highlights.nearestHospital.distanceMeters}m away</p>
                </div>
              )}

              {highlights.stationery && (
                <div
                  onClick={() => handleSelectPlace(highlights.stationery!)}
                  className="p-3 rounded-2xl glass-card border border-white/10 hover:border-white/20 cursor-pointer space-y-1"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-300 block">Cheapest Supplies</span>
                  <p className="text-xs font-bold text-white truncate">{highlights.stationery.name}</p>
                  <p className="text-[10px] text-[#c7c4d8]">{currency}{highlights.stationery.estimatedCost} avg</p>
                </div>
              )}

              {highlights.closestBusStop && (
                <div
                  onClick={() => handleSelectPlace(highlights.closestBusStop!)}
                  className="p-3 rounded-2xl glass-card border border-white/10 hover:border-white/20 cursor-pointer space-y-1"
                >
                  <span className="text-[9px] font-bold uppercase tracking-wider text-purple-300 block">Closest Transit</span>
                  <p className="text-xs font-bold text-white truncate">{highlights.closestBusStop.name}</p>
                  <p className="text-[10px] text-[#c7c4d8]">{highlights.closestBusStop.distanceMeters}m away</p>
                </div>
              )}
            </div>
          </div>

          {/* 4. FILTERS & SMART NATURAL SEARCH */}
          <div className="glass-card p-6 rounded-3xl border border-white/10 space-y-4 bg-gradient-to-br from-[#1a1a2e]/70 to-[#0f0f1b]/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Natural Search Bar */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-[#c7c4d8]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Smart Search: 'Cheap lunch', 'Affordable Cafe', 'Library Near Me', 'Coffee Under ₹150'..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-2.5 pl-11 pr-4 text-xs text-white placeholder:text-[#918fa1] focus:outline-none focus:border-[#4f46e5] transition-all"
                />
              </div>

              {/* Toggle Filters */}
              <div className="flex items-center gap-3 shrink-0">
                <label className="flex items-center gap-2 text-xs text-[#c7c4d8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={affordableOnly}
                    onChange={(e) => setAffordableOnly(e.target.checked)}
                    className="rounded border-white/20 text-[#4f46e5]"
                  />
                  <span>Affordable Only</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-[#c7c4d8] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={studentFriendlyOnly}
                    onChange={(e) => setStudentFriendlyOnly(e.target.checked)}
                    className="rounded border-white/20 text-[#4f46e5]"
                  />
                  <span>Student Friendly / Wi-Fi</span>
                </label>
              </div>
            </div>

            {/* Category Chips Bar */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
              {["All", "Cafe", "Restaurant", "Fast Food", "Library", "Hospital", "Medical Store", "Gym", "Hostel", "Stationery", "Bank / ATM", "Supermarket", "Bus Stop"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? "bg-[#4f46e5] text-white shadow-md shadow-[#4f46e5]/30"
                      : "bg-white/5 border border-white/10 text-[#c7c4d8] hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* 5. LIVE INTERACTIVE LEAFLET MAP & PLACE CARDS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Leaflet Map */}
            <div className="lg:col-span-1 glass-card p-4 rounded-3xl border border-white/10 space-y-3 bg-[#13131e] relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-cyan-400">map</span>
                  <span>Live Interactive Map</span>
                </span>
                <span className="text-[10px] text-[#c7c4d8]">{filteredPlaces.length} Places Found</span>
              </div>

              <div className="h-[520px] rounded-2xl overflow-hidden border border-white/10 relative">
                <MapContainer
                  center={mapCenter}
                  zoom={15}
                  className="h-full w-full"
                  scrollWheelZoom
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapViewport center={mapCenter} />

                  {/* User Pulse Location Marker */}
                  {userLocation && (
                    <Marker position={userLocation} icon={userPulseIcon}>
                      <Popup>
                        <div className="p-1 text-xs text-black font-bold">Your Live GPS Location</div>
                      </Popup>
                    </Marker>
                  )}

                  {/* Place Markers color-coded by AI score */}
                  {filteredPlaces.map((place) => (
                    <Marker
                      key={place.id}
                      position={place.coordinates}
                      icon={getPlacePinIcon(place.aiScorePercent)}
                      eventHandlers={{ click: () => handleSelectPlace(place) }}
                    >
                      <Popup>
                        <div className="min-w-44 space-y-1.5 p-1">
                          <p className="font-bold text-xs text-white">{place.name}</p>
                          <p className="text-[10px] text-[#c3c0ff]">{place.category} • {place.distanceMeters}m</p>
                          <p className="text-[11px] font-bold text-emerald-400">
                            Est. Cost: {currency}{place.estimatedCost}
                          </p>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${place.statusColor}`}>
                            {place.status} ({place.aiScorePercent}%)
                          </span>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Route Polyline when place selected */}
                  {routeLine.length > 0 && (
                    <Polyline positions={routeLine} pathOptions={{ color: "#818cf8", weight: 4, dashArray: "6 6" }} />
                  )}
                </MapContainer>
              </div>
            </div>

            {/* Place Cards Grid */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline font-bold text-xl text-white">
                  Affordability Ranked Places ({filteredPlaces.length})
                </h3>
                <span className="text-xs text-[#c7c4d8]">Ranked by 40% Budget Match + Proximity</span>
              </div>

              {loadingPlaces ? (
                <div className="p-12 text-center text-xs text-[#c7c4d8] flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm animate-spin text-cyan-400">autorenew</span>
                  <span>Fetching real OpenStreetMap places nearby...</span>
                </div>
              ) : filteredPlaces.length === 0 ? (
                <div className="p-12 glass-card rounded-3xl border border-white/10 text-center text-xs text-[#c7c4d8] space-y-2">
                  <p className="text-sm font-bold text-white">No matching places found</p>
                  <p>Try resetting filters or expanding distance/budget limits.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                  {filteredPlaces.map((place) => {
                    const isFav = favoritesList.includes(place.id);

                    return (
                      <div
                        key={place.id}
                        onClick={() => handleSelectPlace(place)}
                        className={`p-5 md:p-6 rounded-3xl border transition-all duration-300 cursor-pointer space-y-4 group ${
                          selectedPlace?.id === place.id
                            ? "bg-[#4f46e5]/15 border-[#4f46e5]/60 shadow-xl"
                            : "glass-card border-white/10 hover:border-white/20"
                        }`}
                      >
                        {/* Header: Title, Category, Rating & AI Score */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-headline font-bold text-lg text-white group-hover:text-[#c3c0ff] transition-colors">
                                {place.name}
                              </h4>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#c3c0ff]">
                                {place.category}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${place.statusColor}`}>
                                {place.status}
                              </span>
                            </div>

                            <p className="text-xs text-[#c7c4d8] mt-0.5">
                              {place.address} • {place.distanceMeters} m ({place.walkingTimeMins} min walk)
                            </p>
                          </div>

                          {/* AI Score Circle */}
                          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-[#c3c0ff] uppercase block">AI Score</span>
                              <p className="text-2xl font-headline font-black text-white">{place.aiScorePercent}%</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
                              {place.rating} ⭐
                            </div>
                          </div>
                        </div>

                        {/* Metric Row: Estimated Cost & Budget Match */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                          <div>
                            <span className="text-[10px] text-[#c7c4d8] uppercase font-bold block">Estimated Cost</span>
                            <p className="text-sm font-bold text-white">
                              {place.estimatedCost === 0 ? "Free" : `${currency}${place.estimatedCost}`}
                            </p>
                          </div>

                          <div>
                            <span className="text-[10px] text-[#c7c4d8] uppercase font-bold block">Today's Limit</span>
                            <p className="text-sm font-bold text-emerald-400">{currency}{budgetCalcs.safeDailyLimit}</p>
                          </div>

                          <div>
                            <span className="text-[10px] text-[#c7c4d8] uppercase font-bold block">Budget Match</span>
                            <p className="text-sm font-bold text-cyan-300">{place.budgetMatchPercent}%</p>
                          </div>

                          <div>
                            <span className="text-[10px] text-[#c7c4d8] uppercase font-bold block">Walking Time</span>
                            <p className="text-sm font-bold text-white">{place.walkingTimeMins} mins</p>
                          </div>
                        </div>

                        {/* AI Explanation Box */}
                        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                          <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">auto_awesome</span>
                            <span>Why Recommended</span>
                          </span>

                          <ul className="space-y-1 text-xs text-white/90">
                            {place.explanations.map((exp, idx) => (
                              <li key={idx} className="flex items-center gap-2">
                                <span className="text-emerald-400 font-bold">•</span>
                                <span>{exp}</span>
                              </li>
                            ))}
                          </ul>

                          {place.notRecommendedReason && (
                            <p className="text-xs text-rose-300 font-semibold pt-1">
                              {place.notRecommendedReason}
                            </p>
                          )}
                        </div>

                        {/* One-Click Action Buttons */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleNavigate(place, e)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#4f46e5] text-white font-bold text-xs hover:brightness-110 transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">near_me</span>
                              <span>Navigate</span>
                            </button>

                            <button
                              onClick={(e) => handleMarkVisitedOpen(place, e)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-all flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              <span>Mark as Visited</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => handleToggleFavorite(place.id, e)}
                              className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                                isFav
                                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                                  : "bg-white/5 text-[#c7c4d8] border-white/10 hover:text-white"
                              }`}
                              title={isFav ? "Remove Favorite" : "Save Favorite"}
                            >
                              <span className="material-symbols-outlined text-sm">{isFav ? "favorite" : "favorite_border"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SAVED FAVORITES */}
      {activeMainTab === "Favorites" && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-5 bg-gradient-to-br from-[#1a1a2e]/70 via-[#16162a]/60 to-[#0f0f1b]/80 backdrop-blur-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="font-headline font-bold text-xl text-white">Saved Favorite Places</h3>
              <p className="text-xs text-[#c7c4d8] mt-0.5">
                {favoritesList.length} place(s) bookmarked for quick access
              </p>
            </div>
          </div>

          {favoritesList.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#c7c4d8]">
              No favorite places saved yet. Click the heart icon on any place card to save it!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluatedPlaces
                .filter((p) => favoritesList.includes(p.id))
                .map((place) => (
                  <div key={place.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm text-white">{place.name}</h4>
                        <p className="text-xs text-[#c7c4d8]">{place.category} • {place.address}</p>
                      </div>
                      <span className="font-bold text-emerald-400 text-xs">{currency}{place.estimatedCost}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-[#c7c4d8] pt-2 border-t border-white/5">
                      <span>AI Score: <strong className="text-white">{place.aiScorePercent}%</strong></span>
                      <button onClick={(e) => handleNavigate(place, e)} className="text-[#c3c0ff] hover:underline">
                        Get Directions →
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VISITED HISTORY */}
      {activeMainTab === "Visited" && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-5 bg-gradient-to-br from-[#1a1a2e]/70 via-[#16162a]/60 to-[#0f0f1b]/80 backdrop-blur-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <h3 className="font-headline font-bold text-xl text-white">Visited Places History</h3>
              <p className="text-xs text-[#c7c4d8] mt-0.5">
                {visitedHistory.length} visit(s) recorded and synchronized with Budget Engine
              </p>
            </div>
          </div>

          {visitedHistory.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#c7c4d8]">
              No visited places logged yet. Click "Mark as Visited" on any place card to record your visit and expense!
            </div>
          ) : (
            <div className="space-y-3">
              {visitedHistory.map((rec) => (
                <div key={rec.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{rec.placeName}</h4>
                      <p className="text-xs text-[#c7c4d8]">{rec.dateStr} at {rec.timestamp} • {rec.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-rose-300">-{currency}{rec.amountSpent}</span>
                    <span className="text-[10px] font-bold text-emerald-400 block">Synced to Budget</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISITED EXPENSE MODAL */}
      <VisitedExpenseModal
        isOpen={visitedModalOpen}
        place={visitedPlaceTarget}
        currency={currency}
        onClose={() => setVisitedModalOpen(false)}
        onConfirm={handleConfirmVisitedSpend}
      />
    </div>
  );
};
