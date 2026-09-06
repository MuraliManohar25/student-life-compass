from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Auth Schemas
class UserSignup(BaseModel):
    email: str
    password: str
    full_name: str

# Alias for POST /api/auth/register
UserRegister = UserSignup

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    full_name: str
    is_verified: bool = True
    onboarding_completed: bool = False

class AuthResponse(BaseModel):
    success: bool
    message: str
    email: Optional[str] = None
    is_verified: bool = False

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_verified: bool = False
    onboarding_completed: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

# Onboarding Questionnaire Schema
class OnboardingRequest(BaseModel):
    full_name: Optional[str] = None
    college_name: str
    course: str
    branch: str
    year: str  # "1st Year", "2nd Year", "3rd Year", "4th Year"
    cgpa: float = Field(..., ge=0.0, le=10.0, description="Current CGPA between 0.0 and 10.0")
    backlogs: int = Field(default=0, ge=0, description="Backlogs / active arrears")
    strong_subjects: List[str] = []
    weak_subjects: List[str] = []
    programming_languages: List[str] = []
    technical_skills: List[str] = []
    career_goal: str
    target_company_type: str
    study_hours: float = Field(..., ge=0.0, le=24.0, description="Average study hours per day")
    preferred_study_time: str
    learning_method: str
    monthly_budget: float = Field(default=5000.0, ge=0.0, description="Monthly personal budget")
    monthly_expenses: float = Field(default=0.0, ge=0.0, description="Average monthly expenses")
    major_expense_categories: List[str] = []
    placement_preparation: str = "No"
    placement_level: str = "Beginner"
    target_role: str
    biggest_challenge: str
    compass_help: List[str] = []

class OnboardingStatusResponse(BaseModel):
    onboarding_completed: bool
    is_verified: bool

# Profile Schemas
class ProfileUpdate(BaseModel):
    college: Optional[str] = ""
    college_name: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    year: Optional[str] = None
    major: Optional[str] = ""
    current_gpa: Optional[float] = 0.0
    cgpa: Optional[float] = None
    target_gpa: Optional[float] = 0.0
    backlogs: Optional[int] = None
    strong_subjects: Optional[List[str]] = None
    weak_subjects: Optional[List[str]] = None
    programming_languages: Optional[List[str]] = None
    technical_skills: Optional[List[str]] = None
    career_goal: Optional[str] = None
    target_company_type: Optional[str] = None
    target_role: Optional[str] = ""
    study_hours: Optional[float] = None
    preferred_study_time: Optional[str] = None
    learning_method: Optional[str] = None
    sleep_hours: Optional[float] = 7.0
    monthly_budget: Optional[float] = 5000.0
    monthly_expenses: Optional[float] = None
    major_expense_categories: Optional[List[str]] = None
    placement_preparation: Optional[str] = None
    placement_level: Optional[str] = None
    biggest_challenge: Optional[str] = None
    compass_help: Optional[List[str]] = None
    skills: Optional[List[dict]] = None  # [{"name": str, "proficiency_score": float}]

class ProfileOut(BaseModel):
    id: int
    user_id: int
    full_name: Optional[str] = ""
    college: str
    college_name: Optional[str] = ""
    course: Optional[str] = ""
    branch: Optional[str] = ""
    year: Optional[str] = "1st Year"
    major: str
    cohort_standing: str
    current_gpa: float
    cgpa: Optional[float] = 0.0
    target_gpa: float
    backlogs: Optional[int] = 0
    strong_subjects: Optional[List[str]] = []
    weak_subjects: Optional[List[str]] = []
    programming_languages: Optional[List[str]] = []
    technical_skills: Optional[List[str]] = []
    career_goal: Optional[str] = ""
    target_company_type: Optional[str] = ""
    target_role: str
    study_hours: Optional[float] = 3.0
    preferred_study_time: Optional[str] = "Evening"
    learning_method: Optional[str] = "Mixed"
    market_match_index: float
    sleep_hours: float
    monthly_budget: Optional[float] = 0.0
    monthly_expenses: Optional[float] = 0.0
    major_expense_categories: Optional[List[str]] = []
    placement_preparation: Optional[str] = "No"
    placement_level: Optional[str] = "Beginner"
    biggest_challenge: Optional[str] = ""
    compass_help: Optional[List[str]] = []
    onboarding_completed: Optional[bool] = False

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
    academic_overview: Optional[dict] = None
    career_overview: Optional[dict] = None
    study_overview: Optional[dict] = None
    budget_overview: Optional[dict] = None
    placement_overview: Optional[dict] = None
    risk_overview: Optional[dict] = None
    ai_recommendations: Optional[List[str]] = None


# Ask AI Schema
class AskAiRequest(BaseModel):
    prompt: str
    context: Optional[dict] = None

class AskAiResponse(BaseModel):
    reply: str
    source: str = "gemini-ai"
