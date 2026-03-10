import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import StatsCard from '../common/StatsCard';

const MAJOR_HUBS = ['Lawrence', 'Manhattan', 'Wichita'];

const QuickStats: React.FC = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['county-statistics'],
    queryFn: () => apiService.getCountyStatistics(),
    staleTime: 10 * 60 * 1000, // 10 min cache
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return null; // silently hide on error
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      <StatsCard
        title="Total Counties"
        value={data.total_counties}
        color="blue"
      />
      <StatsCard
        title="Counties with No Programs"
        value={data.counties_without_programs}
        color="yellow"
      />
      <StatsCard
        title="Counties with Programs"
        value={data.counties_with_programs}
        color="green"
      />
      <div className="bg-purple-100 rounded-lg shadow p-4">
        <div className="text-gray-500 text-sm font-medium mb-1">Major Hubs</div>
        <div className="text-2xl font-bold text-gray-900 mb-2">{MAJOR_HUBS.length}</div>
        <div className="flex flex-wrap gap-1.5">
          {MAJOR_HUBS.map((hub) => (
            <span
              key={hub}
              className="inline-block bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {hub}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
