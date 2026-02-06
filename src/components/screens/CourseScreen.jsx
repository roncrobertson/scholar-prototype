import React from 'react';
import { studyAides } from '../../data/student';
import { StudyAideIcon } from '../../utils/studyAideIcons';
import { getDueCount } from '../../services/spacedReview';

/**
 * CourseScreen - Individual course detail view
 */
export function CourseScreen({ course, onShowStudyAides, onStartStudyAide }) {
  if (!course) return null;

  const picmonicsDueCount = getDueCount(course.id, 'picmonics');

  return (
    <div className="fade-in space-y-6">
      {/* Picmonics due for review */}
      {picmonicsDueCount > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-amber-900">Due for review</p>
            <p className="text-sm text-amber-700">{picmonicsDueCount} {picmonicsDueCount === 1 ? 'picmonic' : 'picmonics'} ready for spaced review</p>
          </div>
          <button
            onClick={() => onStartStudyAide && onStartStudyAide('picmonics', course)}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Review Picmonics →
          </button>
        </div>
      )}

      {/* Course Header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-2" style={{ backgroundColor: course.color }} />
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {course.code}: {course.name}
              </h1>
              <p className="text-gray-500 mt-1">{course.schedule} • {course.room}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: course.color }}>
                {course.grade}%
              </p>
              <p className="text-sm text-gray-500">Target: {course.target}%</p>
            </div>
          </div>

          {/* Study Aide Launcher — direct to tool when clicked */}
          <div className="mt-6 flex gap-2 flex-wrap">
            {studyAides.slice(0, 4).map(aide => (
              <button
                key={aide.id}
                onClick={() => (onStartStudyAide ? onStartStudyAide(aide.id, course) : onShowStudyAides(course))}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
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
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-semibold text-white"
            style={{ backgroundColor: course.color }}
          >
            {course.instructor.initials}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{course.instructor.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{course.instructor.style}</p>
            <div className="mt-3 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                💡 <strong>Tip:</strong> {course.instructor.tip}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mastery Map */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-4">Mastery by topic</h3>
        <div className="space-y-4">
          {course.masteryTopics.map((topic, i) => (
            <div key={i}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700">{topic.name}</span>
                <span className={`font-medium ${
                  topic.mastery >= 80 ? 'text-green-600' : 
                  topic.mastery >= 60 ? 'text-amber-600' : 'text-red-500'
                }`}>
                  {topic.mastery}%
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
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
          className="mt-4 w-full py-2.5 bg-brand-50 text-brand-700 rounded-xl font-medium hover:bg-brand-100 transition-colors"
        >
          Practice weak areas
        </button>
      </div>

      {/* Upcoming */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Upcoming</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {course.upcoming.map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-4">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center
                ${item.type === 'exam' ? 'bg-red-100' : 
                  item.type === 'quiz' ? 'bg-purple-100' : 
                  item.type === 'paper' ? 'bg-blue-100' : 'bg-green-100'}`}
              >
                {item.type === 'exam' ? '📝' : 
                 item.type === 'quiz' ? '❓' : 
                 item.type === 'paper' ? '📄' : '🔬'}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">
                  Due {item.due} {item.weight && `• ${item.weight}`}
                </p>
              </div>
              <button
                onClick={() => onShowStudyAides(course)}
                className="text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors"
              >
                Prep →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Late Policy */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-900 mb-2">Late work policy</h3>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium
            ${course.latePolicy.type === 'flexible' ? 'bg-green-100 text-green-700' :
              course.latePolicy.type === 'penalty' ? 'bg-amber-100 text-amber-700' : 
              'bg-red-100 text-red-700'}`}
          >
            {course.latePolicy.type}
          </span>
          <span className="text-sm text-gray-600">{course.latePolicy.details}</span>
        </div>

        {course.missingWork.length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 rounded-xl">
            <p className="font-medium text-amber-900">Missing work you can recover:</p>
            {course.missingWork.map((work, i) => (
              <div key={i} className="mt-2 flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-800">{work.name}</p>
                  <p className="text-xs text-amber-600">
                    {work.original} pts → {work.recoverable} pts recoverable
                  </p>
                </div>
                <span className="text-sm text-amber-700">Due {work.deadline}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseScreen;
