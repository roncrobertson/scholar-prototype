import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { studyAides } from '../data/student';
import { StudyAideIcon } from '../utils/studyAideIcons';

/**
 * StudyModeSwitcher — in-study navigation to switch between study modes (AI Tutor, Smart Notes, Flashcards, etc.).
 * Shown when user is in a study session so they can jump to another mode without exiting.
 * Layout: row 1 = Back to course; row 2 = segmented control (single row, no wrap; scrolls horizontally on narrow screens).
 */
export function StudyModeSwitcher({ currentAideId, courseLabel, courseColor, onSwitch, onExit }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-600 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-sm overflow-hidden">
      {/* Row 1: Back to course — compact, always one line */}
      <div className="flex items-center gap-3 px-3 py-2 border-b border-gray-100 dark:border-gray-700/80">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-900/40 hover:bg-brand-100 dark:hover:bg-brand-800/50 transition-colors shrink-0 btn-press"
          style={courseColor ? { backgroundColor: `${courseColor}18` } : undefined}
          aria-label={`Back to ${courseLabel}`}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
          Back to {courseLabel}
        </button>
      </div>

      {/* Row 2: Study modes — segmented control, single row, horizontal scroll if needed (no wrap) */}
      <div className="p-2">
        <div
          className="flex items-center flex-nowrap gap-0.5 overflow-x-auto scrollbar-hide min-h-9 rounded-lg bg-gray-100 dark:bg-gray-700/50 p-1 scroll-smooth snap-x snap-mandatory"
          role="tablist"
          aria-label="Study mode"
        >
          {studyAides.map((aide, index) => {
            const isActive = aide.id === currentAideId;
            const isFirst = index === 0;
            const isLast = index === studyAides.length - 1;
            return (
              <button
                key={aide.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={isActive ? `${aide.name} (current)` : `Switch to ${aide.name}`}
                onClick={() => !isActive && onSwitch(aide.id)}
                disabled={isActive}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors shrink-0 btn-press snap-start
                  ${isFirst ? 'rounded-l-md' : ''}
                  ${isLast ? 'rounded-r-md' : ''}
                  ${isActive
                    ? 'cursor-default shadow-sm bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200/80 dark:hover:bg-gray-600/80'}
                `}
                style={
                  isActive && courseColor
                    ? { backgroundColor: `${courseColor}22`, color: courseColor }
                    : undefined
                }
              >
                <StudyAideIcon aideId={aide.id} className="w-4 h-4 shrink-0" aria-hidden />
                <span>{aide.name}</span>
                {aide.id === 'tutor' && (
                  <span
                    className="rounded bg-gray-200/80 dark:bg-gray-600/80 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:text-gray-300"
                    aria-hidden
                  >
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudyModeSwitcher;
