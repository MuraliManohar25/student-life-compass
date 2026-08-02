import React from "react";

interface AIDiagnosticCardProps {
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  recommendations?: string[];
}

// AI Mentor Diagnostic, Strengths & Weaknesses based on real activity
export const AIDiagnosticCard: React.FC<AIDiagnosticCardProps> = ({
  summary,
  strengths,
  areasToImprove,
}) => {
  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-[#4f46e5]/40 bg-gradient-to-br from-[#4f46e5]/15 via-white/[0.02] to-[#131314] space-y-6 backdrop-blur-xl relative overflow-hidden shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4f46e5]/30 text-[#c3c0ff] flex items-center justify-center border border-[#4f46e5]/50 shadow-md">
            <span className="material-symbols-outlined text-xl fill-1">psychology</span>
          </div>
          <div>
            <h2 className="font-headline font-bold text-xl text-white">AI Mentor Summary</h2>
            <p className="text-xs text-[#c7c4d8]">Dynamic advice evaluated daily from your actual learning patterns</p>
          </div>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0 self-start sm:self-auto">
          Dynamic AI Evaluation
        </span>
      </div>

      {/* Mentor Speech Box */}
      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 relative">
        <div className="absolute -top-3 left-6 px-2 bg-[#1b1b2f] text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider rounded border border-white/10">
          Mentor Insights
        </div>
        <p className="text-sm text-white/90 leading-relaxed font-normal italic pt-1">
          "{summary}"
        </p>
      </div>

      {/* Strengths & Weaknesses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            <h3 className="font-headline font-bold text-sm text-white uppercase tracking-wider">Strengths</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-white/90">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
          <div className="flex items-center gap-2 text-amber-400">
            <span className="material-symbols-outlined text-lg">warning</span>
            <h3 className="font-headline font-bold text-sm text-white uppercase tracking-wider">Areas to Improve</h3>
          </div>
          <ul className="space-y-1.5 text-xs text-white/90">
            {areasToImprove.map((area, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="text-amber-400 font-bold">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
