SELECT
  CASE
    WHEN Low_Income_Digital_Access_Rate >= 1.50 THEN '150%+ (Anomaly)'
    WHEN Low_Income_Digital_Access_Rate >= 1.20 THEN '120-149% (Very High)'
    WHEN Low_Income_Digital_Access_Rate >= 1.00 THEN '100-119% (High)'
    WHEN Low_Income_Digital_Access_Rate >= 0.80 THEN '80-99% (Moderate)'
    ELSE 'Below 80% (Low)'
  END AS Digital_Access_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Low_Income_Digital_Access_Rate) * 100, 1) AS Avg_Digital_Access_Pct,
  ROUND(MIN(Low_Income_Digital_Access_Rate) * 100, 1) AS Min_Digital_Access_Pct,
  ROUND(MAX(Low_Income_Digital_Access_Rate) * 100, 1) AS Max_Digital_Access_Pct
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY Digital_Access_Range
ORDER BY MIN(Low_Income_Digital_Access_Rate) DESC;
