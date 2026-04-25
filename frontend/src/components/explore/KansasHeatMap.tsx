import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl, useMap } from 'react-leaflet';
import type { LatLngExpression, Layer, LeafletMouseEvent, PathOptions, Map as LeafletMap } from 'leaflet';
import type { Feature, GeoJsonProperties, Geometry } from 'geojson';
import 'leaflet/dist/leaflet.css';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HeatMapCounty {
  id: number;
  county_name: string;
  latitude: number;
  longitude: number;
  value: number;
}

export interface KansasHeatMapProps {
  counties: HeatMapCounty[];
  metric: string;
  onCountyClick: (countyId: number) => void;
  /** Optional ref to receive the Leaflet map instance */
  mapInstanceRef?: React.MutableRefObject<LeafletMap | null>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const KANSAS_CENTER: LatLngExpression = [38.5, -98.5];
const INITIAL_ZOOM = 7;

/** 6-stop gradient: deep blue → blue → yellow → orange → red-orange → red */
const COLOR_STOPS: [number, string][] = [
  [0.0, '#08306b'],
  [0.2, '#2171b5'],
  [0.4, '#fee090'],
  [0.6, '#fdae61'],
  [0.8, '#f46d43'],
  [1.0, '#a50026'],
];

const DEFAULT_STYLE: PathOptions = {
  weight: 1.5,
  opacity: 1,
  color: '#555',
  fillOpacity: 0.75,
};

const HIGHLIGHT_STYLE: PathOptions = {
  weight: 3,
  color: '#222',
  fillOpacity: 0.9,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Interpolate a hex color between two stops */
function lerpColor(a: string, b: string, t: number): string {
  const parse = (hex: string) => [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = parse(a);
  const [r2, g2, b2] = parse(b);
  const ch = (x: number) =>
    Math.round(x).toString(16).padStart(2, '0');
  return `#${ch(r1 + (r2 - r1) * t)}${ch(g1 + (g2 - g1) * t)}${ch(b1 + (b2 - b1) * t)}`;
}

/** Map a normalised 0-1 ratio to a smooth gradient color */
function getColor(ratio: number): string {
  const r = Math.max(0, Math.min(1, ratio));
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const [lo, loColor] = COLOR_STOPS[i];
    const [hi, hiColor] = COLOR_STOPS[i + 1];
    if (r >= lo && r <= hi) {
      return lerpColor(loColor, hiColor, (r - lo) / (hi - lo));
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1][1];
}

/** Normalise a GeoJSON NAME ("Allen") to match backend county_name ("Allen County") */
function normaliseCountyName(name: string): string {
  return name.toLowerCase().replace(/\s*county$/i, '').trim();
}

function formatValue(v: number | undefined): string {
  if (v === undefined || v === null) return 'N/A';
  const n = Number(v);
  if (Number.isNaN(n)) return 'N/A';
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(2);
}

/* ------------------------------------------------------------------ */
/*  Legend                                                             */
/* ------------------------------------------------------------------ */

const Legend: React.FC<{ min: number; max: number; metric: string }> = ({
  min,
  max,
  metric,
}) => {
  /** Build a CSS linear-gradient from the colour stops */
  const gradient = COLOR_STOPS.map(
    ([pct, color]) => `${color} ${pct * 100}%`,
  ).join(', ');

  return (
    <div
      className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-lg px-4 py-3 text-xs select-none"
      style={{ pointerEvents: 'auto' }}
    >
      <p className="font-semibold text-gray-800 mb-2 text-sm">{metric}</p>
      <div
        className="h-3 w-48 rounded-sm"
        style={{ background: `linear-gradient(to right, ${gradient})` }}
      />
      <div className="flex justify-between mt-1 text-gray-600">
        <span>{formatValue(min)}</span>
        <span>{formatValue((min + max) / 2)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Helper to expose the Leaflet map instance via a ref                */
/* ------------------------------------------------------------------ */

const MapInstanceSetter: React.FC<{ mapInstanceRef: React.MutableRefObject<LeafletMap | null> }> = ({ mapInstanceRef }) => {
  const map = useMap();
  useEffect(() => {
    mapInstanceRef.current = map;
  }, [map, mapInstanceRef]);
  return null;
};

/** Configure fine-grained zoom after mount */
const ZoomConfigurator: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.options.zoomSnap = 0.1;
    map.options.zoomDelta = 0.25;
    map.options.wheelPxPerZoomLevel = 200;
  }, [map]);
  return null;
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const KansasHeatMap: React.FC<KansasHeatMapProps> = ({
  counties,
  metric,
  onCountyClick,
  mapInstanceRef,
}) => {
  const [geoJsonData, setGeoJsonData] = useState<GeoJSON.FeatureCollection | null>(null);
  const [geoJsonKey, setGeoJsonKey] = useState(0);

  /* ---------- Derived data ---------- */

  const values = useMemo(() => counties.map((c) => c.value), [counties]);
  const min = useMemo(() => (values.length ? Math.min(...values) : 0), [values]);
  const max = useMemo(() => (values.length ? Math.max(...values) : 1), [values]);

  /** Lookup maps keyed by normalised county name */
  const countyByName = useMemo(() => {
    const map = new Map<string, HeatMapCounty>();
    for (const c of counties) {
      map.set(normaliseCountyName(c.county_name), c);
    }
    return map;
  }, [counties]);

  /* ---------- Load GeoJSON ---------- */

  useEffect(() => {
    let cancelled = false;
    fetch(`${import.meta.env.BASE_URL}kansas-counties.geojson`)
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
    return () => {
      cancelled = true;
    };
  }, []);

  // Bump GeoJSON key when counties/metric change so react-leaflet re-renders
  useEffect(() => {
    setGeoJsonKey((k) => k + 1);
  }, [counties, metric]);

  /* ---------- Style callback ---------- */

  const styleFn = useCallback(
    (feature: Feature<Geometry, GeoJsonProperties> | undefined): PathOptions => {
      if (!feature) return DEFAULT_STYLE;
      const geoName = normaliseCountyName(feature.properties?.NAME ?? '');
      const county = countyByName.get(geoName);
      const ratio = county && max !== min ? (county.value - min) / (max - min) : 0;
      return {
        ...DEFAULT_STYLE,
        fillColor: county ? getColor(ratio) : '#d1d5db',
      };
    },
    [countyByName, min, max],
  );

  /* ---------- Interaction callback ---------- */

  const onEachFeature = useCallback(
    (feature: Feature<Geometry, GeoJsonProperties>, layer: Layer) => {
      const geoName = normaliseCountyName(feature.properties?.NAME ?? '');
      const county = countyByName.get(geoName);

      /* Tooltip */
      const label = county
        ? `<div style="text-align:center">
             <strong>${county.county_name}</strong><br/>
             ${metric}: <b>${formatValue(county.value)}</b>
           </div>`
        : `<strong>${feature.properties?.NAME ?? 'Unknown'} County</strong><br/><em>No data</em>`;

      layer.bindTooltip(label, { sticky: true, direction: 'top', className: 'leaflet-tooltip' });

      /* Hover highlight */
      layer.on({
        mouseover: (e: LeafletMouseEvent) => {
          const target = e.target;
          target.setStyle(HIGHLIGHT_STYLE);
          target.bringToFront();
        },
        mouseout: (e: LeafletMouseEvent) => {
          const target = e.target;
          target.setStyle(styleFn(feature));
        },
        click: () => {
          if (county) onCountyClick(county.id);
        },
      });
    },
    [countyByName, metric, onCountyClick, styleFn],
  );

  /* ---------- Render ---------- */

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={KANSAS_CENTER}
        zoom={INITIAL_ZOOM}
        minZoom={6}
        maxZoom={12}
        zoomSnap={0.1}
        zoomDelta={0.25}
        wheelPxPerZoomLevel={200}
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
        <ZoomConfigurator />
        {mapInstanceRef && <MapInstanceSetter mapInstanceRef={mapInstanceRef} />}
      </MapContainer>

      <Legend min={min} max={max} metric={metric} />
    </div>
  );
};

export default KansasHeatMap;
