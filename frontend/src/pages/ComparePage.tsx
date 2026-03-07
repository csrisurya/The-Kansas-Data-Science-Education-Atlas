import { useQueries } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { County } from '../types/atlas';
import CountySelector from '../components/compare/CountySelector';
import CountyComparisonCard from '../components/compare/CountyComparisonCard';

const MAX_COUNTIES = 4;

interface ComparePageProps {
  selectedCounties: (number | null)[];
  onCountyChange: (slotIndex: number, countyId: number | null) => void;
}

const ComparePage: React.FC<ComparePageProps> = ({ selectedCounties, onCountyChange: handleCountyChange }) => {

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
        <p className="flex items-center gap-1.5 text-sm text-indigo-600 mt-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          'Other' K-12 School count refers to any schools that don't fall into Elementary, Middle, High, or Virtual
        </p>
      </div>
      <div style={{ height: '2rem' }} />

      {/* County Selector – 4 dropdowns */}
      <CountySelector
        selectedCounties={selectedCounties}
        onCountyChange={handleCountyChange}
        maxCounties={MAX_COUNTIES}
      />

      <div style={{ height: '2rem' }} />

      {/* Conditional formatting legend */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-5 py-4 text-sm text-gray-700">
        <h4 className="font-semibold text-gray-800 mb-2">Color-Coded Metrics Guide</h4>
        <p className="mb-2 text-gray-500">
          Certain metrics use color coding to indicate relative performance.{' '}
          <span className="text-green-600 font-medium">Green</span> = favorable,{' '}
          <span className="text-yellow-600 font-medium">Yellow</span> = moderate,{' '}
          <span className="text-red-600 font-medium">Red</span> = needs attention.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-xs text-gray-600">
          <span><strong>Poverty Rate:</strong> ≤10% / 10–20% / &gt;20% (<a href="https://www.census.gov/topics/income-poverty/poverty/guidance/poverty-measures.html" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">U.S. Census threshold</a>)</span>
          <span><strong>Unemployment:</strong> ≤4% / 4–7% / &gt;7% (<a href="https://www.bls.gov/cps/cps_htgm.htm" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">BLS full-employment benchmark</a>)</span>
          <span><strong>Internet Adoption:</strong> ≥80% / 60–80% / &lt;60% (<a href="https://www.fcc.gov/reports-research/reports/broadband-progress-reports" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">FCC reference</a>)</span>
          <span><strong>No Internet:</strong> ≤10% / 10–25% / &gt;25%</span>
          <span><strong>Broadband Index:</strong> ≥0.7 / 0.4–0.7 / &lt;0.4</span>
          <span><strong>Impact Score:</strong> &gt;5 / 1–5 / &lt;1 (project-defined)</span>
        </div>
      </div>

      <div style={{ height: '2rem' }} />

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
