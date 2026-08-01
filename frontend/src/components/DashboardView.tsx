import React, { useState, useEffect } from "react";
import { NavTab, MissionTask, TimelineEvent } from "../types";
import { dashboardApi } from "../services/api";

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenAskAi: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenAskAi,
}) => {
  const [tasks, setTasks] = useState<MissionTask[]>([
    { id: "1", title: "Complete DBMS Lab Assignment 4", completed: false, category: "Academic" },
    { id: "2", title: "Solve 2 DSA Problems on LeetCode", completed: true, category: "Career" },
    { id: "3", title: "Keep daily hostel spend below ₹150", completed: false, category: "Budget" },
    { id: "4", title: "Submit application for Stripe Intern", completed: true, category: "Placement" },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  const [weeklyFilter, setWeeklyFilter] = useState<"week" | "month">("week");

  const [userName, setUserName] = useState("Murali");
  const [intelligenceScore, setIntelligenceScore] = useState(84);
  const [scoreTrend, setScoreTrend] = useState("+6%");
  const [budgetRemaining, setBudgetRemaining] = useState(1640);
  const [budgetLimit, setBudgetLimit] = useState(200);
  const [academicIndex, setAcademicIndex] = useState(72);
  const [placementOdds, setPlacementOdds] = useState(68);

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([
    {
      id: "e1",
      title: "Operating Systems Mid-Term",
      location: "Hall 302 • 10:00 AM",
      dueText: "In 2 Days",
      badgeColor: "error",
    },
    {
      id: "e2",
      title: "TechFest Hackathon Deadline",
      location: "Online Submission",
      dueText: "Next Week",
      badgeColor: "primary",
    },
    {
      id: "e3",
      title: "Cloud Arch Project Demo",
      location: "Lab B • 02:30 PM",
      dueText: "Apr 12",
      badgeColor: "secondary",
    },
  ]);

  const [rhythmActivity, setRhythmActivity] = useState<any[]>([
    { day: "Mon", val: 65, label: "2.5h" },
    { day: "Tue", val: 80, label: "3.2h" },
    { day: "Wed", val: 45, label: "1.8h" },
    { day: "Thu", val: 90, label: "4.0h" },
    { day: "Fri", val: 75, label: "3.0h" },
    { day: "Sat", val: 30, label: "1.0h" },
    { day: "Sun", val: 60, label: "2.2h" },
  ]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const data = await dashboardApi.getDashboard();
        if (data.user_name) setUserName(data.user_name);
        if (data.intelligence_score) setIntelligenceScore(data.intelligence_score);
        if (data.score_trend) setScoreTrend(data.score_trend);
        if (data.remaining_budget) setBudgetRemaining(data.remaining_budget);
        if (data.daily_budget_limit) setBudgetLimit(data.daily_budget_limit);
        if (data.academic_index) setAcademicIndex(data.academic_index);
        if (data.placement_odds) setPlacementOdds(data.placement_odds);
        if (data.tasks && data.tasks.length > 0) setTasks(data.tasks);
        if (data.timeline_events && data.timeline_events.length > 0) setTimelineEvents(data.timeline_events);
        if (data.rhythm_activity && data.rhythm_activity.length > 0) setRhythmActivity(data.rhythm_activity);
      } catch (err) {
        console.warn("Using fallback live state for Dashboard:", err);
      }
    }
    loadDashboardData();
  }, []);

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: Date.now().toString(), title: newTaskTitle, completed: false, category: "Custom" },
    ]);
    setNewTaskTitle("");
    setShowAddTask(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Greeting Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-white/5 via-white/[0.02] to-transparent p-6 rounded-2xl border border-white/10">
        <div>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-[#e5e2e3] flex items-center gap-2">
            <span>Good Morning {userName}</span>
            <span className="text-2xl animate-bounce">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#c7c4d8] mt-1">
            Your student performance index is up this week. You're in the top 15% of your cohort.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab("study-planner")}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-[#e5e2e3] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">calendar_month</span>
            <span>Adjust Schedule</span>
          </button>
          <button
            onClick={onOpenAskAi}
            className="px-4 py-2 rounded-xl bg-[#4f46e5] text-white text-xs font-bold hover:brightness-110 transition-all flex items-center gap-1.5 shadow-lg shadow-[#4f46e5]/25"
          >
            <span className="material-symbols-outlined text-sm fill-1">auto_awesome</span>
            <span>Quick AI Insight</span>
          </button>
        </div>
      </div>

      {/* Main Grid Row 1: Intelligence Score + Today's Mission + Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Intelligence Score Card */}
        <div
          onClick={() => setActiveTab("intelligence-score")}
          className="glass-card-interactive p-6 rounded-2xl border border-white/10 relative overflow-hidden cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c3c0ff]">
                COMPOSITE SCORE
              </span>
              <h2 className="font-headline font-black text-4xl text-white mt-1">{intelligenceScore}%</h2>
            </div>
            <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              <span>{scoreTrend}</span>
            </div>
          </div>

          <div className="my-6 space-y-2">
            <div className="flex justify-between text-xs text-[#c7c4d8]">
              <span>Efficiency Index</span>
              <span className="font-semibold text-white">Optimal ({intelligenceScore}/100)</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${intelligenceScore}%` }}
                className="h-full bg-gradient-to-r from-[#4f46e5] to-[#c3c0ff] rounded-full transition-all duration-500"
              ></div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#c3c0ff] pt-2 border-t border-white/5">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">analytics</span>
              <span>View Intelligence Report</span>
            </span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </div>
        </div>

        {/* Today's Mission Checklist */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">task_alt</span>
              <h3 className="font-headline font-bold text-lg text-white">Today's Mission</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#c7c4d8]">
                {completedCount}/{tasks.length} Done
              </span>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-[#c3c0ff]"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          </div>

          {showAddTask && (
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="New daily task..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#4f46e5]"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#4f46e5] text-white text-xs font-bold rounded-lg hover:brightness-110"
              >
                Add
              </button>
            </form>
          )}

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  task.completed
                    ? "bg-white/[0.02] border-white/5 text-[#c7c4d8]/60 line-through"
                    : "bg-white/5 border-white/10 text-white hover:border-[#4f46e5]/40"
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      task.completed
                        ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                        : "border-white/30"
                    }`}
                  >
                    {task.completed && <span className="material-symbols-outlined text-[10px]">check</span>}
                  </div>
                  <span>{task.title}</span>
                </div>
                {task.category && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#c7c4d8]">
                    {task.category}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Budget Tracker */}
        <div
          onClick={() => setActiveTab("budget")}
          className="glass-card-interactive p-6 rounded-2xl border border-white/10 space-y-4 cursor-pointer"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">payments</span>
              <h3 className="font-headline font-bold text-lg text-white">Budget Runway</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              Healthy
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-2xl font-headline font-black text-white">₹{budgetRemaining.toLocaleString()}</p>
            <p className="text-xs text-[#c7c4d8]">Remaining for Month • Cap: ₹{budgetLimit}/day</p>
          </div>

          <div className="space-y-1.5">
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full w-[62%]"></div>
            </div>
            <p className="text-[10px] text-[#c7c4d8] text-right">₹120 below average spending this week</p>
          </div>

          <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-[#c3c0ff] transition-colors">
            Manage Expenses & Savings Goal
          </button>
        </div>
      </div>

      {/* Row 2: Visual Gauges + Focus Heatmap + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Donut Gauges */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-6">
          <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3c0ff]">speed</span>
            <span>Readiness Metrics</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Donut 1: Academic */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center space-y-2">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#4f46e5]"
                    strokeDasharray={`${academicIndex}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-sm text-white">{academicIndex}%</span>
              </div>
              <p className="text-xs font-semibold text-[#e5e2e3]">Academic Index</p>
              <p className="text-[10px] text-[#c7c4d8]">GPA Target: 3.88</p>
            </div>

            {/* Donut 2: Placement */}
            <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center space-y-2">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#c3c0ff]"
                    strokeDasharray={`${placementOdds}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute font-bold text-sm text-white">{placementOdds}%</span>
              </div>
              <p className="text-xs font-semibold text-[#e5e2e3]">Placement Odds</p>
              <p className="text-[10px] text-[#c7c4d8]">Target: AI Eng</p>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-[#c7c4d8]">Career Readiness Level</span>
              <span className="font-bold text-[#c3c0ff]">Level 4 / 5</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#4f46e5] to-cyan-400 rounded-full w-[80%]"></div>
            </div>
          </div>
        </div>

        {/* Focus Activity Heatmap */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">grid_on</span>
              <span>Focus Activity</span>
            </h3>
            <span className="text-xs text-[#c7c4d8]">Last 30 Days</span>
          </div>

          <p className="text-xs text-[#c7c4d8]">Consistent 2.4 hrs daily deep study recorded.</p>

          <div className="grid grid-cols-10 gap-1.5 pt-2">
            {Array.from({ length: 40 }).map((_, i) => {
              const intensity = (i * 7 + 3) % 5;
              const bgClass =
                intensity === 0
                  ? "bg-white/5 border-white/5"
                  : intensity === 1
                  ? "bg-[#4f46e5]/30 border-[#4f46e5]/20"
                  : intensity === 2
                  ? "bg-[#4f46e5]/60 border-[#4f46e5]/40"
                  : intensity === 3
                  ? "bg-[#4f46e5] border-[#4f46e5]"
                  : "bg-[#c3c0ff] border-[#c3c0ff]";
              return (
                <div
                  key={i}
                  title={`Day ${i + 1}: ${intensity * 45} mins focused study`}
                  className={`h-6 rounded border transition-transform hover:scale-125 ${bgClass}`}
                ></div>
              );
            })}
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#c7c4d8] pt-2">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded bg-white/5"></div>
              <div className="w-2.5 h-2.5 rounded bg-[#4f46e5]/30"></div>
              <div className="w-2.5 h-2.5 rounded bg-[#4f46e5]/60"></div>
              <div className="w-2.5 h-2.5 rounded bg-[#4f46e5]"></div>
              <div className="w-2.5 h-2.5 rounded bg-[#c3c0ff]"></div>
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Timeline Horizon */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">timeline</span>
              <span>Horizon Events</span>
            </h3>
            <button
              onClick={() => setActiveTab("study-planner")}
              className="text-xs text-[#c3c0ff] hover:underline"
            >
              Full Calendar
            </button>
          </div>

          <div className="space-y-3">
            {timelineEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between"
              >
                <div>
                  <h4 className="font-semibold text-xs text-white">{evt.title}</h4>
                  <p className="text-[11px] text-[#c7c4d8]">{evt.location}</p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    evt.badgeColor === "error"
                      ? "bg-red-500/20 text-red-300 border border-red-500/30"
                      : evt.badgeColor === "primary"
                      ? "bg-[#4f46e5]/20 text-[#c3c0ff] border border-[#4f46e5]/30"
                      : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  }`}
                >
                  {evt.dueText}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: AI Recommended Actions + Weekly Rhythm */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Recommended Actions */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4f46e5]/20 text-[#c3c0ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg fill-1">auto_awesome</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-white">AI Recommended Next Actions</h3>
          </div>

          <div className="space-y-3">
            <div
              onClick={() => setActiveTab("study-planner")}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">school</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Study Flashcards: Operating Systems</h4>
                  <p className="text-[11px] text-[#c7c4d8]">Memory Management & Virtualization • 15 Mins</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-sm text-[#c3c0ff]">chevron_right</span>
            </div>

            <div
              onClick={() => setActiveTab("career-mentor")}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#4f46e5]/20 text-[#c3c0ff] flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">work</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Apply: Junior Dev at Stripe</h4>
                  <p className="text-[11px] text-[#c7c4d8]">92% Match with your Python & API profile</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-sm text-[#c3c0ff]">chevron_right</span>
            </div>

            <div
              onClick={() => setActiveTab("budget")}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <span className="material-symbols-outlined text-lg">savings</span>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Optimization Insight: Hostel Canteen</h4>
                  <p className="text-[11px] text-[#c7c4d8]">Saved ₹400 by avoiding late food deliveries</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-sm text-[#c3c0ff]">chevron_right</span>
            </div>
          </div>
        </div>

        {/* Weekly Activity Rhythm Interactive Chart */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#c3c0ff]">bar_chart</span>
              <span>Activity Rhythm</span>
            </h3>
            <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 text-[10px]">
              <button
                onClick={() => setWeeklyFilter("week")}
                className={`px-3 py-1 rounded-md transition-all ${
                  weeklyFilter === "week"
                    ? "bg-[#4f46e5] text-white font-bold"
                    : "text-[#c7c4d8] hover:text-white"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setWeeklyFilter("month")}
                className={`px-3 py-1 rounded-md transition-all ${
                  weeklyFilter === "month"
                    ? "bg-[#4f46e5] text-white font-bold"
                    : "text-[#c7c4d8] hover:text-white"
                }`}
              >
                Month
              </button>
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
            {rhythmActivity.map((bar: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-black/80 px-2 py-1 rounded text-[10px] text-white transition-opacity whitespace-nowrap z-10 border border-white/10">
                  {bar.label}
                </div>
                <div className="w-full bg-white/5 rounded-t-lg h-32 flex items-end overflow-hidden p-1">
                  <div
                    style={{ height: `${bar.val}%` }}
                    className="w-full bg-gradient-to-t from-[#4f46e5] to-[#c3c0ff] rounded-t transition-all duration-500 group-hover:brightness-125"
                  ></div>
                </div>
                <span className="text-[10px] font-medium text-[#c7c4d8]">{bar.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
