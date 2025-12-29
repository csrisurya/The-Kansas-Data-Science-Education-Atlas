SELECT
  CASE
    WHEN Poverty_Rate >= 0.20 THEN '20%+ (Critical)'
    WHEN Poverty_Rate >= 0.15 THEN '15-19% (High)'
    WHEN Poverty_Rate >= 0.10 THEN '10-14% (Moderate)'
    WHEN Poverty_Rate >= 0.05 THEN '5-9% (Low)'
    ELSE 'Below 5% (Minimal)'
  END AS Poverty_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Poverty_Rate) * 100, 1) AS Avg_Poverty_Pct,
  ROUND(MIN(Poverty_Rate) * 100, 1) AS Min_Poverty_Pct,
  ROUND(MAX(Poverty_Rate) * 100, 1) AS Max_Poverty_Pct
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY Poverty_Range
ORDER BY MIN(Poverty_Rate) DESC;
