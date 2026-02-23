import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'purple' | 'yellow' | 'green';
}

const colorMap: Record<NonNullable<StatsCardProps['color']>, string> = {
  blue: 'border-blue-500',
  purple: 'border-ksu-purple',
  yellow: 'border-yellow-400',
  green: 'border-green-500',
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color = 'blue' }) => {
  return (
    <div
      className={`flex items-center bg-white rounded-lg shadow p-4 border-l-8 ${colorMap[color]} min-w-[220px]`}
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
