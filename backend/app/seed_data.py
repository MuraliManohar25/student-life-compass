from sqlalchemy.orm import Session
from app.models.models import (
    User, Profile, Skill, Subject, StudySession, Expense,
    BudgetPrediction, Project, Notification, PlacementProgress,
    RiskPrediction, WeeklyReport
)


def seed_database(db: Session):
    """Seed reference data only. Users are created via Supabase Auth on first login."""
    # Check if reference data exists
    existing_skills = db.query(Skill).first()
    if existing_skills:
        return

    print("Seeding reference data...")
    # No user creation here - users are created by get_current_user when they first log in via Supabase
    print("Reference data seeding completed (users created on first Supabase login)")