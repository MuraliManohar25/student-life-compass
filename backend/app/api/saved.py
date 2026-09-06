from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, SavedItem
from app.schemas.schemas import SavedItemCreate, SavedItemOut

router = APIRouter(prefix="/saved", tags=["Saved Items"])

ALLOWED_KINDS = {"spot", "paper", "internship", "shopping", "reservation", "cheatsheet"}


@router.get("", response_model=List[SavedItemOut])
def list_saved(
    kind: Optional[str] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(SavedItem).filter(SavedItem.user_id == current_user.id)
    if kind:
        q = q.filter(SavedItem.kind == kind)
    return q.order_by(SavedItem.created_at.desc()).all()


@router.post("", response_model=SavedItemOut, status_code=201)
def save_item(
    data: SavedItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.kind not in ALLOWED_KINDS:
        raise HTTPException(status_code=400, detail=f"Unknown save kind: {data.kind}")
    existing = (
        db.query(SavedItem)
        .filter(
            SavedItem.user_id == current_user.id,
            SavedItem.kind == data.kind,
            SavedItem.ref_id == data.ref_id,
        )
        .first()
    )
    if existing:
        # Idempotent: refresh title/meta and return the stored row.
        if data.title:
            existing.title = data.title
        if data.item_meta is not None:
            existing.item_meta = data.item_meta
        db.commit()
        db.refresh(existing)
        return existing
    item = SavedItem(
        user_id=current_user.id,
        kind=data.kind,
        ref_id=data.ref_id,
        title=data.title or "",
        item_meta=data.item_meta or {},
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}")
def delete_saved(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(SavedItem)
        .filter(SavedItem.id == item_id, SavedItem.user_id == current_user.id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Saved item not found")
    db.delete(item)
    db.commit()
    return {"message": "Removed from saved items"}
