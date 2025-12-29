SELECT 
  COUNT(DISTINCT County_Name) as Total_Counties,
  MIN(County_Name) as First_Alphabetically,
  MAX(County_Name) as Last_Alphabetically
FROM `st-project-454917.kansas_data.dataset5`;
