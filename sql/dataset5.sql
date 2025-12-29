WITH Online_Course_Program_Counts AS (
  SELECT
    school_name,
    SUM(CASE WHEN UPPER(TRIM(modality)) IN ('ONLINE', 'BOTH') 
      AND UPPER(TRIM(level)) = 'UNDERGRADUATE' 
      AND course_name IS NOT NULL AND UPPER(TRIM(course_name)) <> 'DNE' 
      THEN 1 ELSE 0 END) AS online_ugrad_courses,
    SUM(CASE WHEN UPPER(TRIM(modality)) IN ('ONLINE', 'BOTH') 
      AND UPPER(TRIM(level)) = 'GRADUATE' 
      AND course_name IS NOT NULL AND UPPER(TRIM(course_name)) <> 'DNE' 
      THEN 1 ELSE 0 END) AS online_grad_courses,
    COUNT(DISTINCT CASE WHEN UPPER(TRIM(modality)) IN ('ONLINE', 'BOTH') 
      AND UPPER(TRIM(level)) = 'UNDERGRADUATE' 
      AND degree_name IS NOT NULL AND UPPER(TRIM(degree_name)) <> 'DNE' 
      THEN degree_name END) AS online_ugrad_programs,
    COUNT(DISTINCT CASE WHEN UPPER(TRIM(modality)) IN ('ONLINE', 'BOTH') 
      AND UPPER(TRIM(level)) = 'GRADUATE' 
      AND degree_name IS NOT NULL AND UPPER(TRIM(degree_name)) <> 'DNE' 
      THEN degree_name END) AS online_grad_programs
  FROM `st-project-454917.kansas_data.dataset3`
  WHERE school_name IS NOT NULL
  GROUP BY school_name
),

Online_Impact AS (
  SELECT
    school_name,
    (2.0 * online_grad_programs) + (1.0 * online_ugrad_programs) + 
    (0.2 * online_grad_courses) + (0.1 * online_ugrad_courses) AS Online_Impact_Score
  FROM Online_Course_Program_Counts
),

County_Online_Density AS (
  SELECT
    kc.COUNTYNM,
    SUM(oi.Online_Impact_Score) AS Total_Online_Impact_Score
  FROM Online_Impact oi
  INNER JOIN `st-project-454917.kansas_data.nces_kansas_colleges` kc
    ON TRIM(LOWER(oi.school_name)) = TRIM(LOWER(kc.INSTNM))
  GROUP BY kc.COUNTYNM
),

-- Get unique counties with population from Dataset 2
All_Kansas_Counties AS (
  SELECT DISTINCT
    County_Name,
    County_Population
  FROM `st-project-454917.kansas_data.dataset2`
  WHERE County_Name IS NOT NULL
),

Digital_Divide_Metrics AS (
  SELECT
    COUNTY AS COUNTY_NAME,
    CAST(COUNTYA AS STRING) AS FIPS_CODE,
    ASWSE001 AS Total_Households,
    ASWSE002 AS Households_With_Internet,
    ASWSE013 AS No_Internet_Households,
    SAFE_DIVIDE(CAST(ASWSE002 AS NUMERIC), ASWSE001) AS Internet_Adoption_Rate,
    SAFE_DIVIDE(CAST(ASWSE013 AS NUMERIC), ASWSE001) AS Pct_No_Internet
  FROM `st-project-454917.kansas_data.nhgis_computer_and_internet`
  WHERE COUNTYA IS NOT NULL
),

FCC_Broadband_Metrics AS (
  SELECT
    t2.geography_desc AS City_Name,
    s.County_Name,
    t2.speed_25_3 AS Broadband_Coverage
  FROM `st-project-454917.kansas_data.fcc_fixed_broadband_summary` t2
  INNER JOIN `st-project-454917.kansas_data.nces_kansas_schools` s
    ON TRIM(t2.geography_desc) = TRIM(s.City)
  WHERE t2.biz_res = 'R'  -- Residential only
),

County_Broadband_Metrics AS (
  SELECT
    County_Name,
    AVG(Broadband_Coverage) AS Avg_Broadband_Coverage,
    COUNT(DISTINCT City_Name) AS Num_Cities_Measured,
    MAX(Broadband_Coverage) AS Max_Broadband_Coverage
  FROM FCC_Broadband_Metrics
  GROUP BY County_Name
),

Broadband_Access_Index AS (
  SELECT
    ddm.COUNTY_NAME,
    ddm.Total_Households,
    ddm.Internet_Adoption_Rate,
    ddm.Pct_No_Internet,
    fbm.Avg_Broadband_Coverage,
    fbm.Max_Broadband_Coverage,
    fbm.Num_Cities_Measured,
    (
      COALESCE(ddm.Internet_Adoption_Rate, 0) * 0.5 +
      COALESCE(fbm.Avg_Broadband_Coverage, 0) * 0.5
    ) AS Broadband_Access_Index
  FROM Digital_Divide_Metrics ddm
  LEFT JOIN County_Broadband_Metrics fbm
    ON TRIM(REPLACE(ddm.COUNTY_NAME, ' County', '')) = TRIM(REPLACE(fbm.County_Name, ' County', ''))
)

-- FINAL OUTPUT: One row per county (105 rows total)
-- Replace NULLs with -1 for numeric columns to indicate missing data
SELECT
  akc.County_Name,
  akc.County_Population,
  COALESCE(cod.Total_Online_Impact_Score, 0) AS Total_Online_Impact_Score,
  COALESCE(bai.Broadband_Access_Index, -1) AS Broadband_Access_Index,
  COALESCE(ROUND(bai.Internet_Adoption_Rate * 100, 1), -1) AS Internet_Adoption_Pct,
  -- Use -1 for missing FCC data (keeps column numeric)
  COALESCE(
    CASE 
      WHEN bai.Num_Cities_Measured IS NULL OR bai.Num_Cities_Measured = 0 
      THEN NULL 
      ELSE ROUND(bai.Avg_Broadband_Coverage * 100, 1) 
    END,
    -1
  ) AS Avg_Broadband_Coverage_Pct,
  COALESCE(ROUND(bai.Pct_No_Internet * 100, 1), -1) AS Pct_No_Internet,
  COALESCE(bai.Total_Households, -1) AS Total_Households,
  COALESCE(cod.Total_Online_Impact_Score, 0) * COALESCE(bai.Broadband_Access_Index, 0) AS Effective_Access_Score
  
FROM All_Kansas_Counties akc
LEFT JOIN County_Online_Density cod
  ON TRIM(akc.County_Name) = TRIM(cod.COUNTYNM)
LEFT JOIN Broadband_Access_Index bai
  ON TRIM(REPLACE(akc.County_Name, ' County', '')) = TRIM(REPLACE(bai.COUNTY_NAME, ' County', ''))
  
ORDER BY akc.County_Name;
