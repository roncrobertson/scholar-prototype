/**
 * Learner-facing text: never show internal visual-grammar/symbol-library template phrases.
 * These are used for image prompts and internal logic only. When building or displaying
 * narrative, transcript, or "You're looking at", use fact text (slot.value) and sanitize
 * any string that might still contain these phrases (e.g. cached artifacts, legacy data).
 */

/** Phrases that must never appear in learner-facing copy (internal template only). */
export const INTERNAL_TEMPLATE_PHRASES = [
  'action (cutting, blocking, tying, building)',
  'cutting, blocking, tying, building',
  'chains | lock | stop sign',
  'chains, lock, or stop sign',
  'assembly line | chef cooking | building',
  'assembly line, chef cooking, or building',
  'cracking | demolition | leak',
  'cracking, demolition, or leak',
  'where object is placed (zone)',
  'broken ring | badge | uniform',
  'broken ring, badge, or uniform',
  'wall | door | gate',
  'wall, door, or gate',
  'growing | inflating | fire',
  'growing, inflating, or fire',
  'shrinking | leaking | deflating',
  'shrinking, leaking, or deflating',
  'damage to main character | rash | spill',
  'damage to main character, rash, or spill',
  'result visible on anchor or scene',
  'purple bacteria | colored zone',
  'purple bacteria or colored zone',
  'shield | armor | enzyme cutting key',
  'shield, armor, or enzyme cutting key',
  'background | small label',
  'background or small label',
  'character holding tool',
  'doorbell | mailbox | antenna',
  'doorbell, mailbox, or antenna',
];

const FALLBACK_PHRASE = 'the key idea';

/**
 * Remove internal template phrases from a string before showing to learners.
 * Use on transcript, image_story, and any other learner-facing narrative text.
 * @param {string} str - Raw narrative or description
 * @returns {string} Sanitized string (template phrases replaced with fallback, spaces collapsed)
 */
export function sanitizeLearnerFacingText(str) {
  if (!str || typeof str !== 'string') return str;
  let out = str;
  for (const phrase of INTERNAL_TEMPLATE_PHRASES) {
    if (out.includes(phrase)) {
      out = out.split(phrase).join(FALLBACK_PHRASE);
    }
  }
  return out.replace(/\s+/g, ' ').replace(/\s*\.\s*\./g, '.').trim();
}
