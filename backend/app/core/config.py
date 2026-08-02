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

    CORS_ORIGINS: List[str] = DEFAULT_CORS_ORIGINS

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> List[str]:
        if value is None or value == "":
            return DEFAULT_CORS_ORIGINS

        if isinstance(value, (list, tuple, set)):
            return [str(item).strip() for item in value if str(item).strip()]

        if isinstance(value, str):
            stripped = value.strip()

            if not stripped:
                return DEFAULT_CORS_ORIGINS

            if stripped.startswith("[") and stripped.endswith("]"):
                try:
                    parsed = json.loads(stripped)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed if str(item).strip()]
                except json.JSONDecodeError:
                    pass

            return [item.strip() for item in stripped.split(",") if item.strip()]

        return [str(value).strip()]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
