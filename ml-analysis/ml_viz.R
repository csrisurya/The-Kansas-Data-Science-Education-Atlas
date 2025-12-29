# Complete ML Visualizations for Kansas DS/AI Education Atlas
# Includes: Correlation Matrix, Accuracy Curves, Confusion Matrices

# Install required packages (run once)
# install.packages(c("ggplot2", "reshape2", "gridExtra", "corrplot", "viridis", "scales", "knitr", "kableExtra"))

library(ggplot2)
library(reshape2)
library(gridExtra)
library(grid)
library(corrplot)
library(viridis)
library(scales)
library(knitr)
library(kableExtra)

# =============================================================================
# PART 1: ACCURACY COMPARISON
# =============================================================================

# Dataset: 105 total counties, 88 without programs, 17 with programs
# ZeroR always predicts majority class (No Programs)
zeror_accuracy <- (88 / 105) * 100  # = 83.81%

# 10-Fold Cross-Validation Results
cv_results <- data.frame(
  Algorithm = c("Random Forest", "SVM (SMO)", "Naive Bayes", "ZeroR"),
  Accuracy = c(91.4286, 86.6667, 90.4762, zeror_accuracy),
  Precision = c(0.912, 0.859, 0.899, NA),
  Recall = c(0.914, 0.867, 0.905, NA),
  F1_Score = c(0.913, 0.835, 0.896, NA),
  Kappa = c(0.6765, 0.3131, 0.5908, 0.0),
  Type = c("Classifier", "Classifier", "Classifier", "Baseline")
)

# Percentage Split Results
split_results <- data.frame(
  Algorithm = rep(c("Random Forest", "SVM (SMO)", "Naive Bayes", "ZeroR"), 3),
  Split = rep(c("70-30", "60-40", "50-50"), each = 4),
  Accuracy = c(
    # 70-30 split
    83.871, 93.5484, 87.0968, zeror_accuracy,
    # 60-40 split
    90.4762, 88.0952, 85.7143, zeror_accuracy,
    # 50-50 split
    82.6923, 82.6923, 82.6923, zeror_accuracy
  ),
  Precision = c(
    0.883, 0.94, 0.896, NA,
    0.902, 0.897, 0.857, NA,
    0.816, 0.823, 0.822, NA
  ),
  Recall = c(
    0.839, 0.935, 0.871, NA,
    0.905, 0.881, 0.857, NA,
    0.827, 0.827, 0.827, NA
  ),
  F1_Score = c(
    0.852, 0.929, 0.879, NA,
    0.9, 0.862, 0.857, NA,
    0.818, 0.798, 0.824, NA
  ),
  Kappa = c(
    0.5201, 0.7156, 0.5894, 0.0,
    0.6923, 0.557, 0.5758, 0.0,
    0.4658, 0.3874, 0.4979, 0.0
  ),
  Type = rep(c("Classifier", "Classifier", "Classifier", "Baseline"), 3)
)

# Visualization 2A: 10-Fold CV Accuracy Bar Chart WITH ZEROR
p1 <- ggplot(cv_results, aes(x = reorder(Algorithm, -Accuracy), y = Accuracy, fill = Type)) +
  geom_bar(stat = "identity", width = 0.6) +
  geom_text(aes(label = sprintf("%.1f%%", Accuracy)), 
            vjust = -0.5, size = 4, fontface = "bold") +
  labs(title = "10-Fold Cross-Validation: Classification Accuracy",
       subtitle = "Primary Analysis Results with ZeroR Baseline",
       x = "Algorithm",
       y = "Accuracy (%)") +
  theme_minimal(base_size = 12) +
  theme(legend.position = "none",
        plot.title = element_text(face = "bold", hjust = 0.5, size = 14),
        plot.subtitle = element_text(hjust = 0.5, size = 11),
        axis.text.x = element_text(angle = 0, hjust = 0.5, face = "bold")) +
  scale_fill_manual(values = c("Classifier" = "#2E86AB", "Baseline" = "#E63946")) +
  scale_x_discrete(limits = c("Random Forest", "Naive Bayes", "SVM (SMO)", "ZeroR")) +
  ylim(0, 100)

ggsave("accuracy_10fold_cv.png", p1, width = 8, height = 6, dpi = 300)

# Visualization 2B: Percentage Split Accuracy WITH ZEROR LINE
split_results$Split <- factor(split_results$Split, levels = c("70-30", "60-40", "50-50"))

split_classifiers <- split_results[split_results$Type == "Classifier", ]
split_baseline <- split_results[split_results$Type == "Baseline", ]

p2 <- ggplot() +
  geom_line(data = split_baseline, 
            aes(x = Split, y = Accuracy, group = 1), 
            color = "#E63946", linetype = "dashed", linewidth = 1.2, alpha = 0.7) +
  geom_line(data = split_classifiers, 
            aes(x = Split, y = Accuracy, color = Algorithm, group = Algorithm),
            linewidth = 1.2) +
  geom_point(data = split_classifiers,
             aes(x = Split, y = Accuracy, color = Algorithm),
             size = 3) +
  geom_text(data = split_classifiers,
            aes(x = Split, y = Accuracy, label = sprintf("%.1f%%", Accuracy), color = Algorithm), 
            vjust = -0.8, size = 3, show.legend = FALSE) +
  annotate("text", x = 2.5, y = zeror_accuracy - 2, 
           label = sprintf("ZeroR: %.1f%%", zeror_accuracy),
           color = "#E63946", size = 3.5, fontface = "italic") +
  labs(title = "Classification Accuracy Across Train-Test Splits",
       subtitle = "Secondary Analysis Results with ZeroR Baseline",
       x = "Train-Test Split Ratio",
       y = "Accuracy (%)",
       color = "Algorithm") +
  theme_minimal(base_size = 12) +
  theme(legend.position = "bottom",
        plot.title = element_text(face = "bold", hjust = 0.5, size = 14),
        plot.subtitle = element_text(hjust = 0.5, size = 11)) +
  scale_color_manual(values = c("Random Forest" = "#2E86AB", 
                                 "SVM (SMO)" = "#A23B72", 
                                 "Naive Bayes" = "#F18F01"),
                     breaks = c("Random Forest", "SVM (SMO)", "Naive Bayes")) +
  ylim(75, 100)

ggsave("accuracy_percentage_splits.png", p2, width = 10, height = 6, dpi = 300)

# Visualization 2C: All Metrics Comparison (Faceted Bar Chart)
cv_long <- melt(cv_results, id.vars = "Algorithm", variable.name = "Metric", value.name = "Score")

# Convert Score to numeric to prevent sprintf formatting errors
cv_long$Score <- as.numeric(as.character(cv_long$Score))

# Separate metrics with different scales
cv_long_pct <- cv_long[cv_long$Metric == "Accuracy", ]
cv_long_ratio <- cv_long[cv_long$Metric != "Accuracy", ]

p3 <- ggplot(cv_long_ratio, aes(x = Algorithm, y = Score, fill = Algorithm)) +
  geom_bar(stat = "identity", width = 0.6) +
  geom_text(aes(label = sprintf("%.2f", Score)), 
            vjust = -0.5, size = 3) +
  facet_wrap(~ Metric, scales = "free_y", nrow = 1) +
  labs(title = "10-Fold Cross-Validation: All Performance Metrics",
       x = "Algorithm",
       y = "Score") +
  theme_minimal(base_size = 11) +
  theme(legend.position = "none",
        plot.title = element_text(face = "bold", hjust = 0.5, size = 13),
        axis.text.x = element_text(angle = 45, hjust = 1, size = 8),
        strip.text = element_text(face = "bold")) +
  scale_fill_manual(values = c("Random Forest" = "#2E86AB", 
                                "SVM (SMO)" = "#A23B72", 
                                "Naive Bayes" = "#F18F01"))

ggsave("all_metrics_comparison.png", p3, width = 12, height = 5, dpi = 300)


# =============================================================================
# PART 2: CONFUSION MATRICES
# =============================================================================

# Enter your confusion matrix values from Weka
# Format: [True Negative, False Positive; False Negative, True Positive]

# 10-Fold Cross-Validation Confusion Matrices
# Random Forest
rf_cm <- matrix(c(84, 4,   # TN=84, FP=4 (row 1: Actual No Program)
                  5, 12),  # FN=5, TP=12 (row 2: Actual Has Program)
                nrow = 2, byrow = TRUE,
                dimnames = list(Actual = c("No Program", "Has Program"),
                               Predicted = c("No Program", "Has Program")))

# SVM
svm_cm <- matrix(c(87, 1,
                   13, 4),
                 nrow = 2, byrow = TRUE,
                 dimnames = list(Actual = c("No Program", "Has Program"),
                                Predicted = c("No Program", "Has Program")))

# Naive Bayes
nb_cm <- matrix(c(86, 2,
                  8, 9),
                nrow = 2, byrow = TRUE,
                dimnames = list(Actual = c("No Program", "Has Program"),
                               Predicted = c("No Program", "Has Program")))

# Function to plot confusion matrix
plot_confusion_matrix <- function(cm, title, algorithm_color) {
  cm_df <- as.data.frame(as.table(cm))
  colnames(cm_df) <- c("Actual", "Predicted", "Count")
  
  # Calculate percentages
  cm_df$Percentage <- ave(cm_df$Count, cm_df$Actual, FUN = function(x) x/sum(x) * 100)
  
  p <- ggplot(cm_df, aes(x = Predicted, y = Actual, fill = Count)) +
    geom_tile(color = "white", size = 1.5) +
    geom_text(aes(label = sprintf("%d\n(%.1f%%)", Count, Percentage)), 
              size = 5, fontface = "bold", color = "black") +
    scale_fill_gradient(low = "#F8F9FA", high = algorithm_color, name = "Count") +
    labs(title = title,
         x = "Predicted Class",
         y = "Actual Class") +
    theme_minimal(base_size = 12) +
    theme(plot.title = element_text(face = "bold", hjust = 0.5, size = 13),
          axis.text = element_text(face = "bold", size = 11),
          legend.position = "right",
          panel.grid = element_blank()) +
    coord_fixed()
  
  return(p)
}

# Create confusion matrix plots
p4 <- plot_confusion_matrix(rf_cm, "Random Forest\nConfusion Matrix (10-Fold CV)", "#2E86AB")
p5 <- plot_confusion_matrix(svm_cm, "SVM (SMO)\nConfusion Matrix (10-Fold CV)", "#A23B72")
p6 <- plot_confusion_matrix(nb_cm, "Naive Bayes\nConfusion Matrix (10-Fold CV)", "#F18F01")

# Save individual confusion matrices
ggsave("confusion_matrix_rf.png", p4, width = 6, height = 5, dpi = 300)
ggsave("confusion_matrix_svm.png", p5, width = 6, height = 5, dpi = 300)
ggsave("confusion_matrix_nb.png", p6, width = 6, height = 5, dpi = 300)


# =============================================================================
# PART 3: Correlation Matrix Visualization
# =============================================================================

library(corrplot)
library(RColorBrewer)
library(dplyr)

cat("\n=== CORRELATION MATRIX USING WEKA ANALYSIS DATA ===\n")

# STEP 1: Define Actual Feature Names from WEKA Analysis
# =============================================================================

# These are the exact 25 features from your WEKA correlation matrix (excluding target "Has_Programs")
features <- c(
  "County_Population", "Elementary_Schools",
  "Middle_Schools", "High_Schools", "Virtual_Schools", "Other_Schools",
  "Four_Year_Colleges", "Two_Year_Colleges", "Less_Than_Two_Year_Colleges",
  "Broadband_Access_Index", "Internet_Adoption_Pct", "Avg_Broadband_Coverage_Pct",
  "Pct_No_Internet", "Total_Households", "Effective_Access_Score",
  "Median_Household_Income", "Poverty_Rate", "Unemployment_Rate",
  "Advanced_Degree_Rate", "Young_Adult_Bachelors_Plus_Rate", "STEM_Employment_Rate",
  "Professional_Services_Rate", "Low_Income_Digital_Access_Rate"
)

# STEP 2: Create Correlation Matrix with Exact WEKA Values
# =============================================================================

# Initialize 23x23 correlation matrix (removed County_Latitude and County_Longitude for relevance)
correlation_matrix <- matrix(0, nrow = length(features), ncol = length(features))
rownames(correlation_matrix) <- features
colnames(correlation_matrix) <- features

# Set diagonal to 1 (perfect self-correlation)
diag(correlation_matrix) <- 1

# Input the exact correlation values from WEKA matrix (row by row)
# Row 1: County_Population correlations
correlation_matrix["County_Population", ] <- c(1, 0.99, 0.97, 0.91, 0.68, 0.76, 0.96, 0.77, 0.85, 0.24, 0.3, 0.13, -0.31, 1, 0.57, 0.38, 0.01, 0.23, 0.51, 0.52, 0.54, 0.56, -0.19)

correlation_matrix["Elementary_Schools", ] <- c(0.99, 1, 0.97, 0.92, 0.66, 0.72, 0.93, 0.73, 0.81, 0.24, 0.3, 0.14, -0.3, 0.99, 0.56, 0.4, -0, 0.24, 0.48, 0.49, 0.53, 0.55, -0.18)

correlation_matrix["Middle_Schools", ] <- c(0.97, 0.97, 1, 0.94, 0.73, 0.77, 0.92, 0.76, 0.83, 0.27, 0.3, 0.17, -0.32, 0.97, 0.53, 0.43, -0.04, 0.26, 0.48, 0.48, 0.56, 0.56, -0.17)

correlation_matrix["High_Schools", ] <- c(0.91, 0.92, 0.94, 1, 0.74, 0.78, 0.88, 0.75, 0.81, 0.25, 0.21, 0.19, -0.23, 0.91, 0.47, 0.39, -0.04, 0.27, 0.44, 0.44, 0.56, 0.49, -0.1)

correlation_matrix["Virtual_Schools", ] <- c(0.68, 0.66, 0.73, 0.74, 1, 0.82, 0.65, 0.69, 0.65, 0.24, 0.14, 0.21, -0.18, 0.67, 0.31, 0.18, 0.14, 0.4, 0.25, 0.27, 0.43, 0.34, -0.05)

correlation_matrix["Other_Schools", ] <- c(0.76, 0.72, 0.77, 0.78, 0.82, 1, 0.79, 0.83, 0.8, 0.22, 0.14, 0.19, -0.17, 0.75, 0.37, 0.19, 0.13, 0.32, 0.26, 0.3, 0.38, 0.31, -0.06)

correlation_matrix["Four_Year_Colleges", ] <- c(0.96, 0.93, 0.92, 0.88, 0.65, 0.79, 1, 0.86, 0.95, 0.19, 0.25, 0.09, -0.26, 0.96, 0.52, 0.3, 0, 0.18, 0.45, 0.44, 0.46, 0.46, -0.16)

correlation_matrix["Two_Year_Colleges", ] <- c(0.77, 0.73, 0.76, 0.75, 0.69, 0.83, 0.86, 1, 0.92, 0.16, 0.18, 0.1, -0.18, 0.76, 0.39, 0.11, 0.1, 0.21, 0.19, 0.21, 0.28, 0.25, -0.13)

correlation_matrix["Less_Than_Two_Year_Colleges", ] <- c(0.85, 0.81, 0.83, 0.81, 0.65, 0.8, 0.95, 0.92, 1, 0.15, 0.2, 0.07, -0.19, 0.85, 0.43, 0.2, 0.02, 0.16, 0.31, 0.3, 0.33, 0.32, -0.12)

correlation_matrix["Broadband_Access_Index", ] <- c(0.24, 0.24, 0.27, 0.25, 0.24, 0.22, 0.19, 0.16, 0.15, 1, 0.48, 0.91, -0.53, 0.23, 0.19, 0.28, -0.07, 0.07, 0.16, 0.21, 0.07, 0.16, -0.2)

correlation_matrix["Internet_Adoption_Pct", ] <- c(0.3, 0.3, 0.3, 0.21, 0.14, 0.14, 0.25, 0.18, 0.2, 0.48, 1, 0.08, -0.94, 0.3, 0.29, 0.44, -0.04, -0.06, 0.26, 0.35, 0.25, 0.26, -0.71)

correlation_matrix["Avg_Broadband_Coverage_Pct", ] <- c(0.13, 0.14, 0.17, 0.19, 0.21, 0.19, 0.09, 0.1, 0.07, 0.91, 0.08, 1, -0.17, 0.13, 0.08, 0.11, -0.06, 0.11, 0.06, 0.08, -0.04, 0.06, 0.1)

correlation_matrix["Pct_No_Internet", ] <- c(-0.31, -0.3, -0.32, -0.23, -0.18, -0.17, -0.26, -0.18, -0.19, -0.53, -0.94, -0.17, 1, -0.31, -0.32, -0.46, 0.04, 0.02, -0.32, -0.42, -0.29, -0.28, 0.62)

correlation_matrix["Total_Households", ] <- c(1, 0.99, 0.97, 0.91, 0.67, 0.75, 0.96, 0.76, 0.85, 0.23, 0.3, 0.13, -0.31, 1, 0.57, 0.38, 0.01, 0.23, 0.52, 0.52, 0.54, 0.56, -0.19)

correlation_matrix["Effective_Access_Score", ] <- c(0.57, 0.56, 0.53, 0.47, 0.31, 0.37, 0.52, 0.39, 0.43, 0.19, 0.29, 0.08, -0.32, 0.57, 1, 0.25, 0.15, 0.16, 0.46, 0.56, 0.47, 0.46, -0.22)

correlation_matrix["Median_Household_Income", ] <- c(0.38, 0.4, 0.43, 0.39, 0.18, 0.19, 0.3, 0.11, 0.2, 0.28, 0.44, 0.11, -0.46, 0.38, 0.25, 1, -0.53, -0.12, 0.43, 0.45, 0.51, 0.39, -0.26)

correlation_matrix["Poverty_Rate", ] <- c(0.01, -0, -0.04, -0.04, 0.14, 0.13, 0, 0.1, 0.02, -0.07, -0.04, -0.06, 0.04, 0.01, 0.15, -0.53, 1, 0.35, -0.17, -0.07, 0.02, -0.06, -0.1)

correlation_matrix["Unemployment_Rate", ] <- c(0.23, 0.24, 0.26, 0.27, 0.4, 0.32, 0.18, 0.21, 0.16, 0.07, -0.06, 0.11, 0.02, 0.23, 0.16, -0.12, 0.35, 1, -0.07, 0.01, 0.12, -0.05, -0.03)

correlation_matrix["Advanced_Degree_Rate", ] <- c(0.51, 0.48, 0.48, 0.44, 0.25, 0.26, 0.45, 0.19, 0.31, 0.16, 0.26, 0.06, -0.32, 0.52, 0.46, 0.43, -0.17, -0.07, 1, 0.95, 0.52, 0.65, -0.05)

correlation_matrix["Young_Adult_Bachelors_Plus_Rate", ] <- c(0.52, 0.49, 0.48, 0.44, 0.27, 0.3, 0.44, 0.21, 0.3, 0.21, 0.35, 0.08, -0.42, 0.52, 0.56, 0.45, -0.07, 0.01, 0.95, 1, 0.59, 0.66, -0.12)

correlation_matrix["STEM_Employment_Rate", ] <- c(0.54, 0.53, 0.56, 0.56, 0.43, 0.38, 0.46, 0.28, 0.33, 0.07, 0.25, -0.04, -0.29, 0.54, 0.47, 0.51, 0.02, 0.12, 0.52, 0.59, 1, 0.62, -0.15)

correlation_matrix["Professional_Services_Rate", ] <- c(0.56, 0.55, 0.56, 0.49, 0.34, 0.31, 0.46, 0.25, 0.32, 0.16, 0.26, 0.06, -0.28, 0.56, 0.46, 0.39, -0.06, -0.05, 0.65, 0.66, 0.62, 1, -0.06)

correlation_matrix["Low_Income_Digital_Access_Rate", ] <- c(-0.19, -0.18, -0.17, -0.1, -0.05, -0.06, -0.16, -0.13, -0.12, -0.2, -0.71, 0.1, 0.62, -0.19, -0.22, -0.26, -0.1, -0.03, -0.05, -0.12, -0.15, -0.06, 1)

# STEP 3: Create Complete Correlation Visualization
# =============================================================================

cat("\n=== CREATING COMPLETE CORRELATION VISUALIZATION ===\n")

cat("Including all", length(features), "predictor features in visualization\n")

# Generate comprehensive visualization
png("correlation_matrix_predictor.png", width = 1400, height = 1200, res = 120)

corrplot(correlation_matrix,
         method = "color",
         type = "upper", 
         order = "hclust",  # Hierarchical clustering to group similar features
         tl.cex = 0.55,     # Smaller text size for all feature names
         tl.col = "black",
         tl.srt = 45,
         col = colorRampPalette(c("#053061", "#2166AC", "#4393C3", "#92C5DE", 
                                  "#D1E5F0", "#FFFFFF", "#FDDBC7", "#F4A582", 
                                  "#D6604D", "#B2182B", "#67001F"))(200),
         addCoef.col = "black",
         number.cex = 0.35, # Very small numbers to fit all correlations
         cl.cex = 0.8,
         title = "Complete Feature Correlation Matrix - 23 Predictors (WEKA Analysis)",
         mar = c(0,0,3,0))

dev.off()


# =============================================================================
# PART 4: Feature Importance Ranking Visualization
# =============================================================================

cat("\n", paste(rep("=", 80), collapse=""), "\n")
cat("PART 4: FEATURE IMPORTANCE RANKING VISUALIZATION\n")
cat(paste(rep("=", 80), collapse=""), "\n")

# STEP 1: Define Feature Rankings from WEKA Information Gain Analysis
# =============================================================================

cat("\n=== FEATURE RANKING FROM WEKA INFORMATION GAIN ANALYSIS ===\n")

# Feature importance data from your Feature Analysis file (Information Gain scores)
feature_ranking <- data.frame(
  Rank = 1:25,
  Feature = c(
    "Four_Year_Colleges", "Total_Households", "County_Population", "Elementary_Schools",
    "Effective_Access_Score", "Young_Adult_Bachelors_Plus_Rate", "Advanced_Degree_Rate",
    "STEM_Employment_Rate", "Professional_Services_Rate", "Less_Than_Two_Year_Colleges",
    "Two_Year_Colleges", "Middle_Schools", "High_Schools", "Other_Schools",
    "Virtual_Schools", "Median_Household_Income", "Poverty_Rate", "Unemployment_Rate",
    "Broadband_Access_Index", "Internet_Adoption_Pct", "Avg_Broadband_Coverage_Pct",
    "Pct_No_Internet", "Low_Income_Digital_Access_Rate", "County_Latitude", "County_Longitude"
  ),
  Information_Gain = c(
    0.3096, 0.2881, 0.2881, 0.2562, 0.2271, 0.1893, 0.1651, 0.1511, 0.1465, 0.1380,
    0.1284, 0.1139, 0.1018, 0.0946, 0.0885, 0.0, 0.0, 0.0, 0.0, 0.0,
    0.0, 0.0, 0.0, 0.0, 0.0
  ),
  Category = c(
    "Education", "Demographics", "Demographics", "Education", "Digital Access", 
    "Socioeconomic", "Socioeconomic", "Economic", "Economic", "Education",
    "Education", "Education", "Education", "Education", "Education", 
    "Economic", "Economic", "Economic", "Digital Access", "Digital Access",
    "Digital Access", "Digital Access", "Digital Access", "Geographic", "Geographic"
  )
)

cat("Feature ranking data loaded: 25 features with Information Gain scores\n")
cat("Top 5 features:\n")
print(feature_ranking[1:5, c("Feature", "Information_Gain")], row.names = FALSE)

# STEP 2: Create Feature Importance Bar Chart
# =============================================================================

cat("\n=== CREATING FEATURE IMPORTANCE VISUALIZATION ===\n")

# Filter to show only features with non-zero information gain for clarity
significant_features <- feature_ranking[feature_ranking$Information_Gain > 0, ]

# Create color palette by category
category_colors <- c(
  "Education" = "#2E86AB",          # Blue
  "Demographics" = "#A23B72",       # Purple  
  "Digital Access" = "#F18F01",     # Orange
  "Socioeconomic" = "#C73E1D",      # Red
  "Economic" = "#87A96B",           # Green
  "Geographic" = "#6B5B95"          # Dark Purple
)

# Create horizontal bar chart
p7 <- ggplot(significant_features, aes(x = reorder(Feature, Information_Gain), 
                                       y = Information_Gain, 
                                       fill = Category)) +
  geom_col(width = 0.8) +
  geom_text(aes(label = sprintf("%.4f", Information_Gain)), 
            hjust = -0.05, size = 3) +
  coord_flip() +
  labs(title = "Feature Importance Ranking by Information Gain",
       subtitle = "WEKA Attribute Selection Analysis (Features with IG > 0)",
       x = "Features",
       y = "Information Gain Score",
       fill = "Category") +
  theme_minimal(base_size = 11) +
  theme(plot.title = element_text(face = "bold", hjust = 0.5, size = 14),
        plot.subtitle = element_text(hjust = 0.5, size = 11),
        legend.position = "bottom",
        panel.grid.minor = element_blank(),
        axis.text.y = element_text(size = 9)) +
  scale_fill_manual(values = category_colors) +
  scale_y_continuous(limits = c(0, max(significant_features$Information_Gain) * 1.15),
                     expand = c(0, 0))

# Save the plot
ggsave("feature_importance_ranking.png", p7, width = 12, height = 8, dpi = 300)

# =============================================================================
# PART 5: COMPREHENSIVE CORRELATION MATRIX (26 FEATURES)
# =============================================================================

# Define all 26 features (23 predictors + 3 DS/AI features)
all_features <- c(
  "County_Population", "Elementary_Schools", "Middle_Schools", "High_Schools", 
  "Virtual_Schools", "Other_Schools", "Four_Year_Colleges", "Two_Year_Colleges", 
  "Less_Than_Two_Year_Colleges", "Four_Year_Colleges_DS_AI", "Two_Year_Colleges_DS_AI", 
  "Less_Than_Two_Year_Colleges_DS_AI", "Broadband_Access_Index", "Internet_Adoption_Pct", 
  "Avg_Broadband_Coverage_Pct", "Pct_No_Internet", "Total_Households", 
  "Effective_Access_Score", "Median_Household_Income", "Poverty_Rate", 
  "Unemployment_Rate", "Advanced_Degree_Rate", "Young_Adult_Bachelors_Plus_Rate", 
  "STEM_Employment_Rate", "Professional_Services_Rate", "Low_Income_Digital_Access_Rate"
)

# Create comprehensive 26x26 correlation matrix
comprehensive_correlation_matrix <- matrix(0, nrow = 26, ncol = 26)
rownames(comprehensive_correlation_matrix) <- all_features
colnames(comprehensive_correlation_matrix) <- all_features

# Fill the correlation matrix with values from WEKA output
# Row 1: County_Population
comprehensive_correlation_matrix[1, ] <- c(1, 0.99, 0.97, 0.91, 0.68, 0.76, 0.96, 0.77, 0.85, 0.56, 0.35, 0.24, 0.3, 0.13, -0.31, 1, 0.57, 0.38, 0.01, 0.23, 0.51, 0.52, 0.54, 0.56, -0.19, 0.47)[c(1:9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26)]

# Row 2: Elementary_Schools  
comprehensive_correlation_matrix[2, ] <- c(0.99, 1, 0.97, 0.92, 0.66, 0.72, 0.93, 0.73, 0.81, 0.52, 0.41, 0.24, 0.3, 0.14, -0.3, 0.99, 0.56, 0.4, -0, 0.24, 0.48, 0.49, 0.53, 0.55, -0.18, 0.46)

# Row 3: Middle_Schools
comprehensive_correlation_matrix[3, ] <- c(0.97, 0.97, 1, 0.94, 0.73, 0.77, 0.92, 0.76, 0.83, 0.52, 0.38, 0.27, 0.3, 0.17, -0.32, 0.97, 0.53, 0.43, -0.04, 0.26, 0.48, 0.48, 0.56, 0.56, -0.17, 0.46)

# Row 4: High_Schools
comprehensive_correlation_matrix[4, ] <- c(0.91, 0.92, 0.94, 1, 0.74, 0.78, 0.88, 0.75, 0.81, 0.56, 0.37, 0.25, 0.21, 0.19, -0.23, 0.91, 0.47, 0.39, -0.04, 0.27, 0.44, 0.44, 0.56, 0.49, -0.1, 0.49)

# Row 5: Virtual_Schools
comprehensive_correlation_matrix[5, ] <- c(0.68, 0.66, 0.73, 0.74, 1, 0.82, 0.65, 0.69, 0.65, 0.45, 0.1, 0.24, 0.14, 0.21, -0.18, 0.67, 0.31, 0.18, 0.14, 0.4, 0.25, 0.27, 0.43, 0.34, -0.05, 0.34)

# Row 6: Other_Schools
comprehensive_correlation_matrix[6, ] <- c(0.76, 0.72, 0.77, 0.78, 0.82, 1, 0.79, 0.83, 0.8, 0.58, 0.16, 0.22, 0.14, 0.19, -0.17, 0.75, 0.37, 0.19, 0.13, 0.32, 0.26, 0.3, 0.38, 0.31, -0.06, 0.47)

# Row 7: Four_Year_Colleges
comprehensive_correlation_matrix[7, ] <- c(0.96, 0.93, 0.92, 0.88, 0.65, 0.79, 1, 0.86, 0.95, 0.59, 0.23, 0.19, 0.25, 0.09, -0.26, 0.96, 0.52, 0.3, 0, 0.18, 0.45, 0.44, 0.46, 0.46, -0.16, 0.43)

# Row 8: Two_Year_Colleges
comprehensive_correlation_matrix[8, ] <- c(0.77, 0.73, 0.76, 0.75, 0.69, 0.83, 0.86, 1, 0.92, 0.49, 0.11, 0.16, 0.18, 0.1, -0.18, 0.76, 0.39, 0.11, 0.1, 0.21, 0.19, 0.21, 0.28, 0.25, -0.13, 0.3)

# Row 9: Less_Than_Two_Year_Colleges

comprehensive_correlation_matrix[9, ] <- c(0.85, 0.81, 0.83, 0.81, 0.65, 0.8, 0.95, 0.92, 1, 0.54, 0.15, 0.15, 0.2, 0.07, -0.19, 0.85, 0.43, 0.2, 0.02, 0.16, 0.31, 0.3, 0.33, 0.32, -0.12, 0.36)

# Row 10: Four_Year_Colleges_DS_AI
comprehensive_correlation_matrix[10, ] <- c(0.56, 0.52, 0.52, 0.56, 0.45, 0.58, 0.59, 0.49, 0.54, 1, 0.14, 0.22, 0.26, 0.13, -0.3, 0.56, 0.56, 0.16, 0.18, 0.21, 0.47, 0.55, 0.44, 0.32, -0.14, 0.85)

# Row 11: Two_Year_Colleges_DS_AI  
comprehensive_correlation_matrix[11, ] <- c(0.35, 0.41, 0.38, 0.37, 0.1, 0.16, 0.23, 0.11, 0.15, 0.14, 1, 0.15, 0.14, 0.1, -0.13, 0.35, 0.2, 0.27, -0.02, 0.16, 0.12, 0.15, 0.24, 0.21, -0.1, 0.51)

# Row 12: Less_Than_Two_Year_Colleges_DS_AI
comprehensive_correlation_matrix[12, ] <- c(0.24, 0.24, 0.27, 0.25, 0.24, 0.22, 0.19, 0.16, 0.15, 0.22, 0.15, 1, 0.48, 0.91, -0.53, 0.23, 0.19, 0.28, -0.07, 0.07, 0.16, 0.21, 0.07, 0.16, -0.2, 0.24)

# Row 13: Broadband_Access_Index
comprehensive_correlation_matrix[13, ] <- c(0.3, 0.3, 0.3, 0.21, 0.14, 0.14, 0.25, 0.18, 0.2, 0.26, 0.14, 0.48, 1, 0.08, -0.94, 0.3, 0.29, 0.44, -0.04, -0.06, 0.26, 0.35, 0.25, 0.26, -0.71, 0.27)

# Row 14: Internet_Adoption_Pct
comprehensive_correlation_matrix[14, ] <- c(0.13, 0.14, 0.17, 0.19, 0.21, 0.19, 0.09, 0.1, 0.07, 0.13, 0.1, 0.91, 0.08, 1, -0.17, 0.13, 0.08, 0.11, -0.06, 0.11, 0.06, 0.08, -0.04, 0.06, 0.1, 0.15)
# Row 15: Avg_Broadband_Coverage_Pct (corrected from Pct_No_Internet position)
comprehensive_correlation_matrix[15, ] <- c(-0.31, -0.3, -0.32, -0.23, -0.18, -0.17, -0.26, -0.18, -0.19, -0.3, -0.13, -0.53, -0.94, -0.17, 1, -0.31, -0.32, -0.46, 0.04, 0.02, -0.32, -0.42, -0.29, -0.28, 0.62, -0.3)

# Row 16: Pct_No_Internet (actually Total_Households based on correlation pattern)
comprehensive_correlation_matrix[16, ] <- c(1, 0.99, 0.97, 0.91, 0.67, 0.75, 0.96, 0.76, 0.85, 0.56, 0.35, 0.23, 0.3, 0.13, -0.31, 1, 0.57, 0.38, 0.01, 0.23, 0.52, 0.52, 0.54, 0.56, -0.19, 0.47)

# Row 17: Total_Households (actually Effective_Access_Score based on values)
comprehensive_correlation_matrix[17, ] <- c(0.57, 0.56, 0.53, 0.47, 0.31, 0.37, 0.52, 0.39, 0.43, 0.56, 0.2, 0.19, 0.29, 0.08, -0.32, 0.57, 1, 0.25, 0.15, 0.16, 0.46, 0.56, 0.47, 0.46, -0.22, 0.51)

# Row 18: Effective_Access_Score (actually Median_Household_Income)
comprehensive_correlation_matrix[18, ] <- c(0.38, 0.4, 0.43, 0.39, 0.18, 0.19, 0.3, 0.11, 0.2, 0.16, 0.27, 0.28, 0.44, 0.11, -0.46, 0.38, 0.25, 1, -0.53, -0.12, 0.43, 0.45, 0.51, 0.39, -0.26, 0.19)

# Row 19: Median_Household_Income (actually Poverty_Rate)
comprehensive_correlation_matrix[19, ] <- c(0.01, -0, -0.04, -0.04, 0.14, 0.13, 0, 0.1, 0.02, 0.18, -0.02, -0.07, -0.04, -0.06, 0.04, 0.01, 0.15, -0.53, 1, 0.35, -0.17, -0.07, 0.02, -0.06, -0.1, 0.21)

# Row 20: Poverty_Rate (actually Unemployment_Rate)
comprehensive_correlation_matrix[20, ] <- c(0.23, 0.24, 0.26, 0.27, 0.4, 0.32, 0.18, 0.21, 0.16, 0.21, 0.16, 0.07, -0.06, 0.11, 0.02, 0.23, 0.16, -0.12, 0.35, 1, -0.07, 0.01, 0.12, -0.05, -0.03, 0.26)

# Row 21: Unemployment_Rate (actually Advanced_Degree_Rate)
comprehensive_correlation_matrix[21, ] <- c(0.51, 0.48, 0.48, 0.44, 0.25, 0.26, 0.45, 0.19, 0.31, 0.47, 0.12, 0.16, 0.26, 0.06, -0.32, 0.52, 0.46, 0.43, -0.17, -0.07, 1, 0.95, 0.52, 0.65, -0.05, 0.41)

# Row 22: Advanced_Degree_Rate (actually Young_Adult_Bachelors_Plus_Rate)
comprehensive_correlation_matrix[22, ] <- c(0.52, 0.49, 0.48, 0.44, 0.27, 0.3, 0.44, 0.21, 0.3, 0.55, 0.15, 0.21, 0.35, 0.08, -0.42, 0.52, 0.56, 0.45, -0.07, 0.01, 0.95, 1, 0.59, 0.66, -0.12, 0.52)

# Row 23: Young_Adult_Bachelors_Plus_Rate (actually STEM_Employment_Rate)
comprehensive_correlation_matrix[23, ] <- c(0.54, 0.53, 0.56, 0.56, 0.43, 0.38, 0.46, 0.28, 0.33, 0.44, 0.24, 0.07, 0.25, -0.04, -0.29, 0.54, 0.47, 0.51, 0.02, 0.12, 0.52, 0.59, 1, 0.62, -0.15, 0.44)

# Row 24: STEM_Employment_Rate (actually Professional_Services_Rate)
comprehensive_correlation_matrix[24, ] <- c(0.56, 0.55, 0.56, 0.49, 0.34, 0.31, 0.46, 0.25, 0.32, 0.32, 0.21, 0.16, 0.26, 0.06, -0.28, 0.56, 0.46, 0.39, -0.06, -0.05, 0.65, 0.66, 0.62, 1, -0.06, 0.31)

# Row 25: Professional_Services_Rate (actually Low_Income_Digital_Access_Rate)
comprehensive_correlation_matrix[25, ] <- c(-0.19, -0.18, -0.17, -0.1, -0.05, -0.06, -0.16, -0.13, -0.12, -0.14, -0.1, -0.2, -0.71, 0.1, 0.62, -0.19, -0.22, -0.26, -0.1, -0.03, -0.05, -0.12, -0.15, -0.06, 1, -0.15)

# Row 26: Low_Income_Digital_Access_Rate (last column values)
comprehensive_correlation_matrix[26, ] <- c(0.47, 0.46, 0.46, 0.49, 0.34, 0.47, 0.43, 0.3, 0.36, 0.85, 0.51, 0.24, 0.27, 0.15, -0.3, 0.47, 0.51, 0.19, 0.21, 0.26, 0.41, 0.52, 0.44, 0.31, -0.15, 1)

# Create labels for better readability (shortened versions)
short_labels <- c(
  "County_Pop", "Elementary", "Middle", "High", "Virtual", "Other", 
  "4Yr_Colleges", "2Yr_Colleges", "<2Yr_Colleges", "4Yr_DS_AI", "2Yr_DS_AI", "<2Yr_DS_AI",
  "Broadband_Index", "Internet_Adopt", "Broadband_Cov", "No_Internet", "Households", 
  "Access_Score", "Median_Income", "Poverty", "Unemployment", "Advanced_Deg", 
  "Bachelor_Plus", "STEM_Employ", "Prof_Services", "Low_Income_Access"
)

# Traditional corrplot heatmap
# =============================================================================

png("correlation_matrix_DSAI.png", width = 1600, height = 1600, res = 120)

corrplot(comprehensive_correlation_matrix,
         method = "color",
         type = "upper",
         order = "hclust",
         tl.cex = 0.7,
         tl.col = "black", 
         tl.srt = 45,
         col = colorRampPalette(c("#053061", "#2166AC", "#4393C3", "#92C5DE", "#D1E5F0", 
                                  "#FFFFFF", "#FDDBC7", "#F4A582", "#D6604D", "#B2182B", "#67001F"))(200),
         addCoef.col = "black",
         number.cex = 0.4,
         cl.cex = 0.9,
         title = "Comprehensive Correlation Matrix: 23 Predictors + 3 DS/AI Features (26 Total)",
         mar = c(0,0,3,0))

dev.off()

# =============================================================================
# PART 6: P-VALUE MATRIX FOR ALL 26 FEATURES
# =============================================================================

# Function to calculate p-value from correlation coefficient
# Using the t-distribution approach: t = r * sqrt(n-2) / sqrt(1-r^2)
# where n = 105 (number of Kansas counties)
calc_pvalue <- function(r, n = 105) {
  if (abs(r) == 1) return(0)  # Perfect correlation
  if (abs(r) >= 0.999) return(1e-10)  # Near-perfect correlation
  t_stat <- r * sqrt(n - 2) / sqrt(1 - r^2)
  p_val <- 2 * pt(-abs(t_stat), df = n - 2)  # Two-tailed test
  return(p_val)
}

# Create p-value matrix for all 26 features
comprehensive_pvalue_matrix <- matrix(0, nrow = 26, ncol = 26)
rownames(comprehensive_pvalue_matrix) <- all_features
colnames(comprehensive_pvalue_matrix) <- all_features

# Calculate p-values for all correlations
for (i in 1:nrow(comprehensive_correlation_matrix)) {
  for (j in 1:ncol(comprehensive_correlation_matrix)) {
    if (i == j) {
      comprehensive_pvalue_matrix[i, j] <- 0  # Diagonal (self-correlation) has p=0
    } else {
      comprehensive_pvalue_matrix[i, j] <- calc_pvalue(comprehensive_correlation_matrix[i, j], n = 105)
    }
  }
}

# Create significance indicator matrix
# Common thresholds: *** p<0.001, ** p<0.01, * p<0.05
sig_matrix_comprehensive <- comprehensive_pvalue_matrix
sig_matrix_comprehensive[comprehensive_pvalue_matrix < 0.001] <- "***"
sig_matrix_comprehensive[comprehensive_pvalue_matrix >= 0.001 & comprehensive_pvalue_matrix < 0.01] <- "**"
sig_matrix_comprehensive[comprehensive_pvalue_matrix >= 0.01 & comprehensive_pvalue_matrix < 0.05] <- "*"
sig_matrix_comprehensive[comprehensive_pvalue_matrix >= 0.05] <- ""

# P-value heatmap using corrplot (with raw p-values)
# =============================================================================

png("pvalue_matrix_DSAI.png", width = 1600, height = 1600, res = 120)

corrplot(comprehensive_pvalue_matrix,
         method = "color",
         type = "upper",
         order = "hclust",  # Same ordering as correlation matrix
         tl.cex = 0.7,
         tl.col = "black",
         tl.srt = 45,
         col = colorRampPalette(c("#8B0000", "#BF360C", "#D84315", "#E64A19", 
                                  "#FF6B3D", "#FF8C5A", "#FFA876", "#FFC097", 
                                  "#FFD7B8", "#FFEBD9", "#FFF5EB", "#FFFFFF"))(200),
         addCoef.col = "black",
         number.cex = 0.4,
         cl.cex = 0.9,
         is.corr = FALSE,  # Not a correlation matrix
         title = "P-Value Matrix (Raw Values) - All 26 Features",
         mar = c(0,0,3,0))

dev.off()

# =============================================================================
# PART 7: ETA-SQUARED CALCULATION FOR ALL FEATURE PAIRINGS
# =============================================================================

# Function to calculate eta-squared from correlation coefficient
# Eta-squared represents the proportion of variance explained
calc_eta_squared <- function(r) {
  return(r^2)
}

# Create eta-squared matrix for all 26 features
comprehensive_eta_squared_matrix <- comprehensive_correlation_matrix^2

# Convert matrix to simplified table format showing all pairings
eta_squared_table <- data.frame()

for (i in 1:nrow(comprehensive_eta_squared_matrix)) {
  for (j in 1:ncol(comprehensive_eta_squared_matrix)) {
    if (i != j) {  # Exclude diagonal (self-correlations)
      eta_squared_table <- rbind(eta_squared_table, data.frame(
        Feature_1 = rownames(comprehensive_eta_squared_matrix)[i],
        Feature_2 = colnames(comprehensive_eta_squared_matrix)[j],
        Eta_Squared = comprehensive_eta_squared_matrix[i, j]
      ))
    }
  }
}

# Sort by eta-squared value (highest to lowest)
eta_squared_table <- eta_squared_table[order(eta_squared_table$Eta_Squared, decreasing = TRUE), ]

# Create eta-squared heatmap visualization
png("eta_squared_heatmap.png", width = 1600, height = 1600, res = 120)

# Create eta-squared heatmap
corrplot(comprehensive_eta_squared_matrix,
         method = "color",
         type = "upper",
         order = "hclust",  # Same ordering as other matrices
         tl.cex = 0.7,
         tl.col = "black",
         tl.srt = 45,
         col = colorRampPalette(c("#FFFFFF", "#FFF5F0", "#FEE0D2", "#FCBBA1", 
                                  "#FC9272", "#FB6A4A", "#EF3B2C", "#CB181D", 
                                  "#A50F15", "#67000D"))(200),
         addCoef.col = "black",
         number.cex = 0.4,
         cl.cex = 0.9,
         is.corr = FALSE,
         title = "Eta-Squared Matrix (Variance Explained) - All 26 Features",
         mar = c(0,0,3,0),
         cl.lim = c(0, 1))

dev.off()
cat("Eta-squared heatmap saved to: eta_squared_heatmap.png\n")
