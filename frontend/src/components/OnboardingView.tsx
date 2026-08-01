import React, { useState } from "react";
import { profileApi } from "../services/api";

interface OnboardingViewProps {
  onComplete: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [college, setCollege] = useState("");
  const [major, setMajor] = useState("");
  const [currentGpa, setCurrentGpa] = useState("3.8");
  const [targetGpa, setTargetGpa] = useState("4.0");
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [monthlyBudget, setMonthlyBudget] = useState("5000");
  const [sleepHours, setSleepHours] = useState("7.0");

  const [skills, setSkills] = useState([
    { name: "Python", proficiency_score: 85 },
    { name: "Algorithms & DSA", proficiency_score: 80 },
    { name: "Machine Learning", proficiency_score: 75 },
    { name: "System Architecture", proficiency_score: 70 },
  ]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const updateSkillScore = (index: number, val: number) => {
    setSkills((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, proficiency_score: val } : s))
    );
  };

  const updateSkillName = (index: number, name: string) => {
    setSkills((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, name } : s))
    );
  };

  const handleAddSkill = () => {
    if (skills.length < 6) {
      setSkills((prev) => [...prev, { name: "", proficiency_score: 75 }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!college || !major) {
      setErrorMsg("Please provide your College / University and Major.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await profileApi.updateProfile({
        college,
        major,
        current_gpa: parseFloat(currentGpa) || 0.0,
        target_gpa: parseFloat(targetGpa) || 0.0,
        target_role: targetRole,
        sleep_hours: parseFloat(sleepHours) || 7.0,
        monthly_budget: parseFloat(monthlyBudget) || 5000.0,
        skills: skills.filter((s) => s.name.trim() !== ""),
      });
      onComplete();
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to save onboarding data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-['Inter',sans-serif] py-12 px-4 md:px-8 max-w-4xl mx-auto space-y-8 flex flex-col justify-center">
      {/* Top Header Card */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-2 bg-gradient-to-r from-[#4f46e5]/20 via-transparent to-transparent">
        <span className="text-[10px] font-bold tracking-widest text-[#c3c0ff] uppercase">
          WELCOME TO COMPASS AI
        </span>
        <h1 className="font-headline font-black text-2xl sm:text-4xl text-white">
          Calibrate Your Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#c7c4d8]">
          Configure your academic targets, budget runway, and skill vector to initialize personalized ML insights.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs text-center font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Onboarding Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Academic Info */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">school</span>
              <span>Academic Details</span>
            </h3>

            <div>
              <label className="text-xs text-[#c7c4d8]">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. Stanford University"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                required
              />
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8]">Major / Degree</label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                placeholder="e.g. Computer Science"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#c7c4d8]">Current GPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={currentGpa}
                  onChange={(e) => setCurrentGpa(e.target.value)}
                  placeholder="3.8"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                />
              </div>
              <div>
                <label className="text-xs text-[#c7c4d8]">Target GPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetGpa}
                  onChange={(e) => setTargetGpa(e.target.value)}
                  placeholder="4.0"
                  className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
                />
              </div>
            </div>
          </div>

          {/* Career & Lifestyle */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">target</span>
              <span>Career & Lifestyle Targets</span>
            </h3>

            <div>
              <label className="text-xs text-[#c7c4d8]">Target Role Goal</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full mt-1 bg-[#131314] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
              >
                <option value="AI Engineer">AI Engineer</option>
                <option value="Backend Architect">Backend Architect</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Full Stack Lead">Full Stack Lead</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8]">Monthly Hostel Budget (₹)</label>
              <input
                type="number"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                placeholder="5000"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs text-[#c7c4d8]">Target Daily Sleep Hours</label>
              <input
                type="number"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                placeholder="7.5"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Skill Proficiency Vector */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c3c0ff]">psychology</span>
                <span>Initial Skill Proficiency Sliders</span>
              </h3>
              <p className="text-xs text-[#c7c4d8]">Adjust slider values (0-100%) to calibrate career readiness match.</p>
            </div>
            {skills.length < 6 && (
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-[#c3c0ff]"
              >
                + Add Skill
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {skills.map((skill, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkillName(idx, e.target.value)}
                    placeholder="Skill name..."
                    className="bg-transparent font-bold text-white focus:outline-none focus:border-b border-[#4f46e5]"
                  />
                  <span className="font-mono text-[#c3c0ff] font-bold">{skill.proficiency_score}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={skill.proficiency_score}
                  onChange={(e) => updateSkillScore(idx, parseInt(e.target.value))}
                  className="w-full accent-[#4f46e5] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-[#4f46e5] to-emerald-500 text-white font-bold text-sm rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[#4f46e5]/20 flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
          ) : (
            <>
              <span>Initialize Dashboard & Complete Setup</span>
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
