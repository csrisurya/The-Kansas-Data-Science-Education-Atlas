-- 9. Course URLs (coverage check)
SELECT
  COUNT(DISTINCT course_url) AS unique_urls,
  COUNTIF(course_url IS NULL OR course_url = 'DNE') AS missing_urls
FROM st-project-454917.kansas_data.dataset3
WHERE course_url != 'course_url'
