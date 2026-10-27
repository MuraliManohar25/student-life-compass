import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from app.core.database import Base


def utc_now():
    return datetime.now(timezone.utc)


def generate_uuid():
    return str(uuid.uuid4())


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
    saved_items = relationship("SavedItem", back_populates="user", cascade="all, delete-orphan")


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
    # College Master Dataset Integration
    college_id = Column(String, ForeignKey("colleges.id"), nullable=True, index=True)
    university_id = Column(String, ForeignKey("universities.id"), nullable=True, index=True)
    course = Column(String, default="")
    branch = Column(String, default="")
    academic_year = Column(String, default="")
    state = Column(String, default="")
    district = Column(String, default="")
    city = Column(String, default="")
    location_preferences = Column(Text, default="")
    notification_preferences = Column(Text, default="")
    curriculum = Column(String, default="")
    learning_preferences = Column(JSON, default=dict)
    academic_goals = Column(JSON, default=dict)
    subjects_list = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="profile")
    college_rel = relationship("College", foreign_keys=[college_id])
    university_rel = relationship("University", foreign_keys=[university_id])
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
    semester = Column(String, default="")
    credits = Column(Integer, default=3)
    proficiency = Column(String, default="Intermediate")
    needs_improvement = Column(Boolean, default=False)
    topics = Column(JSON, default=list)

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


class Spot(Base):
    """Shared campus-spot catalog (public content, same for every student)."""
    __tablename__ = "spots"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False, default="study")
    category_label = Column(String, nullable=False, default="Study")
    rating = Column(Float, default=4.5)
    distance = Column(String, default="")
    tags = Column(JSON, default=list)
    crowd_info = Column(String, default="")
    extra_badge = Column(String, default="")
    action_type = Column(String, default="navigate")
    action_label = Column(String, default="Navigate")
    image_url = Column(String, default="")
    alert = Column(String, default="")
    is_active = Column(Boolean, default=True)


class ShoppingItem(Base):
    """Shared smart-campus shopping catalog (public content)."""
    __tablename__ = "shopping_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    description = Column(String, default="")
    budget_impact = Column(String, default="")
    image_url = Column(String, default="")
    category = Column(String, default="essentials")
    is_active = Column(Boolean, default=True)


class SavedItem(Base):
    """Per-user persisted state: bookmarks, shopping selections, reservations.

    kind is one of: spot, paper, internship, shopping, reservation, cheatsheet.
    ref_id points at the catalog row (spots/shopping_items) or a free-form key.
    """
    __tablename__ = "saved_items"
    __table_args__ = (UniqueConstraint("user_id", "kind", "ref_id", name="uq_saved_user_kind_ref"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String, nullable=False)
    ref_id = Column(String, nullable=False)
    title = Column(String, default="")
    item_meta = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=utc_now)

    user = relationship("User", back_populates="saved_items")


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


class University(Base):
    __tablename__ = "universities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    aishe_code = Column(String(50), unique=True, index=True, nullable=True)
    name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False, index=True)
    university_type = Column(String(100), default="State Public University")
    city = Column(String(100), default="")
    district = Column(String(100), default="", index=True)
    state = Column(String(100), nullable=False, index=True)
    official_website = Column(String(255), default="")
    recognition_status = Column(String(50), default="UGC_RECOGNIZED")
    verification_status = Column(String(50), default="verified")
    source_dataset = Column(String(100), default="UGC_MASTER")
    source_record_id = Column(String(100), default="")
    last_verified_at = Column(DateTime(timezone=True), default=utc_now)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    affiliations = relationship("CollegeUniversityAffiliation", back_populates="university", cascade="all, delete-orphan")


class College(Base):
    __tablename__ = "colleges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    aishe_code = Column(String(50), unique=True, index=True, nullable=True)
    name = Column(String(255), nullable=False)
    normalized_name = Column(String(255), nullable=False, index=True)
    institution_type = Column(String(100), default="Affiliated College")
    city = Column(String(100), default="")
    district = Column(String(100), default="", index=True)
    state = Column(String(100), nullable=False, index=True)
    country = Column(String(50), default="India")
    postal_code = Column(String(20), default="")
    official_website = Column(String(255), default="")
    official_domain = Column(String(100), default="")
    institution_status = Column(String(50), default="Active")
    verification_status = Column(String(50), default="verified")
    source_dataset = Column(String(100), default="AISHE_MASTER")
    source_record_id = Column(String(100), default="")
    last_verified_at = Column(DateTime(timezone=True), default=utc_now)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    affiliations = relationship("CollegeUniversityAffiliation", back_populates="college", cascade="all, delete-orphan")


class CollegeUniversityAffiliation(Base):
    __tablename__ = "college_university_affiliations"
    __table_args__ = (
        UniqueConstraint("college_id", "university_id", "relationship_type", name="uq_college_univ_rel"),
    )

    id = Column(String(36), primary_key=True, default=generate_uuid)
    college_id = Column(String(36), ForeignKey("colleges.id", ondelete="CASCADE"), nullable=False, index=True)
    university_id = Column(String(36), ForeignKey("universities.id", ondelete="CASCADE"), nullable=False, index=True)
    relationship_type = Column(String(50), default="affiliated")
    verification_status = Column(String(50), default="unverified")
    valid_from = Column(String(50), nullable=True)
    valid_until = Column(String(50), nullable=True)
    evidence_url = Column(String(500), nullable=True)
    evidence_source_type = Column(String(100), nullable=True)
    evidence_checked_at = Column(DateTime(timezone=True), nullable=True)
    confidence_score = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)

    college = relationship("College", back_populates="affiliations")
    university = relationship("University", back_populates="affiliations")


class DatasetImport(Base):
    __tablename__ = "dataset_imports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    dataset_name = Column(String(255), nullable=False)
    source = Column(String(255), nullable=False)
    version = Column(String(100), default="")
    licence_info = Column(String(255), default="Open Government Data License (OGDL) India")
    status = Column(String(50), default="pending")
    records_inserted = Column(Integer, default=0)
    records_updated = Column(Integer, default=0)
    records_skipped = Column(Integer, default=0)
    records_duplicated = Column(Integer, default=0)
    records_failed = Column(Integer, default=0)
    error_summary = Column(JSON, default=list)
    imported_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now)
    completed_at = Column(DateTime(timezone=True), nullable=True)


class MissingCollegeSubmission(Base):
    __tablename__ = "missing_college_submissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    submitted_name = Column(String(255), nullable=False)
    city = Column(String(100), default="")
    district = Column(String(100), default="")
    state = Column(String(100), nullable=False)
    claimed_university = Column(String(255), default="")
    official_website = Column(String(255), default="")
    status = Column(String(50), default="pending_review")
    reviewed_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    review_notes = Column(Text, default="")
    created_at = Column(DateTime(timezone=True), default=utc_now)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now)


class AcademicResource(Base):
    """Personalized and verified academic resource catalog item."""
    __tablename__ = "academic_resources"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    subject_code = Column(String(50), index=True, nullable=False)
    subject_name = Column(String(255), index=True, nullable=False)
    topic = Column(String(255), default="", index=True)
    syllabus_unit = Column(String(100), default="")
    resource_type = Column(String(50), nullable=False)  # "notes", "textbook", "video", "tutorial", "pyq", "syllabus"
    source_category = Column(String(50), default="curated")  # "official", "curated", "external"
    provenance = Column(String(100), default="Curated Academic")
    institution_or_publisher = Column(String(255), default="")
    url = Column(String(500), nullable=False)
    language = Column(String(50), default="English")
    semester = Column(String(50), default="")
    curriculum = Column(String(100), default="All")
    is_verified = Column(Boolean, default=True)
    rating = Column(Float, default=4.8)
    created_at = Column(DateTime(timezone=True), default=utc_now)

