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
  onboarding_completed?: boolean;
  skills: Array<{ name: string; proficiency_score: number }>;
  college_id?: string | null;
  university_id?: string | null;
  course?: string;
  branch?: string;
  academic_year?: string;
  semester?: string;
  state?: string;
  district?: string;
  city?: string;
  college_details?: CollegeOut | null;
  university_details?: UniversityOut | null;
}

export interface AffiliatedUniversityRef {
  university_id: string;
  university_name: string;
  relationship_type: string;
  verification_status: string;
  evidence_url?: string;
  evidence_source_type?: string;
}

export interface CollegeOut {
  id: string;
  aishe_code?: string;
  name: string;
  institution_type?: string;
  city?: string;
  district?: string;
  state: string;
  country?: string;
  official_website?: string;
  institution_status?: string;
  verification_status?: string;
  affiliated_university?: AffiliatedUniversityRef | null;
}

export interface UniversityOut {
  id: string;
  aishe_code?: string;
  name: string;
  university_type?: string;
  city?: string;
  district?: string;
  state: string;
  official_website?: string;
  recognition_status?: string;
  verification_status?: string;
}

export interface QuestionnairePayload {
  college_id?: string | null;
  college_name: string;
  state: string;
  district: string;
  city?: string;
  course: string;
  branch: string;
  academic_year: string;
  semester?: string;
  university_id?: string | null;
  university_name?: string;
}

export interface MissingCollegePayload {
  submitted_name: string;
  city?: string;
  district?: string;
  state: string;
  claimed_university?: string;
  official_website?: string;
}

export interface AcademicResourceOut {
  id: string;
  title: string;
  description?: string;
  subject_code?: string;
  subject_name?: string;
  topic?: string;
  syllabus_unit?: string;
  resource_type?: string;
  source_category?: string;
  category?: string;
  provenance: string;
  institution_name?: string;
  institution_or_publisher?: string;
  source_type?: string;
  url: string;
  language?: string;
  semester?: string;
  curriculum?: string;
  verified?: boolean;
  is_verified?: boolean;
  rating?: number;
  why_recommended?: string;
  saved?: boolean;
  saved_id?: number;
}

export interface StudentSubjectInfo {
  id?: number;
  code: string;
  name: string;
  semester?: string;
  credits: number;
  target_grade?: string;
  current_score?: number;
  difficulty?: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  needs_improvement: boolean;
  topics: string[];
  resource_count: number;
}

export interface AcademicCompassResponse {
  student_summary: {
    full_name: string;
    email: string;
    college: string;
    degree: string;
    branch: string;
    academic_year: string;
    semester: string;
    curriculum: string;
    target_gpa: number;
    target_role: string;
    daily_study_hours: number;
    preferred_formats: string[];
    preferred_language: string;
    upcoming_exams: Array<{ subject: string; name: string; date: string }>;
    improvement_subjects: string[];
    career_interests: string[];
    onboarding_completed: boolean;
  };
  subjects: StudentSubjectInfo[];
  recommendations: AcademicResourceOut[];
  total_resources_count: number;
  categories_breakdown: Record<string, number>;
}

export interface AcademicOnboardingPayload {
  profile: {
    degree: string;
    branch: string;
    college_id?: string | null;
    college_name?: string;
    university_id?: string | null;
    university_name?: string;
    academic_year: string;
    semester: string;
    curriculum: string;
    subjects: Array<{ code: string; name: string; credits?: number }>;
  };
  goals: {
    target_gpa?: number;
    upcoming_exams?: Array<{ subject: string; name: string; date: string }>;
    improvement_subjects?: string[];
    academic_targets?: string[];
    career_interests?: string[];
  };
  preferences: {
    preferred_formats?: string[];
    subject_proficiencies?: Record<string, string>;
    preferred_language?: string;
    daily_study_hours?: number;
    learning_style?: string;
  };
}

export interface AcademicProfileUpdatePayload {
  degree?: string;
  branch?: string;
  academic_year?: string;
  semester?: string;
  curriculum?: string;
  college_name?: string;
  college_id?: string | null;
  university_name?: string;
  university_id?: string | null;
  target_gpa?: number;
  subjects?: Array<{ code: string; name: string; credits?: number; proficiency?: string; needs_improvement?: boolean; topics?: string[] }>;
  goals?: Record<string, any>;
  preferences?: Record<string, any>;
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

export async function updateMyProfile(data: Partial<ProfileOut>): Promise<ProfileOut> {
  return request<ProfileOut>('/profile/me', { method: 'PUT', body: data });
}

export async function submitQuestionnaire(data: QuestionnairePayload): Promise<ProfileOut> {
  return request<ProfileOut>('/profile/questionnaire', { method: 'POST', body: data });
}

export async function getDashboard(): Promise<DashboardResponse> {
  return request<DashboardResponse>('/dashboard');
}

// ---- College & University Dataset endpoints ----

export async function searchColleges(params: {
  q?: string;
  state?: string;
  district?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ total: number; page: number; limit: number; colleges: CollegeOut[] }> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.state) queryParams.set('state', params.state);
  if (params.district) queryParams.set('district', params.district);
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  const qs = queryParams.toString();
  return request<{ total: number; page: number; limit: number; colleges: CollegeOut[] }>(
    `/colleges/search${qs ? `?${qs}` : ''}`
  );
}

export async function getCollege(collegeId: string): Promise<CollegeOut> {
  return request<CollegeOut>(`/colleges/${encodeURIComponent(collegeId)}`);
}

export async function getCollegeAffiliations(collegeId: string): Promise<any[]> {
  return request<any[]>(`/colleges/${encodeURIComponent(collegeId)}/affiliations`);
}

export async function submitMissingCollege(data: MissingCollegePayload): Promise<{
  status: string;
  message: string;
  submission_id: string;
}> {
  return request<{ status: string; message: string; submission_id: string }>(
    '/colleges/missing-report',
    { method: 'POST', body: data }
  );
}

export async function searchUniversities(params: {
  q?: string;
  state?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ total: number; page: number; limit: number; universities: UniversityOut[] }> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.state) queryParams.set('state', params.state);
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  const qs = queryParams.toString();
  return request<{ total: number; page: number; limit: number; universities: UniversityOut[] }>(
    `/universities/search${qs ? `?${qs}` : ''}`
  );
}

export async function getAcademicResources(params: {
  college_id?: string;
  university_id?: string;
} = {}): Promise<AcademicResourceOut[]> {
  const queryParams = new URLSearchParams();
  if (params.college_id) queryParams.set('college_id', params.college_id);
  if (params.university_id) queryParams.set('university_id', params.university_id);
  const qs = queryParams.toString();
  const res = await request<any>(`/academics/resources${qs ? `?${qs}` : ''}`);
  return Array.isArray(res) ? res : (res?.resources || []);
}

export async function getAcademicCompass(): Promise<AcademicCompassResponse> {
  return request<AcademicCompassResponse>('/academics/compass');
}

export async function searchAcademicResources(params: {
  q?: string;
  subject_code?: string;
  semester?: string;
  resource_type?: string;
  source_category?: string;
  language?: string;
  sort_by?: string;
  page?: number;
  limit?: number;
} = {}): Promise<{ total: number; page: number; limit: number; total_pages: number; resources: AcademicResourceOut[] }> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.subject_code) queryParams.set('subject_code', params.subject_code);
  if (params.semester) queryParams.set('semester', params.semester);
  if (params.resource_type) queryParams.set('resource_type', params.resource_type);
  if (params.source_category) queryParams.set('source_category', params.source_category);
  if (params.language) queryParams.set('language', params.language);
  if (params.sort_by) queryParams.set('sort_by', params.sort_by);
  if (params.page) queryParams.set('page', String(params.page));
  if (params.limit) queryParams.set('limit', String(params.limit));
  const qs = queryParams.toString();
  return request<{ total: number; page: number; limit: number; total_pages: number; resources: AcademicResourceOut[] }>(
    `/academics/resources/search${qs ? `?${qs}` : ''}`
  );
}

export async function submitAcademicOnboarding(
  payload: AcademicOnboardingPayload
): Promise<{ status: string; message: string; onboarding_completed: boolean }> {
  return request('/academics/onboarding', { method: 'POST', body: payload });
}

export async function updateAcademicProfile(
  payload: AcademicProfileUpdatePayload
): Promise<{ status: string; message: string }> {
  return request('/academics/profile', { method: 'PUT', body: payload });
}

export async function getEnrolledSubjects(): Promise<StudentSubjectInfo[]> {
  return request<StudentSubjectInfo[]>('/academics/subjects');
}

export async function toggleSaveAcademicResource(
  resourceId: string
): Promise<{ status: string; saved: boolean; saved_id?: number; message: string }> {
  return request(`/academics/resources/${encodeURIComponent(resourceId)}/toggle-save`, { method: 'POST' });
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
