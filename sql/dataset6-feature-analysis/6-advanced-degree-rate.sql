SELECT
  CASE
    WHEN Advanced_Degree_Rate >= 0.30 THEN '30%+ (Very High)'
    WHEN Advanced_Degree_Rate >= 0.20 THEN '20-29% (High)'
    WHEN Advanced_Degree_Rate >= 0.15 THEN '15-19% (Moderate)'
    WHEN Advanced_Degree_Rate >= 0.10 THEN '10-14% (Low)'
    ELSE 'Below 10% (Very Low)'
  END AS Education_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Advanced_Degree_Rate) * 100, 1) AS Avg_Advanced_Degree_Pct,
  ROUND(MIN(Advanced_Degree_Rate) * 100, 1) AS Min_Advanced_Degree_Pct,
  ROUND(MAX(Advanced_Degree_Rate) * 100, 1) AS Max_Advanced_Degree_Pct
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY Education_Range
ORDER BY MIN(Advanced_Degree_Rate) DESC;
