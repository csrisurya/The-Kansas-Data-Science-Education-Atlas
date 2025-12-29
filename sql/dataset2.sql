WITH School_Classification AS (
  -- Classify schools by type using REGEX logic from Dataset 1
  SELECT
    County_Name,
    City,
    ZIP,
    County_Population,
    City_Population,
    Zip_Population,
    School_Name,
    CASE 
      -- Virtual (highest priority)
      WHEN REGEXP_CONTAINS(LOWER(School_Name), r'\b(virtual|online|academy|ecademy|eacademy|elea|elearn|e-lea)\b')
      THEN 'Virtual'
      
      -- Explicit jr + sr combinations → High
      WHEN REGEXP_CONTAINS(LOWER(School_Name), r'(\b(jr\.?|junior)\b.*\b(sr\.?|senior)\b)|(\b(sr\.?|senior)\b.*\b(jr\.?|junior)\b)|(\bjr\.?\s*\/\s*sr\.?\b)|(\bjunior\s*\/\s*senior\b)')
      THEN 'High School'
      
      -- "High" appears 2+ times → High
      WHEN ARRAY_LENGTH(REGEXP_EXTRACT_ALL(LOWER(School_Name), r'\bhigh\b')) >= 2
      THEN 'High School'
      
      -- Elementary + Junior (but NOT senior) → Middle
      WHEN REGEXP_CONTAINS(LOWER(School_Name), r'\b(elem|elementary|primary|grade)\b')
        AND REGEXP_CONTAINS(LOWER(School_Name), r'\b(junior|jr\.?)\b')
        AND NOT REGEXP_CONTAINS(LOWER(School_Name), r'\b(sr\.?|senior)\b')
      THEN 'Middle School'
      
      -- Middle + High → High
      WHEN REGEXP_CONTAINS(LOWER(School_Name), r'\bmiddle\b')
        AND REGEXP_CONTAINS(LOWER(School_Name), r'\b(high|hs)\b|senior\s+high|sr\.?\s+high')
      THEN 'High School'
      
      -- Elementary + High → High
      WHEN REGEXP_CONTAINS(LOWER(School_Name), r'\b(elem|elementary|primary|grade)\b')
        AND REGEXP_CONTAINS(LOWER(School_Name), r'\b(high|hs)\b|senior\s+high|sr\.?\s+high')
      THEN 'High School'
      
      -- Junior High (adjacent) → Middle
      WHEN REGEXP_CONTAINS(LOWER(School_Name), r'\b(junior|jr\.?)\s+high\b')
      THEN 'Middle School'
      
      -- Plain "middle" → Middle
      WHEN REGEXP_CONTAINS(LOWER(School_Name), r'\bmiddle\b')
      THEN 'Middle School'
      
      -- Plain "high" or "senior high" → High
      WHEN REGEXP_CONTAINS(LOWER(School_Name), r'\b(high|hs)\b')
        OR REGEXP_CONTAINS(LOWER(School_Name), r'senior\s+high|sr\.?\s+high')
      THEN 'High School'
      
      -- Elementary keywords → Elementary
      WHEN REGEXP_CONTAINS(LOWER(School_Name), r'\b(elem|elementary|primary|grade)\b')
      THEN 'Elementary School'
      
      ELSE 'Other'
    END AS School_Type
  FROM `st-project-454917.kansas_data.dataset1`
  WHERE School_Name IS NOT NULL  -- Only school rows from Dataset 1
),

-- Get unique (County, City, ZIP) combinations with populations
Unique_Locations AS (
  SELECT DISTINCT
    County_Name,
    City,
    ZIP,
    County_Population,
    City_Population,
    Zip_Population
  FROM `st-project-454917.kansas_data.dataset1`
  WHERE County_Name IS NOT NULL
    AND ZIP IS NOT NULL  -- Only locations that have ZIPs (excludes college-only rows)
),

-- Count schools by type for each (County, City, ZIP)
School_Counts_By_Location AS (
  SELECT
    County_Name,
    City,
    ZIP,
    COUNT(DISTINCT CASE WHEN School_Type = 'Elementary School' THEN School_Name END) AS Elementary_School_Count,
    COUNT(DISTINCT CASE WHEN School_Type = 'Middle School' THEN School_Name END) AS Middle_School_Count,
    COUNT(DISTINCT CASE WHEN School_Type = 'High School' THEN School_Name END) AS High_School_Count,
    COUNT(DISTINCT CASE WHEN School_Type = 'Virtual' THEN School_Name END) AS Virtual_School_Count,
    COUNT(DISTINCT CASE WHEN School_Type = 'Other' THEN School_Name END) AS Other_School_Count
  FROM School_Classification
  GROUP BY County_Name, City, ZIP
),

-- Count colleges by type for each (County, City)
-- Note: Colleges don't have ZIPs, so we count at city level
College_Counts_By_City AS (
  SELECT
    County_Name,
    City,
    COUNT(DISTINCT CASE WHEN College_Type = 1 THEN College_Name END) AS Four_Year_Or_Above_Colleges,
    COUNT(DISTINCT CASE WHEN College_Type = 2 THEN College_Name END) AS Two_Year_Colleges,
    COUNT(DISTINCT CASE WHEN College_Type = 3 THEN College_Name END) AS Less_Than_Two_Year_Colleges
  FROM `st-project-454917.kansas_data.dataset1`
  WHERE College_Name IS NOT NULL  -- Only college rows from Dataset 1
  GROUP BY County_Name, City
)

-- Final output: One row per (County, City, ZIP) combination
SELECT
  ul.County_Name,
  ul.City,
  ul.ZIP,
  ul.County_Population,
  ul.City_Population,
  ul.Zip_Population,
  
  -- K-12 school counts (specific to this ZIP)
  COALESCE(scbl.Elementary_School_Count, 0) AS Elementary_Schools,
  COALESCE(scbl.Middle_School_Count, 0) AS Middle_Schools,
  COALESCE(scbl.High_School_Count, 0) AS High_Schools,
  COALESCE(scbl.Virtual_School_Count, 0) AS Virtual_Schools,
  COALESCE(scbl.Other_School_Count, 0) AS Other_Schools,
  
  -- College counts (same for all ZIPs in the same city)
  COALESCE(ccbc.Four_Year_Or_Above_Colleges, 0) AS Four_Year_Or_Above_Colleges,
  COALESCE(ccbc.Two_Year_Colleges, 0) AS Two_Year_Colleges,
  COALESCE(ccbc.Less_Than_Two_Year_Colleges, 0) AS Less_Than_Two_Year_Colleges

FROM Unique_Locations ul
LEFT JOIN School_Counts_By_Location scbl
  ON ul.County_Name = scbl.County_Name
  AND ul.City = scbl.City
  AND ul.ZIP = scbl.ZIP
LEFT JOIN College_Counts_By_City ccbc
  ON ul.County_Name = ccbc.County_Name
  AND ul.City = ccbc.City
  
ORDER BY ul.County_Name, ul.City, ul.ZIP;
