from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.config import settings

from app.database import get_db
from app.models import Atlas
from app.schemas.atlas import AtlasSummary
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "Kansas DS Education Atlas API",
        "version": "1.0.0",
        "docs": "/docs"
    }


# --- New Endpoints ---
@app.get("/api/v1/test/db-connection")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        county_count = db.query(Atlas).count()
        return {"status": "ok", "county_count": county_count}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.get("/api/v1/test/top-counties", response_model=list[AtlasSummary])
def get_top_counties(db: Session = Depends(get_db)):
    counties = (
        db.query(Atlas)
        .order_by(Atlas.total_program_impact_score.desc())
        .limit(5)
        .all()
    )
    return [AtlasSummary.model_validate(c) for c in counties]

@app.get("/health")
def health_check():
    return {"status": "healthy"}
