WITH City_Population AS (
  SELECT 
    RTRIM(REPLACE(PLACE, ' city', '')) AS City, 
    ASN1E001 AS City_Population
  FROM `st-project-454917.kansas_data.nhgis_kansas_place_pop`
),

-- Schools with their location and population data
Schools_With_Population AS (
  SELECT
    s.School_Name,
    s.District,
    CAST(NULL AS STRING) AS College_Name, 
    CAST(NULL AS INT64) AS College_Type, 
    s.County_Name,
    copop.ASN1E001 AS County_Population,
    s.City,
    cipop.City_Population,
    CAST(s.ZIP AS STRING) AS ZIP,
    zipop.ASN1E001 AS Zip_Population,
    s.State
  FROM `st-project-454917.kansas_data.nces_kansas_schools` s
  LEFT JOIN `st-project-454917.kansas_data.nhgis_kansas_county_pop` copop 
    ON s.County_Name = copop.COUNTY
  LEFT JOIN City_Population cipop 
    ON s.City = cipop.City
  LEFT JOIN `st-project-454917.kansas_data.nhgis_kansas_zip_pop` zipop 
    ON CAST(s.ZIP AS STRING) = RIGHT(zipop.NAME_E, 5)
),

-- Colleges with their location and population data
Colleges_With_Population AS (
  SELECT
    CAST(NULL AS STRING) AS School_Name,
    CAST(NULL AS STRING) AS District, 
    c.INSTNM AS College_Name,
    c.ICLEVEL AS College_Type,
    c.COUNTYNM AS County_Name,
    copop.ASN1E001 AS County_Population,
    c.CITY AS City,
    cipop.City_Population,
    CAST(NULL AS STRING) AS ZIP,
    CAST(NULL AS INT64) AS Zip_Population,
    'KS' AS State
  FROM `st-project-454917.kansas_data.nces_kansas_colleges` c
  LEFT JOIN `st-project-454917.kansas_data.nhgis_kansas_county_pop` copop 
    ON c.COUNTYNM = copop.COUNTY
  LEFT JOIN City_Population cipop 
    ON c.CITY = cipop.City
)

-- Combine schools and colleges, replace NULLs with 'DNE'
SELECT 
    COALESCE(School_Name, 'DNE') AS School_Name,
    COALESCE(District, 'DNE') AS District,
    COALESCE(College_Name, 'DNE') AS College_Name,
    -- CAST numeric columns to STRING before COALESCE
    COALESCE(College_Type, -1) AS College_Type,
    COALESCE(County_Name, 'DNE') AS County_Name,
    COALESCE(County_Population, -1) AS County_Population,
    COALESCE(City, 'DNE') AS City,
    COALESCE(City_Population, -1) AS City_Population,
    COALESCE(ZIP, 'DNE') AS ZIP,
    COALESCE(Zip_Population, -1) AS Zip_Population,
    COALESCE(State, 'DNE') AS State
FROM (
    SELECT * FROM Schools_With_Population
    UNION ALL
    SELECT * FROM Colleges_With_Population
)
ORDER BY 
    County_Name, 
    City, 
    School_Name, 
    College_Name;
