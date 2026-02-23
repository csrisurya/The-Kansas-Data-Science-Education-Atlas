from typing import Optional
from pydantic import BaseModel

# 1. AtlasBase
class AtlasBase(BaseModel):
    county_name: str
    county_population: Optional[int] = 0
    county_latitude: Optional[float] = None
    county_longitude: Optional[float] = None
    total_program_impact_score: Optional[float] = 0
    has_programs: Optional[int] = 0

# 2. AtlasResponse
class AtlasResponse(AtlasBase):
    id: int
    elementary_schools: Optional[int] = 0
    middle_schools: Optional[int] = 0
    high_schools: Optional[int] = 0
    virtual_schools: Optional[int] = 0
    other_schools: Optional[int] = 0
    four_year_colleges: Optional[int] = 0
    two_year_colleges: Optional[int] = 0
    less_than_two_year_colleges: Optional[int] = 0
    four_year_colleges_with_ds_ai: Optional[int] = 0
    two_year_colleges_with_ds_ai: Optional[int] = 0
    less_than_two_year_colleges_with_ds_ai: Optional[int] = 0
    online_impact_score: Optional[float] = None
    broadband_access_index: Optional[float] = None
    internet_adoption_pct: Optional[float] = None
    avg_broadband_coverage_pct: Optional[float] = None
    pct_no_internet: Optional[float] = None
    total_households: Optional[int] = 0
    effective_access_score: Optional[float] = None
    median_household_income: Optional[int] = 0
    poverty_rate: Optional[float] = None
    unemployment_rate: Optional[float] = None
    advanced_degree_rate: Optional[float] = None
    young_adult_bachelors_plus_rate: Optional[float] = None
    stem_employment_rate: Optional[float] = None
    professional_services_rate: Optional[float] = None
    low_income_digital_access_rate: Optional[float] = None

    class Config:
        from_attributes = True

# 3. AtlasSummary
class AtlasSummary(BaseModel):
    id: int
    county_name: str
    county_population: Optional[int] = 0
    total_program_impact_score: Optional[float] = 0
    has_programs: Optional[int] = 0

    class Config:
        from_attributes = True

# 4. CourseBase, CourseResponse
class CourseBase(BaseModel):
    school_name: str
    degree_name: Optional[str] = None
    dept_name: Optional[str] = None
    course_code: Optional[str] = None
    course_name: Optional[str] = None
    description: Optional[str] = None
    level: Optional[str] = None
    modality: Optional[str] = None
    course_url: Optional[str] = None

class CourseResponse(CourseBase):
    id: int
    class Config:
        from_attributes = True
