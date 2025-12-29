-- 4. Course codes
SELECT
  COUNT(DISTINCT course_code) AS unique_course_codes,
  MIN(course_code) AS min_code,
  MAX(course_code) AS max_code
FROM st-project-454917.kansas_data.dataset3
WHERE course_code IS NOT NULL AND course_code != 'DNE' AND course_code != 'course_code'
