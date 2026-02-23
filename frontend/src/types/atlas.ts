export interface County {
  id: number;
  county_name: string;
  county_population: number;
  county_latitude: number;
  county_longitude: number;
  elementary_schools: number;
  middle_schools: number;
  high_schools: number;
  virtual_schools: number;
  other_schools: number;
  four_year_colleges: number;
  two_year_colleges: number;
  less_than_two_year_colleges: number;
  four_year_colleges_with_ds_ai: number;
  two_year_colleges_with_ds_ai: number;
  less_than_two_year_colleges_with_ds_ai: number;
  online_impact_score: number;
  total_program_impact_score: number;
  broadband_access_index: number;
  internet_adoption_pct: number;
  avg_broadband_coverage_pct: number;
  pct_no_internet: number;
  total_households: number;
  effective_access_score: number;
  median_household_income: number;
  poverty_rate: number;
  unemployment_rate: number;
  advanced_degree_rate: number;
  young_adult_bachelors_plus_rate: number;
  stem_employment_rate: number;
  professional_services_rate: number;
  low_income_digital_access_rate: number;
  has_programs: boolean;
}

export interface Course {
  id: number;
  school_name: string;
  degree_name: string;
  dept_name: string;
  course_code: string;
  course_name: string;
  description: string;
  level: string;
  modality: string;
  course_url: string;
}
