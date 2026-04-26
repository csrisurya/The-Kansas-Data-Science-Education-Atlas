from app.api import counties, programs, visualizations, data_request
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


tags_metadata = [
    {
        "name": "counties",
        "description": "Endpoints for county-level data and statistics."
    },
    {
        "name": "programs",
        "description": "Endpoints for DS/AI programs and courses."
    },
    {
        "name": "visualizations",
        "description": "Endpoints for visualization and analytics data."
    },
    {
        "name": "data-request",
        "description": "Endpoints for data requests and report generation."
    },
    {
        "name": "admin",
        "description": "Administrative and health endpoints."
    }
]

app = FastAPI(
    title="Kansas Data Science Education Atlas API",
    description="A comprehensive API for exploring Kansas county-level data, DS/AI programs, and educational impact visualizations.",
    version="1.0.0",
    contact={
        "name": "Kansas State University Data Science Atlas Team",
        "email": "atlas-support@ksu.edu",
        "url": "https://github.com/csrisurya/The-Kansas-Data-Science-Education-Atlas"
    },
    license_info={
        "name": "MIT License",
        "url": "https://opensource.org/licenses/MIT"
    },
    openapi_tags=tags_metadata,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://csk12.cs.ksu.edu",
        "https://engg-cs-csk12-01.cs.ksu.edu",
        "http://localhost:5173",
        "https://atlas-frontend.onrender.com",
    ],
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

@app.get("/health")
def health_check():
    return {"status": "healthy"}


# --- New Endpoints ---
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

# --- API Routers ---
# --- API Routers ---
app.include_router(counties.router, prefix="/api/v1", tags=["counties"])
app.include_router(programs.router, prefix="/api/v1", tags=["programs"])
app.include_router(visualizations.router, prefix="/api/v1/visualizations", tags=["visualizations"])
app.include_router(data_request.router, prefix="/api/v1", tags=["data-request"])
