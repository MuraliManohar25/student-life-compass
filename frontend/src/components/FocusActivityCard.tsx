import React from "react";

// Focus Activity Card: Displays current month study focus summary metrics.
// Designed for quick visual inspection without complex heatmaps.
export const FocusActivityCard: React.FC = () => {
  // TODO: Replace mock focus data with backend API call GET /api/dashboard/focus-activity
  const currentMonth = new Date().toLocaleString("default", { month: "long", year: "numeric" });
  const totalHours = 68;
  const targetHours = 80;
  const dailyAvg = "2.5 hrs/day";
  const productiveDay = "Thursday";
  const progressPercent = Math.round((totalHours / targetHours) * 100);

  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-5">
      {/* Header with current month badge */}
      <div className="flex justify-between items-center">
        <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c3c0ff]">donut_large</span>
          <span>Focus Activity</span>
        </h3>
        <span className="text-xs px-2.5 py-1 rounded-full bg-[#4f46e5]/20 border border-[#4f46e5]/40 text-[#c3c0ff] font-semibold">
          {currentMonth}
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
          <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider font-semibold">Total Focus</p>
          <p className="text-xl font-headline font-black text-white mt-0.5">{totalHours}h</p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
          <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider font-semibold">Daily Avg</p>
          <p className="text-xl font-headline font-black text-emerald-400 mt-0.5">{dailyAvg}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/10">
          <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider font-semibold">Peak Day</p>
          <p className="text-sm font-headline font-bold text-[#c3c0ff] mt-1.5 truncate">{productiveDay}</p>
        </div>
      </div>

      {/* Monthly Target Progress Visualization */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between text-xs text-[#c7c4d8]">
          <span>Monthly Target ({totalHours}/{targetHours} hrs)</span>
          <span className="font-bold text-white">{progressPercent}%</span>
        </div>
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPercent}%` }}
            className="h-full bg-gradient-to-r from-[#4f46e5] to-[#c3c0ff] rounded-full transition-all duration-500"
          ></div>
        </div>
      </div>
    </div>
  );
};
