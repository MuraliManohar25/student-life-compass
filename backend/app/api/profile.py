from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Profile, Skill, BudgetPrediction, College, University, CollegeUniversityAffiliation
from app.schemas.schemas import ProfileUpdate, ProfileOut, OnboardingRequest, QuestionnaireSubmit

router = APIRouter(prefix="/profile", tags=["Profile & Onboarding"])

def _get_profile_out(profile: Profile, db: Session) -> dict:
    budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == profile.user_id).first()
    user_monthly_budget = budget_pred.monthly_budget if budget_pred else 0.0
    skills = db.query(Skill).filter(Skill.profile_id == profile.id).all()

    # Load college & verified university details if college_id exists
    college_details = None
    university_details = None

    if profile.college_id:
        c_obj = db.query(College).filter(College.id == profile.college_id).first()
        if c_obj:
            college_details = {
                "id": c_obj.id,
                "name": c_obj.name,
                "aishe_code": c_obj.aishe_code,
                "institution_type": c_obj.institution_type,
                "city": c_obj.city,
                "district": c_obj.district,
                "state": c_obj.state,
                "official_website": c_obj.official_website,
            }
            # Fetch verified affiliation
            affil = (
                db.query(CollegeUniversityAffiliation)
                .filter(
                    CollegeUniversityAffiliation.college_id == c_obj.id,
                    CollegeUniversityAffiliation.verification_status == "verified",
                )
                .first()
            )
            if affil and affil.university:
                university_details = {
                    "id": affil.university.id,
                    "name": affil.university.name,
                    "aishe_code": affil.university.aishe_code,
                    "verification_status": "verified",
                    "evidence_url": affil.evidence_url,
                    "evidence_source_type": affil.evidence_source_type,
                }

    if not university_details and profile.university_id:
        u_obj = db.query(University).filter(University.id == profile.university_id).first()
        if u_obj:
            university_details = {
                "id": u_obj.id,
                "name": u_obj.name,
                "aishe_code": u_obj.aishe_code,
                "verification_status": u_obj.verification_status or "verified",
            }

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
        "monthly_budget": user_monthly_budget,
        "onboarding_completed": bool(getattr(profile, "onboarding_completed", False) or False),
        "skills": [{"name": s.name, "proficiency_score": s.proficiency_score} for s in skills],

        "college_id": profile.college_id,
        "university_id": profile.university_id,
        "course": getattr(profile, "course", "") or "",
        "branch": getattr(profile, "branch", "") or "",
        "academic_year": getattr(profile, "academic_year", "") or "",
        "semester": getattr(profile, "semester", "") or "",
        "state": getattr(profile, "state", "") or "",
        "district": getattr(profile, "district", "") or "",
        "city": getattr(profile, "city", "") or "",
        "college_details": college_details,
        "university_details": university_details,
    }

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

    return _get_profile_out(profile, db)


@router.post("/onboarding")
def complete_onboarding(
    payload: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if payload.name:
        current_user.full_name = payload.name.strip()
    if payload.college:
        profile.college = payload.college.strip()
    if payload.course:
        profile.major = payload.course.strip()
    if payload.semester:
        profile.cohort_standing = payload.semester.strip()
        profile.semester = payload.semester.strip()
    if payload.career_goal:
        profile.target_role = payload.career_goal.strip()

    profile.onboarding_completed = True
    if payload.location_prefs is not None:
        profile.location_preferences = payload.location_prefs.strip()
    if payload.notification_prefs is not None:
        profile.notification_preferences = payload.notification_prefs.strip()

    if payload.monthly_budget is not None:
        try:
            budget_val = float(payload.monthly_budget)
        except (ValueError, TypeError):
            raise HTTPException(status_code=422, detail="Monthly budget must be a number")

        budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == current_user.id).first()
        if not budget_pred:
            budget_pred = BudgetPrediction(
                user_id=current_user.id,
                monthly_budget=budget_val,
                remaining_budget=budget_val,
                daily_cap=round(budget_val / 30.0, 2)
            )
            db.add(budget_pred)
        else:
            budget_pred.monthly_budget = budget_val
            budget_pred.daily_cap = round(budget_val / 30.0, 2)

    db.commit()
    db.refresh(profile)
    return {
        "message": "Onboarding completed successfully!",
        "status": "ok",
        "onboarding_completed": True
    }

@router.post("/questionnaire")
def submit_questionnaire(
    payload: QuestionnaireSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mandatory 7-Question Post-Login Questionnaire:
    1. College name
    2. Location (State, District, City)
    3. Course
    4. Branch / Specialization
    5. Studying year
    6. Semester (Optional)
    7. Affiliated University (Optional)
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    # 1. College
    profile.college = payload.college_name.strip()
    profile.college_id = payload.college_id

    # 2. Location
    profile.state = payload.state.strip()
    profile.district = payload.district.strip()
    profile.city = payload.city.strip() if payload.city else ""

    # 3. Course & 4. Branch
    profile.course = payload.course.strip()
    profile.branch = payload.branch.strip()
    profile.major = f"{payload.course.strip()} - {payload.branch.strip()}"

    # 5. Year & 6. Semester
    profile.academic_year = payload.academic_year.strip()
    profile.cohort_standing = payload.academic_year.strip()
    profile.semester = payload.semester.strip() if payload.semester else ""

    # 7. University
    profile.university_id = payload.university_id

    # Mark profile complete
    profile.onboarding_completed = True

    db.commit()
    db.refresh(profile)

    return _get_profile_out(profile, db)


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
        db.flush()

    profile.college = data.college
    profile.major = data.major
    profile.current_gpa = data.current_gpa
    profile.target_gpa = data.target_gpa
    profile.target_role = data.target_role
    profile.sleep_hours = data.sleep_hours

    # College Master Dataset Extensions
    if data.college_id is not None:
        profile.college_id = data.college_id
    if data.university_id is not None:
        profile.university_id = data.university_id
    if data.course is not None:
        profile.course = data.course
    if data.branch is not None:
        profile.branch = data.branch
    if data.academic_year is not None:
        profile.academic_year = data.academic_year
    if data.semester is not None:
        profile.semester = data.semester
    if data.state is not None:
        profile.state = data.state
    if data.district is not None:
        profile.district = data.district
    if data.city is not None:
        profile.city = data.city

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

    # Replaces/creates Skill rows only when the caller sent a skills list;
    # omitting it preserves the student's existing skills.
    if data.skills is not None:
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
