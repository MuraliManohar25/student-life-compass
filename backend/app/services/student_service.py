from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import BudgetPrediction, Expense, Profile, Task, Skill


def finance_summary(db: Session, user_id: int) -> dict:
    budget = db.query(BudgetPrediction).filter_by(user_id=user_id).first()
    monthly_budget = budget.monthly_budget if budget else 0.0
    now = datetime.now(timezone.utc)
    expenses = [e for e in db.query(Expense).filter_by(user_id=user_id).all()
                if e.date and e.date.year == now.year and e.date.month == now.month]
    spent = round(sum(e.amount for e in expenses), 2)
    return {"monthly_budget": monthly_budget, "total_spent": spent,
            "remaining_budget": round(max(0, monthly_budget - spent), 2),
            "utilization_percentage": round((spent / monthly_budget * 100) if monthly_budget else 0, 2)}


def task_priority(task: Task) -> tuple[float, str]:
    now = datetime.now(timezone.utc)
    urgency = 0
    if task.deadline:
        due = (task.deadline - now).total_seconds() / 86400
        urgency = 50 if due <= 0 else max(0, 45 - due * 5)
    importance = {"Urgent": 30, "High": 22, "Medium": 14, "Low": 6}.get(task.priority, 14)
    difficulty = {"Hard": 12, "Medium": 7, "Easy": 3}.get(task.difficulty, 7)
    score = round(min(100, urgency + importance + difficulty), 1)
    reason = "No deadline is set; ordered by importance and difficulty."
    if task.deadline:
        reason = "Overdue; complete this first." if urgency == 50 else f"Due soon, with {task.priority.lower()} priority and {task.difficulty.lower()} difficulty."
    return score, reason


def student_context(db: Session, user_id: int) -> dict:
    profile = db.query(Profile).filter_by(user_id=user_id).first()
    pending = db.query(Task).filter(Task.user_id == user_id, Task.status != "Completed").all()
    tasks = [{"title": t.title, "status": t.status, "deadline": t.deadline.isoformat() if t.deadline else None,
              "priority_score": task_priority(t)[0]} for t in pending]
    skills = [s.name for s in db.query(Skill).filter(Skill.profile_id == profile.id).all()] if profile else []
    return {"profile": {"career_goal": profile.target_role if profile else "", "college": profile.college if profile else ""},
            "finance": finance_summary(db, user_id), "tasks": tasks, "skills": skills}
