import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, hash_password, verify_password, create_access_token
from app.models.models import User, Profile
from app.schemas.schemas import UserCreate, UserLogin, AuthTokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with email, password, and full name."""
    email_clean = payload.email.strip().lower()

    # Check if user already exists
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create new user record
    new_user = User(
        supabase_id=f"local_{uuid.uuid4().hex[:12]}",
        email=email_clean,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role="student"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create default user profile
    profile = Profile(user_id=new_user.id)
    db.add(profile)
    db.commit()

    # Generate access token
    access_token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email})

    return AuthTokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name
    )


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate existing user with email and password."""
    email_clean = payload.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()

    if not user or not user.hashed_password or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})

    return AuthTokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return current_user


@router.post("/sync")
def sync_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Sync user data."""
    return {
        "message": "User synced successfully",
        "user_id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name
    }