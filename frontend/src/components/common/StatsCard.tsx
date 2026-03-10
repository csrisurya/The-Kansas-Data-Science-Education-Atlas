import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'yellow' | 'green';
}

const colorMap: Record<NonNullable<StatsCardProps['color']>, string> = {
  blue: 'bg-blue-100',
  purple: 'bg-purple-100',
  yellow: 'bg-yellow-100',
  green: 'bg-green-100',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'blue' }) => {
  return (
    <div
      className={`flex items-center rounded-lg shadow p-4 ${colorMap[color]}`}
    >
      {icon && (
        <div className="mr-4 text-3xl text-gray-500 flex-shrink-0">{icon}</div>
      )}
      <div>
        <div className="text-gray-500 text-sm font-medium mb-1">{title}</div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
};

export default StatsCard;
