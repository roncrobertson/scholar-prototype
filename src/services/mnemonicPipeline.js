/**
 * Mnemonic pipeline: raw input → fact extraction → ground-truth rewrite → scene blueprint → image_story.
 * Aligns with Master Document: facts = source-of-truth; visuals = encodings; render downstream of blueprint.
 * Use for "Create from text" or any flow where input is messy text / learning objective.
 */

import { getDecomposition } from '../data/conceptDecompositions';
import { getPhoneticAnchor } from '../data/phoneticAnchors';
import { generatePhoneticAnchor } from './phoneticAnchorGenerator';
import { buildSymbolMap } from '../data/visualGrammar';
import { enrichSymbolMapWithLibrary } from '../data/symbolLibrary';
import { getSceneSettingForArtifact } from './promptEngineer';
import { withValidation } from '../utils/mnemonicValidation';
import { extractFactsWithLLM } from './llmFacts';

const MAX_FACTS = 7;
const MIN_FACTS = 1;

/** Fact types we can infer from sentence start or keywords (for heuristic extraction). */
const FACT_TYPE_PATTERNS = [
  { pattern: /^(location|where|place)\b/i, type: 'location' },
  { pattern: /^(mechanism|how|process)\b/i, type: 'mechanism' },
  { pattern: /^(effect|result|outcome)\b/i, type: 'effect' },
  { pattern: /^(cause|class|type)\b/i, type: 'class' },
  { pattern: /^(structure|composition)\b/i, type: 'structure' },
  { pattern: /^(inhibition|block|prevent)\b/i, type: 'inhibition' },
  { pattern: /^(side effect|warning|risk)\b/i, type: 'side_effect' },
];

/**
 * Extract 1–7 atomic facts from raw text (heuristic: sentence split + type inference).
 * For production, swap in LLM-based extraction with structured output.
 * @param {string} rawInput - Paragraph or learning objective
 * @returns {Array<{ fact_id: string, fact_text: string, priority: string, fact_type: string }>}
 */
export function extractFacts(rawInput) {
  if (!rawInput || typeof rawInput !== 'string') return [];
  const trimmed = rawInput.trim();
  if (!trimmed) return [];
  // Split on sentence boundaries (period, newline, semicolon)
  const chunks = trimmed
    .split(/[.\n;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);
  const facts = [];
  for (let i = 0; i < Math.min(chunks.length, MAX_FACTS); i++) {
    const text = chunks[i];
    let fact_type = 'definition';
    for (const { pattern, type } of FACT_TYPE_PATTERNS) {
      if (pattern.test(text)) {
        fact_type = type;
        break;
      }
    }
    facts.push({
      fact_id: `fact-${i}`,
      fact_text: text,
      priority: i < 3 ? 'high' : 'medium',
      fact_type,
    });
  }
  return facts;
}

/**
 * Ground-truth rewrite: normalize fact_text (trim, ensure period). No semantic change.
 * Lock as single source of truth for hotspots, quiz, legend.
 * @param {Array<{ fact_id: string, fact_text: string, priority: string, fact_type: string }>} facts
 * @returns {Array<{ fact_id: string, fact_text: string, priority: string, fact_type: string }>}
 */
export function rewriteFactsAsGroundTruth(facts) {
  if (!facts?.length) return [];
  return facts.map((f) => ({
    ...f,
    fact_text: (f.fact_text || '').trim().replace(/\s+/g, ' ').replace(/([^.])$/, '$1.'),
  }));
}

/**
 * Convert pipeline facts to attributes for buildSymbolMap.
 * First fact is marked primary; visual_mnemonic from LLM is passed through when present.
 * @param {Array<{ fact_text: string, fact_type: string, visual_mnemonic?: string }>} facts
 * @returns {Array<{ type: string, value: string, priority?: string, visual_mnemonic?: string }>}
 */
function factsToAttributes(facts) {
  return (facts || []).map((f, i) => ({
    type: f.fact_type || 'definition',
    value: f.fact_text || '',
    ...(i === 0 ? { priority: 'primary' } : {}),
    ...(f.visual_mnemonic ? { visual_mnemonic: f.visual_mnemonic } : {}),
  }));
}

/**
 * Build scene blueprint from anchor + symbol_map + domain.
 * @param {object} anchor - { phrase, object }
 * @param {Array<{ symbol_id?: string, zone: string, symbol: string }>} symbolMap
 * @param {string} domain
 * @returns {{ locus: string, zones: object, micro_story: string, traversal_order: string[] }}
 */
function buildSceneBlueprintFromPipeline(anchor, symbolMap, domain) {
  const locus =
    getSceneSettingForArtifact({ anchor, symbol_map: symbolMap, domain }) || 'a single memorable scene';
  const zones = { center: [], foreground: [], left: [], right: [], background: [] };
  const traversal_order = [];
  (symbolMap || []).forEach((slot, i) => {
    const sid = slot.symbol_id || `symbol-${i}`;
    const z = slot.zone in zones ? slot.zone : 'foreground';
    if (!zones[z].includes(sid)) zones[z].push(sid);
    traversal_order.push(sid);
  });
  const parts = [];
  if (anchor?.object) parts.push(anchor.object);
  const byZone = { left: [], foreground: [], right: [], background: [] };
  (symbolMap || []).forEach((s) => {
    const z = s.zone in byZone ? s.zone : 'foreground';
    // Use fact text for blueprint so image_story / "You're looking at" never show internal template phrases
    const text = (s.value && String(s.value).trim()) || (s.symbol && s.symbol.split('|')[0]?.trim()) || '';
    byZone[z].push(text);
  });
  if (byZone.left.length) parts.push(`To the left: ${byZone.left.join('; ')}.`);
  if (byZone.foreground.length) parts.push(`In the foreground: ${byZone.foreground.join('; ')}.`);
  if (byZone.right.length) parts.push(`To the right: ${byZone.right.join('; ')}.`);
  if (byZone.background.length) parts.push(`In the background: ${byZone.background.join('; ')}.`);
  const micro_story = parts.join(' ');
  return { locus, zones, micro_story, traversal_order };
}

/**
 * Derive one-sentence image_story for DALL·E from scene blueprint and anchor.
 * @param {{ micro_story: string }} sceneBlueprint
 * @param {object} anchor - { object }
 * @returns {string}
 */
export function deriveImageStoryFromBlueprint(sceneBlueprint, anchor) {
  const micro = (sceneBlueprint?.micro_story || '').trim();
  if (micro.length < 200) {
    return `One scene: ${micro} No split panels.`;
  }
  const anchorPart = anchor?.object ? `One scene: ${anchor.object}. ` : 'One scene: ';
  const short = micro.split('.')[0] + '.' + (micro.split('.')[1] ? ' ' + micro.split('.')[1] + '.' : '');
  return anchorPart + short + ' No split panels.';
}

/**
 * Build narrative (2–3 sentences) from anchor + symbol_map for transcript/legend.
 */
function buildNarrativeFromArtifact(artifact) {
  const { anchor, symbol_map } = artifact;
  const byZone = { left: [], foreground: [], right: [], background: [] };
  (symbol_map || []).forEach((s) => {
    const z = s.zone in byZone ? s.zone : 'foreground';
    // Prefer actual fact (value) for learner-facing narrative; avoid raw template strings like "action (cutting, blocking, tying, building)"
    const text = (s.value && String(s.value).trim()) || (s.symbol && s.symbol.split('|')[0]?.trim()) || '';
    byZone[z].push(text);
  });
  const parts = [];
  if (anchor?.object) parts.push(`Picture ${anchor.object}.`);
  if (byZone.left.length) parts.push(`To the left: ${byZone.left.join('; ')}.`);
  if (byZone.foreground.length) parts.push(`In the foreground: ${byZone.foreground.join('; ')}.`);
  if (byZone.right.length) parts.push(`To the right: ${byZone.right.join('; ')}.`);
  if (byZone.background.length) parts.push(`In the background: ${byZone.background.join('; ')}.`);
  return parts.join(' ');
}

/**
 * Derive one causal sentence linking anchor + mechanism + effect (for recall, not definition).
 * Used when decomposition has no recall_story (pipeline-generated or library concepts missing it).
 * Exported so picmonics.getMnemonicArtifact can use it when decomposition.recall_story is missing.
 * @param {{ anchor: { object?: string }, symbol_map: Array<{ zone?: string, value?: string, symbol?: string }> }} artifact
 * @returns {string|null}
 */
export function deriveRecallStory(artifact) {
  const { anchor, symbol_map } = artifact;
  if (!anchor?.object) return null;
  const foreground = (symbol_map || []).filter((s) => (s.zone || '') === 'foreground');
  const right = (symbol_map || []).filter((s) => (s.zone || '') === 'right');
  const mechanism = foreground[0]?.value || foreground[0]?.symbol?.split('|')[0]?.trim();
  const effect = right[0]?.value || right[0]?.symbol?.split('|')[0]?.trim();
  const anchorShort = anchor.object.replace(/^(a |an )/i, '').replace(/\.$/, '');
  if (mechanism && effect) {
    return `The ${anchorShort} does ${mechanism.toLowerCase()}, so ${effect.toLowerCase()}.`;
  }
  if (mechanism) {
    return `The ${anchorShort} does ${mechanism.toLowerCase()}.`;
  }
  return `Picture ${anchor.object}.`;
}

/**
 * Run full pipeline: raw input → facts → rewrite → symbol_map → scene_blueprint → image_story → artifact.
 * When VITE_OPENAI_API_KEY is set, tries LLM fact extraction first; falls back to heuristic.
 * @param {string} rawInput - Pasted paragraph or learning objective
 * @param {object} options - { concept_id?, domain?, concept_title? }
 * @returns {Promise<object|null>} Artifact (same shape as getMnemonicArtifact) or null if extraction yields no facts
 */
export async function runPipeline(rawInput, options = {}) {
  const { concept_id, domain = 'general', concept_title = 'Generated concept', anchorOverride } = options;
  let facts = await extractFactsWithLLM(rawInput);
  if (!facts || facts.length < MIN_FACTS) facts = extractFacts(rawInput);
  if (facts.length < MIN_FACTS) return null;
  facts = rewriteFactsAsGroundTruth(facts);
  let attributes = factsToAttributes(facts);
  // Parity with library: when concept_id is known, merge visual_mnemonic and priority from decomposition
  if (concept_id) {
    const decomposition = getDecomposition(concept_id);
    const libAttrs = decomposition?.attributes ?? [];
    attributes = attributes.map((attr, i) => {
      const lib = libAttrs[i];
      if (!lib) return attr;
      return {
        ...attr,
        ...(lib.visual_mnemonic != null && { visual_mnemonic: lib.visual_mnemonic }),
        ...(lib.priority != null && { priority: lib.priority }),
      };
    });
  }
  let anchor =
    anchorOverride && anchorOverride.phrase && anchorOverride.object
      ? { phrase: anchorOverride.phrase, object: anchorOverride.object }
      : concept_id
        ? getPhoneticAnchor(concept_id)
        : null;
  if (!anchor) {
    const generated = await generatePhoneticAnchor(concept_title, domain);
    anchor = generated || { phrase: concept_title, object: concept_title };
  }
  const symbol_map = enrichSymbolMapWithLibrary(buildSymbolMap(attributes));
  const scene_blueprint = buildSceneBlueprintFromPipeline(anchor, symbol_map, domain);
  const image_story = deriveImageStoryFromBlueprint(scene_blueprint, anchor);
  const scene = {
    center: 'phonetic anchor',
    foreground: 'mechanism',
    left: 'cause / class',
    right: 'effects / side effects',
    background: 'associations / exceptions',
  };
  const base = {
    concept: concept_title,
    domain,
    source_text: (typeof rawInput === 'string' && rawInput.trim()) ? rawInput.trim() : null,
    created_at: new Date().toISOString(),
    summary: facts[0]?.fact_text || null,
    core_concept: facts.map((f) => f.fact_text).join(' ').slice(0, 200) + (facts.length ? '…' : ''),
    exam_summary: facts[0]?.fact_text || null,
    high_yield_distinctions: null,
    image_story,
    encoding_mode: options.encoding_mode || 'full_mnemonic',
    recall_story: deriveRecallStory({
      anchor,
      symbol_map,
      concept: concept_title,
      attributes: factsToAttributes(facts),
    }),
    attributes,
    anchor: anchor || { phrase: concept_title, object: concept_title },
    symbol_map,
    scene,
    scene_blueprint,
  };
  const narrative = buildNarrativeFromArtifact(base);
  const scene_setting = getSceneSettingForArtifact(base);
  const artifact = { ...base, narrative, transcript: narrative, scene_setting };
  return withValidation(artifact);
}
