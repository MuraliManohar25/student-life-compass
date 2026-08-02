import React, { useState, useEffect } from "react";
import { careerApi } from "../../services/api";

interface SkillGapCardProps {
  roleTitle: string;
  knownSkills: string[];
  missingSkills: string[];
  readinessScore: number;
  aiRecommendation: string;
}

// SkillGapCard: Displays the student's current skills, missing skills, career readiness score,
// and AI recommendation tip after clicking Analyze.
export const SkillGapCard: React.FC<SkillGapCardProps> = ({
  roleTitle,
  knownSkills,
  missingSkills,
  readinessScore,
  aiRecommendation,
}) => {
  const [skillGapData, setSkillGapData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillGap = async () => {
      try {
        const data = await careerApi.getSkillGap();
        setSkillGapData(data);
      } catch (error) {
        console.error("Failed to fetch skill gap:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkillGap();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
        <div className="text-center text-[#c7c4d8] text-sm py-8">Loading skill gap analysis...</div>
      </div>
    );
  }

  const actualReadinessScore = skillGapData?.readiness_score || readinessScore;
  const actualSkillGap = skillGapData?.skill_gap || [];
  const actualKnownSkills = knownSkills;
  const actualMissingSkills = missingSkills;
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
      {/* Header & Readiness Score */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c3c0ff]">SKILL GAP ANALYSIS</span>
          <h3 className="font-headline font-bold text-xl text-white mt-0.5">{roleTitle} Readiness</h3>
        </div>
        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
          <div className="text-right">
            <p className="text-[10px] text-[#c7c4d8] uppercase font-semibold">Career Readiness</p>
            <p className="text-xl font-headline font-black text-emerald-400">{actualReadinessScore}%</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-emerald-400 flex items-center justify-center text-xs font-bold text-emerald-400">
            {actualReadinessScore}%
          </div>
        </div>
      </div>

      {/* Current vs Missing Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Known Skills */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">check_circle</span>
            <span>Current Skills ({knownSkills.length})</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {knownSkills.length > 0 ? (
              knownSkills.map((sk) => (
                <span key={sk} className="text-xs px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-semibold flex items-center gap-1">
                  ✓ {sk}
                </span>
              ))
            ) : (
              <p className="text-xs text-[#c7c4d8]">No current skills selected yet.</p>
            )}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>Missing Skills ({missingSkills.length})</span>
          </h4>
          <div className="flex flex-wrap gap-2">
            {missingSkills.length > 0 ? (
              missingSkills.map((sk) => (
                <span key={sk} className="text-xs px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 font-semibold flex items-center gap-1">
                  • {sk}
                </span>
              ))
            ) : (
              <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">🎉 All required skills mastered!</span>
            )}
          </div>
        </div>
      </div>

      {/* AI Recommendation Banner */}
      <div className="p-4 rounded-xl bg-[#4f46e5]/10 border border-[#4f46e5]/30 flex items-start gap-3">
        <span className="material-symbols-outlined text-[#c3c0ff] shrink-0 mt-0.5">lightbulb</span>
        <div>
          <h5 className="text-xs font-bold text-[#c3c0ff]">AI Mentor Recommendation</h5>
          <p className="text-xs text-white/90 mt-0.5">{aiRecommendation}</p>
        </div>
      </div>
    </div>
  );
};
