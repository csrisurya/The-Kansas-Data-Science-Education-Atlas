SELECT
  COUNT(DISTINCT County) AS Total_Counties,
  MIN(County) AS First_Alphabetically,
  MAX(County) AS Last_Alphabetically
FROM `st-project-454917.kansas_data.dataset6`;
