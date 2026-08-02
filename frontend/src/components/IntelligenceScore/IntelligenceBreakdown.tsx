import React from "react";
import { PillarMetric } from "../../services/performanceEngine";

interface IntelligenceBreakdownProps {
  pillars: PillarMetric[];
}

// Dynamic Performance Breakdown Section: Displays real metrics, explanations detailing WHY each score was calculated, and progress bars across 6 core pillars.
export const IntelligenceBreakdown: React.FC<IntelligenceBreakdownProps> = ({ pillars }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-headline font-bold text-xl text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3c0ff]">insights</span>
            <span>Performance Breakdown</span>
          </h2>
          <p className="text-xs text-[#c7c4d8]">Real activity metrics & calculation audit across six core pillars</p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#c3c0ff] font-semibold hidden sm:inline-block">
          Dynamic Calculation
        </span>
      </div>

      {/* Grid layout for 6 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pillars.map((item) => (
          <div
            key={item.id}
            className="glass-card p-5 rounded-2xl border border-white/10 space-y-3.5 hover:border-white/20 transition-all duration-300 group flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-headline font-bold text-base text-white group-hover:text-[#c3c0ff] transition-colors">
                  {item.title}
                </h3>
                <span className="font-headline font-black text-xl text-white bg-white/5 px-2.5 py-1 rounded-xl border border-white/10">
                  {item.score}%
                </span>
              </div>

              {/* Dynamic Explanation for WHY this score was calculated */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">Calculation Audit</span>
                <p className="text-xs text-[#c7c4d8] leading-relaxed">
                  {item.explanation}
                </p>
              </div>
            </div>

            {/* Styled Animated Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                <div
                  style={{ width: `${item.score}%` }}
                  className={`h-full bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-1000 ease-out`}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#c7c4d8]">
                <span>Calibrated Real Score</span>
                <span className="font-bold text-white">{item.score} / 100</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
