from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Notification, Task
from app.services.student_service import finance_summary

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[dict])
def get_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(Notification.user_id == current_user.id).order_by(Notification.created_at.desc()).all()
    return [
        {
            "id": n.id,
            "user_id": n.user_id,
            "title": n.title,
            "message": n.message,
            "category": n.category,
            "is_read": n.is_read,
            "created_at": n.created_at
        }
        for n in notifs
    ]


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
    # Check for existing notifications to avoid duplicates
    existing_titles = {
        n.title for n in db.query(Notification).filter(Notification.user_id == current_user.id).all()
    }

    reminders = []
    overdue = db.query(Task).filter(Task.user_id == current_user.id, Task.status != "Completed", Task.deadline < datetime.now()).count()
    if overdue:
        reminders.append({"title": "Overdue study tasks", "message": f"{overdue} task(s) need attention. Start with the highest-priority task.", "category": "Academic"})
    finance = finance_summary(db, current_user.id)
    if finance["monthly_budget"] and finance["utilization_percentage"] >= 70:
        reminders.append({"title": "Budget warning", "message": f"You have used {finance['utilization_percentage']:.0f}% of this month's budget.", "category": "Budget"})

    created_count = 0
    for r in reminders:
        if r["title"] not in existing_titles:
            n = Notification(
                user_id=current_user.id,
                title=r["title"],
                message=r["message"],
                category=r["category"]
            )
            db.add(n)
            created_count += 1
    db.commit()

    return {"message": f"Generated {created_count} new notifications (skipped duplicates)"}
