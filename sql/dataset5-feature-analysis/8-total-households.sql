SELECT
  CASE
    WHEN Total_Households >= 100000 THEN '100K+ (Urban)'
    WHEN Total_Households >= 50000 THEN '50K-99K (Suburban)'
    WHEN Total_Households >= 10000 THEN '10K-49K (Small City)'
    WHEN Total_Households >= 5000 THEN '5K-9K (Town)'
    WHEN Total_Households >= 1000 THEN '1K-4K (Small Town)'
    ELSE 'Below 1K (Rural)'
  END AS Household_Range,
  COUNT(*) AS County_Count,
  SUM(Total_Households) AS Total_Households_Sum,
FROM `st-project-454917.kansas_data.dataset5`
GROUP BY Household_Range
ORDER BY MIN(Total_Households) DESC;
