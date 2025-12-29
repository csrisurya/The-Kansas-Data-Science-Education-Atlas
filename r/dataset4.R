
# Install and load required packages
if (!require("pacman")) install.packages("pacman")
pacman::p_load(ggplot2, dplyr, sf, rnaturalearth, rnaturalearthdata, 
               viridis, scales, akima, metR, ggrepel)

# Read Dataset 2 v2
dataset2_v2 <- read.csv("dataset4.csv")

p_enhanced <- ggplot() +
  # Background gradient (optional aesthetic enhancement)
  geom_rect(aes(xmin = -102.1, xmax = -94.6, ymin = 36.9, ymax = 40.1),
            fill = "#f8f9fa", alpha = 0.3) +
  # Interpolated heat layer
  geom_raster(data = interp_df, 
              aes(x = longitude, y = latitude, fill = impact_score),
              interpolate = TRUE, alpha = 0.85) +
  # Smooth contour lines
  metR::geom_contour_fill(data = interp_df,
                          aes(x = longitude, y = latitude, z = impact_score),
                          alpha = 0.7) +
  metR::geom_contour2(data = interp_df,
                      aes(x = longitude, y = latitude, z = impact_score),
                      color = "white", alpha = 0.4, size = 0.4) +
  # State boundary
  geom_path(data = kansas_bbox,
            aes(x = longitude, y = latitude),
            color = "gray20", size = 1.2) +
  # College locations
  geom_point(data = dataset2_v2,
             aes(x = longitude, y = latitude, size = impact_score),
             color = "white", fill = "#2c3e50", 
             shape = 21, stroke = 1.5, alpha = 0.8) +
  # Top 3 labels with custom styling
  geom_label_repel(
    data = dataset2_v2 %>% 
      slice_max(order_by = impact_score, n = 3) %>%
      mutate(rank = row_number(),
             label_text = paste0(rank, ". ", school_name, 
                               "\n", CITY,
                               "\nScore: ", round(impact_score, 1))),
    aes(x = longitude, y = latitude, label = label_text),
    size = 3.5,
    fontface = "bold",
    fill = alpha("white", 0.95),
    color = "#2c3e50",
    box.padding = 1,
    point.padding = 0.5,
    segment.color = "#34495e",
    segment.size = 0.8,
    min.segment.length = 0,
    max.overlaps = 20,
    force = 5
  ) +
  # Color scale - Enhanced red gradient with minimal blue for dramatic hotspot emphasis
  scale_fill_gradientn(
    colors = c("#08519C", "#6BAED6", "#FFFFFF", "#FEE5D9", "#FCBBA1", "#FC9272", 
               "#FB6A4A", "#EF3B2C", "#DE2D26", "#CB181D", "#A50F15", "#67000D"),
    name = "Impact\nScore",
    na.value = "transparent",
    guide = guide_colorbar(
      barwidth = 2,
      barheight = 18,
      title.position = "top",
      title.hjust = 0.5,
      frame.colour = "gray30",
      ticks.colour = "gray30"
    )
  ) +
  scale_size_continuous(range = c(3, 10), guide = "none") +
  coord_fixed(ratio = 1.3, xlim = c(-102.1, -94.6), ylim = c(36.9, 40.1)) +
  labs(
    x = "Longitude",
    y = "Latitude",
  ) +
  theme_minimal(base_size = 12) +
  theme(
    plot.title = element_text(face = "bold", size = 17, hjust = 0.5, 
                              margin = margin(b = 5)),
    plot.subtitle = element_text(size = 12, hjust = 0.5, color = "gray40", 
                                 margin = margin(b = 15)),
    plot.caption = element_text(size = 8, color = "gray50", hjust = 0, 
                               margin = margin(t = 15), lineheight = 1.2),
    legend.position = "right",
    legend.title = element_text(face = "bold", size = 12),
    legend.text = element_text(size = 10),
    panel.grid.minor = element_blank(),
    panel.grid.major = element_line(color = "gray85", size = 0.25),
    plot.background = element_rect(fill = "white", color = NA),
    panel.background = element_rect(fill = "#f8f9fa", color = NA),
    plot.margin = margin(20, 20, 20, 20)
  )

ggsave("dataset4.png", p_enhanced, 
       width = 14, height = 10, dpi = 300, bg = "white")
