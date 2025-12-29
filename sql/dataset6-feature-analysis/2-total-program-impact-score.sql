SELECT
  CASE
    WHEN Total_Program_Impact_Score = 0 THEN 'No Programs (0)'
    WHEN Total_Program_Impact_Score > 0 AND Total_Program_Impact_Score <= 2 THEN 'Very Low (0-2)'
    WHEN Total_Program_Impact_Score > 2 AND Total_Program_Impact_Score <= 5 THEN 'Low (2-5)'
    WHEN Total_Program_Impact_Score > 5 AND Total_Program_Impact_Score <= 8 THEN 'Moderate (5-8)'
    WHEN Total_Program_Impact_Score > 8 THEN 'High (8+)'
  END AS Impact_Range,
  COUNT(*) AS County_Count,
  ROUND(AVG(Total_Program_Impact_Score), 2) AS Avg_Score,
FROM `st-project-454917.kansas_data.dataset6`
GROUP BY Impact_Range
ORDER BY MIN(Total_Program_Impact_Score);
