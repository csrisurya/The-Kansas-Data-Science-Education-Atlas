import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, ZoomControl } from 'react-leaflet';
import type { LatLngExpression, Layer } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet/dist/leaflet.css';

interface County {
  id: number;
  county_name: string;
  latitude: number;
  longitude: number;
  value: number;
}

interface KansasHeatMapProps {
  counties: County[];
  metric: string;
  onCountyClick: (countyId: number) => void;
}

const KANSAS_CENTER: LatLngExpression = [38.5, -98.5];
const INITIAL_ZOOM = 6;

// Color scale: blue (low), yellow (medium), red (high)
function getColor(value: number, min: number, max: number): string {
  if (max === min) return '#cccccc';
  const ratio = (value - min) / (max - min);
  if (ratio < 0.33) return '#2563eb'; // blue-600
  if (ratio < 0.66) return '#facc15'; // yellow-400
  return '#dc2626'; // red-600
}

const Legend: React.FC<{ min: number; max: number; metric: string }> = ({ min, max, metric }) => (
  <div className="leaflet-bottom leaflet-left mb-4 ml-4 bg-white bg-opacity-90 rounded shadow p-2 text-xs">
    <div className="font-semibold mb-1">{metric} (by county)</div>
    <div className="flex items-center space-x-2">
      <span className="w-4 h-4 inline-block rounded" style={{ background: '#2563eb' }}></span>
      <span>Low ({min})</span>
      <span className="w-4 h-4 inline-block rounded" style={{ background: '#facc15' }}></span>
      <span>Medium</span>
      <span className="w-4 h-4 inline-block rounded" style={{ background: '#dc2626' }}></span>
      <span>High ({max})</span>
    </div>
  </div>
);

const KansasHeatMap: React.FC<KansasHeatMapProps> = ({ counties, metric, onCountyClick }) => {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const min = Math.min(...counties.map(c => c.value));
  const max = Math.max(...counties.map(c => c.value));

  useEffect(() => {
    fetch('/kansas-counties.geojson')
      .then(res => res.json())
      .then(setGeoJsonData);
  }, []);

  // Map county id to value for fast lookup
  const countyValueMap = Object.fromEntries(counties.map(c => [c.id, c.value]));
  const countyNameMap = Object.fromEntries(counties.map(c => [c.id, c.county_name]));

  function style(feature: any) {
    const id = feature.properties?.id;
    const value = countyValueMap[id];
    return {
      fillColor: getColor(value, min, max),
      weight: 1,
      opacity: 1,
      color: '#888',
      fillOpacity: 0.7,
      cursor: 'pointer',
    };
  }

  function onEachFeature(feature: any, layer: Layer) {
    const id = feature.properties?.id;
    const value = countyValueMap[id];
    const name = countyNameMap[id] || feature.properties?.name;
    layer.on({
      click: () => onCountyClick(id),
    });
    layer.bindTooltip(
      `<strong>${name}</strong><br/>${metric}: ${value ?? 'N/A'}`,
      { sticky: true }
    );
  }

  return (
    <div className="relative w-full h-[600px]">
      <MapContainer
        center={KANSAS_CENTER}
        zoom={INITIAL_ZOOM}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoJsonData && (
          <GeoJSON data={geoJsonData} style={style} onEachFeature={onEachFeature} />
        )}
        <ZoomControl position="topright" />
      </MapContainer>
      <Legend min={min} max={max} metric={metric} />
    </div>
  );
};

export default KansasHeatMap;
