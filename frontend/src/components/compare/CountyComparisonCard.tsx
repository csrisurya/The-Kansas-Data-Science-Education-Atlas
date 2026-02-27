import type { County } from '../../types/atlas';

interface CountyComparisonCardProps {
  county: County;
  onRemove: () => void;
  colorIndex?: number;
}

/* ── Card color themes (blue, red, green, yellow) ── */
const CARD_THEMES = [
  { bg: '#eff6ff', border: '#bfdbfe', headerBg: '#dbeafe', headerBorder: '#93c5fd', headerText: '#1e3a5f', subText: '#2563eb' },
  { bg: '#fef2f2', border: '#fecaca', headerBg: '#fee2e2', headerBorder: '#fca5a5', headerText: '#7f1d1d', subText: '#dc2626' },
  { bg: '#f0fdf4', border: '#bbf7d0', headerBg: '#dcfce7', headerBorder: '#86efac', headerText: '#14532d', subText: '#16a34a' },
  { bg: '#fefce8', border: '#fef08a', headerBg: '#fef9c3', headerBorder: '#fde047', headerText: '#713f12', subText: '#ca8a04' },
];

/* ── Color helpers ── */

function impactColor(score: number): string {
  if (score > 5) return 'text-green-600';
  if (score >= 1) return 'text-yellow-600';
  return 'text-red-600';
}

function impactBg(score: number): string {
  if (score > 5) return 'bg-green-100 text-green-700';
  if (score >= 1) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function povertyColor(rate: number): string {
  if (rate <= 10) return 'text-green-600';
  if (rate <= 20) return 'text-yellow-600';
  return 'text-red-600';
}

function unemploymentColor(rate: number): string {
  if (rate <= 4) return 'text-green-600';
  if (rate <= 7) return 'text-yellow-600';
  return 'text-red-600';
}

function broadbandColor(index: number): string {
  if (index >= 0.7) return 'text-green-600';
  if (index >= 0.4) return 'text-yellow-600';
  return 'text-red-600';
}

function internetColor(pct: number): string {
  if (pct >= 80) return 'text-green-600';
  if (pct >= 60) return 'text-yellow-600';
  return 'text-red-600';
}

function noInternetColor(pct: number): string {
  if (pct <= 10) return 'text-green-600';
  if (pct <= 25) return 'text-yellow-600';
  return 'text-red-600';
}

/* ── Small reusable pieces ── */

function StatRow({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className={`text-sm font-semibold ${color ?? 'text-gray-800'}`}>{value}</span>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0">
      <span className="text-base">{icon}</span>
      <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h4>
    </div>
  );
}

function Badge({ label, active }: { label: string; active: boolean }) {
  return (
    <span
      className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
        active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
      }`}
    >
      {label}
    </span>
  );
}

/* ── Main Card ── */

const CountyComparisonCard: React.FC<CountyComparisonCardProps> = ({ county, onRemove, colorIndex = 0 }) => {
  const fmt = (n: number) => n.toLocaleString();
  const pct = (n: number) => `${n.toFixed(1)}%`;
  const currency = (n: number) =>
    n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const theme = CARD_THEMES[colorIndex % CARD_THEMES.length];

  const hasDsAi =
    county.four_year_colleges_with_ds_ai > 0 ||
    county.two_year_colleges_with_ds_ai > 0 ||
    county.less_than_two_year_colleges_with_ds_ai > 0;

  return (
    <div
      className="relative flex flex-col rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden"
      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
    >
      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-2 right-2 z-10 rounded-full p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        aria-label={`Remove ${county.county_name}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Header */}
      <div className="px-4 py-3 border-b" style={{ backgroundColor: theme.headerBg, borderColor: theme.headerBorder }}>
        <h3 className="text-lg font-bold pr-6" style={{ color: theme.headerText }}>{county.county_name}</h3>
        <p className="text-xs" style={{ color: theme.subText }}>Population: {fmt(county.county_population)}</p>
      </div>

      <div className="px-4 py-3 flex-1 overflow-y-auto space-y-1 divide-y divide-gray-100">
        {/* 📍 Location */}
        <div className="pb-2">
          <SectionHeader icon="📍" title="Location" />
          <StatRow label="Latitude" value={county.county_latitude.toFixed(4)} />
          <StatRow label="Longitude" value={county.county_longitude.toFixed(4)} />
        </div>

        {/* 🏫 K-12 Schools */}
        <div className="pb-2">
          <SectionHeader icon="🏫" title="K-12 Schools" />
          <StatRow label="Elementary" value={fmt(county.elementary_schools)} />
          <StatRow label="Middle" value={fmt(county.middle_schools)} />
          <StatRow label="High" value={fmt(county.high_schools)} />
          <StatRow label="Virtual" value={fmt(county.virtual_schools)} />
        </div>

        {/* 🎓 Higher Education */}
        <div className="pb-2">
          <SectionHeader icon="🎓" title="Higher Education" />
          <StatRow label="4-Year Colleges" value={fmt(county.four_year_colleges)} />
          <StatRow label="2-Year Colleges" value={fmt(county.two_year_colleges)} />
          <StatRow label="<2-Year Colleges" value={fmt(county.less_than_two_year_colleges)} />
          <div className="mt-1">
            <Badge label={hasDsAi ? 'Has DS/AI Programs' : 'No DS/AI Programs'} active={hasDsAi} />
          </div>
        </div>

        {/* 🤖 DS/AI Programs */}
        <div className="pb-2">
          <SectionHeader icon="🤖" title="DS/AI Programs" />
          <div className="flex items-center justify-between py-1">
            <span className="text-gray-500 text-sm">Impact Score</span>
            <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${impactBg(county.total_program_impact_score)}`}>
              {county.total_program_impact_score.toFixed(1)}
            </span>
          </div>
          <StatRow
            label="Online Impact"
            value={county.online_impact_score.toFixed(1)}
            color={impactColor(county.online_impact_score)}
          />
          <StatRow label="4-Yr w/ DS/AI" value={fmt(county.four_year_colleges_with_ds_ai)} />
          <StatRow label="2-Yr w/ DS/AI" value={fmt(county.two_year_colleges_with_ds_ai)} />
          <StatRow label="<2-Yr w/ DS/AI" value={fmt(county.less_than_two_year_colleges_with_ds_ai)} />
        </div>

        {/* 💰 Economic Indicators */}
        <div className="pb-2">
          <SectionHeader icon="💰" title="Economic Indicators" />
          <StatRow label="Median Income" value={currency(county.median_household_income)} />
          <StatRow
            label="Poverty Rate"
            value={pct(county.poverty_rate)}
            color={povertyColor(county.poverty_rate)}
          />
          <StatRow
            label="Unemployment"
            value={pct(county.unemployment_rate)}
            color={unemploymentColor(county.unemployment_rate)}
          />
        </div>

        {/* 🌐 Digital Access */}
        <div className="pb-1">
          <SectionHeader icon="🌐" title="Digital Access" />
          <StatRow
            label="Broadband Index"
            value={county.broadband_access_index.toFixed(2)}
            color={broadbandColor(county.broadband_access_index)}
          />
          <StatRow
            label="Internet Adoption"
            value={pct(county.internet_adoption_pct)}
            color={internetColor(county.internet_adoption_pct)}
          />
          <StatRow
            label="No Internet"
            value={pct(county.pct_no_internet)}
            color={noInternetColor(county.pct_no_internet)}
          />
        </div>
      </div>
    </div>
  );
};

export default CountyComparisonCard;
