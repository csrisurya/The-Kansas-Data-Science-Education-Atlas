-- Top 10 and Bottom 10 by population
(SELECT County_Name, County_Population, 'Top 10' as Category
 FROM `st-project-454917.kansas_data.dataset5`
 ORDER BY County_Population DESC
 LIMIT 10)
UNION ALL
(SELECT County_Name, County_Population, 'Bottom 10' as Category
 FROM `st-project-454917.kansas_data.dataset5`
 ORDER BY County_Population ASC
 LIMIT 10)
ORDER BY County_Population DESC;
