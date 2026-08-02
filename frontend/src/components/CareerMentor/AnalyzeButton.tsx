import React from "react";

interface AnalyzeButtonProps {
  onAnalyze: () => void;
  isAnalyzed: boolean;
}

// AnalyzeButton: Prompts the user to trigger Skill Gap calculation and roadmap generation.
export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ onAnalyze, isAnalyzed }) => {
  return (
    <div className="flex justify-center pt-2">
      <button
        onClick={onAnalyze}
        className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#4f46e5] to-[#c3c0ff] text-white font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#4f46e5]/30 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-lg fill-1">auto_awesome</span>
        <span>{isAnalyzed ? "Re-Analyze Skill Gap & Roadmap" : "Analyze Career Gap & Generate Roadmap"}</span>
      </button>
    </div>
  );
};
