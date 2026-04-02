import React, { useCallback, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import type { Map as LeafletMap } from 'leaflet';
import Button from '../common/Button';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MapControlsProps {
  /** Currently selected metric key (snake_case) */
  selectedMetric: string;
  /** Called when the user picks a different metric */
  onMetricChange: (metric: string) => void;
  /** Called when the search query changes (empty string = clear) */
  onSearch: (query: string) => void;
  /**
   * Optional ref to the map container element.
   * When provided, "Download Map as PNG" captures that element.
   */
  mapRef?: React.RefObject<HTMLDivElement | null>;
  /** Optional ref to the Leaflet map instance for resetting view before capture */
  mapInstanceRef?: React.RefObject<LeafletMap | null>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const METRICS = [
  {
    label: 'Total DS/AI Courses',
    value: 'total_ds_ai_courses',
    description: 'Number of DS/AI courses per county',
  },
  {
    label: 'Broadband Access Index',
    value: 'broadband_access_index',
    description: 'Composite broadband availability score',
  },
  {
    label: 'Median Household Income',
    value: 'median_income',
    description: 'Median household income by county',
  },
  {
    label: 'County Population',
    value: 'county_population',
    description: 'Total county population',
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG)                                                 */
/* ------------------------------------------------------------------ */

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
    />
  </svg>
);

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
  </svg>
);

const ClearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const MapControls: React.FC<MapControlsProps> = ({
  selectedMetric,
  onMetricChange,
  onSearch,
  mapRef,
  mapInstanceRef,
}) => {
  const [search, setSearch] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ---------- Search ---------- */

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);

      // Debounce live search by 250 ms
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(value), 250);
    },
    [onSearch],
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onSearch(search);
  };

  const handleClearSearch = () => {
    setSearch('');
    onSearch('');
  };

  /* ---------- PNG download ---------- */

  const handleDownloadPng = useCallback(async () => {
    const container =
      mapRef?.current ?? document.querySelector<HTMLElement>('.leaflet-container')?.parentElement;
    if (!container) {
      alert('Map not found. Please wait for it to load.');
      return;
    }

    setIsCapturing(true);
    try {
      // Wait briefly for any pending tile loads at the current zoom
      await new Promise((resolve) => setTimeout(resolve, 500));

      const imgData = await toPng(container, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList?.contains('leaflet-control-zoom')) return false;
          return true;
        },
      });

      const link = document.createElement('a');
      link.download = `kansas-map-${selectedMetric}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Map capture failed:', err);
      alert('Failed to capture map. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [mapRef, selectedMetric]);

  /* ---------- Render ---------- */

  return (
    <aside className="w-full max-w-xs bg-red-50 rounded-xl shadow-lg border border-red-100 p-5 flex flex-col h-full">
      {/* ---- Metric selector ---- */}
      <fieldset className="flex-1 flex flex-col">
        <legend className="text-xl font-bold text-gray-800 mb-3 text-center w-full">
          Select Metric
        </legend>
        <div className="flex flex-col flex-1 justify-evenly">
          {METRICS.map((metric) => {
            const isActive = selectedMetric === metric.value;
            return (
              <label
                key={metric.value}
                className={`flex items-start gap-2.5 rounded-lg px-3 py-4 cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-indigo-50 ring-1 ring-indigo-300'
                    : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="metric"
                  value={metric.value}
                  checked={isActive}
                  onChange={() => onMetricChange(metric.value)}
                  className="mt-0.5 h-5 w-5 accent-indigo-600 shrink-0"
                />
                <span className="flex flex-col leading-tight">
                  <span
                    className={`text-base font-medium ${
                      isActive ? 'text-indigo-700' : 'text-gray-700'
                    }`}
                  >
                    {metric.label}
                  </span>
                  <span className="text-sm text-gray-400">{metric.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* ---- Actions ---- */}
      <div className="flex flex-col gap-2 pt-1">
        <Button
          variant="secondary"
          size="sm"
          disabled={isCapturing}
          onClick={handleDownloadPng}
        >
          <span className="flex items-center gap-1.5">
            <DownloadIcon />
            {isCapturing ? 'Capturing…' : 'Download Map as PNG'}
          </span>
        </Button>
      </div>
    </aside>
  );
};

export default MapControls;
