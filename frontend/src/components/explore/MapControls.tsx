import React, { useCallback, useRef, useState } from 'react';
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

  /** Parse a CSS transform: translate3d(Xpx, Ypx, 0px) or translate(Xpx, Ypx) */
  const parseTranslate = (el: HTMLElement): [number, number] => {
    const t = window.getComputedStyle(el).transform; // "matrix(1,0,0,1,tx,ty)"
    if (!t || t === 'none') return [0, 0];
    const m = t.match(/matrix.*\((.+)\)/);
    if (!m) return [0, 0];
    const vals = m[1].split(',').map(Number);
    // matrix(a,b,c,d,tx,ty)
    return [vals[4] ?? 0, vals[5] ?? 0];
  };

  const handleDownloadPng = useCallback(async () => {
    const container =
      mapRef?.current ?? document.querySelector<HTMLElement>('.leaflet-container');
    if (!container) {
      alert('Map not found. Please wait for it to load.');
      return;
    }

    setIsCapturing(true);
    try {
      const rect = container.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const scale = 2;
      const canvas = document.createElement('canvas');
      canvas.width = w * scale;
      canvas.height = h * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      /* --- Draw tile images --- */
      const mapPane = container.querySelector('.leaflet-map-pane') as HTMLElement | null;
      const tilePane = container.querySelector('.leaflet-tile-pane') as HTMLElement | null;
      if (tilePane) {
        // Accumulate transforms: map-pane → tile-pane → tile-container(s)
        const [mpX, mpY] = mapPane ? parseTranslate(mapPane) : [0, 0];

        const tileContainers = tilePane.querySelectorAll<HTMLElement>('.leaflet-tile-container');
        const allTiles: { src: string; x: number; y: number; tw: number; th: number }[] = [];

        tileContainers.forEach((tc) => {
          const [tcX, tcY] = parseTranslate(tc);
          const imgs = tc.querySelectorAll<HTMLImageElement>('img.leaflet-tile');
          imgs.forEach((img) => {
            // Each tile has inline style "left: Xpx; top: Ypx" or a transform
            const style = img.style;
            let tileX = parseFloat(style.left) || 0;
            let tileY = parseFloat(style.top) || 0;
            // Some Leaflet versions use transform on individual tiles
            if (!tileX && !tileY) {
              [tileX, tileY] = parseTranslate(img);
            }
            const finalX = mpX + tcX + tileX;
            const finalY = mpY + tcY + tileY;
            allTiles.push({
              src: img.src,
              x: finalX,
              y: finalY,
              tw: img.naturalWidth || 256,
              th: img.naturalHeight || 256,
            });
          });
        });

        /* Load all tiles with CORS */
        const loaded = await Promise.all(
          allTiles.map(
            (t) =>
              new Promise<{ img: HTMLImageElement; x: number; y: number; tw: number; th: number } | null>((resolve) => {
                const clone = new Image();
                clone.crossOrigin = 'anonymous';
                clone.onload = () => resolve({ img: clone, x: t.x, y: t.y, tw: t.tw, th: t.th });
                clone.onerror = () => resolve(null);
                clone.src = t.src;
              }),
          ),
        );
        for (const tile of loaded) {
          if (!tile) continue;
          try {
            ctx.drawImage(tile.img, tile.x, tile.y, tile.tw, tile.th);
          } catch { /* skip tainted */ }
        }
      }

      /* --- Draw SVG overlays (GeoJSON polygons) --- */
      const overlayPane = container.querySelector('.leaflet-overlay-pane') as HTMLElement | null;
      const svgOverlay = overlayPane?.querySelector('svg') as SVGSVGElement | null;
      if (svgOverlay && mapPane) {
        const [mpX, mpY] = parseTranslate(mapPane);
        // SVG is positioned inside the overlay pane; read its transform or style
        const svgStyle = svgOverlay.style;
        const svgLeft = parseFloat(svgStyle.left) || 0;
        const svgTop = parseFloat(svgStyle.top) || 0;
        const [svgTx, svgTy] = parseTranslate(svgOverlay);

        const svgClone = svgOverlay.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        // Set explicit dimensions
        const svgW = svgOverlay.getAttribute('width') || String(svgOverlay.viewBox?.baseVal?.width || w);
        const svgH = svgOverlay.getAttribute('height') || String(svgOverlay.viewBox?.baseVal?.height || h);
        svgClone.setAttribute('width', svgW);
        svgClone.setAttribute('height', svgH);

        const svgStr = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const svgImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = url;
        });
        ctx.drawImage(
          svgImg,
          mpX + svgLeft + svgTx,
          mpY + svgTop + svgTy,
          parseFloat(svgW),
          parseFloat(svgH),
        );
        URL.revokeObjectURL(url);
      }

      /* --- Trigger download --- */
      const link = document.createElement('a');
      link.download = `kansas-map-${selectedMetric}.png`;
      link.href = canvas.toDataURL('image/png');
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
