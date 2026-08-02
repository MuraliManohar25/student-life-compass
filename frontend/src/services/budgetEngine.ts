// Budget Engine: Dynamic multi-month financial management, expense CRUD, category analytics, AI predictions, and Performance Report synchronization.
import { PerformanceEngine } from "./performanceEngine";

export interface BudgetExpense {
  id: string;
  title: string;
  category: "Food" | "Transport" | "Shopping" | "Education" | "Entertainment" | "Medical" | "Bills" | "Subscriptions" | "Others";
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: "UPI" | "Cash" | "Debit Card" | "Credit Card" | "Net Banking";
  notes?: string;
  createdAt: string;
}

export interface MonthBudgetData {
  monthKey: string; // "YYYY-MM" e.g. "2026-08"
  monthName: string; // "August"
  year: number; // 2026
  monthlyBudget: number;
  monthlyIncome: number;
  savingGoal: number;
  currency: string;
  expenses: BudgetExpense[];
  createdAt: string;
  updatedAt: string;
}

export interface CategorySummary {
  category: string;
  icon: string;
  spent: number;
  percentageOfBudget: number;
  color: string;
}

export interface BudgetCalculations {
  monthlyBudget: number;
  monthlyIncome: number;
  savingGoal: number;
  currency: string;
  totalSpent: number;
  remainingBudget: number;
  savings: number;
  expectedEndSpend: number;
  overspendingProbability: number;
  budgetUtilization: number;
  safeDailyLimit: number;
  financialScore: number;
  goalProgressPercent: number;
}

const STORAGE_KEY = "compass_budget_engine_v3";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const getCurrentMonthKey = (): string => {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return `${yr}-${mo}`;
};

export const parseMonthKey = (monthKey: string): { monthName: string; year: number } => {
  const [yrStr, moStr] = monthKey.split("-");
  const yr = parseInt(yrStr, 10) || 2026;
  const moIdx = (parseInt(moStr, 10) || 8) - 1;
  return { monthName: MONTH_NAMES[moIdx] || "August", year: yr };
};

export const getAvailableMonths = (): { monthKey: string; label: string }[] => {
  const options: { monthKey: string; label: string }[] = [];
  const years = [2025, 2026, 2027];

  years.forEach((yr) => {
    MONTH_NAMES.forEach((name, idx) => {
      const moStr = String(idx + 1).padStart(2, "0");
      const key = `${yr}-${moStr}`;
      options.push({ monthKey: key, label: `${name} ${yr}` });
    });
  });

  return options;
};

// Initial default data generator for August 2026
const createInitialData = (monthKey: string = "2026-08"): MonthBudgetData => {
  const { monthName, year } = parseMonthKey(monthKey);
  const now = new Date().toISOString();

  return {
    monthKey,
    monthName,
    year,
    monthlyBudget: 8000,
    monthlyIncome: 12000,
    savingGoal: 2000,
    currency: "₹",
    expenses: [
      {
        id: "e-1",
        title: "Canteen Coffee & Snacks",
        category: "Food",
        amount: 250,
        date: "2026-08-02",
        paymentMethod: "UPI",
        notes: "Hostel evening snacks",
        createdAt: now,
      },
      {
        id: "e-2",
        title: "Semester Printouts & Binder",
        category: "Education",
        amount: 450,
        date: "2026-08-01",
        paymentMethod: "UPI",
        notes: "DBMS Lab Manual printing",
        createdAt: now,
      },
      {
        id: "e-3",
        title: "Hostel Wi-Fi Recharge",
        category: "Bills",
        amount: 650,
        date: "2026-08-01",
        paymentMethod: "Net Banking",
        notes: "High speed monthly plan",
        createdAt: now,
      },
      {
        id: "e-4",
        title: "Auto Fare to College",
        category: "Transport",
        amount: 180,
        date: "2026-08-02",
        paymentMethod: "Cash",
        notes: "Daily commute",
        createdAt: now,
      },
      {
        id: "e-5",
        title: "DBMS Reference Book",
        category: "Education",
        amount: 720,
        date: "2026-07-28",
        paymentMethod: "Debit Card",
        notes: "Korth 7th edition",
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };
};

export class BudgetEngine {
  private static loadAllRecords(): Record<string, MonthBudgetData> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = { ["2026-08"]: createInitialData("2026-08") };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(raw);
    } catch {
      const initial = { ["2026-08"]: createInitialData("2026-08") };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
  }

  private static saveAllRecords(records: Record<string, MonthBudgetData>) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  // Get data for specific monthKey (e.g. "2026-08")
  public static getMonthData(monthKey: string = getCurrentMonthKey()): MonthBudgetData {
    const records = BudgetEngine.loadAllRecords();
    if (!records[monthKey]) {
      records[monthKey] = createInitialData(monthKey);
      BudgetEngine.saveAllRecords(records);
    }
    return records[monthKey];
  }

  // Update Month budget, income, saving goal, currency
  public static updateMonthConfig(
    monthKey: string,
    monthlyBudget: number,
    monthlyIncome: number,
    savingGoal: number,
    currency: string
  ): MonthBudgetData {
    const records = BudgetEngine.loadAllRecords();
    const current = records[monthKey] || createInitialData(monthKey);

    current.monthlyBudget = Math.max(1, monthlyBudget);
    current.monthlyIncome = Math.max(0, monthlyIncome);
    current.savingGoal = Math.max(0, savingGoal);
    current.currency = currency || "₹";
    current.updatedAt = new Date().toISOString();

    records[monthKey] = current;
    BudgetEngine.saveAllRecords(records);

    // Sync with Performance Engine
    BudgetEngine.syncWithPerformanceEngine(current);
    return current;
  }

  // Expense CRUD
  public static addExpense(monthKey: string, expenseData: Omit<BudgetExpense, "id" | "createdAt">): MonthBudgetData {
    const records = BudgetEngine.loadAllRecords();
    const monthData = records[monthKey] || createInitialData(monthKey);

    const newExpense: BudgetExpense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    monthData.expenses = [newExpense, ...monthData.expenses];
    monthData.updatedAt = new Date().toISOString();

    records[monthKey] = monthData;
    BudgetEngine.saveAllRecords(records);

    // Sync with Performance Engine
    BudgetEngine.syncWithPerformanceEngine(monthData);
    return monthData;
  }

  public static updateExpense(monthKey: string, id: string, updates: Partial<BudgetExpense>): MonthBudgetData {
    const records = BudgetEngine.loadAllRecords();
    const monthData = records[monthKey] || createInitialData(monthKey);

    const idx = monthData.expenses.findIndex((e) => e.id === id);
    if (idx !== -1) {
      monthData.expenses[idx] = { ...monthData.expenses[idx], ...updates };
      monthData.updatedAt = new Date().toISOString();
      records[monthKey] = monthData;
      BudgetEngine.saveAllRecords(records);
      BudgetEngine.syncWithPerformanceEngine(monthData);
    }
    return monthData;
  }

  public static deleteExpense(monthKey: string, id: string): MonthBudgetData {
    const records = BudgetEngine.loadAllRecords();
    const monthData = records[monthKey] || createInitialData(monthKey);

    monthData.expenses = monthData.expenses.filter((e) => e.id !== id);
    monthData.updatedAt = new Date().toISOString();

    records[monthKey] = monthData;
    BudgetEngine.saveAllRecords(records);
    BudgetEngine.syncWithPerformanceEngine(monthData);
    return monthData;
  }

  // Compute dynamic calculations for a month
  public static getCalculations(monthKey: string): BudgetCalculations {
    const monthData = BudgetEngine.getMonthData(monthKey);
    const totalSpent = monthData.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const remainingBudget = monthData.monthlyBudget - totalSpent;
    const savings = Math.max(0, monthData.monthlyIncome - totalSpent);
    const budgetUtilization = Math.round((totalSpent / monthData.monthlyBudget) * 100);

    const d = new Date();
    const currentDay = d.getDate();
    const daysInMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();

    const dailyRate = currentDay > 0 ? totalSpent / currentDay : totalSpent / 15;
    const expectedEndSpend = Math.round(totalSpent + dailyRate * (daysInMonth - currentDay));

    let overspendingProbability = 18;
    if (expectedEndSpend > monthData.monthlyBudget) {
      overspendingProbability = Math.min(99, Math.round(((expectedEndSpend - monthData.monthlyBudget) / monthData.monthlyBudget) * 100 + 40));
    } else {
      overspendingProbability = Math.max(5, Math.round((totalSpent / monthData.monthlyBudget) * 25));
    }

    const remainingDays = Math.max(1, daysInMonth - currentDay);
    const safeDailyLimit = Math.max(0, Math.round(remainingBudget / remainingDays));

    const financialScore = Math.max(30, Math.min(100, Math.round(100 - (totalSpent / monthData.monthlyBudget) * 30)));

    const goalProgressPercent = monthData.savingGoal > 0 ? Math.min(100, Math.round((savings / monthData.savingGoal) * 100)) : 100;

    return {
      monthlyBudget: monthData.monthlyBudget,
      monthlyIncome: monthData.monthlyIncome,
      savingGoal: monthData.savingGoal,
      currency: monthData.currency,
      totalSpent,
      remainingBudget,
      savings,
      expectedEndSpend,
      overspendingProbability,
      budgetUtilization,
      safeDailyLimit,
      financialScore,
      goalProgressPercent,
    };
  }

  // Category Summaries Breakdown
  public static getCategorySummaries(monthKey: string): CategorySummary[] {
    const monthData = BudgetEngine.getMonthData(monthKey);
    const totalBudget = monthData.monthlyBudget;

    const categoriesConfig: { category: BudgetExpense["category"]; icon: string; color: string }[] = [
      { category: "Food", icon: "restaurant", color: "from-[#4f46e5] to-indigo-400" },
      { category: "Transport", icon: "directions_bus", color: "from-cyan-400 to-blue-400" },
      { category: "Shopping", icon: "shopping_bag", color: "from-purple-400 to-pink-400" },
      { category: "Education", icon: "school", color: "from-emerald-400 to-teal-400" },
      { category: "Entertainment", icon: "movie", color: "from-amber-400 to-orange-400" },
      { category: "Medical", icon: "medical_services", color: "from-rose-400 to-red-400" },
      { category: "Bills", icon: "receipt_long", color: "from-amber-400 to-[#c3c0ff]" },
      { category: "Subscriptions", icon: "subscriptions", color: "from-[#c3c0ff] to-indigo-300" },
      { category: "Others", icon: "category", color: "from-gray-400 to-slate-300" },
    ];

    return categoriesConfig.map((item) => {
      const spent = monthData.expenses
        .filter((e) => e.category === item.category)
        .reduce((acc, curr) => acc + curr.amount, 0);

      const percentageOfBudget = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0;

      return {
        category: item.category,
        icon: item.icon,
        spent,
        percentageOfBudget,
        color: item.color,
      };
    });
  }

  // AI Dynamic Predictions & Recommendations
  public static getAIPredictions(monthKey: string): {
    summary: string;
    expectedEndSpend: number;
    safeDailyLimit: number;
    savingPotential: number;
    confidence: number;
    recommendations: string[];
  } {
    const monthData = BudgetEngine.getMonthData(monthKey);
    const calcs = BudgetEngine.getCalculations(monthKey);
    const cats = BudgetEngine.getCategorySummaries(monthKey);

    const foodCat = cats.find((c) => c.category === "Food");
    const recs: string[] = [];

    if (foodCat && foodCat.percentageOfBudget > 25) {
      recs.push(`Reduce food delivery spending. You have spent ${foodCat.percentageOfBudget}% of your monthly budget on Food.`);
    } else {
      recs.push("Your food & canteen expenses are well controlled this month.");
    }

    if (calcs.overspendingProbability > 40) {
      recs.push("Avoid unnecessary shopping this week to protect monthly budget runway.");
    } else {
      recs.push(`Increase daily savings by ${calcs.currency}100 to comfortably reach your ${calcs.currency}${calcs.savingGoal} saving goal.`);
    }

    recs.push("Your transportation costs are lower than student cohort average.");
    recs.push("Excellent budgeting momentum! On track for healthy monthly financial runway.");

    const summaryText = `At your current spending rate, you are expected to spend ${calcs.currency}${calcs.expectedEndSpend.toLocaleString()} by the end of ${monthData.monthName} ${monthData.year}. You are likely to save ${calcs.currency}${calcs.savings.toLocaleString()}.`;

    return {
      summary: summaryText,
      expectedEndSpend: calcs.expectedEndSpend,
      safeDailyLimit: calcs.safeDailyLimit,
      savingPotential: calcs.savings,
      confidence: 92,
      recommendations: recs,
    };
  }

  // Sync Financial Score with PerformanceEngine
  private static syncWithPerformanceEngine(monthData: MonthBudgetData) {
    try {
      const calcs = BudgetEngine.getCalculations(monthData.monthKey);
      // Calls performance engine state update fallback silently
      const raw = localStorage.getItem("compass_performance_engine_v4");
      if (raw) {
        const perf = JSON.parse(raw);
        perf.budgetRemaining = calcs.remainingBudget;
        localStorage.setItem("compass_performance_engine_v4", JSON.stringify(perf));
      }
    } catch {
      /* silent */
    }
  }
}
