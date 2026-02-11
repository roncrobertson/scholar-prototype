/**
 * Date utilities for dynamic "today" and week ranges.
 * Semester ref: Jan 13, 2026 start; 14 weeks.
 */

const SEMESTER_START = new Date(2026, 0, 13); // Jan 13, 2026
const SEMESTER_WEEKS = 14;

export function formatToday() {
  const d = new Date();
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/** Time-based greeting: morning (before 12), afternoon (before 17), evening. */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function getWeekRange() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const mon = new Date(d);
  mon.setDate(diff);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const fmt = (x) => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(mon)} - ${fmt(sun)}`;
}

export function getCurrentSemesterWeek() {
  const now = new Date();
  const diff = Math.floor((now - SEMESTER_START) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(diff + 1, SEMESTER_WEEKS));
}

export function getSemesterPercentComplete() {
  const week = getCurrentSemesterWeek();
  return Math.round((week / SEMESTER_WEEKS) * 100);
}
