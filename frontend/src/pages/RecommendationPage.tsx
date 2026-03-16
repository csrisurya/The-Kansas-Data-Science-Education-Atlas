import React from 'react';
import FalsePositivesSection from '../components/recommendation/FalsePositivesSection';
import EducationalDesertMap from '../components/recommendation/EducationalDesertMap';
import InterventionStrategies from '../components/recommendation/InterventionStrategies';

const RecommendationPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div style={{ height: '2rem' }} />
      <FalsePositivesSection />
      <div style={{ height: '2rem' }} />
      <EducationalDesertMap />
      <div style={{ height: '2rem' }} />
      <InterventionStrategies />
    </div>
  );
};

export default RecommendationPage;
