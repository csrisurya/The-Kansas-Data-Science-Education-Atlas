SELECT AVG(County_Population) AS Average_County_Population
FROM 
(
  SELECT DISTINCT County_Name, County_Population 
  FROM st-project-454917.kansas_data.dataset1
  WHERE County_Population IS NOT NULL AND County_Population <> -1
)
