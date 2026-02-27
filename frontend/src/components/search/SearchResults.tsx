import { useState, useMemo } from 'react';
import type { Course } from '../../types/atlas';
import ProgramCard from './ProgramCard';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface SearchResultsProps {
  programs: Course[];
  totalCount: number;
  loading: boolean;
  onLoadMore: () => void;
}

/* ------------------------------------------------------------------ */
/*  Sort options                                                       */
/* ------------------------------------------------------------------ */

type SortKey = 'school-az' | 'courses-desc' | 'county';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'school-az', label: 'School Name (A–Z)' },
  { value: 'courses-desc', label: 'Course Count (High → Low)' },
  { value: 'county', label: 'County' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Group flat course rows by school_name so each ProgramCard gets its list */
function groupBySchool(courses: Course[]) {
  const map = new Map<string, Course[]>();
  for (const c of courses) {
    const key = c.school_name;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(c);
  }
  return [...map.entries()].map(([, courses]) => ({
    representative: courses[0],
    courses,
  }));
}

function sortGroups(
  groups: ReturnType<typeof groupBySchool>,
  key: SortKey,
) {
  const sorted = [...groups];
  switch (key) {
    case 'school-az':
      sorted.sort((a, b) =>
        a.representative.school_name.localeCompare(b.representative.school_name),
      );
      break;
    case 'courses-desc':
      sorted.sort(
        (a, b) =>
          b.courses.filter((c) => c.course_name && c.course_name !== 'DNE').length -
          a.courses.filter((c) => c.course_name && c.course_name !== 'DNE').length,
      );
      break;
    case 'county':
      // If a county field becomes available in Course, sort by it.
      // For now fall back to school name.
      sorted.sort((a, b) =>
        a.representative.school_name.localeCompare(b.representative.school_name),
      );
      break;
  }
  return sorted;
}

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-5 space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-4 w-48 rounded bg-gray-200" />
        <div className="h-5 w-20 rounded-full bg-gray-200" />
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-24 rounded-full bg-gray-200" />
        <div className="h-5 w-20 rounded-full bg-gray-200" />
        <div className="h-5 w-16 rounded-full bg-gray-200" />
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-3.5 w-full rounded bg-gray-100" />
        <div className="h-3.5 w-5/6 rounded bg-gray-100" />
        <div className="h-3.5 w-4/6 rounded bg-gray-100" />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="h-3.5 w-24 rounded bg-gray-200" />
        <div className="h-3.5 w-32 rounded bg-gray-200" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const SearchResults: React.FC<SearchResultsProps> = ({
  programs,
  totalCount,
  loading,
  onLoadMore,
}) => {
  const [sortKey, setSortKey] = useState<SortKey>('school-az');

  const groups = useMemo(() => groupBySchool(programs), [programs]);
  const sorted = useMemo(() => sortGroups(groups, sortKey), [groups, sortKey]);

  const showingCount = programs.length;
  const hasMore = showingCount < totalCount;

  /* ---- Loading state ---- */
  if (loading && programs.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  /* ---- Empty state ---- */
  if (!loading && programs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
          />
        </svg>
        <p className="text-gray-500 text-sm font-medium">No programs found.</p>
        <p className="text-gray-400 text-xs mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  /* ---- Results ---- */
  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-gray-600">
          Showing{' '}
          <span className="font-semibold text-gray-800">
            1–{showingCount}
          </span>{' '}
          of{' '}
          <span className="font-semibold text-gray-800">{totalCount}</span>{' '}
          results
        </p>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-xs text-gray-500">
            Sort by
          </label>
          <select
            id="sort-select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="rounded-md border border-gray-300 bg-white py-1.5 px-2.5 text-xs text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Card list */}
      <div className="space-y-3">
        {sorted.map((group) => (
          <ProgramCard
            key={group.representative.id}
            program={group.representative}
            courses={group.courses}
            onExpand={() => {}}
          />
        ))}
      </div>

      {/* Loading indicator while fetching next page */}
      {loading && programs.length > 0 && (
        <div className="flex justify-center py-4">
          <svg
            className="animate-spin h-6 w-6 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}

      {/* Load More button */}
      {hasMore && !loading && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onLoadMore}
            className="rounded-md border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-indigo-300 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
