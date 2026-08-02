import React, { useState } from "react";
import { CAREER_ROLES } from "../data/careerRoles";
import { TargetRoleSelector } from "./CareerMentor/TargetRoleSelector";
import { CurrentSkillsSelector } from "./CareerMentor/CurrentSkillsSelector";
import { AnalyzeButton } from "./CareerMentor/AnalyzeButton";
import { SkillGapCard } from "./CareerMentor/SkillGapCard";
import { LearningResources } from "./CareerMentor/LearningResources";
import { RoadmapCard } from "./CareerMentor/RoadmapCard";
import { CareerChatbot } from "./CareerMentor/CareerChatbot";

// All unique skills collected for selector pills
const ALL_SKILLS = Array.from(new Set(CAREER_ROLES.flatMap((r) => r.requiredSkills)));

export const CareerMentorView: React.FC = () => {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("ai-engineer");
  const [selectedSkills, setSelectedSkills] = useState<string[]>(["Python", "SQL", "Git"]);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);

  const selectedRole = CAREER_ROLES.find((r) => r.id === selectedRoleId) || CAREER_ROLES[0];

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSelectRole = (roleId: string) => {
    setSelectedRoleId(roleId);
    // Reset analysis trigger when role changes until user clicks Analyze again
    setIsAnalyzed(false);
  };

  // Dynamic Skill Gap Calculations
  const knownSkills = selectedRole.requiredSkills.filter((sk) => selectedSkills.includes(sk));
  const missingSkills = selectedRole.requiredSkills.filter((sk) => !selectedSkills.includes(sk));
  const readinessScore = Math.round((knownSkills.length / selectedRole.requiredSkills.length) * 100);

  const aiRecommendation =
    missingSkills.length > 0
      ? `Focus on mastering ${missingSkills[0]} before advancing to ${missingSkills[1] || "advanced projects"}.`
      : "Outstanding! You have all required skills. Start working on real-world portfolio projects.";

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-[#c3c0ff] uppercase">AI CAREER NAVIGATOR</span>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">Career Mentor & Skill Roadmap</h1>
          <p className="text-xs text-[#c7c4d8] mt-1">Configure your goal and current skills to unlock tailored learning paths.</p>
        </div>
      </div>

      {/* Step 1 & Step 2 Selectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TargetRoleSelector roles={CAREER_ROLES} selectedRoleId={selectedRoleId} onSelectRole={handleSelectRole} />
        <CurrentSkillsSelector availableSkills={ALL_SKILLS} selectedSkills={selectedSkills} onToggleSkill={toggleSkill} />
      </div>

      {/* Step 3: Analyze Trigger Button */}
      <AnalyzeButton onAnalyze={() => setIsAnalyzed(true)} isAnalyzed={isAnalyzed} />

      {/* Conditional Output Sections: Shown ONLY after clicking Analyze */}
      {isAnalyzed && (
        <div className="space-y-8 animate-fadeIn">
          {/* Skill Gap Analysis */}
          <SkillGapCard
            roleTitle={selectedRole.title}
            knownSkills={knownSkills}
            missingSkills={missingSkills}
            readinessScore={readinessScore}
            aiRecommendation={aiRecommendation}
          />

          {/* AI Roadmap & Learning Resources Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RoadmapCard role={selectedRole} knownSkills={knownSkills} />
            <LearningResources missingSkills={missingSkills} />
          </div>

          {/* Interactive AI Career Assistant Chatbot */}
          <CareerChatbot roleTitle={selectedRole.title} />
        </div>
      )}
    </div>
  );
};
