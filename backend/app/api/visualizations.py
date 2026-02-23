from typing import List, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.models.atlas import Atlas

router = APIRouter()

@router.get("/visualizations/heat-map", response_model=Dict[str, List[Dict[str, Any]]])
def heat_map(
    metric: str = Query("total_program_impact_score", description="Metric to visualize"),
    db: Session = Depends(get_db)
):
    allowed_metrics = {
        "total_program_impact_score": Atlas.total_program_impact_score,
        "online_impact_score": Atlas.online_impact_score,
        "broadband_access_index": Atlas.broadband_access_index,
        "median_income": Atlas.median_household_income,
        "county_population": Atlas.county_population,
    }
    if metric not in allowed_metrics:
        raise HTTPException(status_code=400, detail=f"Invalid metric: {metric}")
    metric_col = allowed_metrics[metric]
    counties = db.query(
        Atlas.id,
        Atlas.county_name,
        Atlas.county_latitude,
        Atlas.county_longitude,
        metric_col.label("value")
    ).all()
    result = []
    for c in counties:
        if c.county_latitude is None or c.county_longitude is None:
            continue
        result.append({
            "id": c.id,
            "county_name": c.county_name,
            "lat": c.county_latitude,
            "lng": c.county_longitude,
            "value": c.value
        })
    return {"counties": result}

@router.get("/visualizations/distributions", response_model=Dict[str, Any])
def distributions(db: Session = Depends(get_db)):
    # Impact score distribution (ranges: 0-20, 20-40, 40-60, 60-80, 80+)
    impact_bins = [0, 20, 40, 60, 80, 1e9]
    impact_labels = ["0-20", "20-40", "40-60", "60-80", "80+"]
    impact_cases = [
        (Atlas.total_program_impact_score >= impact_bins[i]) & (Atlas.total_program_impact_score < impact_bins[i+1])
        for i in range(len(impact_bins)-1)
    ]
    impact_dist = [
        db.query(func.count()).filter(impact_cases[i]).scalar()
        for i in range(len(impact_cases))
    ]
    # Median income distribution (ranges: <40k, 40-60k, 60-80k, 80-100k, 100k+)
    income_bins = [0, 40000, 60000, 80000, 100000, 1e9]
    income_labels = ["<40k", "40-60k", "60-80k", "80-100k", "100k+"]
    income_cases = [
        (Atlas.median_household_income >= income_bins[i]) & (Atlas.median_household_income < income_bins[i+1])
        for i in range(len(income_bins)-1)
    ]
    income_dist = [
        db.query(func.count()).filter(income_cases[i]).scalar()
        for i in range(len(income_cases))
    ]
    # Population distribution (ranges: <10k, 10-25k, 25-50k, 50-100k, 100k+)
    pop_bins = [0, 10000, 25000, 50000, 100000, 1e9]
    pop_labels = ["<10k", "10-25k", "25-50k", "50-100k", "100k+"]
    pop_cases = [
        (Atlas.county_population >= pop_bins[i]) & (Atlas.county_population < pop_bins[i+1])
        for i in range(len(pop_bins)-1)
    ]
    pop_dist = [
        db.query(func.count()).filter(pop_cases[i]).scalar()
        for i in range(len(pop_cases))
    ]
    # Broadband access statistics
    broadband_stats = db.query(
        func.min(Atlas.broadband_access_index),
        func.max(Atlas.broadband_access_index),
        func.avg(Atlas.broadband_access_index),
        func.percentile_cont(0.5).within_group(Atlas.broadband_access_index),
        func.stddev(Atlas.broadband_access_index)
    ).one()
    return {
        "impact_distribution": dict(zip(impact_labels, impact_dist)),
        "income_distribution": dict(zip(income_labels, income_dist)),
        "population_distribution": dict(zip(pop_labels, pop_dist)),
        "broadband_stats": {
            "min": broadband_stats[0],
            "max": broadband_stats[1],
            "avg": broadband_stats[2],
            "median": broadband_stats[3],
            "std_dev": broadband_stats[4],
        }
    }

@router.get("/visualizations/gap-analysis", response_model=Dict[str, Any])
def gap_analysis(db: Session = Depends(get_db)):
    # False positives: predicted to have programs but don't (placeholder: total_programs == 0 and impact_score > 30)
    false_positives = db.query(Atlas).filter(Atlas.total_programs == 0, Atlas.total_program_impact_score > 30).all()
    # Counties with 0 programs
    no_programs = db.query(Atlas).filter(Atlas.total_programs == 0).all()
    # Educational deserts: placeholder for now
    educational_deserts = []
    return {
        "false_positives": [a.county_name for a in false_positives],
        "no_programs": [a.county_name for a in no_programs],
        "educational_deserts": educational_deserts
    }
