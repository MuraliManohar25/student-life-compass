import React from "react";
import { CareerRole } from "../../data/careerRoles";

interface TargetRoleSelectorProps {
  roles: CareerRole[];
  selectedRoleId: string;
  onSelectRole: (roleId: string) => void;
}

// TargetRoleSelector: Allows the student to select their desired career role.
// Updates the required skill requirements dynamically.
export const TargetRoleSelector: React.FC<TargetRoleSelectorProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
}) => {
  return (
    <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-[#c3c0ff]">stars</span>
        <h2 className="font-headline font-bold text-lg text-white">1. Select Target Role</h2>
      </div>

      <p className="text-xs text-[#c7c4d8]">Choose your career objective to calibrate your learning path:</p>

      {/* Role Selection Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {roles.map((role) => {
          const isSelected = role.id === selectedRoleId;
          return (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isSelected
                  ? "bg-[#4f46e5]/20 border-[#4f46e5] shadow-lg shadow-[#4f46e5]/10"
                  : "bg-white/5 border-white/10 hover:border-white/20 text-[#c7c4d8]"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#c3c0ff]">{role.category}</span>
                {isSelected && <span className="material-symbols-outlined text-sm text-[#c3c0ff]">check_circle</span>}
              </div>
              <h3 className="font-bold text-sm text-white mt-1">{role.title}</h3>
              <p className="text-[11px] text-[#c7c4d8] mt-1 line-clamp-2">{role.description}</p>
              <span className="inline-block mt-3 text-[10px] font-semibold text-[#c3c0ff]">
                ⏱ {role.estimatedTimeline}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
