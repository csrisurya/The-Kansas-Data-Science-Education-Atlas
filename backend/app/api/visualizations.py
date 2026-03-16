from typing import List, Dict, Any
import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from app.database import get_db
from app.models.atlas import Atlas
from app.models.course import Course
from app.schemas.atlas import AtlasResponse

router = APIRouter()


def _haversine_miles(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return great-circle distance in miles between two lat/lon points."""
    R = 3958.8  # Earth radius in miles
    rlat1, rlat2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(rlat1) * math.cos(rlat2) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

@router.get("/heat-map", response_model=Dict[str, List[Dict[str, Any]]])
def heat_map(
    metric: str = Query("total_ds_ai_courses", description="Metric to visualize"),
    db: Session = Depends(get_db)
):
    # Metrics that map directly to an Atlas column
    column_metrics = {
        "total_program_impact_score": Atlas.total_program_impact_score,
        "online_impact_score": Atlas.online_impact_score,
        "broadband_access_index": Atlas.broadband_access_index,
        "median_income": Atlas.median_household_income,
        "county_population": Atlas.county_population,
    }

    # Special computed metric: count courses per county
    if metric == "total_ds_ai_courses":
        # Count courses grouped by county_name
        course_counts = dict(
            db.query(Course.county_name, func.count(Course.id))
            .filter(Course.course_name != None, Course.course_name != "DNE")
            .group_by(Course.county_name)
            .all()
        )
        counties = db.query(
            Atlas.id,
            Atlas.county_name,
            Atlas.county_latitude,
            Atlas.county_longitude,
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
                "value": course_counts.get(c.county_name, 0),
            })
        return {"counties": result}

    if metric not in column_metrics:
        raise HTTPException(status_code=400, detail=f"Invalid metric: {metric}")
    metric_col = column_metrics[metric]
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

@router.get("/distributions", response_model=Dict[str, Any])
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

@router.get("/gap-analysis", response_model=Dict[str, Any])
def gap_analysis(db: Session = Depends(get_db)):
    # False positives: counties the Random Forest ML model predicted to have
    # DS/AI programs (based on demographic/institutional profiles) but that
    # currently lack them.  Identified via 10-fold cross-validated Random
    # Forest classification on Dataset 7 (see Research Paper, Fig. 8).
    FALSE_POSITIVE_COUNTIES = [
        "Wyandotte County",
        "Harvey County",
        "Reno County",
        "Pottawatomie County",
    ]
    false_positives = (
        db.query(Atlas)
        .filter(Atlas.county_name.in_(FALSE_POSITIVE_COUNTIES))
        .all()
    )
    # Preserve the canonical ordering above
    order = {name: idx for idx, name in enumerate(FALSE_POSITIVE_COUNTIES)}
    false_positives.sort(key=lambda a: order.get(a.county_name, 999))

    # Counties with no programs at all
    no_programs = db.query(Atlas).filter(Atlas.has_programs == 0).all()

    # Counties WITH programs — used as reference points for distance calc
    with_programs = db.query(Atlas).filter(Atlas.has_programs == 1).all()
    program_coords = [
        (float(c.county_latitude), float(c.county_longitude), c.county_name)
        for c in with_programs
        if c.county_latitude is not None and c.county_longitude is not None
    ]

    # Educational deserts: every no-program county with distance to nearest program county
    educational_deserts = []
    for county in no_programs:
        if county.county_latitude is None or county.county_longitude is None:
            continue
        lat, lon = float(county.county_latitude), float(county.county_longitude)
        nearest_dist = float('inf')
        nearest_name = ""
        for plat, plon, pname in program_coords:
            d = _haversine_miles(lat, lon, plat, plon)
            if d < nearest_dist:
                nearest_dist = d
                nearest_name = pname
        educational_deserts.append({
            "county_id": county.id,
            "county_name": county.county_name,
            "county_population": county.county_population,
            "latitude": lat,
            "longitude": lon,
            "distance_miles": round(nearest_dist, 1),
            "distance_to_nearest_program": round(nearest_dist, 1),
            "nearest_program_county": nearest_name,
            "median_household_income": county.median_household_income,
            "broadband_access_index": float(county.broadband_access_index) if county.broadband_access_index else 0,
            "poverty_rate": float(county.poverty_rate) if county.poverty_rate else 0,
            "unemployment_rate": float(county.unemployment_rate) if county.unemployment_rate else 0,
            "total_households": county.total_households,
            "four_year_colleges": county.four_year_colleges,
            "two_year_colleges": county.two_year_colleges,
        })

    # Sort by distance descending (most isolated first)
    educational_deserts.sort(key=lambda x: x["distance_miles"], reverse=True)

    return {
        "false_positives": [AtlasResponse.model_validate(a).model_dump() for a in false_positives],
        "no_programs": [a.county_name for a in no_programs],
        "educational_deserts": educational_deserts
    }
