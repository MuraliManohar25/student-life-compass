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
    from app.models.models import BudgetPrediction, PlacementProgress, Skill
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    total_spent = sum(e.amount for e in expenses)
    sessions = db.query(StudySession).filter(StudySession.user_id == current_user.id).all()
    placements = db.query(PlacementProgress).filter(PlacementProgress.user_id == current_user.id).all()

    budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == current_user.id).first()
    monthly_budget = budget_pred.monthly_budget if (budget_pred and budget_pred.monthly_budget > 0) else 5000.0
    remaining_budget = max(0.0, monthly_budget - total_spent)
    daily_limit = budget_pred.daily_cap if (budget_pred and budget_pred.daily_cap > 0) else round(monthly_budget / 30.0, 2)

    tasks_list = [
        {
            "id": str(s.id),
            "title": s.title,
            "completed": s.status == "Done",
            "category": s.tag or "Academic"
        }
        for s in sessions
    ]

    timeline_events = [
        {
            "id": f"e{s.id}",
            "title": s.title,
            "location": f"{s.room or 'Campus'} • {s.scheduled_time}",
            "dueText": s.scheduled_time,
            "badgeColor": "error" if "exam" in s.title.lower() or "mid-term" in s.title.lower() else "primary"
        }
        for s in sessions
    ]

    # Calculate user scores dynamically
    completed_sessions = sum(1 for s in sessions if s.status == "Done")
    session_completion_rate = (completed_sessions / max(1, len(sessions))) * 100 if sessions else 70.0
    gpa_pct = ((profile.current_gpa / 4.0) * 100) if (profile and profile.current_gpa > 0) else 75.0
    academic_index = round((gpa_pct * 0.6) + (session_completion_rate * 0.4), 1)

    if placements:
        placement_odds = round(sum(p.match_percentage for p in placements) / len(placements), 1)
    else:
        placement_odds = 70.0 if (profile and profile.target_role) else 50.0

    intelligence_score = round((academic_index * 0.5) + (placement_odds * 0.5), 1)

    rhythm_activity = [
        {"day": "Mon", "val": 60, "label": "2.0h"},
        {"day": "Tue", "val": 75, "label": "2.8h"},
        {"day": "Wed", "val": 50, "label": "1.9h"},
        {"day": "Thu", "val": 85, "label": "3.5h"},
        {"day": "Fri", "val": 70, "label": "2.5h"},
        {"day": "Sat", "val": 40, "label": "1.2h"},
        {"day": "Sun", "val": 55, "label": "2.0h"}
    ]

    ai_actions = []
    if profile and profile.target_role:
        ai_actions.append({
            "id": "a1",
            "title": f"Skill Prep: {profile.target_role}",
            "meta": f"Target role: {profile.target_role}",
            "tab": "career-mentor",
            "icon": "work",
            "color": "indigo"
        })
    if remaining_budget < 1000:
        ai_actions.append({
            "id": "a2",
            "title": "Budget Alert",
            "meta": f"Runway remaining: ₹{remaining_budget:.2f}",
            "tab": "budget",
            "icon": "savings",
            "color": "emerald"
        })
    if not ai_actions:
        ai_actions.append({
            "id": "a1",
            "title": "Set Up Academic Profile",
            "meta": "Add courses and goals",
            "tab": "study-planner",
            "icon": "school",
            "color": "cyan"
        })

    return {
        "user_name": current_user.full_name or "Student",
        "cohort_standing": profile.cohort_standing if profile else "Standard",
        "intelligence_score": intelligence_score,
        "score_trend": "+4%",
        "remaining_budget": round(remaining_budget, 2),
        "daily_budget_limit": round(daily_limit, 2),
        "academic_index": academic_index,
        "placement_odds": placement_odds,
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
    sessions = db.query(StudySession).filter(StudySession.user_id == current_user.id).all()
    events = [
        {
            "id": f"e{s.id}",
            "title": s.title,
            "location": f"{s.room or 'Campus'} • {s.scheduled_time}",
            "dueText": s.scheduled_time,
            "badgeColor": "error" if "exam" in s.title.lower() or "mid-term" in s.title.lower() else "primary"
        }
        for s in sessions
    ]
    return {"events": events}

@router.get("/focus-activity")
def get_focus_activity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime
    sessions = db.query(StudySession).filter(StudySession.user_id == current_user.id).all()
    total_minutes = sum(s.duration_minutes for s in sessions if s.status == "Done")
    total_hours = round(total_minutes / 60.0, 1)
    current_month = datetime.now().strftime("%B %Y")
    return {
        "current_month": current_month,
        "total_hours": total_hours,
        "target_hours": 80,
        "daily_avg": f"{round(total_hours / 30.0, 1)} hrs/day",
        "productive_day": "Thursday"
    }
