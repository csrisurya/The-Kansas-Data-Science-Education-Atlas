from sqlalchemy import Column, Integer, String, Numeric, Boolean
from app.database import Base

class Atlas(Base):
    __tablename__ = "atlas"

    id = Column(Integer, primary_key=True, index=True)
    county_name = Column(String(64), nullable=False)
    county_population = Column(Integer, default=0)
    county_latitude = Column(Numeric(9, 6), nullable=True)
    county_longitude = Column(Numeric(9, 6), nullable=True)
    elementary_schools = Column(Integer, default=0)
    middle_schools = Column(Integer, default=0)
    high_schools = Column(Integer, default=0)
    virtual_schools = Column(Integer, default=0)
    other_schools = Column(Integer, default=0)
    four_year_colleges = Column(Integer, default=0)
    two_year_colleges = Column(Integer, default=0)
    less_than_two_year_colleges = Column(Integer, default=0)
    four_year_colleges_with_ds_ai = Column(Integer, default=0)
    two_year_colleges_with_ds_ai = Column(Integer, default=0)
    less_than_two_year_colleges_with_ds_ai = Column(Integer, default=0)
    online_impact_score = Column(Numeric(6, 2), nullable=True)
    total_program_impact_score = Column(Numeric(6, 2), nullable=True)
    broadband_access_index = Column(Numeric(4, 2), nullable=True)
    internet_adoption_pct = Column(Numeric(5, 2), nullable=True)
    avg_broadband_coverage_pct = Column(Numeric(5, 2), nullable=True)
    pct_no_internet = Column(Numeric(5, 2), nullable=True)
    total_households = Column(Integer, default=0)
    effective_access_score = Column(Numeric(6, 2), nullable=True)
    median_household_income = Column(Integer, default=0)
    poverty_rate = Column(Numeric(5, 2), nullable=True)
    unemployment_rate = Column(Numeric(5, 2), nullable=True)
    advanced_degree_rate = Column(Numeric(5, 2), nullable=True)
    young_adult_bachelors_plus_rate = Column(Numeric(5, 2), nullable=True)
    stem_employment_rate = Column(Numeric(5, 2), nullable=True)
    professional_services_rate = Column(Numeric(5, 2), nullable=True)
    low_income_digital_access_rate = Column(Numeric(5, 2), nullable=True)
    has_programs = Column(Boolean, nullable=True)

    def __repr__(self):
        return f"<Atlas(county_name='{self.county_name}', county_population={self.county_population})>"
