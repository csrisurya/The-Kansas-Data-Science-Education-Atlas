import { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import type { County } from '../../types/atlas';

interface CountySelectorProps {
  /** Array of 4 slots: each is a county ID or null */
  selectedCounties: (number | null)[];
  onCountyChange: (slotIndex: number, countyId: number | null) => void;
  maxCounties?: number;
}

/** A single searchable dropdown for one slot */
function SingleCountyDropdown({
  slotIndex,
  selectedId,
  counties,
  allSelectedIds,
  isLoading,
  isError,
  disabled,
  onChange,
}: {
  slotIndex: number;
  selectedId: number | null;
  counties: County[];
  allSelectedIds: (number | null)[];
  isLoading: boolean;
  isError: boolean;
  disabled: boolean;
  onChange: (slotIndex: number, countyId: number | null) => void;
}) {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedCounty = useMemo(
    () => counties.find((c) => c.id === selectedId) ?? null,
    [counties, selectedId],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return counties;
    const lower = search.toLowerCase();
    return counties.filter((c) => c.county_name.toLowerCase().includes(lower));
  }, [counties, search]);

  const handleSelect = (id: number) => {
    onChange(slotIndex, id);
    setSearch('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange(slotIndex, null);
    setSearch('');
  };

  return (
    <div className="flex-1 min-w-0" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        County {slotIndex + 1}
      </label>

      {/* Disabled state */}
      {disabled && !selectedCounty ? (
        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2">
          <span className="text-sm text-gray-400">Select County {slotIndex} first</span>
        </div>
      ) : selectedCounty ? (
        <div className="flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2">
          <span className="flex-1 text-sm font-medium text-blue-800 truncate">
            {selectedCounty.county_name}
          </span>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleClear}
            className="shrink-0 text-blue-400 hover:text-blue-600 transition-colors"
            aria-label={`Remove ${selectedCounty.county_name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        /* Searchable input */
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search county..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            aria-label={`Search county for slot ${slotIndex + 1}`}
            aria-expanded={isOpen}
            role="combobox"
          />

          {/* Dropdown chevron */}
          <button
            type="button"
            onClick={() => {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            tabIndex={-1}
            aria-label="Toggle dropdown"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Dropdown list */}
          {isOpen && (
            <ul className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              {isLoading && (
                <li className="px-3 py-2 text-sm text-gray-500">Loading...</li>
              )}
              {isError && (
                <li className="px-3 py-2 text-sm text-red-500">Failed to load</li>
              )}
              {!isLoading && !isError && filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">No counties found</li>
              )}
              {!isLoading &&
                !isError &&
                filtered.map((county) => {
                  const takenElsewhere =
                    allSelectedIds.includes(county.id) && county.id !== selectedId;
                  return (
                    <li
                      key={county.id}
                      role="option"
                      aria-selected={county.id === selectedId}
                      aria-disabled={takenElsewhere}
                      onClick={() => !takenElsewhere && handleSelect(county.id)}
                      className={`px-3 py-2 text-sm transition-colors ${
                        takenElsewhere
                          ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-blue-50 text-gray-800 cursor-pointer'
                      }`}
                    >
                      <span className="flex items-center justify-between">
                        {county.county_name}
                        {takenElsewhere && (
                          <span className="text-xs text-gray-400 ml-1">In use</span>
                        )}
                      </span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

const CountySelector: React.FC<CountySelectorProps> = ({
  selectedCounties,
  onCountyChange,
  maxCounties = 4,
}) => {
  const { data: counties = [], isLoading, isError } = useQuery({
    queryKey: ['counties'],
    queryFn: async () => {
      const res = await apiService.getCounties({ limit: 200 });
      return res ?? [];
    },
    staleTime: 1000 * 60 * 10,
  });

  // Ensure we always render exactly maxCounties slots
  const slots = Array.from({ length: maxCounties }, (_, i) => selectedCounties[i] ?? null);

  return (
    <div className="w-full grid grid-cols-4 gap-4">
      {slots.map((countyId, idx) => {
        // A slot is disabled if the previous slot is empty (enforce sequential order)
        const isDisabled = idx > 0 && slots[idx - 1] == null;
        return (
          <SingleCountyDropdown
            key={idx}
            slotIndex={idx}
            selectedId={countyId}
            counties={counties}
            allSelectedIds={selectedCounties}
            isLoading={isLoading}
            isError={isError}
            disabled={isDisabled}
            onChange={onCountyChange}
          />
        );
      })}
    </div>
  );
};

export default CountySelector;
