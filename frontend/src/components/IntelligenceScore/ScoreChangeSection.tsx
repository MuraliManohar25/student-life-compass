import React from "react";
import { ScoreChangeEvent } from "../../services/performanceEngine";

interface ScoreChangeSectionProps {
  logs: ScoreChangeEvent[];
}

// "Why did my score change?" section: Explains exact score point deltas (+/-) and activity reasons behind performance score movements.
export const ScoreChangeSection: React.FC<ScoreChangeSectionProps> = ({ logs }) => {
  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 bg-gradient-to-br from-[#1a1a2e]/70 via-[#16162a]/60 to-[#0f0f1b]/80 backdrop-blur-xl">
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3c0ff]">help_outline</span>
            <span>Why did my score change?</span>
          </h2>
          <p className="text-xs text-[#c7c4d8] mt-0.5">
            Transparent log showing exact point impacts (+/-) from completed tasks, study sprints, and budget status
          </p>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#c3c0ff] font-semibold">
          Real-Time Audit
        </span>
      </div>

      {/* Log Items List */}
      <div className="space-y-3">
        {logs.length === 0 ? (
          <div className="p-4 rounded-2xl bg-white/5 text-center text-xs text-[#c7c4d8]">
            No recent score changes logged yet. Complete tasks in your Action Plan to earn points!
          </div>
        ) : (
          logs.map((item) => {
            const isPositive = item.delta >= 0;
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4 hover:border-white/20 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  {/* Point Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-xl font-headline font-black text-sm shrink-0 flex items-center gap-1 ${
                      isPositive
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    <span>{isPositive ? `+${item.delta}` : item.delta}</span>
                    <span className="text-[10px] font-bold">pts</span>
                  </div>

                  {/* Reason Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-white">{item.reason}</h3>
                    <p className="text-[11px] text-[#c7c4d8] flex items-center gap-2 mt-0.5">
                      <span>{item.timestamp}</span>
                      <span>•</span>
                      <span className="text-[#c3c0ff]">{item.category}</span>
                    </p>
                  </div>
                </div>

                <span
                  className={`material-symbols-outlined text-lg ${
                    isPositive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPositive ? "trending_up" : "trending_down"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
