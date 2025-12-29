WITH Online_Course_Program_Counts AS (
  -- Calculate online-specific course/program counts from Dataset 3
  SELECT
    school_name,
    SUM(CASE
      WHEN UPPER(TRIM(modality)) IN ('ONLINE', 'BOTH')
        AND UPPER(TRIM(level)) = 'UNDERGRADUATE'
        AND course_name IS NOT NULL
        AND UPPER(TRIM(course_name)) <> 'DNE'
      THEN 1 ELSE 0
    END) AS online_ugrad_courses,
    SUM(CASE
      WHEN UPPER(TRIM(modality)) IN ('ONLINE', 'BOTH')
        AND UPPER(TRIM(level)) = 'GRADUATE'
        AND course_name IS NOT NULL
        AND UPPER(TRIM(course_name)) <> 'DNE'
      THEN 1 ELSE 0
    END) AS online_grad_courses,
    COUNT(DISTINCT CASE
      WHEN UPPER(TRIM(modality)) IN ('ONLINE', 'BOTH')
        AND UPPER(TRIM(level)) = 'UNDERGRADUATE'
        AND degree_name IS NOT NULL
        AND UPPER(TRIM(degree_name)) <> 'DNE'
      THEN degree_name
    END) AS online_ugrad_programs,
    COUNT(DISTINCT CASE
      WHEN UPPER(TRIM(modality)) IN ('ONLINE', 'BOTH')
        AND UPPER(TRIM(level)) = 'GRADUATE'
        AND degree_name IS NOT NULL
        AND UPPER(TRIM(degree_name)) <> 'DNE'
      THEN degree_name
    END) AS online_grad_programs
  FROM `st-project-454917.kansas_data.dataset3`
  WHERE school_name IS NOT NULL
  GROUP BY school_name
),
All_Course_Program_Counts AS (
  -- Calculate total (all modality) course/program counts from Dataset 3
  SELECT
    school_name,
    SUM(CASE
      WHEN UPPER(TRIM(level)) = 'UNDERGRADUATE'
        AND course_name IS NOT NULL
        AND UPPER(TRIM(course_name)) <> 'DNE'
      THEN 1 ELSE 0
    END) AS total_ugrad_courses,
    SUM(CASE
      WHEN UPPER(TRIM(level)) = 'GRADUATE'
        AND course_name IS NOT NULL
        AND UPPER(TRIM(course_name)) <> 'DNE'
      THEN 1 ELSE 0
    END) AS total_grad_courses,
    COUNT(DISTINCT CASE
      WHEN UPPER(TRIM(level)) = 'UNDERGRADUATE'
        AND degree_name IS NOT NULL
        AND UPPER(TRIM(degree_name)) <> 'DNE'
      THEN degree_name
    END) AS total_ugrad_programs,
    COUNT(DISTINCT CASE
      WHEN UPPER(TRIM(level)) = 'GRADUATE'
        AND degree_name IS NOT NULL
        AND UPPER(TRIM(degree_name)) <> 'DNE'
      THEN degree_name
    END) AS total_grad_programs
  FROM `st-project-454917.kansas_data.dataset3`
  WHERE school_name IS NOT NULL
  GROUP BY school_name
),
College_DS_AI_Indicator AS (
  SELECT
    kc.COUNTYNM,
    kc.INSTNM,
    kc.ICLEVEL,
    CASE 
      WHEN acp.school_name IS NOT NULL 
        AND ((acp.total_ugrad_programs > 0) OR (acp.total_grad_programs > 0) 
             OR (acp.total_ugrad_courses > 0) OR (acp.total_grad_courses > 0))
      THEN 1 
      ELSE 0 
    END AS Has_DS_AI_Programs
  FROM `st-project-454917.kansas_data.nces_kansas_colleges` kc
  LEFT JOIN All_Course_Program_Counts acp
    ON TRIM(LOWER(kc.INSTNM)) = TRIM(LOWER(acp.school_name))
),
County_DS_AI_College_Counts AS (
  SELECT
    COUNTYNM,
    SUM(CASE WHEN ICLEVEL = 1 AND Has_DS_AI_Programs = 1 THEN 1 ELSE 0 END) AS Four_Year_Colleges_With_DS_AI,
    SUM(CASE WHEN ICLEVEL = 2 AND Has_DS_AI_Programs = 1 THEN 1 ELSE 0 END) AS Two_Year_Colleges_With_DS_AI,
    SUM(CASE WHEN ICLEVEL = 3 AND Has_DS_AI_Programs = 1 THEN 1 ELSE 0 END) AS Less_Than_Two_Year_Colleges_With_DS_AI
  FROM College_DS_AI_Indicator
  GROUP BY COUNTYNM
),
County_Online_Impact AS (
  -- Aggregate online impact scores to county level
  SELECT
    kc.COUNTYNM,
    SUM(
      (2.0 * ocp.online_grad_programs) +
      (1.0 * ocp.online_ugrad_programs) +
      (0.2 * ocp.online_grad_courses) +
      (0.1 * ocp.online_ugrad_courses)
    ) AS Total_Online_Impact_Score
  FROM Online_Course_Program_Counts ocp
  INNER JOIN `st-project-454917.kansas_data.nces_kansas_colleges` kc
    ON TRIM(LOWER(ocp.school_name)) = TRIM(LOWER(kc.INSTNM))
  GROUP BY kc.COUNTYNM
),
County_Total_Impact AS (
  -- Aggregate total impact scores to county level
  SELECT
    kc.COUNTYNM,
    SUM(
      (2.0 * acp.total_grad_programs) +
      (1.0 * acp.total_ugrad_programs) +
      (0.2 * acp.total_grad_courses) +
      (0.1 * acp.total_ugrad_courses)
    ) AS Total_Program_Impact_Score
  FROM All_Course_Program_Counts acp
  INNER JOIN `st-project-454917.kansas_data.nces_kansas_colleges` kc
    ON TRIM(LOWER(acp.school_name)) = TRIM(LOWER(kc.INSTNM))
  GROUP BY kc.COUNTYNM
),
County_School_Counts AS (
  -- Aggregate K12 school counts from Dataset 2
  SELECT
    County_Name,
    SUM(Elementary_Schools) AS Total_Elementary_Schools,
    SUM(Middle_Schools) AS Total_Middle_Schools,
    SUM(High_Schools) AS Total_High_Schools,
    SUM(Virtual_Schools) AS Total_Virtual_Schools,
    SUM(Other_Schools) AS Total_Other_Schools,
    SUM(Four_Year_Or_Above_Colleges) AS Total_4_Year_Colleges,
    SUM(Two_Year_Colleges) AS Total_2_Year_Colleges,
    SUM(Less_Than_Two_Year_Colleges) AS Total_Less_Than_2_Year_Colleges
  FROM `st-project-454917.kansas_data.dataset2`
  GROUP BY County_Name
),
Digital_Infrastructure AS (
  -- Extract digital infrastructure metrics from Dataset 5
  SELECT
    County_Name,
    Broadband_Access_Index,
    Internet_Adoption_Pct,
    Avg_Broadband_Coverage_Pct,
    Pct_No_Internet,
    Total_Households,
    Effective_Access_Score
  FROM `st-project-454917.kansas_data.dataset5`
),
Economic_Demographics AS (
  -- Extract economic and demographic data from Dataset 6
  SELECT
    County,
    Total_Program_Impact_Score AS DS6_Total_Impact,
    -- Economic Indicators (3 features)
    Median_Household_Income,
    Poverty_Rate,
    Unemployment_Rate,
    -- Education Indicators (2 features)
    Advanced_Degree_Rate,
    Young_Adult_Bachelors_Plus_Rate,
    -- Employment Type (2 features)
    STEM_Employment_Rate,
    Professional_Services_Rate,
    -- Digital Access (1 feature)
    Low_Income_Digital_Access_Rate,
    -- Demographics (1 feature)
    Total_Population
  FROM `st-project-454917.kansas_data.dataset6`
),
Base_County_Data AS (
  -- Start with unique counties and their core population metrics
  SELECT DISTINCT
    County_Name,
    MAX(County_Population) AS County_Population
  FROM `st-project-454917.kansas_data.dataset2`
  WHERE County_Name IS NOT NULL
  GROUP BY County_Name
)
-- FINAL SELECT: Combine all datasets with DS/AI college counts
SELECT
  bcd.County_Name,
  bcd.County_Population,
  roid.INTPTLAT AS County_Latitude,
  roid.INTPTLON AS County_Longitude,
  
  -- Educational Infrastructure (K12)
  COALESCE(csc.Total_Elementary_Schools, 0) AS Elementary_Schools,
  COALESCE(csc.Total_Middle_Schools, 0) AS Middle_Schools,
  COALESCE(csc.Total_High_Schools, 0) AS High_Schools,
  COALESCE(csc.Total_Virtual_Schools, 0) AS Virtual_Schools,
  COALESCE(csc.Total_Other_Schools, 0) AS Other_Schools,
  
  -- Total College Counts (all colleges)
  COALESCE(csc.Total_4_Year_Colleges, 0) AS Four_Year_Colleges,
  COALESCE(csc.Total_2_Year_Colleges, 0) AS Two_Year_Colleges,
  COALESCE(csc.Total_Less_Than_2_Year_Colleges, 0) AS Less_Than_Two_Year_Colleges,
  
  -- Colleges with DS/AI Programs by Type
  COALESCE(cdac.Four_Year_Colleges_With_DS_AI, 0) AS Four_Year_Colleges_With_DS_AI,
  COALESCE(cdac.Two_Year_Colleges_With_DS_AI, 0) AS Two_Year_Colleges_With_DS_AI,
  COALESCE(cdac.Less_Than_Two_Year_Colleges_With_DS_AI, 0) AS Less_Than_Two_Year_Colleges_With_DS_AI,
  
  -- Data Science/AI Program Metrics
  COALESCE(coi.Total_Online_Impact_Score, 0) AS Online_Impact_Score,
  COALESCE(cti.Total_Program_Impact_Score, 0) AS Total_Program_Impact_Score,
  
  -- Digital Infrastructure (from Dataset 5)
  COALESCE(di.Broadband_Access_Index, 0) AS Broadband_Access_Index,
  COALESCE(di.Internet_Adoption_Pct, 0) AS Internet_Adoption_Pct,
  COALESCE(di.Avg_Broadband_Coverage_Pct, 0) AS Avg_Broadband_Coverage_Pct,
  COALESCE(di.Pct_No_Internet, 0) AS Pct_No_Internet,
  COALESCE(di.Total_Households, 0) AS Total_Households,
  COALESCE(di.Effective_Access_Score, 0) AS Effective_Access_Score,
  
  -- Economic & Demographic Indicators (from Dataset 6)
  -- Economic Indicators (3 features)
  COALESCE(ed.Median_Household_Income, 0) AS Median_Household_Income,
  COALESCE(ed.Poverty_Rate, 0) AS Poverty_Rate,
  COALESCE(ed.Unemployment_Rate, 0) AS Unemployment_Rate,
  
  -- Education Indicators (2 features)
  COALESCE(ed.Advanced_Degree_Rate, 0) AS Advanced_Degree_Rate,
  COALESCE(ed.Young_Adult_Bachelors_Plus_Rate, 0) AS Young_Adult_Bachelors_Plus_Rate,
  
  -- Employment Type (2 features)
  COALESCE(ed.STEM_Employment_Rate, 0) AS STEM_Employment_Rate,
  COALESCE(ed.Professional_Services_Rate, 0) AS Professional_Services_Rate,
  
  -- Digital Access (1 feature)
  COALESCE(ed.Low_Income_Digital_Access_Rate, 0) AS Low_Income_Digital_Access_Rate,
  
  -- ML TARGET: Binary indicator of DS/AI curriculum existence
  CASE
    WHEN COALESCE(cti.Total_Program_Impact_Score, 0) > 0
    THEN 1 ELSE 0
  END AS Has_Programs

FROM Base_County_Data bcd
LEFT JOIN County_School_Counts csc
  ON TRIM(bcd.County_Name) = TRIM(csc.County_Name)
LEFT JOIN County_DS_AI_College_Counts cdac
  ON TRIM(REPLACE(bcd.County_Name, ' County', '')) = TRIM(REPLACE(cdac.COUNTYNM, ' County', ''))
LEFT JOIN County_Online_Impact coi
  ON TRIM(REPLACE(bcd.County_Name, ' County', '')) = TRIM(REPLACE(coi.COUNTYNM, ' County', ''))
LEFT JOIN County_Total_Impact cti
  ON TRIM(REPLACE(bcd.County_Name, ' County', '')) = TRIM(REPLACE(cti.COUNTYNM, ' County', ''))
LEFT JOIN Digital_Infrastructure di
  ON TRIM(bcd.County_Name) = TRIM(di.County_Name)
LEFT JOIN Economic_Demographics ed
  ON TRIM(REPLACE(bcd.County_Name, ' County', '')) = TRIM(REPLACE(ed.County, ' County', ''))
LEFT JOIN `st-project-454917.kansas_data.census_kansas_county_centroid` roid
  ON TRIM(bcd.County_Name) = TRIM(roid.NAMELSAD)
  
ORDER BY bcd.County_Name;
