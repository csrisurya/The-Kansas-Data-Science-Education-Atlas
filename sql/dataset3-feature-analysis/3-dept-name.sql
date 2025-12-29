SELECT 
    dept_name, 
    COUNT(*) AS course_count
FROM 
    `st-project-454917.kansas_data.dataset3`
WHERE 
    dept_name <> 'DNE' AND dept_name <> 'dept_name'
GROUP BY 
    dept_name
ORDER BY 
    course_count DESC;
