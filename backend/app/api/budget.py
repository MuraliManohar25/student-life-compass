from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import calendar
from datetime import datetime
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Expense, BudgetPrediction
from app.schemas.schemas import ExpenseCreate, ExpenseOut, BudgetSummaryResponse
from app.services.ml_service import ml_service

router = APIRouter(prefix="/budget", tags=["Budget Manager"])

@router.get("/expenses", response_model=List[ExpenseOut])
def get_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).order_by(Expense.id.desc()).all()
    return expenses

@router.post("/expenses", response_model=ExpenseOut)
def create_expense(
    data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = Expense(
        user_id=current_user.id,
        title=data.title,
        amount=data.amount,
        category=data.category,
        date=data.date or "Today"
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted"}

@router.get("/summary", response_model=BudgetSummaryResponse)
def get_budget_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    total_spent = sum(e.amount for e in expenses)
    count = len(expenses) or 1
    daily_avg = total_spent / max(1, count)

    food_spent = sum(e.amount for e in expenses if e.category.lower() == "food")
    academic_spent = sum(e.amount for e in expenses if e.category.lower() == "academics")
    food_ratio = food_spent / max(1.0, total_spent)
    academic_ratio = academic_spent / max(1.0, total_spent)

    # Compute actual date values from current month
    now = datetime.utcnow()
    total_days = calendar.monthrange(now.year, now.month)[1]
    days_elapsed = now.day

    # Fetch actual user monthly_budget from BudgetPrediction
    budget_pred = db.query(BudgetPrediction).filter(BudgetPrediction.user_id == current_user.id).first()
    user_budget = budget_pred.monthly_budget if (budget_pred and budget_pred.monthly_budget > 0) else 5000.0

    ml_prediction = ml_service.predict_budget(
        daily_avg=daily_avg,
        days_elapsed=days_elapsed,
        total_days=total_days,
        food_ratio=food_ratio,
        academic_ratio=academic_ratio,
        monthly_budget=user_budget
    )

    return {
        "total_spent": round(total_spent, 2),
        "remaining_balance": ml_prediction["remaining_budget"],
        "monthly_budget": ml_prediction["monthly_budget"],
        "daily_cap": ml_prediction["daily_cap"],
        "predicted_monthly_total": ml_prediction["predicted_monthly_total"],
        "forecast_confidence": ml_prediction["forecast_confidence"],
        "suggestions": ml_prediction["suggestions"]
    }
