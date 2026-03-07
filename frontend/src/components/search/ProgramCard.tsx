import type { Course } from '../../types/atlas';

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface ProgramCardProps {
  /** Representative course entry (carries school-level info) */
  program: Course;
  /** All courses belonging to this program / school */
  courses?: Course[];
  onExpand: () => void;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const MODALITY_STYLES: Record<string, { bg: string; text: string }> = {
  online:    { bg: 'bg-green-100',  text: 'text-green-700' },
  'in-person': { bg: 'bg-blue-100',   text: 'text-blue-700' },
};

function modalityStyle(modality: string) {
  const key = modality.toLowerCase().trim();
  return MODALITY_STYLES[key] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
}

function levelBadge(level: string) {
  const lower = level.toLowerCase();
  if (lower.includes('graduate') && !lower.includes('under'))
    return { label: 'Graduate', bg: 'bg-amber-100', text: 'text-amber-700' };
  return { label: 'Undergraduate', bg: 'bg-sky-100', text: 'text-sky-700' };
}

/** Deduplicate & collect unique values from an array of Courses */
function uniqueValues(courses: Course[], key: keyof Course): string[] {
  const set = new Set<string>();
  for (const c of courses) {
    const val = String(c[key] ?? '').trim();
    if (val && val !== 'DNE') set.add(val);
  }
  return [...set];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const ProgramCard: React.FC<ProgramCardProps> = ({ program, courses = [] }) => {
  const allCourses = courses.length > 0 ? courses : [program];
  const courseCount = allCourses.filter(
    (c) => c.course_name && c.course_name !== 'DNE',
  ).length;

  const allValidCourses = allCourses.filter(
    (c) => c.course_name && c.course_name !== 'DNE',
  );

  return (
    <div className="group rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
      {/* ---- Header ---- */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* School name */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-gray-900 leading-snug">
              {program.school_name}
            </h3>
          </div>

          {/* Course count pill */}
          {courseCount > 0 && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                <circle cx="12" cy="12" r="10" />
              </svg>
              {courseCount} {courseCount === 1 ? 'Course' : 'Courses'}
            </span>
          )}
        </div>
      </div>

      {/* ---- Courses ---- */}
      {allValidCourses.length > 0 && (
        <div className="px-5 pb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Courses
          </p>
          <ul className="space-y-1.5 max-h-60 overflow-y-auto">
            {allValidCourses.map((c) => {
              const lvl = (c.level ?? '').trim();
              const mod = (c.modality ?? '').trim();
              const showLevel = lvl && lvl !== 'DNE';
              const showMod = mod && mod !== 'DNE';
              const modTags = mod.toLowerCase() === 'both'
                ? ['In-person', 'Online']
                : [mod];
              return (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  {c.course_code && c.course_code !== 'DNE' && (
                    <span className="shrink-0 font-mono text-xs text-indigo-600">{c.course_code}</span>
                  )}
                  <span className="text-gray-700">{c.course_name}</span>
                  {showLevel && (
                    <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${levelBadge(lvl).bg} ${levelBadge(lvl).text}`}>
                      {levelBadge(lvl).label}
                    </span>
                  )}
                  {showMod && modTags.map((m) => {
                    const s = modalityStyle(m);
                    return (
                      <span key={m} className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${s.bg} ${s.text}`}>
                        {m}
                      </span>
                    );
                  })}
                  {c.course_url && c.course_url !== 'DNE' && (
                    <a
                      href={c.course_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 inline-flex items-center gap-0.5 text-[10px] font-medium text-indigo-600 hover:text-indigo-800 hover:underline ml-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Catalog
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}


    </div>
  );
};

export default ProgramCard;
