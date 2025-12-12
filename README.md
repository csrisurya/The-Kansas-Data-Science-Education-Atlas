# The Kansas Data Science Education Atlas

## Project Overview
This research project systematically documents and analyzes the distribution of Data Science (DS) and Artificial Intelligence (AI) educational offerings across all 105 Kansas counties, spanning K-12 schools through graduate programs. Using publicly available datasets and machine learning techniques, we investigate geographic disparities in educational access and their correlation with demographic and economic indicators.

### Key Findings
* <i>Geographic Concentration:</i> DS/AI programs are heavily concentrated in three institutional hubs (Lawrence, Manhattan, Wichita)
* <i>Educational Pipeline Gap:</i> 83.8% of Kansas counties (88 of 105) have zero DS/AI programs
* <i>Institutional Capacity Over Wealth:</i> Existing educational infrastructure is the strongest predictor of program presence—not county economic prosperity
* <i>Digital Infrastructure Uniformity:</i> Broadband access is sufficiently uniform across Kansas that it does not explain program distribution patterns

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

### Data Sources
* <i>Educational Institutions:</i> NCES Common Core of Data (K-12), IPEDS (Colleges)
* <i>Demographics:</i> IPUMS NHGIS - American Community Survey 5-Year Data (2019-2023)
* <i>Digital Infrastructure:</i> FCC Broadband Map, ACS Internet Subscription Data
* <i>Geographic Data:</i> US Census Bureau TIGER/Line Shapefiles
* <i>Course Data:</i> Manual collection from publicly available college catalogs (AI-assisted)

## Research Questions
* <i>RQ1:</i> To what extent does population density correlate with DS/AI educational offerings, and what are the implications for educational equity?
* <i>RQ2:</i> How does the K-12 school distribution compare to undergraduate/graduate DS program availability, and where are critical pipeline gaps?
* <i>RQ3:</i> Does online DS program availability reduce geographic inequality, and how is this limited by digital infrastructure?
* <i>RQ4:</i> Is there a correlation between county-level economic strength and DS/AI program density across demographic factors?

## Methodology

### Analytical Techniques
* Descriptive statistics (SQL aggregations)
* Geospatial analysis (heat mapping)
* Correlation analysis (Pearson correlation matrices)
* Machine learning classification (Random Forest, SVM, Naive Bayes)
* Feature importance ranking (Information Gain)

### Machine Learning Classification
<i>Objective:</i> Predict county-level DS/AI program presence using 26 socioeconomic, educational, and digital infrastructure features.

### Models Evaluated
* Random Forest (50 trees, max depth 5)
* Support Vector Machine (Polynomial kernel, SMO)
* Naive Bayes (probabilistic classifier)

### Performance Highlights (10-Fold Cross-Validation)
* <i>Random Forest:</i> 89.5% accuracy, 70.6% recall, 0.68 Kappa
* <i>SVM:</i> 87.6% accuracy, 23.5% recall, 0.31 Kappa
* <i>Naive Bayes:</i> 90.5% accuracy, 52.9% recall, 0.59 Kappa

## Acknowledgements
* Kansas State University Research Foundation
* National Center for Education Statistics (NCES)
* IPUMS NHGIS for demographic data access
* Federal Communications Commission (FCC) for broadband infrastructure data
* US Census Bureau for county centroid lat/long coordinates

## Recognitions
* Winner of $1,500 Undergraduate Research Scholarship
* Presented as MINK-WIC Conference (multi-state -> Missouri, Iowa, Nebraska, Kansas)
* Nominated to be submitted in American Society for Engineering Education (ASEE) 2026 Annual Conference & Exposition

















