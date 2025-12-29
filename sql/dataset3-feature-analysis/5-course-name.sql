-- course frequency
SELECT
  course_name,
  COUNT(*) AS frequency
FROM st-project-454917.kansas_data.dataset3
WHERE course_name IS NOT NULL AND course_name != 'DNE' AND course_name != 'course_name'
GROUP BY course_name
ORDER BY frequency DESC;
