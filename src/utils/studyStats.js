/**
 * Study stats for Progress & Home: concepts studied, due count, streak.
 * Reads from spacedReview localStorage and student data.
 */

import { getDueCountFromConcepts } from '../services/spacedReview';
import { picmonicsBank } from '../data/picmonics';
import { getFlashcardsBank } from '../data/flashcards';
import { student } from '../data/student';

const STORAGE_KEY = 'scholar-spaced-review';
const STREAK_KEY = 'scholar-streak';
const LAST_STUDY_DATE_KEY = 'scholar-last-study-date';

function getReviewStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Today's date string (YYYY-MM-DD) for streak comparison. */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Record that the user studied today; updates streak (consecutive days). */
export function recordStudyActivity() {
  try {
    const today = todayStr();
    const lastRaw = localStorage.getItem(LAST_STUDY_DATE_KEY);
    const streakRaw = localStorage.getItem(STREAK_KEY);
    let streak = student?.streak ?? 0;
    if (lastRaw !== null) {
      const last = lastRaw.slice(0, 10);
      if (last === today) return; // already studied today
      const lastDate = new Date(last);
      const todayDate = new Date(today);
      const diffDays = Math.round((todayDate - lastDate) / (24 * 60 * 60 * 1000));
      if (diffDays === 1) streak = (parseInt(streakRaw, 10) || 0) + 1;
      else if (diffDays > 1) streak = 1;
    } else {
      streak = 1;
    }
    localStorage.setItem(LAST_STUDY_DATE_KEY, today);
    localStorage.setItem(STREAK_KEY, String(streak));
  } catch (_) {}
}

/**
 * Count of unique concepts/cards ever studied (picmonics + flashcards).
 */
export function getConceptsStudiedCount() {
  const data = getReviewStorage();
  const seen = new Set();
  for (const key of Object.keys(data)) {
    const [courseId, conceptId, mode] = key.split(':');
    if (mode === 'picmonics' || mode === 'flashcards') {
      seen.add(`${courseId}:${conceptId}`);
    }
  }
  return seen.size;
}

/**
 * Concepts/cards due for review (picmonics + flashcards combined).
 */
export function getDueCount() {
  const picmonicsDue = getDueCountFromConcepts(picmonicsBank, 'picmonics');
  const flashcardsDue = getDueCountFromConcepts(getFlashcardsBank(), 'flashcards');
  return picmonicsDue + flashcardsDue;
}

/**
 * Picmonics due count (for Home breakdown).
 */
export function getPicmonicsDueCount() {
  return getDueCountFromConcepts(picmonicsBank, 'picmonics');
}

/**
 * Flashcards due count (for Home breakdown).
 */
export function getFlashcardsDueCount() {
  return getDueCountFromConcepts(getFlashcardsBank(), 'flashcards');
}

/**
 * Current streak: from student data (static) or localStorage if we ever persist it.
 */
export function getStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    if (raw !== null) {
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n) && n >= 0) return n;
    }
  } catch (_) {}
  return student?.streak ?? 0;
}

/**
 * Combined study snapshot for Home and Progress.
 */
export function getStudySnapshot() {
  return {
    conceptsStudied: getConceptsStudiedCount(),
    dueCount: getDueCount(),
    streak: getStreak(),
  };
}
