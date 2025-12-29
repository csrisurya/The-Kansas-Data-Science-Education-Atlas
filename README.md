# The Kansas Data Science Education Atlas

## Project Overview
This research project addresses geographic inequities in Data Science (DS) and Artificial Intelligence (AI) education access across Kansas. Using publicly available datasets, geospatial analysis, and machine learning classification, the study reveals that 88 of 105 counties lack any DS/AI academic offerings, with programs concentrated in counties hosting four-year universities (Lawrence, Manhattan, Wichita).

### Key Findings
* Educational infrastructure (presence of four-year colleges) has the strongest association to DS/AI program availability
* Population density shows strong correlation with program presence, but creates substantial rural-urban inequity
* Economic indicators (e.g., median income, poverty rate) show minimal predictive power
* Digital infrastructure is adequate statewide (e.g., avg broadband index: 0.79) but doesn't drive program creation
* Machine Learning models achieved 83.8% accuracy (i.e., Random Forest) with 70.6% recall for minority class

## Research Questions
* <i>RQ1:</i> How do population density and demographics correlate with DS/AI educational offerings, and what are the implications for educational equity?
* <i>RQ2:</i> How does K-12 school distribution compare to DS/AI program availability, and where are the critical gaps in the educational pipeline?
* <i>RQ3:</i> To what extent do online DS programs reduce geographic inequality, and how is this limited by digital infrastructure?
* <i>RQ4:</i> Is there a correlation between county-level economic strength and DS/AI program density?

## Methodology

### Data Sources
* <i>NCES Common Core of Data (CCD):</i> K-12 school locations and counts
* <i>NCES IPEDS:</i> College and university information
* <i>IPUMS NHGIS:</i> Census demographic and economic data (ACS 2019-2023)
* <i>FCC Broadband Map:</i> Fixed broadband coverage metrics
* <i>US Census Bureau:</i> County centroid lat/long coordinates
* <i>Manual Collection:</i> DS/AI course inventory (AI-assisted web scraping)

### Analysis Pipeline
1. <i>Data Gathering:</i> Multi-source public dataset collection
2. <i>Data Cleaning:</i> SQL-based standardization in Google BigQuery
3. <i>Feature Engineering:</i> Impact scores, demographic rates, digital access indices
4. <i>Statistical Analysis:</i> Correlation matrices, p-value testing, effect size (Eta-squared)
5. <i>Machine Learning:</i> Random Forest, SVM, Naive Bayes classification (WEKA 3.8)
6. <i>Geospatial Visualization:</i> Heat maps and distribution analysis (R, Power BI)

## Datasets
The project integrates 7 interconnected datasets derived from multiple authoritative sources:

| Dataset    | Description                                                                | Records | Features |
|------------|----------------------------------------------------------------------------|---------|----------|
| Dataset 1  | Educational institution locations with demographic data                    | 1426    | 11       |
| Dataset 2  | Institution counts aggregated by County-City-ZIP                           | 506     | 14       |
| Dataset 3  | DS/AI course and program inventory                                         | 176     | 9        |
| Dataset 4  | College-level program impact scores with coordinates                       | 78      | 10       |
| Dataset 5  | County-level digital access metrics                                        | 106     | 9        |
| Dataset 6  | Socioeconomic indicators and program impact                                | 106     | 11       |
| Dataset 7  | Comprehensive ML-ready integration (Datasets 1-6)                          | 106     | 32       |

## Policy Recommedations
1. <i>Immediate Expansion:</i> Target the 4 False Positive counties (counties predicted to have programs but lacking them) as high-leverage opportunities
2. <i>Regional Hub Development:</i> Establish DS/AI centers serving northwest, southwest, and central Kansas clusters
3. <i>Faculty Fellowship Program:</i> Incentivize DS/AI specialists to teach in underserved counties
4. <i>2+2 Articulation Agreements:</i> Create community college → university transfer pathways for DS/AI degrees
5. <i>Hybrid Certificate Programs:</i> Leverage existing broadband with mobile/hybrid delivery combining online instruction and periodic in-person sessions

## Technology Used
* <i>Database:</i> Google BigQuery
* <i>Data Processing:</i> Python (custom scripts), SQL
* <i>ML Platform:</i> WEKA 3.8
* <i>Visualization:</i> R, Microsoft Power BI Desktop
* <i>Development:</i> VS Code
* <i>Remote Access:</i> Kansas State University Windows Server (via Global Protect VPN), Parallels Desktop software
* <i>Writing:</i> Microsoft Word, Overleaf

## Acknowledgements
* Kansas State University Research Foundation

## Recognitions
* Winner of $1,500 Spring 2026 Undergraduate Research Scholarship (Kansas State University College of Arts & Sciences)
* Presented at MINK-WIC Conference 2025 (multi-state -> Missouri, Iowa, Nebraska, Kansas)
* Nominated to be submitted in American Society for Engineering Education (ASEE) 2026 Annual Conference & Exposition
















