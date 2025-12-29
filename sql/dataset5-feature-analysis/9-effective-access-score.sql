SELECT
  CASE
    WHEN Effective_Access_Score > 3 THEN 'High Impact (>3)'
    WHEN Effective_Access_Score > 1.5 THEN 'Moderate Impact (1.5-3)'
    WHEN Effective_Access_Score > 0.5 THEN 'Low Impact (0.5-1.5)'
    WHEN Effective_Access_Score > 0 THEN 'Minimal Impact (>0)'
    ELSE 'No Local Programs (0)'
  END AS Impact_Range,
  COUNT(*) AS County_Count,
FROM `st-project-454917.kansas_data.dataset5`
GROUP BY Impact_Range
ORDER BY MIN(Effective_Access_Score) DESC;
