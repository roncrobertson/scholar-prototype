import React from 'react';
import { BarChart3 } from 'lucide-react';
import { StudyAideIcon } from '../../utils/studyAideIcons';
import { ActivityRings } from '../ActivityRings';
import {
  courses,
  getTodaysClasses,
  getOnTrackCount,
  getRecommendedNext,
  isOnTrack,
  getTasksToStayOnTrackCount,
  getFocusTimeAvailable,
} from '../../data/courses';
import { student } from '../../data/student';
import { formatToday, getGreeting } from '../../data/dateUtils';
import { getCardsForCourse } from '../../data/flashcards';
import { getStudySnapshot, getFlashcardsDueCount } from '../../utils/studyStats';
import { getFlaggedOrConfusedCount } from '../../data/smartNotesReviewFlags';

/**
 * HomeScreen - Daily dashboard showing focus, classes, and quick actions
 */
export function HomeScreen({ isMobile, onShowStudyAides, onStartStudyAide, onNavigate }) {
  const todaysClasses = getTodaysClasses();
  const onTrackCount = getOnTrackCount();
  const recommended = getRecommendedNext();
  const focusCourse = todaysClasses[0];
  const onTrack = isOnTrack();
  const taskCount = getTasksToStayOnTrackCount();
  const focusTime = getFocusTimeAvailable();
  const flashcardsDueCount = getFlashcardsDueCount();
  const dueForReviewCount = flashcardsDueCount;
  const snapshot = getStudySnapshot();
  const { combined: flaggedOrConfusedCount } = getFlaggedOrConfusedCount();

  return (
    <div className="space-y-6 stagger-children">
      {/* Header with Activity Rings — shadow for depth (Phase 6.4) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{formatToday()}</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {getGreeting()}, {student.name}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {todaysClasses.length} {todaysClasses.length === 1 ? 'class' : 'classes'} today
              {taskCount > 0 && ` • ${taskCount} ${taskCount === 1 ? 'task' : 'tasks'} to stay on track`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Focus time available: {focusTime}h
            </p>
          </div>
          {!isMobile && <ActivityRings size={100} />}
        </div>

        {isMobile && (
          <div className="mb-6">
            <ActivityRings size={100} />
          </div>
        )}

        {/* Study snapshot: concepts studied, due, streak — prominent for "what to do next" */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 px-3 py-2 text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{snapshot.conceptsStudied}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Concepts studied</p>
          </div>
          <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 px-3 py-2 text-center">
            <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{snapshot.dueCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Due for review</p>
          </div>
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 px-3 py-2 text-center">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{snapshot.streak}</p>
            <p className="text-xs text-amber-700 dark:text-amber-300">Day streak</p>
          </div>
        </div>
        {dueForReviewCount > 0 && (
          <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mb-2" aria-live="polite">
            {dueForReviewCount} {dueForReviewCount === 1 ? 'item' : 'items'} due today — review to keep your streak.
          </p>
        )}

        {/* Recommended next (single prominent CTA) — or "You're on track" when nothing urgent */}
        {onTrack ? (
          <div className="bg-green-600 rounded-xl p-4 text-white mb-4">
            <p className="text-white/90 text-sm font-medium">You're on track</p>
            <p className="text-white/90 text-sm mt-1">No urgent tasks. Use your focus time to review or get ahead.</p>
            <button
              onClick={() => onShowStudyAides({})}
              className="btn-press mt-3 px-4 py-2 bg-white text-green-700 rounded-lg text-sm font-medium hover:bg-green-50 transition-colors"
            >
              Quick review →
            </button>
          </div>
        ) : (
          <div className="bg-brand-600 rounded-xl p-4 text-white mb-4">
            <p className="text-white/80 text-sm font-medium">Recommended next</p>
            <p className="text-lg font-semibold mt-1">{recommended.label}</p>
            <p className="text-white/80 text-sm mt-0.5">{recommended.sublabel}</p>
            <button
              onClick={() => {
                if (recommended.type === 'recovery') onNavigate('recovery');
                else onShowStudyAides(recommended.course);
              }}
              className="btn-press mt-3 px-4 py-2 bg-white text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors"
            >
              {recommended.type === 'recovery' ? 'Go to Recovery →' : 'Prep now'}
            </button>
          </div>
        )}

        {/* Today's Focus (first class today) */}
        {focusCourse && (
          <div className="bg-brand-50 dark:bg-brand-900/30 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-brand-600 dark:text-brand-400 font-medium">Your focus</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {focusCourse.code} {focusCourse.nextClass}
                </p>
                {focusCourse.masteryTopics?.length > 0 && (() => {
                  const lowest = focusCourse.masteryTopics.reduce((a, t) => (t.mastery < (a?.mastery ?? 100) ? t : a), null);
                  return (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {lowest?.name} • You're at {lowest?.mastery}% mastery
                    </p>
                  );
                })()}
              </div>
              <button
                onClick={() => onShowStudyAides(focusCourse)}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 transition-colors"
              >
                Prep now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Active Challenge (Fitness-inspired) — softer corners (Phase 6.9) */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">🏆 ACTIVE CHALLENGE</p>
            <p className="text-xl font-bold mt-1">Mastery Sprint</p>
            <p className="text-white/80 text-sm mt-1">Get 3 topics to 80%+ • Ends in 3 days</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold">2/3</p>
            <p className="text-white/80 text-sm">topics</p>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/30 rounded-full">
          <div className="h-full bg-white rounded-full" style={{ width: '66%' }} />
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Today's classes</h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">{todaysClasses.length} classes</span>
        </div>
        {todaysClasses.length > 0 ? (
          <div className="divide-y divide-gray-50 dark:divide-gray-700 stagger-children">
            {todaysClasses.map(course => (
              <div key={course.id} className="p-4 flex items-center gap-4">
                <div 
                  className="w-1 h-12 rounded-full" 
                  style={{ backgroundColor: course.color }} 
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{course.code}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {course.schedule.split(' ')[1]} • {course.room}
                  </p>
                </div>
                <button
                  onClick={() => onShowStudyAides(course)}
                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Study
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-1">No classes today.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Use the time to review or get ahead.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={() => onNavigate('timeline')}
                className="px-4 py-2 bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded-lg text-sm font-medium hover:bg-brand-100 dark:hover:bg-brand-800/50 transition-colors"
              >
                View semester
              </button>
              <button
                onClick={() => onNavigate('courses')}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                All courses
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Due for review (spaced repetition: Flashcards) */}
      {dueForReviewCount > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Due for review</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {flashcardsDueCount} flashcard{flashcardsDueCount !== 1 ? 's' : ''} ready for spaced review
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {flashcardsDueCount > 0 && (
                <button
                  onClick={() => onStartStudyAide?.('flashcards', null)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Review Flashcards →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Flagged / confused — surface Smart Notes items to review */}
      {flaggedOrConfusedCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-2xl border border-amber-200 dark:border-amber-800 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-amber-900 dark:text-amber-200">Flagged for review</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {flaggedOrConfusedCount} concept{flaggedOrConfusedCount !== 1 ? 's' : ''} you flagged or marked as confused in Smart Notes
              </p>
            </div>
            <button
              onClick={() => onShowStudyAides({})}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors"
            >
              Review in Smart Notes →
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 stagger-children">
        <button
          onClick={() => onShowStudyAides({})}
          className="btn-press bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-left hover:border-brand-200 dark:hover:border-brand-600 hover:shadow-md hover:-translate-y-0.5 transition-all relative"
        >
          {flashcardsDueCount > 0 && (
            <span
              className="absolute top-3 right-3 rounded-full bg-brand-600 text-white text-xs font-semibold px-2 py-0.5 min-w-[1.5rem] text-center"
              aria-label={`${flashcardsDueCount} flashcards due`}
            >
              {flashcardsDueCount} due
            </span>
          )}
          <StudyAideIcon aideId="flashcards" className="w-8 h-8 mb-2 text-brand-600 dark:text-brand-400" />
          <p className="font-medium text-gray-900 dark:text-gray-100">Quick Review</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getCardsForCourse(null).length} cards
          </p>
        </button>
        <button
          onClick={() => onNavigate('progress')}
          className="btn-press bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 text-left hover:border-brand-200 dark:hover:border-brand-600 hover:shadow-md hover:-translate-y-0.5 transition-all"
        >
          <BarChart3 className="w-8 h-8 mb-2 text-brand-600 dark:text-brand-400" aria-hidden />
          <p className="font-medium text-gray-900 dark:text-gray-100">Check Progress</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{onTrackCount} of {courses.length} on track</p>
        </button>
      </div>

      {/* Kudos Section (Strava-inspired) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Recent activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center text-sm text-green-800 dark:text-green-200">C</div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                <span className="font-medium">Casey</span> completed Mastery Sprint 🏆
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">2 hours ago</p>
            </div>
            <button className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">👏 Kudos</button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center text-sm text-blue-800 dark:text-blue-200">A</div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                <span className="font-medium">Alex</span> hit a 12-day streak 🔥
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">5 hours ago</p>
            </div>
            <button className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300">👏 Kudos</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeScreen;
