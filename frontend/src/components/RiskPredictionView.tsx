import React, { useState } from "react";
import {
  RiskAnalysisEngine,
  RiskCategoryAssessment,
} from "../services/riskAnalysisEngine";
import { useAppData } from "../context/AppDataContext";

export const RiskPredictionView: React.FC = () => {
  const { riskScore, refreshRisk } = useAppData();
  const summary = riskScore ?? RiskAnalysisEngine.calculateRisks();

  // Expandable "Why did AI assign this risk?" state per category
  const [expandedAudit, setExpandedAudit] = useState<Record<string, boolean>>({});

  const toggleAudit = (categoryKey: string) => {
    setExpandedAudit((prev) => ({ ...prev, [categoryKey]: !prev[categoryKey] }));
  };

  // Badge styles helper
  const getLevelBadgeStyle = (level: "Low" | "Moderate" | "High") => {
    switch (level) {
      case "High":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10";
      case "Moderate":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/10";
      case "Low":
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10";
    }
  };

  const getRingColor = (level: "Low" | "Moderate" | "High") => {
    switch (level) {
      case "High":
        return "#f43f5e";
      case "Moderate":
        return "#f59e0b";
      case "Low":
      default:
        return "#10b981";
    }
  };

  // Helper component for single Risk Card
  const renderRiskCard = (item: RiskCategoryAssessment) => {
    const isExpanded = expandedAudit[item.category];

    // Circular Progress Ring Math
    const radius = 46;
    const strokeWidth = 8;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (item.scorePercent / 100) * circumference;

    return (
      <div
        key={item.category}
        className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 bg-gradient-to-br from-[#1a1a2e]/80 via-[#16162a]/70 to-[#0f0f1b]/90 backdrop-blur-xl shadow-2xl flex flex-col justify-between"
      >
        <div className="space-y-5">
          {/* Card Top: Title, Risk Level Badge & Circular Ring */}
          <div className="flex justify-between items-start gap-4 border-b border-white/10 pb-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border ${getLevelBadgeStyle(
                    item.level
                  )}`}
                >
                  {item.level} Risk
                </span>
                <span className="text-[10px] font-bold text-[#c7c4d8]">
                  {item.confidencePercent}% Confidence
                </span>
              </div>

              <h2 className="font-headline font-bold text-2xl text-white tracking-tight">
                {item.category}
              </h2>

              <p className="text-[11px] text-[#c7c4d8] font-mono">
                Updated: {item.lastUpdated}
              </p>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle
                  stroke="rgba(255, 255, 255, 0.08)"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <circle
                  stroke={getRingColor(item.level)}
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-headline font-black text-white">
                  {item.scorePercent}%
                </span>
                <span className="text-[9px] font-bold text-[#c7c4d8] uppercase">Risk</span>
              </div>
            </div>
          </div>

          {/* AI Reason Description */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1">
            <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">
              AI Risk Evaluation
            </span>
            <p className="text-xs text-white/90 leading-relaxed font-normal">
              "{item.reason}"
            </p>
          </div>

          {/* Expandable Section: "Why did AI assign this risk?" */}
          <div className="space-y-2 pt-1">
            <button
              onClick={() => toggleAudit(item.category)}
              className="text-xs font-bold text-[#c3c0ff] hover:text-white flex items-center justify-between w-full p-2.5 rounded-xl bg-white/5 border border-white/10 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">help_outline</span>
                <span>Why did AI assign this risk?</span>
              </span>
              <span className="material-symbols-outlined text-sm">
                {isExpanded ? "expand_less" : "expand_more"}
              </span>
            </button>

            {isExpanded && (
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3 animate-fade-in">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#c7c4d8] block">
                  Underlying Activity Metrics
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  {item.auditMetrics.map((m, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] text-[#c7c4d8] block">{m.label}</span>
                      <span className="font-bold text-white text-xs">{m.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-xs">
                  <span className="text-[#c7c4d8]">AI Evaluated Conclusion:</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-full border ${getLevelBadgeStyle(item.level)}`}>
                    {item.aiConclusion}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CONDITIONAL AI SUGGESTIONS SECTION */}
        <div className="pt-4 border-t border-white/10">
          {item.level === "Low" ? (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center gap-2">
              <span>✅</span>
              <span>You're performing well. No additional recommendations are needed.</span>
            </div>
          ) : item.level === "Moderate" ? (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-300 flex items-center gap-2">
              <span>⚠</span>
              <span>Keep maintaining your current progress. No AI suggestions are required at this time.</span>
            </div>
          ) : (
            /* HIGH RISK ONLY SUGGESTIONS */
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-3">
              <div className="flex items-center gap-2 text-rose-300">
                <span className="material-symbols-outlined text-base">warning</span>
                <span className="text-xs font-extrabold uppercase tracking-wider">AI High Risk Suggestions</span>
              </div>

              <div className="space-y-2">
                {item.aiSuggestions.map((sug, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-2.5 text-xs text-white">
                    <span className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                      ✓
                    </span>
                    <span>{sug}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. PAGE HEADER */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 bg-gradient-to-br from-[#1a1a2e]/80 via-[#16162a]/70 to-[#0f0f1b]/90 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-widest">
                AI Early Alert & Risk Analysis
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#c7c4d8]">
                Zero Manual Data Entry
              </span>
            </div>

            <h1 className="font-headline font-black text-3xl sm:text-4xl text-white tracking-tight">
              AI Risk Analysis Dashboard
            </h1>
            <p className="text-xs text-[#c7c4d8] mt-1 max-w-xl">
              Continuously analyzing live activity from Study Planner, Budget Predictor, Career Mentor, and Performance Report.
            </p>
          </div>

          {/* Refresh Action */}
          <button
            onClick={refreshRisk}
            className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 self-start md:self-auto"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Refresh Risk Audit</span>
          </button>
        </div>

        {/* 2. OVERALL STUDENT RISK SUMMARY BANNER */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/15 via-white/[0.02] to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">
                Overall Student Risk Status
              </span>
              <p className="text-sm text-white font-bold mt-0.5 leading-relaxed">
                "{summary.reason}"
              </p>
            </div>
          </div>

          <span
            className={`px-4 py-2 rounded-2xl font-headline font-black text-sm uppercase tracking-wider shrink-0 border ${getLevelBadgeStyle(
              summary.level
            )}`}
          >
            Overall: {summary.level} Risk
          </span>
        </div>
      </div>

      {/* 3. THREE LARGE RISK CARDS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {renderRiskCard(summary.academic)}
        {renderRiskCard(summary.financial)}
        {renderRiskCard(summary.placement)}
      </div>
    </div>
  );
};
