import React from 'react';
import FeatureImportanceChart from '../components/explore/FeatureImportanceChart';

const AnalysisPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <FeatureImportanceChart />
    </div>
  );
};

export default AnalysisPage;
