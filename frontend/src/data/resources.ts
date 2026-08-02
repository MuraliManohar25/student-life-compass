// This file contains curated high-quality learning resources mapped by missing skills.
// TODO: Replace this mock catalog with real API calls to backend endpoints /api/resources in production.

export interface CuratedResource {
  id: string;
  skill: string;
  title: string;
  platform: string;
  type: "COURSE" | "DOCS" | "INTERACTIVE" | "PRACTICE";
  link: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
}

export const SKILL_RESOURCES: Record<string, CuratedResource[]> = {
  "Machine Learning": [
    {
      id: "ml-1",
      skill: "Machine Learning",
      title: "Supervised Machine Learning: Regression and Classification",
      platform: "Coursera (Andrew Ng)",
      type: "COURSE",
      link: "https://www.coursera.org/learn/machine-learning",
      duration: "4 Weeks",
      level: "Beginner",
    },
    {
      id: "ml-2",
      skill: "Machine Learning",
      title: "Intro to Machine Learning Course",
      platform: "Kaggle Learn",
      type: "PRACTICE",
      link: "https://www.kaggle.com/learn/intro-to-machine-learning",
      duration: "3 Hours",
      level: "Beginner",
    },
  ],
  "Deep Learning": [
    {
      id: "dl-1",
      skill: "Deep Learning",
      title: "Deep Learning Specialization",
      platform: "DeepLearning.AI",
      type: "COURSE",
      link: "https://www.coursera.org/specializations/deep-learning",
      duration: "8 Weeks",
      level: "Intermediate",
    },
    {
      id: "dl-2",
      skill: "Deep Learning",
      title: "Practical Deep Learning for Coders",
      platform: "Fast.ai",
      type: "INTERACTIVE",
      link: "https://course.fast.ai/",
      duration: "7 Weeks",
      level: "Intermediate",
    },
  ],
  Docker: [
    {
      id: "doc-1",
      skill: "Docker",
      title: "Docker & Containerization for Beginners",
      platform: "FreeCodeCamp",
      type: "COURSE",
      link: "https://www.youtube.com/watch?v=fqMOX6JJhGo",
      duration: "2 Hours",
      level: "Beginner",
    },
    {
      id: "doc-2",
      skill: "Docker",
      title: "Official Docker Quickstart Documentation",
      platform: "Docker Docs",
      type: "DOCS",
      link: "https://docs.docker.com/get-started/",
      duration: "30 Mins",
      level: "Beginner",
    },
  ],
  React: [
    {
      id: "react-1",
      skill: "React",
      title: "React Official Documentation & Interactive Tutorials",
      platform: "React.dev",
      type: "DOCS",
      link: "https://react.dev/learn",
      duration: "Self-Paced",
      level: "Beginner",
    },
    {
      id: "react-2",
      skill: "React",
      title: "Learn React for Free",
      platform: "Scrimba",
      type: "INTERACTIVE",
      link: "https://scrimba.com/learn/learnreact",
      duration: "11 Hours",
      level: "Beginner",
    },
  ],
  TypeScript: [
    {
      id: "ts-1",
      skill: "TypeScript",
      title: "TypeScript Handbook",
      platform: "TypeScriptLang.org",
      type: "DOCS",
      link: "https://www.typescriptlang.org/docs/handbook/intro.html",
      duration: "2 Hours",
      level: "Intermediate",
    },
  ],
  SQL: [
    {
      id: "sql-1",
      skill: "SQL",
      title: "Interactive SQL Tutorial",
      platform: "Mode Analytics",
      type: "INTERACTIVE",
      link: "https://mode.com/sql-tutorial/",
      duration: "4 Hours",
      level: "Beginner",
    },
  ],
};
