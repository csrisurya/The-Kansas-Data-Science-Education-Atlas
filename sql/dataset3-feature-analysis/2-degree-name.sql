-- course count by degree
SELECT
  CASE
    WHEN LOWER(degree_name) LIKE '%associate%' THEN 'Associate'
    WHEN LOWER(degree_name) LIKE '%bachelor%' THEN 'Bachelor'
    WHEN LOWER(degree_name) LIKE '%master%' THEN 'Master'
    ELSE 'Other' -- Certificate, Minor, or Other
  END AS degree_type,
  COUNT(*) AS course_count
FROM
  `st-project-454917.kansas_data.dataset3`
WHERE
  degree_name IS NOT NULL
  AND degree_name != 'DNE'
  AND degree_name != 'degree_name'
GROUP BY
  degree_type
ORDER BY
  course_count DESC;
