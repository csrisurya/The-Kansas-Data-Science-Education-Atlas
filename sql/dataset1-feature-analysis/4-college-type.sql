SELECT 
    College_Type,
    COUNT(DISTINCT College_Name) AS Count
FROM `st-project-454917.kansas_data.dataset1`
WHERE College_Name <> 'DNE'
GROUP BY College_Type;
