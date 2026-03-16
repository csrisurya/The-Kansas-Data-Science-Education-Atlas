import React from 'react';
import type { County } from '../../types/atlas';

interface FalsePositiveCardProps {
  county: County;
  onViewDetails?: (county: County) => void;
}

/* ── Helpers ── */

const currency = (n: number) =>
  n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

const fmt = (n: number) => n.toLocaleString();

/* ── Icons ── */

function OpportunityIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Lightbulb – representing opportunity / bright idea */}
      <path d="M9 21h6" />
      <path d="M10 21v-1a2 2 0 0 1 .586-1.414A5 5 0 1 0 7 13a4.978 4.978 0 0 0 3.414 4.586A2 2 0 0 1 10 19v1" />
      <path d="M14 21v-1a2 2 0 0 0-.586-1.414A5 5 0 1 1 17 13a4.978 4.978 0 0 1-3.414 4.586A2 2 0 0 0 14 19v1" />
      <path d="M12 3v1" />
      <path d="M18.36 5.64l-.71.71" />
      <path d="M21 12h-1" />
      <path d="M4 12H3" />
      <path d="M6.34 6.34l-.7-.7" />
    </svg>
  );
}

function DollarIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v1.316a4.003 4.003 0 0 0-2.97 2.594.75.75 0 0 0 1.44.422A2.5 2.5 0 0 1 10.5 5.5h.412a2.088 2.088 0 0 1 .588 4.09L8.91 10.56A4.003 4.003 0 0 0 7.25 14h-.5a.75.75 0 0 0 0 1.5h.5c.088 0 .175-.003.261-.009l-.011.016v1.743a.75.75 0 0 0 1.5 0v-1.316a4.003 4.003 0 0 0 2.97-2.594.75.75 0 0 0-1.44-.422A2.5 2.5 0 0 1 7.912 14.5H7.5a2.088 2.088 0 0 1-.588-4.09l2.59-.97A4.003 4.003 0 0 0 12.75 6h.5a.75.75 0 0 0 0-1.5h-.5c-.088 0-.175.003-.261.009l.011-.016V2.75Z" />
    </svg>
  );
}

/* ── Badge ── */

function CollegeBadge({ label, present }: { label: string; present: boolean }) {
  if (!present) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3 w-3"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      {label}
    </span>
  );
}

/* ── Main Card ── */

const FalsePositiveCard: React.FC<FalsePositiveCardProps> = ({
  county,
  onViewDetails,
}) => {
  const has2Year = county.two_year_colleges > 0;
  const has4Year = county.four_year_colleges > 0;

  return (
    <div className="relative flex flex-col rounded-xl border-2 border-purple-300 bg-purple-50/40 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* ── Header ── */}
      <div className="flex items-start gap-3 bg-purple-100/60 border-b border-purple-200 px-4 py-3">
        <div className="mt-0.5 shrink-0 rounded-lg bg-purple-200/70 p-1.5 text-purple-700">
          <OpportunityIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-purple-900 truncate">
            {county.county_name}
          </h3>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 px-4 py-3 space-y-3">
        {/* Key stats */}
        <div className="grid grid-cols-2 gap-3">
          {/* Population */}
          <div className="rounded-lg bg-white/70 border border-purple-100 px-3 py-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
              Population
            </p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {fmt(county.county_population)}
            </p>
          </div>

          {/* Median Income */}
          <div className="rounded-lg bg-white/70 border border-purple-100 px-3 py-2">
            <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-gray-500">
              <DollarIcon className="h-3 w-3 text-purple-600" />
              Median Income
            </p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {currency(county.median_household_income)}
            </p>
          </div>
        </div>

        {/* College badges */}
        {(has2Year || has4Year) && (
          <div className="flex flex-wrap gap-1.5">
            <CollegeBadge label="Has 2-Year College" present={has2Year} />
            <CollegeBadge label="Has 4-Year College" present={has4Year} />
          </div>
        )}

      </div>

      {/* ── Footer ── */}
      <div className="border-t border-purple-100 px-4 py-3">
        <button
          type="button"
          onClick={() => onViewDetails?.(county)}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700 shadow-sm hover:bg-purple-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path
              fillRule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
              clipRule="evenodd"
            />
          </svg>
          View Details
        </button>
      </div>
    </div>
  );
};

export default FalsePositiveCard;
