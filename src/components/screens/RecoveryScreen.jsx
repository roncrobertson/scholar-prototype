import React from 'react';
import { courses, getCoursesWithMissingWork } from '../../data/courses';

/**
 * RecoveryScreen - Shows recoverable points from missing/late work
 */
export function RecoveryScreen() {
  const coursesWithMissing = getCoursesWithMissingWork();
  
  // Calculate total recoverable points
  const totalRecoverable = courses.reduce((sum, course) => {
    return sum + course.missingWork.reduce((s, w) => s + w.recoverable, 0);
  }, 0);

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Point Recovery</h1>
        <p className="text-gray-500 dark:text-gray-400">Missing work you can still submit</p>
      </div>

      {/* Recovery Summary */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm">Total recoverable</p>
            <p className="text-4xl font-bold mt-1">{totalRecoverable} points</p>
            <p className="text-white/80 text-sm mt-2">Submit before deadlines to recover</p>
          </div>
          <span className="text-6xl">🔄</span>
        </div>
      </div>

      {/* Missing Work */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Missing assignments</h2>
        </div>
        
        {coursesWithMissing.length > 0 ? (
          coursesWithMissing.map(course => (
            <div key={course.id} className="p-4 border-b border-gray-50 dark:border-gray-700 last:border-0">
              <div className="flex items-center gap-2 mb-3">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: course.color }} 
                />
                <span className="font-medium text-gray-900 dark:text-gray-100">{course.code}</span>
              </div>
              {course.missingWork.map((work, i) => (
                <div key={i} className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{work.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {work.original} pts → 
                        <span className="text-green-600 dark:text-green-400 font-medium ml-1">
                          {work.recoverable} pts recoverable
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Due {work.deadline}</p>
                      <button className="mt-2 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <span className="text-4xl mb-2 block">✨</span>
            <p className="text-gray-500 dark:text-gray-400">No missing work. You're all caught up!</p>
          </div>
        )}
      </div>

      {/* Late Policies Reference */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Late work policies</h2>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-700">
          {courses.map(course => (
            <div key={course.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: course.color }} 
                />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{course.code}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{course.latePolicy.details}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium
                ${course.latePolicy.type === 'flexible' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                  course.latePolicy.type === 'penalty' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 
                  'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}
              >
                {course.latePolicy.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecoveryScreen;
