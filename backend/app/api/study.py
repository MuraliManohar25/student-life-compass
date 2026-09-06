from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, StudySession
from app.schemas.schemas import StudySessionCreate, StudySessionUpdate, StudySessionOut, SprintLogRequest

router = APIRouter(prefix="", tags=["Study Planner"])

@router.get("/study-plan", response_model=List[StudySessionOut])
def get_study_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(StudySession).filter(StudySession.user_id == current_user.id).all()
    return sessions

@router.post("/study-plan", response_model=StudySessionOut)
def create_study_session(
    data: StudySessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = StudySession(
        user_id=current_user.id,
        title=data.title,
        scheduled_time=data.scheduled_time,
        room=data.room or "Hostel Room",
        tag=data.tag or "Lecture",
        status=data.status or "Upcoming",
        duration_minutes=data.duration_minutes or 60
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.put("/study-plan/{session_id}", response_model=StudySessionOut)
def update_study_session(
    session_id: int,
    data: StudySessionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")

    if data.title is not None:
        session.title = data.title
    if data.scheduled_time is not None:
        session.scheduled_time = data.scheduled_time
    if data.room is not None:
        session.room = data.room
    if data.tag is not None:
        session.tag = data.tag
    if data.status is not None:
        session.status = data.status
    if data.duration_minutes is not None:
        session.duration_minutes = data.duration_minutes

    db.commit()
    db.refresh(session)
    return session

@router.delete("/study-plan/{session_id}")
def delete_study_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == current_user.id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Study session not found")

    db.delete(session)
    db.commit()
    return {"message": "Study session deleted successfully"}

@router.post("/study/sprint")
def record_sprint(
    req: SprintLogRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import datetime, timezone
    # Persist the sprint as a completed deep-work session so focus hours,
    # rhythm activity, and dashboard stats reflect real completed work.
    session = StudySession(
        user_id=current_user.id,
        title=f"Focus Sprint: {req.subject or 'Deep Work'}",
        scheduled_time=datetime.now(timezone.utc).isoformat(),
        room="Focus Room",
        tag="Deep Work",
        status="Done",
        duration_minutes=req.duration_minutes or 25,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return {
        "message": f"Recorded {req.duration_minutes} min deep work focus sprint!",
        "points_earned": 50,
        "focus_multiplier": 1.2,
        "session_id": session.id,
    }
