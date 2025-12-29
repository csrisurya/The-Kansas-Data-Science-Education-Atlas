SELECT COUNT(DISTINCT School_Name) AS Total_Unique_Schools
FROM st-project-454917.kansas_data.dataset1
WHERE School_Name <> 'DNE'
