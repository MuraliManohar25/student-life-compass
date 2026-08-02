import React from "react";
import { MONTHLY_GROWTH_DATA } from "../../data/intelligenceData";

export const GrowthTrendCard: React.FC = () => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3c0ff]">show_chart</span>
            <span>Growth Trend</span>
          </h3>
          <p className="text-[11px] text-[#c7c4d8] mt-0.5">
            Member since <span className="text-white font-semibold">May 2026</span>
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold">
          +12 Points Total Growth
        </span>
      </div>

      <div className="h-36 flex items-end justify-around gap-4 pt-6 px-4">
        {MONTHLY_GROWTH_DATA.map((item) => (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2 max-w-[100px]">
            <span className="text-xs font-bold text-white">{item.score}%</span>
            <div className="w-full bg-white/5 rounded-t-xl h-24 flex items-end overflow-hidden p-1 border border-white/10">
              <div
                style={{ height: `${item.score}%` }}
                className="w-full bg-gradient-to-t from-[#4f46e5] to-[#c3c0ff] rounded-t transition-all duration-500 hover:brightness-125"
              />
            </div>
            <span className="text-[11px] font-medium text-[#c7c4d8]">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
