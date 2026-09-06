import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Student Life Compass API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "43200"))

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./student_compass.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    # External Email Verification API (optional but recommended)
    # Supports AbstractAPI, ZeroBounce, or any compatible provider.
    # If left empty, only syntax + typo-domain checks are performed.
    EMAIL_VERIFICATION_API_URL: str = os.getenv("EMAIL_VERIFICATION_API_URL", "")
    EMAIL_VERIFICATION_API_KEY: str = os.getenv("EMAIL_VERIFICATION_API_KEY", "")

    CORS_ORIGINS: List[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:8000"
    ).split(",")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
