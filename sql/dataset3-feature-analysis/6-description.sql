-- 6. Descriptions (length insights)
SELECT
  MIN(LENGTH(description)) AS min_desc_length,
  MAX(LENGTH(description)) AS max_desc_length,
  AVG(LENGTH(description)) AS avg_desc_length
FROM st-project-454917.kansas_data.dataset3
WHERE description IS NOT NULL AND description != 'DNE' AND description != 'description'
