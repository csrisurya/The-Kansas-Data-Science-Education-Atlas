SELECT
  CASE
    WHEN Avg_Broadband_Coverage_Pct >= 80 THEN '80%+'
    WHEN Avg_Broadband_Coverage_Pct >= 70 THEN '70-79%'
    WHEN Avg_Broadband_Coverage_Pct >= 60 THEN '60-69%'
    WHEN Avg_Broadband_Coverage_Pct IS NULL THEN 'No Data'
    ELSE 'Below 60%'
  END AS Coverage_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Avg_Broadband_Coverage_Pct), 1) AS Avg_Coverage,
  ROUND(MIN(Avg_Broadband_Coverage_Pct), 1) AS Min_Coverage,
  ROUND(MAX(Avg_Broadband_Coverage_Pct), 1) AS Max_Coverage
FROM `st-project-454917.kansas_data.dataset5`
GROUP BY Coverage_Range
ORDER BY Min_Coverage DESC;
