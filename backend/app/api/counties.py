from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import counties as crud_counties
from app.schemas.atlas import AtlasResponse, AtlasSummary


router = APIRouter()

@router.get("/counties", response_model=dict)
def list_counties(
    skip: int = 0,
    limit: int = 100,
    has_programs: Optional[int] = Query(None, description="Filter by presence of programs (1 or 0)"),
    db: Session = Depends(get_db)
):
    total = crud_counties.get_counties_count(db, has_programs)
    counties = crud_counties.get_counties(db, skip=skip, limit=limit, has_programs=has_programs)
    return {
        "total": total,
        "counties": [AtlasSummary.model_validate(c) for c in counties]
    }

@router.get("/counties/compare", response_model=List[AtlasResponse])
def compare_counties(ids: Optional[str] = Query(None, description="Comma-separated county IDs"), db: Session = Depends(get_db)):
    if not ids:
        return []
    try:
        id_list = [int(i) for i in ids.split(",") if i.strip().isdigit()]
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid county IDs format")
    counties = [crud_counties.get_county(db, cid) for cid in id_list]
    result = [AtlasResponse.model_validate(c) for c in counties if c]
    return result

@router.get("/counties/top-programs", response_model=List[AtlasSummary])
def top_counties(limit: int = 10, db: Session = Depends(get_db)):
    counties = crud_counties.get_top_counties_by_impact(db, limit=limit)
    return [AtlasSummary.model_validate(c) for c in counties]

@router.get("/counties/statistics", response_model=dict)
def counties_statistics(db: Session = Depends(get_db)):
    total = crud_counties.get_counties_count(db)
    with_programs = crud_counties.get_counties_count(db, has_programs=1)
    without_programs = crud_counties.get_counties_count(db, has_programs=0)
    counties = crud_counties.get_counties(db, limit=10000)
    avg_impact = (
        float(sum(c.total_program_impact_score for c in counties) / len(counties))
        if counties else 0
    )
    highest = max(counties, key=lambda c: c.total_program_impact_score, default=None)
    return {
        "total_counties": total,
        "counties_with_programs": with_programs,
        "counties_without_programs": without_programs,
        "avg_impact_score": avg_impact,
        "highest_impact_county": AtlasSummary.model_validate(highest) if highest else None
    }

@router.get("/counties/by-name/{county_name}", response_model=AtlasResponse)
def get_county_by_name(county_name: str, db: Session = Depends(get_db)):
    county = crud_counties.get_county_by_name(db, county_name)
    if not county:
        raise HTTPException(status_code=404, detail="County not found")
    return AtlasResponse.model_validate(county)

@router.get("/counties/{county_id}", response_model=AtlasResponse)
def get_county(county_id: int, db: Session = Depends(get_db)):
    county = crud_counties.get_county(db, county_id)
    if not county:
        raise HTTPException(status_code=404, detail="County not found")
    return AtlasResponse.model_validate(county)
