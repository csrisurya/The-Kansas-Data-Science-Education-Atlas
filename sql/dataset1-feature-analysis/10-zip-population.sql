SELECT
    AVG(ZIP_Population) AS Average_ZIP_Population
FROM
(
    SELECT DISTINCT
        ZIP,
        ZIP_Population
    FROM
        `st-project-454917.kansas_data.dataset1`
    WHERE
        ZIP_Population IS NOT NULL
        AND ZIP_Population <> -1
)
