from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Task, User
from app.schemas.schemas import TaskCreate, TaskUpdate
from app.services.student_service import task_priority

router = APIRouter(prefix="/tasks", tags=["Academics"])

def output(task: Task):
    score, reason = task_priority(task)
    return {"id": task.id, "title": task.title, "description": task.description, "subject_id": task.subject_id,
      "priority": task.priority, "difficulty": task.difficulty, "deadline": task.deadline,
      "estimated_minutes": task.estimated_minutes, "status": task.status, "priority_score": score, "reason": reason}

@router.get("")
def list_tasks(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return [output(task) for task in db.query(Task).filter_by(user_id=current_user.id).all()]

@router.get("/sequencer")
def sequencer(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = [output(task) for task in db.query(Task).filter(Task.user_id == current_user.id, Task.status != "Completed").all()]
    return sorted(rows, key=lambda task: task["priority_score"], reverse=True)

@router.post("", status_code=status.HTTP_201_CREATED)
def create(data: TaskCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = Task(user_id=current_user.id, **data.model_dump())
    db.add(task); db.commit(); db.refresh(task)
    return output(task)

@router.put("/{task_id}")
def update(task_id: int, data: TaskUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter_by(id=task_id, user_id=current_user.id).first()
    if not task: raise HTTPException(404, "Task not found")
    for key, value in data.model_dump(exclude_unset=True).items(): setattr(task, key, value)
    db.commit(); db.refresh(task)
    return output(task)

@router.delete("/{task_id}", status_code=204)
def delete(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.query(Task).filter_by(id=task_id, user_id=current_user.id).first()
    if not task: raise HTTPException(404, "Task not found")
    db.delete(task); db.commit()
