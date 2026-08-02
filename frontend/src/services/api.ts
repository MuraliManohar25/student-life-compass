import axios from 'axios';

const API_BASE_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add Authorization header
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
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
