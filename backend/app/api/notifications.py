from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Notification
from app.schemas.schemas import NotificationOut

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationOut])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return notifs

@router.put("/{notif_id}/read")
def mark_notification_read(
    notif_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read"}

@router.post("/generate")
def generate_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Auto-generate automated reminders
    reminders = [
        {"title": "Exam Alert", "message": "Operating Systems Mid-Term in 48 hours.", "category": "Exam"},
        {"title": "Budget Advisory", "message": "Daily spend target is ₹200. Stay on track!", "category": "Budget"},
        {"title": "Placement Opportunity", "message": "Stripe software intern application deadline approaching.", "category": "Placement"}
    ]

    for r in reminders:
        n = Notification(
            user_id=current_user.id,
            title=r["title"],
            message=r["message"],
            category=r["category"]
        )
        db.add(n)
    db.commit()

    return {"message": "Automated notifications generated successfully"}
