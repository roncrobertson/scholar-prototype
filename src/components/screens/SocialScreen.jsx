import React, { useState } from 'react';
import { leaderboard, studyGroups, activityFeed } from '../../data/student';

/**
 * SocialScreen - Community features: leaderboard, groups, activity feed
 */
export function SocialScreen() {
  const [tab, setTab] = useState('leaderboard');

  return (
    <div className="fade-in space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Community</h1>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        {['leaderboard', 'groups', 'activity'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors
              ${tab === t 
                ? 'bg-brand-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Weekly Leaderboard</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">Resets Sunday</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {leaderboard.map(user => (
              <div
                key={user.rank}
                className={`p-4 flex items-center gap-4 ${user.isYou ? 'bg-brand-50 dark:bg-brand-900/30' : ''}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${user.rank === 1 ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' :
                    user.rank === 2 ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200' :
                    user.rank === 3 ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' : 
                    'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}
                >
                  {user.rank}
                </span>
                <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center font-semibold text-brand-700 dark:text-brand-300">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {user.name} {user.isYou && <span className="text-brand-600 dark:text-brand-400">(you)</span>}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">🔥 {user.streak} day streak</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-gray-100">{user.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {user.trend === 'up' ? '↑' : user.trend === 'down' ? '↓' : '–'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Study Groups */}
      {tab === 'groups' && (
        <div className="space-y-4">
          {studyGroups.map((group, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{group.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{group.course} • {group.members} members</p>
                </div>
                {group.activeNow > 0 ? (
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                    🟢 {group.activeNow} online • Join
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium">
                    {group.nextSession}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 font-medium hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            + Create study group
          </button>
        </div>
      )}

      {/* Activity Feed */}
      {tab === 'activity' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700">
          {activityFeed.map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/50 rounded-full flex items-center justify-center text-sm font-semibold text-brand-700 dark:text-brand-300">
                {item.user[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">
                  <span className="font-medium">{item.user}</span> {item.action} {item.emoji}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{item.time}</p>
              </div>
              <button className="text-brand-600 dark:text-brand-400 text-sm font-medium hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                👏
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SocialScreen;
