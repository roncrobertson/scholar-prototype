import React from 'react';

/**
 * ActivityRings - Apple Fitness-inspired progress visualization
 * Shows streak, mastery, and sessions as concentric rings
 */
export function ActivityRings({ 
  size = 120, 
  studyGoal = 10, 
  studyDone = 7, 
  masteryGoal = 3, 
  masteryDone = 2, 
  streakGoal = 7, 
  streakDone = 7 
}) {
  const rings = [
    { progress: streakDone / streakGoal, color: '#F97316', label: 'Streak', value: `${streakDone}d` },
    { progress: masteryDone / masteryGoal, color: '#8B5CF6', label: 'Mastery', value: `${masteryDone}/${masteryGoal}` },
    { progress: studyDone / studyGoal, color: '#10B981', label: 'Sessions', value: `${studyDone}/${studyGoal}` }
  ];

  const ariaLabel = `Progress: Streak ${streakDone} of ${streakGoal} days, Mastery ${masteryDone} of ${masteryGoal} topics, Sessions ${studyDone} of ${studyGoal} this week`;

  return (
    <div className="flex items-center gap-6" role="img" aria-label={ariaLabel}>
      <div className="relative" style={{ width: size, height: size }}>
        {rings.map((ring, i) => {
          const radius = (size / 2) - (i * 14) - 8;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference * (1 - Math.min(ring.progress, 1));
          return (
            <svg key={i} className="absolute inset-0 activity-ring" width={size} height={size}>
              <circle 
                cx={size/2} 
                cy={size/2} 
                r={radius} 
                fill="none" 
                stroke="#e5e7eb" 
                strokeWidth="10" 
              />
              <circle
                cx={size/2} 
                cy={size/2} 
                r={radius} 
                fill="none" 
                stroke={ring.color} 
                strokeWidth="10"
                strokeDasharray={circumference} 
                strokeDashoffset={offset}
                strokeLinecap="round" 
                className="transition-all duration-1000"
              />
            </svg>
          );
        })}
      </div>
      <div className="space-y-2">
        {rings.map((ring, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ring.color }} />
            <span className="text-sm text-gray-600">{ring.label}</span>
            <span className="text-sm font-semibold text-gray-900">{ring.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivityRings;
