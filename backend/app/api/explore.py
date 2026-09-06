from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Spot, SavedItem, ShoppingItem
from app.schemas.schemas import SpotOut, ShoppingItemOut

router = APIRouter(prefix="/explore", tags=["Explore"])


def _spot_out(spot: Spot, saved_ids: set) -> dict:
    return {
        "id": spot.id,
        "name": spot.name,
        "category": spot.category,
        "category_label": spot.category_label,
        "rating": spot.rating or 0.0,
        "distance": spot.distance or "",
        "tags": spot.tags or [],
        "crowd_info": spot.crowd_info or "",
        "extra_badge": spot.extra_badge or "",
        "action_type": spot.action_type or "navigate",
        "action_label": spot.action_label or "Navigate",
        "image_url": spot.image_url or "",
        "alert": spot.alert or "",
        "saved": str(spot.id) in saved_ids,
    }


@router.get("/spots", response_model=List[SpotOut])
def list_spots(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Shared campus-spot catalog with the current user's save flags."""
    spots = db.query(Spot).filter(Spot.is_active == True).order_by(Spot.id).all()  # noqa: E712
    saved_ids = {
        s.ref_id
        for s in db.query(SavedItem)
        .filter(SavedItem.user_id == current_user.id, SavedItem.kind == "spot")
        .all()
    }
    return [_spot_out(spot, saved_ids) for spot in spots]


@router.get("/shopping", response_model=List[ShoppingItemOut])
def list_shopping(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Shared shopping catalog with the current user's selection flags."""
    items = db.query(ShoppingItem).filter(ShoppingItem.is_active == True).order_by(ShoppingItem.id).all()  # noqa: E712
    selected_ids = {
        s.ref_id
        for s in db.query(SavedItem)
        .filter(SavedItem.user_id == current_user.id, SavedItem.kind == "shopping")
        .all()
    }
    return [
        {
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "description": item.description or "",
            "budget_impact": item.budget_impact or "",
            "image_url": item.image_url or "",
            "category": item.category or "essentials",
            "selected": str(item.id) in selected_ids,
        }
        for item in items
    ]
