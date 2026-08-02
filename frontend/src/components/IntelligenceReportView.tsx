import React, { useState } from "react";
import { NavTab } from "../types";
import { OverallScoreCard } from "./IntelligenceScore/OverallScoreCard";
import { RealProgressTimeline } from "./IntelligenceScore/RealProgressTimeline";
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
  const timeline = PerformanceEngine.getRealTimeline();
  const diagnostic = PerformanceEngine.getDynamicRecommendations();

  const handleToggleTask = (taskId: string) => {
    PerformanceEngine.toggleTask(taskId);
    setRefreshKey((prev) => prev + 1); // Trigger instant UI re-render on user interaction
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. AI Student Performance Report Header & Overall Performance Score */}
      <OverallScoreCard score={overallScore} />

      {/* 2. Real Progress Timeline */}
      <RealProgressTimeline scaleType={timeline.scaleType} entries={timeline.entries} />

      {/* 3. Today's Personalized Action Plan */}
      <DailyScheduleCard
        tasks={perfState.tasks}
        planGeneratedTime={perfState.planGeneratedTime}
        onToggleTask={handleToggleTask}
      />

      {/* 4. AI Mentor Summary */}
      <AIDiagnosticCard
        summary={diagnostic.summary}
        strengths={diagnostic.strengths}
        areasToImprove={diagnostic.areasToImprove}
      />
    </div>
  );
};
