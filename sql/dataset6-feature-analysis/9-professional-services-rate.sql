SELECT
  CASE
    WHEN Professional_Services_Rate >= 0.06 THEN '6%+ (Very High)'
    WHEN Professional_Services_Rate >= 0.04 THEN '4-5.9% (High)'
    WHEN Professional_Services_Rate >= 0.03 THEN '3-3.9% (Moderate)'
    WHEN Professional_Services_Rate >= 0.02 THEN '2-2.9% (Low)'
    ELSE 'Below 2% (Very Low)'
  END AS Professional_Services_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Professional_Services_Rate) * 100, 2) AS Avg_Prof_Services_Pct,
  ROUND(MIN(Professional_Services_Rate) * 100, 2) AS Min_Prof_Services_Pct,
  ROUND(MAX(Professional_Services_Rate) * 100, 2) AS Max_Prof_Services_Pct
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY Professional_Services_Range
ORDER BY MIN(Professional_Services_Rate) DESC;
