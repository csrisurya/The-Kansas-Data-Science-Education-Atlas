import React from 'react';

interface LoadingProps {
  text?: string;
}

const Loading: React.FC<LoadingProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-ksu-purple border-t-transparent mb-4"></div>
      {text && <div className="text-gray-600 text-lg font-medium">{text}</div>}
    </div>
  );
};

export default Loading;
