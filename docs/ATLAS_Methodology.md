# ATLAS — Data Collection & ML Methodology

> **Project Goal:** Identify and document where data science is being taught across Kansas — spanning universities, community colleges, and high schools — and apply data science techniques to analyze trends, patterns, and gaps.

---

## Table of Contents

1. [Dataset 1 — K-12 Schools & Colleges](#dataset-1--k-12-schools--colleges)
2. [Dataset 2 — School & College Counts by Location](#dataset-2--school--college-counts-by-location)
3. [Dataset 3 — Data Science / AI Course Catalog](#dataset-3--data-science--ai-course-catalog)
4. [Dataset 4 — College-Level DS/AI Impact Scores](#dataset-4--college-level-dsai-impact-scores)
5. [Dataset 5 — Broadband & Internet Access](#dataset-5--broadband--internet-access)
6. [Dataset 6 — Economic & Demographic Indicators](#dataset-6--economic--demographic-indicators)
7. [Dataset 7 — Super Dataset (Datasets 1–6 Combined)](#dataset-7--super-dataset-datasets-16-combined)
8. [ML Modeling](#ml-modeling)

---

## Dataset 1 — K-12 Schools & Colleges

### K-12 Schools

**Source:** [NCES Common Core of Data](https://nces.ed.gov/ccd/schoolsearch/school_list.asp?Search=1&State=20&SchoolType=1&SchoolType=2&SchoolType=3&SchoolType=4&SpecificSchlTypes=all&IncGrade=)

**Processing Pipeline:**

1. Downloaded file arrives as `.xls` but contains raw HTML — rename extension to `.html`
2. Run `convert_html_to_csv.py` → produces `kansas_schools_raw.csv`
3. Remove non-table data and standardize column names with underscores → `kansas_schools_clean.csv`
4. Upload to **Google BigQuery** for analysis and merging

**School Type Classification (Regex — BigQuery SQL):**

Schools are categorized into five types using regex on the school name. When a name spans two categories, it is assigned to the *higher* tier (e.g., Jr/Sr High → High School, Elem/Middle → Middle School).

| Category | Keywords Matched |
|---|---|
| Virtual | virtual, online, academy, ecademy, elearn, e-lea |
| High School | senior/jr+sr combos, "high" ≥ 2x, middle+high, elem+high |
| Middle School | junior high, plain "middle", elem+junior (no senior) |
| Elementary | elem, elementary, primary, grade |
| Other | Everything else |

---

### Colleges

**Source:** [NCES IPEDS Data Center](https://nces.ed.gov/ipeds/datacenter/DataFiles.aspx)

**Processing Pipeline:**

1. Download `HD2023` file → `Kansas_and_Universities.csv`
2. Filter for Kansas rows and copy into → `Kansas_Colleges_Input.csv`
3. Upload to BigQuery

---

### Census Population Data

**Source:** [IPUMS NHGIS](https://data2.nhgis.org/main) *(used in place of data.census.gov due to download issues)*

**Filters Applied:**
- Topics → Total Population
- Dataset → `2019_2023_ACS5a` (5-Year ACS Data)
- Geographic Levels → State, County, Place, 5-Digit ZIP Code

**Files Downloaded:**
- `nhgis0001_ds267_20235_county.csv`
- `nhgis0001_ds267_20235_place.csv`
- `nhgis0001_ds267_20235_zcta.csv`

**Notes:**
- ZIP file is national → filtered to Kansas range `66001–67954`
- Place file includes CDPs — filtered out since they are not legally incorporated municipalities

---

## Dataset 2 — School & College Counts by Location

Built in BigQuery by joining Dataset 1 school/college data with census population tables.

**Output schema (one row per County / City / ZIP combination):**

| Column | Description |
|---|---|
| County_Name, City, ZIP | Location identifiers |
| County_Population, City_Population, Zip_Population | Population from NHGIS |
| Elementary_Schools | Count of elementary schools |
| Middle_Schools | Count of middle schools |
| High_Schools | Count of high schools |
| Virtual_Schools | Count of virtual/online schools |
| Other_Schools | Uncategorized schools |
| Four_Year_Or_Above_Colleges | ICLEVEL = 1 |
| Two_Year_Colleges | ICLEVEL = 2 |
| Less_Than_Two_Year_Colleges | ICLEVEL = 3 |

> **Note:** Colleges do not have ZIP data; college counts are joined at the city level.

---

## Dataset 3 — Data Science / AI Course Catalog

### Collection

1. Course info collected manually and with AI assistance (Claude) → `dataset2_manual.csv`, `dataset2_claude.csv`
2. Merged and validated with ChatGPT assistance → `dataset2.csv`

**Classification Criteria:** A course was included if its name or description contained any of the following keywords:

`AI` · `Artificial Intelligence` · `Machine Learning` · `Data Science` · `Deep Learning` · `Reinforcement Learning`

> Courses are included regardless of department or degree program — classification is keyword-driven only.

**Schema:**

| Column | Notes |
|---|---|
| school_name | Institution name |
| degree_name | Associated degree (Associate / Bachelor / Master / Other) |
| dept_name | Department offering the course |
| course_code | Unique course identifier |
| course_name | Name of the course |
| description | Course description text |
| level | Undergraduate or Graduate |
| modality | Online / In-Person / Both |
| course_url | Link to course listing |

> `DNE` (Does Not Exist) is used as a placeholder when information could not be found.  
> **Professional courses** refer to Continuing Education or external career training offerings.

---

## Dataset 4 — College-Level DS/AI Impact Scores

Aggregates course and program counts per college into a weighted **Impact Score**, then joins with NCES location data.

**Impact Score Formula:**

```
Impact Score = (1.0 × undergrad_programs)
             + (2.0 × graduate_programs)
             + (0.1 × undergrad_courses)
             + (0.2 × graduate_courses)
```

Graduate offerings are weighted higher to reflect institutional depth. Output includes coordinates (latitude/longitude) for geographic mapping.

---

## Dataset 5 — Broadband & Internet Access

### Sources

**FCC Fixed Broadband:**
- [FCC Broadband Map Data Download](https://broadbandmap.fcc.gov/data-download/nationwide-data)
- Selected: *Fixed Broadband Summary by Geography Type*, filtered to Kansas
- Threshold: **25 Mbps download / 3 Mbps upload** (widely accepted minimum benchmark for broadband)
- Residential-only (`biz_res = 'R'`) records used

**NHGIS — Computers & Internet:**
- Dataset: `2019_2023_ACS5a`
- Tables: `B28002` (Internet Subscriptions) and `B28003` (Computer & Internet Presence)
- Geographic Level: County → Kansas

### Key Metrics

| Metric | Description |
|---|---|
| Broadband_Access_Index | Weighted average of Internet Adoption Rate + Avg Broadband Coverage |
| Internet_Adoption_Pct | % of households with any internet subscription |
| Avg_Broadband_Coverage_Pct | % of residential locations meeting 25/3 Mbps threshold |
| Pct_No_Internet | % of households with no internet |
| Effective_Access_Score | Online_Impact_Score × Broadband_Access_Index |

> Rationale: Online data science courses require stable high-speed connections for video lectures, large dataset downloads, and cloud tools (e.g., Google Colab). Fixed broadband is the appropriate proxy for household access where students take online courses.

---

## Dataset 6 — Economic & Demographic Indicators

All data sourced from [IPUMS NHGIS](https://data2.nhgis.org/main), dataset `2019_2023_ACS5a`, aggregated at the **county level** in Kansas.

### NHGIS Tables Used

| Feature | ACS Table | Description |
|---|---|---|
| Median Household Income | B19013 | Median income (2023 inflation-adjusted dollars) |
| Poverty Rate | B17021 | Poverty status of individuals in past 12 months |
| Unemployment Rate | B23025 | Employment status, population 16+ |
| Advanced Degree Rate | B15003 | Educational attainment, population 25+ (Bachelor's+) |
| Young Adult Bachelor's+ Rate | B15002 | Educational attainment by sex, ages 25–34 |
| STEM Employment Rate | C24010 | Civilian employed population by occupation |
| Professional Services Rate | C24030 | Civilian employed population by industry |
| Low-Income Digital Access Rate | B28004 | Household income by internet subscription type |

### Feature Groups

```
Economic Indicators (3):   Median_Household_Income, Poverty_Rate, Unemployment_Rate
Education Indicators (2):  Advanced_Degree_Rate, Young_Adult_Bachelors_Plus_Rate
Employment Type (2):       STEM_Employment_Rate, Professional_Services_Rate
Digital Access (1):        Low_Income_Digital_Access_Rate
Demographics (1):          Total_Population
```

**Target Variable:** `Total_Program_Impact_Score` — derived from Dataset 4, used to create the binary `Has_Programs` label in Dataset 7.

---

## Dataset 7 — Super Dataset (Datasets 1–6 Combined)

The final combined dataset used for machine learning. One row per Kansas county (105 rows total).

### Additional Source — TIGER/Line Shapefiles

**Source:** [Census TIGER/Line Files](https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html) (2025)

**Processing:**
1. Download `tl_2025_us_county.zip` → FTP Archive → `COUNTY/`
2. Convert `.dbf` to `.csv` via [anyconv.com](https://anyconv.com) → `tl_2025_us_county_dbf_to_csv.csv`
3. Filter to Kansas rows (`STATEFP = 20`) in Excel → `tl_2025_us_county_kansas.xlsx`
4. Preserve only: `STATEFP, COUNTYFP, GEOID, NAME, NAMELSAD, INTPTLAT, INTPTLON` → `tl_2025_us_county_kansas_v2.csv`
5. Upload to BigQuery — `INTPTLAT` and `INTPTLON` provide county centroid coordinates

### Final Schema (32 columns)

| Column Group | Features |
|---|---|
| Identifiers | County_Name, County_Population, County_Latitude, County_Longitude |
| K-12 Infrastructure | Elementary_Schools, Middle_Schools, High_Schools, Virtual_Schools, Other_Schools |
| All Colleges | Four_Year_Colleges, Two_Year_Colleges, Less_Than_Two_Year_Colleges |
| DS/AI Colleges | Four_Year_Colleges_With_DS_AI, Two_Year_Colleges_With_DS_AI, Less_Than_Two_Year_Colleges_With_DS_AI |
| DS/AI Scores | Online_Impact_Score, Total_Program_Impact_Score |
| Digital Infrastructure | Broadband_Access_Index, Internet_Adoption_Pct, Avg_Broadband_Coverage_Pct, Pct_No_Internet, Total_Households, Effective_Access_Score |
| Economic & Demographic | Median_Household_Income, Poverty_Rate, Unemployment_Rate, Advanced_Degree_Rate, Young_Adult_Bachelors_Plus_Rate, STEM_Employment_Rate, Professional_Services_Rate, Low_Income_Digital_Access_Rate |
| **ML Target** | **Has_Programs** (binary: 1 = county has DS/AI programs, 0 = does not) |

> Distribution: **88 counties with programs**, **17 counties without programs**

---

## ML Modeling

All experiments run in **WEKA** (Waikato Environment for Knowledge Analysis).

**Download:** [WEKA via SourceForge](https://sourceforge.net/projects/weka/)

---

### Step 1 — CSV Preparation

- Ensure: **32 columns**, **105 rows**, **no nulls**
- `Has_Programs` must be the **last column** (WEKA convention for target variable)

---

### Step 2 — Load Data into WEKA Explorer

1. Open WEKA → **Explorer**
2. Open File → change file type to `.csv` → load Dataset 7
3. Convert `Has_Programs` to nominal:
   - Preprocess → Filter → `unsupervised > attribute > NumericToNominal`
   - Set `attributeIndices = 32` → Apply
   - Verify: **88** instances labeled `1`, **17** labeled `0`
4. Remove leaky/identifier features from training:
   - Preprocess → Filter → `unsupervised > attribute > Remove`
   - Remove indices: `1, 13, 14, 15, 16, 17`

> **Why remove those features?** `Total_Program_Impact_Score`, `Online_Impact_Score`, and the `*_With_DS_AI` college counts are all *derived from the same source* as `Has_Programs`. Keeping them causes data leakage (100% accuracy). `County_Name` is an identifier — its 1-to-1 mapping to `Has_Programs` allows the model to memorize rather than learn.

---

### Step 3 — Run ML Experiments

Three classifiers are evaluated using **10-Fold Cross-Validation** (primary) and **Percentage Splits at 70/30, 60/40, and 50/50** (secondary).

> **Note:** 90/10 and 80/20 splits were removed — they cause Random Forest to overfit even with leaky features removed.

---

#### a. Random Forest

| Parameter | Value |
|---|---|
| `maxDepth` | 5 |
| `numIterations` | 50 |
| `seed` | 42 |
| `-M` (min instances per leaf) | 5.0 |

- Classify → trees → **RandomForest**
- Right-click configuration string → set `-M 5.0`

---

#### b. SVM (Support Vector Machine)

| Parameter | Value |
|---|---|
| Classifier | SMO |
| Kernel | PolyKernel |

- Classify → functions → **SMO**

---

#### c. Naïve Bayes

| Parameter | Value |
|---|---|
| Classifier | NaiveBayes |
| Settings | All defaults |

- Classify → bayes → **NaiveBayes**

---

### Step 4 — Record Metrics

Save all results to: `ML Analysis/ → ML Experiment Metrics.xlsx`

---

### Step 5 — Feature Importance (Information Gain)

Rank features by predictive value:

1. Select Attributes → Attribute Evaluator → **InfoGainAttributeEval** (defaults)
2. Search Method → **Ranker** (`numToSelect = -1`, default threshold)
3. Attributes Selection Mode → **Use full training set**
4. Start → save result

---

### Step 6 — Correlation Matrix (PCA)

1. Select Attributes → Attribute Evaluator → **PrincipalComponents** (defaults)
2. Search Method → **Ranker** (defaults)
3. Use full training set → Start → save result
4. Exclude `County_Latitude` and `County_Longitude` from visualization

---

### Step 7 — Cross Correlation Matrix

Examines correlation between DS/AI college presence and all other predictors.

1. Reload Dataset 7 → convert `Has_Programs` to nominal (same as Step 2)
2. Remove indices: `1, 3, 4, 16, 17`
3. Run **PrincipalComponents** with **Ranker** on full training set
4. In the output matrix:
   - **Columns:** `Four_Year_Colleges_With_DS_AI`, `Two_Year_Colleges_With_DS_AI`, `Less_Than_Two_Year_Colleges_With_DS_AI`
   - **Rows:** All 23 remaining predictors

---

## Notes & Decisions

| Decision | Rationale |
|---|---|
| Excluded `Total_Program_Impact_Score` and `Online_Impact_Score` from training | Derived from `Has_Programs` — causes overfitting (100% accuracy in RF and SVM) |
| Excluded `*_With_DS_AI` college columns from training | Same derivation issue as above |
| Excluded `County_Name` from training | Identifier attribute; 1-to-1 mapping allows memorization, not generalization |
| Removed 90/10 and 80/20 splits | Still caused RF overfitting even after removing leaky features |
| Used 25/3 Mbps broadband threshold | Widely accepted minimum for video streaming, large downloads, and cloud access |
| Used `DNE` as placeholder | Indicates data could not be found (not truly missing — confirmed absent) |

---

## References

| # | Source |
|---|---|
| [1] | NCES Common Core of Data — K-12 School Search |
| [2] | NCES IPEDS Data Center — HD2023 Postsecondary Data |
| [3] | IPUMS NHGIS — Population, Income, Education, Internet |
| [4] | FCC Broadband Map — Fixed Broadband Summary |
| [5] | U.S. Census TIGER/Line Shapefiles (2025) |
