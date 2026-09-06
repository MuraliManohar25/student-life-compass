import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShoppingItem } from '../types';
import {
  getBudgetSummary,
  getExpenses,
  createExpense,
  deleteExpense,
  BudgetSummaryResponse,
  ExpenseOut,
  ApiError,
} from '../lib/api';

interface FinanceScreenProps {
  shoppingItems: ShoppingItem[];
  onToggleShoppingItem: (id: string) => void;
}

export const FinanceScreen: React.FC<FinanceScreenProps> = ({
  shoppingItems,
  onToggleShoppingItem
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummaryResponse | null>(null);
  const [expenses, setExpenses] = useState<ExpenseOut[]>([]);

  // Add Expense Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newCategory, setNewCategory] = useState('Food & Mess');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reserve modal state
  const [selectedDay, setSelectedDay] = useState<string>('wed');
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadFinanceData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [summary, expenseList] = await Promise.all([
        getBudgetSummary(),
        getExpenses(),
      ]);
      setBudgetSummary(summary);
      setExpenses(expenseList);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Could not load your finance data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAmount || parseFloat(newAmount) <= 0) return;
    setIsSubmitting(true);
    try {
      await createExpense({
        title: newTitle.trim(),
        amount: parseFloat(newAmount),
        category: newCategory,
        date: new Date().toISOString(),
      });
      setNewTitle('');
      setNewAmount('');
      setShowAddModal(false);
      await loadFinanceData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to add expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id);
      await loadFinanceData();
    } catch {
      alert('Could not delete expense.');
    }
  };

  const handleConfirmReservation = () => {
    setReserveSuccess(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setReserveSuccess(false);
      setShowReserveModal(false);
    }, 1800);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-medium text-gray-500">Loading your allowance & expenses…</span>
        </div>
      </div>
    );
  }

  if (loadError || !budgetSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 px-6 text-center">
        <span className="material-symbols-outlined text-[32px] text-red-500">error</span>
        <p className="text-sm text-gray-600">{loadError || 'Failed to load finance data.'}</p>
        <button
          onClick={loadFinanceData}
          type="button"
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const remainingBalance = budgetSummary.remaining_balance;
  const monthlyBudget = budgetSummary.monthly_budget;
  const totalSpent = budgetSummary.total_spent;
  const spentPercent = monthlyBudget > 0 ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100)) : 0;
  const isHealthy = remainingBalance > budgetSummary.daily_cap * 3;

  const selectedItemsTotal = shoppingItems
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price, 0);

  const projectedBalance = remainingBalance - selectedItemsTotal;

  const categoryBreakdown = budgetSummary.category_breakdown || {};
  const categories = Object.keys(categoryBreakdown).length > 0
    ? Object.entries(categoryBreakdown).map(([cat, amount]) => ({
        name: cat,
        amount: amount as number,
        percent: totalSpent > 0 ? Math.round(((amount as number) / totalSpent) * 100) : 0,
      }))
    : [];

  const getCategoryIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('food') || lower.includes('mess') || lower.includes('canteen')) return 'restaurant';
    if (lower.includes('book') || lower.includes('stationery') || lower.includes('study')) return 'menu_book';
    if (lower.includes('movie') || lower.includes('entertain')) return 'movie';
    if (lower.includes('metro') || lower.includes('travel') || lower.includes('commute')) return 'directions_subway';
    return 'account_balance_wallet';
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 space-y-6 max-w-[1400px] mx-auto pb-6 pt-1 lg:pt-2">
      {/* Header bar with Add Expense Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a]">Finance & Budget Manager</h1>
          <p className="text-xs text-gray-500">Live tracking of your monthly allowance & spending pulse</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          type="button"
          className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add Expense</span>
        </button>
      </div>

      {/* 2-Column Responsive Dashboard Layout on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Allowance Balance & Category Outflow */}
        <div className="lg:col-span-5 space-y-6">
          {/* SECTION 1: ALLOWANCE BALANCE CARD */}
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-xs p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Monthly Allowance
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-3xl font-light text-[#1a1a1a] tracking-tight">
                    ₹{remainingBalance.toFixed(0)}
                  </span>
                  <span className="text-xs text-gray-400 font-normal">remaining</span>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  isHealthy
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                    : 'bg-amber-50 text-amber-700 border-amber-200/50'
                }`}
              >
                {isHealthy ? 'On Track' : 'Watch Spending'}
              </span>
            </div>

            {/* Vital metadata strip */}
            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">account_balance</span>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Total Budget</span>
                  <span className="text-xs font-semibold text-[#1a1a1a]">₹{monthlyBudget.toFixed(0)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">speed</span>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Daily Safe Limit</span>
                  <span className="text-xs font-semibold text-[#1a1a1a]">₹{budgetSummary.daily_cap.toFixed(0)} / day</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: CATEGORY OUTFLOW */}
          <div className="bg-white rounded-2xl shadow-xs p-5 space-y-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1a1a1a]">Category Outflow</h2>
              <span className="text-[11px] text-indigo-600 font-bold">₹{totalSpent.toFixed(0)} Total Spent</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-gray-50 space-y-1 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-indigo-600 text-[18px]">
                      {getCategoryIcon(cat.name)}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500">{cat.percent}%</span>
                  </div>
                  <span className="text-[11px] text-gray-600 block font-medium truncate">{cat.name}</span>
                  <span className="text-[15px] font-bold text-[#1a1a1a] block">₹{cat.amount.toFixed(0)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT EXPENSES LIST */}
          <div className="bg-white rounded-2xl shadow-xs p-5 space-y-3 border border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1a1a1a]">Recent Expenses</h2>
              <span className="text-[10px] text-gray-400 font-semibold uppercase">{expenses.length} records</span>
            </div>

            {expenses.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">No expenses recorded yet. Click "Add Expense" above to start.</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="material-symbols-outlined text-indigo-600 text-[16px]">
                        {getCategoryIcon(exp.category)}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-[#1a1a1a] block truncate">{exp.title}</span>
                        <span className="text-[10px] text-gray-400 block uppercase">{exp.category} • {exp.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-[#1a1a1a]">₹{exp.amount.toFixed(0)}</span>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        className="text-gray-300 hover:text-red-500 cursor-pointer p-0.5"
                        type="button"
                        title="Delete expense"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Monthly Spend Pulse & Smart Campus Shopping */}
        <div className="lg:col-span-7 space-y-6">
          {/* SECTION 2: MONTHLY SPEND PULSE */}
          <div className="bg-white rounded-2xl shadow-xs p-6 space-y-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <h2 className="text-xs uppercase tracking-widest text-gray-500 font-semibold">Monthly Spend Pulse</h2>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Allocated: <strong className="text-[#1a1a1a]">₹{monthlyBudget.toFixed(0)}</strong>
              </span>
            </div>

            {/* Progress Bar with Split Targets */}
            <div className="space-y-2">
              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${spentPercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Spent: ₹{totalSpent.toFixed(0)}</span>
                <span className="text-indigo-600 font-semibold">{spentPercent}% spent</span>
                <span>Budget: ₹{monthlyBudget.toFixed(0)}</span>
              </div>
            </div>

            {/* Daily Pace Visual Bars */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span className="font-semibold text-[#1a1a1a]">Weekly Pace</span>
                <span>Safe Cap: ₹{budgetSummary.daily_cap.toFixed(0)}/day</span>
              </div>
              <div className="flex items-end justify-between px-2 h-16 pt-2">
                {(budgetSummary.weekly_spending.length ? budgetSummary.weekly_spending : []).map((item) => {
                  const max = Math.max(...budgetSummary.weekly_spending.map((point) => point.amount), 1);
                  const height = Math.max(4, Math.round((item.amount / max) * 48));
                  return (
                  <button
                    key={item.day}
                    onClick={() => setSelectedDay(item.day)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
                    type="button"
                    title={`${item.day}: ₹${item.amount}`}
                  >
                    <div
                      className={`w-4 rounded-t-sm transition-all ${
                        selectedDay === item.day
                          ? 'bg-indigo-600'
                          : 'bg-gray-100 group-hover:bg-indigo-200'
                      }`}
                      style={{ height }}
                    />
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        selectedDay === item.day
                          ? 'text-indigo-600 font-bold'
                          : 'text-gray-400'
                      }`}
                    >
                      {item.day.slice(0, 1)}
                    </span>
                  </button>
                )})}
                {!budgetSummary.weekly_spending.length && <span className="text-xs text-gray-400 m-auto">No spending recorded this week.</span>}
              </div>
            </div>

            {/* Dynamic AI Spending Nudge */}
            {budgetSummary.suggestions[0] && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-indigo-600 text-[20px] shrink-0 mt-0.5">
                  auto_awesome
                </span>
                <p className="text-[12px] text-indigo-900 leading-relaxed font-medium">
                  {budgetSummary.suggestions[0]}
                </p>
              </div>
            )}
          </div>

          {/* SECTION 4: SMART CAMPUS SHOPPING */}
          <section className="space-y-3">
            <div className="flex items-center justify-between px-0.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  <h2 className="text-[17px] font-bold text-[#1a1a1a]">Smart Campus Shopping</h2>
                </div>
                <p className="text-[12px] text-gray-500">
                  Filtered strictly for your ₹{remainingBalance.toFixed(0)} safe limit
                </p>
              </div>
              <span className="text-[11px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200/50">
                AI Vetted
              </span>
            </div>

            {/* Shopping Items List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shoppingItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl bg-white shadow-xs flex flex-col justify-between space-y-3 transition-all border ${
                    item.selected
                      ? 'border-indigo-600/40 bg-indigo-50/20'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 shadow-xs">
                      <img
                        className="w-full h-full object-cover"
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h3 className="text-[13px] font-bold text-[#1a1a1a] truncate">{item.name}</h3>
                        <span className="text-[13px] font-bold text-indigo-600 shrink-0">₹{item.price}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {item.budgetImpact}
                    </span>
                    <button
                      onClick={() => onToggleShoppingItem(item.id)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        item.selected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      type="button"
                    >
                      {item.selected ? '✓ Included' : '+ Add'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Balance Post-Purchase Sticky Simulation Card */}
            <div className="p-4 rounded-2xl bg-white shadow-xs space-y-3 border border-gray-200 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-gray-600">
                  Simulated Balance Post-Purchase
                </span>
                <span
                  className={`text-[17px] font-bold ${
                    projectedBalance >= 500 ? 'text-indigo-600' : 'text-red-600'
                  }`}
                >
                  ₹{projectedBalance >= 0 ? projectedBalance.toFixed(0) : 0}
                </span>
              </div>

              <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    projectedBalance >= 500 ? 'bg-indigo-600' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.max(0, Math.min(100, (projectedBalance / Math.max(1, remainingBalance)) * 100))}%`
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500">
                <span>
                  {selectedItemsTotal > 0
                    ? `${shoppingItems.filter((i) => i.selected).length} items selected (₹${selectedItemsTotal})`
                    : 'No items selected'}
                </span>
                <span className="font-semibold text-indigo-600">
                  {projectedBalance >= 500 ? 'Safe buffer remaining' : 'Approaching limit'}
                </span>
              </div>

              <button
                onClick={() => setShowReserveModal(true)}
                disabled={selectedItemsTotal === 0}
                className={`w-full py-3 rounded-xl text-[13px] font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedItemsTotal > 0
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.99]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                <span>Review Campus Reserve (₹{selectedItemsTotal})</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* ADD EXPENSE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <form
            onSubmit={handleAddExpense}
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 border border-gray-200 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#1a1a1a]">Record New Expense</h3>
              <button
                onClick={() => setShowAddModal(false)}
                type="button"
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Canteen Lunch, Bus Pass"
                  className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1a1a1a] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1a1a1a] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-[#1a1a1a] focus:outline-none focus:border-indigo-600"
                >
                  <option value="Food & Mess">Food & Mess</option>
                  <option value="Stationery & Books">Stationery & Books</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Metro & Commute">Metro & Commute</option>
                  <option value="Shopping & Essentials">Shopping & Essentials</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving…' : 'Save Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESERVE CONFIRMATION MODAL */}
      {showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-indigo-600 uppercase tracking-wider">
                Campus Hold Reservation
              </span>
              <button
                onClick={() => setShowReserveModal(false)}
                className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-200"
                type="button"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-[16px] font-bold text-[#1a1a1a]">Lock Student Price for 48 Hours?</h3>
              <p className="text-[12px] text-gray-500 leading-relaxed">
                Items will be held at University Store & Partner senior hubs with guaranteed student pricing.
                No immediate payment deducted from allowance.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 space-y-1.5 text-[12px] border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Hold Total</span>
                <span className="font-bold text-[#1a1a1a]">₹{selectedItemsTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Projected Remaining Safe Balance</span>
                <span className="font-bold text-indigo-600">₹{projectedBalance.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hold Validity</span>
                <span className="font-semibold text-indigo-600">48 Hours (Free Cancellation)</span>
              </div>
            </div>

            <div className="pt-1 flex gap-2">
              <button
                onClick={() => setShowReserveModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-[12px] font-semibold cursor-pointer"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReservation}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-[12px] font-semibold cursor-pointer flex items-center justify-center gap-1 hover:bg-indigo-700"
                type="button"
              >
                {reserveSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Reserved!</span>
                  </>
                ) : (
                  <span>Confirm Hold</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
