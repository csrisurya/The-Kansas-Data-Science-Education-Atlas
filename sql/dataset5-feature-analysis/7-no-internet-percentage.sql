SELECT
  CASE
    WHEN Pct_No_Internet >= 20 THEN '20%+ (Critical)'
    WHEN Pct_No_Internet >= 15 THEN '15-19% (High)'
    WHEN Pct_No_Internet >= 10 THEN '10-14% (Moderate)'
    WHEN Pct_No_Internet >= 5 THEN '5-9% (Low)'
    ELSE 'Below 5% (Minimal)'
  END AS No_Internet_Range,
  COUNT(*) AS County_Count,
FROM `st-project-454917.kansas_data.dataset5`
GROUP BY No_Internet_Range
ORDER BY 
  CASE 
    WHEN No_Internet_Range = '20%+ (Critical)' THEN 1
    WHEN No_Internet_Range = '15-19% (High)' THEN 2
    WHEN No_Internet_Range = '10-14% (Moderate)' THEN 3
    WHEN No_Internet_Range = '5-9% (Low)' THEN 4
    ELSE 5
  END;
