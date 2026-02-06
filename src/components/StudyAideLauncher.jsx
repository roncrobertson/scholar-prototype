import React, { useRef, useEffect } from 'react';
import { studyAides } from '../data/student';
import { StudyAideIcon } from '../utils/studyAideIcons';

/**
 * StudyAideLauncher - Modal to launch different study tools
 * Can be scoped to a specific course or all courses.
 * Focus trap + Escape to close for accessibility.
 */
export function StudyAideLauncher({ course, onClose, onStartSession }) {
  const dialogRef = useRef(null);

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
        className="bg-white rounded-2xl max-w-md w-full p-6" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500">Launch study aide for</p>
            <h2 id="study-aide-title" className="text-xl font-semibold text-gray-900">
              {course?.code || 'All Courses'}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
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
              className="btn-press p-4 bg-gray-50 rounded-xl hover:bg-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all text-left"
              onClick={() => {
                if (onStartSession) onStartSession(aide, course);
                else onClose();
              }}
            >
              <StudyAideIcon aideId={aide.id} className="w-8 h-8 mb-2 text-brand-600" />
              <p className="font-medium text-gray-900">{aide.name}</p>
              <p className="text-xs text-gray-500">{aide.desc}</p>
            </button>
          ))}
        </div>

        {course?.masteryTopics && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-sm text-gray-500 mb-3">Focus on weak areas:</p>
            <div className="flex flex-wrap gap-2">
              {course.masteryTopics
                .filter(t => t.mastery < 70)
                .map((topic, i) => (
                  <span 
                    key={i} 
                    className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
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
