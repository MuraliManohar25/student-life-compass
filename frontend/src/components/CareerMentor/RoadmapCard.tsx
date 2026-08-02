import React from "react";
import { CareerRole } from "../../data/careerRoles";

interface RoadmapCardProps {
  role: CareerRole;
  knownSkills: string[];
}

// RoadmapCard: Renders the step-by-step career milestone roadmap based on the active role.
export const RoadmapCard: React.FC<RoadmapCardProps> = ({ role, knownSkills }) => {
  // TODO: Replace roadmap milestones with dynamic backend API response from /api/career/roadmap
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c3c0ff]">map</span>
          <h3 className="font-headline font-bold text-lg text-white">AI Career Roadmap</h3>
        </div>
        <span className="text-xs text-[#c7c4d8] font-semibold">{role.title} Path</span>
      </div>

      {/* Roadmap Milestone Timeline */}
      <div className="space-y-3 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {role.roadmapMilestones.map((m, idx) => {
          const isDone = knownSkills.includes(m.skillRequired);
          return (
            <div key={m.id} className="flex items-start gap-4 relative z-10 pl-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isDone
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                    : "bg-[#4f46e5]/30 border border-[#4f46e5] text-[#c3c0ff]"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex-1 hover:border-white/20 transition-all flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-xs text-white">{m.title}</h4>
                  <p className="text-[11px] text-[#c7c4d8] mt-0.5">{m.description}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    isDone
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/5 text-[#c7c4d8] border border-white/10"
                  }`}
                >
                  {isDone ? "Completed" : "Next Milestone"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
