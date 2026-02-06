/**
 * Persist preferred Picmonic variant per concept (Phase 5.3).
 */

const STORAGE_KEY = 'scholar-picmonic-variant';

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

export function getSavedVariant(courseId, conceptId) {
  if (!courseId || !conceptId) return null;
  const key = `${courseId}:${conceptId}`;
  const data = getStorage();
  const v = data[key];
  return typeof v === 'number' && v >= 0 ? v : null;
}

export function setSavedVariant(courseId, conceptId, variantIndex) {
  if (!courseId || !conceptId) return;
  const key = `${courseId}:${conceptId}`;
  const data = getStorage();
  data[key] = variantIndex;
  setStorage(data);
}
