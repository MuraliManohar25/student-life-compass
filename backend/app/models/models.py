from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    supabase_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=True)
    full_name = Column(String, nullable=False)
    role = Column(String, default="student")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    profile = relationship("Profile", back_populates="user", uselist=False)
    career_goals = relationship("CareerGoal", back_populates="user")
    subjects = relationship("Subject", back_populates="user")
    study_sessions = relationship("StudySession", back_populates="user")
    expenses = relationship("Expense", back_populates="user")
    budget_predictions = relationship("BudgetPrediction", back_populates="user")
    projects = relationship("Project", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    placement_progress = relationship("PlacementProgress", back_populates="user")
    risk_predictions = relationship("RiskPrediction", back_populates="user")
    weekly_reports = relationship("WeeklyReport", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    college = Column(String, default="")
    major = Column(String, default="")
    cohort_standing = Column(String, default="Standard")
    current_gpa = Column(Float, default=0.0)
    target_gpa = Column(Float, default=0.0)
    target_role = Column(String, default="")
    market_match_index = Column(Float, default=0.0)
    sleep_hours = Column(Float, default=0.0)
    resume_score = Column(Float, default=0.0)
    dsa_solved = Column(Integer, default=0)
    github_commits = Column(Integer, default=0)
    onboarding_completed = Column(Boolean, default=False)
    semester = Column(String, default="")
    location_preferences = Column(Text, default="")
    notification_preferences = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")
    skills = relationship("Skill", back_populates="profile", cascade="all, delete-orphan")


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=False)
    name = Column(String, nullable=False)
    proficiency_score = Column(Float, default=80.0)
    market_benchmark = Column(Float, default=85.0)
    category = Column(String, default="Technical")

    profile = relationship("Profile", back_populates="skills")


class CareerGoal(Base):
    __tablename__ = "career_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    target_role = Column(String, nullable=False)
    target_company = Column(String, default="Tier-1 Tech")
    required_skills = Column(JSON, default=list)
    roadmap_step = Column(JSON, default=dict)
    market_demand = Column(String, default="High")
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="career_goals")


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    target_grade = Column(String, default="A")
    current_score = Column(Float, default=88.0)
    difficulty = Column(String, default="High")

    user = relationship("User", back_populates="subjects")
    study_sessions = relationship("StudySession", back_populates="subject")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    title = Column(String, nullable=False)
    room = Column(String, default="Hostel Room")
    tag = Column(String, default="Lecture")
    status = Column(String, default="Upcoming")
    scheduled_time = Column(String, nullable=False)
    duration_minutes = Column(Integer, default=60)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="study_sessions")
    subject = relationship("Subject", back_populates="study_sessions")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    notes = Column(Text, default="")
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="expenses")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    priority = Column(String, default="Medium")
    difficulty = Column(String, default="Medium")
    deadline = Column(DateTime(timezone=True), nullable=True)
    estimated_minutes = Column(Integer, default=60)
    status = Column(String, default="Todo")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class Internship(Base):
    __tablename__ = "internships"
    id = Column(Integer, primary_key=True)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    location = Column(String, default="")
    domain = Column(String, default="")
    duration = Column(String, default="")
    stipend = Column(String, default="")
    eligibility = Column(Text, default="")
    work_mode = Column(String, default="")
    skills_required = Column(JSON, default=list)
    application_url = Column(String, default="")
    is_demo = Column(Boolean, default=True)


class AIConversation(Base):
    __tablename__ = "ai_conversations"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    prompt = Column(Text, nullable=False)
    reply = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)


class BudgetPrediction(Base):
    __tablename__ = "budget_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    monthly_budget = Column(Float, default=0.0)
    predicted_spending = Column(Float, default=3360.0)
    remaining_budget = Column(Float, default=1640.0)
    daily_cap = Column(Float, default=200.0)
    suggestions = Column(JSON, default=list)
    forecast_date = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="budget_predictions")


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String, default="code")
    type = Column(String, default="AI/ML")
    link = Column(String, default="#")
    difficulty = Column(String, default="Advanced")

    user = relationship("User", back_populates="projects")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String, default="General")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="notifications")


class PlacementProgress(Base):
    __tablename__ = "placement_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    match_percentage = Column(Float, default=85.0)
    status = Column(String, default="Applied")
    resume_score = Column(Float, default=88.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="placement_progress")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    burnout_risk_score = Column(Float, default=62.0)
    risk_level = Column(String, default="Moderate")
    workload_density = Column(Float, default=68.0)
    sleep_deprivation = Column(Boolean, default=False)
    peak_in_hours = Column(Integer, default=48)
    recommendations = Column(JSON, default=list)
    predicted_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="risk_predictions")


class WeeklyReport(Base):
    __tablename__ = "weekly_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    week_number = Column(Integer, default=2)
    intelligence_score = Column(Float, default=84.0)
    academic_index = Column(Float, default=88.0)
    placement_odds = Column(Float, default=94.0)
    monthly_runway_days = Column(Integer, default=22)
    sleep_avg = Column(Float, default=6.2)
    ai_synthesis = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="weekly_reports")
