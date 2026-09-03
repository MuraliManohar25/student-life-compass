from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import secrets
import string
from datetime import datetime, timedelta
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.models import User, Profile
from app.schemas.schemas import UserSignup, UserLogin, Token, UserOut, ForgotPasswordRequest, ResetPasswordRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=Token)
def signup(user_data: UserSignup, db: Session = Depends(get_db)):
    clean_email = user_data.email.strip().lower()
    existing_user = db.query(User).filter(User.email == clean_email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = get_password_hash(user_data.password)
    new_user = User(
        email=clean_email,
        hashed_password=hashed_pwd,
        full_name=user_data.full_name.strip()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize Profile
    profile = Profile(user_id=new_user.id)
    db.add(profile)
    db.commit()

    token = create_access_token({"sub": new_user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    clean_email = login_data.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    token = create_access_token({"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# Simple in-memory token storage (for demo/hackathon purposes)
# In production, use a database table with expiration
_password_reset_tokens = {}

def generate_reset_token() -> str:
    """Generate a secure random token for password reset."""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(32))

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Initiate password reset. Returns a reset token (in production, this would be sent via email)."""
    user = db.query(User).filter(User.email == request.email).first()
    
    # Always return success to prevent email enumeration
    # But only actually generate token if user exists
    if user:
        token = generate_reset_token()
        _password_reset_tokens[token] = {
            "user_id": user.id,
            "expires_at": datetime.utcnow() + timedelta(hours=1)
        }
        # In production: send email with reset link containing token
        # For hackathon demo: return token directly
        return {
            "message": "Password reset token generated (demo mode - in production this would be sent via email)",
            "reset_token": token,
            "expires_in_hours": 1
        }
    
    return {
        "message": "If an account with this email exists, a reset token has been generated"
    }

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using the token received from forgot-password."""
    # Check if token exists and is valid
    if request.token not in _password_reset_tokens:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
    
    token_data = _password_reset_tokens[request.token]
    
    # Check expiration
    if datetime.utcnow() > token_data["expires_at"]:
        del _password_reset_tokens[request.token]
        raise HTTPException(
            status_code=400,
            detail="Reset token has expired"
        )
    
    # Get user and update password
    user = db.query(User).filter(User.id == token_data["user_id"]).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    # Remove used token
    del _password_reset_tokens[request.token]
    
    return {"message": "Password reset successfully"}
