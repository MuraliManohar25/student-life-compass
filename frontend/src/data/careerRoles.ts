// This file contains structured mock data for career roles and their required skills.
// TODO: Replace this mock dataset with real-time data from GitHub Open Skills, O*NET, or Roadmap.sh APIs in production.

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  estimatedTimeline: string;
  description: string;
  requiredSkills: string[];
  roadmapMilestones: {
    id: string;
    title: string;
    description: string;
    skillRequired: string;
  }[];
}

export const CAREER_ROLES: CareerRole[] = [
  {
    id: "ai-engineer",
    title: "AI Engineer",
    category: "Artificial Intelligence",
    estimatedTimeline: "8 Months",
    description: "Build, deploy, and scale machine learning and deep learning models.",
    requiredSkills: ["Python", "SQL", "Machine Learning", "Deep Learning", "Git", "Docker"],
    roadmapMilestones: [
      { id: "m1", title: "Python Fundamentals", description: "Master data structures, OOP, and async code.", skillRequired: "Python" },
      { id: "m2", title: "Database & SQL", description: "Query relational databases and prepare datasets.", skillRequired: "SQL" },
      { id: "m3", title: "Machine Learning Basics", description: "Supervised and unsupervised learning with Scikit-Learn.", skillRequired: "Machine Learning" },
      { id: "m4", title: "Deep Learning & Neural Networks", description: "PyTorch/TensorFlow, CNNs, and Transformers.", skillRequired: "Deep Learning" },
      { id: "m5", title: "Version Control with Git", description: "Manage code versions and work with GitHub.", skillRequired: "Git" },
      { id: "m6", title: "MLOps & Docker Deployment", description: "Containerize models and serve via FastAPI.", skillRequired: "Docker" },
    ],
  },
  {
    id: "frontend-dev",
    title: "Frontend Developer",
    category: "Web Development",
    estimatedTimeline: "6 Months",
    description: "Design and build interactive, responsive user interfaces for the web.",
    requiredSkills: ["HTML/CSS", "JavaScript", "TypeScript", "React", "Tailwind CSS", "Git"],
    roadmapMilestones: [
      { id: "m1", title: "HTML5 & Modern CSS", description: "Semantic markup, Flexbox, and Grid layouts.", skillRequired: "HTML/CSS" },
      { id: "m2", title: "JavaScript ES6+", description: "DOM manipulation, ES modules, Promises & Async/Await.", skillRequired: "JavaScript" },
      { id: "m3", title: "Tailwind CSS", description: "Utility-first responsive design system.", skillRequired: "Tailwind CSS" },
      { id: "m4", title: "React Fundamentals", description: "Components, Props, State, Effects, and Custom Hooks.", skillRequired: "React" },
      { id: "m5", title: "TypeScript for React", description: "Type safety, Interfaces, and generic props.", skillRequired: "TypeScript" },
      { id: "m6", title: "Git & Version Control", description: "Branching workflows and Pull Requests.", skillRequired: "Git" },
    ],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    category: "Data & Analytics",
    estimatedTimeline: "7 Months",
    description: "Extract insights from complex data using statistics, ML, and visualization.",
    requiredSkills: ["Python", "SQL", "Pandas", "Statistics", "Machine Learning", "Data Visualization"],
    roadmapMilestones: [
      { id: "m1", title: "Python for Data Science", description: "Numpy, Pandas, and data cleaning routines.", skillRequired: "Python" },
      { id: "m2", title: "SQL & Data Extraction", description: "Complex queries, joins, and aggregations.", skillRequired: "SQL" },
      { id: "m3", title: "Statistical Methods", description: "Probability, hypothesis testing, and regression.", skillRequired: "Statistics" },
      { id: "m4", title: "Data Visualization", description: "Matplotlib, Seaborn, and interactive dashboards.", skillRequired: "Data Visualization" },
      { id: "m5", title: "Machine Learning Models", description: "Classification, clustering, and evaluation metrics.", skillRequired: "Machine Learning" },
    ],
  },
];
