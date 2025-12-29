SELECT District, COUNT(DISTINCT School_Name) AS School_Count
FROM st-project-454917.kansas_data.dataset1
WHERE District <> 'DNE' AND School_Name <> 'DNE'
GROUP BY District ORDER BY School_Count DESC;
