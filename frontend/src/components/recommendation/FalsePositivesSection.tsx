import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import type { County } from '../../types/atlas';
import FalsePositiveCard from './FalsePositiveCard';

const MAX_DISPLAY = 4;

const FalsePositivesSection: React.FC = () => {
  const [detailCounty, setDetailCounty] = useState<County | null>(null);

  const {
    data: gapData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['gap-analysis'],
    queryFn: () => apiService.getGapAnalysis(),
    staleTime: 5 * 60 * 1000,
  });

  const falsePositives: County[] = (gapData?.false_positives ?? [])
    .slice(0, MAX_DISPLAY)
    .map((c) => ({
      ...c,
      has_programs: Boolean(c.has_programs),
    })) as unknown as County[];

  /* ── Loading state ── */
  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-7 w-72 rounded bg-gray-200" />
          <div className="h-4 w-96 rounded bg-gray-100" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {Array.from({ length: MAX_DISPLAY }).map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ── Error state ── */
  if (isError) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 px-6 py-5">
        <p className="font-semibold text-red-700">Failed to load gap-analysis data</p>
        <p className="mt-1 text-sm text-red-500">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </section>
    );
  }

  /* ── Empty state ── */
  if (falsePositives.length === 0) {
    return (
      <section className="rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 text-center">
        <p className="text-gray-500">No priority intervention counties identified.</p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      {/* ── Heading ── */}
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Priority Intervention Counties
          </h2>
        </div>
      </div>

      {/* ── Stakeholder description ── */}
      <div className="rounded-lg border border-purple-200 bg-purple-50/60 px-4 py-3">
        <p className="text-sm leading-relaxed text-purple-900">
          <span className="font-semibold">Stakeholder view:</span>{' '}
          Based on each county's population, income levels, school infrastructure, and
          internet connectivity, our model expected these four counties to already offer
          Data Science / AI programs — yet none exist today. They represent the strongest
          candidates for new program investment.
        </p>
      </div>

      <div style={{ height: '2rem' }} />

      {/* ── Cards grid (4 across) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {falsePositives.map((county) => (
          <FalsePositiveCard
            key={county.id}
            county={county}
            onViewDetails={setDetailCounty}
          />
        ))}
      </div>

      <div style={{ height: '2rem' }} />

      {/* ── Technical description (after cards) ── */}
      <div className="rounded-lg border border-gray-200 bg-gray-50/60 px-4 py-3">
        <p className="text-xs leading-relaxed text-gray-600">
          <span className="font-semibold text-gray-700">Methodology:</span>{' '}
          These counties were identified by using Claude Opus 4.6 (Anthropic) to replicate
          the paper's WEKA 3.8 Random Forest model (maxDepth=5, 50 trees, seed=42) with
          10-fold cross-validation on 26 county-level features. During cross-validation,
          these four counties were predicted to have DS/AI programs based on their
          socioeconomic, educational, and digital-access profiles — but currently have none.
        </p>
      </div>

      {/* ── County detail modal ── */}
      {detailCounty && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setDetailCounty(null)}
        >
          <div
            className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setDetailCounty(null)}
              className="absolute top-3 right-3 rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Modal header */}
            <div className="border-b border-purple-200 bg-purple-50 px-6 py-4 rounded-t-2xl">
              <h3 className="text-lg font-bold text-purple-900">
                {detailCounty.county_name}
              </h3>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4 space-y-4 text-sm">
              {/* Demographics */}
              <div>
                <h4 className="font-semibold text-gray-700 uppercase text-xs tracking-wide mb-2">
                  Demographics
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <DetailRow label="Population" value={detailCounty.county_population.toLocaleString()} />
                  <DetailRow
                    label="Median Income"
                    value={detailCounty.median_household_income.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD',
                      maximumFractionDigits: 0,
                    })}
                  />
                  <DetailRow label="Poverty Rate" value={`${(detailCounty.poverty_rate * 100).toFixed(1)}%`} />
                  <DetailRow label="Unemployment" value={`${(detailCounty.unemployment_rate * 100).toFixed(1)}%`} />
                  <DetailRow label="Total Households" value={detailCounty.total_households.toLocaleString()} />
                </div>
              </div>

              {/* Education */}
              <div>
                <h4 className="font-semibold text-gray-700 uppercase text-xs tracking-wide mb-2">
                  Education Infrastructure
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <DetailRow label="4-Year Colleges" value={detailCounty.four_year_colleges} />
                  <DetailRow label="2-Year Colleges" value={detailCounty.two_year_colleges} />
                  <DetailRow label="Elementary Schools" value={detailCounty.elementary_schools} />
                  <DetailRow label="Middle Schools" value={detailCounty.middle_schools} />
                  <DetailRow label="High Schools" value={detailCounty.high_schools} />
                  <DetailRow label="Virtual Schools" value={detailCounty.virtual_schools} />
                </div>
              </div>

              {/* Digital access */}
              <div>
                <h4 className="font-semibold text-gray-700 uppercase text-xs tracking-wide mb-2">
                  Digital Access
                </h4>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                  <DetailRow label="Broadband Index" value={detailCounty.broadband_access_index?.toFixed(2) ?? '—'} />
                  <DetailRow label="Internet Adoption" value={`${detailCounty.internet_adoption_pct?.toFixed(1) ?? '—'}%`} />
                  <DetailRow label="No Internet" value={`${detailCounty.pct_no_internet?.toFixed(1) ?? '—'}%`} />
                </div>
              </div>

              {/* Recommendation */}
              <div className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3">
                <p className="font-medium text-purple-900">
                  Recommendation
                </p>
                <p className="mt-1 text-purple-800 leading-relaxed">
                  {detailCounty.county_name} has existing higher-education infrastructure
                  ({detailCounty.four_year_colleges > 0 ? `${detailCounty.four_year_colleges} four-year` : ''}
                  {detailCounty.four_year_colleges > 0 && detailCounty.two_year_colleges > 0 ? ' and ' : ''}
                  {detailCounty.two_year_colleges > 0 ? `${detailCounty.two_year_colleges} two-year` : ''} college
                  {(detailCounty.four_year_colleges + detailCounty.two_year_colleges) > 1 ? 's' : ''})
                  but no DS/AI programs. With a population of{' '}
                  {detailCounty.county_population.toLocaleString()}, it represents a
                  high-leverage opportunity for program expansion.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

/* ── Small helper for the detail modal ── */

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

export default FalsePositivesSection;
