
import React, { useState } from 'react';
import ExplorePage from './pages/ExplorePage';
import ComparePage from './pages/ComparePage';
import SearchPage from './pages/SearchPage';
import RecommendationPage from './pages/RecommendationPage';
import DataRequestPage from './pages/DataRequestPage';

const navTabs = [
  { name: 'Explore', key: 'explore', section: 'Geographic Distribution' },
  { name: 'Compare', key: 'compare', section: 'County Profiles' },
  { name: 'Search', key: 'search', section: 'Find DS/AI Offerings' },
  { name: 'Recommendations', key: 'recommendations', section: 'Gap Analysis & Opportunities' },
  { name: 'Data Request', key: 'datarequest', section: 'Access Raw Data' },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const activeSection = navTabs.find(tab => tab.key === activeTab)?.section || '';
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      {/* Global Header */}
      <header className="bg-white py-5 border-b border-gray-200 text-center">
        <h1 className="text-3xl font-bold tracking-widest uppercase text-gray-900">THE KANSAS DATA SCIENCE EDUCATION ATLAS</h1>
      </header>
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <ul className="flex justify-center gap-8 py-3 list-none m-0 p-0">
          {navTabs.map(tab => (
            <li key={tab.key}>
              <button
                onClick={() => setActiveTab(tab.key)}
                className={`bg-transparent border-none outline-none cursor-pointer px-1 pb-2 text-lg font-medium transition-all duration-150 ${
                  activeTab === tab.key
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-600 hover:text-indigo-600 border-b-2 border-transparent'
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
      <div className="w-full px-6 py-3 flex items-center justify-between border border-indigo-200 bg-indigo-50">
        <span className="text-lg font-semibold" style={{ color: '#512888' }}>{activeSection}</span>
        {activeTab !== 'datarequest' && (
          <button
            className="bg-transparent border-none outline-none cursor-pointer text-indigo-600 font-bold text-sm hover:underline"
            type="button"
          >
            Export PDF
          </button>
        )}
      </div>
      {/* Main Content Area: Only show the active tab's content */}
      <main className="flex-1 w-full px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-8 min-h-[400px]">
          {activeTab === 'explore' && <ExplorePage />}
          {activeTab === 'compare' && <ComparePage />}
          {activeTab === 'search' && <SearchPage />}
          {activeTab === 'recommendations' && <RecommendationPage />}
          {activeTab === 'datarequest' && <DataRequestPage />}
        </div>
      </main>
    </div>
  );
};

export default App;
