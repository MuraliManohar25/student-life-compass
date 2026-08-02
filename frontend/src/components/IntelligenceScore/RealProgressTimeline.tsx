import React from "react";
import { TimelineEntry } from "../../services/performanceEngine";

interface RealProgressTimelineProps {
  scaleType: "Daily" | "Weekly" | "Monthly";
  entries: TimelineEntry[];
}

// Real Progress Timeline: Displays actual recorded score timeline starting from account creation date. No fake dates or fake historical data.
export const RealProgressTimeline: React.FC<RealProgressTimelineProps> = ({ scaleType, entries }) => {
  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 bg-gradient-to-br from-[#1a1a2e]/70 via-[#16162a]/60 to-[#0f0f1b]/80 backdrop-blur-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">timeline</span>
            <span>Real Progress Timeline</span>
          </h2>
          <p className="text-xs text-[#c7c4d8] mt-0.5">
            Verified score progression recorded directly from your actual daily activities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#4f46e5]/20 border border-[#4f46e5]/40 text-[#c3c0ff] text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Timeline View: {scaleType} Scale</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#c7c4d8]">
            {entries.length} Logged Record(s)
          </span>
        </div>
      </div>

      {/* Timeline Entries List */}
      <div className="space-y-4 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {entries.map((entry, idx) => (
          <div key={entry.id || idx} className="flex items-start gap-4 relative z-10 pl-1 group">
            {/* Timeline Node Dot */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border-2 ${
                entry.isMilestone
                  ? "bg-emerald-500 text-black border-emerald-300 shadow-lg shadow-emerald-500/30"
                  : "bg-[#1f1f33] text-[#c3c0ff] border-[#4f46e5] group-hover:border-emerald-400"
              }`}
            >
              {entry.isMilestone ? "★" : idx + 1}
            </div>

            {/* Timeline Card Content */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group-hover:border-white/20 transition-all">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-[#c3c0ff] bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                    {entry.dateStr}
                  </span>
                  <h3 className="text-sm font-bold text-white">{entry.title}</h3>
                </div>
                <p className="text-xs text-[#c7c4d8]">{entry.detail}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                <span className="text-xs text-[#c7c4d8]">Performance Score</span>
                <span className="text-2xl font-headline font-black text-white bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                  {entry.score}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
