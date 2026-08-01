import React, { useState, useEffect } from "react";
import { ExpenseItem } from "../types";
import { budgetApi } from "../services/api";

export const BudgetView: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: "e1", title: "Canteen Coffee & Snacks", amount: 80, category: "Food", date: "Today" },
    { id: "e2", title: "Semester Printouts & Binder", amount: 140, category: "Academics", date: "Yesterday" },
    { id: "e3", title: "Hostel Wi-Fi Recharge", amount: 350, category: "Utilities", date: "Mar 20" },
    { id: "e4", title: "Book Store Reference Manual", amount: 220, category: "Academics", date: "Mar 18" },
  ]);

  const [titleInput, setTitleInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("Food");
  const [remainingBalance, setRemainingBalance] = useState(1640);
  const [predictedTotal, setPredictedTotal] = useState(3360);
  const [dailyCap, setDailyCap] = useState(200);
  const [suggestions, setSuggestions] = useState<string[]>([
    "Hostel canteen expenses are above average. Limit coffee & food delivery spending.",
    "Financial runway is healthy for hostel & academic needs."
  ]);

  const fetchBudgetSummary = async () => {
    try {
      const summary = await budgetApi.getSummary();
      if (summary.remaining_balance !== undefined) setRemainingBalance(summary.remaining_balance);
      if (summary.predicted_monthly_total !== undefined) setPredictedTotal(summary.predicted_monthly_total);
      if (summary.daily_cap !== undefined) setDailyCap(summary.daily_cap);
      if (summary.suggestions) setSuggestions(summary.suggestions);
    } catch (err) {
      console.warn("Budget summary fallback:", err);
    }
  };

  const fetchExpenses = async () => {
    try {
      const data = await budgetApi.getExpenses();
      if (data && data.length > 0) {
        setExpenses(data.map((item: any) => ({
          id: item.id.toString(),
          title: item.title,
          amount: item.amount,
          category: item.category,
          date: item.date
        })));
      }
    } catch (err) {
      console.warn("Expenses list fallback:", err);
    }
  };

  useEffect(() => {
    fetchExpenses();
    fetchBudgetSummary();
  }, []);

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput || !amountInput) return;

    const newAmt = parseFloat(amountInput);
    const newTitle = titleInput;
    const newCat = categoryInput;

    setTitleInput("");
    setAmountInput("");

    // Optimistic UI update
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      title: newTitle,
      amount: newAmt,
      category: newCat,
      date: "Today",
    };

    setExpenses((prev) => [newItem, ...prev]);

    try {
      await budgetApi.createExpense({
        title: newTitle,
        amount: newAmt,
        category: newCat,
        date: "Today",
      });
      fetchExpenses();
      fetchBudgetSummary();
    } catch (err) {
      console.warn("Failed to persist expense:", err);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4 md:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase">
            STUDENT FINANCES
          </span>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-white">
            Smart Budget Manager
          </h1>
          <p className="text-xs text-[#c7c4d8] mt-1">
            ML Linear Regression spending predictions and hostel runway tracking.
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#c7c4d8]">March Budget Balance</p>
          <p className="text-2xl font-headline font-black text-emerald-400">₹{remainingBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Forecast & AI Suggestions Banner */}
      <div className="glass-card p-5 rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400 text-lg">insights</span>
            <span className="text-xs font-bold text-white">ML Linear Regression Spending Forecast</span>
          </div>
          <p className="text-xs text-[#c7c4d8] mt-1">
            Predicted Monthly Spend: <strong className="text-white">₹{predictedTotal.toLocaleString()}</strong> • Daily Cap: <strong className="text-emerald-400">₹{dailyCap}/day</strong>
          </p>
        </div>
        <div className="space-y-1 text-left sm:text-right">
          {suggestions.map((s, idx) => (
            <p key={idx} className="text-[11px] text-[#c3c0ff]">💡 {s}</p>
          ))}
        </div>
      </div>

      {/* Grid: Expense Logger + History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Form */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <h3 className="font-headline font-bold text-lg text-white">Log Expense</h3>
          <form onSubmit={handleAddExpense} className="space-y-3">
            <div>
              <label className="text-xs text-[#c7c4d8]">Description</label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Canteen Lunch"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs text-[#c7c4d8]">Amount (₹)</label>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="150"
                className="w-full mt-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-xs text-[#c7c4d8]">Category</label>
              <select
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                className="w-full mt-1 bg-[#131314] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Food">Food & Canteen</option>
                <option value="Academics">Academics & Books</option>
                <option value="Utilities">Utilities & Recharge</option>
                <option value="Leisure">Leisure & Travel</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-500 text-black font-bold text-xs rounded-xl hover:brightness-110 transition-all"
            >
              Record Expense
            </button>
          </form>
        </div>

        {/* Expense Log Table */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-headline font-bold text-lg text-white">Recent Transactions</h3>
            <span className="text-xs text-[#c7c4d8]">Total Logged: ₹{totalSpent}</span>
          </div>

          <div className="space-y-2">
            {expenses.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold text-xs text-white">{item.title}</h4>
                  <p className="text-[10px] text-[#c7c4d8]">{item.date} • {item.category}</p>
                </div>
                <span className="font-mono font-bold text-xs text-red-300">-₹{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
