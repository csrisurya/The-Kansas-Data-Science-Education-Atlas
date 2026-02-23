-- Kansas DS Education Atlas: PostgreSQL Schema

-- 1. institutions
DROP TABLE IF EXISTS institutions;
CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(128),
    district VARCHAR(128),
    college_name VARCHAR(128),
    college_type VARCHAR(64),
    county_name VARCHAR(64),
    county_population INTEGER,
    city VARCHAR(64),
    city_population INTEGER,
    zip VARCHAR(16),
    zip_population INTEGER,
    state VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE institutions IS 'K-12 and college institution details';
COMMENT ON COLUMN institutions.school_name IS 'Name of the school or college';
CREATE INDEX idx_institutions_county_name ON institutions(county_name);

-- 2. county_aggregations
DROP TABLE IF EXISTS county_aggregations;
CREATE TABLE county_aggregations (
    id SERIAL PRIMARY KEY,
    county_name VARCHAR(64),
    city VARCHAR(64),
    zip VARCHAR(16),
    county_population INTEGER,
    city_population INTEGER,
    zip_population INTEGER,
    elementary_schools INTEGER,
    middle_schools INTEGER,
    high_schools INTEGER,
    virtual_schools INTEGER,
    other_schools INTEGER,
    four_year_or_above_colleges INTEGER,
    two_year_colleges INTEGER,
    less_than_two_year_colleges INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE county_aggregations IS 'Aggregated school and college counts by county';
CREATE INDEX idx_county_aggregations_county_name ON county_aggregations(county_name);

-- 3. courses
DROP TABLE IF EXISTS courses;
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(128),
    degree_name VARCHAR(128),
    dept_name VARCHAR(128),
    course_code VARCHAR(32),
    course_name VARCHAR(128),
    description TEXT,
    level VARCHAR(32),
    modality VARCHAR(32),
    course_url VARCHAR(256),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE courses IS 'DS/AI course and program inventory';

-- 4. college_locations
DROP TABLE IF EXISTS college_locations;
CREATE TABLE college_locations (
    id SERIAL PRIMARY KEY,
    school_name VARCHAR(128),
    countynm VARCHAR(64),
    city VARCHAR(64),
    latitude NUMERIC(9,6),
    longitude NUMERIC(9,6),
    undergrad_courses_school INTEGER,
    graduate_courses_school INTEGER,
    undergrad_programs_school INTEGER,
    graduate_programs_school INTEGER,
    impact_score NUMERIC(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE college_locations IS 'College locations with coordinates and impact scores';

-- 5. digital_infrastructure
DROP TABLE IF EXISTS digital_infrastructure;
CREATE TABLE digital_infrastructure (
    id SERIAL PRIMARY KEY,
    county_name VARCHAR(64),
    county_population INTEGER,
    total_online_impact_score NUMERIC(6,2),
    broadband_access_index NUMERIC(4,2),
    internet_adoption_pct NUMERIC(5,2),
    avg_broadband_coverage_pct NUMERIC(5,2),
    pct_no_internet NUMERIC(5,2),
    total_households INTEGER,
    effective_access_score NUMERIC(6,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE digital_infrastructure IS 'County-level digital access and broadband metrics';

-- 6. socioeconomic
DROP TABLE IF EXISTS socioeconomic;
CREATE TABLE socioeconomic (
    id SERIAL PRIMARY KEY,
    county VARCHAR(64),
    total_program_impact_score NUMERIC(6,2),
    median_household_income INTEGER,
    poverty_rate NUMERIC(5,2),
    unemployment_rate NUMERIC(5,2),
    advanced_degree_rate NUMERIC(5,2),
    young_adult_bachelors_plus_rate NUMERIC(5,2),
    stem_employment_rate NUMERIC(5,2),
    professional_services_rate NUMERIC(5,2),
    low_income_digital_access_rate NUMERIC(5,2),
    total_population INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE socioeconomic IS 'County-level socioeconomic and education indicators';

-- 7. atlas (comprehensive county data)
DROP TABLE IF EXISTS atlas;
CREATE TABLE atlas (
    id SERIAL PRIMARY KEY,
    county_name VARCHAR(64),
    county_population INTEGER,
    county_latitude NUMERIC(9,6),
    county_longitude NUMERIC(9,6),
    elementary_schools INTEGER,
    middle_schools INTEGER,
    high_schools INTEGER,
    virtual_schools INTEGER,
    other_schools INTEGER,
    four_year_colleges INTEGER,
    two_year_colleges INTEGER,
    less_than_two_year_colleges INTEGER,
    four_year_colleges_with_ds_ai INTEGER,
    two_year_colleges_with_ds_ai INTEGER,
    less_than_two_year_colleges_with_ds_ai INTEGER,
    online_impact_score NUMERIC(6,2),
    total_program_impact_score NUMERIC(6,2),
    broadband_access_index NUMERIC(4,2),
    internet_adoption_pct NUMERIC(5,2),
    avg_broadband_coverage_pct NUMERIC(5,2),
    pct_no_internet NUMERIC(5,2),
    total_households INTEGER,
    effective_access_score NUMERIC(6,2),
    median_household_income INTEGER,
    poverty_rate NUMERIC(5,2),
    unemployment_rate NUMERIC(5,2),
    advanced_degree_rate NUMERIC(5,2),
    young_adult_bachelors_plus_rate NUMERIC(5,2),
    stem_employment_rate NUMERIC(5,2),
    professional_services_rate NUMERIC(5,2),
    low_income_digital_access_rate NUMERIC(5,2),
    has_programs INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE atlas IS 'Comprehensive county-level data (32 columns)';
CREATE INDEX idx_atlas_county_name ON atlas(county_name);
CREATE INDEX idx_atlas_has_programs ON atlas(has_programs);
