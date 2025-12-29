-- 8. Modalities (online/in-person/both)
SELECT
  modality,
  COUNT(*) AS course_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) AS percentage

FROM st-project-454917.kansas_data.dataset3
WHERE modality IS NOT NULL AND modality NOT IN ('DNE', 'modality')
GROUP BY modality
ORDER BY course_count DESC
