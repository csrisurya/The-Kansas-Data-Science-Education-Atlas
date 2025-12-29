# Load essential libraries (assuming they are already installed)
library(ggplot2)
library(dplyr)
library(forcats)

# Define color palette
primary_blue <- "#1D3557"
accent_red <- "#E63946"


# 1. SCHOOL NAME - Top 10 Bar Chart
school_data <- read.csv("1_school_name.csv", strip.white = TRUE, blank.lines.skip = TRUE) %>%
  slice_max(order_by = course_count, n = 10) %>%
  mutate(school_name = fct_reorder(school_name, course_count))

p1 <- ggplot(school_data, aes(x = course_count, y = school_name)) +
  geom_col(fill = "#512888") +
  geom_text(aes(label = course_count), 
            hjust = -0.2, 
            size = 4, 
            fontface = "bold") +
  scale_x_continuous(expand = expansion(mult = c(0, 0.15))) +
  labs(
    x = "Number of Courses",
    y = "College Name",
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title = element_text(face = "bold", size = 15),
    plot.subtitle = element_text(color = "gray40"),
    panel.grid.major.y = element_blank(),
    axis.text.y = element_text(face = "bold")
  )

ggsave("1_school_courses.png", p1, width = 10, height = 6, dpi = 300)


# 2. DEGREE NAME - Treemap
degree_data <- read.csv("2_degree_name.csv", strip.white = TRUE, blank.lines.skip = TRUE) %>%
  mutate(percentage = round(course_count / sum(course_count) * 100, 1)) %>%
  mutate(label = paste0(degree_type, "\n", course_count, " courses\n(", 
                        sprintf("%.1f%%", percentage), ")"))

library(treemapify)

p2 <- ggplot(degree_data, aes(area = course_count, fill = degree_type, label = label)) +
  geom_treemap(color = "white", size = 2) +
  geom_treemap_text(
    color = "white",
    place = "centre",
    size = 14,
    fontface = "bold"
  ) +
  scale_fill_manual(values = c(
    "Bachelor" = "#1D3557",
    "Master" = "#457B9D",
    "Associate" = "#A8DADC",
    "Other" = "#F4A261"
  )) +
  theme(
    plot.title = element_text(face = "bold", size = 15, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40"),
    legend.position = "none"
  )

ggsave("2_degree_name.png", p2, width = 10, height = 7, dpi = 300, bg = "white")


# 3. DEPARTMENT NAME - Top Departments Bar Chart
dept_data <- read.csv("3_dept_name.csv", strip.white = TRUE, blank.lines.skip = TRUE) %>%
  slice_max(order_by = course_count, n = 10) %>%
  mutate(dept_name = fct_reorder(dept_name, course_count))

p3 <- ggplot(dept_data, aes(x = course_count, y = dept_name)) +
  geom_col(fill = "#512888", alpha = 0.85) +
  geom_text(aes(label = course_count), hjust = -0.2, size = 3.5, fontface = "bold") +
  scale_x_continuous(expand = expansion(mult = c(0, 0.15))) +
  labs(
    x = "Number of Courses",
    y = "Department Name"
  ) +
  theme(
    plot.title = element_text(face = "bold", size = 15),
    plot.subtitle = element_text(color = "gray40", size = 11),
    panel.grid.major.y = element_blank(),
    panel.grid.minor = element_blank(),
    axis.text.y = element_text(size = 10)
  )

ggsave("3_dept_name.png", p3, width = 10, height = 6, dpi = 300, bg = "white")


# 4. COURSE CODE - Summary Card
course_code_data <- read.csv("4_course_code.csv", strip.white = TRUE, blank.lines.skip = TRUE)

p4 <- ggplot() +
  annotate("rect", xmin = 0, xmax = 1, ymin = 0.6, ymax = 1, 
           fill = primary_blue, alpha = 0.1) +
  annotate("text", x = 0.5, y = 0.85, 
           label = course_code_data$unique_course_codes,
           size = 25, fontface = "bold", color = primary_blue) +
  annotate("text", x = 0.5, y = 0.7, 
           label = "Unique Course Codes",
           size = 6, color = "gray30") +
  annotate("text", x = 0.25, y = 0.35, 
           label = paste0("Min: ", course_code_data$min_code),
           size = 5, color = "gray50") +
  annotate("text", x = 0.75, y = 0.35, 
           label = paste0("Max: ", course_code_data$max_code),
           size = 5, color = "gray50") +
  annotate("segment", x = 0.1, xend = 0.9, y = 0.5, yend = 0.5,
           color = "gray70", size = 0.5) +
  coord_cartesian(xlim = c(0, 1), ylim = c(0, 1)) +
  theme_void() +
  theme(plot.title = element_text(face = "bold", size = 14, hjust = 0.5))

ggsave("4_course_code.png", p4, width = 8, height = 5, dpi = 300, bg = "white")


# 5. Course Name - Word Cloud
# kept the PowerBI version


# 6. DESCRIPTION - Length Analysis Gauge
desc_data <- read.csv("6_description.csv", strip.white = TRUE, blank.lines.skip = TRUE)

p6 <- ggplot() +
  # Background rectangles for ranges
  annotate("rect", xmin = 0, xmax = desc_data$min_desc_length, 
           ymin = 0, ymax = 1, fill = "#d4edda", alpha = 0.5) +
  annotate("rect", xmin = desc_data$min_desc_length, xmax = desc_data$avg_desc_length, 
           ymin = 0, ymax = 1, fill = "#fff3cd", alpha = 0.5) +
  annotate("rect", xmin = desc_data$avg_desc_length, xmax = desc_data$max_desc_length, 
           ymin = 0, ymax = 1, fill = "#f8d7da", alpha = 0.5) +
  # Labels
  annotate("text", x = desc_data$min_desc_length, y = 0.8, 
           label = paste0("Min\n", desc_data$min_desc_length, " chars"),
           size = 4, fontface = "bold", hjust = 0.5) +
  annotate("text", x = desc_data$avg_desc_length, y = 0.5, 
           label = paste0("Average\n", round(desc_data$avg_desc_length, 0), " chars"),
           size = 5, fontface = "bold", hjust = 0.5) +
  annotate("text", x = desc_data$max_desc_length, y = 0.8, 
           label = paste0("Max\n", desc_data$max_desc_length, " chars"),
           size = 4, fontface = "bold", hjust = 0.5) +
  scale_x_continuous(limits = c(0, desc_data$max_desc_length * 1.05)) +
  labs(
    x = "Description Length (characters)",
    y = NULL
  ) +
  theme_minimal() +
  theme(
    plot.title = element_text(face = "bold", size = 15, hjust = 0.5),
    plot.subtitle = element_text(color = "gray40", size = 11, hjust = 0.5),
    axis.text.y = element_blank(),
    axis.ticks.y = element_blank(),
    panel.grid = element_blank()
  )

ggsave("6_description.png", p6, width = 10, height = 4, dpi = 300, bg = "white")


# 7. LEVEL - Donut Chart
level_data <- read.csv("7_level.csv") %>%
  mutate(
    ymax = cumsum(percentage),
    ymin = c(0, head(ymax, n = -1)),
    label_position = (ymax + ymin) / 2,
    label = paste0(level, "\n", course_count, "\n(", sprintf("%.1f%%", percentage), ")")
  )

p7 <- ggplot(level_data, aes(ymax = ymax, ymin = ymin, xmax = 4, xmin = 3, fill = level)) +
  geom_rect() +
  geom_text(aes(x = 3.5, y = label_position, label = label), 
            size = 4, fontface = "bold", color = "white") +
  coord_polar(theta = "y") +
  xlim(c(1, 4)) +
  scale_fill_manual(values = c(
    "Undergraduate" = "#1D3557",
    "Graduate" = "#457B9D",
    "Professional" = "#E63946"
  )) +
  theme_void() +
  theme(
    plot.title = element_text(face = "bold", size = 15, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40"),
    legend.position = "none"
  )

ggsave("7_level.png", p7, width = 8, height = 8, dpi = 300, bg = "white")


# 8. MODALITY - Bar Chart
modality_data <- read.csv("8_modality.csv") %>%
  mutate(modality = fct_reorder(modality, course_count))

p8 <- ggplot(modality_data, aes(x = course_count, y = modality)) +
  geom_col(fill = "#512888", alpha = 0.85, show.legend = FALSE) +
  geom_text(aes(label = paste0(course_count, " (", sprintf("%.1f%%", percentage), ")")), 
            hjust = -0.1, size = 4, fontface = "bold") +
  scale_x_continuous(expand = expansion(mult = c(0, 0.2))) +
  labs(
    x = "Number of Courses",
    y = "Modality"
  ) +
  theme(
    plot.title = element_text(face = "bold", size = 15),
    plot.subtitle = element_text(color = "gray40", size = 11),
    panel.grid.major.y = element_blank(),
    panel.grid.minor = element_blank(),
    axis.text.y = element_text(size = 12, face = "bold")
  )

ggsave("8_modality.png", p8, width = 10, height = 5, dpi = 300, bg = "white")


# 9. COURSE URL - Card Views
url_data <- read.csv("9_course_url.csv", strip.white = TRUE, blank.lines.skip = TRUE) %>%
  mutate(
    total_courses = unique_urls + missing_urls,
    coverage_pct = round(100 * unique_urls / total_courses, 1),
    missing_pct = round(100 * missing_urls / total_courses, 1)
  )

p9 <- ggplot() +
  # URL Available Card
  annotate("rect", xmin = 0.05, xmax = 0.45, ymin = 0.1, ymax = 0.9, 
           fill = "#457B9D", alpha = 0.1, color = "#457B9D", linewidth = 2) +
  annotate("text", x = 0.25, y = 0.7, 
           label = url_data$unique_urls,
           size = 20, fontface = "bold", color = "#457B9D") +
  annotate("text", x = 0.25, y = 0.5, 
           label = "URL Available",
           size = 6, fontface = "bold", color = "#457B9D") +
  annotate("text", x = 0.25, y = 0.3, 
           label = paste0("(", url_data$coverage_pct, "% of courses)"),
           size = 4, color = "gray50") +
  
  # URL Missing Card
  annotate("rect", xmin = 0.55, xmax = 0.95, ymin = 0.1, ymax = 0.9, 
           fill = "#E63946", alpha = 0.1, color = "#E63946", linewidth = 2) +
  annotate("text", x = 0.75, y = 0.7, 
           label = url_data$missing_urls,
           size = 20, fontface = "bold", color = "#E63946") +
  annotate("text", x = 0.75, y = 0.5, 
           label = "URL Missing",
           size = 6, fontface = "bold", color = "#E63946") +
  annotate("text", x = 0.75, y = 0.3, 
           label = paste0("(", url_data$missing_pct, "% of courses)"),
           size = 4, color = "gray50") +
  
  coord_cartesian(xlim = c(0, 1), ylim = c(0, 1)) +
  theme_void() +
  theme(
    plot.title = element_text(face = "bold", size = 15, hjust = 0.5),
    plot.subtitle = element_text(size = 11, hjust = 0.5, color = "gray40")
  )

ggsave("9_course_url.png", p9, width = 10, height = 4, dpi = 300, bg = "white")
