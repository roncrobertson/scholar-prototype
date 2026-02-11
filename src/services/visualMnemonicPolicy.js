/**
 * Global visual mnemonic policy — one set of rules for every picmonic image.
 * Applied to scene description before it becomes a DALL·E prompt.
 * Aligns with Master Doc: 3–5 elements, one anchor, no text, no extraneous props.
 */

/** Maximum total visual elements (anchor + supporting) in the scene. */
export const MAX_ELEMENTS = 5;

/** Plurality rules: replace phrases that invite crowds or many figures. */
const PLURALITY_RULES = [
  [/\bsmall figures\b/gi, 'one or two small figures'],
  [/\blarge or charged figures\b/gi, 'one larger figure'],
  [/\blarge figures\b/gi, 'one larger figure'],
  [/\bmultiple (figures|characters|people)\b/gi, 'one or two $1'],
  [/\bmany (small )?figures\b/gi, 'one or two small figures'],
  [/\bcrowds?\b/gi, 'one or two figures'],
  [/\bseveral (figures|characters|people)\b/gi, 'one or two $1'],
];

/** Phrases that imply extraneous props; remove or replace with minimal equivalent. */
const FORBIDDEN_PHRASES = [
  /traffic cones?/gi,
  /construction equipment/gi,
  /cameras? on tripods?/gi,
  /spotlights?/gi,
  /signs? (with )?numbers?/gi,
  /scoreboards?/gi,
  /digital displays?/gi,
  /(numbers?|digits?)\s*(like\s*)?\d+/gi,
  /crowds?/gi,
  /(many|numerous)\s+(extra\s+)?(background\s+)?(figures?|people|characters?)/gi,
  // Lab/scientist clutter (so minimal scenes stay minimal)
  /\b(lab(oratory)?|laboratories)\b/gi,
  /shelves?\s*(with|holding|of)/gi,
  /beakers?\s*(and|or)\s*flasks?/gi,
  /scientists?\s*(in|with|at)/gi,
  /(second|extra)\s+person/gi,
  /dna\s*(helix|double\s*helix|structure)/gi,
  /clock(s)?\s*on\s*the\s*wall/gi,
  // Room/sign text (observed in Cell Membrane output)
  /\b(room|door)\s*numbers?\b/gi,
  /\b\d{3}\s*(bio|alien|room|lab)\b/gi,
  // Furniture/clutter (reduce orphan visuals)
  /\b(wooden\s+)?table\s*(with|and)\s*(chair|wastebasket)?/gi,
  /\bwastebasket\b/gi,
  /\bchairs?\s*(and|or)\s*tables?\b/gi,
  /\bdesks?\s*(with|and)/gi,
];

/**
 * Apply global policy to a scene description string.
 * - Normalizes plurality (one or two figures, not crowds).
 * - Strips or softens forbidden phrases (cones, cameras, signs, numbers).
 * - Does not change anchor or zone structure; only makes the description policy-compliant.
 *
 * @param {string} sceneDescription - Raw scene text (from image_story or blueprint)
 * @returns {string} Policy-compliant scene description
 */
export function applyPolicy(sceneDescription) {
  if (!sceneDescription || typeof sceneDescription !== 'string') return '';

  let out = sceneDescription.trim();

  // Apply plurality rules
  for (const [pattern, replacement] of PLURALITY_RULES) {
    out = out.replace(pattern, replacement);
  }

  // Remove or replace forbidden phrases (replace with empty to avoid broken sentences; then collapse spaces)
  for (const pattern of FORBIDDEN_PHRASES) {
    out = out.replace(pattern, '');
  }
  out = out.replace(/\s+/g, ' ').replace(/\s*\.\s*\./g, '.').trim();

  return out;
}
