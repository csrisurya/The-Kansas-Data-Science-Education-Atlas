# Install and load required packages
if (!require("pacman")) install.packages("pacman")
pacman::p_load(ggplot2, dplyr, tidyr, forcats, scales, RColorBrewer, 
               gridExtra, ggrepel, viridis, patchwork, sf)

# Set theme
theme_set(theme_minimal(base_size = 12))


# 1. County Name - Simple Card
county_data <- read.csv("1_county_name.csv")
county_summary <- data.frame(
  Total_Counties = county_data$Total_Counties,
  First_County = county_data$First_Alphabetically,
  Last_County = county_data$Last_Alphabetically
)

p22 <- ggplot() +
  annotate("rect", xmin = 0, xmax = 1, ymin = 0.65, ymax = 0.95,
           fill = "#3498DB", alpha = 0.1) +
  annotate("text", x = 0.5, y = 0.85,
           label = county_summary$Total_Counties,
           size = 30, fontface = "bold", color = "#2C3E50") +
  annotate("text", x = 0.5, y = 0.72,
           label = "Total Kansas Counties",
           size = 6, fontface = "bold", color = "gray30") +
  annotate("text", x = 0.25, y = 0.4,
           label = paste0("First:\n", county_summary$First_County),
           size = 4.5, color = "gray50") +
  annotate("text", x = 0.75, y = 0.4,
           label = paste0("Last:\n", county_summary$Last_County),
           size = 4.5, color = "gray50") +
  coord_cartesian(xlim = c(0, 1), ylim = c(0, 1)) +
  theme_void() +
  theme(plot.title = element_text(face = "bold", size = 14, hjust = 0.5,
                                  margin = margin(b = 10)))

ggsave("1_county_name.png", p22, width = 8, height = 5, dpi = 300, bg = "white")


# 2. County Population - Top/Bottom 10 Counties
pop_extremes <- read.csv("2_county_population.csv") %>%
  mutate(County_Name = fct_reorder(County_Name, County_Population))

p23 <- ggplot(pop_extremes, aes(x = County_Population, y = County_Name, fill = Category)) +
  geom_col(alpha = 0.85) +
  geom_text(aes(label = format(County_Population, big.mark = ",")), 
            hjust = -0.1, size = 3) +
  scale_fill_manual(values = c("Top 10" = "#2E86AB", "Bottom 10" = "#E63946")) +
  scale_x_continuous(labels = comma, expand = expansion(mult = c(0, 0.15))) +
  labs(
    x = "County Population",
    y = "County",
  ) +
  theme(
    plot.title = element_text(face = "bold", size = 15),
    plot.subtitle = element_text(color = "gray40", size = 11),
    panel.grid.major.y = element_blank(),
    panel.grid.minor = element_blank(),
    legend.position = "top"
  )

ggsave("2_county_population.png", p23, width = 12, height = 8, dpi = 300, bg = "white")


# 3. Total Online Impact Score - Program Coverage Metrics
coverage_data <- read.csv("3_total_online_impact_score.csv")

coverage_long <- data.frame(
  Category = c("Without Local\nOnline Programs", "With Local\nOnline Programs"),
  Population = c(coverage_data$Pop_Without_Programs, coverage_data$Pop_With_Programs),
  Percentage = c(coverage_data$Pct_Without_Programs, 100 - coverage_data$Pct_Without_Programs)
)

p24 <- ggplot(coverage_long, aes(x = Category, y = Population, fill = Category)) +
  geom_col(alpha = 0.85, width = 0.6) +
  geom_text(aes(label = paste0(format(Population, big.mark = ","), "\n(", 
                                Percentage, "%)")),
            vjust = -0.3, size = 5, fontface = "bold") +
  scale_fill_manual(values = c("#512888", "#512888")) +
  scale_y_continuous(labels = comma, expand = expansion(mult = c(0, 0.15))) +
  labs(
    y = "County Population",
    x = NULL
  ) +
  theme(
    plot.title = element_text(face = "bold", size = 15, hjust = 0.5),
    plot.subtitle = element_text(color = "gray40", size = 11, hjust = 0.5),
    legend.position = "none",
    panel.grid.major.x = element_blank()
  )

ggsave("3_total_online_impact_score.png", p24, width = 10, height = 7, dpi = 300, bg = "white")


# 4. Broadband Access Index - Statistics
# Read pre-calculated broadband statistics from CSV
broadband_data <- read.csv("4_broadband_access_index.csv")

broadband_stats <- data.frame(
  Min = broadband_data$Min_Index,
  Average = broadband_data$Avg_Index,
  Median = broadband_data$Median_Index,
  Max = broadband_data$Max_Index,
  Std_Dev = broadband_data$Std_Dev
)

# Create metric cards - Better positioned layout
p25 <- ggplot() +
  # Top row - 3 main metrics
  annotate("rect", xmin = 0.05, xmax = 0.3, ymin = 0.65, ymax = 0.9,
           fill = "#E8F4F8", color = "#2C3E50", size = 0.5) +
  annotate("text", x = 0.175, y = 0.82, label = broadband_stats$Min,
           size = 10, fontface = "bold", color = "#E74C3C") +
  annotate("text", x = 0.175, y = 0.7, label = "Min Index",
           size = 5, color = "gray30") +
  
  annotate("rect", xmin = 0.375, xmax = 0.625, ymin = 0.65, ymax = 0.9,
           fill = "#E8F4F8", color = "#2C3E50", size = 0.5) +
  annotate("text", x = 0.5, y = 0.82, label = broadband_stats$Average,
           size = 10, fontface = "bold", color = "#3498DB") +
  annotate("text", x = 0.5, y = 0.7, label = "Average Index",
           size = 5, color = "gray30") +
  
  annotate("rect", xmin = 0.7, xmax = 0.95, ymin = 0.65, ymax = 0.9,
           fill = "#E8F4F8", color = "#2C3E50", size = 0.5) +
  annotate("text", x = 0.825, y = 0.82, label = broadband_stats$Median,
           size = 10, fontface = "bold", color = "#9B59B6") +
  annotate("text", x = 0.825, y = 0.7, label = "Median Index",
           size = 5, color = "gray30") +
  
  # Bottom row - 2 additional metrics centered
  annotate("rect", xmin = 0.2, xmax = 0.45, ymin = 0.35, ymax = 0.6,
           fill = "#E8F4F8", color = "#2C3E50", size = 0.5) +
  annotate("text", x = 0.325, y = 0.52, label = broadband_stats$Max,
           size = 10, fontface = "bold", color = "#2ECC71") +
  annotate("text", x = 0.325, y = 0.4, label = "Max Index",
           size = 5, color = "gray30") +
  
  annotate("rect", xmin = 0.55, xmax = 0.8, ymin = 0.35, ymax = 0.6,
           fill = "#FEF5E7", color = "#2C3E50", size = 0.5) +
  annotate("text", x = 0.675, y = 0.52, label = broadband_stats$Std_Dev,
           size = 10, fontface = "bold", color = "#F39C12") +
  annotate("text", x = 0.675, y = 0.4, label = "Standard Deviation",
           size = 5, color = "gray30") +
  
  coord_cartesian(xlim = c(0, 1), ylim = c(0.3, 0.95)) +
  theme_void() +
  theme(
    plot.title = element_text(face = "bold", size = 15, hjust = 0.5, margin = margin(b = 5)),
    plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40", margin = margin(b = 15))
  )

ggsave("4_broadband_access_index.png", p25, width = 12, height = 6, dpi = 300, bg = "white")



# 5. Internet Adoption Percentage - Histogram with Distribution
adoption_data <- read.csv("5_internet_adoption_percentage.csv")

p6 <- ggplot(adoption_data, aes(x = Adoption_Range, y = County_Count)) +
  geom_col(fill = "#512888", color = "white", alpha = 0.8, width = 0.7) +
  geom_text(aes(label = paste0(County_Count, " counties\n(Avg: ", Avg_Adoption, "%)")),
            vjust = -0.5, size = 3.5, fontface = "bold") +
  labs(
       x = "Internet Adoption Range",
       y = "Number of Counties") +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 14, hjust = 0.5),
    plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40"),
    axis.text.x = element_text(angle = 0, hjust = 0.5),
    panel.grid.minor = element_blank()
  )

ggsave("5_internet_adoption_percentage.png", p6, width = 10, height = 6, dpi = 300, bg = "white")


# 6. Average Broadband Coverage Percentage - Bar Chart by Range
coverage_range_data <- read.csv("6_average_broadband_coverage_percentage.csv")

coverage_data <- coverage_range_data %>%
  mutate(Coverage_Range = factor(Coverage_Range, 
                                levels = c("80%+", "70-79%", "60-69%", "Below 60%", "No Data")),
         n = County_Count)

p7 <- ggplot(coverage_data, aes(x = Coverage_Range, y = n, fill = Coverage_Range)) +
  geom_col(fill="#512888") +
  geom_text(aes(label = ifelse(is.na(Avg_Coverage), 
                              paste0(n, " counties"),
                              paste0(n, " counties\n(Avg: ", Avg_Coverage, "%)"))), 
            vjust = -0.5, size = 3.5, fontface = "bold") +
  labs(
       x = "Coverage Range",
       y = "Number of Counties") +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 14, hjust = 0.5),
    plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40"),
    axis.text.x = element_text(angle = 0, hjust = 0.5),
    panel.grid.minor = element_blank()
  )

ggsave("6_average_broadband_coverage_percentage.png", p7, width = 10, height = 6, dpi = 300, bg = "white")


# 7. No Internet Percentage - Bar Chart
no_internet_range_data <- read.csv("7_no_internet_percentage.csv")

no_internet_data <- no_internet_range_data %>%
  mutate(No_Internet_Range = factor(No_Internet_Range,
                                    levels = c("Below 5% (Minimal)", "5-9% (Low)", 
                                              "10-14% (Moderate)", "15-19% (High)", 
                                              "20%+ (Critical)")),
         n = County_Count)

p8 <- ggplot(no_internet_data, aes(x = No_Internet_Range, y = n)) +
  geom_col(fill = "#512888", color = "white", alpha = 0.8, width = 0.7) +
  geom_text(aes(label = paste0(n, " counties")), 
            vjust = -0.5, size = 3.5, fontface = "bold") +
  labs(
       x = "No Internet Range",
       y = "Number of Counties") +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 14, hjust = 0.5),
    plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40"),
    axis.text.x = element_text(angle = 45, hjust = 1),
    panel.grid.minor = element_blank()
  )

ggsave("7_no_internet_percentage.png", p8, width = 10, height = 6, dpi = 300, bg = "white")


# 8. Total Households - Bar Chart
# Read pre-calculated household data from CSV
household_range_data <- read.csv("8_total_households.csv")

# Prepare data for plotting
household_data <- household_range_data %>%
  mutate(Household_Range = factor(Household_Range,
                                  levels = c("100K+ (Urban)", "50K-99K (Suburban)", 
                                            "10K-49K (Small City)", "5K-9K (Town)",
                                            "1K-4K (Small Town)", "Below 1K (Rural)")),
         n = County_Count)

p9 <- ggplot(household_data, aes(x = Household_Range, y = n)) +
  geom_col(fill = "#512888", color = "white", alpha = 0.8, width = 0.7) +
  # Labels for all categories except Small Town
  geom_text(data = subset(household_data, Household_Range != "1K-4K (Small Town)"),
            aes(label = paste0(n, " counties\n(", format(Total_Households_Sum, big.mark = ","), " total households)")), 
            hjust = -0.1, size = 3.2, fontface = "bold", color = "black") +
  # Label for Small Town (inside the bar)
  geom_text(data = subset(household_data, Household_Range == "1K-4K (Small Town)"),
            aes(label = paste0(n, " counties\n(", format(Total_Households_Sum, big.mark = ","), " total households)")), 
            hjust = 1.05, size = 3.2, fontface = "bold", color = "white") +
  coord_flip() +
  labs(
       x = "Household Range",
       y = "Number of Counties") +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 14, hjust = 0.5),
    plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40"),
    panel.grid.minor = element_blank(),
    axis.text.y = element_text(size = 10)
  )

ggsave("8_total_households.png", p9, width = 10, height = 6, dpi = 300, bg = "white")


# 9. Effective Access Score - Bar Chart by Impact Range
# Read pre-calculated effective access data from CSV
effective_access_data <- read.csv("9_effective_access_score.csv")

# Prepare data for plotting
impact_data <- effective_access_data %>%
  mutate(Impact_Range = factor(Impact_Range,
                               levels = c("No Local Programs (0)", "Minimal Impact (>0)", 
                                         "Low Impact (0.5-1.5)", "Moderate Impact (1.5-3)", 
                                         "High Impact (>3)")),
         n = County_Count)

p10 <- ggplot(impact_data, aes(x = Impact_Range, y = n)) +
  geom_col(fill = "#512888", color = "white", alpha = 0.8, width = 0.7) +
  geom_text(aes(label = paste0(n, " counties")), 
            vjust = -0.5, size = 3.5, fontface = "bold") +
  labs(
       x = "Impact Range",
       y = "Number of Counties") +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 14, hjust = 0.5),
    plot.subtitle = element_text(size = 10, hjust = 0.5, color = "gray40"),
    axis.text.x = element_text(angle = 45, hjust = 1),
    panel.grid.minor = element_blank()
  )

ggsave("9_effective_access_score.png", p10, width = 10, height = 6, dpi = 300, bg = "white")
