from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.course import Course

def get_courses(db: Session, skip: int = 0, limit: int = 100, filters: Optional[Dict] = None) -> List[Course]:
    query = db.query(Course)
    if filters:
        if 'level' in filters:
            query = query.filter(Course.level == filters['level'])
        if 'modality' in filters:
            query = query.filter(Course.modality == filters['modality'])
        if 'school_name' in filters:
            query = query.filter(Course.school_name == filters['school_name'])
    return query.offset(skip).limit(limit).all()

def get_courses_by_school(db: Session, school_name: str) -> List[Course]:
    return db.query(Course).filter(Course.school_name == school_name).all()

def get_course_by_id(db: Session, course_id: int) -> Optional[Course]:
    return db.query(Course).filter(Course.id == course_id).first()

def search_courses(db: Session, query: str, filters: Optional[Dict] = None) -> List[Course]:
    q = db.query(Course).filter(
        or_(
            Course.course_name.ilike(f"%{query}%"),
            Course.description.ilike(f"%{query}%")
        )
    )
    if filters:
        if 'level' in filters:
            q = q.filter(Course.level == filters['level'])
        if 'modality' in filters:
            q = q.filter(Course.modality == filters['modality'])
        if 'school_name' in filters:
            q = q.filter(Course.school_name == filters['school_name'])
    return q.all()

def get_schools_with_programs(db: Session) -> List[str]:
    return [row[0] for row in db.query(Course.school_name).distinct().all()]
