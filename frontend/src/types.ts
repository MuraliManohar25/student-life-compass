export type NavTab = 'home' | 'academics' | 'finance' | 'explore' | 'insights';

export type AcademicSubTab = 'planner' | 'sequencer' | 'pyqs' | 'stepguide';

export interface TaskItem {
  id: string;
  title: string;
  dueTime: string;
  duration: string;
  priority: 'High' | 'Medium' | 'Low' | 'Routine';
  completed: boolean;
  course?: string;
  description?: string;
}

export interface ScheduleBlock {
  id: string;
  timeRange: string;
  title: string;
  location: string;
  instructor?: string;
  status: 'Completed' | 'Urgent' | 'AI Sequenced' | 'Scheduled';
  weightBadge?: string;
  urgent?: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  description: string;
  budgetImpact: string;
  imageUrl: string;
  selected: boolean;
  category: string;
}

export type PriceStatus = 'free' | 'paid' | 'unavailable';
export type OpenStatus = 'open' | 'closed' | 'unknown';
export type AvailabilityStatus = 'available' | 'full' | 'unknown';

export interface StudentSpot {
  id: string;
  name: string;
  category: 'study' | 'food' | 'movies' | 'essentials' | 'transport' | 'career' | 'lifestyle';
  categoryLabel: string;
  rating: number;
  distance: string;
  distanceMeters?: number;
  tags: string[];
  crowdInfo?: string;
  extraBadge?: string;
  actionType: 'navigate' | 'menu' | 'book_bms' | 'call' | 'rapido' | 'refill';
  actionLabel: string;
  imageUrl: string;
  alert?: string;
  lat?: number;
  lon?: number;
  address?: string;
  priceStatus?: PriceStatus;
  openStatus?: OpenStatus;
  openingHoursText?: string;
  availabilityStatus?: AvailabilityStatus;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  timestamp: string;
  richContent?: {
    academicPriority?: {
      title: string;
      duration: string;
      slot: string;
      pyqWeight: string;
      checkmarks: string[];
    };
    financialCheck?: {
      discretionaryBudget: number;
      safePace: string;
      warning: string;
      recommendation: {
        title: string;
        body: string;
        savings: string;
        distance: string;
      };
    };
    weekendPace?: Array<{
      time: string;
      category: string;
      title: string;
      type: 'social' | 'academics' | 'revision';
    }>;
  };
}
