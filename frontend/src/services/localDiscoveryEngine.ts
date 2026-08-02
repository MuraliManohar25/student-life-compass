// Local Discovery Engine: Calculates AI Recommendation Scores, dynamic AI explanations, student highlights, and handles visited expense recording synced with BudgetEngine & PerformanceEngine.

import { RealPlace } from "./overpassApi";
import { BudgetEngine } from "./budgetEngine";

export interface EvaluatedPlace extends RealPlace {
  budgetMatchPercent: number;
  aiScorePercent: number;
  status: "Highly Recommended" | "Affordable" | "Moderate Spend" | "Not Recommended";
  statusColor: string;
  explanations: string[];
  notRecommendedReason?: string;
  afterVisitRemainingBudget: number;
  afterVisitSafeDailyLimit: number;
}

export interface VisitedRecord {
  id: string;
  placeId: string;
  placeName: string;
  category: string;
  dateStr: string;
  amountSpent: number;
  walkingTimeMins: number;
  timestamp: string;
}

export interface StudentHighlights {
  affordableLunch?: EvaluatedPlace;
  studyCafe?: EvaluatedPlace;
  groupStudy?: EvaluatedPlace;
  nearestHospital?: EvaluatedPlace;
  stationery?: EvaluatedPlace;
  closestBusStop?: EvaluatedPlace;
}

const FAVORITES_KEY = "compass_favorites_v1";
const VISITED_KEY = "compass_visited_v1";

export class LocalDiscoveryEngine {
  // Evaluate AI Recommendation Scores for an array of real places against current budget
  public static evaluatePlaces(places: RealPlace[], monthKey?: string): EvaluatedPlace[] {
    const budgetCalcs = BudgetEngine.getCalculations(monthKey);
    const safeLimit = budgetCalcs.safeDailyLimit || 180;
    const remainingMonthly = budgetCalcs.remainingBudget;

    return places.map((place) => {
      const cost = place.estimatedCost;

      // 1. 40% Budget Match
      let budgetMatchPercent = 100;
      if (cost <= 0) {
        budgetMatchPercent = 100;
      } else if (cost <= safeLimit) {
        budgetMatchPercent = Math.round(100 - (cost / safeLimit) * 20);
      } else {
        const overbudgetRatio = (cost - safeLimit) / safeLimit;
        budgetMatchPercent = Math.max(5, Math.round(75 - overbudgetRatio * 100));
      }

      // 2. 25% Distance Score
      const distanceScore = Math.max(0, Math.round(100 - (place.distanceMeters / 2000) * 100));

      // 3. 20% Rating Score
      const ratingScore = Math.round((place.rating / 5.0) * 100);

      // 4. 15% Student Friendliness
      let studentFriendliness = 70;
      if (place.hasWifi) studentFriendliness += 15;
      if (place.isStudentFriendly) studentFriendliness += 10;
      if (cost <= 150) studentFriendliness += 10;
      studentFriendliness = Math.min(100, studentFriendliness);

      // Weighted AI Score
      const aiScorePercent = Math.round(
        budgetMatchPercent * 0.4 +
          distanceScore * 0.25 +
          ratingScore * 0.2 +
          studentFriendliness * 0.15
      );

      // Status Badges & Colors
      let status: EvaluatedPlace["status"] = "Affordable";
      let statusColor = "bg-[#4f46e5]/20 text-[#c3c0ff] border-[#4f46e5]/30";
      let notRecommendedReason: string | undefined = undefined;

      if (cost > safeLimit * 1.5 || aiScorePercent < 50) {
        status = "Not Recommended";
        statusColor = "bg-rose-500/20 text-rose-300 border-rose-500/30";
        notRecommendedReason = `This purchase (₹${cost}) exceeds today's safe spending limit (₹${safeLimit}) by ₹${cost - safeLimit}.`;
      } else if (aiScorePercent >= 85) {
        status = "Highly Recommended";
        statusColor = "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      } else if (aiScorePercent >= 70) {
        status = "Affordable";
        statusColor = "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      } else {
        status = "Moderate Spend";
        statusColor = "bg-amber-500/20 text-amber-300 border-amber-500/30";
      }

      // Dynamic AI Explanation Points
      const explanations: string[] = [];

      if (cost === 0) {
        explanations.push("Free amenity (100% budget fit)");
      } else if (cost <= safeLimit) {
        explanations.push(`Fits today's budget (₹${cost} vs ₹${safeLimit} safe limit)`);
      } else {
        explanations.push(`⚠️ Exceeds today's safe daily limit (₹${cost} vs ₹${safeLimit})`);
      }

      explanations.push(`Only ${place.walkingTimeMins} minute(s) walking distance (${place.distanceMeters} m)`);

      if (place.hasWifi) explanations.push("Free Wi-Fi & study-friendly environment");
      else if (place.isStudentFriendly) explanations.push("Affordable pricing popular among students");

      explanations.push(`Highly rated by peers (${place.rating} ⭐)`);

      // Simulated Expense Prediction after visit
      const afterVisitRemainingBudget = Math.max(0, remainingMonthly - cost);
      const afterVisitSafeDailyLimit = Math.max(0, safeLimit - cost);

      return {
        ...place,
        budgetMatchPercent,
        aiScorePercent,
        status,
        statusColor,
        explanations,
        notRecommendedReason,
        afterVisitRemainingBudget,
        afterVisitSafeDailyLimit,
      };
    });
  }

  // Generate Top Student Highlights (Affordable Lunch, Study Cafe, Hospital, etc.)
  public static getStudentHighlights(evaluated: EvaluatedPlace[]): StudentHighlights {
    const sorted = [...evaluated].sort((a, b) => b.aiScorePercent - a.aiScorePercent);

    const affordableLunch = sorted.find(
      (p) => p.category === "Restaurant" || p.category === "Fast Food" || p.category === "Cafe"
    );
    const studyCafe = sorted.find((p) => p.category === "Cafe" || p.hasWifi);
    const groupStudy = sorted.find((p) => p.category === "Library" || (p.category === "Cafe" && p.hasWifi));
    const nearestHospital = [...evaluated]
      .filter((p) => p.category === "Hospital" || p.category === "Medical Store")
      .sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
    const stationery = sorted.find((p) => p.category === "Stationery" || p.category === "Supermarket");
    const closestBusStop = [...evaluated]
      .filter((p) => p.category === "Bus Stop")
      .sort((a, b) => a.distanceMeters - b.distanceMeters)[0];

    return {
      affordableLunch,
      studyCafe,
      groupStudy,
      nearestHospital,
      stationery,
      closestBusStop,
    };
  }

  // Favorites Management
  public static getFavorites(): string[] {
    try {
      const raw = localStorage.getItem(FAVORITES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static toggleFavorite(placeId: string): string[] {
    const favs = LocalDiscoveryEngine.getFavorites();
    const idx = favs.indexOf(placeId);
    let next: string[] = [];
    if (idx === -1) {
      next = [...favs, placeId];
    } else {
      next = favs.filter((id) => id !== placeId);
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    return next;
  }

  // Visited Log Management & Sync with Budget Engine
  public static getVisitedHistory(): VisitedRecord[] {
    try {
      const raw = localStorage.getItem(VISITED_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static recordVisit(
    place: RealPlace,
    amountSpent: number,
    monthKey?: string
  ): VisitedRecord[] {
    const history = LocalDiscoveryEngine.getVisitedHistory();
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    const timestamp = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newRecord: VisitedRecord = {
      id: `vis-${Date.now()}`,
      placeId: place.id,
      placeName: place.name,
      category: place.category,
      dateStr,
      amountSpent,
      walkingTimeMins: place.walkingTimeMins,
      timestamp,
    };

    const updated = [newRecord, ...history];
    localStorage.setItem(VISITED_KEY, JSON.stringify(updated));

    // SYNC WITH BUDGET ENGINE: Automatically adds expense transaction to current month!
    if (amountSpent > 0) {
      try {
        let budgetCat: any = "Others";
        if (place.category === "Cafe" || place.category === "Restaurant" || place.category === "Fast Food") {
          budgetCat = "Food";
        } else if (place.category === "Gym") {
          budgetCat = "Entertainment";
        } else if (place.category === "Medical Store" || place.category === "Hospital") {
          budgetCat = "Medical";
        } else if (place.category === "Stationery" || place.category === "Library") {
          budgetCat = "Education";
        } else if (place.category === "Bus Stop") {
          budgetCat = "Transport";
        } else if (place.category === "Supermarket") {
          budgetCat = "Shopping";
        }

        BudgetEngine.addExpense(monthKey || "2026-08", {
          title: `Visited ${place.name}`,
          category: budgetCat,
          amount: amountSpent,
          date: now.toISOString().split("T")[0],
          paymentMethod: "UPI",
          notes: `Logged from Student Local Discovery (${place.walkingTimeMins} min walk)`,
        });
      } catch (err) {
        console.warn("Failed to sync visited expense to budget:", err);
      }
    }

    return updated;
  }
}
