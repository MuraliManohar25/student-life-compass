import React, { useState, useEffect, useCallback } from 'react';
import { StudentSpot, NavTab } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  getDashboard,
  getMyProfile,
  getBudgetSummary,
  getRiskPrediction,
  getPlacementReadiness,
  updateStudySession,
  DashboardResponse,
  ProfileOut,
  BudgetSummaryResponse,
  RiskPredictionResponse,
  PlacementReadinessResponse,
  ApiError,
} from '../lib/api';

interface HomeScreenProps {
  onNavigateTab: (tab: NavTab) => void;
  onOpenStudyGuide: () => void;
  // NOTE: Nearby Student Spots has no backend endpoint yet (no /explore or
  // /spots route exists in the API). Kept as a prop from mock data until
  // that module is wired up next.
  spots: StudentSpot[];
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateTab, onOpenStudyGuide, spots }) => {
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [profile, setProfile] = useState<ProfileOut | null>(null);
  const [budget, setBudget] = useState<BudgetSummaryResponse | null>(null);
  const [risk, setRisk] = useState<RiskPredictionResponse | null>(null);
  const [placement, setPlacement] = useState<PlacementReadinessResponse | null>(null);

  const [snoozedPriority, setSnoozedPriority] = useState(false);
  const [togglingTaskId, setTogglingTaskId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [d, p, b, r, pl] = await Promise.all([
        getDashboard(),
        getMyProfile(),
        getBudgetSummary(),
        getRiskPrediction(),
        getPlacementReadiness(),
      ]);
      setDashboard(d);
      setProfile(p);
      setBudget(b);
      setRisk(r);
      setPlacement(pl);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load your dashboard. Pull to retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleToggleTask = async (taskId: string, currentlyCompleted: boolean) => {
    if (!dashboard) return;
    setTogglingTaskId(taskId);
    // Optimistic update
    setDashboard({
      ...dashboard,
      tasks: dashboard.tasks.map((t) => (t.id === taskId ? { ...t, completed: !currentlyCompleted } : t)),
    });
    try {
      await updateStudySession(taskId, { status: currentlyCompleted ? 'Upcoming' : 'Done' });
    } catch {
      // Roll back on failure
      setDashboard((prev) =>
        prev
          ? { ...prev, tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: currentlyCompleted } : t)) }
          : prev
      );
    } finally {
      setTogglingTaskId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-medium text-gray-500">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  if (loadError || !dashboard || !profile || !budget || !risk || !placement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center">
        <span className="material-symbols-outlined text-[32px] text-red-500">error</span>
        <p className="text-sm text-gray-600">{loadError || 'Something went wrong loading your dashboard.'}</p>
        <button
          onClick={loadAll}
          type="button"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const completedCount = dashboard.tasks.filter((t) => t.completed).length;
  const topPriorityAction = dashboard.ai_actions[0];
  const spentSoFar = budget.total_spent;
  const budgetPercent = budget.monthly_budget > 0 ? Math.min(100, Math.round((spentSoFar / budget.monthly_budget) * 100)) : 0;
  const budgetHealthy = dashboard.remaining_budget > dashboard.daily_budget_limit * 3;

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 space-y-6 max-w-[1400px] mx-auto pb-6 pt-1 lg:pt-2">
      {/* Student Welcome & Vital Context Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1a1a1a] truncate tracking-tight">
              {greeting}, {user?.full_name?.split(' ')[0] || 'there'}
            </h1>
            <span className="text-xl">👋</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs uppercase tracking-widest text-gray-500 font-semibold">
            <span>{profile.major || 'Add your major'}</span>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <span className="text-indigo-600 font-bold">{profile.college || dashboard.cohort_standing}</span>
          </div>
        </div>
        <div className="relative shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 text-gray-700 shadow-xs border border-gray-200">
          <span className="material-symbols-outlined text-[22px]">wb_sunny</span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
        </div>
      </div>

      {/* Main Dashboard Responsive Grid: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: AI Nudge & Today's Focus */}
        <div className="lg:col-span-7 space-y-6">
          {/* Smart AI Proactive Nudge Card — driven by real dashboard.ai_actions */}
          {!snoozedPriority && topPriorityAction && (
            <div className="relative overflow-hidden rounded-2xl bg-indigo-900 text-white p-6 shadow-sm border border-indigo-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-semibold uppercase tracking-widest text-indigo-200">
                    Compass AI Priority
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <h2 className="text-lg font-semibold text-white leading-snug tracking-tight">
                  {topPriorityAction.title}
                </h2>
                <p className="text-xs text-indigo-200 leading-relaxed">{topPriorityAction.meta}</p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2.5">
                <button
                  onClick={() => onNavigateTab(topPriorityAction.tab as NavTab)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer bg-white text-indigo-950 hover:bg-indigo-50"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[16px]">{topPriorityAction.icon}</span>
                  <span>Open</span>
                </button>

                <button
                  onClick={onOpenStudyGuide}
                  className="px-3.5 py-2.5 rounded-lg bg-indigo-800 text-indigo-100 font-medium text-xs hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1.5"
                  type="button"
                  title="View AI Step Guide"
                >
                  <span className="material-symbols-outlined text-[15px]">menu_book</span>
                  <span>Guide</span>
                </button>

                <button
                  onClick={() => setSnoozedPriority(true)}
                  className="px-3 py-2.5 rounded-lg bg-indigo-950/70 text-indigo-300 font-medium text-xs hover:bg-indigo-800 transition-colors cursor-pointer"
                  type="button"
                >
                  Later
                </button>
              </div>
            </div>
          )}

          {/* Today's Focus Action Section — real study sessions from /dashboard */}
          <div className="bg-white rounded-2xl p-6 shadow-xs space-y-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-600 text-[20px]">check_circle</span>
                <h3 className="text-base font-semibold text-[#1a1a1a] tracking-tight">Today's Focus</h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">
                {completedCount} of {dashboard.tasks.length} complete
              </span>
            </div>

            {dashboard.tasks.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <span className="material-symbols-outlined text-[28px] text-gray-300">event_available</span>
                <p className="text-xs text-gray-500">No study sessions yet. Add one from the Academics tab.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {dashboard.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-item group flex items-start justify-between p-3.5 rounded-xl border transition-all ${
                      task.completed
                        ? 'bg-gray-50/60 border-gray-100 opacity-60'
                        : 'bg-gray-50/80 border-gray-100 hover:bg-gray-100/90'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => handleToggleTask(task.id, task.completed)}
                        disabled={togglingTaskId === task.id}
                        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                          task.completed
                            ? 'bg-indigo-600 text-white'
                            : 'border border-gray-300 bg-white text-transparent hover:border-indigo-600'
                        }`}
                        type="button"
                        aria-label={`Mark ${task.title} as ${task.completed ? 'incomplete' : 'complete'}`}
                      >
                        <span
                          className={`material-symbols-outlined text-[14px] ${
                            task.completed ? 'opacity-100' : 'opacity-0'
                          }`}
                        >
                          check
                        </span>
                      </button>

                      <div className="min-w-0">
                        <span
                          onClick={() => handleToggleTask(task.id, task.completed)}
                          className={`text-sm block font-medium truncate cursor-pointer ${
                            task.completed ? 'line-through text-gray-400' : 'text-[#1a1a1a]'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ml-2 ${
                        task.completed ? 'bg-gray-100 text-gray-500' : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {task.completed ? 'Done' : task.category}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Snapshot Analytics Bento */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Campus Snapshot</h3>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold uppercase tracking-wider flex items-center gap-1.5 border border-emerald-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Real-time sync
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Budget Snapshot — driven by /budget/summary and /dashboard */}
              <div
                onClick={() => onNavigateTab('finance')}
                className="bg-white rounded-2xl p-6 shadow-xs space-y-4 cursor-pointer hover:border-gray-300 border border-gray-200 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <span
                        className="material-symbols-outlined text-[22px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        account_balance_wallet
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block uppercase tracking-widest font-semibold">
                        Monthly Budget
                      </span>
                      <span className="text-3xl font-light text-[#1a1a1a] tracking-tight">
                        ₹{dashboard.remaining_budget.toFixed(0)}{' '}
                        <span className="text-xs text-gray-400 font-normal">left</span>
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                      budgetHealthy
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                        : 'bg-amber-50 text-amber-700 border-amber-200/50'
                    }`}
                  >
                    {budgetHealthy ? 'Healthy' : 'Watch'}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-center text-gray-500 text-xs font-medium">
                    <span>
                      Spent ₹{spentSoFar.toFixed(0)} of ₹{budget.monthly_budget.toFixed(0)}
                    </span>
                    <span className="font-semibold text-[#1a1a1a]">{budgetPercent}% spent</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${budgetPercent}%` }}
                    />
                  </div>
                  {budget.suggestions[0] && (
                    <p className="text-[11px] text-gray-500 pt-1">{budget.suggestions[0]}</p>
                  )}
                </div>
              </div>

              {/* Career & Academic Side-by-Side Dual Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Career Snapshot — from profile.target_role + /placement-readiness */}
                <div
                  onClick={() => onNavigateTab('academics')}
                  className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-gray-300 border border-gray-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                      <span className="material-symbols-outlined text-[18px]">work</span>
                    </div>
                    <span className="text-[10px] text-gray-500 block uppercase tracking-widest pt-1 font-semibold">
                      Career Target
                    </span>
                    <span className="text-base font-semibold text-[#1a1a1a] block leading-tight tracking-tight">
                      {profile.target_role || 'Not set yet'}
                    </span>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-gray-500 text-xs mb-1.5">
                      <span>Readiness</span>
                      <span className="text-indigo-600 font-bold">{Math.round(placement.overall_score)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${placement.overall_score}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Performance Snapshot — from profile + /dashboard + /risk/predict */}
                <div
                  onClick={() => onNavigateTab('insights')}
                  className="bg-white rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer hover:border-gray-300 border border-gray-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                    </div>
                    <span className="text-[10px] text-gray-500 block uppercase tracking-widest pt-1 font-semibold">
                      Current GPA
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-light text-[#1a1a1a] tracking-tight">
                        {profile.current_gpa > 0 ? profile.current_gpa.toFixed(2) : '—'}
                      </span>
                      <span className="text-xs text-gray-400">/ 4.0</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          risk.risk_level === 'Low'
                            ? 'bg-emerald-500'
                            : risk.risk_level === 'Moderate'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                      ></span>
                      <span className="text-xs text-gray-700 font-medium">
                        {Math.round(dashboard.academic_index)}% academic index
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block mt-1">
                      Burnout Risk: {risk.risk_level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Services & Campus Essentials — still mock, pending Explore backend */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-600 text-[18px]">explore</span>
            <h3 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Nearby Student Spots</h3>
          </div>
          <button
            onClick={() => onNavigateTab('explore')}
            className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
            type="button"
          >
            View all →
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-4 sm:overflow-visible">
          {spots.slice(0, 4).map((spot) => (
            <div
              key={spot.id}
              onClick={() => onNavigateTab('explore')}
              className="shrink-0 w-44 sm:w-auto bg-white rounded-2xl p-3 shadow-xs space-y-2 cursor-pointer hover:border-gray-300 transition-all active:scale-[0.98] border border-gray-200"
            >
              <div className="h-28 sm:h-32 w-full rounded-xl overflow-hidden relative">
                <img className="w-full h-full object-cover" src={spot.imageUrl} alt={spot.name} loading="lazy" />
                <span className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded bg-white/90 backdrop-blur-sm text-[#1a1a1a] text-[10px] font-bold shadow-xs">
                  {spot.distance}
                </span>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#1a1a1a] block truncate">{spot.name}</span>
                <span className="text-[10px] text-gray-500 block truncate uppercase tracking-wider mt-0.5">
                  {spot.tags[0] || spot.categoryLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Encouragement Footer — derived from real completion ratio, not a fixed claim */}
      <div className="py-2 flex items-center justify-center gap-2 text-gray-400 text-xs">
        <span className="material-symbols-outlined text-[16px] text-indigo-600">check_circle</span>
        <span>
          {dashboard.tasks.length === 0
            ? 'Add your first study session to get personalized nudges.'
            : completedCount === dashboard.tasks.length
            ? "You're all caught up for today!"
            : `${dashboard.tasks.length - completedCount} task${dashboard.tasks.length - completedCount === 1 ? '' : 's'} remaining today.`}
        </span>
      </div>
    </div>
  );
};
