-- Summary stats for broadband
SELECT
  ROUND(MIN(Broadband_Access_Index), 3) as Min_Index,
  ROUND(AVG(Broadband_Access_Index), 3) as Avg_Index,
  ROUND(APPROX_QUANTILES(Broadband_Access_Index, 100)[OFFSET(50)], 3) as Median_Index,
  ROUND(MAX(Broadband_Access_Index), 3) as Max_Index,
  ROUND(STDDEV(Broadband_Access_Index), 3) as Std_Dev,
FROM `st-project-454917.kansas_data.dataset5`;
