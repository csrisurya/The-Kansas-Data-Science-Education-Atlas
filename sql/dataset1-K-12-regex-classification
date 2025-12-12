SELECT
  CASE
    -- Virtual (unchanged)
    WHEN REGEXP_CONTAINS(LOWER(school_name), r'\b(virtual|online|academy|ecademy|eacademy|elea|elearn|e-lea)\b')
      THEN 'Virtual'

    -- Explicit jr + sr (or variants) -> High (e.g., "Jr/Sr", "Junior ... Senior")
    WHEN REGEXP_CONTAINS(
         LOWER(school_name),
         r'(\b(jr\.?|junior)\b.*\b(sr\.?|senior)\b)|(\b(sr\.?|senior)\b.*\b(jr\.?|junior)\b)|(\bjr\.?\s*\/\s*sr\.?\b)|(\bjunior\s*\/\s*senior\b)'
         )
      THEN 'High School'

    -- "High" appears 2+ times (e.g., "Junior High/High School") -> High
    WHEN ARRAY_LENGTH(REGEXP_EXTRACT_ALL(LOWER(school_name), r'\bhigh\b')) >= 2
      THEN 'High School'

    -- If name contains BOTH elementary AND junior (but NOT senior) -> Middle School
    -- This is the key rule to ensure "Elem/Jr. High" -> Middle School.
    WHEN REGEXP_CONTAINS(LOWER(school_name), r'\b(elem|elementary|primary|grade)\b')
      AND REGEXP_CONTAINS(LOWER(school_name), r'\b(junior|jr\.?)\b')
      AND NOT REGEXP_CONTAINS(LOWER(school_name), r'\b(sr\.?|senior)\b')
    THEN 'Middle School'

    -- If "middle" and "high" indicators both appear, treat as High
    WHEN REGEXP_CONTAINS(LOWER(school_name), r'\bmiddle\b')
         AND REGEXP_CONTAINS(LOWER(school_name), r'\b(high|hs)\b|senior\s+high|sr\.?\s+high')
    THEN 'High School'

    -- If elementary + high (and NOT the elem+jr special-case above) -> High
    WHEN REGEXP_CONTAINS(LOWER(school_name), r'\b(elem|elementary|primary|grade)\b')
         AND REGEXP_CONTAINS(LOWER(school_name), r'\b(high|hs)\b|senior\s+high|sr\.?\s+high')
    THEN 'High School'

    -- "Junior High" or "Jr High" (adjacent) -> Middle School
    WHEN REGEXP_CONTAINS(LOWER(school_name), r'\b(junior|jr\.?)\s+high\b')
    THEN 'Middle School'

    -- Plain "middle"
    WHEN REGEXP_CONTAINS(LOWER(school_name), r'\bmiddle\b')
    THEN 'Middle School'

    -- Plain "high" (as whole word), or explicit "senior high"
    WHEN REGEXP_CONTAINS(LOWER(school_name), r'\b(high|hs)\b')
         OR REGEXP_CONTAINS(LOWER(school_name), r'senior\s+high|sr\.?\s+high')
    THEN 'High School'

    -- Elementary keywords
    WHEN REGEXP_CONTAINS(LOWER(school_name), r'\b(elem|elementary|primary|grade)\b')
    THEN 'Elementary School'

    ELSE 'Other'
  END AS school_type,
  COUNT(*) AS Num_of_Schools
FROM
  `st-project-454917.kansas_data.nces_kansas_schools`
  GROUP BY school_type
ORDER BY
  school_type
