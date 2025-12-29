SELECT
  CASE
    WHEN Median_Household_Income >= 80000 THEN '$80K+ (High)'
    WHEN Median_Household_Income >= 65000 THEN '$65K-$79K (Above Average)'
    WHEN Median_Household_Income >= 55000 THEN '$55K-$64K (Average)'
    WHEN Median_Household_Income >= 50000 THEN '$50K-$54K (Below Average)'
    ELSE 'Below $50K (Low)'
  END AS Income_Bracket,
  COUNT(*) AS County_Count,
  ROUND(AVG(Median_Household_Income), 0) AS Avg_Income,
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY Income_Bracket
ORDER BY MIN(Median_Household_Income) DESC;
