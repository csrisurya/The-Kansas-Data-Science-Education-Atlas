WITH All_Course_Program_Counts AS (
  -- 1. Calculate weighted ALL-MODALITY course and program counts per college from raw data
  SELECT
    school_name,
    SUM(CASE WHEN UPPER(TRIM(level)) = 'UNDERGRADUATE' AND course_name IS NOT NULL AND UPPER(TRIM(course_name)) <> 'DNE' THEN 1 ELSE 0 END) AS ugrad_courses,
    SUM(CASE WHEN UPPER(TRIM(level)) = 'GRADUATE' AND course_name IS NOT NULL AND UPPER(TRIM(course_name)) <> 'DNE' THEN 1 ELSE 0 END) AS grad_courses,
    COUNT(DISTINCT CASE WHEN UPPER(TRIM(level)) = 'UNDERGRADUATE' AND degree_name IS NOT NULL AND UPPER(TRIM(degree_name)) <> 'DNE' THEN degree_name END) AS ugrad_programs,
    COUNT(DISTINCT CASE WHEN UPPER(TRIM(level)) = 'GRADUATE' AND degree_name IS NOT NULL AND UPPER(TRIM(degree_name)) <> 'DNE' THEN degree_name END) AS grad_programs
  FROM `st-project-454917.kansas_data.dataset3`
  WHERE school_name IS NOT NULL
  GROUP BY school_name
),
Total_Impact AS (
  -- 2. Calculate the total weighted Impact Score per college
  SELECT
    school_name,
    ( (2.0 * grad_programs) + (1.0 * ugrad_programs) + (0.2 * grad_courses) + (0.1 * ugrad_courses) ) AS Total_Program_Impact_Score
  FROM All_Course_Program_Counts
),
County_Program_Density AS (
  -- 3. Aggregate the Total Impact Score to the County level
  SELECT
    kc.COUNTYNM,
    SUM(ti.Total_Program_Impact_Score) AS Total_Program_Impact_Score
  FROM Total_Impact ti
  INNER JOIN `st-project-454917.kansas_data.nces_kansas_colleges` kc
    ON TRIM(LOWER(ti.school_name)) = TRIM(LOWER(kc.INSTNM))
  GROUP BY kc.COUNTYNM
),
Economic_Demographic_Metrics AS (
  -- 4. Extract CONDENSED economic/demographic metrics
  SELECT
    t1.COUNTY AS COUNTY_NAME,
    t1.ASQPE001 AS Median_Household_Income,
    
    -- (COMBINED - replaces 4 separate degree populations)
    -- Combines Bachelor's, Master's, Professional, Doctorate into single rate
    SAFE_DIVIDE(
      CAST(t2.ASP3E022 AS NUMERIC) +  -- Bachelor's
      CAST(t2.ASP3E023 AS NUMERIC) +  -- Master's
      CAST(t2.ASP3E024 AS NUMERIC) +  -- Professional
      CAST(t2.ASP3E025 AS NUMERIC),   -- Doctorate
      CAST(t4.ASN1E001 AS NUMERIC)    -- Total Population
    ) AS Advanced_Degree_Rate,
    
    SAFE_DIVIDE(t3.ASSRE005, t3.ASSRE003) AS Unemployment_Rate,
    
    t4.ASN1E001 AS Total_Population,
  
    SAFE_DIVIDE(
      CAST(t5.ASQME002 AS NUMERIC),
      CAST(t5.ASQME001 AS NUMERIC)
    ) AS Poverty_Rate,

    -- Single metric for ages 25-34 with Bachelor's or higher
    SAFE_DIVIDE(
      CAST(t6.ASP2E015 + t6.ASP2E016 + t6.ASP2E017 + t6.ASP2E018 + t6.ASP2E032 + t6.ASP2E033 + t6.ASP2E034 + t6.ASP2E035 AS NUMERIC),
      CAST(t6.ASP2E001 AS NUMERIC)
    ) AS Young_Adult_Bachelors_Plus_Rate,

    -- Combines Computer/Math, Engineering, Science occupations
      SAFE_DIVIDE(
      CAST(t7.ASSUE008 + t7.ASSUE044 AS NUMERIC) +
      CAST(t7.ASSUE009 + t7.ASSUE045 AS NUMERIC) +
      CAST(t7.ASSUE010 + t7.ASSUE046 AS NUMERIC),
      CAST(t7.ASSUE001 AS NUMERIC)
    ) AS STEM_Employment_Rate,

    -- Combines Professional/Scientific/Technical + Information industries
    SAFE_DIVIDE(
      CAST(t8.ASS5E018 + t8.ASS5E045 AS NUMERIC) +
      CAST(t8.ASS5E013 + t8.ASS5E040 AS NUMERIC),
      CAST(t8.ASS5E001 AS NUMERIC)
    ) AS Professional_Services_Rate,

    -- Percentage of low-income households (<$35K) with broadband
    SAFE_DIVIDE(
      CAST(t9.ASWUE002 + t9.ASWUE006 + t9.ASWUE010 AS NUMERIC),
      CAST(t9.ASWUE004 + t9.ASWUE008 + t9.ASWUE012 AS NUMERIC)
    ) AS Low_Income_Digital_Access_Rate

    FROM `st-project-454917.kansas_data.nhgis_household_family_income` t1
  INNER JOIN `st-project-454917.kansas_data.nhgis_education_attainment` t2 ON t1.GISJOIN = t2.GISJOIN
  INNER JOIN `st-project-454917.kansas_data.nhgis_employment_status` t3 ON t1.GISJOIN = t3.GISJOIN
  INNER JOIN `st-project-454917.kansas_data.nhgis_county` t4 ON t1.COUNTY = t4.COUNTY
  INNER JOIN `st-project-454917.kansas_data.nhgis_poverty` t5 ON t1.GISJOIN = t5.GISJOIN
  INNER JOIN `st-project-454917.kansas_data.nhgis_young_adult_education_levels` t6 ON t1.GISJOIN = t6.GISJOIN
  INNER JOIN `st-project-454917.kansas_data.nhgis_occupation_for_employees` t7 ON t1.GISJOIN = t7.GISJOIN

INNER JOIN `st-project-454917.kansas_data.nhgis_industry_for_employees` t8 ON t1.GISJOIN = t8.GISJOIN

INNER JOIN `st-project-454917.kansas_data.nhgis_computer_access_by_income_level` t9  ON t1.GISJOIN = t9.GISJOIN
)

-- FINAL SELECT: CONDENSED TO 10 CORE FEATURES (plus target)
SELECT
  edm.COUNTY_NAME AS COUNTYNM,
  
  -- TARGET VARIABLE (will be used to derive Has_Programs in Dataset 7)
  COALESCE(cpd.Total_Program_Impact_Score, 0.0) AS Total_Program_Impact_Score,
  
  -- 9 CONDENSED ECONOMIC/DEMOGRAPHIC FEATURES:
  
  -- Economic Indicators (3 features)
  edm.Median_Household_Income,              -- Wealth measure
  edm.Poverty_Rate,                          -- Economic distress (NEW)
  edm.Unemployment_Rate,                     -- Labor market health
  
  -- Education Indicators (2 features)
  edm.Advanced_Degree_Rate,                  -- Overall education level (COMBINED)
  edm.Young_Adult_Bachelors_Plus_Rate,       -- Student pipeline (NEW)
  
  -- Employment Type (2 features)
  edm.STEM_Employment_Rate,                  -- Tech job demand (NEW)
  edm.Professional_Services_Rate,            -- White-collar economy (NEW)
  
  -- Digital Access (1 feature)
  edm.Low_Income_Digital_Access_Rate,        -- Digital divide for vulnerable populations (NEW)
  
  -- Demographics (1 feature)
  edm.Total_Population                       -- Size/urbanicity proxy

FROM Economic_Demographic_Metrics edm
LEFT JOIN County_Program_Density cpd
  ON TRIM(REPLACE(cpd.COUNTYNM, ' County', '')) = TRIM(REPLACE(edm.COUNTY_NAME, ' County', ''))

ORDER BY Total_Program_Impact_Score DESC;
