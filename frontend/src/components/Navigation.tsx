import React, { useState } from "react";
import { NavTab } from "../types";

interface NavigationProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenAskAi: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onOpenAskAi,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const mainNavItems: { id: NavTab; label: string; icon: string }[] = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "career-mentor", label: "Career Mentor", icon: "psychology" },
    { id: "intelligence-score", label: "Intelligence Score", icon: "insights" },
    { id: "study-planner", label: "Study Planner", icon: "event_note" },
    { id: "budget", label: "Budget", icon: "payments" },
    { id: "placement", label: "Placement", icon: "work" },
    { id: "risk-prediction", label: "Risk Prediction", icon: "warning" },
  ];

  return (
    <>
      {/* Top Navigation Bar for Dashboard/App Views */}
      {activeTab !== "landing" && (
        <header className="fixed top-0 left-0 md:left-64 right-0 z-40 h-16 flex justify-between items-center px-4 md:px-6 bg-[#131314]/70 backdrop-blur-md border-b border-white/10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-[#c7c4d8] hover:text-white hover:bg-white/5"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#c7c4d8] text-sm">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search insights, courses, skills..."
                className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-xs text-[#e5e2e3] w-60 md:w-72 focus:outline-none focus:border-[#4f46e5]/50 focus:bg-white/10 transition-all"
              />
            </div>
            {/* Landing page jump link */}
            <button
              onClick={() => setActiveTab("landing")}
              className="hidden lg:flex items-center gap-1.5 text-xs text-[#c7c4d8] hover:text-[#c3c0ff] px-3 py-1 rounded-full border border-white/10 hover:border-white/20 transition-all"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              <span>Landing Page</span>
            </button>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={onOpenAskAi}
              className="p-2 rounded-full hover:bg-white/5 text-[#c3c0ff] transition-colors relative active:scale-95 flex items-center gap-1.5 bg-white/5 border border-white/10 px-3"
            >
              <span className="material-symbols-outlined text-sm fill-1">auto_awesome</span>
              <span className="text-xs font-medium hidden sm:inline">Ask AI</span>
            </button>

            <button className="p-2 rounded-full hover:bg-white/5 text-[#c7c4d8] transition-colors relative active:scale-95">
              <span className="material-symbols-outlined text-lg">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#c3c0ff] rounded-full border-2 border-[#131314]"></span>
            </button>

            <div
              onClick={() => setActiveTab("intelligence-score")}
              className="flex items-center gap-2 ml-1 pl-3 border-l border-white/10 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <div className="text-right hidden lg:block">
                <p className="text-xs font-bold leading-tight text-[#e5e2e3]">Murali K.</p>
                <p className="text-[10px] text-[#c7c4d8] uppercase tracking-wider">Computer Science</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#4f46e5]/20 border border-[#4f46e5]/30 flex items-center justify-center text-[#c3c0ff]">
                <span className="material-symbols-outlined text-lg">account_circle</span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Side Navigation Bar */}
      {activeTab !== "landing" && (
        <aside
          className={`fixed left-0 top-0 h-screen flex flex-col py-6 bg-[#131314] border-r border-white/10 w-64 z-50 transition-transform duration-300 ${
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="px-6 mb-8 flex items-center justify-between">
            <div>
              <button
                onClick={() => setActiveTab("landing")}
                className="font-headline font-black text-xl text-[#c3c0ff] tracking-tight hover:opacity-90 transition-opacity text-left block"
              >
                Compass AI
              </button>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#c7c4d8] opacity-60">
                Premium Tier
              </p>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1 rounded-lg text-[#c7c4d8] hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {mainNavItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? "text-[#c3c0ff] border-l-4 border-[#4f46e5] bg-[#4f46e5]/10 shadow-sm"
                      : "text-[#c7c4d8] hover:bg-white/5 hover:text-[#e5e2e3]"
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${isActive ? "fill-1" : ""}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}

            <div className="pt-4 pb-2 px-4">
              <p className="text-[10px] font-semibold text-[#918fa1] uppercase tracking-wider">
                Utilities & Config
              </p>
            </div>

            <button
              onClick={() => {
                onOpenAskAi();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#c7c4d8] hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-lg">smart_toy</span>
              <span>AI Assistant</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("landing");
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#c7c4d8] hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-lg">preview</span>
              <span>Public Landing Page</span>
            </button>
          </nav>

          <div className="mt-auto px-4 pt-4">
            <button
              onClick={onOpenAskAi}
              className="w-full py-3 rounded-xl bg-[#4f46e5] text-[#dad7ff] font-headline font-medium text-xs tracking-wider uppercase flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#4f46e5]/20"
            >
              <span className="material-symbols-outlined text-sm fill-1">auto_awesome</span>
              <span>Ask AI</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};
