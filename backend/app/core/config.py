import json
import os
from pathlib import Path
from typing import Any, List, Optional

from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Life Compass API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Supabase Configuration
    SUPABASE_URL: str = ""
    SUPABASE_ANON_KEY: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""

    # Database (Supabase PostgreSQL)
    DATABASE_URL: str = "sqlite:///./student_compass.db"

    # Google Gemini AI Settings
    GEMINI_API_KEY: str = ""

    # SMTP Settings (Optional)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USERNAME: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = ""
    SMTP_FROM_NAME: str = "Student Life Compass"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
]


def _parse_cors_origins() -> List[str]:
    cors_env = os.getenv("CORS_ORIGINS", "")
    if not cors_env or not cors_env.strip():
        return DEFAULT_CORS_ORIGINS

    stripped = cors_env.strip()

    if stripped.startswith("[") and stripped.endswith("]"):
        try:
            parsed = json.loads(stripped)
            if isinstance(parsed, list):
                return [str(item).strip() for item in parsed if str(item).strip()]
        except json.JSONDecodeError:
            pass

    return [item.strip() for item in stripped.split(",") if item.strip()]


object.__setattr__(settings, 'CORS_ORIGINS', _parse_cors_origins())