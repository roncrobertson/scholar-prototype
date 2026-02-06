import React from 'react';
import { ActivityRings } from '../ActivityRings';
import { courses, getGradeTrajectory } from '../../data/courses';
import { challenges, personalRecords } from '../../data/student';
import { getWeekRange } from '../../data/dateUtils';
import { getStudySnapshot, getFlashcardsDueCount, getPicmonicsDueCount } from '../../utils/studyStats';

/**
 * ProgressScreen - Fitness-inspired progress tracking
 */
export function ProgressScreen({ onShowStudyAides, onStartStudyAide }) {
  const snapshot = getStudySnapshot();
  const flashcardsDueCount = getFlashcardsDueCount();
  const picmonicsDueCount = getPicmonicsDueCount();

  return (
    <div className="fade-in space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>

      {/* Study snapshot: concepts studied, due, streak (Phase 4.2) */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <h2 className="font-semibold text-gray-900 mb-3">Study snapshot</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">{snapshot.conceptsStudied}</p>
            <p className="text-sm text-gray-500">Concepts studied</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{snapshot.dueCount}</p>
            <p className="text-sm text-gray-500">Due for review</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{snapshot.streak}</p>
            <p className="text-sm text-gray-500">Day streak</p>
          </div>
        </div>
        {snapshot.dueCount > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2 justify-center">
            {picmonicsDueCount > 0 && typeof onShowStudyAides === 'function' && (
              <button
                type="button"
                onClick={() => onShowStudyAides({})}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                Review Picmonics →
              </button>
            )}
            {flashcardsDueCount > 0 && typeof onStartStudyAide === 'function' && (
              <button
                type="button"
                onClick={() => onStartStudyAide('flashcards', null)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Review Flashcards →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Weekly Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-gray-900">This Week</h2>
          <span className="text-sm text-gray-500">{getWeekRange()}</span>
        </div>
        <div className="flex justify-center mb-6">
          <ActivityRings size={140} />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900">4.2h</p>
            <p className="text-sm text-gray-500">Study time</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">156</p>
            <p className="text-sm text-gray-500">Cards reviewed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">87%</p>
            <p className="text-sm text-gray-500">Retention</p>
          </div>
        </div>
      </div>

      {/* Challenges */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Challenges</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {challenges.map(challenge => (
            <div key={challenge.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">
                    {challenge.complete ? '✓ ' : ''}{challenge.name}
                  </p>
                  <p className="text-sm text-gray-500">{challenge.desc}</p>
                </div>
                <span className={`text-sm font-medium ${
                  challenge.complete ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {challenge.reward}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      challenge.complete ? 'bg-green-500' : 'bg-brand-500'
                    }`}
                    style={{ width: `${(challenge.progress / challenge.goal) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600">
                  {challenge.progress}/{challenge.goal}
                </span>
              </div>
              {challenge.endsIn && !challenge.complete && (
                <p className="text-xs text-gray-400 mt-2">Ends in {challenge.endsIn}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Personal Records */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Personal Records</h2>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y divide-gray-50">
          {personalRecords.map((pr, i) => (
            <div key={i} className="p-4">
              <span className="text-2xl">{pr.icon}</span>
              <p className="text-xl font-bold text-gray-900 mt-1">{pr.value}</p>
              <p className="text-sm text-gray-500">{pr.name}</p>
              <p className="text-xs text-gray-400">{pr.date}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grade Trajectory — "Here's your path to a B+" */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-brand-50 to-white">
          <h2 className="font-semibold text-gray-900">Here's your path forward</h2>
          <p className="text-sm text-gray-600 mt-0.5">Current vs target • Focus on weak areas to close the gap</p>
        </div>
        <div className="p-4 space-y-5">
          {courses.map(course => {
            const trajectory = getGradeTrajectory(course);
            const progress = trajectory.target ? (course.grade / course.target) * 100 : 0;
            const gap = trajectory.gap || 0;
            return (
              <div key={course.id} className="space-y-2">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: course.color }} 
                    />
                    <span className="font-medium text-gray-900">{course.code}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {course.grade}% → {trajectory.targetLabel} ({course.target}%)
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full relative">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: course.color 
                    }}
                  />
                  <div 
                    className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                    style={{ left: '100%' }}
                  />
                </div>
                {gap > 0 && trajectory.focusAreas.length > 0 && (
                  <p className="text-xs text-gray-600">
                    Focus: {trajectory.focusAreas.map(f => `${f.name} (${f.mastery}%)`).join(', ')} — practice these to raise your grade.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProgressScreen;
