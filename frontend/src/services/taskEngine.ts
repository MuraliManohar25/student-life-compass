// Task Engine: Single source of truth for daily tasks across Dashboard, Study Planner, and Performance Report.

export type TaskPriority = "High" | "Medium" | "Low";
export type TaskSource = "user" | "ai" | "automation" | "study-planner" | "recurring";

export interface TaskHistoryEntry {
  date: string;
  action: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  priority: TaskPriority;
  estimatedDuration: string;
  completed: boolean;
  completedAt: string | null;
  source: TaskSource;
  rolloverCount: number;
  startTime?: string;
  endTime?: string;
  subject?: string;
  reason?: string;
  impactOnPerformance?: string;
  history?: TaskHistoryEntry[];
  status?: "Pending" | "Completed" | "Rolled Over" | "In Progress";
}

export interface ArchivedTask extends Task {
  archivedAt: string;
}

interface TaskStoreState {
  tasks: Task[];
  archivedTasks: ArchivedTask[];
  lastRolloverDate: string; // YYYY-MM-DD
  planGeneratedTime: string | null;
}

const STORAGE_KEY = "compass_task_engine_v1";

type Listener = () => void;

const getTodayIso = (): string => new Date().toISOString().split("T")[0];

const addDaysIso = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export const formatLocalDate = (d: Date = new Date()): string =>
  d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const formatLocalDateTime = (d: Date = new Date()): string => {
  const dateStr = formatLocalDate(d);
  const timeStr = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return `${dateStr} • ${timeStr}`;
};

const createEmptyState = (): TaskStoreState => ({
  tasks: [],
  archivedTasks: [],
  lastRolloverDate: getTodayIso(),
  planGeneratedTime: null,
});

const deriveStatus = (task: Task): Task["status"] => {
  if (task.completed) return "Completed";
  if (task.rolloverCount > 0) return "Rolled Over";
  return task.status || "Pending";
};

export class TaskEngine {
  private static listeners = new Set<Listener>();

  static subscribe(listener: Listener): () => void {
    TaskEngine.listeners.add(listener);
    return () => TaskEngine.listeners.delete(listener);
  }

  private static notify() {
    TaskEngine.listeners.forEach((fn) => fn());
  }

  private static loadState(): TaskStoreState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const init = createEmptyState();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
        return init;
      }
      const state: TaskStoreState = JSON.parse(raw);
      const today = getTodayIso();
      if (state.lastRolloverDate !== today) {
        TaskEngine.performDailyRollover(state, today);
      }
      return state;
    } catch {
      const init = createEmptyState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(init));
      return init;
    }
  }

  private static saveState(state: TaskStoreState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    TaskEngine.notify();
  }

  private static performDailyRollover(state: TaskStoreState, todayIso: string) {
    const todayLocal = formatLocalDate(new Date());
    const completed = state.tasks.filter((t) => t.completed);
    const incomplete = state.tasks.filter((t) => !t.completed);

    state.archivedTasks = [
      ...state.archivedTasks,
      ...completed.map((t) => ({ ...t, archivedAt: todayIso })),
    ];

    state.tasks = incomplete.map((t) => {
      const isOverdue = t.dueDate < todayIso;
      const newPriority: TaskPriority =
        isOverdue || t.rolloverCount > 0 ? "High" : t.priority;
      return {
        ...t,
        assignedDate: todayIso,
        priority: newPriority,
        rolloverCount: t.rolloverCount + 1,
        status: "Rolled Over" as const,
        history: [
          ...(t.history || []),
          { date: todayLocal, action: `Rolled over to ${todayLocal}` },
        ],
      };
    });

    state.lastRolloverDate = todayIso;
    TaskEngine.saveState(state);
  }

  static getAllTasks(): Task[] {
    return TaskEngine.loadState().tasks;
  }

  static getArchivedTasks(): ArchivedTask[] {
    return TaskEngine.loadState().archivedTasks;
  }

  static getTodayTasks(): Task[] {
    const today = getTodayIso();
    return TaskEngine.loadState().tasks.filter((t) => t.assignedDate === today);
  }

  static getTomorrowTasks(): Task[] {
    const tomorrow = addDaysIso(1);
    return TaskEngine.loadState().tasks.filter((t) => t.assignedDate === tomorrow);
  }

  static getTasksForDate(isoDate: string): Task[] {
    return TaskEngine.loadState().tasks.filter((t) => t.assignedDate === isoDate);
  }

  static getPlanGeneratedTime(): string | null {
    return TaskEngine.loadState().planGeneratedTime;
  }

  static getTaskById(id: string): Task | undefined {
    return TaskEngine.loadState().tasks.find((t) => t.id === id);
  }

  static addTask(input: Omit<Task, "id" | "completed" | "completedAt" | "rolloverCount"> & {
    completed?: boolean;
    completedAt?: string | null;
    rolloverCount?: number;
  }): Task {
    const state = TaskEngine.loadState();
    const task: Task = {
      ...input,
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      completed: input.completed ?? false,
      completedAt: input.completedAt ?? null,
      rolloverCount: input.rolloverCount ?? 0,
      status: input.completed ? "Completed" : input.status || "Pending",
      history: input.history || [{ date: formatLocalDate(), action: `Created by ${input.source}` }],
    };
    state.tasks.push(task);
    TaskEngine.saveState(state);
    return task;
  }

  static addTasksFromAI(tasks: Omit<Task, "id" | "completed" | "completedAt" | "rolloverCount">[]): Task[] {
    const created = tasks.map((t) =>
      TaskEngine.addTask({ ...t, source: t.source || "ai" })
    );
    const state = TaskEngine.loadState();
    if (created.length > 0 && !state.planGeneratedTime) {
      state.planGeneratedTime = formatLocalDateTime();
      TaskEngine.saveState(state);
    }
    return created;
  }

  static updateTask(id: string, updates: Partial<Task>): Task | null {
    const state = TaskEngine.loadState();
    const index = state.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;
    state.tasks[index] = { ...state.tasks[index], ...updates };
    TaskEngine.saveState(state);
    return state.tasks[index];
  }

  static deleteTask(id: string) {
    const state = TaskEngine.loadState();
    state.tasks = state.tasks.filter((t) => t.id !== id);
    TaskEngine.saveState(state);
  }

  static duplicateTask(id: string): Task | null {
    const original = TaskEngine.getTaskById(id);
    if (!original) return null;
    return TaskEngine.addTask({
      title: `${original.title} (Copy)`,
      description: original.description,
      category: original.category,
      assignedDate: original.assignedDate,
      dueDate: original.dueDate,
      priority: original.priority,
      estimatedDuration: original.estimatedDuration,
      source: original.source,
      startTime: original.startTime,
      endTime: original.endTime,
      subject: original.subject,
      reason: original.reason,
      status: "Pending",
    });
  }

  static toggleCompletion(id: string): Task | null {
    const state = TaskEngine.loadState();
    const index = state.tasks.findIndex((t) => t.id === id);
    if (index === -1) return null;

    const task = state.tasks[index];
    const now = new Date();
    const nowLocal = formatLocalDate(now);
    const nowDateTime = formatLocalDateTime(now);

    if (!task.completed) {
      task.completed = true;
      task.completedAt = nowDateTime;
      task.status = "Completed";
      task.history = [
        ...(task.history || []),
        { date: nowLocal, action: `Completed at ${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })}` },
      ];
    } else {
      task.completed = false;
      task.completedAt = null;
      task.status = task.rolloverCount > 0 ? "Rolled Over" : "Pending";
      task.history = [
        ...(task.history || []),
        { date: nowLocal, action: "Reopened / Marked Incomplete" },
      ];
    }

    state.tasks[index] = task;
    TaskEngine.saveState(state);
    return task;
  }

  static getCompletedCount(): number {
    return TaskEngine.loadState().tasks.filter((t) => t.completed).length;
  }

  static getPendingCount(): number {
    return TaskEngine.loadState().tasks.filter((t) => !t.completed).length;
  }

  static getTaskStatus(task: Task): NonNullable<Task["status"]> {
    return deriveStatus(task);
  }

  static clearAll() {
    TaskEngine.saveState(createEmptyState());
  }
}
