import io
import json
import os
from pathlib import Path
from typing import Any, List, Optional

from dotenv import load_dotenv
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


def _load_env_file_safely() -> None:
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return

    for encoding in ("utf-8", "utf-8-sig", "utf-16", "utf-16-le", "utf-16-be"):
        try:
            with env_path.open("r", encoding=encoding) as env_file:
                content = env_file.read()
            if content.strip():
                from dotenv import dotenv_values
                values = dotenv_values(stream=io.StringIO(content))
                for key, value in values.items():
                    if key and value is not None and key not in os.environ:
                        os.environ[key] = str(value)
                return
        except (UnicodeDecodeError, OSError, ValueError):
            continue

    load_dotenv(env_path)


_load_env_file_safely()


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

    # JWT Settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))

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
    "https://student-life-compass-1.onrender.com",
    "https://student-life-compass.onrender.com",
]


def _parse_cors_origins() -> List[str]:
    cors_env = os.getenv("CORS_ORIGINS", "")
    origins = list(DEFAULT_CORS_ORIGINS)

    if cors_env and cors_env.strip():
        stripped = cors_env.strip()
        if stripped.startswith("[") and stripped.endswith("]"):
            try:
                parsed = json.loads(stripped)
                if isinstance(parsed, list):
                    origins.extend([str(item).strip().rstrip('/') for item in parsed if str(item).strip()])
            except json.JSONDecodeError:
                pass
        else:
            origins.extend([item.strip().rstrip('/') for item in stripped.split(",") if item.strip()])

    # Deduplicate while preserving order and filter out placeholder text
    seen = set()
    result = []
    for item in origins:
        if item not in seen and "<" not in item:
            seen.add(item)
            result.append(item)
    return result


object.__setattr__(settings, 'CORS_ORIGINS', _parse_cors_origins())