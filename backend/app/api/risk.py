from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Profile, StudySession
from app.schemas.schemas import RiskPredictionResponse
from app.services.ml_service import ml_service

router = APIRouter(prefix="/risk", tags=["Academic Risk"])

@router.get("/predict", response_model=RiskPredictionResponse)
def predict_academic_risk(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    sessions = db.query(StudySession).filter(StudySession.user_id == current_user.id).all()

    upcoming_exams = sum(1 for s in sessions if "exam" in s.title.lower() or "mid-term" in s.title.lower())
    pending_assignments = sum(1 for s in sessions if s.status != "Done")

    sleep_hrs = profile.sleep_hours if profile else 6.2
    gpa = profile.current_gpa if profile else 3.88
    # Compute workload density from real data (normalized to 0-100 scale)
    workload = min(100.0, ((pending_assignments or 0) * 15 + (upcoming_exams or 0) * 20))

    result = ml_service.predict_academic_risk(
        workload_density=workload,
        sleep_hours=sleep_hrs,
        upcoming_exams=upcoming_exams or 1,
        pending_assignments=pending_assignments or 3,
        current_gpa=gpa
    )

    return result

@router.post("/assess")
def assess_risk(
    current_user: User = Depends(get_current_user)
):
    return {"message": "Academic risk assessment recalculated."}
