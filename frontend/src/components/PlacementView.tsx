import React, { useState, useEffect } from "react";
import { placementApi } from "../services/api";

export const PlacementView: React.FC = () => {
  const [jobApplications, setJobApplications] = useState([
    { company: "Stripe", role: "Junior Software Engineer", match: "92%", status: "Interviewing", color: "bg-purple-500/20 text-purple-300" },
    { company: "Google", role: "AI Research Intern", match: "88%", status: "Resume Screened", color: "bg-[#4f46e5]/20 text-[#c3c0ff]" },
    { company: "Microsoft", role: "Systems Engineer", match: "84%", status: "Applied", color: "bg-cyan-500/20 text-cyan-300" },
  ]);

  const [resumeScore, setResumeScore] = useState("88/100");
  const [overallScore, setOverallScore] = useState(88);
  const [recommendations, setRecommendations] = useState<string[]>([
    "Solve 20 more medium Graph & DP problems on LeetCode.",
    "Add Docker containerized deployment to your PyTorch project.",
    "Resume passed AI screening with top marks for Backend & ML roles."
  ]);

  useEffect(() => {
    async function loadPlacementData() {
      try {
        const data = await placementApi.getReadiness();
        if (data.resume_score) setResumeScore(`${data.resume_score}/100`);
        if (data.overall_score) setOverallScore(data.overall_score);
        if (data.applications && data.applications.length > 0) setJobApplications(data.applications);
        if (data.recommendations) setRecommendations(data.recommendations);
      } catch (err) {
        console.warn("Placement API fallback:", err);
      }
    }
    loadPlacementData();
  }, []);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#c3c0ff] uppercase">
            CAREER & PLACEMENT ENGINE
          </span>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">
            Placement Hub
          </h1>
          <p className="text-xs text-[#c7c4d8] mt-1">
            Automated resume match scoring, ML Gradient Boosting readiness model, and application tracker.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="text-right">
            <p className="text-xs text-[#c7c4d8]">Resume AI Score</p>
            <p className="text-2xl font-headline font-black text-white">{resumeScore}</p>
          </div>
        </div>
      </div>

      {/* ML Readiness Breakdown Card */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-gradient-to-r from-[#4f46e5]/15 via-transparent to-transparent">
        <div className="flex justify-between items-center">
          <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3c0ff]">psychology</span>
            <span>Gradient Boosting Placement Score</span>
          </h3>
          <span className="text-xs font-bold text-emerald-400">{overallScore}% Match Rate</span>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-[#c7c4d8]">Recommended Actions to Maximize Tier-1 Offer Odds:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#e5e2e3] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c3c0ff] text-sm">task_alt</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <h3 className="font-headline font-bold text-lg text-white">Target Tech Applications</h3>

        <div className="space-y-3">
          {jobApplications.map((app, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-white/20 transition-all"
            >
              <div>
                <h4 className="font-bold text-sm text-white">{app.company}</h4>
                <p className="text-xs text-[#c7c4d8]">{app.role}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-emerald-400">{app.match} Match</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${app.color}`}>
                  {app.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
