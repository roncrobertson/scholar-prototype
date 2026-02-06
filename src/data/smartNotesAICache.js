/**
 * Smart Notes AI: in-session cache and localStorage persistence for Summarize/Expand results.
 * Key: courseId:topicName:context:type (type = "bullets" | "paragraph").
 */

const STORAGE_KEY = 'scholar-smart-notes-ai-cache';

function cacheKey(courseId, topicName, context, type) {
  return `${courseId || ''}:${topicName || ''}:${context || 'exam'}:${type || ''}`;
}

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
 * Load saved AI result for this concept + context + type.
 * @param {string} courseId
 * @param {string} topicName
 * @param {string} context
 * @param {string} type - "bullets" | "paragraph"
 * @returns {{ text: string, savedAt: string } | null}
 */
export function loadSavedResult(courseId, topicName, context, type) {
  const data = getStorage();
  const entry = data[cacheKey(courseId, topicName, context, type)];
  if (!entry?.text) return null;
  return { text: entry.text, savedAt: entry.savedAt || '' };
}

/**
 * Save AI result for this concept + context + type.
 * @param {string} courseId
 * @param {string} topicName
 * @param {string} context
 * @param {string} type - "bullets" | "paragraph"
 * @param {string} text
 */
export function saveResult(courseId, topicName, context, type, text) {
  if (!text?.trim()) return;
  const data = getStorage();
  data[cacheKey(courseId, topicName, context, type)] = {
    text: text.trim(),
    savedAt: new Date().toISOString(),
  };
  setStorage(data);
}
