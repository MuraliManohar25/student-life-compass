export type NavTab =
  | "landing"
  | "auth"
  | "onboarding"
  | "dashboard"
  | "career-mentor"
  | "intelligence-score"
  | "study-planner"
  | "budget"
  | "nearby-places"
  | "risk-prediction"
  | "utilities"
  | "settings";

export interface MissionTask {
  id: string;
  title: string;
  completed: boolean;
  category?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  location: string;
  dueText: string;
  badgeColor: "error" | "primary" | "secondary" | "white";
}

export interface CuratedResource {
  id: string;
  type: "COURSE" | "YOUTUBE" | "DOCS" | "PROJECT";
  title: string;
  description: string;
  meta: string;
  imageUrl: string;
  link: string;
  typeBg: string;
  typeText: string;
}

export interface ActiveProject {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface Certification {
  id: string;
  title: string;
  issued: string;
  icon: string;
  iconBg: string;
}

export interface ChatMessage {
  id: string;
  sender: "mentor" | "user";
  text: string;
  timestamp?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
}
