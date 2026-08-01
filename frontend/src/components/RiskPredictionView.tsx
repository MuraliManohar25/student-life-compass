import React, { useState, useEffect } from "react";
import { riskApi } from "../services/api";

export const RiskPredictionView: React.FC = () => {
  const [riskScore, setRiskScore] = useState(62);
  const [riskLevel, setRiskLevel] = useState("Moderate Risk Flag");
  const [workloadDensity, setWorkloadDensity] = useState(62);
  const [peakHours, setPeakHours] = useState(48);
  const [recommendations, setRecommendations] = useState<any[]>([
    {
      icon: "schedule",
      color: "amber",
      text: "Complete DBMS lab assignment before 8 PM tonight to free up Thursday morning."
    },
    {
      icon: "bedtime",
      color: "cyan",
      text: "Target 7.5 hours sleep on Wednesday night."
    }
  ]);

  useEffect(() => {
    async function loadRiskPrediction() {
      try {
        const data = await riskApi.getPrediction();
        if (data.burnout_risk_score !== undefined) setRiskScore(data.burnout_risk_score);
        if (data.risk_level) setRiskLevel(`${data.risk_level} Risk Flag`);
        if (data.workload_density !== undefined) setWorkloadDensity(data.workload_density);
        if (data.peak_in_hours !== undefined) setPeakHours(data.peak_in_hours);
        if (data.recommendations && data.recommendations.length > 0) setRecommendations(data.recommendations);
      } catch (err) {
        console.warn("Risk API fallback:", err);
      }
    }
    loadRiskPrediction();
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-amber-500/20 via-transparent to-transparent">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-amber-300 uppercase">
            EARLY ALERT ENGINE (RANDOM FOREST ML MODEL)
          </span>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">
            Academic Risk & Overload Predictor
          </h1>
          <p className="text-xs text-[#c7c4d8] mt-1">
            Detects submission clustering, exam overlap, and sleep deprivation.
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
          {riskLevel}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-headline font-bold text-lg text-white">Burnout Risk Meter</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#c7c4d8]">Current Workload Density</span>
              <span className="font-bold text-amber-300">{workloadDensity}% ({riskLevel.replace(' Flag', '')})</span>
            </div>
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${workloadDensity}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>
          <p className="text-xs text-[#c7c4d8]">
            Workload density peaks in {peakHours} hours due to Operating Systems exam and DBMS submission.
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-headline font-bold text-lg text-white">Preventative Recommendations</h3>
          <ul className="space-y-2 text-xs text-[#e5e2e3]">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className={`material-symbols-outlined text-sm ${rec.color === "cyan" ? "text-cyan-300" : rec.color === "red" ? "text-red-400" : "text-amber-300"}`}>
                  {rec.icon || "schedule"}
                </span>
                <span>{rec.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
