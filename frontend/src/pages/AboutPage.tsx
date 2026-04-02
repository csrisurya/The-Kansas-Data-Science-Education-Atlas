import React from 'react';

const contributors = [
  { name: 'Srisurya Chandramouli', email: 'sschandr@ksu.edu' },
  { name: 'Bharaneeshwar Balasubramaniyam', email: 'bharanibala@ksu.edu' },
  { name: 'Safia Malallah', email: 'safia@ksu.edu' },
  { name: 'Lior Shamir', email: 'lshamir@ksu.edu' },
];

const AboutPage: React.FC = () => (
  <div className="flex gap-10 w-full">
    {/* Left side */}
    <div className="flex-1">
      <div style={{ height: '2rem' }} />
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">About the Atlas</h3>
        <p className="text-gray-600 leading-relaxed">
          The Kansas Data Science Education Atlas maps Data Science and Artificial Intelligence
          educational offerings across all 105 Kansas counties. It examines how educational,
          socioeconomic, and digital factors relate to program availability, helping identify
          where targeted investment can expand access to DS/AI education.
        </p>
      </section>

      <div style={{ height: '2rem' }} />
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Funding &amp; Affiliation</h3>
        <p className="text-gray-600 leading-relaxed">
          This work was funded by the National Science Foundation (NSF), Grant No. 2148878.
        </p>
        <p className="text-gray-600 leading-relaxed mt-2">
          College of Arts &amp; Sciences — Kansas State University
        </p>
      </section>
    </div>

    {/* Right side */}
    <div className="flex-1">
      <div style={{ height: '2rem' }} />
      <section>
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Contributors</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {contributors.map((c) => (
            <li key={c.email} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-5 py-3">
              <div>
                <p className="font-semibold text-gray-800">{c.name}</p>
                <p className="text-sm text-indigo-600">{c.email}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  </div>
);

export default AboutPage;
