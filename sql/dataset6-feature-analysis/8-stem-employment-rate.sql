SELECT
  CASE
    WHEN STEM_Employment_Rate >= 0.05 THEN '5%+ (Very High)'
    WHEN STEM_Employment_Rate >= 0.03 THEN '3-4.9% (High)'
    WHEN STEM_Employment_Rate >= 0.02 THEN '2-2.9% (Moderate)'
    WHEN STEM_Employment_Rate >= 0.01 THEN '1-1.9% (Low)'
    ELSE 'Below 1% (Very Low)'
  END AS STEM_Employment_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(STEM_Employment_Rate) * 100, 2) AS Avg_STEM_Pct,
  ROUND(MIN(STEM_Employment_Rate) * 100, 2) AS Min_STEM_Pct,
  ROUND(MAX(STEM_Employment_Rate) * 100, 2) AS Max_STEM_Pct
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY STEM_Employment_Range
ORDER BY MIN(STEM_Employment_Rate) DESC;
