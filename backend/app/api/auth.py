from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile (requires valid Supabase JWT)."""
    return current_user


@router.post("/sync")
def sync_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Sync user data from Supabase (called after login)."""
    # User is already created/updated by get_current_user dependency
    return {
        "message": "User synced successfully",
        "user_id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name
    }