/**
 * Spaced review queue: last-studied + next-due per concept (Picmonics/Flashcards).
 * Intervals: 1d, 3d, 7d. Persisted in localStorage.
 */

const STORAGE_KEY = 'scholar-spaced-review';
const INTERVALS_DAYS = [1, 3, 7];

function getStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function setStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

/**
 * Record that a concept was studied now.
 * @param {string} courseId
 * @param {string} conceptId
 * @param {string} [mode] - 'picmonics' | 'flashcards'
 */
export function recordStudied(courseId, conceptId, mode = 'picmonics') {
  if (!courseId || !conceptId) return;
  const key = `${courseId}:${conceptId}:${mode}`;
  const now = new Date();
  const nextDue = new Date(now);
  nextDue.setDate(nextDue.getDate() + INTERVALS_DAYS[0]);
  const data = getStorage();
  data[key] = {
    lastStudied: now.toISOString(),
    nextDue: nextDue.toISOString(),
    intervalIndex: 0,
  };
  setStorage(data);
}

/**
 * Advance interval after a successful review (optional: call when user passes quiz).
 * @param {string} courseId
 * @param {string} conceptId
 * @param {string} [mode]
 */
export function advanceInterval(courseId, conceptId, mode = 'picmonics') {
  const key = `${courseId}:${conceptId}:${mode}`;
  const data = getStorage();
  const entry = data[key];
  if (!entry) return;
  const idx = Math.min((entry.intervalIndex ?? 0) + 1, INTERVALS_DAYS.length - 1);
  const nextDue = new Date();
  nextDue.setDate(nextDue.getDate() + INTERVALS_DAYS[idx]);
  data[key] = {
    lastStudied: new Date().toISOString(),
    nextDue: nextDue.toISOString(),
    intervalIndex: idx,
  };
  setStorage(data);
}

/**
 * Get concepts due for review (nextDue <= now or today).
 * @param {string} [courseId] - optional filter by course
 * @param {string} [mode] - 'picmonics' | 'flashcards'
 * @returns {Array<{ courseId: string, conceptId: string, mode: string, nextDue: string }>}
 */
export function getDueForReview(courseId, mode = 'picmonics') {
  const data = getStorage();
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  const due = [];
  for (const key of Object.keys(data)) {
    const [cId, conceptId, m] = key.split(':');
    if (courseId && cId !== courseId) continue;
    if (m !== mode) continue;
    const nextDue = new Date(data[key].nextDue);
    if (nextDue <= todayEnd) {
      due.push({ courseId: cId, conceptId, mode: m, nextDue: data[key].nextDue });
    }
  }
  return due.sort((a, b) => new Date(a.nextDue) - new Date(b.nextDue));
}

/**
 * Get count of concepts due for review (for badges).
 */
export function getDueCount(courseId, mode = 'picmonics') {
  return getDueForReview(courseId, mode).length;
}

/**
 * Get count of concepts due for review from a full list (e.g. picmonicsBank).
 * "Due" = never studied OR nextDue <= end of today. Used for Home badge.
 * @param {Array<{ course_id: string, concept_id: string }>} list - e.g. picmonicsBank
 * @param {string} [mode] - 'picmonics' | 'flashcards'
 * @returns {number}
 */
export function getDueCountFromConcepts(list, mode = 'picmonics') {
  if (!Array.isArray(list) || list.length === 0) return 0;
  const seen = new Set();
  const keys = [];
  for (const m of list) {
    const k = `${m.course_id}:${m.concept_id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    keys.push({ courseId: m.course_id, conceptId: m.concept_id });
  }
  const data = getStorage();
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  let count = 0;
  for (const { courseId, conceptId } of keys) {
    const key = `${courseId}:${conceptId}:${mode}`;
    const entry = data[key];
    if (!entry) {
      count += 1; // never studied = due
      continue;
    }
    const nextDue = new Date(entry.nextDue);
    if (nextDue <= todayEnd) count += 1;
  }
  return count;
}
