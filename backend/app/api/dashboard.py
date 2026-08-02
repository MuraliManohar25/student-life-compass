from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Profile, StudySession, Expense
from app.schemas.schemas import DashboardResponse

router = APIRouter(prefix="/dashboard", tags=["Morning Dashboard"])

@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    total_spent = sum(e.amount for e in expenses)
    sessions = db.query(StudySession).filter(StudySession.user_id == current_user.id).all()

    from app.models.models import BudgetPrediction
    budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == current_user.id).first()
    monthly_budget = budget_pred.monthly_budget if (budget_pred and budget_pred.monthly_budget > 0) else 5000.0
    remaining_budget = max(0.0, monthly_budget - total_spent)
    daily_limit = budget_pred.daily_cap if (budget_pred and budget_pred.daily_cap > 0) else round(monthly_budget / 30.0, 2)

    tasks_list = [
        {"id": "1", "title": "Complete DBMS Lab Assignment 4", "completed": False, "category": "Academic"},
        {"id": "2", "title": "Solve 2 DSA Problems on LeetCode", "completed": True, "category": "Career"},
        {"id": "3", "title": "Keep daily hostel spend below ₹150", "completed": False, "category": "Budget"},
        {"id": "4", "title": "Submit application for Stripe Intern", "completed": True, "category": "Placement"}
    ]

    timeline_events = [
        {"id": "e1", "title": "Operating Systems Mid-Term", "location": "Hall 302 • 10:00 AM", "dueText": "In 2 Days", "badgeColor": "error"},
        {"id": "e2", "title": "TechFest Hackathon Deadline", "location": "Online Submission", "dueText": "Next Week", "badgeColor": "primary"},
        {"id": "e3", "title": "Cloud Arch Project Demo", "location": "Lab B • 02:30 PM", "dueText": "Apr 12", "badgeColor": "secondary"}
    ]

    rhythm_activity = [
        {"day": "Mon", "val": 65, "label": "2.5h"},
        {"day": "Tue", "val": 80, "label": "3.2h"},
        {"day": "Wed", "val": 45, "label": "1.8h"},
        {"day": "Thu", "val": 90, "label": "4.0h"},
        {"day": "Fri", "val": 75, "label": "3.0h"},
        {"day": "Sat", "val": 30, "label": "1.0h"},
        {"day": "Sun", "val": 60, "label": "2.2h"}
    ]

    ai_actions = [
        {
            "id": "a1",
            "title": "Study Flashcards: Operating Systems",
            "meta": "Memory Management & Virtualization • 15 Mins",
            "tab": "study-planner",
            "icon": "school",
            "color": "cyan"
        },
        {
            "id": "a2",
            "title": "Apply: Junior Dev at Stripe",
            "meta": "92% Match with your Python & API profile",
            "tab": "career-mentor",
            "icon": "work",
            "color": "indigo"
        },
        {
            "id": "a3",
            "title": "Optimization Insight: Hostel Canteen",
            "meta": "Saved ₹400 by avoiding late food deliveries",
            "tab": "budget",
            "icon": "savings",
            "color": "emerald"
        }
    ]

    return {
        "user_name": current_user.full_name or "Student",
        "cohort_standing": profile.cohort_standing if profile else "Top 15%",
        "intelligence_score": 84.0,
        "score_trend": "+6%",
        "remaining_budget": remaining_budget,
        "daily_budget_limit": daily_limit,
        "academic_index": 72.0,
        "placement_odds": 68.0,
        "tasks": tasks_list,
        "timeline_events": timeline_events,
        "rhythm_activity": rhythm_activity,
        "ai_actions": ai_actions
    }

@router.get("/events")
def get_dashboard_events(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    timeline_events = [
        {"id": "e1", "title": "Operating Systems Mid-Term", "location": "Hall 302 • 10:00 AM", "dueText": "In 2 Days", "badgeColor": "error"},
        {"id": "e2", "title": "TechFest Hackathon Deadline", "location": "Online Submission", "dueText": "Next Week", "badgeColor": "primary"},
        {"id": "e3", "title": "Cloud Arch Project Demo", "location": "Lab B • 02:30 PM", "dueText": "Apr 12", "badgeColor": "secondary"}
    ]
    return {"events": timeline_events}

@router.get("/focus-activity")
def get_focus_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime
    current_month = datetime.now().strftime("%B %Y")
    return {
        "current_month": current_month,
        "total_hours": 68,
        "target_hours": 80,
        "daily_avg": "2.5 hrs/day",
        "productive_day": "Thursday"
    }
