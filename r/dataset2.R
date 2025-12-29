library(ggplot2)
library(dplyr)
library(tidyr)
library(forcats)
library(scales)
library(readr)

# Define a color for the new categories
NEW_COLORS <- c("Less Than 2-Year College" = "#6E2C00", # Dark Brown/Maroon
                "Virtual School" = "#A0C4FF", # Very Light Blue (distinct from K-12)
                "Other School" = "#808B96")   # Gray (Neutral)

# Read Dataset
dataset_v2 <- read_csv("dataset2.csv", show_col_types = FALSE)

# --- Updated Aggregation (Includes all 8 categories) ---
county_pipeline <- dataset_v2 %>%
  group_by(County_Name) %>%
  summarise(
    # K-12 Counts: Use SUM()
    Elementary = sum(Elementary_Schools, na.rm = TRUE),
    Middle = sum(Middle_Schools, na.rm = TRUE),
    High = sum(High_Schools, na.rm = TRUE),
    
    # Colleges & Specialized: Use MAX() to prevent double-counting
    `2-Year College` = max(Two_Year_Colleges, na.rm = TRUE),
    `4-Year College` = max(Four_Year_Or_Above_Colleges, na.rm = TRUE),
    `Virtual School` = max(Virtual_Schools, na.rm = TRUE), # NEW
    `Other School` = max(Other_Schools, na.rm = TRUE),     # NEW
    `Less Than 2-Year College` = max(Less_Than_Two_Year_Colleges, na.rm = TRUE), # NEW
    
    County_Population = max(County_Population, na.rm = TRUE),
    .groups = 'drop'
  ) %>%
  # Calculate Total for Ranking (Updated to include all 8)
  mutate(Total_Institutions = Elementary + Middle + High + 
         `2-Year College` + `4-Year College` + `Virtual School` + 
         `Other School` + `Less Than 2-Year College`) %>%
  # Get top 10 counties
  slice_max(order_by = Total_Institutions, n = 10, with_ties = FALSE) %>%
  # Reshape to long format for stacking
  pivot_longer(
    cols = c(Elementary, Middle, High, `2-Year College`, `4-Year College`,
             `Virtual School`, `Other School`, `Less Than 2-Year College`), # UPDATED COLS
    names_to = "Education_Level",
    values_to = "Count"
  ) %>%
  # Order factors for plot appearance (Updated levels)
  mutate(Education_Level = factor(Education_Level, 
                                  levels = c("Elementary", "Middle", "High", 
                                           "Virtual School", "Other School", # New K-12 Additions
                                           "Less Than 2-Year College", # New College Addition
                                           "2-Year College", "4-Year College")),
         County_Name = fct_reorder(County_Name, Count, sum))

# --- Visualization (Updated Colors and Caption) ---
p <- ggplot(county_pipeline, aes(x = Count, y = County_Name, fill = Education_Level)) +
  geom_col(position = "stack", alpha = 0.9) +
  scale_fill_manual(
    values = c(
      # K-12 Group
      "Elementary" = "#4A90E2", "Middle" = "#357ABD", "High" = "#1E4D7B", 
      # Higher Ed Group
      "2-Year College" = "#F39C12", "4-Year College" = "#E74C3C", 
      # New Categories
      NEW_COLORS
    ),
    name = "Education Level"
  ) +
  geom_text(
    data = county_pipeline %>% group_by(County_Name) %>% summarise(Total = sum(Count), .groups = 'drop'),
    aes(x = Total, y = County_Name, label = Total, fill = NULL),
    hjust = -0.2, size = 3.5, fontface = "bold"
  ) +
  scale_x_continuous(expand = expansion(mult = c(0, 0.1)), breaks = pretty_breaks(n = 6)) +
  labs(
    x = "Number of Institutions", y = "County Name"
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title = element_text(face = "bold", hjust = 0.5), 
    plot.caption = element_text(size = 9, color = "gray50", hjust = 0),
    legend.position = "right", legend.title = element_text(face = "bold", size = 11),
    panel.grid.major.y = element_blank(), panel.grid.minor = element_blank(),
    axis.text.y = element_text(size = 11, face = "bold")
  )

# Save the plot
ggsave("dataset2.png", p, width = 12, height = 7, dpi = 300, bg = "white")
