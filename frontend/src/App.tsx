import React from 'react';

const navTabs = [
  'Explore',
  'Compare',
  'Search',
  'Resources',
  'Data Request',
];

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-ksu-purple text-white py-6 px-4">
        <h1 className="text-3xl font-bold mb-2">Kansas Data Science Education Atlas</h1>
        <p className="text-lg mb-4">Mapping DS/AI Education Across All 105 Counties</p>
        <nav>
          <ul className="flex space-x-6">
            {navTabs.map(tab => (
              <li key={tab}>
                <button className="text-white font-semibold hover:underline focus:outline-none">{tab}</button>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="container mx-auto p-6">
        {/* Main dashboard content goes here */}
      </main>
    </div>
  );
};

export default App;
