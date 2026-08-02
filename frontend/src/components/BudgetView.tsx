import React, { useState, useEffect } from "react";
import {
  BudgetEngine,
  MonthBudgetData,
  BudgetCalculations,
  CategorySummary,
  getAvailableMonths,
  getCurrentMonthKey,
  parseMonthKey,
  BudgetExpense,
} from "../services/budgetEngine";
import { EditBudgetModal } from "./Budget/EditBudgetModal";
import { ExpenseModal } from "./Budget/ExpenseModal";

export const BudgetView: React.FC = () => {
  const [selectedMonthKey, setSelectedMonthKey] = useState<string>(getCurrentMonthKey());
  const availableMonthOptions = getAvailableMonths();

  const [monthData, setMonthData] = useState<MonthBudgetData>(() =>
    BudgetEngine.getMonthData(selectedMonthKey)
  );
  const [calcs, setCalcs] = useState<BudgetCalculations>(() =>
    BudgetEngine.getCalculations(selectedMonthKey)
  );
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>(() =>
    BudgetEngine.getCategorySummaries(selectedMonthKey)
  );
  const [aiPredictions, setAiPredictions] = useState(() =>
    BudgetEngine.getAIPredictions(selectedMonthKey)
  );

  // Modals state
  const [editBudgetOpen, setEditBudgetOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BudgetExpense | null>(null);

  const refreshData = (monthKey: string = selectedMonthKey) => {
    const mData = BudgetEngine.getMonthData(monthKey);
    const mCalcs = BudgetEngine.getCalculations(monthKey);
    const mCats = BudgetEngine.getCategorySummaries(monthKey);
    const mAi = BudgetEngine.getAIPredictions(monthKey);

    setMonthData(mData);
    setCalcs(mCalcs);
    setCategorySummaries(mCats);
    setAiPredictions(mAi);
  };

  useEffect(() => {
    refreshData(selectedMonthKey);
  }, [selectedMonthKey]);

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = e.target.value;
    setSelectedMonthKey(newKey);
  };

  const handleSaveBudgetConfig = (budget: number, income: number, goal: number, currency: string) => {
    BudgetEngine.updateMonthConfig(selectedMonthKey, budget, income, goal, currency);
    refreshData(selectedMonthKey);
  };

  const handleSaveExpense = (data: any) => {
    if (data.id) {
      BudgetEngine.updateExpense(selectedMonthKey, data.id, data);
    } else {
      BudgetEngine.addExpense(selectedMonthKey, data);
    }
    refreshData(selectedMonthKey);
  };

  const handleDeleteExpense = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    BudgetEngine.deleteExpense(selectedMonthKey, id);
    refreshData(selectedMonthKey);
  };

  const handleEditExpenseOpen = (exp: BudgetExpense, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingExpense(exp);
    setExpenseModalOpen(true);
  };

  const handleAddExpenseOpen = () => {
    setEditingExpense(null);
    setExpenseModalOpen(true);
  };

  const { monthName, year } = parseMonthKey(selectedMonthKey);
  const currency = monthData.currency || "₹";

  // Circular Progress Ring Math
  const radius = 48;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(100, calcs.budgetUtilization) / 100) * circumference;

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. PAGE HEADER */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1a2e]/80 via-[#16162a]/70 to-[#0f0f1b]/90 backdrop-blur-xl shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold uppercase tracking-widest">
                Student Finances
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#c7c4d8]">
                Multi-Month Control
              </span>
            </div>

            <h1 className="font-headline font-black text-3xl sm:text-4xl text-white tracking-tight">
              Smart Budget Predictor
            </h1>
            <p className="text-xs text-[#c7c4d8] mt-1 max-w-xl">
              Track your spending, predict future expenses, and stay within your monthly budget.
            </p>
          </div>

          {/* Month Dropdown & Edit Budget Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Editable Month Dropdown */}
            <div className="relative">
              <select
                value={selectedMonthKey}
                onChange={handleMonthChange}
                className="bg-[#1e1e33] border border-white/20 text-white font-headline font-bold text-sm rounded-2xl px-4 py-2.5 pr-8 appearance-none focus:outline-none focus:border-emerald-400 cursor-pointer shadow-lg"
              >
                {availableMonthOptions.map((opt) => (
                  <option key={opt.monthKey} value={opt.monthKey}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#c3c0ff] pointer-events-none">
                expand_more
              </span>
            </div>

            <button
              onClick={() => setEditBudgetOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              <span>Edit Budget</span>
            </button>

            <button
              onClick={handleAddExpenseOpen}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500 text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* 2. BUDGET SUMMARY & CIRCULAR UTILIZATION RING */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
          {/* Circular Progress Indicator */}
          <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/10 lg:col-span-1">
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle
                  stroke="rgba(255, 255, 255, 0.08)"
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <circle
                  stroke={calcs.budgetUtilization > 90 ? "#f43f5e" : "#10b981"}
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference + " " + circumference}
                  style={{ strokeDashoffset }}
                  strokeLinecap="round"
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-headline font-black text-white">
                  {calcs.budgetUtilization}%
                </span>
                <span className="text-[9px] font-bold text-[#c7c4d8] uppercase">Used</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c3c0ff]">
                Budget Utilization
              </span>
              <p className="text-sm font-bold text-white">
                {calcs.currency}{calcs.totalSpent.toLocaleString()} / {calcs.currency}{calcs.monthlyBudget.toLocaleString()}
              </p>
              <span
                className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  calcs.budgetUtilization > 90
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }`}
              >
                {calcs.budgetUtilization > 90 ? "Overbudget Warning" : "Healthy Spend Velocity"}
              </span>
            </div>
          </div>

          {/* Key Summary Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:col-span-3">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-[#c7c4d8] uppercase font-bold block">Monthly Budget</span>
              <p className="text-xl font-headline font-black text-white">{currency}{calcs.monthlyBudget.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-rose-300 uppercase font-bold block">Spent So Far</span>
              <p className="text-xl font-headline font-black text-rose-400">{currency}{calcs.totalSpent.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Remaining Runway</span>
              <p className="text-xl font-headline font-black text-emerald-400">{currency}{calcs.remainingBudget.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-[#c3c0ff] uppercase font-bold block">Monthly Savings</span>
              <p className="text-xl font-headline font-black text-[#c3c0ff]">{currency}{calcs.savings.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-amber-300 uppercase font-bold block">Expected End Spend</span>
              <p className="text-xl font-headline font-black text-amber-300">{currency}{calcs.expectedEndSpend.toLocaleString()}</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[10px] text-cyan-300 uppercase font-bold block">Overspending Risk</span>
              <p className="text-xl font-headline font-black text-cyan-300">{calcs.overspendingProbability}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SAVING GOAL PROGRESS CARD */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-xl">savings</span>
            <h3 className="font-headline font-bold text-lg text-white">Monthly Saving Goal Progress</h3>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Goal: Save {currency}{monthData.savingGoal.toLocaleString()}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-[#c7c4d8]">
            <span>Current Saved Amount</span>
            <span className="font-bold text-white">
              {currency}{calcs.savings.toLocaleString()} / {currency}{monthData.savingGoal.toLocaleString()} ({calcs.goalProgressPercent}%)
            </span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
            <div
              style={{ width: `${calcs.goalProgressPercent}%` }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
            />
          </div>
        </div>
      </div>

      {/* 4. AI BUDGET PREDICTION & RECOMMENDATIONS BANNER */}
      <div className="glass-card p-6 rounded-3xl border border-[#4f46e5]/40 bg-gradient-to-br from-[#4f46e5]/15 via-white/[0.02] to-[#131314] space-y-4 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#c3c0ff] text-xl">auto_awesome</span>
            <h3 className="font-headline font-bold text-lg text-white">AI Budget Prediction & Insights</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#c7c4d8]">Safe Daily Cap: <strong className="text-emerald-400">{currency}{calcs.safeDailyLimit}/day</strong></span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {aiPredictions.confidence}% AI Confidence
            </span>
          </div>
        </div>

        <p className="text-sm text-white/90 leading-relaxed italic">
          "{aiPredictions.summary}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {aiPredictions.recommendations.map((rec, idx) => (
            <div key={idx} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5 text-xs text-white">
              <span className="material-symbols-outlined text-sm text-emerald-400">lightbulb</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. EXPENSE CATEGORIES BREAKDOWN GRID */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-headline font-bold text-xl text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-[#c3c0ff]">pie_chart</span>
            <span>Category Spending Breakdown</span>
          </h2>
          <span className="text-xs text-[#c7c4d8]">9 Standard Categories</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorySummaries.map((cat) => (
            <div key={cat.category} className="glass-card p-4 rounded-2xl border border-white/10 space-y-2 hover:border-white/20 transition-all">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#c3c0ff]">{cat.icon}</span>
                  <span className="font-bold text-xs text-white">{cat.category}</span>
                </div>
                <span className="font-mono font-bold text-sm text-white">
                  {currency}{cat.spent.toLocaleString()}
                </span>
              </div>

              <div className="space-y-1">
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, cat.percentageOfBudget)}%` }}
                    className={`h-full bg-gradient-to-r ${cat.color} rounded-full transition-all duration-700`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#c7c4d8]">
                  <span>{cat.percentageOfBudget}% of total budget</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. EXPENSES TRANSACTIONS LOG & MANAGEMENT */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 space-y-5 bg-gradient-to-br from-[#1a1a2e]/70 via-[#16162a]/60 to-[#0f0f1b]/80 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <h3 className="font-headline font-bold text-xl text-white">Expense Transactions Log</h3>
            <p className="text-xs text-[#c7c4d8] mt-0.5">
              {monthData.expenses.length} transaction(s) logged for {monthName} {year}
            </p>
          </div>

          <button
            onClick={handleAddExpenseOpen}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 text-black font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/30 shrink-0 self-start sm:self-auto flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Record Expense</span>
          </button>
        </div>

        <div className="space-y-3">
          {monthData.expenses.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#c7c4d8]">No expenses recorded for {monthName} {year} yet.</div>
          ) : (
            monthData.expenses.map((item) => (
              <div
                key={item.id}
                onClick={(e) => handleEditExpenseOpen(item, e)}
                className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[#c3c0ff]">
                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-[#c3c0ff] transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#c7c4d8] flex items-center gap-2 mt-0.5">
                      <span>{item.date}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-[#c3c0ff]">
                        {item.category}
                      </span>
                      <span>•</span>
                      <span className="text-[10px] text-[#c7c4d8] font-mono">{item.paymentMethod}</span>
                    </p>
                    {item.notes && <p className="text-[11px] text-[#c7c4d8]/80 italic mt-0.5">{item.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto pl-12 sm:pl-0">
                  <span className="font-mono font-black text-base text-rose-300">
                    -{currency}{item.amount.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                    <button
                      onClick={(e) => handleEditExpenseOpen(item, e)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-[#c7c4d8] hover:text-white"
                      title="Edit Expense"
                    >
                      <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                    <button
                      onClick={(e) => handleDeleteExpense(item.id, e)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/20 text-rose-300"
                      title="Delete Expense"
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

      {/* 7. FLOATING ADD EXPENSE BUTTON */}
      <button
        onClick={handleAddExpenseOpen}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-2xl shadow-emerald-500/50 hover:scale-110 active:scale-95 transition-all border border-white/20 font-bold"
        title="Record New Expense"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>

      {/* 8. MODALS */}
      <EditBudgetModal
        isOpen={editBudgetOpen}
        currentBudget={monthData.monthlyBudget}
        currentIncome={monthData.monthlyIncome}
        currentGoal={monthData.savingGoal}
        currentCurrency={currency}
        monthLabel={`${monthName} ${year}`}
        onClose={() => setEditBudgetOpen(false)}
        onSave={handleSaveBudgetConfig}
      />

      <ExpenseModal
        isOpen={expenseModalOpen}
        expense={editingExpense}
        currency={currency}
        onClose={() => setExpenseModalOpen(false)}
        onSave={handleSaveExpense}
      />
    </div>
  );
};
