
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
  {
    name: 'Explore',
    key: 'explore',
    description: 'Explore the geographic distribution of Data Science/Artificial Intelligence education across all 105 Kansas counties.\nToggle between metrics like course counts, broadband access, and population to see how resources are spread across the state.',
  },
  {
    name: 'Compare',
    key: 'compare',
    description: 'Compare Kansas counties side-by-side on demographics, educational infrastructure,\ndigital access, and Data Science/Artificial Intelligence program availability.',
  },
  {
    name: 'Analysis',
    key: 'analysis',
    description: 'Review the machine learning analysis behind the Atlas — which county-level features\nmost predict Data Science/Artificial Intelligence program presence, and how the classification models performed.',
  },
  {
    name: 'Recommendations',
    key: 'recommendations',
    description: 'Discover which counties are best positioned for new Data Science/Artificial Intelligence programs,\nwhere educational deserts exist, and strategies for expanding access.',
  },
  {
    name: 'Search',
    key: 'search',
    description: 'Search and filter Data Science/Artificial Intelligence programs, courses, and institutions across Kansas.\nFind offerings by keyword, degree level, modality, or county.',
  },
  {
    name: 'Data Request',
    key: 'datarequest',
    description: 'Request custom reports or raw datasets from the Atlas for your own research, policy analysis, or planning needs.',
  },
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
  const activeDescription = navTabs.find(tab => tab.key === activeTab)?.description || '';
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
      {/* Section Description Bar */}
      <div className="w-full py-4 border-b border-indigo-100 bg-indigo-50/60 text-center">
        <p className="text-base leading-relaxed m-0 mx-auto text-center" style={{ color: '#6d4c9e', whiteSpace: 'pre-line' }}>{activeDescription}</p>
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
