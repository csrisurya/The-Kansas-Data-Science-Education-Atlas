import React from 'react';
import FeatureImportanceChart from '../components/explore/FeatureImportanceChart';
import ModelComparisonChart from '../components/explore/ModelComparisonChart';

const AnalysisPage: React.FC = () => {
  return (
    <div className="flex flex-col w-full">
      <div style={{ height: '1rem' }} />
      <FeatureImportanceChart />
      <div style={{ marginTop: '-22rem' }} />
      <ModelComparisonChart />
    </div>
  );
};

export default AnalysisPage;
