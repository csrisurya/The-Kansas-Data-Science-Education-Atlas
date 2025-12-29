SELECT
  CASE
    WHEN Internet_Adoption_Pct >= 90 THEN '90%+'
    WHEN Internet_Adoption_Pct >= 80 THEN '80-89%'
    WHEN Internet_Adoption_Pct >= 70 THEN '70-79%'
    WHEN Internet_Adoption_Pct >= 60 THEN '60-69%'
    ELSE 'Below 60%'
  END AS Adoption_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Internet_Adoption_Pct), 1) AS Avg_Adoption,
  ROUND(MIN(Internet_Adoption_Pct), 1) AS Min_Adoption,
  ROUND(MAX(Internet_Adoption_Pct), 1) AS Max_Adoption
FROM `st-project-454917.kansas_data.dataset5`
GROUP BY Adoption_Range
ORDER BY Min_Adoption DESC;
