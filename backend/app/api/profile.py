from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Profile, Skill, BudgetPrediction
from app.schemas.schemas import ProfileUpdate, ProfileOut, OnboardingRequest, OnboardingStatusResponse

router = APIRouter(prefix="/profile", tags=["Profile & Onboarding"])

VALID_YEARS = {"1st Year", "2nd Year", "3rd Year", "4th Year"}
VALID_STUDY_TIMES = {"Morning", "Afternoon", "Evening", "Night"}
VALID_LEARNING_METHODS = {"Video", "Reading", "Practice", "Projects", "Mixed"}
VALID_PLACEMENT_LEVELS = {"Beginner", "Intermediate", "Advanced"}


@router.get("/onboarding-status", response_model=OnboardingStatusResponse, summary="Get Onboarding Completion Status")
def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Returns whether the authenticated student has completed the onboarding questionnaire."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    is_completed = bool(current_user.onboarding_completed or (profile and profile.onboarding_completed))
    return {
        "onboarding_completed": is_completed,
        "is_verified": bool(current_user.is_verified)
    }


@router.post("/onboarding", summary="Submit Multi-Step Student Onboarding Questionnaire")
def submit_onboarding(
    data: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits and validates answers to the 8-step onboarding questionnaire:
    Step 1: Basic Information
    Step 2: Academic Information
    Step 3: Skills
    Step 4: Career Goal
    Step 5: Study Habits
    Step 6: Financial / Budget
    Step 7: Placement
    Step 8: Personal Goals
    """
    # Validation checks
    if not (0.0 <= data.cgpa <= 10.0):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="CGPA must be between 0.0 and 10.0."
        )

    if data.year not in VALID_YEARS:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid year selection. Must be one of: {', '.join(VALID_YEARS)}"
        )

    if not (0.0 <= data.study_hours <= 24.0):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Study hours must be between 0.0 and 24.0 hours per day."
        )

    if data.monthly_budget < 0 or data.monthly_expenses < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Budget and expense amounts cannot be negative."
        )

    if not data.college_name.strip() or not data.course.strip() or not data.branch.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="College name, course, and branch are required fields."
        )

    # Fetch or create Profile
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    # Update basic profile details
    profile.college_name = data.college_name.strip()
    profile.college = data.college_name.strip()
    profile.course = data.course.strip()
    profile.branch = data.branch.strip()
    profile.major = data.branch.strip() or data.course.strip()
    profile.year = data.year

    # Academic details
    profile.cgpa = round(data.cgpa, 2)
    profile.current_gpa = round(data.cgpa, 2)
    profile.backlogs = max(0, data.backlogs)
    profile.strong_subjects = data.strong_subjects
    profile.weak_subjects = data.weak_subjects

    # Skills
    profile.programming_languages = data.programming_languages
    profile.technical_skills = data.technical_skills

    # Career goal
    profile.career_goal = data.career_goal.strip()
    profile.target_company_type = data.target_company_type.strip()
    profile.target_role = data.target_role.strip() or data.career_goal.strip()

    # Study habits
    profile.study_hours = round(data.study_hours, 1)
    profile.preferred_study_time = data.preferred_study_time
    profile.learning_method = data.learning_method

    # Financial / Budget
    profile.monthly_budget = round(data.monthly_budget, 2)
    profile.monthly_expenses = round(data.monthly_expenses, 2)
    profile.major_expense_categories = data.major_expense_categories

    # Placement
    profile.placement_preparation = data.placement_preparation
    profile.placement_level = data.placement_level

    # Personal goals & challenges
    profile.biggest_challenge = data.biggest_challenge.strip()
    profile.compass_help = data.compass_help
    profile.onboarding_completed = True

    # Update User model
    current_user.onboarding_completed = True
    if data.full_name and data.full_name.strip():
        current_user.full_name = data.full_name.strip()

    # Sync BudgetPrediction table
    budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == current_user.id).first()
    remaining = max(0.0, data.monthly_budget - data.monthly_expenses)
    daily_cap = round(data.monthly_budget / 30.0, 2) if data.monthly_budget > 0 else 0.0

    if not budget_pred:
        budget_pred = BudgetPrediction(
            user_id=current_user.id,
            monthly_budget=data.monthly_budget,
            predicted_spending=data.monthly_expenses,
            remaining_budget=remaining,
            daily_cap=daily_cap,
            suggestions=["Track your daily food & travel expenses", "Set alerts for hostel fee dues"]
        )
        db.add(budget_pred)
    else:
        budget_pred.monthly_budget = data.monthly_budget
        budget_pred.predicted_spending = data.monthly_expenses
        budget_pred.remaining_budget = remaining
        budget_pred.daily_cap = daily_cap

    # Populate Skill records from onboarding inputs
    db.query(Skill).filter(Skill.profile_id == profile.id).delete()
    all_selected_skills = list(dict.fromkeys(data.programming_languages + data.technical_skills))
    skill_scores = []
    for skill_name in all_selected_skills:
        skill_name_clean = skill_name.strip()
        if skill_name_clean:
            score = 80.0
            new_skill = Skill(
                profile_id=profile.id,
                name=skill_name_clean,
                proficiency_score=score,
                market_benchmark=85.0,
                category="Technical"
            )
            db.add(new_skill)
            skill_scores.append(score)

    if skill_scores:
        profile.market_match_index = round(min(98.0, 65.0 + len(skill_scores) * 4.0), 1)
    else:
        profile.market_match_index = 70.0

    db.commit()
    db.refresh(profile)

    return {
        "success": True,
        "message": "Student profile and onboarding questionnaire completed successfully!",
        "onboarding_completed": True,
        "student_name": current_user.full_name,
        "target_role": profile.target_role,
        "monthly_budget": profile.monthly_budget
    }


@router.get("/me", response_model=ProfileOut, summary="Get Full Student Profile")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieves full profile details for the authenticated student."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == current_user.id).first()
    user_monthly_budget = profile.monthly_budget or (budget_pred.monthly_budget if budget_pred else 5000.0)
    user_monthly_expenses = profile.monthly_expenses or (budget_pred.predicted_spending if budget_pred else 0.0)

    return {
        "id": profile.id,
        "user_id": profile.user_id,
        "full_name": current_user.full_name,
        "college": profile.college or profile.college_name or "",
        "college_name": profile.college_name or profile.college or "",
        "course": profile.course or "",
        "branch": profile.branch or "",
        "year": profile.year or "1st Year",
        "major": profile.major or profile.branch or "",
        "cohort_standing": profile.cohort_standing or "Standard",
        "current_gpa": profile.current_gpa or profile.cgpa or 0.0,
        "cgpa": profile.cgpa or profile.current_gpa or 0.0,
        "target_gpa": profile.target_gpa or 0.0,
        "backlogs": profile.backlogs or 0,
        "strong_subjects": profile.strong_subjects or [],
        "weak_subjects": profile.weak_subjects or [],
        "programming_languages": profile.programming_languages or [],
        "technical_skills": profile.technical_skills or [],
        "career_goal": profile.career_goal or "",
        "target_company_type": profile.target_company_type or "Any Good Opportunity",
        "target_role": profile.target_role or "",
        "study_hours": profile.study_hours or 3.0,
        "preferred_study_time": profile.preferred_study_time or "Evening",
        "learning_method": profile.learning_method or "Mixed",
        "market_match_index": profile.market_match_index or 0.0,
        "sleep_hours": profile.sleep_hours or 7.0,
        "monthly_budget": user_monthly_budget,
        "monthly_expenses": user_monthly_expenses,
        "major_expense_categories": profile.major_expense_categories or [],
        "placement_preparation": profile.placement_preparation or "No",
        "placement_level": profile.placement_level or "Beginner",
        "biggest_challenge": profile.biggest_challenge or "",
        "compass_help": profile.compass_help or [],
        "onboarding_completed": bool(current_user.onboarding_completed or profile.onboarding_completed)
    }


@router.put("/me", summary="Update Profile")
def update_my_profile(
    data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates student profile fields while keeping backward compatibility."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    if data.college is not None:
        profile.college = data.college
    if data.college_name is not None:
        profile.college_name = data.college_name
    if data.course is not None:
        profile.course = data.course
    if data.branch is not None:
        profile.branch = data.branch
    if data.year is not None:
        profile.year = data.year
    if data.major is not None:
        profile.major = data.major
    if data.current_gpa is not None:
        profile.current_gpa = data.current_gpa
    if data.cgpa is not None:
        profile.cgpa = data.cgpa
    if data.target_gpa is not None:
        profile.target_gpa = data.target_gpa
    if data.backlogs is not None:
        profile.backlogs = data.backlogs
    if data.target_role is not None:
        profile.target_role = data.target_role
    if data.career_goal is not None:
        profile.career_goal = data.career_goal
    if data.study_hours is not None:
        profile.study_hours = data.study_hours
    if data.sleep_hours is not None:
        profile.sleep_hours = data.sleep_hours
    if data.monthly_budget is not None:
        profile.monthly_budget = data.monthly_budget
    if data.monthly_expenses is not None:
        profile.monthly_expenses = data.monthly_expenses
    if data.strong_subjects is not None:
        profile.strong_subjects = data.strong_subjects
    if data.weak_subjects is not None:
        profile.weak_subjects = data.weak_subjects
    if data.programming_languages is not None:
        profile.programming_languages = data.programming_languages
    if data.technical_skills is not None:
        profile.technical_skills = data.technical_skills
    if data.placement_preparation is not None:
        profile.placement_preparation = data.placement_preparation
    if data.placement_level is not None:
        profile.placement_level = data.placement_level
    if data.biggest_challenge is not None:
        profile.biggest_challenge = data.biggest_challenge
    if data.compass_help is not None:
        profile.compass_help = data.compass_help

    # Update BudgetPrediction row
    budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == current_user.id).first()
    mb = profile.monthly_budget or 5000.0
    if not budget_pred:
        budget_pred = BudgetPrediction(
            user_id=current_user.id,
            monthly_budget=mb,
            remaining_budget=mb,
            daily_cap=round(mb / 30.0, 2)
        )
        db.add(budget_pred)
    else:
        budget_pred.monthly_budget = mb
        budget_pred.daily_cap = round(mb / 30.0, 2)

    # Replaces/creates Skill rows if provided
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

    db.commit()
    db.refresh(profile)

    return {
        "message": "Profile updated successfully",
        "profile_complete": True,
        "target_role": profile.target_role,
        "monthly_budget": profile.monthly_budget
    }
