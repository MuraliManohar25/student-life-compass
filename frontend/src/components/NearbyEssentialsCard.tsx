import React from "react";

interface EssentialPlace {
  id: string;
  name: string;
  category: string;
  icon: string;
  distance: string;
  cost?: string;
}

// Nearby Essentials Card: Provides students relocating to a new campus/city with quick access to local essentials.
export const NearbyEssentialsCard: React.FC = () => {
  // TODO: Replace mock places data with Google Maps Places API (e.g. /api/places/nearby)
  const essentials: EssentialPlace[] = [
    { id: "1", name: "Campus Central Library", category: "Quiet Study", icon: "menu_book", distance: "1.2 km" },
    { id: "2", name: "Student Cafeteria", category: "Food & Drinks", icon: "local_cafe", distance: "300 m", cost: "₹120 avg" },
    { id: "3", name: "Campus Grocery Mart", category: "Supplies", icon: "shopping_cart", distance: "500 m" },
    { id: "4", name: "City Health Hospital", category: "Emergency 24/7", icon: "medical_services", distance: "2.0 km" },
    { id: "5", name: "Central Bus Stop", category: "Transit", icon: "directions_bus", distance: "250 m" },
    { id: "6", name: "FitZone Student Gym", category: "Fitness", icon: "fitness_center", distance: "1.5 km", cost: "₹700/mo" },
  ];

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400">explore</span>
          <span>Nearby Essentials</span>
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
          City Guide
        </span>
      </div>

      {/* Essentials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
        {essentials.map((item) => (
          <div
            key={item.id}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-2"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base">{item.icon}</span>
              </div>
              <div className="min-w-0">
                <h4 className="font-semibold text-xs text-white truncate">{item.name}</h4>
                <p className="text-[10px] text-[#c7c4d8] truncate">{item.category}</p>
              </div>
            </div>
            <div className="flex flex-col items-end shrink-0 gap-1">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white">
                {item.distance}
              </span>
              {item.cost && (
                <span className="text-[9px] font-semibold text-emerald-400">
                  {item.cost}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
