import React, { useState } from 'react';
import Button from '../common/Button';

interface MapControlsProps {
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  onSearch: (query: string) => void;
}

const METRICS = [
  { label: 'Total Impact Score', value: 'total_impact_score' },
  { label: 'Online Impact Score', value: 'online_impact_score' },
  { label: 'Course Count', value: 'course_count' },
  { label: 'Broadband Access Index', value: 'broadband_access_index' },
];

const MapControls: React.FC<MapControlsProps> = ({ selectedMetric, onMetricChange, onSearch }) => {
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(search);
  };

  return (
    <aside className="w-full max-w-xs bg-white rounded-lg shadow p-6 flex flex-col gap-6">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Search counties..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ksu-purple"
        />
        <Button type="submit" variant="primary" size="sm">Search</Button>
      </form>
      <div>
        <div className="font-semibold text-gray-700 mb-2">Select Metric</div>
        <div className="flex flex-col gap-2">
          {METRICS.map(metric => (
            <label key={metric.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="metric"
                value={metric.value}
                checked={selectedMetric === metric.value}
                onChange={() => onMetricChange(metric.value)}
                className="accent-ksu-purple"
              />
              <span className="text-gray-700">{metric.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" size="sm" onClick={() => onSearch('')}>Clear Selection</Button>
        <Button variant="secondary" size="sm" onClick={() => {/* TODO: implement PNG download */}}>Download Map as PNG</Button>
      </div>
    </aside>
  );
};

export default MapControls;
