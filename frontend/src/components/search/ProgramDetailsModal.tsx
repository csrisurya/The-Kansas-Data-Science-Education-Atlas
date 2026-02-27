import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../services/api';
import type { Course } from '../../types/atlas';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ProgramDetailsModalProps {
  schoolName: string;
  isOpen: boolean;
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MODALITY_STYLES: Record<string, { bg: string; text: string }> = {
  online:      { bg: 'bg-green-100',  text: 'text-green-700' },
  'in-person': { bg: 'bg-blue-100',   text: 'text-blue-700' },
  hybrid:      { bg: 'bg-purple-100', text: 'text-purple-700' },
};

const LEVEL_STYLES: Record<string, { bg: string; text: string }> = {
  undergraduate: { bg: 'bg-sky-100',   text: 'text-sky-700' },
  graduate:      { bg: 'bg-amber-100', text: 'text-amber-700' },
};

function badgeStyle(map: Record<string, { bg: string; text: string }>, value: string) {
  return map[value.toLowerCase().trim()] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
}

function isDNE(val: string | undefined | null): boolean {
  return !val || val.trim() === '' || val.trim() === 'DNE';
}

/** Group courses by level (Undergraduate / Graduate / Other) */
function groupByLevel(courses: Course[]) {
  const groups: Record<string, Course[]> = {};
  for (const c of courses) {
    const level = isDNE(c.level) ? 'Other' : c.level.trim();
    if (!groups[level]) groups[level] = [];
    groups[level].push(c);
  }
  // Sort so Undergraduate comes first, Graduate second, rest after
  const order = ['Undergraduate', 'Graduate'];
  const sorted = Object.entries(groups).sort(([a], [b]) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b);
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
  return sorted;
}

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-48 rounded bg-gray-200" />
          </div>
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-5/6 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ProgramDetailsModal: React.FC<ProgramDetailsModalProps> = ({
  schoolName,
  isOpen,
  onClose,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  /* Fetch all courses for this school */
  const { data: courses = [], isLoading, isError } = useQuery<Course[]>({
    queryKey: ['programs-by-school', schoolName],
    queryFn: async () => {
      const res = await apiService.searchPrograms({ school_name: schoolName });
      // The list endpoint returns { total, programs } or a plain array
      if (res && typeof res === 'object' && 'programs' in (res as any)) {
        return (res as any).programs as unknown as Course[];
      }
      return (res ?? []) as unknown as Course[];
    },
    enabled: isOpen && !!schoolName,
  });

  /* Close on Escape key */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  /* Prevent body scroll while open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const grouped = groupByLevel(courses);

  // Derive location & catalog URL from first course that has them
  const firstWithUrl = courses.find((c) => !isDNE(c.course_url));

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Modal panel */}
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl bg-white shadow-xl overflow-hidden">
        {/* ---- Header ---- */}
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{schoolName}</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ---- Scrollable body ---- */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {isLoading && <Skeleton />}

          {isError && (
            <p className="text-sm text-red-600">Failed to load courses. Please try again.</p>
          )}

          {!isLoading && !isError && courses.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No courses found for this school.</p>
          )}

          {/* Grouped course list */}
          {grouped.map(([level, list]) => (
            <section key={level}>
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                {(() => { const s = badgeStyle(LEVEL_STYLES, level); return (
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
                    {level}
                  </span>
                ); })()}
                <span className="text-gray-400 text-xs font-normal normal-case">
                  ({list.length})
                </span>
              </h3>

              <ul className="space-y-3">
                {list.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 hover:border-gray-200 transition-colors"
                  >
                    {/* Top row: code + name + modality badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        {!isDNE(c.course_code) && (
                          <span className="font-mono text-xs text-indigo-600 font-semibold">{c.course_code}</span>
                        )}
                        <span className="text-sm font-medium text-gray-800">
                          {isDNE(c.course_name) ? '(Untitled)' : c.course_name}
                        </span>
                      </div>
                      {!isDNE(c.modality) && (() => {
                        const s = badgeStyle(MODALITY_STYLES, c.modality);
                        return (
                          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}>
                            {c.modality}
                          </span>
                        );
                      })()}
                    </div>

                    {/* Degree & department */}
                    {(!isDNE(c.degree_name) || !isDNE(c.dept_name)) && (
                      <p className="mt-1 text-xs text-gray-500">
                        {[c.degree_name, c.dept_name].filter((v) => !isDNE(v)).join(' · ')}
                      </p>
                    )}

                    {/* Description */}
                    {!isDNE(c.description) && (
                      <p className="mt-1.5 text-xs text-gray-600 leading-relaxed line-clamp-3">
                        {c.description}
                      </p>
                    )}

                    {/* Course URL */}
                    {!isDNE(c.course_url) && (
                      <a
                        href={c.course_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        View Details
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {/* ---- Footer ---- */}
        <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-between bg-gray-50">
          {firstWithUrl && (
            <a
              href={firstWithUrl.course_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Full Catalog
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailsModal;
