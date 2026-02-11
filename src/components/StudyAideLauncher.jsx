import React, { useRef, useEffect } from 'react';
import { studyAides } from '../data/student';
import { StudyAideIcon } from '../utils/studyAideIcons';
import { getDueCount } from '../services/spacedReview';
import { getFlaggedForReview, getConfusedConcepts } from '../data/smartNotesReviewFlags';

/**
 * StudyAideLauncher - Modal to launch different study tools
 * Can be scoped to a specific course or all courses.
 * Focus trap + Escape to close for accessibility.
 */
export function StudyAideLauncher({ course, onClose, onStartSession }) {
  const dialogRef = useRef(null);
  const flashcardsDue = course?.id ? getDueCount(course.id, 'flashcards') : 0;
  const flaggedForCourse = course?.id
    ? getFlaggedForReview().filter((f) => f.courseId === course.id).length +
      getConfusedConcepts().filter((c) => c.courseId === course.id).length
    : 0;
  const hasContext = flashcardsDue > 0 || flaggedForCourse > 0;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    const focusables = el.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (first) first.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="study-aide-title"
    >
      <div 
        ref={dialogRef}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 border border-gray-100 dark:border-gray-700" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Launch study aide for</p>
            <h2 id="study-aide-title" className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {course?.code || 'All Courses'}
            </h2>
            {hasContext && (
              <p className="text-sm text-brand-600 dark:text-brand-400 mt-1" aria-live="polite">
                {[
                  flashcardsDue > 0 && `${flashcardsDue} flashcard${flashcardsDue !== 1 ? 's' : ''} due`,
                  flaggedForCourse > 0 && `${flaggedForCourse} flagged for review`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            )}
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {studyAides.map(aide => (
            <button
              key={aide.id}
              type="button"
              className="btn-press p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
              onClick={() => {
                if (onStartSession) onStartSession(aide, course);
                else onClose();
              }}
            >
              <StudyAideIcon aideId={aide.id} className="w-8 h-8 mb-2 text-brand-600" />
              <p className="font-medium text-gray-900 dark:text-gray-100">{aide.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{aide.desc}</p>
            </button>
          ))}
        </div>

        {course?.masteryTopics && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Focus on weak areas:</p>
            <div className="flex flex-wrap gap-2">
              {course.masteryTopics
                .filter(t => t.mastery < 70)
                .map((topic, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded-full text-sm"
                  >
                    {topic.name} ({topic.mastery}%)
                  </span>
                ))
              }
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudyAideLauncher;
