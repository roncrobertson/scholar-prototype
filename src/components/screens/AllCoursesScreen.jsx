import React from 'react';
import { LayoutGrid, AlertTriangle } from 'lucide-react';
import { courses } from '../../data/courses';

/**
 * AllCoursesScreen - Overview of all enrolled courses
 */
export function AllCoursesScreen({ onShowStudyAides, onSelectCourse }) {
  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
          <p className="text-gray-500">Spring 2026 • {courses.length} courses</p>
        </div>
        <button
          onClick={() => onShowStudyAides({})}
          className="px-4 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors"
        >
          Study All
        </button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4 stagger-children">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-gray-900">3.2</p>
          <p className="text-sm text-gray-500">Current GPA</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-green-600">3</p>
          <p className="text-sm text-gray-500">On target</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-amber-600">1</p>
          <p className="text-sm text-gray-500">Needs focus</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-2xl font-bold text-brand-600">21</p>
          <p className="text-sm text-gray-500">Recoverable pts</p>
        </div>
      </div>

      {/* Course Cards */}
      <div className="space-y-4 stagger-children">
        {courses.map(course => {
          const onTrack = course.grade >= course.target - 3;
          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-gray-200 transition-all cursor-pointer"
              onClick={() => onSelectCourse(course)}
            >
              <div className="h-1" style={{ backgroundColor: course.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {course.code}: {course.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {course.instructor.name} • {course.schedule}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{course.grade}%</p>
                    <p className={`text-sm ${onTrack ? 'text-green-600' : 'text-amber-600'}`}>
                      {onTrack ? '✓ On track' : `${course.target - course.grade}% to go`}
                    </p>
                  </div>
                </div>

                {/* Mastery Preview */}
                <div className="mt-4 flex gap-1">
                  {course.masteryTopics.map((topic, i) => (
                    <div
                      key={i}
                      className="flex-1 h-2 rounded-full"
                      style={{
                        backgroundColor: topic.mastery >= 80 ? '#10B981' : topic.mastery >= 60 ? '#F59E0B' : '#EF4444',
                        opacity: 0.7 + (topic.mastery / 300)
                      }}
                      title={`${topic.name}: ${topic.mastery}%`}
                    />
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); onShowStudyAides(course); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-100 transition-colors"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" aria-hidden />
                    Study
                  </button>
                  {course.missingWork.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm">
                      <AlertTriangle className="w-3.5 h-3.5" aria-hidden />
                      {course.missingWork.length} missing
                    </span>
                  )}
                  <span className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-sm">
                    Next: {course.nextClass}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AllCoursesScreen;
