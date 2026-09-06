from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str


class UserOut(BaseModel):
    id: int
    supabase_id: Optional[str] = None
    email: str
    full_name: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Profile Schemas
class ProfileUpdate(BaseModel):
    college: str
    major: str
    current_gpa: float
    target_gpa: float
    target_role: str
    sleep_hours: float
    monthly_budget: float
    skills: List[dict]  # [{"name": str, "proficiency_score": float}]

class ProfileOut(BaseModel):
    id: int
    user_id: int
    college: str
    major: str
    cohort_standing: str
    current_gpa: float
    target_gpa: float
    target_role: str
    market_match_index: float
    sleep_hours: float
    monthly_budget: Optional[float] = 0.0
    onboarding_completed: Optional[bool] = False

    class Config:
        from_attributes = True

class OnboardingRequest(BaseModel):
    name: Optional[str] = None
    college: Optional[str] = None
    course: Optional[str] = None
    semester: Optional[str] = None
    career_goal: Optional[str] = None
    monthly_budget: Optional[Any] = None
    location_prefs: Optional[str] = None
    notification_prefs: Optional[str] = None
    study_preferences: Optional[str] = None

# Career Schemas
class CareerAnalyzeRequest(BaseModel):
    target_role: str
    current_skills: Optional[List[str]] = None

class CareerAnalyzeResponse(BaseModel):
    target_role: str
    market_match_index: float
    skill_gap: List[dict]
    roadmap: List[dict]
    resources: List[dict]

class CareerChatRequest(BaseModel):
    prompt: str
    context: Optional[dict] = None

class CareerChatResponse(BaseModel):
    reply: str
    source: str = "gemini-ai"

# Study Planner Schemas
class StudySessionCreate(BaseModel):
    title: str
    scheduled_time: str
    room: Optional[str] = "Hostel Room"
    tag: Optional[str] = "Lecture"
    status: Optional[str] = "Upcoming"
    duration_minutes: Optional[int] = 60

class StudySessionUpdate(BaseModel):
    title: Optional[str] = None
    scheduled_time: Optional[str] = None
    room: Optional[str] = None
    tag: Optional[str] = None
    status: Optional[str] = None
    duration_minutes: Optional[int] = None

class StudySessionOut(BaseModel):
    id: int
    user_id: int
    title: str
    room: str
    tag: str
    status: str
    scheduled_time: str
    duration_minutes: int

    class Config:
        from_attributes = True

class SprintLogRequest(BaseModel):
    duration_minutes: int = 25
    subject: Optional[str] = "Deep Work"

# Budget Schemas
class ExpenseCreate(BaseModel):
    title: str
    amount: float
    category: str
    description: Optional[str] = ""
    notes: Optional[str] = ""
    date: Optional[datetime] = None

class ExpenseOut(BaseModel):
    id: int
    user_id: int
    title: str
    amount: float
    category: str
    description: str = ""
    notes: str = ""
    date: datetime

    class Config:
        from_attributes = True

class BudgetSummaryResponse(BaseModel):
    total_spent: float
    remaining_balance: float
    monthly_budget: float
    daily_cap: float
    predicted_monthly_total: float
    forecast_confidence: float
    suggestions: List[str]
    utilization_percentage: float = 0
    category_breakdown: dict = {}
    weekly_spending: list = []


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    subject_id: Optional[int] = None
    priority: str = "Medium"
    difficulty: str = "Medium"
    deadline: Optional[datetime] = None
    estimated_minutes: int = 60


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject_id: Optional[int] = None
    priority: Optional[str] = None
    difficulty: Optional[str] = None
    deadline: Optional[datetime] = None
    estimated_minutes: Optional[int] = None
    status: Optional[str] = None

class RemainingBudgetResponse(BaseModel):
    remaining_budget: float

# Placement Schemas
class PlacementAppCreate(BaseModel):
    company: str
    role: str
    status: Optional[str] = "Applied"
    match_percentage: Optional[float] = 85.0

class PlacementReadinessResponse(BaseModel):
    overall_score: float
    resume_score: float
    projects_score: float
    github_score: float
    dsa_score: float
    communication_score: float
    match_rate: str
    applications: List[dict]
    recommendations: List[str]

# Risk Schemas
class RiskPredictionResponse(BaseModel):
    burnout_risk_score: float
    risk_level: str # Low, Moderate, High
    workload_density: float
    peak_in_hours: int
    recommendations: List[dict]

# Notification Schemas
class NotificationOut(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    category: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Schema
class DashboardResponse(BaseModel):
    user_name: str
    cohort_standing: str
    intelligence_score: float
    score_trend: str
    remaining_budget: float
    daily_budget_limit: float
    academic_index: float
    placement_odds: float
    tasks: List[dict]
    timeline_events: List[dict]
    rhythm_activity: List[dict]
    ai_actions: List[dict]

# Ask AI Schema
class AskAiRequest(BaseModel):
    prompt: str
    context: Optional[dict] = None

class AskAiResponse(BaseModel):
    reply: str
    source: str = "gemini-ai"
