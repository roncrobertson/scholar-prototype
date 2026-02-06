import React, { useState } from 'react';
import { leaderboard, studyGroups, activityFeed } from '../../data/student';

/**
 * SocialScreen - Community features: leaderboard, groups, activity feed
 */
export function SocialScreen() {
  const [tab, setTab] = useState('leaderboard');

  return (
    <div className="fade-in space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Community</h1>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        {['leaderboard', 'groups', 'activity'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors
              ${tab === t 
                ? 'bg-brand-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Weekly Leaderboard</h2>
            <span className="text-sm text-gray-500">Resets Sunday</span>
          </div>
          <div className="divide-y divide-gray-50">
            {leaderboard.map(user => (
              <div
                key={user.rank}
                className={`p-4 flex items-center gap-4 ${user.isYou ? 'bg-brand-50' : ''}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${user.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    user.rank === 2 ? 'bg-gray-200 text-gray-700' :
                    user.rank === 3 ? 'bg-orange-100 text-orange-700' : 
                    'bg-gray-50 text-gray-500'}`}
                >
                  {user.rank}
                </span>
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center font-semibold text-brand-700">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {user.name} {user.isYou && <span className="text-brand-600">(you)</span>}
                  </p>
                  <p className="text-sm text-gray-500">🔥 {user.streak} day streak</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{user.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">
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
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-gray-900">{group.name}</p>
                  <p className="text-sm text-gray-500">{group.course} • {group.members} members</p>
                </div>
                {group.activeNow > 0 ? (
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                    🟢 {group.activeNow} online • Join
                  </button>
                ) : (
                  <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium">
                    {group.nextSession}
                  </button>
                )}
              </div>
            </div>
          ))}
          <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 font-medium hover:border-brand-300 hover:text-brand-600 transition-colors">
            + Create study group
          </button>
        </div>
      )}

      {/* Activity Feed */}
      {tab === 'activity' && (
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50">
          {activityFeed.map((item, i) => (
            <div key={i} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-sm font-semibold text-brand-700">
                {item.user[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-medium">{item.user}</span> {item.action} {item.emoji}
                </p>
                <p className="text-xs text-gray-400">{item.time}</p>
              </div>
              <button className="text-brand-600 text-sm font-medium hover:text-brand-700 transition-colors">
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
