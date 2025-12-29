SELECT
    City,
    COUNT(
        DISTINCT CASE 
            -- Count School_Name only if it is not NULL and not the DNE placeholder
            WHEN School_Name IS NOT NULL AND School_Name <> 'DNE' THEN School_Name
            ELSE NULL
        END
    ) +
    COUNT(
        DISTINCT CASE
            -- Count College_Name only if it is not NULL and not the DNE placeholder
            WHEN College_Name IS NOT NULL AND College_Name <> 'DNE' THEN College_Name
            ELSE NULL
        END
    ) AS Num_of_Institutions
FROM 
    `st-project-454917.kansas_data.dataset1`
GROUP BY 
    City
ORDER BY 
    Num_of_Institutions DESC;
