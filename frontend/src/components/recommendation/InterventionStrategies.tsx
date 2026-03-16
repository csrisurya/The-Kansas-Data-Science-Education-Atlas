import React from 'react';

/* ------------------------------------------------------------------ */
/*  Strategy data                                                      */
/* ------------------------------------------------------------------ */

interface StrategyBullet {
  text: string;
}

interface Strategy {
  icon: string;
  title: string;
  description: string;
  bullets: StrategyBullet[];
  target?: string;
}

const strategies: Strategy[] = [
  {
    icon: '🎓',
    title: 'Faculty Development Programs',
    description:
      'Fellowship stipends for DS/AI specialists committed to underserved institutions, building local expertise where it is needed most.',
    bullets: [
      { text: 'Recruit and retain qualified DS/AI faculty in rural areas' },
      { text: 'Fund professional-development fellowships with service commitments' },
      { text: 'Partner with R1 universities for mentorship pipelines' },
    ],
    target: 'False Positive counties',
  },
  {
    icon: '🤝',
    title: 'Regional Hub Model',
    description:
      'Synchronous online instruction combined with summer intensives, each hub serving 3–5 surrounding counties to maximize reach.',
    bullets: [
      { text: 'Shared resources lower per-county implementation cost' },
      { text: 'Hub institutions anchor live-streamed lectures & labs' },
      { text: 'Summer intensives provide in-person project experience' },
    ],
    target: 'Educational desert counties',
  },
  {
    icon: '🔗',
    title: '2+2 Articulation Agreements',
    description:
      'Guaranteed transfer pathways from community colleges to 4-year universities, ensuring DS/AI course credits carry forward seamlessly.',
    bullets: [
      { text: 'DS/AI course credit transfers without re-evaluation' },
      { text: 'Students complete first 2 years locally, then transfer' },
      { text: 'Reduces cost and geographic barriers for rural learners' },
    ],
    target: 'Counties with 2-year colleges',
  },
  {
    icon: '💻',
    title: 'Stackable Credentials',
    description:
      'Certificate → Associate → Bachelor\u2019s pathway with guaranteed transferability, letting students build credentials at their own pace.',
    bullets: [
      { text: 'Lower financial barriers through modular completion' },
      { text: 'Each credential has standalone workforce value' },
      { text: 'Flexible on/off-ramp design for working adults' },
    ],
    target: 'All underserved counties',
  },
];

/* ------------------------------------------------------------------ */
/*  Strategy Card                                                      */
/* ------------------------------------------------------------------ */

const StrategyCard: React.FC<{ strategy: Strategy }> = ({ strategy }) => (
  <div className="group flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all overflow-hidden">
    {/* Header */}
    <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-gray-50/60 group-hover:bg-indigo-50/40 transition-colors">
      <span className="text-2xl" role="img" aria-label={strategy.title}>
        {strategy.icon}
      </span>
      <h3 className="text-base font-bold text-gray-900 leading-snug">
        {strategy.title}
      </h3>
    </div>

    {/* Body */}
    <div className="flex-1 px-5 py-4 space-y-3">
      <p className="text-sm leading-relaxed text-gray-600">
        {strategy.description}
      </p>

      {/* Target badge (optional) */}
      {strategy.target && (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Target: {strategy.target}
        </span>
      )}
    </div>

  </div>
);

/* ------------------------------------------------------------------ */
/*  Main Section                                                       */
/* ------------------------------------------------------------------ */

const InterventionStrategies: React.FC = () => (
  <section className="space-y-5">
    {/* Heading */}
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center justify-center rounded-lg bg-indigo-100 p-1.5 text-indigo-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.968 7.968 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.953 7.953 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      </span>
      <h2 className="text-lg font-semibold text-gray-900">
        Intervention Strategies
      </h2>
    </div>

    {/* Description */}
    <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-3">
      <p className="text-sm leading-relaxed text-indigo-900">
        Based on the gap analysis and educational desert findings, the following
        evidence-based strategies are recommended to expand DS/AI education
        access across underserved Kansas counties.
      </p>
    </div>

    <div style={{ height: '2rem' }} />

    {/* Strategy cards — 2×2 grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {strategies.map((s) => (
        <StrategyCard key={s.title} strategy={s} />
      ))}
    </div>
  </section>
);

export default InterventionStrategies;
