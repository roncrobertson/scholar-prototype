/**
 * Mnemonic Quality Gate — Cognitive Load & correctness checks.
 * Aligns with Master Document: semantic correctness, visualizability, capacity, layout.
 * Use before image generation or display to enforce memory-first constraints.
 *
 * Principles: chunking (1–7 items), anchor present, single scene, drawable/concrete visuals.
 */

import { attributeToSymbol } from '../data/visualGrammar';
import { runEngineValidation, HARD_FAILURE_IDS } from './visualMnemonicEngineValidation';

const MAX_ATTRIBUTES = 7;
const MIN_ATTRIBUTES = 1;
const MAX_SCENE_ELEMENTS = 5; // anchor + up to 4 supporting (chunking)
const MAX_SYMBOLS_PER_ZONE = 2; // layout gate: avoid overlap in one zone

/** Phrases that suggest abstract/non-drawable visuals; image_story / anchor / symbols should avoid these. */
const ABSTRACT_PHRASE_PATTERNS = [
  /\bresponsiveness\b/i,
  /\bmechanism\b/i,
  /\b(?:high|low)\s+levels?\b/i,
  /\b(?:increase|decrease)s?\b/i,
  /\b(?:inhibition|activation)\b/i,
  /\b(?:synthesis|degradation)\b/i,
];

/** Standalone terms that are not depictable as a single object/character (visualizability gate). */
const NON_DEPICTABLE_TERMS = new Set([
  'thing', 'object', 'concept', 'process', 'idea', 'abstract', 'generic',
  'something', 'element', 'factor', 'aspect', 'notion', 'phenomenon',
]);

/** Placeholder or empty fact text (semantic correctness gate). */
const PLACEHOLDER_PATTERNS = [/^\s*$/, /^(TBD|TODO|tbd|todo|\.\.\.|—)\s*$/i];

/**
 * Heuristic: fact looks like a definition (long, " — " list) rather than an action.
 * Visual Learning Checklist: "Each fact can be visually acted out."
 * @param {string} text - fact value
 * @returns {boolean} true if fact may be hard to show as action
 */
function looksLikeDefinitionNotAction(text) {
  if (!text || text.length < 50) return false;
  const lower = text.toLowerCase();
  const hasVerb = /\b(pass|block|flow|move|surround|float|bind|release|build|break|allow|prevent|control|regulate)\b/i.test(lower);
  if (hasVerb) return false;
  return (text.includes(' — ') || text.includes(';')) && text.length > 70;
}

/**
 * Pre-visual gate: facts non-ambiguous and internally consistent.
 * Reject empty/placeholder fact text; optional: flag near-duplicate or contradictory facts.
 * @param {object} artifact - { attributes }
 * @returns {string[]} warnings
 */
function semanticCorrectnessWarnings(artifact) {
  const w = [];
  const attrs = artifact?.attributes ?? [];
  attrs.forEach((attr, i) => {
    const text = (attr.value || '').trim();
    if (!text) w.push(`Fact ${i + 1} (${attr.type}) is empty.`);
    else if (PLACEHOLDER_PATTERNS.some((p) => p.test(text))) w.push(`Fact ${i + 1} looks like a placeholder.`);
    else if (looksLikeDefinitionNotAction(text)) w.push(`Fact ${i + 1} may be hard to show as an action (long definition); consider a shorter cause-effect phrase for the scene.`);
  });
  return w;
}

/**
 * Visualizability gate: anchor and symbol_map entries must be depictable as single object/character.
 * Uses blocklist and abstract phrase patterns.
 * @param {string} phrase - anchor.object or symbol description
 * @returns {boolean} true if phrase is likely non-depictable
 */
function isLikelyNonDepictable(phrase) {
  if (!phrase || typeof phrase !== 'string') return true;
  const lower = phrase.trim().toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  if (words.some((word) => NON_DEPICTABLE_TERMS.has(word.replace(/[^a-z]/g, '')))) return true;
  return ABSTRACT_PHRASE_PATTERNS.some((p) => p.test(phrase));
}

/**
 * Concreteness heuristic for anchor (0–1). Used to warn when anchor may be hard to depict.
 * Master Doc: concreteness/imageability norms; we use blocklist + abstract patterns + length.
 * @param {string} phrase - anchor.object or similar
 * @returns {number} 0 = very abstract, 1 = likely depictable
 */
function anchorConcretenessScore(phrase) {
  if (!phrase || typeof phrase !== 'string') return 0;
  const trimmed = phrase.trim();
  if (!trimmed.length) return 0;
  const words = trimmed.toLowerCase().split(/\s+/).filter(Boolean);
  let score = 1;
  if (words.some((w) => NON_DEPICTABLE_TERMS.has(w.replace(/[^a-z]/g, '')))) score -= 0.4;
  if (ABSTRACT_PHRASE_PATTERNS.some((p) => p.test(phrase))) score -= 0.4;
  // Short generic phrase (e.g. concept title only) is weaker than a concrete description
  if (words.length <= 2 && trimmed.length < 25) score -= 0.2;
  return Math.max(0, Math.min(1, score));
}

/**
 * Visualizability warnings for anchor and symbol_map.
 * @param {object} artifact - { anchor, symbol_map }
 * @returns {string[]} warnings
 */
function visualizabilityWarnings(artifact) {
  const w = [];
  if (artifact.anchor?.object) {
    if (isLikelyNonDepictable(artifact.anchor.object)) {
      w.push('Anchor description may not be depictable as a single object or character; prefer concrete nouns.');
    } else {
      const concreteness = anchorConcretenessScore(artifact.anchor.object);
      if (concreteness < 0.4) {
        w.push('Anchor concreteness low; consider a more depictable phrase (e.g. concrete noun + action).');
      }
    }
  }
  (artifact.symbol_map ?? []).forEach((slot, i) => {
    const symbolPart = (slot.symbol ?? '').toString().split('|')[0]?.trim() || '';
    const defaultSymbol = attributeToSymbol(slot.attribute_type, slot.value);
    const isDefaultGrammar = symbolPart && symbolPart === defaultSymbol;
    const desc = isDefaultGrammar ? (slot.value ?? '') : (symbolPart || (slot.value ?? ''));
    if (desc && isLikelyNonDepictable(desc)) {
      w.push(`Symbol ${i + 1} ("${String(desc).slice(0, 40)}…") may be too abstract to draw; prefer concrete visuals.`);
    }
  });
  return w;
}

/**
 * Validate a mnemonic artifact against cognitive-load, semantic correctness, and visualizability rules.
 * @param {object} artifact - { concept, anchor, attributes, symbol_map, image_story?, domain }
 * @returns {{ valid: boolean, warnings: string[], blockImageGeneration?: boolean }}
 */
export function validateMnemonicArtifact(artifact) {
  const warnings = [];

  if (!artifact) {
    return { valid: false, warnings: ['Artifact is missing.'], blockImageGeneration: true };
  }

  // Semantic correctness gate (pre-visual): non-ambiguous, non-empty facts
  warnings.push(...semanticCorrectnessWarnings(artifact));

  // Visualizability gate: anchor and symbols must be depictable
  warnings.push(...visualizabilityWarnings(artifact));

  // Concept Analyst / Fact Decomposition: chunking
  const attrCount = artifact.attributes?.length ?? 0;
  if (attrCount < MIN_ATTRIBUTES) {
    warnings.push(`Too few attributes (${attrCount}); need at least ${MIN_ATTRIBUTES} for a mnemonic.`);
  }
  if (attrCount > MAX_ATTRIBUTES) {
    warnings.push(`Too many attributes (${attrCount}); cap at ${MAX_ATTRIBUTES} for cognitive load.`);
  }

  // Phonetic Anchor: must be present
  if (!artifact.anchor?.object && !artifact.anchor?.phrase) {
    warnings.push('Phonetic anchor (phrase or object) is missing.');
  }

  // Scene Architect: capacity gate (anchor + symbol_map)
  const sceneElementCount = 1 + (artifact.symbol_map?.length ?? 0);
  if (sceneElementCount > MAX_SCENE_ELEMENTS) {
    warnings.push(`Scene has ${sceneElementCount} elements; cap at ${MAX_SCENE_ELEMENTS} for clarity.`);
  }

  // Layout gate: no zone overload (too many symbols in one zone → overlap risk)
  const symbolMap = artifact.symbol_map ?? [];
  const zoneCounts = {};
  symbolMap.forEach((slot) => {
    const z = slot.zone || 'foreground';
    zoneCounts[z] = (zoneCounts[z] || 0) + 1;
  });
  Object.entries(zoneCounts).forEach(([zone, count]) => {
    if (count > MAX_SYMBOLS_PER_ZONE) {
      warnings.push(`Zone "${zone}" has ${count} elements; consider spreading to avoid overlap (max ${MAX_SYMBOLS_PER_ZONE} per zone).`);
    }
  });

  // Drawable / concrete: image_story should describe concrete visuals, not abstract terms
  if (artifact.image_story?.trim()) {
    const story = artifact.image_story;
    for (const pattern of ABSTRACT_PHRASE_PATTERNS) {
      if (pattern.test(story)) {
        warnings.push(`image_story may contain abstract phrasing (e.g. "${pattern.source}"); prefer concrete objects and actions.`);
        break;
      }
    }
  }

  // Engine-level checks (content-agnostic; see docs/VISUAL_MNEMONIC_ENGINE_VALIDATION.md)
  const engineResult = runEngineValidation(artifact);
  engineResult.failed.forEach(({ id, message }) => {
    warnings.push(`Engine: ${id} — ${message}`);
  });
  const engineHardFailure = engineResult.failed.some((f) => HARD_FAILURE_IDS.includes(f.id));

  const valid = warnings.length === 0;
  const blockImageGeneration =
    warnings.some(
      (msg) =>
        msg.includes('is empty') ||
        msg.includes('placeholder') ||
        msg.includes('anchor (phrase or object) is missing') ||
        msg.includes(`cap at ${MAX_SCENE_ELEMENTS}`)
    ) || engineHardFailure;
  return { valid, warnings, blockImageGeneration };
}

/**
 * Run validation and attach result to artifact (non-destructive).
 * @param {object} artifact
 * @returns {object} artifact with _validation: { valid, warnings }
 */
export function withValidation(artifact) {
  if (!artifact) return artifact;
  const validation = validateMnemonicArtifact(artifact);
  return { ...artifact, _validation: validation };
}
