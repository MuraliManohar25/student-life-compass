from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Profile, Skill
from app.schemas.schemas import (
    CareerAnalyzeRequest,
    CareerAnalyzeResponse,
    CareerChatRequest,
    CareerChatResponse,
)
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/career", tags=["career"])


def _get_user_profile_dict(profile: Profile, db: Session) -> dict:
    if not profile:
        return {"market_match_index": 75.0, "skill_gap": []}

    skills = db.query(Skill).filter(Skill.profile_id == profile.id).all()
    skill_gap = [
        {
            "name": s.name,
            "score": s.proficiency_score,
            "benchmark": s.market_benchmark,
            "status": "Met" if s.proficiency_score >= s.market_benchmark else "Gap"
        }
        for s in skills
    ]

    return {
        "market_match_index": profile.market_match_index or 75.0,
        "skill_gap": skill_gap,
        "gpa": profile.current_gpa,
        "cohort": profile.cohort_standing
    }


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

    profile_dict = _get_user_profile_dict(profile, db)
    result = gemini_service.analyze_career(req.target_role, profile_dict)
    return result


@router.post("/chat", response_model=CareerChatResponse)
def career_chat(
    req: CareerChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_role = profile.target_role if (profile and profile.target_role) else "Software Engineer"
    profile_dict = {
        "college": profile.college if profile else "",
        "major": profile.major if profile else "",
        "current_gpa": profile.current_gpa if profile else 0.0,
        "target_gpa": profile.target_gpa if profile else 0.0,
        "market_match_index": profile.market_match_index if profile else 0.0,
    }
    reply, _ = gemini_service.chat_dialogue(req.prompt, target_role, profile_data=profile_dict)
    return {"reply": reply, "source": "gemini-ai"}


@router.get("/roadmap")
def get_career_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_role = profile.target_role if (profile and profile.target_role) else "Software Engineer"
    profile_dict = _get_user_profile_dict(profile, db)
    result = gemini_service.analyze_career(target_role, profile_dict)
    return result


@router.get("/skill-gap")
def get_skill_gap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_role = profile.target_role if (profile and profile.target_role) else "Software Engineer"
    profile_dict = _get_user_profile_dict(profile, db)
    result = gemini_service.analyze_career(target_role, profile_dict)
    return {
        "readiness_score": result.get("market_match_index", 75.0),
        "skill_gap": result.get("skill_gap", [])
    }


@router.get("/resources")
def get_learning_resources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    target_role = profile.target_role if (profile and profile.target_role) else "Software Engineer"
    profile_dict = _get_user_profile_dict(profile, db)
    result = gemini_service.analyze_career(target_role, profile_dict)
    return {
        "resources": result.get("resources", [])
    }