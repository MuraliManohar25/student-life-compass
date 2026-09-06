import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi, profileApi } from "../services/api";
import {
  BudgetCalculations,
  BudgetEngine,
  getCurrentMonthKey,
} from "../services/budgetEngine";
import { PerformanceEngine } from "../services/performanceEngine";
import { OverallRiskSummary, RiskAnalysisEngine } from "../services/riskAnalysisEngine";
import { LocalDiscoveryEngine } from "../services/localDiscoveryEngine";
import { Task, TaskEngine } from "../services/taskEngine";
import { budgetApi as budgetApiClient } from "../services/api";

const NEARBY_SUMMARY_KEY = "compass_nearby_summary";

export interface UserProfile {
  college?: string;
  major?: string;
  current_gpa?: number;
  target_gpa?: number;
  target_role?: string;
  sleep_hours?: number;
  monthly_budget?: number;
  displayName?: string;
}

export interface NearbyPlacesSummary {
  lastSearchedLocation: string | null;
  recentlyDiscoveredCount: number;
  visitedCount: number;
}

interface AppDataContextValue {
  profile: UserProfile | null;
  budgetSummary: BudgetCalculations | null;
  riskScore: OverallRiskSummary | null;
  intelligenceScore: number | null;
  scoreTrend: string | null;
  nearbyPlacesSummary: NearbyPlacesSummary;
  todayTasks: Task[];
  planGeneratedTime: string | null;
  isLoading: boolean;
  refreshBudget: () => void;
  refreshRisk: () => void;
  refreshProfile: () => Promise<void>;
  refreshNearbyPlaces: () => void;
  refreshTasks: () => void;
  toggleTask: (id: string) => void;
  addTask: (input: Omit<Task, "id" | "completed" | "completedAt" | "rolloverCount">) => Task;
  recordNearbySearch: (location: string, discoveredCount: number) => void;
}

const defaultNearbySummary: NearbyPlacesSummary = {
  lastSearchedLocation: null,
  recentlyDiscoveredCount: 0,
  visitedCount: 0,
};

function computeScoreTrend(): string {
  const changes = PerformanceEngine.getScoreChanges();
  const recentDelta = changes.slice(0, 5).reduce((sum, c) => sum + c.delta, 0);
  return recentDelta >= 0 ? `+${recentDelta}%` : `${recentDelta}%`;
}

function readNearbySummaryFromStorage(): NearbyPlacesSummary {
  try {
    const raw = localStorage.getItem(NEARBY_SUMMARY_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      lastSearchedLocation: parsed.lastSearchedLocation ?? null,
      recentlyDiscoveredCount: parsed.recentlyDiscoveredCount ?? 0,
      visitedCount: LocalDiscoveryEngine.getVisitedHistory().length,
    };
  } catch {
    return {
      ...defaultNearbySummary,
      visitedCount: LocalDiscoveryEngine.getVisitedHistory().length,
    };
  }
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetCalculations | null>(null);
  const [riskScore, setRiskScore] = useState<OverallRiskSummary | null>(null);
  const [intelligenceScore, setIntelligenceScore] = useState<number | null>(null);
  const [scoreTrend, setScoreTrend] = useState<string | null>(null);
  const [nearbyPlacesSummary, setNearbyPlacesSummary] =
    useState<NearbyPlacesSummary>(defaultNearbySummary);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [planGeneratedTime, setPlanGeneratedTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTasks = useCallback(() => {
    setTodayTasks(TaskEngine.getTodayTasks());
    setPlanGeneratedTime(TaskEngine.getPlanGeneratedTime());
    setIntelligenceScore(PerformanceEngine.getOverallScore());
    setScoreTrend(computeScoreTrend());
  }, []);

  const refreshBudget = useCallback(async () => {
    try {
      const data = await budgetApiClient.getSummary();
      const calculations = data.utilization !== undefined
        ? {
            monthlyBudget: data.monthly_budget || 5000,
            monthlyIncome: data.monthly_budget || 12000,
            savingGoal: 2000,
            currency: "₹",
            totalSpent: data.total_spent || 0,
            remainingBudget: data.remaining_budget || 0,
            savings: (data.monthly_budget || 5000) - (data.total_spent || 0),
            expectedEndSpend: data.total_spent || 0,
            overspendingProbability: data.utilization > 70 ? 80 : 20,
            budgetUtilization: data.utilization || 0,
            safeDailyLimit: Math.max(0, Math.round(((data.monthly_budget || 5000) - (data.total_spent || 0)) / 30)),
            financialScore: Math.max(30, Math.min(100, Math.round(100 - (data.utilization || 0) * 30 / 100))),
            goalProgressPercent: 50,
          }
        : null;
      setBudgetSummary(calculations);
      setIntelligenceScore(PerformanceEngine.getOverallScore());
      setScoreTrend(computeScoreTrend());
    } catch (err) {
      console.warn("Failed to fetch budget summary from API, falling back to engine:", err);
      const monthKey = getCurrentMonthKey();
      setBudgetSummary(BudgetEngine.getCalculations(monthKey));
      setIntelligenceScore(PerformanceEngine.getOverallScore());
      setScoreTrend(computeScoreTrend());
    }
  }, [budgetApiClient]);

  const toggleTask = useCallback(
    (id: string) => {
      PerformanceEngine.toggleTask(id);
      refreshTasks();
      refreshBudget();
    },
    [refreshTasks, refreshBudget]
  );

  const addTask = useCallback(
    (input: Omit<Task, "id" | "completed" | "completedAt" | "rolloverCount">) => {
      const created = TaskEngine.addTask(input);
      refreshTasks();
      return created;
    },
    [refreshTasks]
  );

  const refreshRisk = useCallback(() => {
    setRiskScore(RiskAnalysisEngine.calculateRisks(getCurrentMonthKey()));
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setProfile(null);
      return;
    }

    try {
      const [profileData, meData] = await Promise.all([
        profileApi.getProfile(),
        authApi.getMe().catch(() => null),
      ]);
      setProfile({
        ...profileData,
        displayName: meData?.full_name?.split(" ")[0] || "Student",
      });
    } catch {
      setProfile(null);
    }
  }, []);

  const refreshNearbyPlaces = useCallback(() => {
    setNearbyPlacesSummary(readNearbySummaryFromStorage());
  }, []);

  useEffect(() => {
    refreshTasks();
    return TaskEngine.subscribe(refreshTasks);
  }, [refreshTasks]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setIsLoading(true);
      try {
        await refreshBudget();
      } catch {
        // fallback handled inside refreshBudget
      }
      refreshRisk();
      refreshNearbyPlaces();
      refreshTasks();
      await refreshProfile();
      if (!cancelled) setIsLoading(false);
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [refreshBudget, refreshRisk, refreshProfile, refreshNearbyPlaces, refreshTasks]);

  const value = useMemo<AppDataContextValue>(
    () => ({
      profile,
      budgetSummary,
      riskScore,
      intelligenceScore,
      scoreTrend,
      nearbyPlacesSummary,
      todayTasks,
      planGeneratedTime,
      isLoading,
      refreshBudget,
      refreshRisk,
      refreshProfile,
      refreshNearbyPlaces,
      refreshTasks,
      toggleTask,
      addTask,
      recordNearbySearch,
    }),
    [
      profile,
      budgetSummary,
      riskScore,
      intelligenceScore,
      scoreTrend,
      nearbyPlacesSummary,
      todayTasks,
      planGeneratedTime,
      isLoading,
      refreshBudget,
      refreshRisk,
      refreshProfile,
      refreshNearbyPlaces,
      refreshTasks,
      toggleTask,
      addTask,
      recordNearbySearch,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return ctx;
}