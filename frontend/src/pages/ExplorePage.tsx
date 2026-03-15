import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import type { HeatMapData } from '../services/api';
import KansasHeatMap from '../components/explore/KansasHeatMap';
import type { HeatMapCounty } from '../components/explore/KansasHeatMap';
import MapControls from '../components/explore/MapControls';
import QuickStats from '../components/explore/QuickStats';
import Loading from '../components/common/Loading';

const DEFAULT_METRIC = 'total_ds_ai_courses';

const ExplorePage: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState(DEFAULT_METRIC);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCounty, setSelectedCounty] = useState<HeatMapCounty | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  /* ---- Fetch heat-map data from backend ---- */
  const {
    data: rawCounties,
    isLoading,
    isError,
    error,
  } = useQuery<HeatMapData[]>({
    queryKey: ['heatmap', selectedMetric],
    queryFn: async () => {
      const result = await apiService.getHeatMapData(selectedMetric);
      return result ?? [];
    },
    staleTime: 5 * 60 * 1000, // cache for 5 min
  });

  /* ---- Map API response → HeatMapCounty[] ---- */
  const counties: HeatMapCounty[] = useMemo(() => {
    if (!rawCounties) return [];

    let mapped = rawCounties.map((c) => ({
      id: c.id,
      county_name: c.county_name,
      latitude: Number(c.lat),
      longitude: Number(c.lng),
      value: Number(c.value) || 0,
    }));

    // Apply search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mapped = mapped.filter((c) =>
        c.county_name.toLowerCase().includes(q),
      );
    }

    return mapped;
  }, [rawCounties, searchQuery]);

  /* ---- Metric label for display ---- */
  const metricLabel = useMemo(() => {
    const labels: Record<string, string> = {
      total_ds_ai_courses: 'Total DS/AI Courses',
      broadband_access_index: 'Broadband Access Index',
      median_income: 'Median Household Income',
      county_population: 'County Population',
    };
    return labels[selectedMetric] ?? selectedMetric;
  }, [selectedMetric]);

  /* ---- Handlers ---- */
  const handleCountyClick = useCallback(
    (countyId: number) => {
      const county = counties.find((c) => c.id === countyId) ?? null;
      setSelectedCounty(county);
    },
    [counties],
  );

  const handleMetricChange = useCallback((metric: string) => {
    setSelectedMetric(metric);
    setSelectedCounty(null);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /* ---- Render ---- */

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] text-red-600 gap-2">
        <p className="font-semibold text-lg">Failed to load map data</p>
        <p className="text-sm text-gray-500">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <button
          type="button"
          className="mt-3 px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div style={{ height: '1rem' }} />
      {/* Stat cards row */}
      <QuickStats />

      {/* Map (left) + metric selector (right) */}
      <div className="flex flex-row gap-6 items-stretch">
        {/* Map + detail panel */}
        <div className="flex-1 min-w-0">
          <div ref={mapContainerRef}>
            <KansasHeatMap
              counties={counties}
              metric={metricLabel}
              onCountyClick={handleCountyClick}
            />
          </div>

          {/* Selected county detail card */}
          {selectedCounty && (
            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-indigo-900">
                  {selectedCounty.county_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{metricLabel}:</span>{' '}
                  {Number.isInteger(selectedCounty.value)
                    ? selectedCounty.value.toLocaleString()
                    : selectedCounty.value.toFixed(2)}
                </p>
              </div>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
                onClick={() => setSelectedCounty(null)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>
          )}
        </div>

        {/* Metric selector - right sidebar */}
        <div className="w-72 shrink-0">
          <MapControls
            selectedMetric={selectedMetric}
            onMetricChange={handleMetricChange}
            onSearch={handleSearch}
            mapRef={mapContainerRef}
          />
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
