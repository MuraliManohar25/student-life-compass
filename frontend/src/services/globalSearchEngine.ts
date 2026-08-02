// Global Real-Time Search Engine for Student Life Compass
import { NavTab } from "../types";
import { TaskEngine } from "./taskEngine";
import { BudgetEngine, getCurrentMonthKey } from "./budgetEngine";
import { PerformanceEngine } from "./performanceEngine";
import { RiskAnalysisEngine } from "./riskAnalysisEngine";
import { nearbyPlacesStore } from "./nearbyPlacesStore";

export interface SearchResultItem {
  id: string;
  title: string;
  moduleName:
    | "Study Planner"
    | "Budget Predictor"
    | "Performance Report"
    | "Nearby Places"
    | "AI Assistant"
    | "Career Mentor"
    | "Horizon Events"
    | "Risk Predictor"
    | "Dashboard";
  moduleTab: NavTab;
  description: string;
  icon: string;
  priorityScore: number; // Higher is ranked first
}

export interface GroupedSearchResult {
  moduleName: string;
  moduleTab: NavTab;
  items: SearchResultItem[];
}

export class GlobalSearchEngine {
  public static search(query: string, currentTab?: NavTab): GroupedSearchResult[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];
    const monthKey = getCurrentMonthKey();

    // Helper to calculate ranking score
    const calcPriority = (title: string, desc: string, moduleTab: NavTab, baseWeight: number = 50): number => {
      const lowerTitle = title.toLowerCase();
      const lowerDesc = desc.toLowerCase();
      let score = baseWeight;

      // 1. Exact Match on title
      if (lowerTitle === q) score += 100;
      else if (lowerTitle.startsWith(q)) score += 60;
      else if (lowerTitle.includes(q)) score += 40;

      // Partial match on description
      if (lowerDesc.includes(q)) score += 20;

      // 2. Current Page / Active Module priority boost
      if (currentTab && moduleTab === currentTab) score += 25;

      return score;
    };

    // ----------------------------------------------------
    // 1. STUDY PLANNER & DASHBOARD TASKS
    // ----------------------------------------------------
    try {
      const tasks = TaskEngine.getTodayTasks();
      tasks.forEach((t) => {
        if (t.title.toLowerCase().includes(q) || (t.category && t.category.toLowerCase().includes(q))) {
          results.push({
            id: `task-${t.id}`,
            title: t.title,
            moduleName: "Study Planner",
            moduleTab: "study-planner",
            description: `Task (${t.category || "General"}) • ${t.completed ? "Completed" : "Pending"}`,
            icon: "event_note",
            priorityScore: calcPriority(t.title, t.category || "", "study-planner", 70),
          });
        }
      });
    } catch {}

    // ----------------------------------------------------
    // 2. BUDGET PREDICTOR & EXPENSES
    // ----------------------------------------------------
    try {
      const budgetCalcs = BudgetEngine.getCalculations(monthKey);
      const expenses = BudgetEngine.getExpenses(monthKey);

      if ("budget".includes(q) || "spending".includes(q) || "runway".includes(q) || "money".includes(q)) {
        results.push({
          id: "budget-monthly",
          title: "Monthly Budget Runway",
          moduleName: "Budget Predictor",
          moduleTab: "budget",
          description: `Total: ${budgetCalcs.currency}${budgetCalcs.monthlyBudget.toLocaleString()} • Spent: ${budgetCalcs.currency}${budgetCalcs.totalSpent.toLocaleString()}`,
          icon: "payments",
          priorityScore: calcPriority("Monthly Budget Runway", "budget spending runway", "budget", 85),
        });

        results.push({
          id: "budget-remaining",
          title: "Remaining Budget & Daily Cap",
          moduleName: "Budget Predictor",
          moduleTab: "budget",
          description: `Remaining: ${budgetCalcs.currency}${budgetCalcs.remainingBudget.toLocaleString()} • Safe Daily Cap: ${budgetCalcs.currency}${budgetCalcs.safeDailyLimit}`,
          icon: "account_balance_wallet",
          priorityScore: calcPriority("Remaining Budget & Daily Cap", "remaining budget", "budget", 80),
        });
      }

      expenses.forEach((e) => {
        if (e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)) {
          results.push({
            id: `exp-${e.id}`,
            title: e.title,
            moduleName: "Budget Predictor",
            moduleTab: "budget",
            description: `Expense: ${budgetCalcs.currency}${e.amount} (${e.category}) • ${e.date}`,
            icon: "receipt_long",
            priorityScore: calcPriority(e.title, e.category, "budget", 60),
          });
        }
      });

      budgetCalcs.suggestions.forEach((sug, idx) => {
        if (sug.toLowerCase().includes(q)) {
          results.push({
            id: `bud-sug-${idx}`,
            title: "Budget AI Recommendation",
            moduleName: "Budget Predictor",
            moduleTab: "budget",
            description: sug,
            icon: "auto_awesome",
            priorityScore: calcPriority("Budget AI Recommendation", sug, "budget", 65),
          });
        }
      });
    } catch {}

    // ----------------------------------------------------
    // 3. NEARBY PLACES
    // ----------------------------------------------------
    try {
      const places = nearbyPlacesStore.getState().evaluatedPlaces;

      if ("nearby".includes(q) || "places".includes(q) || "map".includes(q) || "library".includes(q) || "cafe".includes(q)) {
        results.push({
          id: "nearby-shortcut",
          title: "Nearby Places Local Discovery Map",
          moduleName: "Nearby Places",
          moduleTab: "nearby-places",
          description: `${places.length} real student amenities discovered near your GPS location.`,
          icon: "map",
          priorityScore: calcPriority("Nearby Places Local Discovery", "nearby map places", "nearby-places", 75),
        });
      }

      places.forEach((p) => {
        if (
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q)
        ) {
          results.push({
            id: `place-${p.id}`,
            title: p.name,
            moduleName: "Nearby Places",
            moduleTab: "nearby-places",
            description: `${p.category} • ${p.distanceMeters}m (${p.walkingTimeMins}m walk) • Est. Cost: ₹${p.estimatedCost}`,
            icon: "storefront",
            priorityScore: calcPriority(p.name, `${p.category} ${p.address}`, "nearby-places", 70),
          });
        }
      });
    } catch {}

    // ----------------------------------------------------
    // 4. PERFORMANCE REPORT
    // ----------------------------------------------------
    try {
      const score = PerformanceEngine.getOverallScore();
      const diagnostic = PerformanceEngine.getDynamicRecommendations();

      if ("performance".includes(q) || "score".includes(q) || "report".includes(q) || "growth".includes(q)) {
        results.push({
          id: "perf-score",
          title: `Overall Performance Score: ${score}%`,
          moduleName: "Performance Report",
          moduleTab: "intelligence-score",
          description: `AI Certified Evaluation • ${diagnostic.summary}`,
          icon: "insights",
          priorityScore: calcPriority("Overall Performance Score", diagnostic.summary, "intelligence-score", 85),
        });
      }

      if (diagnostic.summary.toLowerCase().includes(q)) {
        results.push({
          id: "perf-summary",
          title: "AI Mentor Summary Insight",
          moduleName: "Performance Report",
          moduleTab: "intelligence-score",
          description: diagnostic.summary,
          icon: "psychology",
          priorityScore: calcPriority("AI Mentor Summary", diagnostic.summary, "intelligence-score", 70),
        });
      }

      diagnostic.strengths.forEach((str, idx) => {
        if (str.toLowerCase().includes(q)) {
          results.push({
            id: `str-${idx}`,
            title: `Performance Strength: ${str}`,
            moduleName: "Performance Report",
            moduleTab: "intelligence-score",
            description: "Evaluated from your actual learning patterns.",
            icon: "check_circle",
            priorityScore: calcPriority(str, "strength", "intelligence-score", 65),
          });
        }
      });

      diagnostic.areasToImprove.forEach((area, idx) => {
        if (area.toLowerCase().includes(q)) {
          results.push({
            id: `area-${idx}`,
            title: `Area to Improve: ${area}`,
            moduleName: "Performance Report",
            moduleTab: "intelligence-score",
            description: "Suggested focus area to boost your efficiency index.",
            icon: "warning",
            priorityScore: calcPriority(area, "improve", "intelligence-score", 65),
          });
        }
      });
    } catch {}

    // ----------------------------------------------------
    // 5. RISK PREDICTOR
    // ----------------------------------------------------
    try {
      const risks = RiskAnalysisEngine.calculateRisks(monthKey);

      if ("risk".includes(q) || "alert".includes(q) || "warning".includes(q)) {
        results.push({
          id: "risk-summary",
          title: `Overall Student Risk Status: ${risks.level}`,
          moduleName: "Risk Predictor",
          moduleTab: "risk-prediction",
          description: risks.reason,
          icon: "warning",
          priorityScore: calcPriority("Overall Student Risk Status", risks.reason, "risk-prediction", 80),
        });
      }

      [risks.academic, risks.financial].forEach((cat) => {
        if (cat.category.toLowerCase().includes(q) || cat.reason.toLowerCase().includes(q)) {
          results.push({
            id: `risk-cat-${cat.category}`,
            title: `${cat.category}: ${cat.level} Risk`,
            moduleName: "Risk Predictor",
            moduleTab: "risk-prediction",
            description: cat.reason,
            icon: "running_with_errors",
            priorityScore: calcPriority(cat.category, cat.reason, "risk-prediction", 70),
          });
        }

        cat.aiSuggestions.forEach((sug, sIdx) => {
          if (sug.toLowerCase().includes(q)) {
            results.push({
              id: `risk-sug-${cat.category}-${sIdx}`,
              title: `Risk Alert Suggestion`,
              moduleName: "Risk Predictor",
              moduleTab: "risk-prediction",
              description: sug,
              icon: "lightbulb",
              priorityScore: calcPriority("Risk Alert Suggestion", sug, "risk-prediction", 65),
            });
          }
        });
      });
    } catch {}

    // ----------------------------------------------------
    // 6. AI ASSISTANT CONVERSATION HISTORY (Part 2)
    // ----------------------------------------------------
    try {
      const rawChat = localStorage.getItem("compass_ai_chat_history");
      if (rawChat) {
        const messages: { sender: string; text: string }[] = JSON.parse(rawChat);
        messages.forEach((msg, idx) => {
          if (msg.text.toLowerCase().includes(q)) {
            const shortSnippet = msg.text.length > 80 ? msg.text.slice(0, 80) + "..." : msg.text;
            results.push({
              id: `chat-${idx}`,
              title: `AI Assistant Chat (${msg.sender === "user" ? "You asked" : "Compass AI"})`,
              moduleName: "AI Assistant",
              moduleTab: "dashboard", // Opens AI Assistant dialog
              description: `"${shortSnippet}"`,
              icon: "smart_toy",
              priorityScore: calcPriority(msg.text, "chat assistant conversation", "dashboard", 60),
            });
          }
        });
      }
    } catch {}

    // ----------------------------------------------------
    // 7. CAREER MENTOR
    // ----------------------------------------------------
    try {
      if ("career".includes(q) || "mentor".includes(q) || "job".includes(q) || "python".includes(q) || "dsa".includes(q) || "developer".includes(q) || "role".includes(q)) {
        results.push({
          id: "career-hub",
          title: "Career Mentor & Skill Analyzer",
          moduleName: "Career Mentor",
          moduleTab: "career-mentor",
          description: "Analyze market role benchmarks, skill match index, and personalized learning roadmaps.",
          icon: "psychology",
          priorityScore: calcPriority("Career Mentor & Skill Analyzer", "career mentor job skills", "career-mentor", 75),
        });
      }
    } catch {}

    // ----------------------------------------------------
    // 8. HORIZON EVENTS (Exams, Hackathons, Deadlines)
    // ----------------------------------------------------
    try {
      const events = [
        { id: "e1", title: "Operating Systems Mid-Term", desc: "Hall 302 • 10:00 AM (In 2 Days)", keywords: "os operating systems exam mid-term" },
        { id: "e2", title: "TechFest Hackathon Deadline", desc: "Online Submission • Next Week", keywords: "techfest hackathon code contest" },
        { id: "e3", title: "Cloud Arch Project Demo", desc: "Lab B • 02:30 PM (Aug 12)", keywords: "cloud architecture project demo" },
        { id: "e4", title: "DBMS Lab Assignment 4", desc: "Database Management Systems", keywords: "dbms database lab assignment" },
      ];

      events.forEach((ev) => {
        if (ev.title.toLowerCase().includes(q) || ev.desc.toLowerCase().includes(q) || ev.keywords.includes(q)) {
          results.push({
            id: `event-${ev.id}`,
            title: ev.title,
            moduleName: "Horizon Events",
            moduleTab: "dashboard",
            description: ev.desc,
            icon: "event",
            priorityScore: calcPriority(ev.title, ev.desc, "dashboard", 75),
          });
        }
      });
    } catch {}

    // Deduplicate by ID
    const uniqueResultsMap = new Map<string, SearchResultItem>();
    results.forEach((item) => {
      if (!uniqueResultsMap.has(item.id) || item.priorityScore > uniqueResultsMap.get(item.id)!.priorityScore) {
        uniqueResultsMap.set(item.id, item);
      }
    });

    // Sort descending by priorityScore
    const sorted = Array.from(uniqueResultsMap.values()).sort((a, b) => b.priorityScore - a.priorityScore);

    // Group by moduleName
    const groupedMap = new Map<string, { moduleName: string; moduleTab: NavTab; items: SearchResultItem[] }>();

    sorted.forEach((item) => {
      if (!groupedMap.has(item.moduleName)) {
        groupedMap.set(item.moduleName, {
          moduleName: item.moduleName,
          moduleTab: item.moduleTab,
          items: [],
        });
      }
      groupedMap.get(item.moduleName)!.items.push(item);
    });

    return Array.from(groupedMap.values());
  }
}
