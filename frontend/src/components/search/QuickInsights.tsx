import { useMemo } from 'react';
import type { Course } from '../../types/atlas';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface QuickInsightsProps {
  programs: Course[];
  totalCount: number;
}

/* ------------------------------------------------------------------ */
/*  Keyword extraction (bigrams + unigrams)                            */
/* ------------------------------------------------------------------ */

/** Common stop-words to skip */
const STOP = new Set([
  'the', 'and', 'for', 'with', 'from', 'into', 'this', 'that', 'their',
  'about', 'through', 'using', 'based', 'introduction', 'intro', 'topics',
  'special', 'advanced', 'applied', 'course', 'courses',
]);

function extractKeywords(courses: Course[]) {
  const counts: Record<string, number> = {};

  for (const c of courses) {
    const name = (c.course_name ?? '').trim();
    if (!name || name === 'DNE') continue;

    const words = name
      .split(/\s+/)
      .map((w) => w.replace(/[^a-zA-Z]/g, ''))
      .filter((w) => w.length > 2 && !STOP.has(w.toLowerCase()));

    // Bigrams (more descriptive)
    for (let i = 0; i < words.length - 1; i++) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      counts[bigram] = (counts[bigram] ?? 0) + 1;
    }

    // Unigrams as fallback
    for (const w of words) {
      const lower = w.toLowerCase();
      counts[w] = (counts[lower] ?? 0) + 1;
    }
  }

  // Prefer bigrams with count > 1, then single words
  return Object.entries(counts)
    .filter(([, n]) => n > 1)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const QuickInsights: React.FC<QuickInsightsProps> = ({ programs, totalCount }) => {
  const insights = useMemo(() => {
    if (programs.length === 0) return null;

    /* --- Degree level counts --- */
    const levelCounts: Record<string, number> = {};
    let onlineCount = 0;
    let validLevelTotal = 0;

    for (const p of programs) {
      const lvl = (p.level ?? '').trim();
      if (lvl && lvl !== 'DNE') {
        levelCounts[lvl] = (levelCounts[lvl] ?? 0) + 1;
        validLevelTotal++;
      }

      const mod = (p.modality ?? '').toLowerCase().trim();
      if (mod === 'online') onlineCount++;
    }

    const topLevelEntry = Object.entries(levelCounts).sort((a, b) => b[1] - a[1])[0];
    const topLevelLabel = topLevelEntry?.[0] ?? '—';
    const topLevelPct = topLevelEntry && validLevelTotal > 0
      ? Math.round((topLevelEntry[1] / validLevelTotal) * 100)
      : 0;

    const onlinePct = programs.length > 0
      ? Math.round((onlineCount / programs.length) * 100)
      : 0;

    const keywords = extractKeywords(programs);

    return { topLevelLabel, topLevelPct, onlinePct, keywords };
  }, [programs]);

  if (!insights) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {/* Total programs */}
      <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <span className="mt-0.5 flex items-center justify-center h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Programs</p>
          <p className="mt-0.5 text-lg font-bold text-gray-900">{totalCount.toLocaleString()}</p>
        </div>
      </div>

      {/* Most common degree level */}
      <div className="flex items-start gap-3 rounded-lg border border-sky-100 bg-sky-50/60 px-4 py-3">
        <span className="mt-0.5 flex items-center justify-center h-8 w-8 rounded-lg bg-sky-100 text-sky-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422A12.083 12.083 0 0121 12.08V17L12 22 3 17v-4.92c0-.53.18-1.04.5-1.46L12 14z" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-medium text-sky-600 uppercase tracking-wide">Top Degree Level</p>
          <p className="mt-0.5 text-sm font-bold text-sky-900">
            {insights.topLevelLabel}
            {insights.topLevelPct > 0 && (
              <span className="ml-1 text-xs font-normal text-sky-600">({insights.topLevelPct}%)</span>
            )}
          </p>
        </div>
      </div>

      {/* Online availability */}
      <div className="flex items-start gap-3 rounded-lg border border-green-100 bg-green-50/60 px-4 py-3">
        <span className="mt-0.5 flex items-center justify-center h-8 w-8 rounded-lg bg-green-100 text-green-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Online Availability</p>
          <p className="mt-0.5 text-lg font-bold text-green-900">{insights.onlinePct}%</p>
        </div>
      </div>

      {/* Top keywords */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50/60 px-4 py-3">
        <span className="mt-0.5 flex items-center justify-center h-8 w-8 rounded-lg bg-amber-100 text-amber-600 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">Top Keywords</p>
          {insights.keywords.length > 0 ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {insights.keywords.map(([word, count]) => (
                <span
                  key={word}
                  className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800"
                >
                  {word}
                  <span className="ml-1 text-amber-500">({count})</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-0.5 text-sm font-bold text-amber-900">—</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickInsights;
