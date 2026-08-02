import React from "react";
import { NavTab } from "../types";
import { OverallScoreCard } from "./IntelligenceScore/OverallScoreCard";
import { RealProgressTimeline } from "./IntelligenceScore/RealProgressTimeline";
import { AIDiagnosticCard } from "./IntelligenceScore/AIDiagnosticCard";
import { DailyScheduleCard } from "./IntelligenceScore/DailyScheduleCard";
import { PerformanceEngine } from "../services/performanceEngine";
import { useAppData } from "../context/AppDataContext";

interface IntelligenceReportViewProps {
  setActiveTab: (tab: NavTab) => void;
}

export const IntelligenceReportView: React.FC<IntelligenceReportViewProps> = ({ setActiveTab }) => {
  const { planGeneratedTime, toggleTask } = useAppData();

  const overallScore = PerformanceEngine.getOverallScore();
  const timeline = PerformanceEngine.getRealTimeline();
  const diagnostic = PerformanceEngine.getDynamicRecommendations();
  const perfState = PerformanceEngine.getState();

  const actionTasks = perfState.tasks;

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      <OverallScoreCard score={overallScore} />

      <RealProgressTimeline scaleType={timeline.scaleType} entries={timeline.entries} />

      <DailyScheduleCard
        tasks={actionTasks}
        planGeneratedTime={planGeneratedTime || perfState.planGeneratedTime}
        onToggleTask={toggleTask}
        onOpenStudyPlanner={() => setActiveTab("study-planner")}
      />

      <AIDiagnosticCard
        summary={diagnostic.summary}
        strengths={diagnostic.strengths}
        areasToImprove={diagnostic.areasToImprove}
      />
    </div>
  );
};
