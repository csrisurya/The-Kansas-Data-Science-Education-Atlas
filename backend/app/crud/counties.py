from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.atlas import Atlas

def get_county(db: Session, county_id: int) -> Optional[Atlas]:
    return db.query(Atlas).filter(Atlas.id == county_id).first()

def get_county_by_name(db: Session, county_name: str) -> Optional[Atlas]:
    return db.query(Atlas).filter(Atlas.county_name == county_name).first()

def get_counties(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    has_programs: Optional[int] = None
) -> List[Atlas]:
    query = db.query(Atlas)
    if has_programs is not None:
        query = query.filter(Atlas.total_programs > 0 if has_programs else Atlas.total_programs == 0)
    return query.offset(skip).limit(limit).all()

def get_counties_count(db: Session, has_programs: Optional[int] = None) -> int:
    query = db.query(Atlas)
    if has_programs is not None:
        query = query.filter(Atlas.total_programs > 0 if has_programs else Atlas.total_programs == 0)
    return query.count()

def get_top_counties_by_impact(db: Session, limit: int = 10) -> List[Atlas]:
    return (
        db.query(Atlas)
        .order_by(Atlas.total_program_impact_score.desc())
        .limit(limit)
        .all()
    )
