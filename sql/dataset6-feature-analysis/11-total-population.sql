SELECT
  CASE
    WHEN Total_Population >= 100000 THEN '100K+ (Very Large)'
    WHEN Total_Population >= 50000 THEN '50K-99K (Large)'
    WHEN Total_Population >= 25000 THEN '25K-49K (Medium-Large)'
    WHEN Total_Population >= 10000 THEN '10K-24K (Medium)'
    WHEN Total_Population >= 5000 THEN '5K-9K (Small)'
    ELSE 'Below 5K (Very Small)'
  END AS Population_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Total_Population), 0) AS Avg_Population,
  SUM(Total_Population) AS Total_Population_In_Range
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY Population_Range
ORDER BY MIN(Total_Population) DESC;
