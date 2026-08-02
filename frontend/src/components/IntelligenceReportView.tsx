import React, { useState } from "react";
import { NavTab } from "../types";
import { OverallScoreCard } from "./IntelligenceScore/OverallScoreCard";
import { IntelligenceBreakdown } from "./IntelligenceScore/IntelligenceBreakdown";
import { RealProgressTimeline } from "./IntelligenceScore/RealProgressTimeline";
import { ScoreChangeSection } from "./IntelligenceScore/ScoreChangeSection";
import { AIDiagnosticCard } from "./IntelligenceScore/AIDiagnosticCard";
import { DailyScheduleCard } from "./IntelligenceScore/DailyScheduleCard";
import { PerformanceEngine } from "../services/performanceEngine";

interface IntelligenceReportViewProps {
  setActiveTab: (tab: NavTab) => void;
}

// 100% Real-Activity Driven AI Student Performance Report Main View
export const IntelligenceReportView: React.FC<IntelligenceReportViewProps> = () => {
  const [, setRefreshKey] = useState<number>(0);

  // Retrieve dynamic state from PerformanceEngine
  const perfState = PerformanceEngine.getState();
  const overallScore = PerformanceEngine.getOverallScore();
  const pillars = PerformanceEngine.getPillars();
  const scoreLogs = PerformanceEngine.getScoreChanges();
  const timeline = PerformanceEngine.getRealTimeline();
  const diagnostic = PerformanceEngine.getDynamicRecommendations();

  const handleToggleTask = (taskId: string) => {
    PerformanceEngine.toggleTask(taskId);
    setRefreshKey((prev) => prev + 1); // Trigger instant UI re-render on user interaction
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-10">
      {/* 1. TOP SECTION: Overall Performance Score & Circular Indicator */}
      <OverallScoreCard score={overallScore} />

      {/* 2. PERFORMANCE BREAKDOWN: 6 Pillars with Calculation Audit Explanations */}
      <IntelligenceBreakdown pillars={pillars} />

      {/* 3. REAL PROGRESS TIMELINE (Replaces fake monthly chart) */}
      <RealProgressTimeline scaleType={timeline.scaleType} entries={timeline.entries} />

      {/* 4. WHY DID MY SCORE CHANGE? Audit Log */}
      <ScoreChangeSection logs={scoreLogs} />

      {/* 5. AI PERFORMANCE SUMMARY, MENTOR DIAGNOSTIC & DAILY RECOMMENDATIONS */}
      <AIDiagnosticCard
        summary={diagnostic.summary}
        strengths={diagnostic.strengths}
        areasToImprove={diagnostic.areasToImprove}
        recommendations={diagnostic.recommendations}
      />

      {/* 6. TODAY'S PERSONALIZED ACTION PLAN (Professional AI Task Timeline) */}
      <DailyScheduleCard
        tasks={perfState.tasks}
        planGeneratedTime={perfState.planGeneratedTime}
        onToggleTask={handleToggleTask}
      />
    </div>
  );
};
