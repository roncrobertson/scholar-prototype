import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { studyAides } from '../data/student';
import { StudyAideIcon } from '../utils/studyAideIcons';

/**
 * StudyModeSwitcher — in-study navigation to switch between study modes (AI Tutor, Smart Notes, Flashcards, etc.).
 * Shown when user is in a study session so they can jump to another mode without exiting.
 */
export function StudyModeSwitcher({ currentAideId, courseLabel, courseColor, onSwitch, onExit }) {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-md overflow-hidden">
      <div className="px-3 py-2 flex flex-wrap items-center gap-2">
        {/* Exit study — prominent on left so it's the primary way to leave */}
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 hover:text-brand-800 transition-colors shrink-0"
          style={courseColor ? { backgroundColor: `${courseColor}18` } : undefined}
          aria-label={`Back to ${courseLabel}`}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" aria-hidden />
          Back to {courseLabel}
        </button>
        <span className="text-gray-200 w-px h-5 shrink-0" aria-hidden />
        <span className="text-xs font-medium text-gray-500 shrink-0">Study:</span>
        {studyAides.map((aide) => {
          const isActive = aide.id === currentAideId;
          return (
            <button
              key={aide.id}
              type="button"
              onClick={() => !isActive && onSwitch(aide.id)}
              disabled={isActive}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'cursor-default ring-1 ring-gray-200 ring-offset-1'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'}
              `}
              style={isActive && courseColor ? { backgroundColor: `${courseColor}15` } : undefined}
              aria-current={isActive ? 'true' : undefined}
              aria-label={isActive ? `${aide.name} (current)` : `Switch to ${aide.name}`}
            >
              <StudyAideIcon aideId={aide.id} className="w-4 h-4 shrink-0" aria-hidden />
              <span>{aide.name}</span>
              {aide.id === 'tutor' && (
                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500" aria-hidden>AI</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default StudyModeSwitcher;
