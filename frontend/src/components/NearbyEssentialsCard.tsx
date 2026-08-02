import React, { useEffect, useState } from "react";
import { NavTab } from "../types";
import { nearbyPlacesStore, NearbyPlacesStoreState } from "../services/nearbyPlacesStore";
import { EvaluatedPlace } from "../services/localDiscoveryEngine";

interface NearbyEssentialsCardProps {
  setActiveTab?: (tab: NavTab) => void;
}

export const NearbyEssentialsCard: React.FC<NearbyEssentialsCardProps> = ({ setActiveTab }) => {
  const [storeState, setStoreState] = useState<NearbyPlacesStoreState>(() => nearbyPlacesStore.getState());

  useEffect(() => {
    const unsubscribe = nearbyPlacesStore.subscribe(() => {
      setStoreState(nearbyPlacesStore.getState());
    });
    return unsubscribe;
  }, []);

  const topPlaces = nearbyPlacesStore.getTopPlaces(4);

  const handlePlaceClick = (place: EvaluatedPlace) => {
    nearbyPlacesStore.setSelectedPlace(place.id);
    if (setActiveTab) {
      setActiveTab("nearby-places");
    }
  };

  const handleViewAll = () => {
    if (setActiveTab) {
      setActiveTab("nearby-places");
    }
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400">explore</span>
          <span>Nearby Essentials</span>
        </h3>
        <button
          onClick={handleViewAll}
          className="text-xs px-3 py-1 rounded-full bg-[#4f46e5]/20 hover:bg-[#4f46e5]/40 border border-[#4f46e5]/40 text-[#c3c0ff] font-bold transition-all flex items-center gap-1"
        >
          <span>View All</span>
          <span className="material-symbols-outlined text-xs">arrow_forward</span>
        </button>
      </div>

      {/* Location Error / Permission Denied State */}
      {storeState.locationError ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
          <div className="flex items-center gap-2 text-rose-300">
            <span className="material-symbols-outlined text-base">location_off</span>
            <span className="text-xs font-bold">Location access is required to show nearby essentials.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => nearbyPlacesStore.requestLocation(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-500 text-white font-bold text-xs hover:brightness-110 shadow-sm"
            >
              Retry Location
            </button>
            <button
              onClick={() => nearbyPlacesStore.requestLocation(true)}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : storeState.loadingPlaces || storeState.loadingLocation ? (
        <div className="p-8 text-center text-xs text-[#c7c4d8] flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-sm animate-spin text-cyan-400">autorenew</span>
          <span>Loading nearby places...</span>
        </div>
      ) : topPlaces.length === 0 ? (
        /* Empty State */
        <div className="p-5 rounded-xl bg-white/5 border border-white/10 text-center space-y-2">
          <p className="text-xs font-bold text-white">We couldn't find nearby places.</p>
          <p className="text-[11px] text-[#c7c4d8] leading-relaxed">
            Please check: <br />
            ✓ Internet Connection <br />
            ✓ GPS Permission
          </p>
          <button
            onClick={() => nearbyPlacesStore.requestLocation(true)}
            className="px-3 py-1.5 rounded-lg bg-[#4f46e5] text-white font-bold text-xs mt-1"
          >
            Refresh Location
          </button>
        </div>
      ) : (
        /* Essentials Grid */
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {topPlaces.map((item) => (
            <div
              key={item.id}
              onClick={() => handlePlaceClick(item)}
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#4f46e5]/50 hover:bg-white/10 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-base">
                      {item.category === "Cafe"
                        ? "local_cafe"
                        : item.category === "Library"
                        ? "menu_book"
                        : item.category === "Hospital" || item.category === "Medical Store"
                        ? "medical_services"
                        : item.category === "Gym"
                        ? "fitness_center"
                        : item.category === "Fast Food" || item.category === "Restaurant"
                        ? "restaurant"
                        : "explore"}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-white group-hover:text-[#c3c0ff] transition-colors truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-[#c7c4d8] truncate flex items-center gap-1.5 flex-wrap">
                      <span>{item.category} • {item.distanceMeters} m</span>
                      {item.category === "Library" && item.libraryAccess && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-cyan-300 font-medium">
                          {item.libraryAccess}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0 gap-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                    {item.status} ({item.aiScorePercent}%)
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-400">
                    {item.entryFeeText || (item.estimatedCost === 0 ? "Free" : `₹${item.estimatedCost}`)}
                  </span>
                </div>
              </div>

              {/* Short AI Explanation Points */}
              {item.explanations && item.explanations.length > 0 && (
                <div className="pt-1.5 border-t border-white/5 space-y-0.5">
                  <p className="text-[10px] text-[#c3c0ff] font-semibold">Recommended because:</p>
                  <ul className="text-[10px] text-white/80 space-y-0.5 pl-1">
                    {item.explanations.slice(0, 2).map((exp, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span className="truncate">{exp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
