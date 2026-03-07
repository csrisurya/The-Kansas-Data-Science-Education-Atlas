from pydantic_settings import BaseSettings
from typing import Optional

import os

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://atlas_user:your_password@localhost/kansas_atlas"
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Kansas DS Education Atlas"
    
    # CORS
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]
    # Security
    SECRET_KEY: str

    # Email – SendGrid (preferred)
    SENDGRID_API_KEY: Optional[str] = None

    # Email – SMTP fallback
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    # Sender address used by both backends
    FROM_EMAIL: str = "atlas-noreply@ksu.edu"

    # Public base URL of this backend (used for download links in emails)
    BACKEND_URL: str = "http://localhost:8000"

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", ".env")

settings = Settings()
