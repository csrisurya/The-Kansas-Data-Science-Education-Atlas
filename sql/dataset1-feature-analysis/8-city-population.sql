SELECT
    AVG(City_Population) AS Average_City_Population
FROM
(
    SELECT DISTINCT
        City,
        City_Population
    FROM
        `st-project-454917.kansas_data.dataset1`
    WHERE
        City_Population IS NOT NULL
        AND City_Population <> -1
)
