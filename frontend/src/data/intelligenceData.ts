// This file contains structured data for the AI Student Performance Report.

export interface PerformanceCategory {
  id: string;
  title: string;
  score: number;
  explanation: string;
  gradient: string;
}

export interface MonthlyGrowthPoint {
  month: string;
  score: number;
}

export interface ActionPlanTask {
  id: string;
  task: string;
  completed: boolean;
  category?: string;
}

export const REPORT_HEADER_INFO = {
  title: "AI Student Performance Report",
  overallScore: 82,
  maxScore: 100,
  description: "Based on your academic consistency, learning progress, skill development, task completion and financial discipline.",
  lastUpdated: "Today",
};

// 6 Performance Breakdown Categories
export const PERFORMANCE_BREAKDOWN: PerformanceCategory[] = [
  {
    id: "academic-consistency",
    title: "Academic Consistency",
    score: 87,
    explanation: "You have maintained consistent academic performance over the last month.",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "attendance",
    title: "Attendance",
    score: 84,
    explanation: "Attendance across core lectures is optimal with a 4% improvement this term.",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    id: "skill-growth",
    title: "Skill Growth",
    score: 80,
    explanation: "Steady velocity in data structures, system design, and practical lab assignments.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    id: "task-completion",
    title: "Task Completion",
    score: 88,
    explanation: "High execution rate on assigned study missions and weekly submissions.",
    gradient: "from-amber-500 to-orange-400",
  },
  {
    id: "learning-discipline",
    title: "Learning Discipline",
    score: 82,
    explanation: "Strong study routine consistency, maintaining daily focus above 80%.",
    gradient: "from-[#4f46e5] to-[#c3c0ff]",
  },
  {
    id: "financial-management",
    title: "Financial Management",
    score: 79,
    explanation: "Budget utilization is controlled with stable daily spending habits.",
    gradient: "from-violet-500 to-fuchsia-400",
  },
];

// Monthly Growth Trend
export const MONTHLY_GROWTH_DATA: MonthlyGrowthPoint[] = [
  { month: "May 2026", score: 74 },
  { month: "June 2026", score: 77 },
  { month: "July 2026", score: 80 },
  { month: "August 2026", score: 82 },
  { month: "September 2026", score: 84 },
  { month: "October 2026", score: 86 },
];

// AI Performance Summary & Mentorship
export const AI_MENTOR_SUMMARY = {
  paragraph:
    "Your academic consistency is improving steadily. Task completion remains excellent and your learning discipline is above average. Financial management is stable, but placement preparation needs additional attention. Continue maintaining your study schedule to achieve an estimated score above 90 next month.",
  strengths: [
    "Excellent Task Completion",
    "Consistent Learning",
    "Strong Study Routine",
  ],
  areasToImprove: [
    "Attendance",
    "Budget Control",
    "Placement Preparation",
  ],
};

// AI Recommendations
export const AI_RECOMMENDATIONS = [
  "Complete 2 DSA problems today",
  "Improve attendance to above 85%",
  "Limit unnecessary spending this week",
  "Practice aptitude for placements",
  "Spend at least 30 minutes revising DBMS",
];

// Today's Personalized Action Plan
export const TODAY_ACTION_PLAN = {
  title: "Today's Personalized Action Plan",
  estimatedTime: "3 hrs 20 mins",
  priority: "High",
  tasks: [
    { id: "1", task: "Complete DBMS Assignment", completed: false, category: "Academic" },
    { id: "2", task: "Solve 2 DSA Problems", completed: true, category: "Practice" },
    { id: "3", task: "Watch one Machine Learning lecture", completed: false, category: "Study" },
    { id: "4", task: "Gym", completed: false, category: "Personal" },
    { id: "5", task: "Sleep before 11 PM", completed: false, category: "Wellness" },
  ],
};
