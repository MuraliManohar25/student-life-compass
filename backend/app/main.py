import os
from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal, get_db
from app.core.security import get_current_user
from app.models.models import User
from app.seed_data import seed_database
from app.schemas.schemas import ProfileOut

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


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except Exception as e:
        print(f"WARNING: Database initialization/seeding failed: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs" if settings.VERSION == "1.0.0" else None,
    redoc_url="/redoc" if settings.VERSION == "1.0.0" else None,
    lifespan=lifespan,
)

# CORS Setup - allow configured origins, wildcard onrender/vercel subdomains, and localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.onrender\.com|https://.*\.vercel\.app|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers (with both /api prefix and root fallback)
routers = [
    auth_router,
    profile_router,
    career_router,
    study_router,
    budget_router,
    placement_router,
    risk_router,
    notification_router,
    reports_router,
    dashboard_router,
    ai_router,
]

for r in routers:
    app.include_router(r, prefix=settings.API_V1_STR)
    app.include_router(r, prefix="")


@app.get("/")
def root():
    return {
        "message": "Welcome to Student Life Compass API Backend!",
        "status": "online",
        "documentation": "/docs" if settings.VERSION == "1.0.0" else "disabled",
        "health_check": "/api/health",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION
    }


@app.get("/api/version")
def version():
    return {"version": settings.VERSION}