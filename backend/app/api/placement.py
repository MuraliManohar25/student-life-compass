from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, PlacementProgress, Project
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

    app_list = []
    for a in apps:
        app_list.append({
            "company": a.company,
            "role": a.role,
            "match": f"{int(a.match_percentage)}%",
            "status": a.status,
            "color": "bg-purple-500/20 text-purple-300" if a.status == "Interviewing" else "bg-[#4f46e5]/20 text-[#c3c0ff]"
        })

    ml_readiness = ml_service.predict_placement_readiness(
        resume_score=88.0,
        dsa_solved=140,
        projects_count=len(projects) or 3,
        github_commits=45,
        skill_match=85.0
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
