import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';
import type { LatLngExpression, Layer, LeafletMouseEvent, PathOptions } from 'leaflet';
import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { apiService } from '../../services/api';
import 'leaflet/dist/leaflet.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DesertCounty {
  county_name: string;
  county_population: number;
  latitude: number;
  longitude: number;
  distance_to_nearest_program: number;
  nearest_program_county: string;
  median_household_income: number;
  broadband_access_index: number;
  poverty_rate: number;
  unemployment_rate: number;
  total_households: number;
  four_year_colleges: number;
  two_year_colleges: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const KANSAS_CENTER: LatLngExpression = [38.5, -98.5];
const INITIAL_ZOOM = 7;

const DEFAULT_STYLE: PathOptions = {
  weight: 1.5,
  opacity: 1,
  color: '#555',
  fillOpacity: 0.7,
};

const HIGHLIGHT_STYLE: PathOptions = {
  weight: 3,
  color: '#222',
  fillOpacity: 0.9,
};

const HAS_PROGRAMS_COLOR = '#22c55e'; // green-500

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function normaliseCountyName(name: string): string {
  return name.toLowerCase().replace(/\s*county$/i, '').trim();
}

/** Get fill color based on distance to nearest program */
function getDistanceColor(distance: number): string {
  if (distance > 100) return '#991b1b';  // dark red  (red-800)
  if (distance > 75) return '#dc2626';   // red       (red-600)
  if (distance > 50) return '#f97316';   // orange    (orange-500)
  if (distance > 25) return '#facc15';   // yellow    (yellow-400)
  return '#fde68a';                       // light yellow (amber-200)
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

/* ------------------------------------------------------------------ */
/*  Legend                                                             */
/* ------------------------------------------------------------------ */

const Legend: React.FC = () => {
  const items = [
    { color: HAS_PROGRAMS_COLOR, label: 'Has DS/AI Programs' },
    { color: '#fde68a', label: '< 25 miles' },
    { color: '#facc15', label: '25–50 miles' },
    { color: '#f97316', label: '50–75 miles' },
    { color: '#dc2626', label: '75–100 miles' },
    { color: '#991b1b', label: '> 100 miles' },
  ];

  return (
    <div
      className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-lg px-4 py-3 text-xs select-none"
      style={{ pointerEvents: 'auto' }}
    >
      <p className="font-semibold text-gray-800 mb-2 text-sm">
        Distance to Nearest Program
      </p>
      <div className="space-y-1.5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span
              className="inline-block h-3.5 w-5 rounded-sm border border-gray-300"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-gray-700">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sidebar                                                            */
/* ------------------------------------------------------------------ */

const Sidebar: React.FC<{ county: DesertCounty | null; onClose: () => void }> = ({
  county,
  onClose,
}) => {
  if (!county) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm px-4 text-center">
        Click a county on the map to view details
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between bg-red-50 border-b border-red-200 px-4 py-3">
        <div>
          <h3 className="text-base font-bold text-red-900">{county.county_name}</h3>
          <span className="text-xs text-red-700 font-medium">No DS/AI Programs</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Distance highlight */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div
          className="rounded-lg px-3 py-2 text-center"
          style={{ backgroundColor: getDistanceColor(county.distance_to_nearest_program) + '20' }}
        >
          <p className="text-2xl font-bold text-gray-900">
            {county.distance_to_nearest_program} mi
          </p>
          <p className="text-xs text-gray-600 mt-0.5">
            to nearest program ({county.nearest_program_county})
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="px-4 py-3 space-y-3 text-sm">
        <DetailSection title="Demographics">
          <DetailRow label="Population" value={county.county_population.toLocaleString()} />
          <DetailRow label="Median Income" value={formatCurrency(county.median_household_income)} />
          <DetailRow label="Poverty Rate" value={`${(county.poverty_rate * 100).toFixed(1)}%`} />
          <DetailRow label="Unemployment" value={`${(county.unemployment_rate * 100).toFixed(1)}%`} />
          <DetailRow label="Households" value={county.total_households.toLocaleString()} />
        </DetailSection>

        <DetailSection title="Education">
          <DetailRow label="4-Year Colleges" value={county.four_year_colleges} />
          <DetailRow label="2-Year Colleges" value={county.two_year_colleges} />
        </DetailSection>

        <DetailSection title="Digital Access">
          <DetailRow label="Broadband Index" value={county.broadband_access_index.toFixed(2)} />
        </DetailSection>
      </div>
    </div>
  );
};

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-semibold text-gray-700 uppercase text-xs tracking-wide mb-1.5">
        {title}
      </h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-800">{value}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const EducationalDesertMap: React.FC = () => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [geoJsonKey, setGeoJsonKey] = useState(0);
  const [selectedCounty, setSelectedCounty] = useState<DesertCounty | null>(null);

  /* ---------- Fetch gap-analysis data ---------- */
  const { data: gapData, isLoading, isError, error } = useQuery({
    queryKey: ['gap-analysis'],
    queryFn: () => apiService.getGapAnalysis(),
    staleTime: 5 * 60 * 1000,
  });

  const deserts = useMemo(() => gapData?.educational_deserts ?? [], [gapData]);
  const noProgramNames = useMemo(() => {
    const set = new Set<string>();
    for (const d of deserts) {
      set.add(normaliseCountyName(d.county_name));
    }
    return set;
  }, [deserts]);

  const desertByName = useMemo(() => {
    const map = new Map<string, DesertCounty>();
    for (const d of deserts) {
      map.set(normaliseCountyName(d.county_name), d);
    }
    return map;
  }, [deserts]);

  /* ---------- Load GeoJSON ---------- */
  useEffect(() => {
    let cancelled = false;
    fetch('/kansas-counties.geojson')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: GeoJSON.FeatureCollection) => {
        if (!cancelled) {
          setGeoJsonData(data);
          setGeoJsonKey((k) => k + 1);
        }
      })
      .catch((err) => console.error('Failed to load Kansas GeoJSON:', err));
    return () => { cancelled = true; };
  }, []);

  // Re-render GeoJSON when data changes
  useEffect(() => {
    setGeoJsonKey((k) => k + 1);
  }, [deserts]);

  /* ---------- Style callback ---------- */
  const styleFn = useCallback(
    (feature: Feature<Geometry, GeoJsonProperties> | undefined): PathOptions => {
      if (!feature) return DEFAULT_STYLE;
      const geoName = normaliseCountyName(feature.properties?.NAME ?? '');
      const desert = desertByName.get(geoName);

      if (desert) {
        return {
          ...DEFAULT_STYLE,
          fillColor: getDistanceColor(desert.distance_to_nearest_program),
        };
      }

      // County has programs → green
      if (!noProgramNames.has(geoName)) {
        return {
          ...DEFAULT_STYLE,
          fillColor: HAS_PROGRAMS_COLOR,
          fillOpacity: 0.55,
        };
      }

      return { ...DEFAULT_STYLE, fillColor: '#d1d5db' };
    },
    [desertByName, noProgramNames],
  );

  /* ---------- Interaction callback ---------- */
  const onEachFeature = useCallback(
    (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
      const geoName = normaliseCountyName(feature.properties?.NAME ?? '');
      const desert = desertByName.get(geoName);

      const label = desert
        ? `<div style="text-align:center">
             <strong>${desert.county_name}</strong><br/>
             Distance: <b>${desert.distance_to_nearest_program} mi</b><br/>
             <span style="font-size:11px;color:#666">Nearest: ${desert.nearest_program_county}</span>
           </div>`
        : `<div style="text-align:center">
             <strong>${feature.properties?.NAME ?? 'Unknown'} County</strong><br/>
             <span style="color:#16a34a;font-weight:600">Has DS/AI Programs</span>
           </div>`;

      layer.bindTooltip(label, { sticky: true, direction: 'top' });

      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          e.target.setStyle(HIGHLIGHT_STYLE);
          e.target.bringToFront();
        },
        mouseout: (e: LeafletMouseEvent) => {
          e.target.setStyle(styleFn(feature));
        },
        click: () => {
          if (desert) setSelectedCounty(desert);
        },
      });
    },
    [desertByName, styleFn],
  );

  /* ---------- Loading / Error states ---------- */
  if (isLoading) {
    return (
      <section className="space-y-4">
        <div className="h-7 w-64 rounded bg-gray-200 animate-pulse" />
        <div className="h-[500px] rounded-lg bg-gray-100 animate-pulse" />
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-xl border border-red-200 bg-red-50 px-6 py-5">
        <p className="font-semibold text-red-700">Failed to load educational desert data</p>
        <p className="mt-1 text-sm text-red-500">
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </section>
    );
  }

  /* ---------- Stats summary ---------- */
  const over100 = deserts.filter((d) => d.distance_to_nearest_program > 100).length;
  const between50and100 = deserts.filter(
    (d) => d.distance_to_nearest_program > 50 && d.distance_to_nearest_program <= 100,
  ).length;
  const under50 = deserts.filter((d) => d.distance_to_nearest_program <= 50).length;
  const maxDist = deserts.length
    ? Math.max(...deserts.map((d) => d.distance_to_nearest_program))
    : 0;
  const avgDist = deserts.length
    ? deserts.reduce((s, d) => s + d.distance_to_nearest_program, 0) / deserts.length
    : 0;

  return (
    <section className="space-y-5">
      {/* Heading */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Educational Desert Map
        </h2>
      </div>

      {/* Quick stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <StatChip label="Has-Program Counties" value={105 - deserts.length} accent="green" />
        <StatChip label="No-Program Counties" value={deserts.length} />
        <StatChip label="Avg Distance" value={`${avgDist.toFixed(1)} mi`} />
        <StatChip label="Max Distance" value={`${maxDist.toFixed(1)} mi`} />
        <StatChip label="> 100 mi away" value={over100} accent="red" />
        <StatChip label="50–100 mi" value={between50and100} accent="orange" />
      </div>

      <div style={{ height: '2rem' }} />

      {/* Map + Sidebar layout */}
      <div className="flex gap-4 rounded-lg overflow-hidden border border-gray-200">
        {/* Map */}
        <div className="relative flex-1 h-[550px]">
          <MapContainer
            center={KANSAS_CENTER}
            zoom={INITIAL_ZOOM}
            minZoom={6}
            maxZoom={12}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {geoJsonData && (
              <GeoJSON
                key={geoJsonKey}
                data={geoJsonData}
                style={styleFn}
                onEachFeature={onEachFeature}
              />
            )}
            <ZoomControl position="topright" />
          </MapContainer>
          <Legend />
        </div>

        {/* Sidebar */}
        <div className="w-72 shrink-0 bg-gray-50 border-l border-gray-200">
          <Sidebar county={selectedCounty} onClose={() => setSelectedCounty(null)} />
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*  Small stat chip                                                    */
/* ------------------------------------------------------------------ */

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: 'red' | 'orange' | 'green';
}) {
  const colors = accent === 'red'
    ? 'bg-red-50 border-red-200 text-red-700'
    : accent === 'orange'
      ? 'bg-orange-50 border-orange-200 text-orange-700'
      : accent === 'green'
        ? 'bg-green-50 border-green-200 text-green-700'
        : 'bg-gray-50 border-gray-200 text-gray-700';

  return (
    <div className={`rounded-lg border px-3 py-2 text-center ${colors}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{label}</p>
    </div>
  );
}

export default EducationalDesertMap;
