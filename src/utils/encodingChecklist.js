/**
 * Encoding checklist: concept + each key term → concrete visual.
 * Used before image generation so every term has a clear phonetic/visual in the scene.
 * Avoids showing the generic visual-grammar template (e.g. "action (cutting, blocking, tying, building)") as the visual — prefer the actual fact (slot.value) for learner-facing display.
 */

import { attributeToSymbol } from '../data/visualGrammar';

/** Humanize attribute type for display. */
function humanize(type) {
  if (!type || typeof type !== 'string') return 'Key term';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build the encoding checklist from an artifact.
 * @param {object} artifact - { concept, anchor, symbol_map }
 * @returns {Array<{ term: string, visual: string }>}
 */
export function getEncodingChecklist(artifact) {
  if (!artifact?.anchor) return [];
  const out = [];
  out.push({
    term: artifact.concept || 'Concept',
    visual: artifact.anchor.phrase
      ? `"${artifact.anchor.phrase}" → ${artifact.anchor.object}`
      : artifact.anchor.object,
  });
  (artifact.symbol_map || []).forEach((slot) => {
    const symbolPart = (slot.symbol || '').split('|')[0]?.trim() || '';
    const defaultSymbol = attributeToSymbol(slot.attribute_type, slot.value);
    const isDefaultGrammar = symbolPart && symbolPart === defaultSymbol;
    const visual = isDefaultGrammar ? (slot.value || '—') : (symbolPart || slot.value || '—');
    out.push({
      term: humanize(slot.attribute_type),
      visual,
    });
  });
  return out;
}
