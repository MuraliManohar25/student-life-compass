from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, PlacementProgress, Project, Profile, Skill
from app.schemas.schemas import PlacementReadinessResponse, PlacementAppCreate
from app.services.ml_service import ml_service

router = APIRouter(prefix="", tags=["Placement Readiness"])


@router.get("/placement-readiness", response_model=PlacementReadinessResponse)
def get_placement_readiness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    apps = db.query(PlacementProgress).filter(PlacementProgress.user_id == current_user.id).all()
    projects = db.query(Project).filter(Project.user_id == current_user.id).all()
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    skills = db.query(Skill).filter(Skill.profile_id == profile.id).all() if profile else []

    app_list = []
    for a in apps:
        app_list.append({
            "company": a.company,
            "role": a.role,
            "match": f"{int(a.match_percentage)}%",
            "status": a.status,
        })

    # Derive values from real user data
    resume_score = profile.resume_score if profile else 75.0
    dsa_solved = profile.dsa_solved if profile else 50
    github_commits = profile.github_commits if profile else 20
    skill_match = sum(s.proficiency_score for s in skills) / len(skills) if skills else 75.0

    ml_readiness = ml_service.predict_placement_readiness(
        resume_score=resume_score,
        dsa_solved=dsa_solved,
        projects_count=len(projects),
        github_commits=github_commits,
        skill_match=skill_match
    )

    ml_readiness["applications"] = app_list
    return ml_readiness


@router.post("/placement/applications")
def add_application(
    data: PlacementAppCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    app = PlacementProgress(
        user_id=current_user.id,
        company=data.company,
        role=data.role,
        status=data.status or "Applied",
        match_percentage=data.match_percentage or 85.0,
        resume_score=88.0
    )
    db.add(app)
    db.commit()
    db.refresh(app)
    return {"message": "Application tracked successfully", "id": app.id}