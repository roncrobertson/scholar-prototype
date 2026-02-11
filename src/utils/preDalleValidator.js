/**
 * Pre-DALL·E validation: ensure the scene prompt contains required elements before sending.
 * Proactive check: anchor + primary symbol must appear in the prompt; otherwise block generation.
 * Aligns with PICMONIC_IMPROVEMENT_PROPOSAL.md §2.1A.
 */

import { getPrimaryFactVisual } from '../services/promptEngineer';

/** Minimum substring length to consider a match (avoids false positives from tiny overlaps). */
const MIN_KEY_LENGTH = 8;

/**
 * Extract a searchable key from a phrase (anchor or symbol).
 * Strips articles, trims, takes first meaningful segment.
 */
function toSearchKey(phrase) {
  if (!phrase || typeof phrase !== 'string') return '';
  const trimmed = phrase
    .trim()
    .replace(/^(a |an |the )/i, '')
    .replace(/\.\s*$/, '')
    .trim();
  return trimmed.toLowerCase();
}

/**
 * Check if the prompt contains a sufficient substring of the key.
 * Uses word-boundary-friendly matching: key words should appear in order.
 */
function promptContainsKey(prompt, key) {
  if (!prompt || !key || key.length < MIN_KEY_LENGTH) return true; // no key = pass
  const promptLower = prompt.toLowerCase();
  // Split key into words; at least 2 words or 1 long word must appear
  const words = key.split(/\s+/).filter((w) => w.length >= 2);
  if (words.length === 0) return true;
  // Require first word (or first two words) to appear
  const firstPhrase = words.slice(0, 2).join(' ');
  return promptLower.includes(firstPhrase) || promptLower.includes(words[0]);
}

/**
 * Validate that the scene prompt contains required elements (anchor + primary symbol).
 * Call before generateMnemonicImage to block incomplete prompts.
 *
 * @param {string} prompt - Full DALL·E prompt (or scene portion)
 * @param {object} artifact - { anchor, attributes, symbol_map }
 * @returns {{ ok: boolean, missing: string[] }}
 */
export function validateRequiredElements(prompt, artifact) {
  if (!artifact) return { ok: true, missing: [] };
  const missing = [];

  // Anchor must be present
  const anchorObj = artifact?.anchor?.object;
  if (anchorObj) {
    const anchorKey = toSearchKey(anchorObj);
    if (anchorKey.length >= MIN_KEY_LENGTH && !promptContainsKey(prompt, anchorKey)) {
      missing.push('anchor');
    }
  }

  // Primary symbol (if we have one) should be present
  const primaryVisual = getPrimaryFactVisual(artifact);
  if (primaryVisual) {
    const primaryKey = toSearchKey(primaryVisual);
    if (primaryKey.length >= MIN_KEY_LENGTH && !promptContainsKey(prompt, primaryKey)) {
      missing.push('primary symbol');
    }
  }

  return {
    ok: missing.length === 0,
    missing,
  };
}
