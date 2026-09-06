import React, { useEffect, useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { budgetApi } from "../services/api";
import {
  getCategorySummaries,
  getCurrentMonthKey,
} from "../services/budgetEngine";

interface SmartShoppingProps {
  setActiveTab: (tab: string) => void;
}

const CATEGORY_RECOMMENDATIONS: Record<string, { tip: string; savingsPotential: number }> = {
  Food: {
    tip: "Cook at home more often and meal prep on weekends",
    savingsPotential: 15,
  },
  Transport: {
    tip: "Use public transport or carpooling for daily commute",
    savingsPotential: 10,
  },
  Shopping: {
    tip: "Wait 48 hours before non-essential purchases",
    savingsPotential: 20,
  },
  Education: {
    tip: "Use library resources and buy used textbooks",
    savingsPotential: 12,
  },
  Entertainment: {
    tip: "Free campus events and student discounts available",
    savingsPotential: 8,
  },
  Medical: {
    tip: "Use student health services and generic medications",
    savingsPotential: 5,
  },
  Bills: {
    tip: "Set up autopay discounts and compare utility plans",
    savingsPotential: 10,
  },
  Subscriptions: {
    tip: "Review recurring charges and cancel unused services",
    savingsPotential: 25,
  },
  Others: {
    tip: "Track cash spending and set weekly limits",
    savingsPotential: 10,
  },
};

export const SmartShopping: React.FC<SmartShoppingProps> = ({ setActiveTab }) => {
  const { budgetSummary, intelligenceScore } = useAppData();
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [categoryInsights, setCategoryInsights] = useState<
    Array<{ category: string; spent: number; percentage: number; color: string }>>[];
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShoppingInsights() {
      try {
        const monthKey = getCurrentMonthKey();
        const cats = getCategorySummaries(monthKey);
        const data = await budgetApi.getSummary();

        setCategoryInsights(
          cats.map((cat: any) => ({
            category: cat.category,
            spent: cat.spent,
            percentage: cat.percentageOfBudget,
            color: cat.color,
          }))
        );

        const recs: string[] = [];
        categoryInsights.forEach((cat: any) => {
          if (cat.percentage > 25) {
            const recInfo = CATEGORY_RECOMMENDATIONS[cat.category];
            if (recInfo) {
              recs.push(`${recInfo.tip} (Potential savings: ${recInfo.savingsPotential}% of budget)`);
            }
          }
        });

        if (data.utilization > 70) {
          recs.push("You've spent over 70% of your budget - focus on essentials this week");
        }
        if (data.utilization > 90) {
          recs.push("Critical: Over 90% budget utilization - immediate spending review needed");
        }
        if (data.remainingBudget > 0 && data.utilization < 50) {
          recs.push("Great savings momentum! Consider transferring surplus to savings goal");
        }

        setRecommendations(recs.length > 0 ? recs : [
          "Review your spending categories for optimization opportunities",
          "Set a weekly spending limit to maintain budget health",
          "Consider automating savings transfers each month"
        ]);

        setIsLoading(false);
      } catch (err) {
        console.warn("Failed to load shopping insights:", err);
        setRecommendations([
          "Review your spending categories for optimization opportunities",
          "Set a weekly spending limit to maintain budget health",
        ]);
        setIsLoading(false);
      }
    }

    loadShoppingInsights();
  }, []);
  if (isLoading) {
    return (
      <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent space-y-4">
        <div className="flex items-center justify-between">
          <span className="material-symbols-outlined text-emerald-400 text-xl">shopping_bag</span>
          <h3 className="font-headline font-bold text-lg text-white">Smart Shopping</h3>
        </div>
        <p className="text-sm text-white/80">Loading personalized recommendations...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent space-y-4">
      <div className="flex items-center justify-between">
        <span className="material-symbols-outlined text-emerald-400 text-xl">shopping_bag</span>
        <h3 className="font-headline font-bold text-lg text-white">Smart Shopping</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        {categoryInsights.map((cat) => (
          <div
            key={cat.category}
            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#c3c0ff]">
                {cat.category === "Food" ? "restaurant"
                  : cat.category === "Transport" ? "directions_bus"
                  : cat.category === "Shopping" ? "shopping_bag"
                  : cat.category === "Education" ? "school"
                  : cat.category === "Entertainment" ? "movie"
                  : cat.category === "Medical" ? "medical_services"
                  : cat.category === "Bills" ? "receipt_long"
                  : cat.category === "Subscriptions" ? "subscriptions"
                  : "category"}
              </span>
              <span className="font-bold text-white">{cat.category}</span>
            </div>
            <div className="text-xs text-[#c7c4d8] uppercase mb-1">Spent:₹{cat.spent.toLocaleString()}</div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                style={{ width: `${cat.percentage}%` }}
                className={`h-full ${cat.percentage > 70 ? "bg-rose-400" : cat.percentage > 50 ? "bg-amber-400" : "bg-emerald-400"} rounded-full transition-all duration-700`}
              />
            </div>
            <div className="text-[9px] text-[#c7c4d8] uppercase">
              {cat.percentage}% of budget
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <p className="text-xs text-[#c7c4d8] uppercase mb-2">Personalized Recommendations</p>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white flex items-start gap-2.5"
            >
              <span className="material-symbols-outlined text-sm text-emerald-400 mt-0.5">
                lightbulb
              </span>
              <span className="leading-relaxed">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-white/10">
        <button
          onClick={() => setActiveTab("finance")}
          className="w-full py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-emerald-500/30"
        >
          View Full Budget & Manage Expenses
        </button>
      </div>
    </div>
  );
};