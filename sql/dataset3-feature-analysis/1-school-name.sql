-- Enhanced version with percentage
SELECT
  school_name,
  COUNT(*) AS course_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM `st-project-454917.kansas_data.dataset3`
WHERE school_name <> "school_name"
GROUP BY school_name
ORDER BY course_count DESC;
