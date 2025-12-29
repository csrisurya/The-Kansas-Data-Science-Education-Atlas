library(ggplot2)
library(dplyr)
library(scales)
library(RColorBrewer)

# Set theme for all plots
theme_set(theme_minimal(base_size = 12))

# Custom color palette
kansas_colors <- c("#512888", "#0051BA", "#006747", "#FFB81C", "#D50032")

# 1. COUNTY - Enhanced 3-Card Visual
county_stats <- read.csv("1_county.csv")

# Create card data for visualization
card_data <- data.frame(
  x = c(1, 2, 3),
  y = c(1, 1, 1),
  card_type = c("Total", "First", "Last"),
  main_text = c(
    county_stats$Total_Counties,
    county_stats$First_Alphabetically,
    county_stats$Last_Alphabetically
  ),
  subtitle = c(
    "Kansas Counties",
    "First (Alphabetically)",
    "Last (Alphabetically)"
  ),
  colors = kansas_colors[c(1, 3, 5)]
)

county_plot <- ggplot(card_data, aes(x = x, y = y)) +
  # Card backgrounds
  geom_rect(aes(xmin = x - 0.45, xmax = x + 0.45, 
                ymin = y - 0.35, ymax = y + 0.35, 
                fill = colors), 
            alpha = 0.8, color = "white", linewidth = 2) +
  
  # Main statistics (large text)
  geom_text(aes(label = main_text), 
            y = 1.15, size = 10, fontface = "bold", color = "white") +
  
  # Subtitles
  geom_text(aes(label = subtitle), 
            y = 0.9, size = 3.5, color = "white", fontface = "bold") +
  
  # Card type labels at bottom
  geom_text(aes(label = toupper(card_type)), 
            y = 0.7, size = 2.5, color = "white", alpha = 0.8) +
  
  scale_fill_identity() +
  scale_x_continuous(limits = c(0.4, 3.6)) +
  scale_y_continuous(limits = c(0.4, 1.6)) +
  theme_void() +
  theme(
    plot.title = element_text(size = 16, hjust = 0.5, margin = margin(b = 20)),
    plot.background = element_rect(fill = "white", color = NA),
    panel.background = element_rect(fill = "white", color = NA)
  )
ggsave("1_county.png", county_plot, width = 14, height = 6, dpi = 300)


# 2. TOTAL PROGRAM IMPACT SCORE - Distribution
impact_data <- read.csv("2_total_program_impact_score.csv")

# Order the impact ranges properly
impact_data$Impact_Range <- factor(impact_data$Impact_Range, 
                                   levels = c("No Programs (0)", "Very Low (0-2)", 
                                            "Low (2-5)", "Moderate (5-8)", "High (8+)"))

# Horizontal bar chart
impact_plot <- ggplot(impact_data, aes(x = County_Count, y = Impact_Range, fill = Impact_Range)) +
  geom_bar(stat = "identity", fill="#512888") +
  geom_text(aes(label = County_Count), hjust = -0.2, size = 4) +
  labs(
       x = "Number of Counties",
       y = "Impact Range") +
  theme(legend.position = "none",
        plot.title = element_text(face = "bold", size = 14)) +
  xlim(0, max(impact_data$County_Count) * 1.15)

ggsave("2_total_program_impact_score.png", impact_plot, width = 10, height = 6, dpi = 300)


# 3. MEDIAN HOUSEHOLD INCOME - Distribution
income_data <- read.csv("3_median_household_income.csv")

# Order income brackets
income_data$Income_Bracket <- factor(income_data$Income_Bracket,
                                     levels = c("Below $50K (Low)", "$50K-$54K (Below Average)",
                                              "$55K-$64K (Average)", "$65K-$79K (Above Average)",
                                              "$80K+ (High)"))

# Stacked or grouped bar chart
income_plot <- ggplot(income_data, aes(x = Income_Bracket, y = County_Count, fill = Income_Bracket)) +
  geom_bar(stat = "identity", fill="#512888") +
  geom_text(aes(label = County_Count), vjust = -0.5, size = 4) +
  labs(
       x = "Income Bracket",
       y = "Number of Counties") +
  theme(legend.position = "none",
        axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(face = "bold", size = 14)) +
  ylim(0, max(income_data$County_Count) * 1.15)

ggsave("3_median_household_income.png", income_plot, width = 10, height = 6, dpi = 300)


# 4. POVERTY RATE
poverty_data <- read.csv("4_poverty_rate.csv")

poverty_data$Poverty_Range <- factor(poverty_data$Poverty_Range,
                                     levels = c("Below 5% (Minimal)", "5-9% (Low)",
                                              "10-14% (Moderate)", "15-19% (High)",
                                              "20%+ (Critical)"))

poverty_plot <- ggplot(poverty_data, aes(x = Poverty_Range, y = County_Count)) +
  geom_bar(stat = "identity", fill = "#512888") +
  geom_text(aes(label = County_Count), vjust = -0.5, size = 4) +
  labs(x = "Poverty Rate Range", y = "Number of Counties") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(face = "bold", size = 14)) +
  ylim(0, max(poverty_data$County_Count) * 1.15)

ggsave("4_poverty_rate.png", poverty_plot, width = 10, height = 6, dpi = 300)



# 5. UNEMPLOYMENT RATE - Distribution
unemployment_data <- read.csv("5_unemployment_rate.csv")

# Order the ranges (low to high unemployment)
unemployment_data$Unemployment_Range <- factor(unemployment_data$Unemployment_Range,
                                               levels = c("Below 2% (Very Low)", "2-2.9% (Low)",
                                                        "3-4.4% (Moderate)", "4.5-5.9% (High)",
                                                        "6%+ (Very High)"))

# Bar chart with color gradient showing severity
unemployment_plot <- ggplot(unemployment_data, aes(x = Unemployment_Range, y = County_Count, 
                                                   fill = Unemployment_Range)) +
  geom_bar(stat = "identity", fill="#512888") +
  geom_text(aes(label = County_Count), vjust = -0.5, size = 4) +
  labs(
       x = "Unemployment Rate Range",
       y = "Number of Counties") +
  theme(legend.position = "none",
        axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(face = "bold", size = 14)) +
  ylim(0, max(unemployment_data$County_Count) * 1.15)

ggsave("5_unemployment_rate.png", unemployment_plot, width = 10, height = 6, dpi = 300)


# 6. ADVANCED DEGREE RATE
advanced_degree_data <- read.csv("6_advanced_degree_rate.csv")

advanced_degree_data$Education_Range <- factor(advanced_degree_data$Education_Range,
                                               levels = c("Below 10% (Very Low)", "10-14% (Low)",
                                                        "15-19% (Moderate)", "20-29% (High)",
                                                        "30%+ (Very High)"))

advanced_degree_plot <- ggplot(advanced_degree_data, aes(x = Education_Range, y = County_Count)) +
  geom_bar(stat = "identity", fill = "#512888") +
  geom_text(aes(label = County_Count), vjust = -0.5, size = 4) +
  labs(x = "Advanced Degree Rate (Bachelor's+)", y = "Number of Counties") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(face = "bold", size = 14)) +
  ylim(0, max(advanced_degree_data$County_Count) * 1.15)

ggsave("6_advanced_degree_rate.png", advanced_degree_plot, width = 10, height = 6, dpi = 300)


# 7. YOUNG ADULT BACHELOR'S+ RATE
young_adult_data <- read.csv("7_young_adult_bachelors_plus_rate.csv")

young_adult_data$Young_Adult_Education_Range <- factor(
  young_adult_data$Young_Adult_Education_Range,
  levels = c("Below 20% (Very Low)", "20-24% (Low)", "25-29% (Moderate)",
           "30-39% (High)", "40%+ (Very High)")
)

young_adult_plot <- ggplot(young_adult_data, 
                           aes(x = Young_Adult_Education_Range, y = County_Count)) +
  geom_bar(stat = "identity", fill = "#512888") +
  geom_text(aes(label = County_Count), vjust = -0.5, size = 4) +
  labs(x = "Young Adult (25-34) Bachelor's+ Rate", y = "Number of Counties") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(face = "bold", size = 14)) +
  ylim(0, max(young_adult_data$County_Count) * 1.15)

ggsave("7_young_adult_bachelors_plus_rate.png", young_adult_plot, width = 10, height = 6, dpi = 300)


# 8. STEM EMPLOYMENT RATE
stem_data <- read.csv("8_stem_employment_rate.csv")

stem_data$STEM_Employment_Range <- factor(stem_data$STEM_Employment_Range,
                                          levels = c("Below 1% (Very Low)", "1-1.9% (Low)",
                                                   "2-2.9% (Moderate)", "3-4.9% (High)",
                                                   "5%+ (Very High)"))

stem_plot <- ggplot(stem_data, aes(x = STEM_Employment_Range, y = County_Count)) +
  geom_bar(stat = "identity", fill = "#512888") +
  geom_text(aes(label = County_Count), vjust = -0.5, size = 4) +
  labs(x = "STEM Employment Rate", y = "Number of Counties") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(face = "bold", size = 14)) +
  ylim(0, max(stem_data$County_Count) * 1.15)

ggsave("8_stem_employment_rate.png", stem_plot, width = 10, height = 6, dpi = 300)


# 9. PROFESSIONAL SERVICES RATE
prof_services_data <- read.csv("9_professional_services_rate.csv")

prof_services_data$Professional_Services_Range <- factor(
  prof_services_data$Professional_Services_Range,
  levels = c("Below 2% (Very Low)", "2-2.9% (Low)", "3-3.9% (Moderate)",
           "4-5.9% (High)", "6%+ (Very High)")
)

prof_services_plot <- ggplot(prof_services_data, 
                             aes(x = Professional_Services_Range, y = County_Count)) +
  geom_bar(stat = "identity", fill = "#512888") +
  geom_text(aes(label = County_Count), vjust = -0.5, size = 4) +
  labs(x = "Professional Services Rate", y = "Number of Counties") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(face = "bold", size = 14)) +
  ylim(0, max(prof_services_data$County_Count) * 1.15)

ggsave("9_professional_services_rate.png", prof_services_plot, width = 10, height = 6, dpi = 300)


# 10. LOW-INCOME DIGITAL ACCESS RATE
digital_access_data <- read.csv("10_low_income_digital_access_rate.csv")

digital_access_data$Digital_Access_Range <- factor(
  digital_access_data$Digital_Access_Range,
  levels = c("Below 80% (Low)", "80-99% (Moderate)", "100-119% (High)",
           "120-149% (Very High)", "150%+ (Anomaly)")
)

digital_access_plot <- ggplot(digital_access_data, 
                              aes(x = Digital_Access_Range, y = County_Count)) +
  geom_bar(stat = "identity", fill = "#512888") +
  geom_text(aes(label = County_Count), vjust = -0.5, size = 4) +
  labs(x = "Low-Income Digital Access Rate",
       y = "Number of Counties") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(face = "bold", size = 14)) +
  ylim(0, max(digital_access_data$County_Count) * 1.15)

ggsave("10_low_income_digital_access_rate.png", digital_access_plot, 
       width = 10, height = 6, dpi = 300)


# 11. TOTAL POPULATION - Distribution
population_data <- read.csv("11_total_population.csv")

# Order the ranges
population_data$Population_Range <- factor(population_data$Population_Range,
                                           levels = c("Below 5K (Very Small)", "5K-9K (Small)",
                                                    "10K-24K (Medium)", "25K-49K (Medium-Large)",
                                                    "50K-99K (Large)", "100K+ (Very Large)"))

p1 <- ggplot(population_data, aes(x = Population_Range, y = County_Count)) +
  geom_bar(stat = "identity", fill = "#512888") +
  geom_text(aes(label = County_Count), vjust = -0.5, size = 3.5) +
  labs(
       x = "Population Range",
       y = "Number of Counties") +
  theme(axis.text.x = element_text(angle = 45, hjust = 1),
        plot.title = element_text(face = "bold", size = 12)) +
  ylim(0, max(population_data$County_Count) * 1.15)

ggsave("11_total_population.png", p1, width = 10, height = 6, dpi = 300)
