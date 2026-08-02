import React, { useState, useEffect } from "react";
import {
  StudyPlannerEngine,
  StudyTask,
  DayScheduleSummary,
  StudyStats,
} from "../services/studyPlannerEngine";
import { TaskEditModal } from "./StudyPlanner/TaskEditModal";
import { CalendarView } from "./StudyPlanner/CalendarView";
import { studyApi } from "../services/api";

const addDaysIso = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
};

export const StudyPlannerView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"Today" | "Tomorrow" | "This Week">("Today");
  const [viewMode, setViewMode] = useState<"Timeline" | "Calendar">("Timeline");

  // Pomodoro Focus Timer
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  // Data states
  const [todayTasks, setTodayTasks] = useState<StudyTask[]>([]);
  const [tomorrowTasks, setTomorrowTasks] = useState<StudyTask[]>([]);
  const [weekSummaries, setWeekSummaries] = useState<DayScheduleSummary[]>([]);
  const [stats, setStats] = useState<StudyStats>({
    todayStudyHours: 4.5,
    weekStudyHours: 22.5,
    completedTasks: 8,
    pendingTasks: 4,
    currentStreak: 5,
    longestStreak: 12,
    focusTimeMinutes: 145,
  });

  // Expandable week days state
  const [expandedWeekDays, setExpandedWeekDays] = useState<Record<string, boolean>>({});

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<StudyTask | null>(null);
  const [defaultModalDate, setDefaultModalDate] = useState<string>(new Date().toISOString().split("T")[0]);

  // Live Time
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  const refreshData = () => {
    setTodayTasks(StudyPlannerEngine.getTodaySchedule());
    setTomorrowTasks(StudyPlannerEngine.getTomorrowSchedule());
    setWeekSummaries(StudyPlannerEngine.getThisWeekSchedule());
    setStats(StudyPlannerEngine.getStats());
  };

  useEffect(() => {
    refreshData();
    const updateTime = () => {
      setCurrentTimeStr(
        new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pomodoro timer effect
  useEffect(() => {
    if (!timerActive) return;
    const id = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          clearInterval(id);
          setTimerActive(false);
          setTimerDone(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerActive]);

  const handleStartSprint = () => {
    if (!timerActive && timerSeconds === 25 * 60) {
      studyApi.logSprint(25).catch((err) => console.warn(err));
    }
    setTimerDone(false);
    setTimerActive(!timerActive);
  };

  // Toggle Task Completion & Sync with Performance Report
  const handleToggleComplete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    StudyPlannerEngine.toggleTaskCompletion(id);
    refreshData();
  };

  // Delete Task
  const handleDeleteTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    StudyPlannerEngine.deleteTask(id);
    refreshData();
  };

  // Duplicate Task
  const handleDuplicateTask = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    StudyPlannerEngine.duplicateTask(id);
    refreshData();
  };

  // Move Task to Date
  const handleMoveTaskDate = (id: string, newDateIso: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    StudyPlannerEngine.updateTask(id, { date: newDateIso, status: "Rolled Over", priority: "High" });
    refreshData();
  };

  // Edit Task
  const handleOpenEdit = (task: StudyTask, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTask(task);
    setModalOpen(true);
  };

  // Add Task
  const handleOpenAdd = (dateIso?: string) => {
    setEditingTask(null);
    setDefaultModalDate(dateIso || new Date().toISOString().split("T")[0]);
    setModalOpen(true);
  };

  const handleSaveModal = (data: any) => {
    if (data.id) {
      StudyPlannerEngine.updateTask(data.id, data);
    } else {
      StudyPlannerEngine.addTask(data);
    }
    refreshData();
  };

  const toggleWeekDayAccordion = (isoDate: string) => {
    setExpandedWeekDays((prev) => ({ ...prev, [isoDate]: !prev[isoDate] }));
  };

  // Priority Styles Helper
  const getPriorityBadgeStyle = (p: string) => {
    switch (p) {
      case "High":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "Medium":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "Low":
      default:
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
  };

  const getStatusBadgeStyle = (s: string) => {
    switch (s) {
      case "Completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Rolled Over":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "In Progress":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "Pending":
      default:
        return "bg-white/5 text-[#c7c4d8] border-white/10";
    }
  };

  const todayDateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. PAGE HEADER */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-6 bg-gradient-to-br from-[#1a1a2e]/80 via-[#16162a]/70 to-[#0f0f1b]/90 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-[#4f46e5]/20 border border-[#4f46e5]/40 text-[#c3c0ff] text-[11px] font-bold uppercase tracking-widest">
                AI Adaptive Scheduler
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold">
                Dynamic & Editable
              </span>
            </div>

            <h1 className="font-headline font-black text-3xl sm:text-4xl text-white tracking-tight">
              AI Study Planner
            </h1>
            <p className="text-xs text-[#c7c4d8] mt-1 max-w-xl">
              Plan, organize and optimize your learning schedule with AI. Synchronized in real time with your Performance Report.
            </p>
          </div>

          {/* View Switcher & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-2xl bg-white/5 border border-white/10">
              <button
                onClick={() => setViewMode("Timeline")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "Timeline"
                    ? "bg-[#4f46e5] text-white shadow-md"
                    : "text-[#c7c4d8] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-xs">view_timeline</span>
                <span>Timeline</span>
              </button>

              <button
                onClick={() => setViewMode("Calendar")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === "Calendar"
                    ? "bg-[#4f46e5] text-white shadow-md"
                    : "text-[#c7c4d8] hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-xs">calendar_month</span>
                <span>Calendar</span>
              </button>
            </div>

            <button
              onClick={() => handleOpenAdd()}
              className="px-4 py-2.5 rounded-2xl bg-[#4f46e5] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#4f46e5]/30 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Live Header Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">Today's Date</span>
            <p className="text-xs font-bold text-white">{todayDateStr}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">Current Time</span>
            <p className="text-xs font-bold text-white font-mono">{currentTimeStr || "6:17 AM"}</p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">Study Streak</span>
            <p className="text-xs font-bold text-amber-300 flex items-center gap-1">
              <span>{stats.currentStreak} Days</span>
              <span>🔥</span>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-0.5">
            <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">Upcoming Exam</span>
            <p className="text-xs font-bold text-rose-300 flex items-center gap-1 truncate">
              <span>OS Mid-Term in 2 Days</span>
              <span>⏳</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. STUDY STATISTICS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
          <span className="text-[10px] text-[#c7c4d8] uppercase font-bold block">Today's Hours</span>
          <p className="text-xl font-headline font-black text-white">{stats.todayStudyHours}h</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
          <span className="text-[10px] text-[#c7c4d8] uppercase font-bold block">Week's Hours</span>
          <p className="text-xl font-headline font-black text-white">{stats.weekStudyHours}h</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
          <span className="text-[10px] text-emerald-400 uppercase font-bold block">Completed</span>
          <p className="text-xl font-headline font-black text-emerald-400">{stats.completedTasks}</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
          <span className="text-[10px] text-amber-400 uppercase font-bold block">Pending</span>
          <p className="text-xl font-headline font-black text-amber-400">{stats.pendingTasks}</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
          <span className="text-[10px] text-[#c3c0ff] uppercase font-bold block">Current Streak</span>
          <p className="text-xl font-headline font-black text-white">{stats.currentStreak}d</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-1 text-center">
          <span className="text-[10px] text-[#c7c4d8] uppercase font-bold block">Longest Streak</span>
          <p className="text-xl font-headline font-black text-white">{stats.longestStreak}d</p>
        </div>

        <div className="p-3.5 rounded-2xl glass-card border border-white/10 space-y-1 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] text-cyan-400 uppercase font-bold block">Focus Time</span>
          <p className="text-xl font-headline font-black text-cyan-300">{stats.focusTimeMinutes}m</p>
        </div>
      </div>

      {/* 3. AI SUGGESTION BANNER */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#4f46e5]/20 via-purple-500/10 to-[#4f46e5]/20 border border-[#4f46e5]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#4f46e5]/30 text-[#c3c0ff] border border-[#4f46e5]/50 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider">AI Schedule Optimization</span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed font-medium mt-0.5">
              "You focus better between 7 PM and 9 PM. We've optimized your DSA practice session for 8:15 PM to maximize learning discipline."
            </p>
          </div>
        </div>

        <button
          onClick={() => refreshData()}
          className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 shrink-0 self-start sm:self-auto"
        >
          Auto-Optimize Schedule
        </button>
      </div>

      {/* 4. MAIN LAYOUT: TAB SCHEDULES vs CALENDAR VIEW */}
      {viewMode === "Calendar" ? (
        <CalendarView
          weekSummaries={weekSummaries}
          onSelectTask={(task) => handleOpenEdit(task)}
          onAddTask={(dateIso) => handleOpenAdd(dateIso)}
        />
      ) : (
        <div className="space-y-6">
          {/* Day Tabs Bar */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3">
            {(["Today", "Tomorrow", "This Week"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === tab
                    ? "bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/30"
                    : "bg-white/5 text-[#c7c4d8] border border-white/10 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB 1: TODAY SCHEDULE */}
          {activeTab === "Today" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pomodoro Focus Timer Card */}
              <div
                className={`glass-card p-6 rounded-3xl border text-center space-y-6 flex flex-col justify-between transition-all duration-500 bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f1b]/90 ${
                  timerDone ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10"
                }`}
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-3 transition-colors ${
                      timerDone ? "bg-emerald-500/20 text-emerald-400" : "bg-cyan-500/20 text-cyan-400"
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">{timerDone ? "check_circle" : "timer"}</span>
                  </div>
                  <h3 className="font-headline font-bold text-xl text-white">Focus Sprint Timer</h3>
                  <p className={`text-xs ${timerDone ? "text-emerald-400 font-semibold" : "text-[#c7c4d8]"}`}>
                    {timerDone ? "🎉 Sprint Complete! +5 Focus Points logged!" : "25 Min Deep Work Session"}
                  </p>
                </div>

                <div className="my-4">
                  <span
                    className={`font-mono font-black text-6xl tracking-widest transition-colors ${
                      timerDone ? "text-emerald-400" : timerActive ? "text-cyan-300" : "text-white"
                    }`}
                  >
                    {Math.floor(timerSeconds / 60)
                      .toString()
                      .padStart(2, "0")}
                    :
                    {(timerSeconds % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleStartSprint}
                    className="px-6 py-2.5 rounded-xl bg-[#4f46e5] text-white font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#4f46e5]/30"
                  >
                    {timerActive ? "Pause Sprint" : "Start Sprint"}
                  </button>
                  <button
                    onClick={() => {
                      setTimerActive(false);
                      setTimerDone(false);
                      setTimerSeconds(25 * 60);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#c7c4d8] hover:text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Today's Schedule Cards List */}
              <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 lg:col-span-2 space-y-5 bg-gradient-to-br from-[#1a1a2e]/70 via-[#16162a]/60 to-[#0f0f1b]/80 backdrop-blur-xl">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div>
                    <h3 className="font-headline font-bold text-xl text-white">Today's Schedule</h3>
                    <p className="text-xs text-[#c7c4d8] mt-0.5">
                      {todayTasks.length} schedule item(s) calibrated for today
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenAdd()}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#c3c0ff] hover:text-white"
                  >
                    + Add Task
                  </button>
                </div>

                <div className="space-y-3.5">
                  {todayTasks.map((slot) => {
                    const isDone = slot.status === "Completed";

                    return (
                      <div
                        key={slot.id}
                        onClick={() => handleOpenEdit(slot)}
                        className={`p-4 md:p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                          isDone
                            ? "bg-emerald-500/5 border-emerald-500/30 opacity-80"
                            : "bg-white/5 border-white/10 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-4">
                          {/* Complete Checkbox */}
                          <div
                            onClick={(e) => handleToggleComplete(slot.id, e)}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 sm:mt-0 ${
                              isDone
                                ? "bg-emerald-500 text-black shadow-lg font-black text-sm"
                                : "border-2 border-white/30 group-hover:border-[#c3c0ff] text-transparent"
                            }`}
                          >
                            ✓
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-xs text-[#c3c0ff] font-bold bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                                {slot.startTime} – {slot.endTime}
                              </span>
                              <h4 className={`font-bold text-sm text-white ${isDone ? "line-through text-emerald-300/80" : ""}`}>
                                {slot.title}
                              </h4>
                            </div>

                            <p className="text-xs text-[#c7c4d8]">
                              Subject: <strong className="text-white font-medium">{slot.subject}</strong> • {slot.description}
                            </p>
                          </div>
                        </div>

                        {/* Metadata & Actions */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pl-10 sm:pl-0">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getPriorityBadgeStyle(slot.priority)}`}>
                            {slot.priority}
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(slot.status)}`}>
                            {slot.status}
                          </span>

                          {/* Actions Menu */}
                          <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
                            <button
                              onClick={(e) => handleMoveTaskDate(slot.id, addDaysIso(1), e)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-[#c7c4d8] hover:text-white"
                              title="Move to Tomorrow"
                            >
                              <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                            <button
                              onClick={(e) => handleDuplicateTask(slot.id, e)}
                              className="p-1.5 rounded-lg hover:bg-white/10 text-[#c7c4d8] hover:text-white"
                              title="Duplicate Task"
                            >
                              <span className="material-symbols-outlined text-xs">content_copy</span>
                            </button>
                            <button
                              onClick={(e) => handleDeleteTask(slot.id, e)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300"
                              title="Delete Task"
                            >
                              <span className="material-symbols-outlined text-xs">delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TOMORROW SCHEDULE */}
          {activeTab === "Tomorrow" && (
            <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-5 bg-gradient-to-br from-[#1a1a2e]/70 via-[#16162a]/60 to-[#0f0f1b]/80 backdrop-blur-xl">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                  <h3 className="font-headline font-bold text-xl text-white">Tomorrow's Schedule</h3>
                  <p className="text-xs text-[#c7c4d8] mt-0.5">
                    Automatically generated schedule including uncompleted tasks carried over from today
                  </p>
                </div>
                <button
                  onClick={() => handleOpenAdd(addDaysIso(1))}
                  className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-[#c3c0ff] hover:text-white"
                >
                  + Add Task to Tomorrow
                </button>
              </div>

              <div className="space-y-3.5">
                {tomorrowTasks.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#c7c4d8]">No tasks scheduled for tomorrow yet.</div>
                ) : (
                  tomorrowTasks.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => handleOpenEdit(slot)}
                      className="p-4 md:p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                    >
                      <div className="flex items-start sm:items-center gap-4">
                        <div
                          onClick={(e) => handleToggleComplete(slot.id, e)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 sm:mt-0 ${
                            slot.status === "Completed"
                              ? "bg-emerald-500 text-black shadow-lg font-black text-sm"
                              : "border-2 border-white/30 group-hover:border-[#c3c0ff] text-transparent"
                          }`}
                        >
                          ✓
                        </div>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs text-[#c3c0ff] font-bold bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
                              {slot.startTime} – {slot.endTime}
                            </span>
                            <h4 className="font-bold text-sm text-white">{slot.title}</h4>

                            {slot.status === "Rolled Over" && (
                              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                Rolled Over from Today
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#c7c4d8]">
                            Subject: <strong className="text-white font-medium">{slot.subject}</strong> • {slot.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto pl-10 sm:pl-0">
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getPriorityBadgeStyle(slot.priority)}`}>
                          {slot.priority}
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${getStatusBadgeStyle(slot.status)}`}>
                          {slot.status}
                        </span>

                        <div className="flex items-center gap-1 ml-2 border-l border-white/10 pl-2">
                          <button
                            onClick={(e) => handleMoveTaskDate(slot.id, new Date().toISOString().split("T")[0], e)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-[#c7c4d8] hover:text-white"
                            title="Move to Today"
                          >
                            <span className="material-symbols-outlined text-xs">arrow_back</span>
                          </button>
                          <button
                            onClick={(e) => handleDeleteTask(slot.id, e)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300"
                            title="Delete Task"
                          >
                            <span className="material-symbols-outlined text-xs">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THIS WEEK (7-DAY ACCORDION SCHEDULE) */}
          {activeTab === "This Week" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="font-headline font-bold text-xl text-white">7-Day Weekly Schedule</h3>
                <span className="text-xs text-[#c7c4d8]">Expand any day to view & edit detailed items</span>
              </div>

              {weekSummaries.map((day) => {
                const isExpanded = expandedWeekDays[day.isoDate];

                return (
                  <div
                    key={day.isoDate}
                    className={`glass-card rounded-3xl border transition-all ${
                      day.isToday ? "border-[#4f46e5]/50 bg-[#4f46e5]/5" : "border-white/10"
                    }`}
                  >
                    {/* Day Summary Accordion Bar */}
                    <div
                      onClick={() => toggleWeekDayAccordion(day.isoDate)}
                      className="p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-headline font-bold text-sm text-[#c3c0ff]">
                          {day.dayName.slice(0, 3)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline font-bold text-lg text-white">{day.dayName}</h4>
                            <span className="text-xs text-[#c7c4d8] font-mono">{day.dateStr}</span>
                            {day.isToday && (
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#4f46e5]/20 text-[#c3c0ff] border border-[#4f46e5]/40">
                                Today
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Day Stats Badges */}
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold text-white bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                          {day.tasks.length} Tasks
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                          {day.totalHours} Study Hours
                        </span>

                        {day.assignmentsCount > 0 && (
                          <span className="text-xs font-semibold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20">
                            {day.assignmentsCount} Assignment(s)
                          </span>
                        )}

                        <span className="material-symbols-outlined text-base text-[#c7c4d8]">
                          {isExpanded ? "expand_less" : "expand_more"}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Day Tasks */}
                    {isExpanded && (
                      <div className="p-5 border-t border-white/10 space-y-3 bg-black/20">
                        <div className="flex justify-between items-center pb-2">
                          <span className="text-xs font-bold text-[#c3c0ff] uppercase tracking-wider">
                            Detailed Schedule for {day.dayName} ({day.dateStr})
                          </span>
                          <button
                            onClick={() => handleOpenAdd(day.isoDate)}
                            className="text-xs text-[#c3c0ff] hover:underline"
                          >
                            + Add Task to {day.dayName}
                          </button>
                        </div>

                        {day.tasks.length === 0 ? (
                          <div className="py-4 text-center text-xs text-[#c7c4d8]">No tasks scheduled for this day.</div>
                        ) : (
                          day.tasks.map((slot) => (
                            <div
                              key={slot.id}
                              onClick={() => handleOpenEdit(slot)}
                              className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-xs text-[#c3c0ff] font-bold">{slot.startTime}</span>
                                <div>
                                  <h5 className="font-bold text-xs text-white">{slot.title}</h5>
                                  <p className="text-[11px] text-[#c7c4d8]">{slot.subject}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityBadgeStyle(slot.priority)}`}>
                                  {slot.priority}
                                </span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadgeStyle(slot.status)}`}>
                                  {slot.status}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. FLOATING ADD TASK BUTTON */}
      <button
        onClick={() => handleOpenAdd()}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-[#4f46e5] text-white flex items-center justify-center shadow-2xl shadow-[#4f46e5]/50 hover:scale-110 active:scale-95 transition-all border border-white/20"
        title="Add New Study Task"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      {/* 6. ADD/EDIT TASK MODAL */}
      <TaskEditModal
        isOpen={modalOpen}
        task={editingTask}
        defaultDate={defaultModalDate}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveModal}
      />
    </div>
  );
};
