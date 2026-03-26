
import React, { useState, useCallback } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import ExplorePage from './pages/ExplorePage';
import ComparePage from './pages/ComparePage';
import SearchPage from './pages/SearchPage';
import AnalysisPage from './pages/AnalysisPage';
import RecommendationPage from './pages/RecommendationPage';
import DataRequestPage from './pages/DataRequestPage';
import Footer from './components/common/Footer';

const MAX_COUNTIES = 4;

const navTabs = [
  { name: 'Explore', key: 'explore', section: 'Geographic Distribution' },
  { name: 'Compare', key: 'compare', section: 'County Profiles' },
  { name: 'Search', key: 'search', section: 'Find DS/AI Offerings' },
  { name: 'Analysis', key: 'analysis', section: 'Feature Importance Analysis' },
  { name: 'Recommendations', key: 'recommendations', section: 'Gap Analysis & Opportunities' },
  { name: 'Data Request', key: 'datarequest', section: 'Access Raw Data' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCounties, setSelectedCounties] = useState<(number | null)[]>([
    null, null, null, null,
  ]);

  const handleCountyChange = useCallback((slotIndex: number, countyId: number | null) => {
    setSelectedCounties((prev) => {
      if (countyId != null) {
        const next = [...prev];
        next[slotIndex] = countyId;
        return next;
      }
      const next = [...prev];
      next[slotIndex] = null;
      const filled = next.filter((id) => id != null);
      return Array.from({ length: MAX_COUNTIES }, (_, i) => filled[i] ?? null);
    });
  }, []);
  const activeSection = navTabs.find(tab => tab.key === activeTab)?.section || '';
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
      {/* Global Header */}
      <header className="bg-white pt-8 pb-5 border-b border-gray-100 text-center">
        <h1 className="text-3xl font-bold tracking-widest uppercase text-gray-700">THE KANSAS DATA SCIENCE EDUCATION ATLAS</h1>
      </header>
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-100">
        <ul className="flex justify-center gap-8 py-3 list-none m-0 p-0">
          {navTabs.map(tab => (
            <li key={tab.key}>
              <button
                onClick={() => setActiveTab(tab.key)}
                className={`bg-transparent border-none outline-none cursor-pointer px-1 pb-2 text-lg font-medium transition-all duration-150 ${
                  activeTab === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-indigo-500 border-b-2 border-transparent'
                }`}
                type="button"
              >
                {tab.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      {/* Section Bar */}
      <div className="w-full px-6 py-3 flex items-center justify-between border-b border-indigo-100 bg-indigo-50/60">
        <span className="text-lg font-semibold" style={{ color: '#6d4c9e' }}>{activeSection}</span>
        <div className="flex items-center gap-4">
          {activeTab !== 'datarequest' && (
            <button
              className="bg-transparent border-none outline-none cursor-pointer text-indigo-600 font-bold text-sm hover:underline"
              type="button"
            >
              Export PDF
            </button>
          )}
        </div>
      </div>
      {/* Main Content Area: Only show the active tab's content */}
      <main className="flex-1 w-full px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-8 min-h-[400px]">
          <ErrorBoundary>
            {activeTab === 'explore' && <ExplorePage />}
            {activeTab === 'compare' && <ComparePage selectedCounties={selectedCounties} onCountyChange={handleCountyChange} />}
            {activeTab === 'search' && <SearchPage />}
            {activeTab === 'analysis' && <AnalysisPage />}
            {activeTab === 'recommendations' && <RecommendationPage />}
            {activeTab === 'datarequest' && <DataRequestPage />}
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
