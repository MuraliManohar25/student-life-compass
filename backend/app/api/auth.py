from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets
import string
from datetime import datetime, timedelta
from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.models import User, Profile
from app.schemas.schemas import (
    UserRegister, UserLogin, Token, UserOut,
    AuthResponse, ForgotPasswordRequest, ResetPasswordRequest
)
from app.services.email_validation import validate_email_address

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Student Registration",
)
@router.post(
    "/signup",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Student Signup (Alias)",
)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new student account.

    - Validates email syntax and checks against known typo/fake domains.
    - If an external email verification API is configured, the deliverability
      of the mailbox is also checked before account creation.
    - Any legitimate email provider is accepted (Gmail, Yahoo, Outlook,
      Proton, etc.). No domain restriction is applied.
    - On success the account is created immediately — no OTP or email
      confirmation step is required.
    """
    # 1. Validate email
    is_valid, normalized_email, error_msg = validate_email_address(user_data.email)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    # 2. Check for duplicate account
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email already exists. Please sign in.",
        )

    # 3. Create user — verified immediately (no OTP needed)
    new_user = User(
        email=normalized_email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        is_verified=True,
        email_verified_at=datetime.utcnow(),
        onboarding_completed=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Initialize associated Profile
    profile = Profile(user_id=new_user.id, onboarding_completed=False)
    db.add(profile)
    db.commit()

    return AuthResponse(
        success=True,
        message="Account created successfully. Please sign in to continue.",
        email=new_user.email,
        is_verified=True,
    )


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------

@router.post("/login", response_model=Token, summary="Student Login")
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate with email + password.
    Returns a JWT access token on success.
    """
    normalized_email = login_data.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    token = create_access_token({"sub": user.email})
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_verified=True,
        onboarding_completed=bool(user.onboarding_completed),
    )


# ---------------------------------------------------------------------------
# Current user
# ---------------------------------------------------------------------------

@router.get("/me", response_model=UserOut, summary="Get Current Authenticated User")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ---------------------------------------------------------------------------
# Password reset (in-memory token — demo grade)
# ---------------------------------------------------------------------------

_password_reset_tokens: dict = {}


def _generate_reset_token() -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(32))


@router.post("/forgot-password", summary="Request Password Reset")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate a password reset. Returns a token (demo mode — not emailed)."""
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        token = _generate_reset_token()
        _password_reset_tokens[token] = {
            "user_id": user.id,
            "expires_at": datetime.utcnow() + timedelta(hours=1),
        }
        return {
            "message": "Password reset token generated. (Demo: in production this would be emailed.)",
            "reset_token": token,
            "expires_in_hours": 1,
        }
    return {"message": "If an account with this email exists, a reset token has been generated."}


@router.post("/reset-password", summary="Reset Password with Token")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using the token from forgot-password."""
    if request.token not in _password_reset_tokens:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        )
    token_data = _password_reset_tokens[request.token]
    if datetime.utcnow() > token_data["expires_at"]:
        del _password_reset_tokens[request.token]
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired.",
        )
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    del _password_reset_tokens[request.token]
    return {"message": "Password reset successfully."}
