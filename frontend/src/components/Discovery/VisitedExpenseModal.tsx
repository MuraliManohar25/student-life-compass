import React, { useState } from "react";
import { RealPlace } from "../../services/overpassApi";

interface VisitedExpenseModalProps {
  isOpen: boolean;
  place: RealPlace | null;
  currency: string;
  onClose: () => void;
  onConfirm: (amountSpent: number) => void;
}

// Modal prompted when user marks a place as "Visited"
export const VisitedExpenseModal: React.FC<VisitedExpenseModalProps> = ({
  isOpen,
  place,
  currency,
  onClose,
  onConfirm,
}) => {
  const [amount, setAmount] = useState<string>(place?.estimatedCost?.toString() || "120");

  if (!isOpen || !place) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(amount);
    onConfirm(isNaN(parsed) || parsed < 0 ? 0 : parsed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/20 max-w-md w-full bg-[#161626]/95 text-white space-y-6 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <div>
            <h2 className="font-headline font-bold text-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400">check_circle</span>
              <span>Mark as Visited</span>
            </h2>
            <p className="text-xs text-[#c7c4d8] mt-0.5">{place.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-[#c7c4d8] hover:text-white hover:bg-white/10">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span className="text-[10px] font-bold text-[#c3c0ff] uppercase tracking-wider block">Estimated Cost</span>
            <p className="text-sm font-bold text-white">
              {currency}{place.estimatedCost} ({place.category})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#c3c0ff] uppercase tracking-wider mb-1">
              How much did you actually spend? ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#c3c0ff]">
                {currency}
              </span>
              <input
                type="number"
                required
                min={0}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="120"
                className="w-full pl-9 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-400 font-bold"
              />
            </div>
            <p className="text-[11px] text-[#c7c4d8] mt-1.5">
              💡 Entering this amount automatically syncs this expense into your Budget Predictor & Performance Report!
            </p>
          </div>

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
              Record Visit & Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
