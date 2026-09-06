from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.models import (
    User, Profile, Skill, Subject, StudySession, Expense,
    BudgetPrediction, Project, Notification, PlacementProgress,
    RiskPrediction, WeeklyReport
)


def seed_database(db: Session):
    """Seed reference data and a test user for development."""
    # Check if reference data exists
    existing_skills = db.query(Skill).first()
    if existing_skills:
        return

    print("Seeding reference data...")
    
    # Create test user if not exists
    test_user = db.query(User).filter(User.email == "test@student.com").first()
    if not test_user:
        test_user = User(
            supabase_id="local_test_user",
            email="test@student.com",
            hashed_password=hash_password("password123"),
            full_name="Test Student",
            role="student"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        # Create default profile
        profile = Profile(user_id=test_user.id)
        db.add(profile)
        db.commit()
        print("Test user created: test@student.com / password123")
    else:
        print("Test user already exists")

    print("Reference data seeding completed (users created on first Supabase login)")