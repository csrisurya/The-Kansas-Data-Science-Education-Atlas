# Load libraries
library(ggplot2)
library(dplyr)
library(readr)
library(forcats)

# 1. School count visualization
df <- read_csv("1_school_name.csv")
school_count <- df$Total_Unique_Schools

ggplot() +
  xlim(0, 1) + ylim(0, 1) +
  annotate("text", x = 0.5, y = 0.6, 
           label = format(school_count, big.mark = ","), 
           size = 24, fontface = "bold") +
  annotate("text", x = 0.5, y = 0.35, 
           label = "Total Number of Kansas K-12 Schools", 
           size = 6, color = "gray30") +
  theme_void() +
  theme(plot.background = element_rect(fill = "white", color = NA))

ggsave("1_school_name.png", width = 6, height = 4, dpi = 300)


# 2. District analysis - Top 10 districts by school count
district_data <- read_csv("2_district.csv") %>%
  slice_max(School_Count, n = 10) %>%
  mutate(District = fct_reorder(District, School_Count))

ggplot(district_data, aes(x = School_Count, y = District)) +
  geom_col(fill = "#512888") +
  geom_text(aes(label = School_Count), hjust = -0.2) +
  labs(x = "Number of Schools", y = "School District") +
  theme_minimal()

ggsave("2_districts.png", width = 10, height = 6, dpi = 300)


# 3. COLLEGE NAME - Total Count Card
df <- read.csv("3_college_name.csv")
college_name <- df$Num_of_Colleges

ggplot() +
  xlim(0, 1) + ylim(0, 1) +
  annotate("text", x = 0.5, y = 0.6, 
           label = format(college_name, big.mark = ","), 
           size = 24, fontface = "bold") +
  annotate("text", x = 0.5, y = 0.35, 
           label = "Total Number of Colleges", 
           size = 6, color = "gray30") +
  theme_void() +
  theme(plot.background = element_rect(fill = "white", color = NA))

ggsave("3_college_name.png", width = 6, height = 4, dpi = 300)


# 4. College type pie chart
college_data <- read_csv("4_college_type.csv") %>%
  mutate(Type = case_when(
    College_Type == 1 ~ "4-Year",
    College_Type == 2 ~ "2-Year", 
    College_Type == 3 ~ "Less Than 2-Year"
  )) %>%
  mutate(Percentage = Count / sum(Count) * 100)

ggplot(college_data, aes(x = "", y = Count, fill = Type)) +
  geom_col() +
  coord_polar("y") +
  geom_text(aes(label = paste0(Count, "\n", round(Percentage, 1), "%")),
            position = position_stack(vjust = 0.5)) +
  theme_void() +
  theme(plot.background = element_rect(fill = "white", color = NA))

ggsave("4_college_type.png", width = 8, height = 6, dpi = 300)


# 5. COUNTY NAME - Top 10 Bar Chart
county_data <- read.csv("5_county_name.csv") %>%
  slice_max(order_by = Num_of_Institutions, n = 10) %>%
  mutate(County_Name = fct_reorder(County_Name, Num_of_Institutions))

p5 <- ggplot(county_data, aes(x = Num_of_Institutions, y = County_Name)) +
  geom_col(fill = "#512888", alpha = 0.8) +
  geom_text(aes(label = Num_of_Institutions), hjust = -0.2, size = 3.5) +
  scale_x_continuous(expand = expansion(mult = c(0, 0.12))) +
  labs(x = "Number of Institutions",
       y = "County") +
  theme(plot.title = element_text(face = "bold", size = 14),
        panel.grid.major.y = element_blank(),
        panel.grid.minor = element_blank())

ggsave("5_county_name.png", p5, width = 10, height = 6, dpi = 300)


# 6. COUNTY POPULATION - Average Card
county_pop <- read.csv("6_county_population.csv")
avg_population <- county_pop$Average_County_Population

ggplot() +
  xlim(0, 1) + ylim(0, 1) +
  annotate("text", x = 0.5, y = 0.6, 
           label = format(avg_population, big.mark = ","), 
           size = 24, fontface = "bold") +
  annotate("text", x = 0.5, y = 0.35, 
           label = "Average County Population", 
           size = 6, color = "gray30") +
  theme_void() +
  theme(plot.background = element_rect(fill = "white", color = NA))

ggsave("6_county_population.png", width = 6, height = 4, dpi = 300)


# 7. Top 10 cities by number of institutions
city_data <- read_csv("7_city.csv") %>%
  slice_max(Num_of_Institutions, n = 10) %>%
  mutate(City = fct_reorder(City, Num_of_Institutions))

ggplot(city_data, aes(x = Num_of_Institutions, y = City)) +
  geom_col(fill = "#512888") +
  geom_text(aes(label = Num_of_Institutions), hjust = -0.2) +
  labs(title = "Top 10 Cities by Number of Institutions",
       x = "Number of Institutions", y = "City") +
  theme_minimal() +
  theme(plot.background = element_rect(fill = "white", color = NA))

ggsave("7_city.png", width = 10, height = 6, dpi = 300)


# 8. CITY POPULATION - Average Card
city_pop <- read.csv("8_city_population.csv")
avg_population <- city_pop$Average_City_Population

ggplot() +
  xlim(0, 1) + ylim(0, 1) +
  annotate("text", x = 0.5, y = 0.6, 
           label = format(avg_population, big.mark = ","), 
           size = 24, fontface = "bold") +
  annotate("text", x = 0.5, y = 0.35, 
           label = "Average City Population", 
           size = 6, color = "gray30") +
  theme_void() +
  theme(plot.background = element_rect(fill = "white", color = NA))

ggsave("8_city_population.png", width = 6, height = 4, dpi = 300)


# 9. ZIP - Top 10 Bar Chart
zip_data <- read.csv("9_zip.csv", colClasses = c("ZIP" = "character")) %>%
  slice_max(order_by = Num_of_Institutions, n = 10, with_ties = FALSE) %>%
  mutate(ZIP = fct_reorder(ZIP, Num_of_Institutions))

p9 <- ggplot(zip_data, aes(x = Num_of_Institutions, y = ZIP)) +
  geom_col(fill = "#512888", alpha = 0.8) +
  geom_text(aes(label = Num_of_Institutions), hjust = -0.2, size = 3.5) +
  scale_x_continuous(expand = expansion(mult = c(0, 0.12))) +
  labs(x = "Number of Institutions",
       y = "ZIP Code") +
  theme(plot.title = element_text(face = "bold", size = 14),
        panel.grid.major.y = element_blank(),
        panel.grid.minor = element_blank())

ggsave("9_zip.png", p9, width = 10, height = 6, dpi = 300)


# 10. ZIP POPULATION - Average Card
zip_pop <- read.csv("10_zip_population.csv")
avg_population <- zip_pop$Average_ZIP_Population

ggplot() +
  xlim(0, 1) + ylim(0, 1) +
  annotate("text", x = 0.5, y = 0.6, 
           label = format(avg_population, big.mark = ","), 
           size = 24, fontface = "bold") +
  annotate("text", x = 0.5, y = 0.35, 
           label = "Average ZIP Population", 
           size = 6, color = "gray30") +
  theme_void() +
  theme(plot.background = element_rect(fill = "white", color = NA))

ggsave("10_zip_population.png", width = 6, height = 4, dpi = 300)
