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

    # Derived Personalized Overviews from Student Onboarding Data
    user_cgpa = profile.cgpa or profile.current_gpa if profile else 3.8
    user_year = profile.year if profile else "1st Year"
    user_branch = profile.branch or profile.major if profile else "Computer Science"
    user_backlogs = profile.backlogs if profile else 0

    academic_overview = {
        "cgpa": user_cgpa,
        "year": user_year,
        "branch": user_branch,
        "backlogs": user_backlogs
    }

    target_role = profile.target_role or profile.career_goal if profile else "Software Developer"
    career_goal = profile.career_goal or target_role
    recommended_skills = ["System Design", "Cloud/DevOps", "Advanced Data Structures"]
    if "ai" in target_role.lower() or "data" in target_role.lower():
        recommended_skills = ["PyTorch/TensorFlow", "MLOps", "Feature Engineering"]
    elif "web" in target_role.lower():
        recommended_skills = ["React/Next.js", "REST & GraphQL", "State Management"]

    career_overview = {
        "career_goal": career_goal,
        "target_role": target_role,
        "recommended_skills": recommended_skills
    }

    weak_subjects = profile.weak_subjects if (profile and profile.weak_subjects) else ["Operating Systems"]
    study_hours = profile.study_hours if profile else 3.0
    preferred_time = profile.preferred_study_time if profile else "Evening"
    suggested_study_plan = f"Dedicate {max(1.0, study_hours * 0.5):.1f}h daily to {weak_subjects[0]} during your preferred {preferred_time.lower()} session."

    study_overview = {
        "study_hours": study_hours,
        "weak_subjects": weak_subjects,
        "suggested_study_plan": suggested_study_plan
    }

    user_monthly_budget = profile.monthly_budget if (profile and profile.monthly_budget > 0) else monthly_budget
    user_monthly_expenses = total_spent if total_spent > 0 else (profile.monthly_expenses if profile else 0.0)
    user_remaining_budget = max(0.0, user_monthly_budget - user_monthly_expenses)

    budget_overview = {
        "monthly_budget": user_monthly_budget,
        "monthly_expenses": user_monthly_expenses,
        "remaining_budget": user_remaining_budget
    }

    placement_prep = profile.placement_preparation if profile else "Yes"
    placement_lvl = profile.placement_level if profile else "Intermediate"
    recommended_actions = [
        f"Complete 2 LeetCode problem sets targeted for {target_role}",
        "Refactor your GitHub portfolio project architecture",
        "Review core questions on " + (weak_subjects[0] if weak_subjects else "Computer Fundamentals")
    ]

    placement_overview = {
        "placement_preparation": placement_prep,
        "placement_level": placement_lvl,
        "target_role": target_role,
        "recommended_actions": recommended_actions
    }

    # Dynamic risk calculations based on academic and financial status
    acad_risk = "Low"
    if user_backlogs > 1 or user_cgpa < 6.0:
        acad_risk = "High"
    elif user_backlogs == 1 or user_cgpa < 7.5:
        acad_risk = "Moderate"

    budget_risk = "Safe"
    if user_remaining_budget < 500:
        budget_risk = "High"
    elif user_remaining_budget < 1500:
        budget_risk = "Moderate"

    placement_risk = "Low" if placement_lvl == "Advanced" else ("Moderate" if placement_lvl == "Intermediate" else "Needs Focus")

    risk_overview = {
        "academic_risk": acad_risk,
        "placement_risk": placement_risk,
        "financial_risk": budget_risk,
        "budget_risk": budget_risk,
        "burnout_score": 62.0
    }

    challenge = profile.biggest_challenge if profile else "Time Management"
    ai_recommendations = [
        f"Based on your target role as {target_role}, focus on building a standout capstone project.",
        f"To resolve your challenge with {challenge}, use Pomodoro sprints in your {preferred_time.lower()} study window.",
        f"Strengthen your grasp on {weak_subjects[0] if weak_subjects else 'academics'} before mid-term assessments."
    ]

    return {
        "user_name": current_user.full_name or "Student",
        "cohort_standing": profile.cohort_standing if profile else "Top 15%",
        "intelligence_score": 84.0,
        "score_trend": "+6%",
        "remaining_budget": user_remaining_budget,
        "daily_budget_limit": daily_limit,
        "academic_index": 72.0 if user_cgpa < 8.0 else 88.0,
        "placement_odds": 68.0 if placement_lvl != "Advanced" else 92.0,
        "tasks": tasks_list,
        "timeline_events": timeline_events,
        "rhythm_activity": rhythm_activity,
        "ai_actions": ai_actions,
        "academic_overview": academic_overview,
        "career_overview": career_overview,
        "study_overview": study_overview,
        "budget_overview": budget_overview,
        "placement_overview": placement_overview,
        "risk_overview": risk_overview,
        "ai_recommendations": ai_recommendations
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
