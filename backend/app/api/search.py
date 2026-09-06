from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Task, StudySession, Expense, Notification, Spot, ShoppingItem

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("")
def search_all(
    q: str = Query(default="", min_length=1, max_length=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Search the current user's real records plus the shared catalogs."""
    needle = f"%{q.strip().lower()}%"
    like = lambda col: col.ilike(needle)  # noqa: E731

    tasks = (
        db.query(Task)
        .filter(Task.user_id == current_user.id, like(Task.title))
        .order_by(Task.id.desc())
        .limit(10)
        .all()
    )
    sessions = (
        db.query(StudySession)
        .filter(StudySession.user_id == current_user.id, like(StudySession.title))
        .order_by(StudySession.id.desc())
        .limit(10)
        .all()
    )
    expenses = (
        db.query(Expense)
        .filter(Expense.user_id == current_user.id, like(Expense.title))
        .order_by(Expense.id.desc())
        .limit(10)
        .all()
    )
    notifications = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, like(Notification.title))
        .order_by(Notification.id.desc())
        .limit(10)
        .all()
    )
    spots = db.query(Spot).filter(Spot.is_active == True, like(Spot.name)).limit(10).all()  # noqa: E712
    shopping = (
        db.query(ShoppingItem)
        .filter(ShoppingItem.is_active == True, like(ShoppingItem.name))  # noqa: E712
        .limit(10)
        .all()
    )

    return {
        "query": q.strip(),
        "tasks": [{"id": t.id, "title": t.title, "status": t.status, "tab": "academics"} for t in tasks],
        "sessions": [{"id": s.id, "title": s.title, "status": s.status, "tab": "academics"} for s in sessions],
        "expenses": [
            {"id": e.id, "title": e.title, "amount": e.amount, "category": e.category, "tab": "finance"}
            for e in expenses
        ],
        "notifications": [{"id": n.id, "title": n.title, "category": n.category} for n in notifications],
        "spots": [{"id": s.id, "title": s.name, "category": s.category_label, "tab": "explore"} for s in spots],
        "shopping": [{"id": s.id, "title": s.name, "price": s.price, "tab": "finance"} for s in shopping],
    }
