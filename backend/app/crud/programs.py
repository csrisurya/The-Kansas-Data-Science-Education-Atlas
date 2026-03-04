from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from app.models.course import Course


def _apply_filters(query, filters: Optional[Dict]):
    """Apply filters to a query. Values may be strings or lists of strings."""
    if not filters:
        return query
    if 'level' in filters:
        val = filters['level']
        if isinstance(val, list):
            query = query.filter(func.lower(Course.level).in_([v.lower() for v in val]))
        else:
            query = query.filter(func.lower(Course.level) == val.lower())
    if 'modality' in filters:
        val = filters['modality']
        if isinstance(val, list):
            query = query.filter(func.lower(Course.modality).in_([v.lower() for v in val]))
        else:
            query = query.filter(func.lower(Course.modality) == val.lower())
    if 'institution_type' in filters:
        val = filters['institution_type']
        if isinstance(val, list):
            query = query.filter(Course.institution_type.in_(val))
        else:
            query = query.filter(Course.institution_type == val)
    if 'county_name' in filters:
        query = query.filter(func.lower(Course.county_name) == filters['county_name'].lower())
    if 'school_name' in filters:
        query = query.filter(Course.school_name == filters['school_name'])
    return query


def get_courses(db: Session, skip: int = 0, limit: int = 100, filters: Optional[Dict] = None) -> List[Course]:
    query = db.query(Course)
    query = _apply_filters(query, filters)
    return query.offset(skip).limit(limit).all()

def get_courses_by_school(db: Session, school_name: str) -> List[Course]:
    return db.query(Course).filter(Course.school_name == school_name).all()

def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
    return db.query(Course).filter(Course.id == course_id).first()

def search_courses(db: Session, query: str, filters: Optional[Dict] = None) -> List[Course]:
    q = db.query(Course).filter(
        or_(
            Course.course_name.ilike(f"%{query}%"),
            Course.description.ilike(f"%{query}%"),
            Course.school_name.ilike(f"%{query}%"),
        )
    )
    q = _apply_filters(q, filters)
    return q.all()

def get_schools_with_programs(db: Session) -> List[str]:
    return [row[0] for row in db.query(Course.school_name).distinct().all()]
