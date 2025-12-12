SELECT COUNT(DISTINCT College_Name) AS Num_of_Colleges
FROM st-project-454917.kansas_data.dataset1
WHERE College_Name <> 'DNE'
