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

export async function getDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>('/dashboard');
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
