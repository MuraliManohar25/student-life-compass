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
    # Optional: when omitted, existing skills are preserved instead of wiped.
    skills: Optional[List[dict]] = None  # [{"name": str, "proficiency_score": float}]
    college_id: Optional[str] = None
    university_id: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    curriculum: Optional[str] = None
    learning_preferences: Optional[dict] = None
    academic_goals: Optional[dict] = None
    subjects_list: Optional[List[dict]] = None

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
    skills: List[dict] = []
    college_id: Optional[str] = None
    university_id: Optional[str] = None
    course: Optional[str] = ""
    branch: Optional[str] = ""
    academic_year: Optional[str] = ""
    semester: Optional[str] = ""
    state: Optional[str] = ""
    district: Optional[str] = ""
    city: Optional[str] = ""
    curriculum: Optional[str] = ""
    learning_preferences: Optional[dict] = None
    academic_goals: Optional[dict] = None
    subjects_list: Optional[List[dict]] = None
    college_details: Optional[dict] = None
    university_details: Optional[dict] = None

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
    # 7-question Questionnaire integration
    college_id: Optional[str] = None
    university_id: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None

class QuestionnaireSubmit(BaseModel):
    college_id: Optional[str] = None
    college_name: str
    state: str
    district: str
    city: Optional[str] = ""
    course: str
    branch: str
    academic_year: str
    semester: Optional[str] = ""
    university_id: Optional[str] = None
    university_name: Optional[str] = ""

class MissingCollegeCreate(BaseModel):
    submitted_name: str
    city: Optional[str] = ""
    district: Optional[str] = ""
    state: str
    claimed_university: Optional[str] = ""
    official_website: Optional[str] = ""

class CollegeOut(BaseModel):
    id: str
    aishe_code: Optional[str] = None
    name: str
    institution_type: Optional[str] = "Affiliated College"
    city: Optional[str] = ""
    district: Optional[str] = ""
    state: str
    country: Optional[str] = "India"
    official_website: Optional[str] = ""
    verification_status: Optional[str] = "verified"
    affiliated_university: Optional[dict] = None

class UniversityOut(BaseModel):
    id: str
    aishe_code: Optional[str] = None
    name: str
    university_type: Optional[str] = ""
    city: Optional[str] = ""
    district: Optional[str] = ""
    state: str
    official_website: Optional[str] = ""
    recognition_status: Optional[str] = "UGC_RECOGNIZED"
    verification_status: Optional[str] = "verified"

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


# Explore / Saved / Search Schemas
class SpotOut(BaseModel):
    id: int
    name: str
    category: str
    category_label: str
    rating: float
    distance: str
    tags: List[str] = []
    crowd_info: str = ""
    extra_badge: str = ""
    action_type: str = "navigate"
    action_label: str = "Navigate"
    image_url: str = ""
    alert: str = ""
    saved: bool = False

    class Config:
        from_attributes = True


class ShoppingItemOut(BaseModel):
    id: int
    name: str
    price: float
    description: str = ""
    budget_impact: str = ""
    image_url: str = ""
    category: str = "essentials"
    selected: bool = False

    class Config:
        from_attributes = True


class SavedItemCreate(BaseModel):
    kind: str
    ref_id: str
    title: Optional[str] = ""
    item_meta: Optional[dict] = None


class SavedItemOut(BaseModel):
    id: int
    user_id: int
    kind: str
    ref_id: str
    title: str = ""
    item_meta: dict = {}
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# Academic Compass & Resource Discovery Schemas
# ============================================================================

class AcademicResourceOut(BaseModel):
    id: str
    title: str
    description: str = ""
    subject_code: str
    subject_name: str
    topic: str = ""
    syllabus_unit: str = ""
    resource_type: str  # notes, textbook, video, tutorial, pyq, syllabus
    source_category: str  # official, curated, external
    provenance: str = "Curated Academic"
    institution_or_publisher: str = ""
    url: str
    language: str = "English"
    semester: str = ""
    curriculum: str = "All"
    is_verified: bool = True
    rating: float = 4.8
    why_recommended: Optional[str] = None
    saved: bool = False
    saved_id: Optional[int] = None

    class Config:
        from_attributes = True


class StudentSubjectInfo(BaseModel):
    id: Optional[int] = None
    code: str
    name: str
    semester: str = ""
    credits: int = 3
    target_grade: str = "A"
    current_score: float = 85.0
    difficulty: str = "Medium"
    proficiency: str = "Intermediate"  # Beginner, Intermediate, Advanced
    needs_improvement: bool = False
    topics: List[str] = []
    resource_count: int = 0


class AcademicOnboardingStep1(BaseModel):
    degree: str
    branch: str
    college_id: Optional[str] = None
    college_name: Optional[str] = ""
    university_id: Optional[str] = None
    university_name: Optional[str] = ""
    academic_year: str
    semester: str
    curriculum: str
    subjects: List[dict] = []  # [{"code": str, "name": str, "credits": int}]


class AcademicOnboardingStep2(BaseModel):
    target_gpa: Optional[float] = 8.5
    upcoming_exams: List[dict] = []  # [{"subject": str, "name": str, "date": str}]
    improvement_subjects: List[str] = []
    academic_targets: List[str] = []
    career_interests: List[str] = []


class AcademicOnboardingStep3(BaseModel):
    preferred_formats: List[str] = ["notes", "videos"]  # notes, textbooks, videos, tutorials, interactive
    subject_proficiencies: dict = {}  # {code: "Beginner" | "Intermediate" | "Advanced"}
    preferred_language: str = "English"
    daily_study_hours: float = 2.5
    learning_style: str = "Visual & Applied"


class AcademicOnboardingPayload(BaseModel):
    profile: AcademicOnboardingStep1
    goals: AcademicOnboardingStep2
    preferences: AcademicOnboardingStep3


class AcademicProfileUpdatePayload(BaseModel):
    degree: Optional[str] = None
    branch: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    curriculum: Optional[str] = None
    college_name: Optional[str] = None
    college_id: Optional[str] = None
    university_name: Optional[str] = None
    university_id: Optional[str] = None
    target_gpa: Optional[float] = None
    subjects: Optional[List[dict]] = None
    goals: Optional[dict] = None
    preferences: Optional[dict] = None


class AcademicCompassResponse(BaseModel):
    student_summary: dict
    subjects: List[StudentSubjectInfo]
    recommendations: List[AcademicResourceOut]
    total_resources_count: int
    categories_breakdown: dict

