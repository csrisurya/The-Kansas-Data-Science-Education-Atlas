SELECT
  CASE
    WHEN Unemployment_Rate >= 0.06 THEN '6%+ (Very High)'
    WHEN Unemployment_Rate >= 0.045 THEN '4.5-5.9% (High)'
    WHEN Unemployment_Rate >= 0.03 THEN '3-4.4% (Moderate)'
    WHEN Unemployment_Rate >= 0.02 THEN '2-2.9% (Low)'
    ELSE 'Below 2% (Very Low)'
  END AS Unemployment_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Unemployment_Rate) * 100, 2) AS Avg_Unemployment_Pct,
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY Unemployment_Range
ORDER BY MIN(Unemployment_Rate) DESC;
