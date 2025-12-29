-- CTE: Calculate metrics for each school
WITH school_metrics AS (
  SELECT
    school_name,
    COUNT(CASE WHEN course_name IS NOT NULL AND UPPER(TRIM(course_name)) <> 'DNE' THEN 1 END) AS total_courses_school,
    COUNT(DISTINCT CASE WHEN degree_name IS NOT NULL AND UPPER(TRIM(degree_name)) <> 'DNE' THEN degree_name END) AS total_programs_school,
    SUM(CASE WHEN UPPER(TRIM(level)) = 'UNDERGRADUATE' AND course_name IS NOT NULL AND UPPER(TRIM(course_name)) <> 'DNE' THEN 1 ELSE 0 END) AS undergrad_courses_school,
    SUM(CASE WHEN UPPER(TRIM(level)) = 'GRADUATE' AND course_name IS NOT NULL AND UPPER(TRIM(course_name)) <> 'DNE' THEN 1 ELSE 0 END) AS graduate_courses_school,
    COUNT(DISTINCT CASE WHEN UPPER(TRIM(level)) = 'UNDERGRADUATE' AND degree_name IS NOT NULL AND UPPER(TRIM(degree_name)) <> 'DNE' THEN degree_name END) AS undergrad_programs_school,
    COUNT(DISTINCT CASE WHEN UPPER(TRIM(level)) = 'GRADUATE' AND degree_name IS NOT NULL AND UPPER(TRIM(degree_name)) <> 'DNE' THEN degree_name END) AS graduate_programs_school
  FROM
    `st-project-454917.kansas_data.dataset3`
  WHERE
    school_name IS NOT NULL
  GROUP BY
    school_name
)

-- Final query: Join metrics with NCES college location data
SELECT
  sm.school_name,
  kc.COUNTYNM,
  kc.CITY,
  kc.LATITUDE AS latitude,
  kc.LONGITUD AS longitude,
  sm.undergrad_courses_school,
  sm.graduate_courses_school,
  sm.undergrad_programs_school,
  sm.graduate_programs_school,
  (1.0 * sm.undergrad_programs_school) +
  (2.0 * sm.graduate_programs_school) +
  (0.1 * sm.undergrad_courses_school) +
  (0.2 * sm.graduate_courses_school) AS impact_score
FROM
  school_metrics sm
INNER JOIN
  `st-project-454917.kansas_data.nces_kansas_colleges` kc
ON
  TRIM(LOWER(sm.school_name)) = TRIM(LOWER(kc.INSTNM))
ORDER BY
  impact_score DESC;
