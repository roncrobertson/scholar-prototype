import React from 'react';
import { StudyAideIcon } from '../utils/studyAideIcons';

/**
 * Placeholder view when a study aide is "launched".
 * In production this would be the actual flashcards / practice test / etc.
 */
export function StudySessionPlaceholder({ aide, course, onExit }) {
  const courseLabel = course?.code || 'All Courses';

  return (
    <div className="fade-in bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
      {aide?.id && <StudyAideIcon aideId={aide.id} className="w-12 h-12 mx-auto mb-4 text-brand-500 dark:text-brand-400" />}
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {aide?.name || 'Study session'}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mt-1">
        {courseLabel} • Coming soon
      </p>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-2 max-w-sm mx-auto">
        This will open the full {aide?.name?.toLowerCase() || 'study'} experience. For now, use your existing tools and return here to track progress.
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
        Use the bar above to switch to another study mode or back to course.
      </p>
    </div>
  );
}

export default StudySessionPlaceholder;
