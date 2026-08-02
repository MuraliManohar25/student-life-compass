import json
import os
from pathlib import Path
from typing import Any, List

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
                values = dotenv_values(stream=content)
                for key, value in values.items():
                    if key and value is not None and key not in os.environ:
                        os.environ[key] = str(value)
                return
        except (UnicodeDecodeError, OSError, ValueError):
            continue

    load_dotenv(env_path)


_load_env_file_safely()

DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8000",
]


class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Life Compass API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./student_compass.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()

# Add CORS_ORIGINS as a standalone attribute (not a pydantic field)
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

# Set CORS_ORIGINS as a dynamic attribute to avoid pydantic_settings parsing
object.__setattr__(settings, 'CORS_ORIGINS', _parse_cors_origins())
