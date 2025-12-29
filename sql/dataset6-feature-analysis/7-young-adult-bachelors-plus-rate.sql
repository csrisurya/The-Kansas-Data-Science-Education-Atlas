SELECT
  CASE
    WHEN Young_Adult_Bachelors_Plus_Rate >= 0.40 THEN '40%+ (Very High)'
    WHEN Young_Adult_Bachelors_Plus_Rate >= 0.30 THEN '30-39% (High)'
    WHEN Young_Adult_Bachelors_Plus_Rate >= 0.25 THEN '25-29% (Moderate)'
    WHEN Young_Adult_Bachelors_Plus_Rate >= 0.20 THEN '20-24% (Low)'
    ELSE 'Below 20% (Very Low)'
  END AS Young_Adult_Education_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Young_Adult_Bachelors_Plus_Rate) * 100, 1) AS Avg_Young_Adult_Pct,
  ROUND(MIN(Young_Adult_Bachelors_Plus_Rate) * 100, 1) AS Min_Young_Adult_Pct,
  ROUND(MAX(Young_Adult_Bachelors_Plus_Rate) * 100, 1) AS Max_Young_Adult_Pct
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY Young_Adult_Education_Range
ORDER BY MIN(Young_Adult_Bachelors_Plus_Rate) DESC;
