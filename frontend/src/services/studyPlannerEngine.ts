// Study Planner Engine: Schedule views backed by the shared TaskEngine.
import { Task, TaskEngine } from "./taskEngine";

export interface StudyTask {
  id: string;
  title: string;
  subject: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  priority: "High" | "Medium" | "Low";
  category: "Assignment" | "Class" | "Practice" | "Study" | "Revision" | "Personal";
  status: "Pending" | "Completed" | "Rolled Over" | "In Progress";
  isRecurring: boolean;
  recurringFrequency?: "None" | "Daily" | "Weekly";
  reminder: "None" | "15 mins before" | "30 mins before" | "1 hour before" | "Custom";
  createdBy: "AI" | "User";
  completedAt?: string | null;
  rolledOverFrom?: string | null;
  notes?: string;
}

export interface DayScheduleSummary {
  dayName: string;
  dateStr: string;
  isoDate: string;
  tasks: StudyTask[];
  totalHours: number;
  assignmentsCount: number;
  examsCount: number;
  isToday: boolean;
}

export interface StudyStats {
  todayStudyHours: number;
  weekStudyHours: number;
  completedTasks: number;
  pendingTasks: number;
  currentStreak: number;
  longestStreak: number;
  focusTimeMinutes: number;
}

const getTodayIso = (): string => new Date().toISOString().split("T")[0];

const addDaysIso = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

const formatLocalNice = (isoStr: string): string => {
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return isoStr;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const sourceToCreatedBy = (source: Task["source"]): "AI" | "User" =>
  source === "user" || source === "study-planner" ? "User" : "AI";

const createdByToSource = (createdBy: "AI" | "User"): Task["source"] =>
  createdBy === "User" ? "user" : "ai";

function taskToStudyTask(t: Task): StudyTask {
  return {
    id: t.id,
    title: t.title,
    subject: t.subject || t.category,
    description: t.description,
    date: t.assignedDate,
    startTime: t.startTime || "09:00 AM",
    endTime: t.endTime || "10:00 AM",
    duration: t.estimatedDuration || "1 hour",
    priority: t.priority,
    category: (t.category as StudyTask["category"]) || "Study",
    status: TaskEngine.getTaskStatus(t),
    isRecurring: t.source === "recurring",
    reminder: "None",
    createdBy: sourceToCreatedBy(t.source),
    completedAt: t.completedAt,
    rolledOverFrom: t.rolloverCount > 0 ? t.assignedDate : null,
  };
}

function studyTaskToTaskInput(data: Omit<StudyTask, "id">): Omit<Task, "id" | "completed" | "completedAt" | "rolloverCount"> {
  return {
    title: data.title,
    description: data.description,
    category: data.category,
    assignedDate: data.date,
    dueDate: data.date,
    priority: data.priority,
    estimatedDuration: data.duration,
    source: createdByToSource(data.createdBy),
    startTime: data.startTime,
    endTime: data.endTime,
    subject: data.subject,
    status: data.status,
  };
}

function parseDurationHours(duration: string): number {
  if (duration.includes("hour")) return parseFloat(duration) || 1;
  if (duration.includes("min")) return (parseFloat(duration) || 30) / 60;
  return 1;
}

export class StudyPlannerEngine {
  public static getTodaySchedule(): StudyTask[] {
    return TaskEngine.getTodayTasks().map(taskToStudyTask);
  }

  public static getTomorrowSchedule(): StudyTask[] {
    return TaskEngine.getTomorrowTasks().map(taskToStudyTask);
  }

  public static getThisWeekSchedule(): DayScheduleSummary[] {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMonday);

    const weekSummaries: DayScheduleSummary[] = [];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const isoDate = dayDate.toISOString().split("T")[0];
      const dayName = dayDate.toLocaleDateString("en-US", { weekday: "long" });
      const dateStr = formatLocalNice(isoDate);
      const dayTasks = TaskEngine.getTasksForDate(isoDate).map(taskToStudyTask);

      let totalHours = 0;
      dayTasks.forEach((t) => {
        totalHours += parseDurationHours(t.duration);
      });

      weekSummaries.push({
        dayName,
        dateStr,
        isoDate,
        tasks: dayTasks,
        totalHours: Math.round(totalHours * 10) / 10,
        assignmentsCount: dayTasks.filter((t) => t.category === "Assignment").length,
        examsCount: dayTasks.filter((t) => t.title.toLowerCase().includes("exam") || t.title.toLowerCase().includes("test")).length,
        isToday: isoDate === getTodayIso(),
      });
    }

    return weekSummaries;
  }

  public static getStats(): StudyStats {
    const todayIso = getTodayIso();
    const todayTasks = TaskEngine.getTodayTasks();
    const todayDone = todayTasks.filter((t) => t.completed);

    let todayHours = 0;
    todayDone.forEach((t) => {
      todayHours += parseDurationHours(t.estimatedDuration);
    });

    const weekSummaries = StudyPlannerEngine.getThisWeekSchedule();
    let weekHours = 0;
    weekSummaries.forEach((ws) => {
      weekHours += ws.totalHours;
    });

    const allTasks = TaskEngine.getAllTasks();
    const totalCompleted = allTasks.filter((t) => t.completed).length + TaskEngine.getArchivedTasks().length;
    const totalPending = allTasks.filter((t) => !t.completed).length;

    return {
      todayStudyHours: Math.round(todayHours * 10) / 10,
      weekStudyHours: Math.round(weekHours * 10) / 10,
      completedTasks: totalCompleted,
      pendingTasks: totalPending,
      currentStreak: 0,
      longestStreak: 0,
      focusTimeMinutes: 0,
    };
  }

  public static addTask(taskData: Omit<StudyTask, "id">): StudyTask {
    const created = TaskEngine.addTask(studyTaskToTaskInput(taskData));
    return taskToStudyTask(created);
  }

  public static updateTask(id: string, updates: Partial<StudyTask>): StudyTask | null {
    const patch: Partial<Task> = {};
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.subject !== undefined) patch.subject = updates.subject;
    if (updates.date !== undefined) {
      patch.assignedDate = updates.date;
      patch.dueDate = updates.date;
    }
    if (updates.startTime !== undefined) patch.startTime = updates.startTime;
    if (updates.endTime !== undefined) patch.endTime = updates.endTime;
    if (updates.duration !== undefined) patch.estimatedDuration = updates.duration;
    if (updates.priority !== undefined) patch.priority = updates.priority;
    if (updates.category !== undefined) patch.category = updates.category;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.createdBy !== undefined) patch.source = createdByToSource(updates.createdBy);

    const updated = TaskEngine.updateTask(id, patch);
    return updated ? taskToStudyTask(updated) : null;
  }

  public static deleteTask(id: string) {
    TaskEngine.deleteTask(id);
  }

  public static duplicateTask(id: string): StudyTask | null {
    const dup = TaskEngine.duplicateTask(id);
    return dup ? taskToStudyTask(dup) : null;
  }

  public static toggleTaskCompletion(id: string): StudyTask | null {
    const toggled = TaskEngine.toggleCompletion(id);
    return toggled ? taskToStudyTask(toggled) : null;
  }

  public static reorderTasks(reorderedTasks: StudyTask[]) {
    // Preserve order within same date by re-saving — minimal support
    reorderedTasks.forEach((st, idx) => {
      TaskEngine.updateTask(st.id, { assignedDate: st.date });
    });
  }
}
