// Student profile data
export const student = {
  name: "Jordan",
  avatar: "J",
  streak: 7,
  totalPoints: 2120,
  weeklyGoal: 10,
  weeklyCompleted: 7
};

// Study Aides — order: AI Tutor, Smart Notes, Flashcards, Picmonics, Practice, Audio
export const studyAides = [
  { id: 'tutor', name: 'AI Tutor', icon: '🤖', desc: 'Ask anything', color: 'bg-indigo-500' },
  { id: 'summary', name: 'Smart Notes', icon: '📋', desc: 'AI-generated summaries', color: 'bg-amber-500' },
  { id: 'flashcards', name: 'Flashcards', icon: '🎴', desc: 'Spaced repetition cards', color: 'bg-blue-500' },
  { id: 'picmonics', name: 'Picmonics', icon: '🎨', desc: 'Visual mnemonics', color: 'bg-pink-500' },
  { id: 'practice', name: 'Practice', icon: '📝', desc: 'Practice questions', color: 'bg-green-500' },
  { id: 'podcast', name: 'Audio Review', icon: '🎧', desc: 'Listen while walking', color: 'bg-purple-500' },
];

// Challenges (Fitness-inspired gamification)
export const challenges = [
  { id: 1, name: '7-Day Streak', desc: 'Study every day for a week', progress: 7, goal: 7, complete: true, reward: '🏆 +100 pts' },
  { id: 2, name: 'Mastery Sprint', desc: 'Get 3 topics to 80%+', progress: 2, goal: 3, complete: false, reward: '⭐ +150 pts', endsIn: '3 days' },
  { id: 3, name: 'Early Bird', desc: 'Complete 5 morning sessions', progress: 3, goal: 5, complete: false, reward: '🌅 +75 pts', endsIn: '5 days' }
];

// Personal Records (PRs)
export const personalRecords = [
  { name: 'Longest Streak', value: '12 days', date: 'Jan 2026', icon: '🔥' },
  { name: 'Best Quiz Score', value: '98%', date: 'PSYCH 101', icon: '💯' },
  { name: 'Most Cards/Day', value: '87 cards', date: 'Last week', icon: '🎴' },
  { name: 'Fastest Mastery', value: '3 days', date: 'Supply & Demand', icon: '⚡' }
];

// Leaderboard
export const leaderboard = [
  { rank: 1, name: 'Casey M.', avatar: 'C', streak: 14, points: 2840, trend: 'up' },
  { rank: 2, name: 'Alex T.', avatar: 'A', streak: 12, points: 2650, trend: 'up' },
  { rank: 3, name: 'Jordan C.', avatar: 'J', streak: 7, points: 2120, isYou: true, trend: 'same' },
  { rank: 4, name: 'Sam K.', avatar: 'S', streak: 5, points: 1890, trend: 'down' },
  { rank: 5, name: 'Riley P.', avatar: 'R', streak: 3, points: 1540, trend: 'up' }
];

// Study Groups
export const studyGroups = [
  { course: 'BIO 201', name: 'Bio Study Squad', members: 4, activeNow: 2, nextSession: 'Tomorrow 7pm' },
  { course: 'PSYCH 101', name: 'Psych Group', members: 3, activeNow: 0, nextSession: 'Thu 4pm' }
];

// Activity feed items
export const activityFeed = [
  { user: 'Casey', action: 'completed Mastery Sprint', time: '2h ago', emoji: '🏆' },
  { user: 'Alex', action: 'hit a 12-day streak', time: '5h ago', emoji: '🔥' },
  { user: 'Sam', action: 'joined Bio Study Squad', time: '1d ago', emoji: '👥' },
  { user: 'Riley', action: 'achieved 90% mastery in Supply & Demand', time: '1d ago', emoji: '⭐' },
];
