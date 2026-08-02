import React, { useState } from "react";
import { BudgetExpense } from "../../services/budgetEngine";

interface ExpenseModalProps {
  isOpen: boolean;
  expense?: BudgetExpense | null;
  currency: string;
  onClose: () => void;
  onSave: (expenseData: Omit<BudgetExpense, "id" | "createdAt"> | BudgetExpense) => void;
}

// Add/Edit Expense Modal with full field controls
export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  expense,
  currency,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState(expense?.title || "");
  const [amount, setAmount] = useState(expense?.amount || "");
  const [category, setCategory] = useState<BudgetExpense["category"]>(expense?.category || "Food");
  const [date, setDate] = useState(expense?.date || new Date().toISOString().split("T")[0]);
  const [paymentMethod, setPaymentMethod] = useState<BudgetExpense["paymentMethod"]>(
    expense?.paymentMethod || "UPI"
  );
  const [notes, setNotes] = useState(expense?.notes || "");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmt = parseFloat(amount.toString());
    if (!title.trim() || isNaN(numAmt) || numAmt <= 0) return;

    const payload = {
      title,
      category,
      amount: numAmt,
      date,
      paymentMethod,
      notes,
    };

    if (expense) {
      onSave({ ...payload, id: expense.id, createdAt: expense.createdAt });
    } else {
      onSave(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/20 max-w-lg w-full bg-[#161626]/95 text-white space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="font-headline font-bold text-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-400">payments</span>
            <span>{expense ? "Edit Expense" : "Record New Expense"}</span>
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-[#c7c4d8] hover:text-white hover:bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Expense Title */}
          <div>
            <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
              Expense Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Canteen Lunch / Book Purchase"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Amount & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Amount ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#c3c0ff]">
                  {currency}
                </span>
                <input
                  type="number"
                  required
                  min={1}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="250"
                  className="w-full pl-9 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#1f1f33] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Food">Food & Dining</option>
                <option value="Transport">Transport & Fuel</option>
                <option value="Shopping">Shopping & Lifestyle</option>
                <option value="Education">Education & Books</option>
                <option value="Entertainment">Entertainment & Outing</option>
                <option value="Medical">Medical & Health</option>
                <option value="Bills">Bills & Recharges</option>
                <option value="Subscriptions">Subscriptions & Software</option>
                <option value="Others">Others</option>
              </select>
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-[#1f1f33] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="UPI">UPI / GPay / PhonePe</option>
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Net Banking">Net Banking</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Hostel Wi-Fi quarterly renewal"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Action Buttons */}
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
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
