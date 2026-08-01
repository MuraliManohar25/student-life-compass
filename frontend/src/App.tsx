import React, { useState } from "react";
import { NavTab } from "./types";
import { Navigation } from "./components/Navigation";
import { LandingView } from "./components/LandingView";
import { DashboardView } from "./components/DashboardView";
import { CareerMentorView } from "./components/CareerMentorView";
import { IntelligenceReportView } from "./components/IntelligenceReportView";
import { StudyPlannerView } from "./components/StudyPlannerView";
import { BudgetView } from "./components/BudgetView";
import { PlacementView } from "./components/PlacementView";
import { RiskPredictionView } from "./components/RiskPredictionView";
import { AskAiModal } from "./components/AskAiModal";

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("landing");
  const [askAiOpen, setAskAiOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-['Inter',sans-serif] antialiased selection:bg-[#4f46e5]/30 selection:text-[#c3c0ff]">
      {/* Navigation Header & Sidebar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAskAi={() => setAskAiOpen(true)}
      />

      {/* Main Content Area */}
      <main className={`${activeTab !== "landing" ? "md:pl-64" : ""} transition-all duration-300`}>
        {activeTab === "landing" && (
          <LandingView
            onStart={() => setActiveTab("dashboard")}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "dashboard" && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenAskAi={() => setAskAiOpen(true)}
          />
        )}

        {activeTab === "career-mentor" && <CareerMentorView />}

        {activeTab === "intelligence-score" && (
          <IntelligenceReportView setActiveTab={setActiveTab} />
        )}

        {activeTab === "study-planner" && <StudyPlannerView />}

        {activeTab === "budget" && <BudgetView />}

        {activeTab === "placement" && <PlacementView />}

        {activeTab === "risk-prediction" && <RiskPredictionView />}
      </main>

      {/* Floating Ask AI Modal Dialog */}
      <AskAiModal
        isOpen={askAiOpen}
        onClose={() => setAskAiOpen(false)}
        activeTab={activeTab}
      />
    </div>
  );
}

export default App;
