import React, { useState, useEffect } from "react";
import { NavTab } from "./types";
import { Navigation } from "./components/Navigation";
import { LandingView } from "./components/LandingView";
import { DashboardView } from "./components/DashboardView";
import { CareerMentorView } from "./components/CareerMentorView";
import { IntelligenceReportView } from "./components/IntelligenceReportView";
import { StudyPlannerView } from "./components/StudyPlannerView";
import { BudgetView } from "./components/BudgetView";
import { NearbyPlacesView } from "./components/NearbyPlacesView";
import { PlacementView } from "./components/PlacementView";
import { RiskPredictionView } from "./components/RiskPredictionView";
import { AskAiModal } from "./components/AskAiModal";
import { SettingsView } from "./components/SettingsView";
import { AuthView } from "./components/AuthView";
import { OnboardingView } from "./components/OnboardingView";
import { profileApi } from "./services/api";

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("landing");
  const [askAiOpen, setAskAiOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const checkUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      setIsProfileComplete(false);
      setCheckingAuth(false);
      return;
    }

    setIsAuthenticated(true);

    try {
      const profile = await profileApi.getProfile();
      if (profile && profile.college && profile.college.trim() !== "") {
        setIsProfileComplete(true);
      } else {
        setIsProfileComplete(false);
      }
    } catch {
      // In case of invalid token or network offline fallback
      setIsProfileComplete(true);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkUserProfile();
  }, []);

  const handleAuthSuccess = (token: string, isNewUser: boolean, profileComplete: boolean) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    if (isNewUser || !profileComplete) {
      setIsProfileComplete(false);
      setActiveTab("onboarding");
    } else {
      setIsProfileComplete(true);
      setActiveTab("dashboard");
    }
  };

  const handleOnboardingComplete = () => {
    setIsProfileComplete(true);
    setActiveTab("dashboard");
  };

  const handleStartFromLanding = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setActiveTab("auth");
    } else if (!isProfileComplete) {
      setActiveTab("onboarding");
    } else {
      setActiveTab("dashboard");
    }
  };

  // If user clicks on app tabs when not authenticated, show AuthView
  const handleTabChange = (tab: NavTab) => {
    if (tab === "landing") {
      setActiveTab("landing");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setActiveTab("auth");
      return;
    }
    if (!isProfileComplete && tab !== "onboarding") {
      setActiveTab("onboarding");
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e5e2e3] font-['Inter',sans-serif] antialiased selection:bg-[#4f46e5]/30 selection:text-[#c3c0ff]">
      {/* Navigation Header & Sidebar (hidden on landing, auth, and onboarding) */}
      {activeTab !== "landing" && activeTab !== "auth" && activeTab !== "onboarding" && (
        <Navigation
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onOpenAskAi={() => setAskAiOpen(true)}
        />
      )}

      {/* Main Content Area */}
      <main className={`${activeTab !== "landing" && activeTab !== "auth" && activeTab !== "onboarding" ? "md:pl-64" : ""} transition-all duration-300`}>
        {activeTab === "landing" && (
          <LandingView
            onStart={handleStartFromLanding}
            setActiveTab={handleTabChange}
          />
        )}

        {activeTab === "auth" && (
          <AuthView onAuthSuccess={handleAuthSuccess} />
        )}

        {activeTab === "onboarding" && (
          <OnboardingView onComplete={handleOnboardingComplete} />
        )}

        {activeTab === "dashboard" && (
          <DashboardView
            setActiveTab={handleTabChange}
            onOpenAskAi={() => setAskAiOpen(true)}
          />
        )}

        {activeTab === "career-mentor" && <CareerMentorView />}

        {activeTab === "intelligence-score" && (
          <IntelligenceReportView setActiveTab={handleTabChange} />
        )}

        {activeTab === "study-planner" && <StudyPlannerView />}

        {activeTab === "budget" && <BudgetView />}

        {activeTab === "nearby-places" && <NearbyPlacesView />}

        {activeTab === "placement" && <PlacementView />}

        {activeTab === "risk-prediction" && <RiskPredictionView />}

        {activeTab === "settings" && <SettingsView />}
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
