import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import FilterPanel, { EMPTY_FILTERS } from '../components/search/FilterPanel';
import type { FilterState } from '../components/search/FilterPanel';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import QuickInsights from '../components/search/QuickInsights';
import { apiService } from '../services/api';
import type { Course } from '../types/atlas';

const PAGE_SIZE = 20;

/* ------------------------------------------------------------------ */
/*  URL ↔ state helpers                                                */
/* ------------------------------------------------------------------ */

function filtersFromParams(params: URLSearchParams): FilterState {
  const institutionType = params.get('institution')?.split(',').filter(Boolean) ?? [];
  const degreeLevel = params.get('level')?.split(',').filter(Boolean) ?? [];
  const modality = params.get('modality')?.split(',').filter(Boolean) ?? [];
  const county = params.get('county') || null;
  return { institutionType, degreeLevel, modality, county };
}

function filtersToParams(filters: FilterState): Record<string, string> {
  const out: Record<string, string> = {};
  if (filters.institutionType.length) out.institution = filters.institutionType.join(',');
  if (filters.degreeLevel.length) out.level = filters.degreeLevel.join(',');
  if (filters.modality.length) out.modality = filters.modality.join(',');
  if (filters.county !== null) out.county = String(filters.county);
  return out;
}

/* ------------------------------------------------------------------ */
/*  SearchPage                                                         */
/* ------------------------------------------------------------------ */

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  /* Initialise state from URL on first render */
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') ?? '');
  const [filters, setFilters] = useState<FilterState>(() => filtersFromParams(searchParams));
  const [page, setPage] = useState(1);

  /* ---- Sync state → URL (runs after every state change) ---- */
  useEffect(() => {
    const next: Record<string, string> = {};
    if (searchQuery) next.q = searchQuery;
    Object.assign(next, filtersToParams(filters));
    // Replace (not push) to avoid flooding history on every keystroke
    setSearchParams(next, { replace: true });
  }, [searchQuery, filters, setSearchParams]);

  /* Determine whether the user has actively searched or filtered */
  const hasActiveSearch = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      filters.institutionType.length > 0 ||
      filters.degreeLevel.length > 0 ||
      filters.modality.length > 0 ||
      filters.county !== null
    );
  }, [searchQuery, filters]);

  /* Build API params from search + filters */
  const apiParams = useMemo(() => {
    const params: Record<string, string | number> = {
      skip: 0,
      limit: page * PAGE_SIZE,
    };
    if (searchQuery) params.search_query = searchQuery;
    if (filters.degreeLevel.length > 0) params.level = filters.degreeLevel.join(',');
    if (filters.modality.length > 0) params.modality = filters.modality.join(',');
    if (filters.institutionType.length > 0) params.institution_type = filters.institutionType.join(',');
    if (filters.county) params.county_name = filters.county;
    return params;
  }, [searchQuery, filters, page]);

  /* Fetch programs — only when the user has searched or applied filters */
  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['programs', apiParams],
    queryFn: async () => {
      const res = await apiService.getPrograms(apiParams as any);
      return res;
    },
    placeholderData: (prev) => prev, // keep previous data while re-fetching
    enabled: hasActiveSearch,
  });

  const programs: Course[] = hasActiveSearch ? ((data?.programs ?? []) as unknown as Course[]) : [];
  const totalCount: number = hasActiveSearch ? (data?.total ?? 0) : 0;

  /* ---- Handlers ---- */
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((next: FilterState) => {
    setFilters(next);
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((p) => p + 1);
  }, []);

  return (
    <div>
      {/* Search bar */}
      <div>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem' }}>Search</h4>
        <SearchBar
          onSearch={handleSearch}
          isLoading={isLoading}
          placeholder="Search programs, courses, institutions…"
          initialValue={searchQuery}
        />
      </div>

      <div style={{ height: '2rem' }} />

      {/* Horizontal filters */}
      <div>
        <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem' }}>Filter</h4>
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Default state — no search or filter active */}
      {!hasActiveSearch && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-gray-300 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
          <p className="text-gray-500 text-base font-medium">Search Kansas Data Science Programs</p>
          <p className="text-gray-400 text-sm mt-1 max-w-md">
            Enter a keyword above or use the filters to explore programs, courses, and institutions across Kansas.
          </p>
        </div>
      )}

      {/* Active search results */}
      {hasActiveSearch && (
        <>
          {/* Quick insights */}
          {programs.length > 0 && (
            <>
              <div style={{ height: '2rem' }} />
              <div>
                <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem' }}>Key Insights</h4>
                <QuickInsights programs={programs} totalCount={totalCount} />
              </div>
            </>
          )}

          {/* Error state */}
          {isError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {(error as Error)?.message ?? 'Something went wrong. Please try again.'}
            </div>
          )}

          {/* Results */}
          <div style={{ height: '2rem' }} />
          <div>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.75rem' }}>Results</h4>
            <SearchResults
              programs={programs}
              totalCount={totalCount}
              loading={isLoading}
              onLoadMore={handleLoadMore}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;
