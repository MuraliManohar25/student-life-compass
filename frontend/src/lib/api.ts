/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Base URL of the FastAPI backend's /api router.
// Set VITE_API_BASE_URL at build time on Render (Static Site -> Environment)
// to the full backend URL, e.g. https://student-life-compass-api.onrender.com/api
// Falls back to a same-origin "/api" path for local dev via the Vite proxy.
function getApiBaseUrl(): string {
  let url = ((import.meta as any).env?.VITE_API_BASE_URL || '/api').trim();
  url = url.replace(/\/+$/, ''); // Remove trailing slashes

  // If a full http(s) URL was provided without the /api suffix, automatically append /api
  if (url.startsWith('http') && !url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

const API_BASE_URL: string = getApiBaseUrl();

const TOKEN_KEY = 'slc_token';

/**
 * Safely read the stored auth token.
 * Guards against the historical bug where the literal string
 * "undefined" or "null" got written to localStorage and was then
 * sent as `Bearer undefined` on every request.
 */
export function getToken(): string | null {
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw || raw === 'undefined' || raw === 'null') {
    return null;
  }
  return raw;
}

export function setToken(token: string | null | undefined): void {
  if (!token || token === 'undefined' || token === 'null') {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  auth?: boolean; // attach Authorization header (default true)
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // No content
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  let data: any = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      `Request failed with status ${res.status}`;
    throw new ApiError(
      typeof message === 'string' ? message : JSON.stringify(message),
      res.status
    );
  }

  return data as T;
}

// ---- Types matching backend schemas ----

export interface AuthTokenResponse {
  access_token: string;
  token_type: string;
  user_id: number;
  email: string;
  full_name: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface ProfileOut {
  id: number;
  user_id: number;
  college: string;
  major: string;
  cohort_standing: string;
  current_gpa: number;
  target_gpa: number;
  target_role: string;
  market_match_index: number;
  sleep_hours: number;
  monthly_budget: number;
  skills: Array<{ name: string; proficiency_score: number }>;
}

export interface DashboardResponse {
  user_name: string;
  cohort_standing: string;
  intelligence_score: number;
  score_trend: string;
  remaining_budget: number;
  daily_budget_limit: number;
  academic_index: number;
  placement_odds: number;
  tasks: Array<{ id: string; title: string; completed: boolean; category: string }>;
  timeline_events: Array<{ id: string; title: string; location: string; dueText: string; badgeColor: string }>;
  rhythm_activity: Array<{ day: string; val: number; label: string }>;
  ai_actions: Array<{ id: string; title: string; meta: string; tab: string; icon: string; color: string }>;
}

// ---- Auth endpoints ----

export async function signup(params: {
  email: string;
  password: string;
  full_name: string;
}): Promise<AuthTokenResponse> {
  const data = await request<AuthTokenResponse>('/auth/signup', {
    method: 'POST',
    body: params,
    auth: false,
  });
  setToken(data.access_token);
  return data;
}

export async function login(params: {
  email: string;
  password: string;
}): Promise<AuthTokenResponse> {
  const data = await request<AuthTokenResponse>('/auth/login', {
    method: 'POST',
    body: params,
    auth: false,
  });
  setToken(data.access_token);
  return data;
}

export function logout(): void {
  clearToken();
}

export async function getMe(): Promise<CurrentUser> {
  return request<CurrentUser>('/auth/me');
}

// ---- Profile / Dashboard endpoints (used by later steps) ----

export async function getMyProfile(): Promise<ProfileOut> {
  return request<ProfileOut>('/profile/me');
}

export async function updateMyProfile(data: { college: string; major: string; current_gpa: number; target_gpa: number; target_role: string; sleep_hours: number; monthly_budget: number; skills?: Array<{ name: string; proficiency_score: number }> }): Promise<void> {
  return request<void>('/profile/me', { method: 'PUT', body: data });
}

export async function getDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>('/dashboard');
}

// ---- Budget / Risk / Placement (used by HomeScreen real-data wiring) ----

export interface BudgetSummaryResponse {
  total_spent: number;
  remaining_balance: number;
  monthly_budget: number;
  daily_cap: number;
  predicted_monthly_total: number;
  forecast_confidence: number;
  suggestions: string[];
  utilization_percentage: number;
  category_breakdown: Record<string, number>;
  weekly_spending: Array<{ day: string; amount: number }>;
}

export async function getBudgetSummary(): Promise<BudgetSummaryResponse> {
  return request<BudgetSummaryResponse>('/finance/budget/summary');
}

export interface ExpenseOut { id: number; user_id: number; title: string; amount: number; category: string; description: string; notes: string; date: string }
export async function getExpenses(): Promise<ExpenseOut[]> { return request<ExpenseOut[]>('/finance/expenses'); }
export async function createExpense(data: Omit<ExpenseOut, 'id' | 'user_id' | 'description' | 'notes'> & Partial<Pick<ExpenseOut, 'description' | 'notes'>>): Promise<ExpenseOut> {
  return request<ExpenseOut>('/finance/expenses', { method: 'POST', body: data });
}
export async function updateExpense(id: number, data: { title: string; amount: number; category: string; date?: string }): Promise<ExpenseOut> {
  return request<ExpenseOut>(`/finance/expenses/${id}`, { method: 'PUT', body: data });
}
export async function deleteExpense(id: number): Promise<void> { return request<void>(`/finance/expenses/${id}`, { method: 'DELETE' }); }

export interface TaskRecord { id: number; title: string; description: string; priority: string; difficulty: string; deadline: string | null; estimated_minutes: number; status: string; priority_score: number; reason: string }
export async function getTasks(): Promise<TaskRecord[]> { return request<TaskRecord[]>('/tasks'); }
export async function getSequencedTasks(): Promise<TaskRecord[]> { return request<TaskRecord[]>('/tasks/sequencer'); }
export async function createTask(data: { title: string; description?: string; subject_id?: number; priority?: string; difficulty?: string; deadline?: string; estimated_minutes?: number }): Promise<TaskRecord> { return request<TaskRecord>('/tasks', { method: 'POST', body: data }); }
export async function updateTask(id: number, data: Partial<TaskRecord>): Promise<TaskRecord> { return request<TaskRecord>(`/tasks/${id}`, { method: 'PUT', body: data }); }
export async function deleteTask(id: number): Promise<void> { return request<void>(`/tasks/${id}`, { method: 'DELETE' }); }
export async function logSprint(durationMinutes: number = 25, subject: string = 'Deep Work'): Promise<{ message: string; points_earned: number; session_id: number }> {
  return request('/study/sprint', { method: 'POST', body: { duration_minutes: durationMinutes, subject } });
}

export interface NotificationRecord { id: number; title: string; message: string; category: string; is_read: boolean; created_at: string }
export async function getNotifications(): Promise<NotificationRecord[]> { return request<NotificationRecord[]>('/notifications'); }
export async function markNotificationRead(id: number): Promise<void> { return request<void>(`/notifications/${id}/read`, { method: 'PUT' }); }
export async function generateNotifications(): Promise<void> { return request<void>('/notifications/generate', { method: 'POST' }); }

export interface RiskPredictionResponse {
  burnout_risk_score: number;
  risk_level: string;
  workload_density: number;
  peak_in_hours: number;
  recommendations: Array<{ icon: string; color: string; text: string }>;
}

export async function getRiskPrediction(): Promise<RiskPredictionResponse> {
  return request<RiskPredictionResponse>('/risk/predict');
}

export interface PlacementReadinessResponse {
  overall_score: number;
  resume_score: number;
  projects_score: number;
  github_score: number;
  dsa_score: number;
  communication_score: number;
  match_rate: string;
  applications: Array<{ company: string; role: string; match: string; status: string }>;
  recommendations: string[];
}

export async function getPlacementReadiness(): Promise<PlacementReadinessResponse> {
  return request<PlacementReadinessResponse>('/placement-readiness');
}

export async function addPlacementApplication(data: { company: string; role: string; status?: string; match_percentage?: number }): Promise<{ message: string; id: number }> {
  return request('/placement/applications', { method: 'POST', body: data });
}

// ---- Explore catalog, shopping catalog, saved items, search ----

export interface SpotRecord {
  id: number;
  name: string;
  category: string;
  category_label: string;
  rating: number;
  distance: string;
  tags: string[];
  crowd_info: string;
  extra_badge: string;
  action_type: string;
  action_label: string;
  image_url: string;
  alert: string;
  saved: boolean;
}

export async function getSpots(): Promise<SpotRecord[]> {
  return request<SpotRecord[]>('/explore/spots');
}

export interface ShoppingRecord {
  id: number;
  name: string;
  price: number;
  description: string;
  budget_impact: string;
  image_url: string;
  category: string;
  selected: boolean;
}

export async function getShoppingCatalog(): Promise<ShoppingRecord[]> {
  return request<ShoppingRecord[]>('/explore/shopping');
}

export interface SavedItemRecord {
  id: number;
  user_id: number;
  kind: string;
  ref_id: string;
  title: string;
  item_meta: Record<string, unknown>;
  created_at: string;
}

export async function getSavedItems(kind?: string): Promise<SavedItemRecord[]> {
  return request<SavedItemRecord[]>(kind ? `/saved?kind=${encodeURIComponent(kind)}` : '/saved');
}

export async function saveItem(data: { kind: string; ref_id: string; title?: string; item_meta?: Record<string, unknown> }): Promise<SavedItemRecord> {
  return request<SavedItemRecord>('/saved', { method: 'POST', body: data });
}

export async function deleteSavedItem(id: number): Promise<void> {
  return request<void>(`/saved/${id}`, { method: 'DELETE' });
}

export interface SearchResults {
  query: string;
  tasks: Array<{ id: number; title: string; status: string; tab: string }>;
  sessions: Array<{ id: number; title: string; status: string; tab: string }>;
  expenses: Array<{ id: number; title: string; amount: number; category: string; tab: string }>;
  notifications: Array<{ id: number; title: string; category: string }>;
  spots: Array<{ id: number; title: string; category: string; tab: string }>;
  shopping: Array<{ id: number; title: string; price: number; tab: string }>;
}

export async function searchAll(query: string): Promise<SearchResults> {
  return request<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
}

// ---- Study sessions (planner schedule, persisted per user) ----

export interface StudySessionOut {
  id: number;
  user_id: number;
  title: string;
  room: string;
  tag: string;
  status: string;
  scheduled_time: string;
  duration_minutes: number;
}

export async function getStudySessions(): Promise<StudySessionOut[]> {
  return request<StudySessionOut[]>('/study-plan');
}

export async function createStudySession(
  data: { title: string; scheduled_time: string; room?: string; tag?: string; status?: string; duration_minutes?: number }
): Promise<StudySessionOut> {
  return request<StudySessionOut>('/study-plan', { method: 'POST', body: data });
}

export async function updateStudySession(
  id: number | string,
  data: Partial<{ title: string; scheduled_time: string; room: string; tag: string; status: string; duration_minutes: number }>
): Promise<StudySessionOut> {
  return request<StudySessionOut>(`/study-plan/${id}`, { method: 'PUT', body: data });
}

export async function deleteStudySession(id: number | string): Promise<void> {
  return request<void>(`/study-plan/${id}`, { method: 'DELETE' });
}

// ---- AI Assistant endpoint ----

export interface AskAiResponse {
  reply: string;
  source: string;
}

export async function askAi(prompt: string, context?: Record<string, unknown>): Promise<AskAiResponse> {
  return request<AskAiResponse>('/ai/ask', {
    method: 'POST',
    body: { prompt, context: context || null },
  });
}

export { request };
