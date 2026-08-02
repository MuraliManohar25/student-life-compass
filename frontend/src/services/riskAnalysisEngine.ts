// Risk Analysis Engine: Automatically calculates Academic, Financial, and Placement Risk from PerformanceEngine, StudyPlannerEngine, and BudgetEngine.
import { PerformanceEngine } from "./performanceEngine";
import { StudyPlannerEngine } from "./studyPlannerEngine";
import { BudgetEngine } from "./budgetEngine";

export interface AuditMetric {
  label: string;
  value: string;
}

export interface RiskCategoryAssessment {
  category: "Academic Risk" | "Financial Risk" | "Placement Risk";
  level: "Low" | "Moderate" | "High";
  scorePercent: number;
  confidencePercent: number;
  lastUpdated: string;
  reason: string;
  auditMetrics: AuditMetric[];
  aiConclusion: string;
  aiSuggestions: string[];
}

export interface OverallRiskSummary {
  level: "Low" | "Moderate" | "High";
  reason: string;
  academic: RiskCategoryAssessment;
  financial: RiskCategoryAssessment;
  placement: RiskCategoryAssessment;
}

export class RiskAnalysisEngine {
  public static calculateRisks(monthKey: string = "2026-08"): OverallRiskSummary {
    const perfState = PerformanceEngine.getState();
    const pillars = PerformanceEngine.getPillars();
    const budgetCalcs = BudgetEngine.getCalculations(monthKey);
    const studyStats = StudyPlannerEngine.getStats();

    const academicPillar = pillars.find((p) => p.id === "academic-consistency")?.score || 87;
    const disciplinePillar = pillars.find((p) => p.id === "learning-discipline")?.score || 82;
    const attendancePillar = pillars.find((p) => p.id === "attendance")?.score || 84;
    const skillPillar = pillars.find((p) => p.id === "skill-growth")?.score || 80;

    const now = new Date();
    const lastUpdated = `${now.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} • ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    // 1. ACADEMIC RISK CALCULATION
    const academicWeighted = Math.round(academicPillar * 0.4 + disciplinePillar * 0.3 + attendancePillar * 0.3);
    const academicRiskScore = Math.max(5, Math.min(99, Math.round(100 - academicWeighted)));

    let academicLevel: "Low" | "Moderate" | "High" = "Low";
    let academicReason = "Your academic performance is consistent and study sessions are on track.";

    if (academicRiskScore >= 65) {
      academicLevel = "High";
      academicReason = "Your study consistency has decreased significantly and critical assignment deadlines are pending.";
    } else if (academicRiskScore >= 35) {
      academicLevel = "Moderate";
      academicReason = "Your study consistency has decreased this week and two planned study sessions were missed.";
    }

    const academicAudit: AuditMetric[] = [
      { label: "Attendance", value: `${attendancePillar}%` },
      { label: "Study Hours", value: `${studyStats.todayStudyHours} hrs/day` },
      { label: "Assignments Completed", value: `${studyStats.completedTasks}/${studyStats.completedTasks + studyStats.pendingTasks}` },
      { label: "Learning Discipline", value: `${disciplinePillar}%` },
    ];

    const academicSuggestions = [
      "Complete your pending DBMS assignment before 8 PM.",
      "Study for at least 2 hours today to boost discipline score.",
      "Revise Java Core & Async basics before tomorrow's class.",
      "Maintain 85%+ attendance streak in Operating Systems lectures.",
    ];

    const academic: RiskCategoryAssessment = {
      category: "Academic Risk",
      level: academicLevel,
      scorePercent: academicRiskScore,
      confidencePercent: 91,
      lastUpdated,
      reason: academicReason,
      auditMetrics: academicAudit,
      aiConclusion: `${academicLevel} Risk`,
      aiSuggestions: academicSuggestions,
    };

    // 2. FINANCIAL RISK CALCULATION
    const utilization = budgetCalcs.budgetUtilization;
    const overspendingProb = budgetCalcs.overspendingProbability;
    const financialRiskScore = Math.max(5, Math.min(99, Math.round(overspendingProb)));

    let financialLevel: "Low" | "Moderate" | "High" = "Low";
    let financialReason = "Your spending is well within daily safe limits and monthly runway is healthy.";

    if (utilization >= 80 || overspendingProb >= 70) {
      financialLevel = "High";
      financialReason = `You have already used ${utilization}% of your monthly budget while remaining runway is tight.`;
    } else if (utilization >= 55 || overspendingProb >= 40) {
      financialLevel = "Moderate";
      financialReason = `Budget utilization is at ${utilization}% with moderate overspending risk.`;
    }

    const financialAudit: AuditMetric[] = [
      { label: "Monthly Budget", value: `${budgetCalcs.currency}${budgetCalcs.monthlyBudget.toLocaleString()}` },
      { label: "Spent So Far", value: `${budgetCalcs.currency}${budgetCalcs.totalSpent.toLocaleString()}` },
      { label: "Remaining Runway", value: `${budgetCalcs.currency}${budgetCalcs.remainingBudget.toLocaleString()}` },
      { label: "Budget Utilization", value: `${utilization}%` },
    ];

    const financialSuggestions = [
      "Avoid food delivery for the next 5 days.",
      `Limit daily spending to ${budgetCalcs.currency}${budgetCalcs.safeDailyLimit}.`,
      "Delay non-essential purchases until next month.",
      "Review weekly subscriptions & canteen expenses.",
    ];

    const financial: RiskCategoryAssessment = {
      category: "Financial Risk",
      level: financialLevel,
      scorePercent: financialRiskScore,
      confidencePercent: 95,
      lastUpdated,
      reason: financialReason,
      auditMetrics: financialAudit,
      aiConclusion: `${financialLevel} Risk`,
      aiSuggestions: financialSuggestions,
    };

    // 3. PLACEMENT RISK CALCULATION
    const placementReadiness = Math.round(skillPillar * 0.5 + (perfState.skillsMastered * 10) * 0.5);
    const placementRiskScore = Math.max(5, Math.min(99, Math.round(100 - placementReadiness)));

    let placementLevel: "Low" | "Moderate" | "High" = "Low";
    let placementReason = "Placement readiness is progressing steadily with regular problem solving.";

    if (placementRiskScore >= 65) {
      placementLevel = "High";
      placementReason = "No aptitude practice has been recorded in the last 5 days and DSA progress remains below target.";
    } else if (placementRiskScore >= 35) {
      placementLevel = "Moderate";
      placementReason = "Aptitude test practice requires consistency and DSA problem count needs acceleration.";
    }

    const placementAudit: AuditMetric[] = [
      { label: "Skills Mastered", value: `${perfState.skillsMastered}/8 Target` },
      { label: "DSA Problems Solved", value: "12 Problems" },
      { label: "Aptitude Practice", value: "Low (0 test sets this week)" },
      { label: "Skill Growth Score", value: `${skillPillar}%` },
    ];

    const placementSuggestions = [
      "Solve 5 DSA problems today on LeetCode.",
      "Complete one aptitude mock test.",
      "Update your resume with recent project milestones.",
      "Finish one backend API mini-project milestone.",
    ];

    const placement: RiskCategoryAssessment = {
      category: "Placement Risk",
      level: placementLevel,
      scorePercent: placementRiskScore,
      confidencePercent: 90,
      lastUpdated,
      reason: placementReason,
      auditMetrics: placementAudit,
      aiConclusion: `${placementLevel} Risk`,
      aiSuggestions: placementSuggestions,
    };

    // OVERALL RISK LEVEL (Peak of 3 risks)
    let overallLevel: "Low" | "Moderate" | "High" = "Low";
    if (academicLevel === "High" || financialLevel === "High" || placementLevel === "High") {
      overallLevel = "High";
    } else if (academicLevel === "Moderate" || financialLevel === "Moderate" || placementLevel === "Moderate") {
      overallLevel = "Moderate";
    }

    let overallReason = "All performance metrics are stable with low overall risk flags.";
    if (overallLevel === "High") {
      overallReason = "High risk flags detected in your student metrics requiring immediate action.";
    } else if (overallLevel === "Moderate") {
      overallReason = "Academic performance is stable, but financial runway or placement preparation requires attention.";
    }

    return {
      level: overallLevel,
      reason: overallReason,
      academic,
      financial,
      placement,
    };
  }
}
