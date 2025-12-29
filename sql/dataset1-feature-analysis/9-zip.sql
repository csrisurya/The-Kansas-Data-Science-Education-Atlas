SELECT
    ZIP,
    COUNT(
        DISTINCT CASE 
            -- 1. Exclude 'DNE' from School_Name count
            WHEN School_Name IS NOT NULL AND School_Name <> 'DNE' THEN School_Name
            ELSE NULL
        END
    ) +
    COUNT(
        DISTINCT CASE
            -- 2. Exclude 'DNE' from College_Name count
            WHEN College_Name IS NOT NULL AND College_Name <> 'DNE' THEN College_Name
            ELSE NULL
        END
    ) AS Num_of_Institutions
FROM 
    `st-project-454917.kansas_data.dataset1`
WHERE
    ZIP IS NOT NULL
    AND ZIP <> 'DNE'  -- 3. Exclude the 'DNE' placeholder from the ZIP column
GROUP BY 
    ZIP
ORDER BY 
    Num_of_Institutions DESC;
