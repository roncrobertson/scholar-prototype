import React from 'react';
import { studyAides } from '../../data/student';
import { StudyAideIcon } from '../../utils/studyAideIcons';
import { getDueCount } from '../../services/spacedReview';

/**
 * CourseScreen - Individual course detail view
 */
export function CourseScreen({ course, onShowStudyAides, onStartStudyAide }) {
  if (!course) return null;

  const flashcardsDueCount = getDueCount(course.id, 'flashcards');

  return (
    <div className="fade-in space-y-6">
      {/* Flashcards due for review */}
      {flashcardsDueCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-900 dark:text-amber-200">Due for review</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">{flashcardsDueCount} flashcard{flashcardsDueCount === 1 ? '' : 's'} ready for spaced review</p>
          </div>
          <button
            onClick={() => onStartStudyAide && onStartStudyAide('flashcards', course)}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Review Flashcards →
          </button>
        </div>
      )}

      {/* Course Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="h-2" style={{ backgroundColor: course.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {course.code}: {course.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{course.schedule} • {course.room}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: course.color }}>
                {course.grade}%
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Target: {course.target}%</p>
            </div>
          </div>

          {/* Study Aide Launcher — direct to tool when clicked */}
          <div className="mt-6 flex gap-2 flex-wrap">
            {studyAides.slice(0, 4).map(aide => (
              <button
                key={aide.id}
                onClick={() => (onStartStudyAide ? onStartStudyAide(aide.id, course) : onShowStudyAides(course))}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <StudyAideIcon aideId={aide.id} className="w-4 h-4 shrink-0" />
                {aide.name}
              </button>
            ))}
            <button
              onClick={() => onShowStudyAides(course)}
              className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
            >
              All study aides →
            </button>
          </div>
        </div>
      </div>

      {/* Instructor Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-semibold text-white"
            style={{ backgroundColor: course.color }}
          >
            {course.instructor.initials}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{course.instructor.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{course.instructor.style}</p>
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                💡 <strong>Tip:</strong> {course.instructor.tip}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mastery Map */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Mastery by topic</h3>
        <div className="space-y-4">
          {course.masteryTopics.map((topic, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 dark:text-gray-300">{topic.name}</span>
                <span className={`font-medium ${
                  topic.mastery >= 80 ? 'text-green-600' : 
                  topic.mastery >= 60 ? 'text-amber-600' : 'text-red-500'
                }`}>
                  {topic.mastery}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    topic.mastery >= 80 ? 'bg-green-500' : 
                    topic.mastery >= 60 ? 'bg-amber-500' : 'bg-red-400'
                  }`}
                  style={{ width: `${topic.mastery}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => onShowStudyAides(course)}
          className="mt-4 w-full py-2.5 bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-xl font-medium hover:bg-brand-100 dark:hover:bg-brand-800/50 transition-colors"
        >
          Practice weak areas
        </button>
      </div>

      {/* Upcoming */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Upcoming</h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {course.upcoming.map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center
                ${item.type === 'exam' ? 'bg-red-100 dark:bg-red-900/40' : 
                  item.type === 'quiz' ? 'bg-purple-100 dark:bg-purple-900/40' : 
                  item.type === 'paper' ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-green-100 dark:bg-green-900/40'}`}
              >
                {item.type === 'exam' ? '📝' : 
                 item.type === 'quiz' ? '❓' : 
                 item.type === 'paper' ? '📄' : '🔬'}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Due {item.due} {item.weight && `• ${item.weight}`}
                </p>
              </div>
              <button
                onClick={() => onShowStudyAides(course)}
                className="text-brand-600 dark:text-brand-400 text-sm font-medium hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
              >
                Prep →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Late Policy */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Late work policy</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium
            ${course.latePolicy.type === 'flexible' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
              course.latePolicy.type === 'penalty' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 
              'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}
          >
            {course.latePolicy.type}
          </span>
          <span className="text-sm text-gray-600 dark:text-gray-400">{course.latePolicy.details}</span>
        </div>

        {course.missingWork.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/30 rounded-xl">
            <p className="font-medium text-amber-900 dark:text-amber-200">Missing work you can recover:</p>
            {course.missingWork.map((work, i) => (
              <div key={i} className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-200">{work.name}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    {work.original} pts → {work.recoverable} pts recoverable
                  </p>
                </div>
                <span className="text-sm text-amber-700 dark:text-amber-300">Due {work.deadline}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseScreen;
