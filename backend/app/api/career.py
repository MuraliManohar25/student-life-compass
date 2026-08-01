from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Profile
from app.schemas.schemas import CareerAnalyzeRequest, CareerAnalyzeResponse, CareerChatRequest, CareerChatResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/career", tags=["Career Mentor"])

@router.post("/analyze", response_model=CareerAnalyzeResponse)
def analyze_career(
    req: CareerAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if profile and req.target_role:
        profile.target_role = req.target_role
        db.commit()

    profile_dict = {
        "gpa": profile.current_gpa if profile else 3.88,
        "cohort": profile.cohort_standing if profile else "Top 15%"
    }

    result = gemini_service.analyze_career(req.target_role, profile_dict)
    return result

@router.post("/chat", response_model=CareerChatResponse)
def career_chat(
    req: CareerChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_role = profile.target_role if profile else "AI Engineer"
    reply = gemini_service.chat_dialogue(req.prompt, target_role)
    return {"reply": reply, "source": "gemini-ai"}
