from sqlalchemy.orm import Session
from app.core.security import get_password_hash
from app.models.models import (
    User, Profile, Skill, Subject, StudySession, Expense,
    BudgetPrediction, Project, Notification, PlacementProgress,
    RiskPrediction, WeeklyReport
)

def seed_database(db: Session):
    existing_user = db.query(User).first()
    if existing_user:
        return

    print("Seeding database with default student profile...")

    user = User(
        email="murali@stanford.edu",
        hashed_password=get_password_hash("password123"),
        full_name="Murali K.",
        role="student"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    profile = Profile(
        user_id=user.id,
        college="Stanford University",
        major="Computer Science",
        cohort_standing="Top 15%",
        current_gpa=3.88,
        target_gpa=4.00,
        target_role="AI Engineer",
        market_match_index=84.0,
        sleep_hours=6.2
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)

    skills = [
        Skill(profile_id=profile.id, name="Python", proficiency_score=92.0, market_benchmark=90.0, category="Technical"),
        Skill(profile_id=profile.id, name="ML/PyTorch", proficiency_score=88.0, market_benchmark=85.0, category="Technical"),
        Skill(profile_id=profile.id, name="Docker/MLOps", proficiency_score=54.0, market_benchmark=85.0, category="DevOps"),
        Skill(profile_id=profile.id, name="SQL/NoSQL", proficiency_score=78.0, market_benchmark=80.0, category="Database"),
        Skill(profile_id=profile.id, name="Algorithms", proficiency_score=85.0, market_benchmark=85.0, category="DSA")
    ]
    db.add_all(skills)

    subjects = [
        Subject(user_id=user.id, name="Operating Systems", code="CS301", target_grade="A", current_score=86.0, difficulty="High"),
        Subject(user_id=user.id, name="Database Management", code="CS304", target_grade="A", current_score=90.0, difficulty="Medium"),
        Subject(user_id=user.id, name="Deep Learning", code="CS420", target_grade="A+", current_score=92.0, difficulty="High")
    ]
    db.add_all(subjects)

    expenses = [
        Expense(user_id=user.id, title="Canteen Coffee & Snacks", amount=80.0, category="Food", date="Today"),
        Expense(user_id=user.id, title="Semester Printouts & Binder", amount=140.0, category="Academics", date="Yesterday"),
        Expense(user_id=user.id, title="Hostel Wi-Fi Recharge", amount=350.0, category="Utilities", date="Mar 20"),
        Expense(user_id=user.id, title="Book Store Reference Manual", amount=220.0, category="Academics", date="Mar 18")
    ]
    db.add_all(expenses)

    sessions = [
        StudySession(user_id=user.id, title="Operating Systems Lecture", room="Hall 302", tag="Lecture", status="Done", scheduled_time="09:00 AM", duration_minutes=60),
        StudySession(user_id=user.id, title="DBMS Lab Assignment 4", room="Lab B", tag="Assignment", status="In Progress", scheduled_time="11:30 AM", duration_minutes=90),
        StudySession(user_id=user.id, title="DSA Problem Solving (LeetCode)", room="Library", tag="Practice", status="Upcoming", scheduled_time="02:00 PM", duration_minutes=60),
        StudySession(user_id=user.id, title="Docker Containerization Study", room="Hostel Room", tag="AI Mentor", status="Upcoming", scheduled_time="05:00 PM", duration_minutes=45)
    ]
    db.add_all(sessions)

    placements = [
        PlacementProgress(user_id=user.id, company="Stripe", role="Junior Software Engineer", match_percentage=92.0, status="Interviewing", resume_score=90.0),
        PlacementProgress(user_id=user.id, company="Google", role="AI Research Intern", match_percentage=88.0, status="Resume Screened", resume_score=88.0),
        PlacementProgress(user_id=user.id, company="Microsoft", role="Systems Engineer", match_percentage=84.0, status="Applied", resume_score=85.0)
    ]
    db.add_all(placements)

    projects = [
        Project(user_id=user.id, title="Real-time Object Detection Pipeline", description="OpenCV, YOLOv8, and WebRTC streaming for edge devices.", icon="code", type="AI/ML", link="https://github.com", difficulty="Advanced"),
        Project(user_id=user.id, title="FastAPI Microservice Engine", description="Production clean architecture backend with JWT and PostgreSQL.", icon="terminal", type="Backend", link="https://github.com", difficulty="Intermediate")
    ]
    db.add_all(projects)

    notifications = [
        Notification(user_id=user.id, title="Exam Alert", message="Operating Systems Mid-Term in 48 hours.", category="Exam", is_read=False),
        Notification(user_id=user.id, title="Budget Insight", message="You saved ₹400 by avoiding food deliveries this week.", category="Budget", is_read=False)
    ]
    db.add_all(notifications)

    db.commit()
    print("Database seeding completed!")
