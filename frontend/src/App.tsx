
import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Header from './components/common/Header';
import ExplorePage from './pages/ExplorePage';
import ComparePage from './pages/ComparePage';
import SearchPage from './pages/SearchPage';
import RecommendationPage from './pages/RecommendationPage';
import DataRequestPage from './pages/DataRequestPage';

const navTabs = [
  { name: 'Explore', path: '/explore' },
  { name: 'Compare', path: '/compare' },
  { name: 'Search', path: '/search' },
  { name: 'Recommendations', path: '/recommendations' },
  { name: 'Data Request', path: '/data-request' },
];

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Header />
        <nav className="bg-gray-100 border-b border-gray-200">
          <ul className="flex space-x-6 px-6 py-2">
            {navTabs.map(tab => (
              <li key={tab.name}>
                <NavLink
                  to={tab.path}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded font-semibold transition-colors duration-150 ${
                      isActive
                        ? 'bg-ksu-purple text-white shadow'
                        : 'text-ksu-purple hover:bg-ksu-purple/10'
                    }`
                  }
                  end
                >
                  {tab.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="container mx-auto p-6">
          <Routes>
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/recommendations" element={<RecommendationPage />} />
            <Route path="/data-request" element={<DataRequestPage />} />
            <Route path="/" element={<Navigate to="/explore" replace />} />
            <Route path="*" element={<Navigate to="/explore" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
