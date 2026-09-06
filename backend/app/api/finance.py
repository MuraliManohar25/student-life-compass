from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta, date, timezone
import calendar
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Expense, BudgetPrediction
from app.schemas.schemas import ExpenseOut, ExpenseCreate, BudgetSummaryResponse

router = APIRouter(prefix="/finance", tags=["Finance"])


@router.get("/budget/summary", response_model=BudgetSummaryResponse)
def get_budget_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get budget summary with real calculations from expenses."""
    budget_pred = db.query(BudgetPrediction).filter(
        BudgetPrediction.user_id == current_user.id
    ).first()
    
    monthly_budget = budget_pred.monthly_budget if budget_pred and budget_pred.monthly_budget > 0 else 0.0
    
    now = datetime.now(timezone.utc)
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    expenses = [e for e in expenses if e.date and e.date.year == now.year and e.date.month == now.month]
    
    total_spent = sum(e.amount for e in expenses)
    remaining_budget = max(0.0, monthly_budget - total_spent)
    utilization = round((total_spent / monthly_budget) * 100, 2) if monthly_budget > 0 else 0.0
    
    category_totals = {}
    for e in expenses:
        cat = e.category
        if cat not in category_totals:
            category_totals[cat] = 0.0
        category_totals[cat] += e.amount
    
    warnings = []
    if utilization > 90:
        warnings.append({"message": "You've spent over 90% of your monthly budget!", "level": "critical"})
    elif utilization > 70:
        warnings.append({"message": "You've spent over 70% of your monthly budget.", "level": "warning"})
    elif utilization > 50:
        warnings.append({"message": "You've spent over 50% of your monthly budget this month.", "level": "info"})
    
    today = date.today()
    days_in_month = calendar.monthrange(today.year, today.month)[1]
    daily_average = round(total_spent / days_in_month, 2) if days_in_month > 0 else 0.0
    daily_cap = budget_pred.daily_cap if budget_pred and budget_pred.daily_cap > 0 else round(monthly_budget / 30, 2)
    weekly = {}
    for expense in expenses:
        label = expense.date.strftime("%a")
        weekly[label] = round(weekly.get(label, 0) + expense.amount, 2)
    
    return BudgetSummaryResponse(
        total_spent=round(total_spent, 2),
        remaining_balance=round(remaining_budget, 2),
        monthly_budget=monthly_budget,
        daily_cap=round(daily_cap, 2),
        predicted_monthly_total=round(monthly_budget, 2),
        forecast_confidence=round(100 - utilization, 2),
        suggestions=_get_budget_suggestions(utilization, remaining_budget, monthly_budget),
        utilization_percentage=utilization,
        category_breakdown=category_totals,
        weekly_spending=[{"day": day, "amount": amount} for day, amount in weekly.items()]
    )


@router.get("/expenses", response_model=List[ExpenseOut])
def get_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expenses = db.query(Expense).filter(Expense.user_id == current_user.id)\
        .order_by(Expense.created_at.desc())\
        .all()
    return expenses


@router.post("/expenses", response_model=ExpenseOut, status_code=201)
def create_expense(
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if expense_data.amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Expense amount must be positive"
        )
    expense = Expense(
        user_id=current_user.id,
        title=expense_data.title,
        amount=expense_data.amount,
        category=expense_data.category,
        description=expense_data.description or "",
        notes=expense_data.notes or "",
        date=expense_data.date or datetime.now(timezone.utc)
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.put("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    expense_data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id, 
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    expense.title = expense_data.title
    expense.amount = expense_data.amount
    expense.category = expense_data.category
    expense.description = expense_data.description or ""
    expense.notes = expense_data.notes or ""
    if expense_data.date:
        expense.date = expense_data.date
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/expenses/{expense_id}")
def delete_expense(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    expense = db.query(Expense).filter(
        Expense.id == expense_id, 
        Expense.user_id == current_user.id
    ).first()
    if not expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted successfully"}


def _get_budget_suggestions(utilization, remaining_budget, monthly_budget):
    suggestions = []
    if utilization > 70:
        suggestions.append("Consider reducing discretionary spending this month")
    if remaining_budget < monthly_budget * 0.2:
        suggestions.append("Your remaining budget is less than 20% - focus on essentials only")
    if utilization < 30:
        suggestions.append("You're doing well! Consider saving or investing the surplus")
    if not suggestions:
        suggestions.append("Keep tracking your expenses to maintain good financial habits")
    return suggestions
