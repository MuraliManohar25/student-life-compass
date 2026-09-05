from typing import Optional
import jwt
from jwt import PyJWKClient
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.models import User

# OAuth2 scheme - tokenUrl points to Supabase login (handled on frontend)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="supabase", auto_error=False)

# Cache JWKS client
_jwks_client: Optional[PyJWKClient] = None


def get_jwks_client() -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        if not settings.SUPABASE_URL:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="SUPABASE_URL is not configured on the server."
            )
        jwks_url = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url)
    return _jwks_client


async def get_current_user_optional(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if not token:
        return None

    try:
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
            options={"verify_exp": True}
        )
        
        # Supabase JWT contains user info in 'sub' (user ID) and 'email'
        user_id = payload.get("sub")
        email = payload.get("email")
        
        if not user_id:
            return None
            
    except Exception:
        return None

    # Find or create local user record linked to Supabase user
    user = db.query(User).filter(User.supabase_id == user_id).first()
    
    if not user and email:
        # Create local user record on first login
        user = User(
            supabase_id=user_id,
            email=email,
            full_name=payload.get("user_metadata", {}).get("full_name", "User"),
            role="student"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create default profile
        from app.models.models import Profile
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
    
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