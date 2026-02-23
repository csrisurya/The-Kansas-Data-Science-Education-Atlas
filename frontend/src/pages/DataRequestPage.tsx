import React from 'react';

const DataRequestPage: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-8 relative min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-ksu-purple">DataRequest: Access Raw Data</h2>
        <button
          className="bg-ksu-purple text-white px-4 py-2 rounded shadow hover:bg-ksu-purple/90 transition-colors font-semibold"
          onClick={() => {/* TODO: implement PDF export */}}
        >
          Export PDF
        </button>
      </div>
      <div className="text-gray-600 text-lg">
        Main content area coming soon. Here you will be able to request and access raw data from the Kansas Data Science Education Atlas.
      </div>
    </div>
  );
};

export default DataRequestPage;
