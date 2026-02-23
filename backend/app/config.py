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
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:5173"]
    # Security
    SECRET_KEY: str
    
    class Config:
        env_file = os.path.join(os.path.dirname(__file__), "..", ".env")

settings = Settings()
