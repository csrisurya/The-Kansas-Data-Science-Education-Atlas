
import React, { useState, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import ErrorBoundary from './components/common/ErrorBoundary';
import ExplorePage from './pages/ExplorePage';
import ComparePage from './pages/ComparePage';
import SearchPage from './pages/SearchPage';
import AnalysisPage from './pages/AnalysisPage';
import RecommendationPage from './pages/RecommendationPage';
import DataRequestPage from './pages/DataRequestPage';
import AboutPage from './pages/AboutPage';
import Footer from './components/common/Footer';

const MAX_COUNTIES = 4;

const navTabs = [
  {
    name: 'Explore',
    key: 'explore',
    description: 'Explore the geographic distribution of Data Science/Artificial Intelligence education across all 105 Kansas counties. Toggle between metrics like course counts,\nbroadband access, and population to see how resources are spread across the state.',
  },
  {
    name: 'Compare',
    key: 'compare',
    description: 'Compare Kansas counties side-by-side on demographics, educational infrastructure, digital access, and Data Science/Artificial Intelligence program availability.',
  },
  {
    name: 'Analysis',
    key: 'analysis',
    description: 'Review the machine learning analysis behind the Atlas — which county-level features most predict Data Science/Artificial Intelligence program presence, and how the\nclassification models performed.',
  },
  {
    name: 'Recommendations',
    key: 'recommendations',
    description: 'Discover which counties are best positioned for new Data Science/Artificial Intelligence programs, where educational deserts exist, and strategies for expanding access.',
  },
  {
    name: 'Search',
    key: 'search',
    description: 'Search and filter Data Science/Artificial Intelligence programs, courses, and institutions across Kansas. Find offerings by keyword, degree level, modality, or county.',
  },
  {
    name: 'Data Request',
    key: 'datarequest',
    description: 'Request custom reports or raw datasets from the Atlas for your own research, policy analysis, or planning needs.',
  },
  {
    name: 'About',
    key: 'about',
    description: 'Learn about the Kansas Data Science Education Atlas and the people behind it.',
  },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedCounties, setSelectedCounties] = useState<(number | null)[]>([
    null, null, null, null,
  ]);
  const [isExporting, setIsExporting] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const handleExport = useCallback(async () => {
    if (!pageRef.current || isExporting) return;
    setIsExporting(true);
    try {
      const imgData = await toPng(pageRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList?.contains('leaflet-control-zoom')) return false;
          return true;
        },
      });
      // Create a temporary hidden iframe for print preview
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <html>
            <head>
              <title>Atlas - ${activeTab}</title>
              <style>
                body { margin: 0; }
                img { width: 100%; height: auto; }
              </style>
            </head>
            <body><img src="${imgData}" /></body>
          </html>
        `);
        doc.close();
        // Wait for image to load then print
        const img = doc.querySelector('img');
        const doPrint = () => {
          iframe.contentWindow?.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
        };
        if (img?.complete) {
          doPrint();
        } else {
          img?.addEventListener('load', doPrint);
        }
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsExporting(false);
    }
  }, [activeTab, isExporting]);

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
    <div ref={pageRef} className="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-sans">
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
      <div style={{ height: '1rem' }} />
      {/* Section Description Bar */}
      <div className="w-full py-4 border-b border-indigo-100 bg-indigo-50/60 relative flex items-center justify-center px-6">
        <p className="text-base leading-relaxed m-0 text-center" style={{ color: '#6d4c9e', whiteSpace: 'pre-line' }}>{activeDescription}</p>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="absolute right-6 flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting ? 'Capturing…' : 'Export Page'}
        </button>
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
            {activeTab === 'about' && <AboutPage />}
          </ErrorBoundary>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
