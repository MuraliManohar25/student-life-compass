import os
import subprocess
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal, get_db
from app.core.security import get_current_user
from app.models.models import User
from app.seed_data import seed_database
from app.schemas.schemas import ProfileOut

if not settings.SECRET_KEY:
    raise RuntimeError("SECRET_KEY environment variable must be set to start the application")

# API Routers
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router, get_my_profile
from app.api.career import router as career_router
from app.api.study import router as study_router
from app.api.budget import router as budget_router
from app.api.placement import router as placement_router
from app.api.risk import router as risk_router
from app.api.notifications import router as notification_router
from app.api.reports import router as reports_router
from app.api.dashboard import router as dashboard_router
from app.api.ai import router as ai_router

# Ensure DB tables exist
Base.metadata.create_all(bind=engine)

# Seed default data
db = SessionLocal()
try:
    seed_database(db)
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(career_router, prefix=settings.API_V1_STR)
app.include_router(study_router, prefix=settings.API_V1_STR)
app.include_router(budget_router, prefix=settings.API_V1_STR)
app.include_router(placement_router, prefix=settings.API_V1_STR)
app.include_router(risk_router, prefix=settings.API_V1_STR)
app.include_router(notification_router, prefix=settings.API_V1_STR)
app.include_router(reports_router, prefix=settings.API_V1_STR)
app.include_router(dashboard_router, prefix=settings.API_V1_STR)
app.include_router(ai_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to Student Life Compass API Backend!",
        "status": "online",
        "documentation": "/docs",
        "health_check": "/api/health",
        "endpoints": {
            "auth": "/api/auth/me",
            "profile": "/api/profile/me",
            "dashboard": "/api/dashboard",
            "career": "/api/career/analyze",
            "study_plan": "/api/study-plan",
            "budget": "/api/budget/summary",
            "placement": "/api/placement-readiness",
            "risk": "/api/risk/predict",
            "notifications": "/api/notifications",
            "reports": "/api/reports/weekly",
            "ai_ask": "/api/ai/ask"
        }
    }

@app.get("/profile/me", response_model=ProfileOut)
def profile_me_unprefixed_alias(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_my_profile(current_user=current_user, db=db)

@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

def get_git_commit():
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"]
        ).decode().strip()
    except Exception:
        return "unknown"

@app.get("/api/version")
def version():
    return {"commit": get_git_commit(), "deployed_at": settings.VERSION}
