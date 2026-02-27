import { useState, useCallback } from 'react';
import { useQueries } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { County } from '../types/atlas';
import CountySelector from '../components/compare/CountySelector';
import CountyComparisonCard from '../components/compare/CountyComparisonCard';

const MAX_COUNTIES = 4;

const ComparePage: React.FC = () => {
  const [selectedCounties, setSelectedCounties] = useState<(number | null)[]>([
    null,
    null,
    null,
    null,
  ]);

  const handleCountyChange = useCallback((slotIndex: number, countyId: number | null) => {
    setSelectedCounties((prev) => {
      if (countyId != null) {
        // Adding a county — place it in the given slot
        const next = [...prev];
        next[slotIndex] = countyId;
        return next;
      }
      // Removing a county — shift subsequent counties left to fill the gap
      const next = [...prev];
      next[slotIndex] = null;
      // Compact: pull non-null values to the front, pad with nulls
      const filled = next.filter((id) => id != null);
      return Array.from({ length: MAX_COUNTIES }, (_, i) => filled[i] ?? null);
    });
  }, []);

  // Fetch full data for each selected county
  const countyQueries = useQueries({
    queries: selectedCounties.map((id) => ({
      queryKey: ['county', id],
      queryFn: async () => {
        if (id == null) return null;
        const res = await apiService.getCountyById(id);
        return (res ?? null) as unknown as County | null;
      },
      enabled: id != null,
      staleTime: 1000 * 60 * 10,
    })),
  });

  const selectedCount = selectedCounties.filter((id) => id != null).length;

  return (
    <div className="min-h-[400px]">
      {/* Header */}
      <div>
        <p className="flex items-center gap-1.5 text-sm text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Select up to {MAX_COUNTIES} Kansas counties to compare side by side.
        </p>
      </div>
      <div style={{ height: '2rem' }} />

      {/* County Selector – 4 dropdowns */}
      <CountySelector
        selectedCounties={selectedCounties}
        onCountyChange={handleCountyChange}
        maxCounties={MAX_COUNTIES}
      />

      {/* Comparison Cards Grid */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {selectedCounties.map((id, idx) => {
          const query = countyQueries[idx];
          const county = query?.data as County | null | undefined;

          // Slot has a county selected
          if (id != null) {
            if (query?.isLoading) {
              return (
                <div
                  key={idx}
                  className="flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 p-8 min-h-[300px]"
                >
                  <div className="flex flex-col items-center gap-2 text-gray-400">
                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm">Loading...</span>
                  </div>
                </div>
              );
            }

            if (query?.isError) {
              return (
                <div
                  key={idx}
                  className="flex items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 min-h-[300px]"
                >
                  <p className="text-sm text-red-500">Failed to load county data</p>
                </div>
              );
            }

            if (county) {
              return (
                <CountyComparisonCard
                  key={county.id}
                  county={county}
                  onRemove={() => handleCountyChange(idx, null)}
                  colorIndex={idx}
                />
              );
            }
          }

          // Empty slot placeholder
          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-8 min-h-[300px] text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span className="text-sm font-medium">Add County</span>
              <span className="text-xs mt-1">Use dropdown above</span>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ComparePage;
