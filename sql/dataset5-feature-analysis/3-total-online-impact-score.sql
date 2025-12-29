-- How many people have NO local programs?
SELECT
  SUM(CASE WHEN Total_Online_Impact_Score = 0 THEN County_Population ELSE 0 END) as Pop_Without_Programs,
  SUM(CASE WHEN Total_Online_Impact_Score > 0 THEN County_Population ELSE 0 END) as Pop_With_Programs,
  ROUND(100.0 * SUM(CASE WHEN Total_Online_Impact_Score = 0 THEN County_Population ELSE 0 END) / 
        SUM(County_Population), 1) as Pct_Without_Programs
FROM `st-project-454917.kansas_data.dataset5`;
