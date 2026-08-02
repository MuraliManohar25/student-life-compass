import React from "react";
import { NavTab } from "../types";

interface DashboardHeaderProps {
  userName: string;
  setActiveTab: (tab: NavTab) => void;
  onOpenAskAi: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName, setActiveTab, onOpenAskAi }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white/5 via-white/[0.02] to-transparent p-6 rounded-2xl border border-white/10">
    <div>
      <h1 className="font-headline font-black text-2xl sm:text-3xl text-[#e5e2e3] flex items-center gap-2">
        <span>Good Morning {userName}</span>
        <span className="text-2xl animate-bounce">👋</span>
      </h1>
      <p className="text-xs sm:text-sm text-[#c7c4d8] mt-1">
        Your student performance index is up this week. You're in the top 15% of your cohort.
      </p>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={() => setActiveTab("study-planner")}
        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-[#e5e2e3] transition-all flex items-center gap-1.5"
      >
        <span className="material-symbols-outlined text-sm">calendar_month</span>
        <span>Adjust Schedule</span>
      </button>
      <button
        onClick={onOpenAskAi}
        className="px-4 py-2 rounded-xl bg-[#4f46e5] text-white text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg shadow-[#4f46e5]/25"
      >
        <span className="material-symbols-outlined text-sm fill-1">auto_awesome</span>
        <span>Quick AI Insight</span>
      </button>
    </div>
  </div>
);
