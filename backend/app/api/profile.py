from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Profile, Skill, BudgetPrediction
from app.schemas.schemas import ProfileUpdate, ProfileOut

router = APIRouter(prefix="/profile", tags=["Profile & Onboarding"])

@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == current_user.id).first()
    user_monthly_budget = budget_pred.monthly_budget if budget_pred else 0.0

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "college": profile.college or "",
        "major": profile.major or "",
        "cohort_standing": profile.cohort_standing or "Standard",
        "current_gpa": profile.current_gpa or 0.0,
        "target_gpa": profile.target_gpa or 0.0,
        "target_role": profile.target_role or "",
        "market_match_index": profile.market_match_index or 0.0,
        "sleep_hours": profile.sleep_hours or 0.0,
        "monthly_budget": user_monthly_budget
    }

@router.put("/me")
def update_my_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    profile.college = data.college
    profile.major = data.major
    profile.current_gpa = data.current_gpa
    profile.target_gpa = data.target_gpa
    profile.target_role = data.target_role
    profile.sleep_hours = data.sleep_hours

    # Update BudgetPrediction row
    budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == current_user.id).first()
    if not budget_pred:
        budget_pred = BudgetPrediction(
            user_id=current_user.id,
            monthly_budget=data.monthly_budget,
            remaining_budget=data.monthly_budget,
            daily_cap=round(data.monthly_budget / 30.0, 2)
        )
        db.add(budget_pred)
    else:
        budget_pred.monthly_budget = data.monthly_budget
        budget_pred.daily_cap = round(data.monthly_budget / 30.0, 2)

    # Replaces/creates Skill rows
    db.query(Skill).filter(Skill.profile_id == profile.id).delete()
    skill_scores = []
    for s in data.skills:
        skill_name = s.get("name", "").strip()
        score = float(s.get("proficiency_score", 70.0))
        if skill_name:
            new_skill = Skill(
                profile_id=profile.id,
                name=skill_name,
                proficiency_score=score,
                market_benchmark=85.0,
                category="Technical"
            )
            db.add(new_skill)
            skill_scores.append(score)

    if skill_scores:
        profile.market_match_index = round(sum(skill_scores) / len(skill_scores), 1)
    else:
        profile.market_match_index = 75.0

    db.commit()
    db.refresh(profile)

    return {
        "message": "Profile and onboarding updated successfully",
        "profile_complete": True,
        "target_role": profile.target_role,
        "monthly_budget": data.monthly_budget
    }
