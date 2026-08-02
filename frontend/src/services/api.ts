import axios from 'axios';

const DEV_API_FALLBACK = 'http://localhost:8000';
const API_PATH = '/api';

const getViteEnv = () => {
  if (typeof import.meta !== 'undefined' && import.meta && 'env' in import.meta) {
    return (import.meta as any).env ?? {};
  }
  return {};
};

export const normalizeApiBaseUrl = (rawValue?: string | null): string => {
  const value = (rawValue ?? '').trim();

  if (!value) {
    return `${DEV_API_FALLBACK}${API_PATH}`;
  }

  const normalized = value.replace(/\/+$/, '');

  if (!normalized) {
    return `${DEV_API_FALLBACK}${API_PATH}`;
  }

  if (/^https?:\/\//i.test(normalized)) {
    return normalized.endsWith(API_PATH) ? normalized : `${normalized}${API_PATH}`;
  }

  if (!normalized.includes('://')) {
    const host = normalized.startsWith('/') ? `${DEV_API_FALLBACK}${normalized}` : `http://${normalized}`;
    return host.endsWith(API_PATH) ? host : `${host.replace(/\/+$/, '')}${API_PATH}`;
  }

  return `${DEV_API_FALLBACK}${API_PATH}`;
};

export const resolveApiBaseUrl = (runtime: { env?: Record<string, string | undefined>; mode?: string; hostname?: string; protocol?: string } = {}) => {
  const env = runtime.env ?? getViteEnv();
  const mode = runtime.mode ?? env.MODE ?? (env.DEV ? 'development' : 'production');
  const configured = env.VITE_API_URL ?? env.VITE_API_BASE_URL ?? '';

  if (configured && configured.trim()) {
    return normalizeApiBaseUrl(configured);
  }

  if (mode === 'development') {
    return `${DEV_API_FALLBACK}${API_PATH}`;
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${API_PATH}`;
  }

  return `${DEV_API_FALLBACK}${API_PATH}`;
};

const API_BASE_URL = resolveApiBaseUrl();

console.info('[API Config]', {
  mode: getViteEnv().MODE ?? 'unknown',
  baseApiUrl: API_BASE_URL,
  env: {
    VITE_API_URL: !!getViteEnv().VITE_API_URL,
    VITE_API_BASE_URL: !!getViteEnv().VITE_API_BASE_URL,
    DEV: !!getViteEnv().DEV,
    PROD: !!getViteEnv().PROD,
    HOST: typeof window !== 'undefined' ? window.location.hostname : 'server',
  },
});

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add Authorization header and log the final URL
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const baseUrl = config.baseURL ?? API_BASE_URL;
  const requestUrl = config.url ?? '/';
  const finalUrl = new URL(requestUrl, baseUrl).toString();

  console.info('[API Request]', {
    baseApiUrl: baseUrl,
    requestUrl,
    finalUrl,
  });

  return config;
});

// Auth API
export const authApi = {
  signup: async (email: string, password: string, fullName: string) => {
    const res = await apiClient.post('/auth/signup', { email, password, full_name: fullName });
    if (res.data.access_token) {
      localStorage.setItem('token', res.data.access_token);
    }
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data.access_token) {
      localStorage.setItem('token', res.data.access_token);
    }
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
  },
  forgotPassword: async (email: string) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },
  resetPassword: async (token: string, newPassword: string) => {
    const res = await apiClient.post('/auth/reset-password', { token, new_password: newPassword });
    return res.data;
  },
};

// Profile & Onboarding API
export const profileApi = {
  getProfile: async () => {
    const res = await apiClient.get('/profile/me');
    return res.data;
  },
  updateProfile: async (data: {
    college: string;
    major: string;
    current_gpa: number;
    target_gpa: number;
    target_role: string;
    sleep_hours: number;
    monthly_budget: number;
    skills: { name: string; proficiency_score: number }[];
  }) => {
    const res = await apiClient.put('/profile/me', data);
    return res.data;
  },
};

// Dashboard API
export const dashboardApi = {
  getDashboard: async () => {
    const res = await apiClient.get('/dashboard');
    return res.data;
  },
  getEvents: async () => {
    const res = await apiClient.get('/dashboard/events');
    return res.data;
  },
  getFocusActivity: async () => {
    const res = await apiClient.get('/dashboard/focus-activity');
    return res.data;
  },
};

// Career Mentor API
export const careerApi = {
  analyze: async (targetRole: string, currentSkills?: string[]) => {
    const res = await apiClient.post('/career/analyze', {
      target_role: targetRole,
      current_skills: currentSkills,
    });
    return res.data;
  },
  chat: async (prompt: string) => {
    const res = await apiClient.post('/career/chat', { prompt });
    return res.data;
  },
  getRoadmap: async () => {
    const res = await apiClient.get('/career/roadmap');
    return res.data;
  },
  getSkillGap: async () => {
    const res = await apiClient.get('/career/skill-gap');
    return res.data;
  },
  getResources: async () => {
    const res = await apiClient.get('/career/resources');
    return res.data;
  },
};

// Study Planner API
export const studyApi = {
  getSessions: async () => {
    const res = await apiClient.get('/study-plan');
    return res.data;
  },
  createSession: async (session: { title: string; scheduled_time: string; room?: string; tag?: string; status?: string }) => {
    const res = await apiClient.post('/study-plan', session);
    return res.data;
  },
  updateSession: async (id: number, updates: Partial<{ title: string; scheduled_time: string; room: string; tag: string; status: string }>) => {
    const res = await apiClient.put(`/study-plan/${id}`, updates);
    return res.data;
  },
  deleteSession: async (id: number) => {
    const res = await apiClient.delete(`/study-plan/${id}`);
    return res.data;
  },
  logSprint: async (durationMinutes: number = 25) => {
    const res = await apiClient.post('/study/sprint', { duration_minutes: durationMinutes });
    return res.data;
  },
};

// Budget Manager API
export const budgetApi = {
  getExpenses: async () => {
    const res = await apiClient.get('/budget/expenses');
    return res.data;
  },
  createExpense: async (expense: { title: string; amount: number; category: string; date?: string }) => {
    const res = await apiClient.post('/budget/expenses', expense);
    return res.data;
  },
  deleteExpense: async (id: number) => {
    const res = await apiClient.delete(`/budget/expenses/${id}`);
    return res.data;
  },
  getSummary: async () => {
    const res = await apiClient.get('/budget/summary');
    return res.data;
  },
  getRemainingBudget: async () => {
    const res = await apiClient.get('/budget/remaining-budget');
    return res.data as { remaining_budget: number };
  },
};

// Placement Readiness API
export const placementApi = {
  getReadiness: async () => {
    const res = await apiClient.get('/placement-readiness');
    return res.data;
  },
  addApplication: async (app: { company: string; role: string; status?: string; match_percentage?: number }) => {
    const res = await apiClient.post('/placement/applications', app);
    return res.data;
  },
};

// Academic Risk API
export const riskApi = {
  getPrediction: async () => {
    const res = await apiClient.get('/risk/predict');
    return res.data;
  },
  assessRisk: async () => {
    const res = await apiClient.post('/risk/assess');
    return res.data;
  },
};

// Weekly Reports API
export const reportsApi = {
  getWeeklyReport: async () => {
    const res = await apiClient.get('/reports/weekly');
    return res.data;
  },
};

// AI Assistant API
export const aiApi = {
  ask: async (prompt: string, context?: any) => {
    const res = await apiClient.post('/ai/ask', { prompt, context });
    return res.data;
  },
};

// Notifications API (Bug #7)
export const notificationsApi = {
  getAll: async () => {
    const res = await apiClient.get('/notifications');
    return res.data;
  },
  markRead: async (id: number) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },
  generateDefaults: async () => {
    const res = await apiClient.post('/notifications/generate');
    return res.data;
  },
};
