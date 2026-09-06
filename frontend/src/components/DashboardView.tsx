import React, { useState, useEffect } from "react";
import { NavTab, TimelineEvent } from "../types";
import { dashboardApi } from "../services/api";
import { useAppData } from "../context/AppDataContext";
import { DashboardHeader } from "./DashboardHeader";
import { TodayMissionCard } from "./TodayMissionCard";
import { FocusActivityCard } from "./FocusActivityCard";
import { HorizonEventsCard } from "./HorizonEventsCard";
import { NearbyEssentialsCard } from "./NearbyEssentialsCard";

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenAskAi: () => void;
}

const LS_EVENTS_KEY = "compass_timeline_events";

const DEFAULT_EVENTS: TimelineEvent[] = [
  { id: "e1", title: "Operating Systems Mid-Term", location: "Hall 302 • 10:00 AM", dueText: "In 2 Days", badgeColor: "error" },
  { id: "e2", title: "TechFest Hackathon Deadline", location: "Online Submission", dueText: "Next Week", badgeColor: "primary" },
  { id: "e3", title: "Cloud Arch Project Demo", location: "Lab B • 02:30 PM", dueText: "Aug 12", badgeColor: "secondary" },
];

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab, onOpenAskAi }) => {
  const { budgetSummary, intelligenceScore, scoreTrend, profile, isLoading, todayTasks, toggleTask, addTask } = useAppData();

  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() => {
    try { const saved = localStorage.getItem(LS_EVENTS_KEY); return saved ? JSON.parse(saved) : DEFAULT_EVENTS; }
    catch { return DEFAULT_EVENTS; }
  });

  const [dashboardData, setDashboardData] = useState<any>(null);

  const userName = dashboardData?.user_name || profile?.displayName || "Student";
  const budgetRemaining = dashboardData?.budget_overview?.remaining_budget ?? budgetSummary?.remainingBudget;
  const budgetUtilization = budgetSummary?.budgetUtilization ?? 0;

  useEffect(() => {
    async function loadDashboardExtras() {
      try {
        const data = await dashboardApi.getDashboard();
        setDashboardData(data);
        if (data.timeline_events?.length && !localStorage.getItem(LS_EVENTS_KEY)) {
          setTimelineEvents(data.timeline_events);
        }
      } catch (err) {
        console.warn("Using fallback state for Dashboard:", err);
      }
    }
    loadDashboardExtras();
  }, []);

  const handleAddTask = (title: string) => {
    const today = new Date().toISOString().split("T")[0];
    addTask({
      title,
      description: "",
      category: "Custom",
      assignedDate: today,
      dueDate: today,
      priority: "Medium",
      estimatedDuration: "30 mins",
      source: "user",
    });
  };

  const academic = dashboardData?.academic_overview;
  const career = dashboardData?.career_overview;
  const study = dashboardData?.study_overview;
  const placement = dashboardData?.placement_overview;
  const risk = dashboardData?.risk_overview;
  const aiRecs = dashboardData?.ai_recommendations;

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      <DashboardHeader userName={userName} setActiveTab={setActiveTab} onOpenAskAi={onOpenAskAi} />

      {/* Row 1: Intelligence Score + Today's Mission + Budget Runway */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div onClick={() => setActiveTab("intelligence-score")} className="glass-card-interactive p-6 rounded-2xl border border-white/10 flex flex-col justify-between cursor-pointer group">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c3c0ff]">PERFORMANCE SCORE</span>
              {isLoading || intelligenceScore === null ? (
                <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse mt-1" />
              ) : (
                <h2 className="font-headline font-black text-4xl text-white mt-1">{intelligenceScore}%</h2>
              )}
            </div>
            {!isLoading && scoreTrend && (
              <div className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                <span>{scoreTrend}</span>
              </div>
            )}
          </div>
          <div className="my-4 space-y-2">
            <div className="flex justify-between text-xs text-[#c7c4d8]">
              <span>Efficiency Index</span>
              {isLoading || intelligenceScore === null ? (
                <span className="font-semibold text-[#c7c4d8]">Loading…</span>
              ) : (
                <span className="font-semibold text-white">Optimal ({intelligenceScore}/100)</span>
              )}
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              {intelligenceScore !== null && (
                <div style={{ width: `${intelligenceScore}%` }} className="h-full bg-gradient-to-r from-[#4f46e5] to-[#c3c0ff] rounded-full"></div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-[#c3c0ff] pt-2 border-t border-white/5">
            <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">analytics</span><span>View Report</span></span>
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </div>
        </div>

        <TodayMissionCard
          tasks={todayTasks}
          toggleTask={toggleTask}
          addTask={handleAddTask}
          onOpenStudyPlanner={() => setActiveTab("study-planner")}
          onOpenAskAi={onOpenAskAi}
        />

        <div onClick={() => setActiveTab("budget")} className="glass-card-interactive p-6 rounded-2xl border border-white/10 space-y-4 cursor-pointer">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">payments</span>
              <h3 className="font-headline font-bold text-lg text-white">Budget Runway</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              {risk?.financial_risk ? `${risk.financial_risk} Risk` : "Healthy"}
            </span>
          </div>
          <div className="space-y-1">
            {isLoading || budgetRemaining === undefined ? (
              <div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-headline font-black text-white">₹{budgetRemaining?.toLocaleString()}</p>
            )}
            <p className="text-xs text-[#c7c4d8]">
              Remaining of ₹{dashboardData?.budget_overview?.monthly_budget?.toLocaleString() || "5,000"} Budget
            </p>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.max(0, 100 - budgetUtilization)}%` }}
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
            />
          </div>
          <button className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-[#c3c0ff]">Manage Expenses</button>
        </div>
      </div>

      {/* Row 2: Personalized Academic Overview & Career / Placement Cockpit */}
      {academic && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Overview Card */}
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#c3c0ff]">school</span>
                <h3 className="font-headline font-bold text-lg text-white">Academic Standing</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-[#4f46e5]/10 border border-[#4f46e5]/20 text-[#c3c0ff] font-semibold">
                {academic.year}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-center">
                <span className="text-[10px] uppercase text-[#c7c4d8] font-bold">CGPA</span>
                <p className="text-lg font-mono font-bold text-white">{academic.cgpa}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-center">
                <span className="text-[10px] uppercase text-[#c7c4d8] font-bold">Year</span>
                <p className="text-sm font-semibold text-white truncate">{academic.year}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-center">
                <span className="text-[10px] uppercase text-[#c7c4d8] font-bold">Branch</span>
                <p className="text-sm font-semibold text-white truncate" title={academic.branch}>{academic.branch}</p>
              </div>
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-1 text-center">
                <span className="text-[10px] uppercase text-[#c7c4d8] font-bold">Backlogs</span>
                <p className={`text-lg font-mono font-bold ${academic.backlogs > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  {academic.backlogs}
                </p>
              </div>
            </div>

            {study && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1.5">
                <div className="flex justify-between items-center text-[#c7c4d8]">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-sm text-cyan-400">timer</span>
                    Daily Study Target: <strong className="text-white">{study.study_hours} hrs</strong>
                  </span>
                  <span className="text-amber-300 font-medium">
                    Weak: {study.weak_subjects?.[0] || "None"}
                  </span>
                </div>
                <p className="text-[11px] text-[#918fa1] italic">
                  💡 {study.suggested_study_plan}
                </p>
              </div>
            )}
          </div>

          {/* Career & Placement Readiness Card */}
          {career && (
            <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-gradient-to-br from-white/[0.03] to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-400">target</span>
                  <h3 className="font-headline font-bold text-lg text-white">Career & Placement Pathway</h3>
                </div>
                {placement && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                    {placement.placement_level} Level
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs text-[#c7c4d8]">
                  <span>Goal: <strong className="text-white">{career.career_goal}</strong></span>
                  <span>Target: <strong className="text-[#c3c0ff]">{career.target_role}</strong></span>
                </div>

                <div>
                  <span className="text-[11px] text-[#c7c4d8] font-medium block mb-1.5">Recommended Skills for Target Role:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {career.recommended_skills?.map((sk: string) => (
                      <span key={sk} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg text-[11px] text-[#c3c0ff]">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {risk && (
                  <div className="pt-2 flex items-center justify-between border-t border-white/5 text-xs text-[#c7c4d8]">
                    <span className="flex items-center gap-1">
                      Academic Risk: <strong className={`font-semibold ${risk.academic_risk === "High" ? "text-red-400" : (risk.academic_risk === "Moderate" ? "text-amber-400" : "text-emerald-400")}`}>{risk.academic_risk}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      Placement Readiness: <strong className="text-white font-semibold">{risk.placement_risk}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Row 3: Focus Activity + Horizon Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FocusActivityCard />
        <HorizonEventsCard events={timelineEvents} setActiveTab={setActiveTab} />
      </div>

      {/* Row 4: AI Recommendations & Personalized Next Actions + Nearby Essentials */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#4f46e5]/20 text-[#c3c0ff] flex items-center justify-center">
              <span className="material-symbols-outlined text-lg fill-1">auto_awesome</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-white">AI Personalized Insights</h3>
          </div>

          {aiRecs && aiRecs.length > 0 ? (
            <div className="space-y-2">
              {aiRecs.map((rec: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-[#c7c4d8] flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-sm text-[#c3c0ff] mt-0.5">tips_and_updates</span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div onClick={() => setActiveTab("study-planner")} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-cyan-300">school</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Study Flashcards</h4>
                    <p className="text-[11px] text-[#c7c4d8]">Focus Block • 15 Mins</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm text-[#c3c0ff]">chevron_right</span>
              </div>
              <div onClick={() => setActiveTab("career-mentor")} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#c3c0ff]">work</span>
                  <div>
                    <h4 className="text-xs font-bold text-white">Role Readiness Check</h4>
                    <p className="text-[11px] text-[#c7c4d8]">Explore matches for your target role</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm text-[#c3c0ff]">chevron_right</span>
              </div>
            </div>
          )}
        </div>

        <NearbyEssentialsCard setActiveTab={setActiveTab} />
      </div>
    </div>
  );
};
