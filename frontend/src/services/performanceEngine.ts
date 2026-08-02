// Performance Engine: Metrics and score tracking driven by shared TaskEngine activity.
import { Task, TaskEngine, formatLocalDate, formatLocalDateTime } from "./taskEngine";

export interface PillarMetric {
  id: string;
  title: string;
  score: number;
  explanation: string;
  gradient: string;
}

export interface ScoreChangeEvent {
  id: string;
  timestamp: string;
  delta: number;
  reason: string;
  category: string;
}

export interface TimelineEntry {
  id: string;
  dateStr: string;
  title: string;
  score: number;
  detail: string;
  isMilestone?: boolean;
}

export interface TaskHistoryItem {
  date: string;
  action: string;
}

/** View model for Performance Report — mapped from shared Task */
export interface ActionTask {
  id: string;
  title: string;
  description?: string;
  assignedDate: string;
  dueDate: string;
  completedDate?: string | null;
  rolledOverDate?: string | null;
  priority: "High" | "Medium" | "Low";
  status: "New" | "Pending" | "Completed" | "Rolled Over";
  createdBy: "AI" | "User" | "Recurring";
  category: string;
  reason: string;
  impactOnPerformance: string;
  history: TaskHistoryItem[];
  completionTimestamp?: string | null;
  pendingDays?: number;
  aiComment?: string;
}

export interface PerformanceState {
  createdAt: string;
  lastRefreshDate: string;
  planGeneratedTime: string;
  tasks: ActionTask[];
  scoreChangeLogs: ScoreChangeEvent[];
  studySprintMinutes: number;
  attendanceRate: number;
  budgetRemaining: number;
  skillsMastered: number;
  dailyScores: Record<string, { score: number; tasksDone: number; detail: string }>;
}

const STORAGE_KEY = "compass_performance_metrics_v1";

const getTodayIsoStr = (): string => new Date().toISOString().split("T")[0];

export { formatLocalDate, formatLocalDateTime };

export const formatFullHeaderDate = (d: Date = new Date()): string => {
  const dateStr = d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return `${dateStr} • 8:00 AM`;
};

interface MetricsState {
  createdAt: string;
  lastRefreshDate: string;
  scoreChangeLogs: ScoreChangeEvent[];
  studySprintMinutes: number;
  attendanceRate: number;
  budgetRemaining: number;
  skillsMastered: number;
  dailyScores: Record<string, { score: number; tasksDone: number; detail: string }>;
}

const createEmptyMetrics = (): MetricsState => ({
  createdAt: getTodayIsoStr(),
  lastRefreshDate: getTodayIsoStr(),
  scoreChangeLogs: [],
  studySprintMinutes: 0,
  attendanceRate: 0,
  budgetRemaining: 0,
  skillsMastered: 0,
  dailyScores: {},
});

function taskToActionTask(t: Task): ActionTask {
  const assignedNice = formatLocalDate(new Date(t.assignedDate));
  const dueNice = formatLocalDate(new Date(t.dueDate));
  const status: ActionTask["status"] = t.completed
    ? "Completed"
    : t.rolloverCount > 0
    ? "Rolled Over"
    : "New";

  return {
    id: t.id,
    title: t.title,
    description: t.description,
    assignedDate: assignedNice,
    dueDate: dueNice,
    completedDate: t.completedAt,
    rolledOverDate: t.rolloverCount > 0 ? assignedNice : null,
    priority: t.priority,
    status,
    createdBy: t.source === "user" ? "User" : t.source === "recurring" ? "Recurring" : "AI",
    category: t.category,
    reason: t.reason || (t.source === "ai" ? "AI-generated task for your daily action plan." : "User-created task."),
    impactOnPerformance: t.impactOnPerformance || "+2 Task Completion",
    history: t.history || [],
    pendingDays: t.rolloverCount > 0 ? t.rolloverCount : undefined,
    aiComment: t.completed ? "Excellent work. This task contributed positively to your overall performance." : undefined,
  };
}

export class PerformanceEngine {
  private static loadMetrics(): MetricsState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const init = createEmptyMetrics();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
        return init;
      }
      return JSON.parse(raw);
    } catch {
      const init = createEmptyMetrics();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
  }

  private static saveMetrics(state: MetricsState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  public static getState(): PerformanceState {
    const metrics = PerformanceEngine.loadMetrics();
    const todayTasks = TaskEngine.getTodayTasks().map(taskToActionTask);
    const planTime = TaskEngine.getPlanGeneratedTime() || formatFullHeaderDate();

    return {
      createdAt: metrics.createdAt,
      lastRefreshDate: metrics.lastRefreshDate,
      planGeneratedTime: planTime,
      tasks: todayTasks,
      scoreChangeLogs: metrics.scoreChangeLogs,
      studySprintMinutes: metrics.studySprintMinutes,
      attendanceRate: metrics.attendanceRate,
      budgetRemaining: metrics.budgetRemaining,
      skillsMastered: metrics.skillsMastered,
      dailyScores: metrics.dailyScores,
    };
  }

  public static getPillars(): PillarMetric[] {
    const state = PerformanceEngine.getState();
    const archived = TaskEngine.getArchivedTasks().length;
    const completedCount = TaskEngine.getTodayTasks().filter((t) => t.completed).length + archived;
    const totalCount = TaskEngine.getAllTasks().length + archived;
    const taskCompletionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    const academicScore = Math.min(100, Math.round(50 + (state.studySprintMinutes / 30) + taskCompletionRate * 0.1));
    const attendanceScore = state.attendanceRate || 0;
    const skillScore = Math.min(100, Math.round(40 + state.skillsMastered * 5));
    const taskScore = totalCount > 0 ? Math.min(100, Math.max(0, taskCompletionRate)) : 0;
    const disciplineScore = Math.min(100, Math.round(40 + state.studySprintMinutes / 25));
    const financialScore = state.budgetRemaining > 1000 ? 79 : state.budgetRemaining > 0 ? 65 : 0;

    return [
      {
        id: "academic-consistency",
        title: "Academic Consistency",
        score: academicScore,
        explanation: `Calculated from ${state.studySprintMinutes} minutes of logged study sprints and assignment momentum.`,
        gradient: "from-indigo-500 to-purple-500",
      },
      {
        id: "attendance",
        title: "Attendance",
        score: attendanceScore,
        explanation: `Calculated from ${attendanceScore}% lecture attendance recorded in your Study Planner.`,
        gradient: "from-emerald-500 to-teal-400",
      },
      {
        id: "skill-growth",
        title: "Skill Growth",
        score: skillScore,
        explanation: `Calculated from ${state.skillsMastered} verified skills mastered in your Career Mentor track.`,
        gradient: "from-cyan-500 to-blue-500",
      },
      {
        id: "task-completion",
        title: "Task Completion",
        score: taskScore,
        explanation: totalCount > 0
          ? `Calculated from ${completedCount} completed out of ${totalCount} assigned tasks (${taskCompletionRate}% rate).`
          : "No tasks assigned yet. Complete tasks to build your completion score.",
        gradient: "from-amber-500 to-orange-400",
      },
      {
        id: "learning-discipline",
        title: "Learning Discipline",
        score: disciplineScore,
        explanation: "Calculated from consecutive daily study sessions and focus retention logs.",
        gradient: "from-[#4f46e5] to-[#c3c0ff]",
      },
      {
        id: "financial-management",
        title: "Financial Management",
        score: financialScore,
        explanation: state.budgetRemaining > 0
          ? `Calculated from ₹${state.budgetRemaining.toLocaleString()} remaining budget runway.`
          : "Set up your budget to track financial management.",
        gradient: "from-violet-500 to-fuchsia-400",
      },
    ];
  }

  public static getOverallScore(): number {
    const pillars = PerformanceEngine.getPillars();
    if (pillars.every((p) => p.score === 0)) return 0;
    const sum = pillars.reduce((acc, p) => acc + p.score, 0);
    return Math.round(sum / pillars.length);
  }

  public static toggleTask(taskId: string): PerformanceState {
    const toggled = TaskEngine.toggleCompletion(taskId);
    if (!toggled) return PerformanceEngine.getState();

    const metrics = PerformanceEngine.loadMetrics();
    const nowDateTimeStr = formatLocalDateTime();

    if (toggled.completed) {
      metrics.scoreChangeLogs.unshift({
        id: `sc-${Date.now()}`,
        timestamp: nowDateTimeStr,
        delta: 2,
        reason: `Completed task: "${toggled.title}"`,
        category: toggled.category || "Task Completion",
      });
    } else {
      metrics.scoreChangeLogs.unshift({
        id: `sc-${Date.now()}`,
        timestamp: nowDateTimeStr,
        delta: -2,
        reason: `Reopened task: "${toggled.title}"`,
        category: toggled.category || "Task Completion",
      });
    }

    const todayIsoStr = getTodayIsoStr();
    const currentOverall = PerformanceEngine.getOverallScore();
    const tasksDoneCount = TaskEngine.getTodayTasks().filter((t) => t.completed).length;

    metrics.dailyScores[todayIsoStr] = {
      score: currentOverall,
      tasksDone: tasksDoneCount,
      detail: tasksDoneCount > 0 ? `Completed ${tasksDoneCount} task(s) today` : "No tasks completed today",
    };

    PerformanceEngine.saveMetrics(metrics);
    return PerformanceEngine.getState();
  }

  public static getScoreChanges(): ScoreChangeEvent[] {
    return PerformanceEngine.loadMetrics().scoreChangeLogs.slice(0, 10);
  }

  public static getRealTimeline(): { scaleType: "Daily" | "Weekly" | "Monthly"; entries: TimelineEntry[] } {
    const metrics = PerformanceEngine.loadMetrics();
    const createdDate = new Date(metrics.createdAt);
    const now = new Date();
    const diffDays = Math.ceil(Math.abs(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

    let scaleType: "Daily" | "Weekly" | "Monthly" = "Daily";
    if (diffDays > 180) scaleType = "Monthly";
    else if (diffDays > 30) scaleType = "Weekly";

    const dateKeys = Object.keys(metrics.dailyScores).sort();
    const entries: TimelineEntry[] = dateKeys.map((dateKey, index) => {
      const data = metrics.dailyScores[dateKey];
      return {
        id: `tl-${dateKey}`,
        dateStr: formatLocalDate(new Date(dateKey)),
        title: data.tasksDone > 0 ? `Completed ${data.tasksDone} Task(s)` : "Activity logged",
        score: data.score,
        detail: data.detail,
        isMilestone: index === 0,
      };
    });

    return { scaleType, entries };
  }

  public static getDynamicRecommendations(): {
    summary: string;
    strengths: string[];
    areasToImprove: string[];
    recommendations: string[];
  } {
    const pillars = PerformanceEngine.getPillars();
    const sorted = [...pillars].sort((a, b) => b.score - a.score);
    const strengths = sorted.filter((p) => p.score > 0).slice(0, 3).map((p) => `Strong ${p.title} (${p.score}%)`);
    const weakPillars = sorted.filter((p) => p.score < 70).map((p) => p.title);
    const uncompletedTasks = TaskEngine.getTodayTasks().filter((t) => !t.completed);

    const recs: string[] = [];
    if (uncompletedTasks.length > 0) {
      recs.push(`Priority: Complete "${uncompletedTasks[0].title}"`);
    }
    if (TaskEngine.getTodayTasks().length === 0) {
      recs.push("Create a study schedule or generate an AI study plan to get started");
    }

    const summaryText =
      TaskEngine.getTodayTasks().length === 0
        ? "You have no tasks scheduled for today. Add tasks via Study Planner or ask Compass AI to generate a plan."
        : `You have ${uncompletedTasks.length} pending task(s) today. Focus on high-priority items to improve your performance score.`;

    return {
      summary: summaryText,
      strengths: strengths.length > 0 ? strengths : ["Complete tasks to build your strengths profile"],
      areasToImprove: weakPillars.length > 0 ? weakPillars : ["Task Completion"],
      recommendations: recs.slice(0, 5),
    };
  }
}
