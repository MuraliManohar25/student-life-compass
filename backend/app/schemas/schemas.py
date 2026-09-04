from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Auth Schemas
class UserOut(BaseModel):
    id: int
    supabase_id: str
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

    class Config:
        from_attributes = True

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
    date: Optional[str] = "Today"

class ExpenseOut(BaseModel):
    id: int
    user_id: int
    title: str
    amount: float
    category: str
    date: str

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
