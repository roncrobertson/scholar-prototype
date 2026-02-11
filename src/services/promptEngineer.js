/**
 * Mnemonic image prompt: scene blueprint → single DALL-E prompt.
 * Aligns with Step 6 (scene assembly) + Step 7 (generate from scene).
 * Labels are NEVER baked into the image; use overlay hotspots instead.
 * All scene text is run through visualMnemonicPolicy.applyPolicy() so one global set of rules applies.
 */

import { applyPolicy } from './visualMnemonicPolicy';
import { deriveSceneSentenceFromBlueprint as llmSceneSentence } from './llmSceneSentence';

/** Visual Learning Checklist: objects act, cause→effect, facts visible as action. */
const ACTION_RULES =
  'Every element must be doing something: moving, blocking, reacting, or causing a visible effect—no purely decorative or static props. ' +
  'Show a clear cause and effect: something causes something else to happen (e.g. one thing blocks, allows, or transforms another). ' +
  'Each key fact must be visible as an action or event in the scene, not only as a static object. ';

/** Strong action verbs by attribute type for one causal moment (content-agnostic). Used in deriveMinimalSceneFromBlueprint. */
const VERB_BY_ATTRIBUTE_TYPE = {
  mechanism: 'acts on',
  inhibition: 'blocks',
  synthesis: 'builds',
  breakdown: 'breaks',
  structure: 'affects',
  effect: 'causes',
  side_effect: 'triggers',
  spectrum: 'targets',
  increase: 'amplifies',
  decrease: 'reduces',
  resistance: 'resists',
  exception: 'contrasts with',
  location: 'sits in',
  class: 'relates to',
  enzyme: 'acts on',
  receptor: 'binds',
};

const STYLE_PREFIX =
  'One clear main character or focal object in the center. Minimal, uncluttered background. ' +
  'The main character or focal object should have a clear expression or pose and one or two distinctive visual details (e.g. costume, prop, or gesture) so it is instantly recognizable. ' +
  'High-contrast, vivid digital illustration in a Pixar-style with a touch of whimsy. ' +
  'Exaggerated characters and memorable, slightly surreal—simple and memorable scene. ' +
  'Make the scene slightly absurd or whimsical so it is highly memorable (e.g. exaggerated expressions, unexpected juxtapositions), while keeping the same meaning. ' +
  'Include one small absurd or humorous detail (e.g. unexpected prop, expression, or juxtaposition) that makes the scene stick in memory, without adding new informational content. ' +
  'Use size or color to emphasize the most important element (e.g. main character slightly larger or more vivid). ' +
  'A ridiculous or emotionally vivid image is far more memorable than a bland one—push toward absurd, humorous, or striking so it sticks in memory. ' +
  'Wide shot: one main character or object in the foreground, at most 2–3 secondary elements in the background. ' +
  'Concrete, recognizable shapes with strong personality—not a literal diagram or generic lab. ' +
  'One single continuous scene only: no split panels, no diptych, no dividers. ' +
  ACTION_RULES +
  'CRITICAL: Do not draw any text, words, labels, numbers, digits, or letters anywhere in the image. No text on any objects—no words on signs, cards, papers, screens, books, clothing, or props. No numbers, no scoreboards, no digital displays. Use only shapes, symbols, and illustrations. The image must be purely visual with zero written content. ' +
  'Include only elements that encode the concept; every visible element must have a mnemonic role. Maximum 4 total elements in the scene. No crowds, no extra figures, no traffic cones, no construction equipment, no cameras, no tripods, no props that are not listed. ' +
  'Safe for classroom: no violence, no sexual content, no graphic or disturbing imagery. ';

/** Reinforced no-text and element-cap rule appended to every prompt. */
const NO_TEXT_SUFFIX =
  ' No text, no words, no labels, no numbers, no digits anywhere. No room numbers, no labels on doors, no signs with text—sticky notes, papers, boards, and signs must be completely blank. Every surface must have zero written content. Only the elements explicitly described above; no extra objects, crowds, or equipment. Purely visual illustration only.';

/**
 * Principle-based scope rules (global for all picmonics).
 * DO DRAW: Only what is explicitly listed in the scene description.
 * DO NOT DRAW: Anything not listed—no extra characters, environments, props, or text.
 */
const DO_DRAW_RULE =
  ' Draw only: (1) the main character or anchor, and (2) the 2–4 supporting elements explicitly named in the scene description above. Every visible thing in the image must be one of those; nothing else. Empty, minimal background—only what is listed. ';
const DO_NOT_DRAW_RULE =
  ' Do not draw anything that is not explicitly listed in the scene description. No extra characters, people, or figures. No furniture (no tables, chairs, desks, wastebaskets). No extra doors, walls, or rooms beyond what is described. No props, equipment, or decorative objects unless listed. No lab clutter, no office items, no generic room interiors. No text, words, letters, numbers, or writing of any kind anywhere in the image. ';

/** Combined scope rules appended to every prompt (principle-based, not item lists). */
const SCOPE_SUFFIX = DO_DRAW_RULE + DO_NOT_DRAW_RULE;

/** Shorter style for characterization_only: one main character, simpler scene, no heavy symbolism. */
const CHARACTERIZATION_STYLE =
  'One clear main character or focal object in the center. Simple, memorable digital illustration. Minimal background. ' +
  'No text, words, labels, numbers, or digits anywhere in the image. Maximum 4 elements. ';

/** Default scene setting by domain (memory palace). */
const SCENE_SETTING_BY_DOMAIN = {
  biology: 'a clear, well-lit scene like a lab or cell interior',
  pharmacology: 'a memorable scene like a medieval castle or battlefield',
  psychology: 'a relatable indoor scene',
  economics: 'a marketplace or room with clear zones',
};

/**
 * Get human-readable scene setting for UI (e.g. "Setting: Lab or cell interior").
 * @param {object} artifact - { anchor, symbol_map, domain }
 * @returns {string} Short setting description for Mnemonic Legend
 */
export function getSceneSettingForArtifact(artifact) {
  if (!artifact?.anchor) return '';
  const raw =
    SCENE_SETTING_BY_DOMAIN[artifact.domain] || 'a single memorable scene';
  const cleaned = raw
    .replace(/^a clear, well-lit scene like /i, '')
    .replace(/^a memorable scene like /i, '')
    .replace(/^a (single )?memorable scene\.?$/i, 'memory palace')
    .replace(/^a /, '')
    .trim();
  return cleaned || 'memory palace';
}

/**
 * Build a scene blueprint from artifact: setting + elements with visual and position.
 * Step 6: scene assembly — one environment, all elements placed by zone.
 * @param {object} artifact - { anchor, symbol_map, domain }
 * @returns {{ scene_setting: string, elements: Array<{ visual: string, position: string }> }}
 */
export function buildSceneBlueprint(artifact) {
  if (!artifact?.anchor) return { scene_setting: 'a single memorable scene', elements: [] };
  const setting =
    SCENE_SETTING_BY_DOMAIN[artifact.domain] || 'a single memorable scene';
  const elements = [];
  elements.push({
    visual: artifact.anchor.object,
    position: 'center',
  });
  const maxExtra = 3;
  (artifact.symbol_map || []).slice(0, maxExtra).forEach((slot) => {
    const visual = (slot.symbol || '').split('|')[0].trim() || slot.value;
    if (visual) elements.push({ visual, position: slot.zone || 'foreground' });
  });
  return { scene_setting: setting, elements };
}

/**
 * Get the primary fact's visual description for prompt emphasis (priority 'primary' or first attribute).
 * @param {object} artifact - { attributes, symbol_map }
 * @returns {string|null} Visual phrase for primary fact, or null
 */
export function getPrimaryFactVisual(artifact) {
  const attrs = artifact?.attributes ?? [];
  const symbolMap = artifact?.symbol_map ?? [];
  if (!attrs.length || !symbolMap.length) return null;
  const primaryIndex = attrs.findIndex((a) => a.priority === 'primary');
  const i = primaryIndex >= 0 ? primaryIndex : 0;
  const slot = symbolMap[i];
  const visual = slot?.symbol?.split('|')[0]?.trim() || slot?.value;
  return visual || null;
}

/**
 * Get the primary fact's attribute type (for strong-verb selection). Content-agnostic.
 * @param {object} artifact - { attributes }
 * @returns {string|null} Attribute type of primary fact, or null
 */
function getPrimaryAttributeType(artifact) {
  const attrs = artifact?.attributes ?? [];
  if (!attrs.length) return null;
  const primaryIndex = attrs.findIndex((a) => a.priority === 'primary');
  const i = primaryIndex >= 0 ? primaryIndex : 0;
  const type = (attrs[i].type || '').toLowerCase().replace(/\s+/g, '_');
  return type || null;
}

/**
 * Pick a strong action verb for the causal sentence by attribute type. Content-agnostic.
 * @param {string|null} attributeType - e.g. "mechanism", "inhibition"
 * @returns {string} Verb phrase for "The [anchor] [verb] [primary], so [effect]"
 */
function getCausalVerb(attributeType) {
  if (!attributeType) return 'shows or does';
  const key = attributeType.toLowerCase().replace(/\s+/g, '_');
  return VERB_BY_ATTRIBUTE_TYPE[key] || 'acts on';
}

/**
 * Heuristic: anchor object reads like a character (anthropomorphic). Content-agnostic.
 * @param {object} anchor - { object?: string }
 * @returns {boolean}
 */
function isAnchorCharacterLike(anchor) {
  if (!anchor?.object || typeof anchor.object !== 'string') return false;
  const lower = anchor.object.toLowerCase();
  return /\b(character|figure|villain|chef|creature|person|animal|being|actor)\b/.test(lower);
}

/**
 * Get effect-type visual (first in 'right' zone or second slot) for cause→effect sentence.
 * @param {object} artifact - { symbol_map }
 * @returns {string|null}
 */
function getEffectVisual(artifact) {
  const symbolMap = artifact?.symbol_map ?? [];
  const rightSlot = symbolMap.find((s) => (s.zone || '').toLowerCase() === 'right');
  if (rightSlot) {
    const v = rightSlot.symbol?.split('|')[0]?.trim() || rightSlot.value;
    if (v) return v;
  }
  if (symbolMap.length > 1) {
    const v = symbolMap[1].symbol?.split('|')[0]?.trim() || symbolMap[1].value;
    if (v) return v;
  }
  return null;
}

/**
 * Derive a single layout line from blueprint so DALL·E places elements where our hotspot zones expect them.
 * Concept-agnostic: uses only anchor + symbol_map visual and zone.
 * @param {object} artifact - { anchor, symbol_map }
 * @returns {string} e.g. "Place the main character in the center, X on the left, Y on the right." or ''
 */
export function deriveLayoutLine(artifact) {
  const { elements } = buildSceneBlueprint(artifact);
  if (elements.length < 2) return '';
  const center = elements.find((e) => e.position === 'center');
  const left = elements.filter((e) => e.position === 'left');
  const right = elements.filter((e) => e.position === 'right');
  const foreground = elements.filter((e) => e.position === 'foreground');
  const background = elements.filter((e) => e.position === 'background');
  const parts = [];
  if (center?.visual) parts.push('the main character in the center');
  if (left.length) parts.push(`${left[0].visual} on the left`);
  if (right.length) parts.push(`${right[0].visual} on the right`);
  if (foreground.length) parts.push(`${foreground[0].visual} in the foreground`);
  if (background.length) parts.push(`${background[0].visual} in the background`);
  if (parts.length < 2) return '';
  return `Place ${parts.join(', ')}.`;
}

/**
 * Derive a short clause stating that each key element must be clearly visible and distinct.
 * Concept-agnostic: list comes from artifact anchor + symbol_map (max 5).
 * @param {object} artifact - { anchor, symbol_map }
 * @returns {string} e.g. "Elements to show: (1) X, (2) Y, (3) Z. Each must be clearly visible and distinct." or ''
 */
export function deriveDistinctElementsClause(artifact) {
  const { elements } = buildSceneBlueprint(artifact);
  if (elements.length < 2) return '';
  const list = elements.slice(0, 5).map((e, i) => `(${i + 1}) ${e.visual}`).join(', ');
  return `Elements to show: ${list}. Each must be clearly visible and distinct.`;
}

/**
 * Derive one short, minimal scene sentence from blueprint (Phase 0.2).
 * Prefer single causal structure: "X does Y, so Z." Primary fact is visually dominant.
 * @param {object} artifact - { anchor, symbol_map, attributes }
 * @returns {string}
 */
export function deriveMinimalSceneFromBlueprint(artifact) {
  const { scene_setting, elements } = buildSceneBlueprint(artifact);
  if (!elements.length) return `One scene: ${scene_setting}. Minimal background. No split panels.`;
  const center = elements[0]?.visual || artifact?.anchor?.object || 'the subject';
  const primaryVisual = getPrimaryFactVisual(artifact);
  const effectVisual = getEffectVisual(artifact);

  // Single causal sentence with strong verb: "The [anchor] [verb] [primary], so [effect]." Content-agnostic.
  if (primaryVisual && effectVisual && primaryVisual !== effectVisual) {
    const anchorShort = (artifact?.anchor?.object || center).replace(/^(a |an )/i, '').replace(/\.$/, '').trim();
    const primaryType = getPrimaryAttributeType(artifact);
    const verb = getCausalVerb(primaryType);
    const causal = `The ${anchorShort} ${verb} ${primaryVisual.toLowerCase()}, so ${effectVisual.toLowerCase()}.`;
    const rest = elements.slice(1, 4).map((e) => e.visual).filter(Boolean);
    const restPhrase = rest.length ? ` Only these elements: ${[center, ...rest].join('; ')}.` : '';
    return `One scene: ${scene_setting}. ${causal}${restPhrase} Minimal background. No split panels.`;
  }

  // Primary emphasis when we have primary but no effect pair
  const rest = elements.slice(1, 4).map((e) => e.visual).filter(Boolean);
  const restPhrase = rest.length ? ` One or two supporting elements: ${rest.join('; ')}.` : '';
  const primaryPhrase = primaryVisual ? ` Main character shows or does ${primaryVisual}; other elements support.` : '';
  return `One scene: ${scene_setting}. One main character or focal object in the center: ${center}.${primaryPhrase}${restPhrase} Minimal background. No split panels.`;
}

/**
 * Turn scene blueprint into one cohesive DALL-E prompt.
 * If artifact has image_story, use it for one unified story-driven scene (phonetic visuals, no split panels).
 * Otherwise fall back to zone-based blueprint.
 * @param {object} artifact - full mnemonic artifact
 * @returns {string} Full prompt for DALL-E
 */
export function buildScenePrompt(artifact) {
  if (!artifact) return '';
  const suffix = NO_TEXT_SUFFIX;
  const isCharacterizationOnly = artifact.encoding_mode === 'characterization_only';
  const stylePrefix = isCharacterizationOnly ? CHARACTERIZATION_STYLE : STYLE_PREFIX;
  // Content-agnostic: anthropomorphism hint only when anchor reads as a character (e.g. "evil pencil character")
  const anthropomorphismLine =
    !isCharacterizationOnly && isAnchorCharacterLike(artifact.anchor)
      ? ' The main character should be anthropomorphic: clear face, expression, and at least one distinctive costume or prop so it is memorable and recognizable. '
      : '';

  // Concept-agnostic: layout + distinct-elements clause so DALL·E aligns with hotspot zones and draws distinct elements
  const layoutLine = deriveLayoutLine(artifact);
  const distinctClause = deriveDistinctElementsClause(artifact);
  const layoutAndDistinct = (layoutLine && distinctClause) ? ` ${layoutLine} ${distinctClause}` : '';

  // Prefer curated image_story when present (single causal narrative, minimal background) over generic blueprint
  const hasImageStory = artifact.image_story?.trim();
  const primaryVisual = getPrimaryFactVisual(artifact);
  const primaryPhrase = primaryVisual ? ` Main character shows or does ${primaryVisual}.` : '';
  if (hasImageStory && hasImageStory.length > 60) {
    // Lead with principle-based scope so DALL·E sees the constraint first
    const onlyDrawLead =
      'Draw only the main character and the 2–4 supporting elements explicitly named in the next sentence. Do not add any other characters, objects, environments, props, or text. ';
    // Enforce single causal: remove "and also" / multiple processes so DALL·E gets one moment (CHECK_9)
    const raw = hasImageStory
      .replace(/\s+and\s+also\s+/gi, '. ')
      .replace(/\b(second(ly)?|third(ly)?|additionally),?\s+/gi, ' ')
      .trim();
    const story = applyPolicy(raw);
    const scene =
      story.includes('foreground') || story.includes('main character')
        ? story
        : `One exaggerated main character or focal object in the foreground: ${artifact.anchor?.object || 'the subject'}. ${story}`;
    const withPrimary = (scene.replace(/\.\s*$/, '') + '.' + primaryPhrase).trim();
    const minimalConstraint = ' Empty, minimal background—only what is listed in the scene; no extra environments, props, or text.';
    return stylePrefix + anthropomorphismLine + onlyDrawLead + withPrimary + layoutAndDistinct + minimalConstraint + suffix + SCOPE_SUFFIX;
  }
  // Fallback: minimal blueprint from anchor + symbol_map
  const useBlueprint = artifact.anchor && (artifact.symbol_map?.length ?? 0) > 0;
  if (useBlueprint) {
    const minimalStory = deriveMinimalSceneFromBlueprint(artifact);
    const sceneDescription = applyPolicy(minimalStory);
    return stylePrefix + anthropomorphismLine + sceneDescription + layoutAndDistinct + suffix + SCOPE_SUFFIX;
  }
  if (artifact.image_story?.trim()) {
    const raw = artifact.image_story.trim();
    const story = applyPolicy(raw);
    const scene =
      story.includes('foreground') || story.includes('main character')
        ? story
        : `One exaggerated main character or focal object in the foreground: ${artifact.anchor?.object || 'the subject'}. ${story}`;
    const withPrimary = (scene.replace(/\.\s*$/, '') + '.' + primaryPhrase).trim();
    return stylePrefix + anthropomorphismLine + withPrimary + layoutAndDistinct + suffix + SCOPE_SUFFIX;
  }
  const minimalStory = deriveMinimalSceneFromBlueprint(artifact);
  const sceneDescription = applyPolicy(minimalStory);
  return stylePrefix + anthropomorphismLine + sceneDescription + layoutAndDistinct + suffix + SCOPE_SUFFIX;
}

/**
 * Build DALL·E prompt using LLM to derive one scene sentence from blueprint (Phase 2.5).
 * Falls back to buildScenePrompt on failure or no API key.
 * @param {object} artifact - full mnemonic artifact
 * @returns {Promise<string>} Full prompt for DALL·E
 */
export async function buildScenePromptWithLLM(artifact) {
  if (!artifact) return '';
  const sentence = await llmSceneSentence(artifact);
  if (!sentence) return buildScenePrompt(artifact);
  const story = applyPolicy(sentence);
  const scene = story.includes('foreground') || story.includes('main character')
    ? story
    : `One exaggerated main character or focal object in the foreground: ${artifact.anchor?.object || 'the subject'}. ${story}`;
  const layoutLine = deriveLayoutLine(artifact);
  const distinctClause = deriveDistinctElementsClause(artifact);
  const layoutAndDistinct = (layoutLine && distinctClause) ? ` ${layoutLine} ${distinctClause}` : '';
  const anthropomorphismLine =
    isAnchorCharacterLike(artifact.anchor)
      ? ' The main character should be anthropomorphic: clear face, expression, and at least one distinctive costume or prop so it is memorable and recognizable. '
      : '';
  return STYLE_PREFIX + anthropomorphismLine + scene.replace(/\.\s*$/, '') + '.' + layoutAndDistinct + NO_TEXT_SUFFIX + SCOPE_SUFFIX;
}

/**
 * Single visual only (legacy / fallback).
 * @param {string} visualDescription - e.g. "a chef in a kitchen assembling ingredients"
 * @returns {string} Full prompt for DALL-E
 */
export function buildMnemonicImagePrompt(visualDescription) {
  if (!visualDescription?.trim()) return '';
  return STYLE_PREFIX + (visualDescription.trim() + '.') + NO_TEXT_SUFFIX;
}
