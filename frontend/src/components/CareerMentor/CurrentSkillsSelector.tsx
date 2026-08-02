import React from "react";

interface CurrentSkillsSelectorProps {
  availableSkills: string[];
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
}

// CurrentSkillsSelector: Allows students to check off skills they already possess.
// Used to dynamically compute missing skills and career readiness score.
export const CurrentSkillsSelector: React.FC<CurrentSkillsSelectorProps> = ({
  availableSkills,
  selectedSkills,
  onToggleSkill,
}) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#c3c0ff]">checklist</span>
        <h2 className="font-headline font-bold text-lg text-white">2. Select Your Current Skills</h2>
      </div>

      <p className="text-xs text-[#c7c4d8]">Check the skills you have already mastered or practiced:</p>

      {/* Skill Toggle Pills */}
      <div className="flex flex-wrap gap-2.5">
        {availableSkills.map((skill) => {
          const isKnown = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              type="button"
              onClick={() => onToggleSkill(skill)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                isKnown
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-md shadow-emerald-500/10"
                  : "bg-white/5 border-white/10 text-[#c7c4d8] hover:border-white/20"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {isKnown ? "check_box" : "check_box_outline_blank"}
              </span>
              <span>{skill}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
