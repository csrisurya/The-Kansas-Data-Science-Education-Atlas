import React, { useState, useMemo } from 'react';

/* ------------------------------------------------------------------ */
/*  Static data from the research paper (Information Gain ranking)     */
/* ------------------------------------------------------------------ */

interface FeatureEntry {
  feature: string;
  label: string;
  ig: number;
  category: 'institutional' | 'demographic' | 'digital' | 'economic';
}

/*
 * Source: docs/Top Features by Rank
 * WEKA InfoGainAttributeEval → Ranker (evaluated on all 105 training instances)
 */
const FEATURE_DATA: FeatureEntry[] = [
  { feature: 'four_year_colleges',             label: 'Four-Year Colleges',              ig: 0.3096, category: 'institutional' },
  { feature: 'total_households',               label: 'Total Households',                ig: 0.2881, category: 'demographic' },
  { feature: 'county_population',              label: 'County Population',               ig: 0.2881, category: 'demographic' },
  { feature: 'elementary_schools',             label: 'Elementary Schools',              ig: 0.2562, category: 'institutional' },
  { feature: 'effective_access_score',         label: 'Effective Access Score',          ig: 0.2271, category: 'digital' },
  { feature: 'other_schools',                  label: 'Other Schools',                   ig: 0.2163, category: 'institutional' },
  { feature: 'less_than_two_year_colleges',    label: 'Less-Than-Two-Year Colleges',     ig: 0.1951, category: 'institutional' },
  { feature: 'young_adult_bachelors_plus_rate',label: 'Young Adult Bachelor\'s+ Rate',   ig: 0.1847, category: 'economic' },
  { feature: 'high_schools',                   label: 'High Schools',                    ig: 0.1764, category: 'institutional' },
  { feature: 'middle_schools',                 label: 'Middle Schools',                  ig: 0.1762, category: 'institutional' },
  { feature: 'advanced_degree_rate',           label: 'Advanced Degree Rate',            ig: 0.144,  category: 'economic' },
  { feature: 'stem_employment_rate',           label: 'STEM Employment Rate',            ig: 0.1426, category: 'economic' },
  { feature: 'unemployment_rate',              label: 'Unemployment Rate',               ig: 0.1019, category: 'economic' },
  { feature: 'virtual_schools',                label: 'Virtual Schools',                 ig: 0.1003, category: 'institutional' },
  { feature: 'two_year_colleges',              label: 'Two-Year Colleges',               ig: 0.0815, category: 'institutional' },
  { feature: 'county_longitude',               label: 'County Longitude',                ig: 0,      category: 'demographic' },
  { feature: 'county_latitude',                label: 'County Latitude',                 ig: 0,      category: 'demographic' },
  { feature: 'low_income_digital_access_rate', label: 'Low-Income Digital Access Rate',  ig: 0,      category: 'economic' },
  { feature: 'broadband_access_index',         label: 'Broadband Access Index',          ig: 0,      category: 'digital' },
  { feature: 'median_household_income',        label: 'Median Household Income',         ig: 0,      category: 'economic' },
  { feature: 'poverty_rate',                   label: 'Poverty Rate',                    ig: 0,      category: 'economic' },
  { feature: 'pct_no_internet',                label: '% No Internet',                   ig: 0,      category: 'digital' },
  { feature: 'professional_services_rate',     label: 'Professional Services Rate',      ig: 0,      category: 'economic' },
  { feature: 'avg_broadband_coverage_pct',     label: 'Avg Broadband Coverage %',        ig: 0,      category: 'digital' },
  { feature: 'internet_adoption_pct',          label: 'Internet Adoption %',             ig: 0,      category: 'digital' },
];

/* ------------------------------------------------------------------ */
/*  Category styling                                                   */
/* ------------------------------------------------------------------ */

const CATEGORY_META: Record<string, { color: string; bg: string; label: string }> = {
  institutional: { color: '#4f46e5', bg: '#eef2ff', label: 'Institutional' },
  demographic:   { color: '#0891b2', bg: '#ecfeff', label: 'Demographic' },
  digital:       { color: '#059669', bg: '#ecfdf5', label: 'Digital' },
  economic:      { color: '#d97706', bg: '#fffbeb', label: 'Economic' },
};

type CategoryFilter = 'all' | 'institutional' | 'demographic' | 'digital' | 'economic';

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const FeatureImportanceChart: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return FEATURE_DATA;
    return FEATURE_DATA.filter((d) => d.category === activeFilter);
  }, [activeFilter]);

  const maxIG = FEATURE_DATA[0].ig; // global max for consistent scale

  const filters: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'All Features' },
    { key: 'institutional', label: 'Institutional' },
    { key: 'demographic', label: 'Demographic' },
    { key: 'digital', label: 'Digital' },
    { key: 'economic', label: 'Economic' },
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800">
          Feature Importance Ranking
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Information Gain ranking measures how much each county-level feature reduces uncertainty
          when predicting whether a county hosts DS/AI programs. Higher scores indicate stronger
          predictive power. The analysis was performed using WEKA 3.8, an open-source machine learning
          toolkit developed at the University of Waikato. WEKA's InfoGainAttributeEval evaluator was
          applied with the Ranker search method across all 105 training instances to score each of the
          26 predictor features. Institutional features — especially Four-Year Colleges — dominate the
          ranking, while broadband and economic indicators contribute near-zero predictive value.
        </p>
      </div>

      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mt-8 mb-8">
        {filters.map(({ key, label }) => {
          const isActive = activeFilter === key;
          const meta = key !== 'all' ? CATEGORY_META[key] : null;
          return (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 border ${
                isActive
                  ? meta
                    ? `text-white border-transparent`
                    : 'bg-gray-800 text-white border-transparent'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
              style={
                isActive && meta
                  ? { backgroundColor: meta.color, borderColor: meta.color }
                  : undefined
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Lollipop chart – fixed height so switching filters doesn't shrink */}
      <div className="space-y-1.5" style={{ minHeight: `${FEATURE_DATA.length * 36}px` }}>
        {filtered.map((entry, idx) => {
          const pct = (entry.ig / maxIG) * 100;
          const meta = CATEGORY_META[entry.category];
          const isHovered = hoveredIndex === idx;

          return (
            <div
              key={entry.feature}
              className="group flex items-center gap-3 py-1.5 px-2 rounded-lg transition-colors duration-100 hover:bg-gray-50 cursor-default"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Rank number */}
              <span className="w-6 text-right text-xs font-mono text-gray-400 shrink-0">
                {FEATURE_DATA.indexOf(entry) + 1}
              </span>

              {/* Label */}
              <span
                className="w-52 text-sm truncate shrink-0 transition-colors duration-100"
                style={{ color: isHovered ? meta.color : '#374151' }}
                title={entry.label}
              >
                {entry.label}
              </span>

              {/* Stem + dot */}
              <div className="flex-1 flex items-center min-w-0">
                <div className="relative h-5 flex-1">
                  {/* Stem line */}
                  <div
                    className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: meta.color,
                      opacity: isHovered ? 1 : 0.65,
                    }}
                  />
                  {/* Dot */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 rounded-full transition-all duration-300"
                    style={{
                      left: `${pct}%`,
                      transform: `translate(-50%, -50%) scale(${isHovered ? 1.3 : 1})`,
                      width: 10,
                      height: 10,
                      backgroundColor: meta.color,
                      boxShadow: isHovered ? `0 0 0 3px ${meta.bg}` : 'none',
                    }}
                  />
                </div>
              </div>

              {/* Value */}
              <span
                className="w-14 text-right text-xs font-mono shrink-0 transition-colors duration-100"
                style={{ color: isHovered ? meta.color : '#6b7280' }}
              >
                {entry.ig.toFixed(4)}
              </span>

              {/* Category badge */}
              <span
                className="hidden sm:inline-block text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                style={{ backgroundColor: meta.bg, color: meta.color }}
              >
                {meta.label}
              </span>
            </div>
          );
        })}
      </div>


    </section>
  );
};

export default FeatureImportanceChart;
