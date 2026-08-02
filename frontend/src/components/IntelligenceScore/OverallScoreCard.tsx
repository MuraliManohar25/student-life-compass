import React from "react";
import { REPORT_HEADER_INFO } from "../../data/intelligenceData";

interface OverallScoreCardProps {
  score?: number;
}

// Top Section: Overall Performance Score Card with Circular Progress Indicator
export const OverallScoreCard: React.FC<OverallScoreCardProps> = ({ score = REPORT_HEADER_INFO.overallScore }) => {
  const radius = 52;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-[#1a1a2e]/90 via-[#16162a]/80 to-[#0f0f1b]/90 backdrop-blur-xl shadow-2xl">
      {/* Background ambient light */}
      <div className="absolute -right-16 -top-16 w-72 h-72 bg-[#4f46e5]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        {/* Left Side: Title, Subtitle, Description & Last Updated */}
        <div className="space-y-4 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-[#4f46e5]/20 border border-[#4f46e5]/40 text-[#c3c0ff] text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#c3c0ff] animate-ping" />
              AI Certified Evaluation
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#c7c4d8] text-[11px] font-medium flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs text-[#c3c0ff]">schedule</span>
              <span>Last Updated: <strong className="text-white font-semibold">{REPORT_HEADER_INFO.lastUpdated}</strong></span>
            </span>
          </div>

          <h1 className="font-headline font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
            {REPORT_HEADER_INFO.title}
          </h1>

          <p className="text-sm text-[#c7c4d8] leading-relaxed max-w-xl font-normal">
            "{REPORT_HEADER_INFO.description}"
          </p>
        </div>

        {/* Right Side: Circular Progress Indicator */}
        <div className="flex items-center gap-6 bg-white/[0.03] p-5 md:p-6 rounded-2xl border border-white/10 shrink-0 self-start lg:self-center">
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* SVG Circle Ring */}
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#c3c0ff" />
                </linearGradient>
              </defs>
              {/* Background Track Circle */}
              <circle
                stroke="rgba(255, 255, 255, 0.08)"
                fill="transparent"
                strokeWidth={strokeWidth}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              {/* Progress Gradient Circle */}
              <circle
                stroke="url(#scoreGradient)"
                fill="transparent"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference + " " + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Score Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-3xl font-headline font-black text-white tracking-tight">
                {score}
              </span>
              <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider">
                / {REPORT_HEADER_INFO.maxScore}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-widest block">
              Overall Performance Score
            </span>
            <p className="text-xl font-headline font-black text-white flex items-center gap-1.5">
              <span>{score}</span>
              <span className="text-sm font-semibold text-[#c7c4d8]">/ 100</span>
            </p>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              <span>Optimal Growth</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
