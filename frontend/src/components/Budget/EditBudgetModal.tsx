import React, { useState } from "react";

interface EditBudgetModalProps {
  isOpen: boolean;
  currentBudget: number;
  currentIncome: number;
  currentGoal: number;
  currentCurrency: string;
  monthLabel: string;
  onClose: () => void;
  onSave: (budget: number, income: number, goal: number, currency: string) => void;
}

// Edit Budget Modal: User can change Monthly Budget, Select Currency, Add Monthly Income, Set Saving Goal
export const EditBudgetModal: React.FC<EditBudgetModalProps> = ({
  isOpen,
  currentBudget,
  currentIncome,
  currentGoal,
  currentCurrency,
  monthLabel,
  onClose,
  onSave,
}) => {
  const [budget, setBudget] = useState(currentBudget);
  const [income, setIncome] = useState(currentIncome);
  const [goal, setGoal] = useState(currentGoal);
  const [currency, setCurrency] = useState(currentCurrency || "₹");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(budget, income, goal, currency);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/20 max-w-md w-full bg-[#161626]/95 text-white space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h2 className="font-headline font-bold text-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">edit_note</span>
              <span>Edit Budget Config</span>
            </h2>
            <p className="text-xs text-[#c7c4d8] mt-0.5">{monthLabel}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#c7c4d8] hover:text-white hover:bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Currency Selector */}
          <div>
            <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
              Select Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#1f1f33] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="₹">INR (₹)</option>
              <option value="$">USD ($)</option>
              <option value="€">EUR (€)</option>
              <option value="£">GBP (£)</option>
            </select>
          </div>

          {/* Monthly Budget */}
          <div>
            <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
              Monthly Budget *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#c3c0ff]">
                {currency}
              </span>
              <input
                type="number"
                required
                min={1}
                value={budget}
                onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
                placeholder="8000"
                className="w-full pl-9 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold"
              />
            </div>
          </div>

          {/* Monthly Income (Optional) */}
          <div>
            <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
              Monthly Income (Optional)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#c3c0ff]">
                {currency}
              </span>
              <input
                type="number"
                min={0}
                value={income}
                onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                placeholder="12000"
                className="w-full pl-9 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold"
              />
            </div>
          </div>

          {/* Saving Goal */}
          <div>
            <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
              Monthly Saving Goal
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#c3c0ff]">
                {currency}
              </span>
              <input
                type="number"
                min={0}
                value={goal}
                onChange={(e) => setGoal(parseFloat(e.target.value) || 0)}
                placeholder="2000"
                className="w-full pl-9 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-[#c7c4d8] hover:text-white hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/30"
            >
              Save Budget Config
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
