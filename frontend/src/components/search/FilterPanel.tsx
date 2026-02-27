import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import type { County } from '../../types/atlas';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FilterState {
  institutionType: string[];   // '4-Year' | '2-Year' | '<2-Year'
  degreeLevel: string[];       // 'Undergraduate' | 'Graduate'
  modality: string[];          // 'In-Person' | 'Online' | 'Hybrid'
  county: number | null;       // county id or null = All Counties
}

export const EMPTY_FILTERS: FilterState = {
  institutionType: [],
  degreeLevel: [],
  modality: [],
  county: null,
};

/* ------------------------------------------------------------------ */
/*  Option definitions                                                 */
/* ------------------------------------------------------------------ */

const INSTITUTION_TYPES = ['4-Year', '2-Year', '<2-Year'] as const;
const DEGREE_LEVELS    = ['Undergraduate', 'Graduate'] as const;
const MODALITIES       = ['In-Person', 'Online', 'Hybrid'] as const;

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  /* ---------- county list from API ---------- */
  const { data: counties = [], isLoading: countiesLoading } = useQuery<County[]>({
    queryKey: ['counties-list'],
    queryFn: async () => {
      const res = await apiService.getCounties({ limit: 200 });
      // API returns { total, counties: [...] }
      if (res && typeof res === 'object' && 'counties' in (res as any)) {
        return (res as any).counties as unknown as County[];
      }
      return (res ?? []) as unknown as County[];
    },
    staleTime: 1000 * 60 * 10,
  });

  /* ---------- helpers ---------- */
  const toggleCheckbox = useCallback(
    (group: 'institutionType' | 'degreeLevel' | 'modality', value: string) => {
      const current = filters[group];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      onFilterChange({ ...filters, [group]: next });
    },
    [filters, onFilterChange],
  );

  const handleCountyChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      onFilterChange({ ...filters, county: val ? Number(val) : null });
    },
    [filters, onFilterChange],
  );

  const handleClear = useCallback(() => {
    onFilterChange({ ...EMPTY_FILTERS });
  }, [onFilterChange]);

  const handleApply = useCallback(() => {
    // Trigger search by calling onFilterChange with the current (already-set) filters.
    // The parent can use this callback to fire a query.
    onFilterChange({ ...filters });
  }, [filters, onFilterChange]);

  /* ---------- (checkbox group rendered inline below) ---------- */

  /* ---------- active filter count ---------- */
  const activeCount =
    filters.institutionType.length +
    filters.degreeLevel.length +
    filters.modality.length +
    (filters.county !== null ? 1 : 0);

  /* ---------- render ---------- */
  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Toggle header (mobile only) */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors sm:hidden"
      >
        <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-600 text-white text-xs font-medium">
              {activeCount}
            </span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-gray-500 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Horizontal filter bar */}
      <div className={`${collapsed ? 'hidden sm:flex' : 'flex'} flex-wrap items-end gap-4 px-4 py-3`}>
        {/* Institution Type */}
        <InlineCheckboxGroup
          label="Institution Type"
          options={INSTITUTION_TYPES}
          selected={filters.institutionType}
          group="institutionType"
          toggle={toggleCheckbox}
        />

        <div className="w-px h-8 bg-gray-200 hidden sm:block" />

        {/* Degree Level */}
        <InlineCheckboxGroup
          label="Degree Level"
          options={DEGREE_LEVELS}
          selected={filters.degreeLevel}
          group="degreeLevel"
          toggle={toggleCheckbox}
        />

        <div className="w-px h-8 bg-gray-200 hidden sm:block" />

        {/* Modality */}
        <InlineCheckboxGroup
          label="Modality"
          options={MODALITIES}
          selected={filters.modality}
          group="modality"
          toggle={toggleCheckbox}
        />

        <div className="w-px h-8 bg-gray-200 hidden sm:block" />

        {/* County dropdown */}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-700">County</span>
          <select
            value={filters.county ?? ''}
            onChange={handleCountyChange}
            disabled={countiesLoading}
            className="rounded-md border border-gray-300 bg-white py-1.5 px-2.5 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="">All Counties</option>
            {counties
              .slice()
              .sort((a, b) => a.county_name.localeCompare(b.county_name))
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.county_name}
                </option>
              ))}
          </select>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Inline Checkbox Group (horizontal)                                 */
/* ------------------------------------------------------------------ */

interface InlineCheckboxGroupProps {
  label: string;
  options: readonly string[];
  selected: string[];
  group: 'institutionType' | 'degreeLevel' | 'modality';
  toggle: (group: 'institutionType' | 'degreeLevel' | 'modality', value: string) => void;
}

function InlineCheckboxGroup({ label, options, selected, group, toggle }: InlineCheckboxGroupProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(group, opt)}
              className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-700 whitespace-nowrap">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default FilterPanel;
