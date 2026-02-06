import React from 'react';
import { timeline, semesterInfo } from '../../data/timeline';
import { getCurrentSemesterWeek, getSemesterPercentComplete } from '../../data/dateUtils';

/**
 * TimelineScreen - Semester overview with key dates
 */
export function TimelineScreen() {
  const currentWeek = getCurrentSemesterWeek();
  const percentComplete = getSemesterPercentComplete();

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Semester Timeline</h1>
        <p className="text-gray-500">
          Week {currentWeek} of {semesterInfo.totalWeeks} • {percentComplete}% complete
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="h-3 bg-gray-100 rounded-full">
          <div 
            className="h-full bg-brand-500 rounded-full transition-all"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2">
          <span>{semesterInfo.startDate}</span>
          <span>Now</span>
          <span>{semesterInfo.endDate}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {timeline.map((week, i) => {
          const isCurrent = week.week === currentWeek;
          return (
          <div 
            key={i} 
            className={`bg-white rounded-xl border ${
              isCurrent 
                ? 'border-brand-300 ring-2 ring-brand-100' 
                : 'border-gray-100'
            }`}
          >
            <div className={`p-4 border-b border-gray-50 flex items-center justify-between ${
              isCurrent ? 'bg-brand-50' : ''
            }`}>
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${isCurrent 
                    ? 'bg-brand-600 text-white' 
                    : 'bg-gray-100 text-gray-600'}`}
                >
                  {week.week}
                </span>
                <div>
                  <p className="font-medium text-gray-900">Week {week.week}</p>
                  <p className="text-sm text-gray-500">{week.date}</p>
                </div>
              </div>
              {isCurrent && (
                <span className="px-2 py-1 bg-brand-600 text-white text-xs font-medium rounded">
                  NOW
                </span>
              )}
              {week.items.length > 0 && !isCurrent && (
                <span className="text-sm text-gray-500">
                  {week.items.length} item{week.items.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            {week.items.length > 0 && (
              <div className="p-4 space-y-2">
                {week.items.map((item, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                      ${item.type === 'exam' ? 'bg-red-100' : 
                        item.type === 'paper' ? 'bg-blue-100' : 'bg-green-100'}`}
                    >
                      {item.type === 'exam' ? '📝' : 
                       item.type === 'paper' ? '📄' : '🔬'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.course}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}

export default TimelineScreen;
