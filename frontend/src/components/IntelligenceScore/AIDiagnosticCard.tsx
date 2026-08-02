import React from "react";

interface AIDiagnosticCardProps {
  summary: string;
  strengths: string[];
  areasToImprove: string[];
  recommendations: string[];
}

// AI Mentor Diagnostic, Strengths & Weaknesses, and Daily Recommendations based on real activity
export const AIDiagnosticCard: React.FC<AIDiagnosticCardProps> = ({
  summary,
  strengths,
  areasToImprove,
  recommendations,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Mentor Summary Card */}
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

      {/* 2. Dynamic AI Recommendations List */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-4 bg-gradient-to-br from-[#1a1a2e]/60 via-[#16162a]/50 to-[#0f0f1b]/70 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-cyan-400 text-xl">auto_awesome</span>
            <h3 className="font-headline font-bold text-lg text-white">AI Recommendations</h3>
          </div>
          <span className="text-xs text-[#c7c4d8]">Generated Daily</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 group"
            >
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-bold text-sm">
                ✓
              </div>
              <span className="text-xs font-medium text-white group-hover:text-[#c3c0ff] transition-colors">
                {rec}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
