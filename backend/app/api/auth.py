import uuid
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, hash_password, verify_password, create_access_token
from app.models.models import User, Profile
from app.schemas.schemas import UserCreate, UserLogin, AuthTokenResponse, UserOut
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _sync_supabase_user(db: Session, supabase_user: dict, fallback_name: str = "Student") -> User:
    """Create the app-owned profile row for a user already verified by Supabase Auth."""
    auth_id = str(supabase_user["id"])
    email = str(supabase_user.get("email") or "").lower()
    user = db.query(User).filter(User.supabase_id == auth_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()
    if not user:
        metadata = supabase_user.get("user_metadata") or {}
        user = User(supabase_id=auth_id, email=email, full_name=metadata.get("full_name") or fallback_name, role="student")
        db.add(user); db.commit(); db.refresh(user)
    elif user.supabase_id != auth_id:
        user.supabase_id = auth_id; db.commit()
    if not db.query(Profile).filter(Profile.user_id == user.id).first():
        db.add(Profile(user_id=user.id)); db.commit()
    return user


def _supabase_request(path: str, payload: dict) -> dict:
    try:
        response = httpx.post(
            f"{settings.SUPABASE_URL.rstrip('/')}{path}", json=payload,
            headers={"apikey": settings.SUPABASE_ANON_KEY, "Content-Type": "application/json"}, timeout=20,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Supabase authentication is temporarily unavailable.") from exc
    if response.status_code >= 400:
        detail = response.json().get("msg") or response.json().get("message") or "Authentication request failed."
        raise HTTPException(status_code=response.status_code, detail=detail)
    return response.json()


@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with email, password, and full name."""
    email_clean = payload.email.strip().lower()

    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        data = _supabase_request("/auth/v1/signup", {"email": email_clean, "password": payload.password, "data": {"full_name": payload.full_name.strip()}})
        auth_user = data.get("user") or {}
        user = _sync_supabase_user(db, auth_user, payload.full_name.strip())
        token = data.get("access_token")
        if not token:
            raise HTTPException(status_code=202, detail="Confirm your email, then sign in to continue.")
        return AuthTokenResponse(access_token=token, user_id=user.id, email=user.email, full_name=user.full_name)

    # Local development fallback only when Supabase is not configured.
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


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with email, password, and full name (alias for signup)."""
    return signup(payload, db)


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate existing user with email and password."""
    email_clean = payload.email.strip().lower()
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        data = _supabase_request("/auth/v1/token?grant_type=password", {"email": email_clean, "password": payload.password})
        user = _sync_supabase_user(db, data.get("user") or {}, email_clean.split("@")[0])
        return AuthTokenResponse(access_token=data["access_token"], user_id=user.id, email=user.email, full_name=user.full_name)

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


@router.post("/onboarding")
def auth_onboarding(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete onboarding alias."""
    from app.api.profile import complete_onboarding
    from app.schemas.schemas import OnboardingRequest
    req = OnboardingRequest(**payload)
    return complete_onboarding(req, current_user, db)
