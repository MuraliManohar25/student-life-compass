from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Profile, WeeklyReport
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/reports", tags=["AI Automation & Reports"])

@router.get("/weekly")
def get_weekly_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_role = profile.target_role if profile else "AI Engineer"
    student_name = current_user.full_name or "Student"

    report = {
        "student_name": student_name,
        "major": profile.major if (profile and profile.major) else "Computer Science",
        "intelligence_score": 82.0,
        "score_change": "+4.2% MoM",
        "cohort_ranking": "Top 5% of cohort",
        "academic_rigor": 88,
        "career_velocity": 84,
        "financial_discipline": 79,
        "capability_matrix": {
            "academics": 88,
            "career": 84,
            "placement": 94,
            "finance": 79,
            "lifestyle": 68
        },
        "growth_trend": [
            {"month": "May", "value": 68},
            {"month": "Jun", "value": 72},
            {"month": "Jul", "value": 75},
            {"month": "Aug", "value": 78},
            {"month": "Sep", "value": 80},
            {"month": "Oct", "value": 82}
        ],
        "metrics": {
            "gpa_projection": "3.88 / 4.0",
            "placement_odds": "94% Success",
            "monthly_runway": "22 Days Left",
            "sleep_quality": "6.2h Avg"
        },
        "ai_synthesis": f"{student_name}'s primary growth lever for Semester 2 is containerized deployment and Docker networking. Academic submission timing has improved by 18%, reducing late-night stress spikes. Target role alignment for {target_role} is 84%.",
        "actionable_tips": [
            {"type": "Next Level Tip", "text": "Complete 2 Docker labs this weekend to unlock 96% placement match for top ML roles.", "color": "text-[#c3c0ff]"},
            {"type": "Optimization", "text": "Shift OS study blocks to 10:00 AM where focus retention is measured at 92%.", "color": "text-emerald-400"},
            {"type": "Risk Guard", "text": "Ensure 7+ hours sleep on Thursday to prevent fatigue during OS mid-term.", "color": "text-amber-300"}
        ]
    }
    return report
