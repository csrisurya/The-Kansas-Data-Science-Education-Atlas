from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import programs as crud_programs
from app.schemas.atlas import CourseResponse

router = APIRouter()

@router.get("/programs", response_model=dict)
def list_programs(
    skip: int = 0,
    limit: int = 100,
    level: Optional[str] = Query(None),
    modality: Optional[str] = Query(None),
    school_name: Optional[str] = Query(None),
    search_query: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    filters = {}
    if level:
        filters['level'] = level
    if modality:
        filters['modality'] = modality
    if school_name:
        filters['school_name'] = school_name
    if search_query:
        programs = crud_programs.search_courses(db, search_query, filters)
        total = len(programs)
    else:
        programs = crud_programs.get_courses(db, skip=skip, limit=limit, filters=filters)
        total = len(programs)
    return {
        "total": total,
        "programs": [CourseResponse.model_validate(p) for p in programs]
    }

@router.get("/programs/{program_id}", response_model=CourseResponse)
def get_program(program_id: int, db: Session = Depends(get_db)):
    program = crud_programs.get_course_by_id(db, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")
    return CourseResponse.model_validate(program)

@router.get("/programs/by-school/{school_name}", response_model=List[CourseResponse])
def get_programs_by_school(school_name: str, db: Session = Depends(get_db)):
    programs = crud_programs.get_courses_by_school(db, school_name)
    return [CourseResponse.model_validate(p) for p in programs]

@router.get("/programs/schools", response_model=dict)
def get_schools(db: Session = Depends(get_db)):
    schools = crud_programs.get_schools_with_programs(db)
    return {"schools": schools, "count": len(schools)}
