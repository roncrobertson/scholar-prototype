/**
 * Smart Notes: "Flag for review" and "I'm confused" state.
 * Stored in localStorage keyed by courseId:topicName for use in Smart Notes and recommendations.
 */

const FLAGGED_KEY = 'scholar-smart-notes-flagged';
const CONFUSED_KEY = 'scholar-smart-notes-confused';

function getSet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function setSet(key, set) {
  try {
    localStorage.setItem(key, JSON.stringify([...set]));
  } catch (_) {}
}

/** Key for a note: courseId:topicName (topic name = e.g. from masteryTopics[].name). */
function key(courseId, topicName) {
  return `${courseId || ''}:${topicName || ''}`;
}

export function addFlaggedForReview(courseId, topicName) {
  const s = getSet(FLAGGED_KEY);
  s.add(key(courseId, topicName));
  setSet(FLAGGED_KEY, s);
}

export function removeFlaggedForReview(courseId, topicName) {
  const s = getSet(FLAGGED_KEY);
  s.delete(key(courseId, topicName));
  setSet(FLAGGED_KEY, s);
}

export function isFlaggedForReview(courseId, topicName) {
  return getSet(FLAGGED_KEY).has(key(courseId, topicName));
}

/** @returns {Array<{ courseId: string, topicName: string }>} */
export function getFlaggedForReview() {
  const set = getSet(FLAGGED_KEY);
  return [...set].map((k) => {
    const idx = k.indexOf(':');
    const courseId = idx >= 0 ? k.slice(0, idx) : '';
    const topicName = idx >= 0 ? k.slice(idx + 1) : k;
    return { courseId, topicName };
  }).filter(({ courseId, topicName }) => courseId && topicName);
}

export function addConfused(courseId, topicName) {
  const s = getSet(CONFUSED_KEY);
  s.add(key(courseId, topicName));
  setSet(CONFUSED_KEY, s);
}

export function removeConfused(courseId, topicName) {
  const s = getSet(CONFUSED_KEY);
  s.delete(key(courseId, topicName));
  setSet(CONFUSED_KEY, s);
}

export function isConfused(courseId, topicName) {
  return getSet(CONFUSED_KEY).has(key(courseId, topicName));
}

/** @returns {Array<{ courseId: string, topicName: string }>} */
export function getConfusedConcepts() {
  const set = getSet(CONFUSED_KEY);
  return [...set].map((k) => {
    const idx = k.indexOf(':');
    const courseId = idx >= 0 ? k.slice(0, idx) : '';
    const topicName = idx >= 0 ? k.slice(idx + 1) : k;
    return { courseId, topicName };
  }).filter(({ courseId, topicName }) => courseId && topicName);
}

/** Check if any Smart Notes concepts are flagged or confused (for badges / recommendations). */
export function getFlaggedOrConfusedCount() {
  const flagged = getSet(FLAGGED_KEY).size;
  const confused = getSet(CONFUSED_KEY).size;
  const combined = new Set([...getSet(FLAGGED_KEY), ...getSet(CONFUSED_KEY)]);
  return { flagged, confused, combined: combined.size };
}
