import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import bcrypt
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.models import User

# JWT Secret & Algorithm
SECRET_KEY = getattr(settings, "SECRET_KEY", None) or os.getenv("SECRET_KEY", "student-life-compass-secret-key-32chars-min-secure")
ALGORITHM = getattr(settings, "ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = getattr(settings, "ACCESS_TOKEN_EXPIRE_MINUTES", 43200)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

_jwks_client: Optional[PyJWKClient] = None


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_jwks_client() -> Optional[PyJWKClient]:
    global _jwks_client
    if _jwks_client is None and settings.SUPABASE_URL:
        jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
        try:
            _jwks_client = PyJWKClient(jwks_url)
        except Exception:
            _jwks_client = None
    return _jwks_client


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None

    user = None

    # 1. First try verifying as local JWT (HS256)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        sub = payload.get("sub")
        email = payload.get("email")

        if sub:
            if str(sub).isdigit():
                user = db.query(User).filter(User.id == int(sub)).first()
            if not user and email:
                user = db.query(User).filter(User.email == email).first()
            if not user:
                user = db.query(User).filter(User.supabase_id == str(sub)).first()
    except Exception:
        pass

    if user:
        return user

    # 2. Try verifying as Supabase JWT (ES256 / JWKS)
    try:
        jwks_client = get_jwks_client()
        if jwks_client:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["ES256", "HS256"],
                audience="authenticated",
                options={"verify_exp": True}
            )
            user_id = payload.get("sub")
            email = payload.get("email")

            if user_id:
                user = db.query(User).filter(User.supabase_id == user_id).first()
                if not user and email:
                    user = db.query(User).filter(User.email == email).first()

                if not user and email:
                    user = User(
                        supabase_id=user_id,
                        email=email,
                        full_name=payload.get("user_metadata", {}).get("full_name", "User"),
                        role="student"
                    )
                    db.add(user)
                    db.commit()
                    db.refresh(user)

                    from app.models.models import Profile
                    profile = Profile(user_id=user.id)
                    db.add(profile)
                    db.commit()
    except Exception:
        pass

    return user


def get_current_user(
    user: Optional[User] = Depends(get_current_user_optional)
) -> User:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user