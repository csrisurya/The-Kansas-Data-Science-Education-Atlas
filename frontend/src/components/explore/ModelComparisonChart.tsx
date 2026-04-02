import React, { useState } from 'react';

/* ------------------------------------------------------------------ */
/*  Static data from the research paper (10-Fold Cross-Validation)     */
/*  Source: Fig. 7 – WEKA 3.8 10-Fold-Cross-Validation results        */
/*  RF values are exact from the paper text.                           */
/*  SVM & NB values are derived from confusion matrix FP counts        */
/*  (SVM FP=1, NB FP=2) and stated Kappa range (0.31–0.68).           */
/* ------------------------------------------------------------------ */

interface ModelMetrics {
  name: string;
  shortName: string;
  color: string;
  hoverColor: string;
  bg: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  kappa: number;
}

const MODELS: ModelMetrics[] = [
  {
    name: 'Random Forest',
    shortName: 'RF',
    color: '#16a34a',
    hoverColor: '#15803d',
    bg: '#f0fdf4',
    accuracy: 0.91,
    precision: 0.91,
    recall: 0.91,
    f1: 0.91,
    kappa: 0.68,
  },
  {
    name: 'Support Vector Machine',
    shortName: 'SVM',
    color: '#2563eb',
    hoverColor: '#1d4ed8',
    bg: '#eff6ff',
    accuracy: 0.87,
    precision: 0.86,
    recall: 0.87,
    f1: 0.83,
    kappa: 0.31,
  },
  {
    name: 'Naive Bayes',
    shortName: 'NB',
    color: '#d97706',
    hoverColor: '#b45309',
    bg: '#fffbeb',
    accuracy: 0.90,
    precision: 0.90,
    recall: 0.91,
    f1: 0.90,
    kappa: 0.59,
  },
];

const ZEROR_ACCURACY = 0.8381;

type MetricKey = 'accuracy' | 'precision' | 'recall' | 'f1' | 'kappa';

interface MetricDef {
  key: MetricKey;
  label: string;
  fullLabel: string;
  showZeroR: boolean;
}

const METRICS: MetricDef[] = [
  { key: 'accuracy',  label: 'Accuracy',  fullLabel: 'Correctly Classified Instances', showZeroR: true },
  { key: 'precision', label: 'Precision', fullLabel: 'Weighted Avg Precision',         showZeroR: false },
  { key: 'recall',    label: 'Recall',    fullLabel: 'Weighted Avg Recall',             showZeroR: false },
  { key: 'f1',        label: 'F1-Score',  fullLabel: 'Weighted Avg F1-Score',           showZeroR: false },
  { key: 'kappa',     label: 'Kappa',     fullLabel: "Cohen's Kappa Statistic",         showZeroR: false },
];

/* Chart dimensions */
const CHART_HEIGHT = 350;
const Y_TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
const BAR_WIDTH = 56;
const GROUP_GAP = 72;
const BAR_GAP = 6;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ModelComparisonChart: React.FC = () => {
  const [hoveredBar, setHoveredBar] = useState<{ metric: MetricKey; model: string } | null>(null);

  const visibleMetrics = METRICS;

  /* Compute total SVG width based on visible metrics + ZeroR bar */
  const groupWidth = MODELS.length * BAR_WIDTH + (MODELS.length - 1) * BAR_GAP;
  const zeroRBarWidth = BAR_WIDTH;
  const metricsWidth = visibleMetrics.length * groupWidth + (visibleMetrics.length - 1) * GROUP_GAP;
  const totalWidth = metricsWidth + GROUP_GAP + zeroRBarWidth;
  const yAxisWidth = 40;
  const paddingRight = 16;
  const svgWidth = yAxisWidth + totalWidth + paddingRight;
  const labelAreaHeight = 50;
  const valueAreaHeight = 20;
  const svgHeight = CHART_HEIGHT + labelAreaHeight + valueAreaHeight;

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-gray-800">
          Machine Learning Model Comparison
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Three classifiers — Random Forest, Support Vector Machine, and Naive Bayes — were trained
          and evaluated in WEKA 3.8, an open-source machine learning toolkit, using 10-fold
          cross-validation on the binary target variable (Has Programs) with 26 county-level predictors
          across all 105 Kansas counties. Performance was measured by accuracy, precision, recall,
          F1-score, and Cohen's Kappa.
        </p>
      </div>

      {/* Model legend pills */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {MODELS.map((m) => (
          <div key={m.shortName} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: m.color }}
            />
            <span className="text-sm text-gray-700 font-medium">{m.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-2">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#ef4444' }} />
          <span className="text-sm text-gray-500">ZeroR Baseline (83.81%)</span>
        </div>
      </div>

      {/* Chart + info layout */}
      <div className="flex flex-col gap-6 w-full">
      {/* Vertical grouped bar chart (SVG) */}
      <div className="overflow-x-auto w-full">
        <svg
          width="100%"
          height={svgHeight}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="select-none"
        >
          {/* Y-axis gridlines & tick labels */}
          {Y_TICKS.map((tick) => {
            const y = CHART_HEIGHT - tick * CHART_HEIGHT;
            return (
              <g key={tick}>
                <line
                  x1={yAxisWidth}
                  y1={y}
                  x2={yAxisWidth + totalWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                  strokeDasharray={tick === 0 ? undefined : '4 3'}
                />
                <text
                  x={yAxisWidth - 6}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[11px] font-mono"
                  fill="#9ca3af"
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* ZeroR bar group — single bar to the right of all metric groups */}
          {(() => {
            const zeroRX = yAxisWidth + metricsWidth + GROUP_GAP;
            const barH = ZEROR_ACCURACY * CHART_HEIGHT;
            const barY = CHART_HEIGHT - barH;
            const isHovered =
              hoveredBar?.metric === ('zeror' as MetricKey) &&
              hoveredBar?.model === 'ZeroR';
            return (
              <g
                onMouseEnter={() =>
                  setHoveredBar({ metric: 'zeror' as MetricKey, model: 'ZeroR' })
                }
                onMouseLeave={() => setHoveredBar(null)}
                style={{ cursor: 'default' }}
              >
                <rect
                  x={zeroRX}
                  y={barY}
                  width={zeroRBarWidth}
                  height={barH}
                  rx={3}
                  fill={isHovered ? '#dc2626' : '#ef4444'}
                  opacity={0.85}
                  className="transition-all duration-200"
                />
                <text
                  x={zeroRX + zeroRBarWidth / 2}
                  y={barY - 6}
                  textAnchor="middle"
                  fill={isHovered ? '#dc2626' : '#6b7280'}
                  className="text-[11px] font-mono font-bold transition-all duration-150"
                >
                  {ZEROR_ACCURACY.toFixed(2)}
                </text>
                <text
                  x={zeroRX + zeroRBarWidth / 2}
                  y={CHART_HEIGHT + 20}
                  textAnchor="middle"
                  fill="#ef4444"
                  className="text-[12px] font-semibold"
                >
                  ZeroR
                </text>
              </g>
            );
          })()}

          {/* Metric groups */}
          {visibleMetrics.map((metric, gi) => {
            const groupX = yAxisWidth + gi * (groupWidth + GROUP_GAP);
            const isHoveredMetric = hoveredBar?.metric === metric.key;

            return (
              <g key={metric.key}>
                {/* Bars */}
                {MODELS.map((model, bi) => {
                  const value = model[metric.key];
                  const barH = value * CHART_HEIGHT;
                  const barX = groupX + bi * (BAR_WIDTH + BAR_GAP);
                  const barY = CHART_HEIGHT - barH;
                  const isHovered =
                    hoveredBar?.metric === metric.key &&
                    hoveredBar?.model === model.shortName;

                  return (
                    <g
                      key={model.shortName}
                      onMouseEnter={() =>
                        setHoveredBar({ metric: metric.key, model: model.shortName })
                      }
                      onMouseLeave={() => setHoveredBar(null)}
                      style={{ cursor: 'default' }}
                    >
                      {/* Bar */}
                      <rect
                        x={barX}
                        y={barY}
                        width={BAR_WIDTH}
                        height={barH}
                        rx={3}
                        fill={isHovered ? model.hoverColor : model.color}
                        opacity={isHoveredMetric && !isHovered ? 0.35 : 0.85}
                        className="transition-all duration-200"
                      />

                      {/* Value above bar */}
                      <text
                        x={barX + BAR_WIDTH / 2}
                        y={barY - 6}
                        textAnchor="middle"
                        fill={isHovered ? model.hoverColor : '#6b7280'}
                        className="text-[11px] font-mono font-bold transition-all duration-150"
                        opacity={isHovered || !isHoveredMetric ? 1 : 0.4}
                      >
                        {value.toFixed(2)}
                      </text>
                    </g>
                  );
                })}

                {/* Metric label below group */}
                <text
                  x={groupX + groupWidth / 2}
                  y={CHART_HEIGHT + 20}
                  textAnchor="middle"
                  fill="#374151"
                  className="text-[12px] font-semibold"
                >
                  {metric.label}
                </text>
              </g>
            );
          })}

          {/* Y-axis line */}
          <line
            x1={yAxisWidth}
            y1={0}
            x2={yAxisWidth}
            y2={CHART_HEIGHT}
            stroke="#d1d5db"
            strokeWidth={1}
          />
        </svg>
      </div>

      {/* ZeroR + Key finding underneath chart */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* ZeroR explanation note */}
        <div className="rounded-lg border border-gray-200 bg-gray-50/60 px-4 py-3">
          <p className="text-xs leading-relaxed text-gray-600">
            <span className="font-semibold text-gray-700">ZeroR Baseline:</span>{' '}
            A majority-class classifier that predicts all 105 counties as having no
            Data Science/Artificial Intelligence programs, achieving 83.81% accuracy but missing all 17
            program-hosting counties (0% True Positive Rate). All three trained
            models substantially exceed this baseline, confirming they learn
            meaningful patterns beyond simple majority-class prediction.
          </p>
        </div>

        {/* Key insight */}
        <div className="rounded-lg border border-green-200 bg-green-50/60 px-4 py-3">
          <p className="text-xs leading-relaxed text-green-800">
            <span className="font-semibold">Key finding:</span>{' '}
            Random Forest achieved the strongest overall performance with the
            highest accuracy (0.91), F1-Score (0.91), and Kappa (0.68). Its
            superior Kappa indicates the best agreement beyond chance, effectively
            identifying minority-class (program-hosting) counties despite class
            imbalance (17 vs 88).
          </p>
        </div>
      </div>
      </div>
    </section>
  );
};

export default ModelComparisonChart;
