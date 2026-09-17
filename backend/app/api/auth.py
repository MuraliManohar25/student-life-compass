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


def _sync_supabase_user(db: Session, supabase_user: dict, fallback_name: str = "Student", password: str | None = None) -> User:
    """Create the app-owned profile row for a user already verified by Supabase Auth."""
    auth_id = str(supabase_user.get("id") or "")
    if not auth_id:
        raise HTTPException(status_code=502, detail="Authentication service returned an invalid response.")
    email = str(supabase_user.get("email") or "").lower()
    user = db.query(User).filter(User.supabase_id == auth_id).first()
    if not user and email:
        user = db.query(User).filter(User.email == email).first()
    if not user:
        metadata = supabase_user.get("user_metadata") or {}
        user = User(supabase_id=auth_id, email=email, full_name=metadata.get("full_name") or fallback_name, role="student")
        if password:
            user.hashed_password = hash_password(password)
        db.add(user); db.commit(); db.refresh(user)
    else:
        updated = False
        if user.supabase_id != auth_id:
            user.supabase_id = auth_id; updated = True
        # ponytail: store hash alongside Supabase id so local fallback login keeps working
        if password and not user.hashed_password:
            user.hashed_password = hash_password(password); updated = True
        if updated:
            db.commit()
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
        try:
            body = response.json()
        except ValueError:
            body = {}
        if isinstance(body, dict):
            detail = body.get("msg") or body.get("message") or body.get("error_description") or body.get("error") or "Authentication request failed."
        else:
            detail = "Authentication request failed."
        raise HTTPException(status_code=response.status_code, detail=detail)
    try:
        return response.json()
    except ValueError as exc:
        raise HTTPException(status_code=502, detail="Authentication service returned an invalid response.") from exc


def _local_signup(db: Session, email: str, password: str, full_name: str) -> AuthTokenResponse:
    """Local development fallback (and Supabase-outage fallback)."""
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create new user record
    new_user = User(
        supabase_id=f"local_{uuid.uuid4().hex[:12]}",
        email=email,
        hashed_password=hash_password(password),
        full_name=full_name,
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


def _local_login(db: Session, email: str, password: str) -> AuthTokenResponse | None:
    """Verify against the local users table. Returns None when it can't authenticate."""
    user = db.query(User).filter(User.email == email).first()
    if not user or not user.hashed_password or not verify_password(password, user.hashed_password):
        return None
    access_token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return AuthTokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name
    )


@router.post("/signup", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with email, password, and full name."""
    email_clean = payload.email.strip().lower()
    full_name_clean = payload.full_name.strip()

    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            data = _supabase_request("/auth/v1/signup", {"email": email_clean, "password": payload.password, "data": {"full_name": full_name_clean}})
        except HTTPException as exc:
            # ponytail: Supabase rate limits / outages fall back to local auth; real credential errors surface as-is
            if exc.status_code == 429 or exc.status_code >= 500:
                return _local_signup(db, email_clean, payload.password, full_name_clean)
            raise
        auth_user = data.get("user") or {}
        user = _sync_supabase_user(db, auth_user, full_name_clean, payload.password)
        token = data.get("access_token")
        if not token:
            # Email confirmation required by Supabase: issue a local token so signup still works.
            local = _local_login(db, email_clean, payload.password)
            if local:
                local.user_id = user.id; local.email = user.email; local.full_name = user.full_name
                return local
            raise HTTPException(status_code=202, detail="Confirm your email, then sign in to continue.")
        return AuthTokenResponse(access_token=token, user_id=user.id, email=user.email, full_name=user.full_name)

    return _local_signup(db, email_clean, payload.password, full_name_clean)


@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Register a new user with email, password, and full name (alias for signup)."""
    return signup(payload, db)


@router.post("/login", response_model=AuthTokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticate existing user with email and password."""
    email_clean = payload.email.strip().lower()
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            data = _supabase_request("/auth/v1/token?grant_type=password", {"email": email_clean, "password": payload.password})
        except HTTPException as exc:
            # ponytail: Supabase outage/rate-limit or "email not confirmed" falls back to local verify
            if exc.status_code == 429 or exc.status_code >= 500 or exc.status_code == 400:
                local = _local_login(db, email_clean, payload.password)
                if local:
                    return local
            raise
        user = _sync_supabase_user(db, data.get("user") or {}, email_clean.split("@")[0], payload.password)
        return AuthTokenResponse(access_token=data["access_token"], user_id=user.id, email=user.email, full_name=user.full_name)

    local = _local_login(db, email_clean, payload.password)
    if not local:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )
    return local


@router.post("/forgot-password")
def forgot_password(payload: dict, db: Session = Depends(get_db)):
    """Send a password-reset email via Supabase; no-op message when unconfigured."""
    email = str(payload.get("email") or "").strip().lower()
    if not email:
        raise HTTPException(status_code=400, detail="Email is required.")
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        _supabase_request("/auth/v1/recover", {"email": email})
    return {"message": "If an account exists for this email, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(payload: dict):
    """Reset password with a Supabase recovery token."""
    token = str(payload.get("token") or "")
    new_password = str(payload.get("new_password") or "")
    if not token or not new_password:
        raise HTTPException(status_code=400, detail="Token and new password are required.")
    if not (settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY):
        raise HTTPException(status_code=501, detail="Password reset is not configured.")
    try:
        response = httpx.put(
            f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user", json={"password": new_password},
            headers={"apikey": settings.SUPABASE_ANON_KEY, "Authorization": f"Bearer {token}", "Content-Type": "application/json"}, timeout=20,
        )
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=503, detail="Supabase authentication is temporarily unavailable.") from exc
    if response.status_code >= 400:
        raise HTTPException(status_code=response.status_code, detail="Password reset failed. The link may have expired.")
    return {"message": "Password updated successfully."}


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
