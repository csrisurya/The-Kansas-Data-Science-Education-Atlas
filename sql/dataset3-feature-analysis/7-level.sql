-- 7. Course levels
SELECT
  level,
  COUNT(*) AS course_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) AS percentage
FROM st-project-454917.kansas_data.dataset3
WHERE level IS NOT NULL AND level NOT IN ('DNE', 'level')
GROUP BY level;
