/**
 * Canonical mnemonic artifact schema and adapter.
 * Aligns with Master Document: facts = source-of-truth; visuals = encodings; hotspots = explicit map.
 * One contract for encoding, retrieval, quiz prompts, and validation.
 */

import { getHotspotPositions, getHotspotPositionsWithAnchor } from '../utils/hotspotPositions';
import { getHotspotOverrides } from './hotspotOverrides';
import { SYMBOL_LIBRARY_VERSION } from './symbolLibrary';
import { attributeToSymbol } from './visualGrammar';

export const SCHEMA_VERSION = '1.0';

/**
 * Build canonical facts from decomposition attributes.
 * One fact can be priority 'primary'; rest are 'high' (or 'secondary').
 * @param {Array<{ type: string, value: string, priority?: string }>} attributes
 * @returns {Array<{ fact_id: string, fact_text: string, priority: string, fact_type: string }>}
 */
function factsFromAttributes(attributes) {
  if (!attributes?.length) return [];
  const hasExplicitPrimary = attributes.some((a) => a.priority === 'primary');
  return attributes.map((attr, i) => ({
    fact_id: `fact-${i}`,
    fact_text: attr.value,
    priority: attr.priority === 'primary' ? 'primary' : hasExplicitPrimary ? 'high' : i === 0 ? 'primary' : 'high',
    fact_type: attr.type || 'definition',
  }));
}

/**
 * Build canonical anchors array from current anchor (single primary anchor).
 * Optional scores (phonetic, concreteness, distinctiveness, familiarity) for future ranking/audit.
 * @param {object} anchor - { phrase, object, scores?: { phonetic?, concreteness?, distinctiveness?, familiarity? } }
 * @param {string} conceptTitle
 * @returns {Array<{ anchor_id: string, target_term: string, mnemonic_phrase: string, strategy: string, visual_description: string, scores?: object }>}
 */
function anchorsFromAnchor(anchor, conceptTitle) {
  if (!anchor?.object) return [];
  const entry = {
    anchor_id: 'anchor-0',
    target_term: conceptTitle,
    mnemonic_phrase: anchor.phrase || conceptTitle,
    strategy: 'phonetic',
    visual_description: anchor.object,
  };
  if (anchor.scores && typeof anchor.scores === 'object') {
    entry.scores = anchor.scores;
  }
  return [entry];
}

/**
 * Build canonical symbol_map with symbol_id, encodes_fact_id, and optional global_symbol_key.
 * @param {Array<{ attribute_type: string, value: string, symbol: string, zone: string, global_symbol_key?: string }>} symbolMap
 * @param {Array<{ fact_id: string }>} facts
 * @returns {Array<{ symbol_id: string, encodes_fact_id: string, visual_description: string, encoding_channels: string[], zone: string, global_symbol_key?: string }>}
 */
function symbolMapCanonical(symbolMap, facts) {
  if (!symbolMap?.length) return [];
  return symbolMap.map((slot, i) => ({
    symbol_id: `symbol-${i}`,
    encodes_fact_id: facts[i]?.fact_id ?? `fact-${i}`,
    visual_description: slot.symbol?.split('|')[0]?.trim() || slot.value || slot.attribute_type,
    encoding_channels: ['object', 'position'],
    zone: slot.zone || 'foreground',
    ...(slot.global_symbol_key ? { global_symbol_key: slot.global_symbol_key } : {}),
  }));
}

/**
 * Build scene_blueprint with zones as symbol_ids and traversal_order.
 * @param {object} artifact - current artifact with symbol_map, scene_setting, image_story
 * @param {Array<{ symbol_id: string, zone: string }>} symbolMapCanon
 * @returns {{ locus: string, zones: object, micro_story: string, traversal_order: string[] }}
 */
function sceneBlueprintFromArtifact(artifact, symbolMapCanon) {
  const zones = { center: [], foreground: [], left: [], right: [], background: [] };
  symbolMapCanon.forEach((s) => {
    const z = s.zone in zones ? s.zone : 'foreground';
    if (!zones[z].includes(s.symbol_id)) zones[z].push(s.symbol_id);
  });
  // Anchor is always "center" conceptually; we don't have a symbol_id for it in symbol_map (anchor is separate)
  const traversal_order = symbolMapCanon.map((s) => s.symbol_id);
  return {
    locus: artifact.scene_setting || 'a single memorable scene',
    zones,
    micro_story: artifact.image_story || artifact.narrative || '',
    traversal_order,
  };
}

/**
 * Build canonical hotspots with reveals (term, mnemonic_phrase, fact_text) and coordinates.
 * First hotspot is the anchor (main character); then one per symbol_map entry. Legend–hotspot parity.
 * @param {object} artifact - current artifact (symbol_map, anchor, concept)
 * @param {Array<{ symbol_id: string, encodes_fact_id: string, visual_description: string }>} symbolMapCanon
 * @param {Array<{ fact_id: string, fact_text: string }>} facts
 * @param {string} conceptTitle - for anchor hotspot reveals
 * @param {string} [conceptId] - optional concept_id for per-concept position overrides
 * @returns {Array<{ hotspot_id: string, symbol_id: string, shape: string, xPercent: number, yPercent: number, reveals: { term: string, mnemonic_phrase: string, fact_text: string } }>}
 */
function hotspotsCanonical(artifact, symbolMapCanon, facts, conceptTitle, conceptId) {
  const symbolMap = artifact?.symbol_map || [];
  const expectedLength = 1 + symbolMap.length;
  const overrides = getHotspotOverrides(conceptId ?? '', expectedLength);
  const positions = overrides ?? getHotspotPositionsWithAnchor(symbolMap);
  const factById = Object.fromEntries((facts || []).map((f) => [f.fact_id, f]));
  const hotspots = [];

  // Anchor as first hotspot (legend–hotspot parity)
  if (artifact?.anchor?.object) {
    hotspots.push({
      hotspot_id: 'hotspot-anchor',
      symbol_id: 'anchor-0',
      shape: 'circle',
      xPercent: positions[0]?.xPercent ?? 50,
      yPercent: positions[0]?.yPercent ?? 50,
      reveals: {
        term: conceptTitle || artifact.concept || 'Concept',
        mnemonic_phrase: artifact.anchor.phrase || '',
        fact_text: artifact.anchor.object || '',
      },
    });
  }

  // Symbol_map hotspots
  symbolMap.forEach((slot, i) => {
    const sym = symbolMapCanon[i];
    const fact = sym ? factById[sym.encodes_fact_id] : null;
    const term = humanizeAttributeType(slot.attribute_type);
    const symbolPart = slot.symbol?.split('|')[0]?.trim() || '';
    const defaultSymbol = attributeToSymbol(slot.attribute_type, slot.value);
    const mnemonic_phrase = symbolPart && symbolPart !== defaultSymbol ? symbolPart : '';
    hotspots.push({
      hotspot_id: `hotspot-${i}`,
      symbol_id: sym?.symbol_id ?? `symbol-${i}`,
      shape: 'circle',
      xPercent: positions[i + 1]?.xPercent ?? 50,
      yPercent: positions[i + 1]?.yPercent ?? 50,
      reveals: {
        term,
        mnemonic_phrase,
        fact_text: fact?.fact_text ?? slot.value ?? '',
      },
    });
  });

  return hotspots;
}

function humanizeAttributeType(type) {
  if (!type || typeof type !== 'string') return 'Key term';
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Build 2–4 quiz prompts from hotspots for retrieval practice.
 * Prompts avoid giving away the answer; student retrieves from the image/legend.
 * @param {Array<{ hotspot_id: string, reveals: { term, mnemonic_phrase, fact_text } }>} hotspotsList
 * @returns {Array<{ prompt: string, hotspot_id: string, expected_term?: string, expected_fact?: string }>}
 */
function buildQuizPromptsFromHotspots(hotspotsList) {
  if (!hotspotsList?.length) return [];
  return hotspotsList.slice(0, 4).map((h, i) => {
    const term = h.reveals?.term || '';
    const factText = (h.reveals?.fact_text || '').trim();
    const snippet = factText.length > 50 ? factText.slice(0, 50) + '…' : factText;
    const prompt = snippet
      ? `Which part of the image encodes this? "${snippet}"`
      : term
        ? `What concept or term does hotspot ${i + 1} represent?`
        : `What does element ${i + 1} on the image represent?`;
    return {
      prompt,
      hotspot_id: h.hotspot_id,
      expected_term: term || undefined,
      expected_fact: factText || undefined,
    };
  });
}

/**
 * Convert current pipeline artifact to canonical schema.
 * @param {object} mnemonic - picmonic entry with concept_id, title
 * @param {object} artifact - from getMnemonicArtifact (concept, domain, anchor, symbol_map, attributes, scene_setting, image_story, narrative, ...)
 * @returns {object} Canonical artifact: concept_id, concept_title, domain, facts, anchors, symbol_map, scene_blueprint, hotspots, study_modes, versioning
 */
export function toCanonicalArtifact(mnemonic, artifact) {
  if (!artifact) return null;
  const concept_id = mnemonic?.concept_id ?? 'unknown';
  const concept_title = artifact.concept || mnemonic?.title || '';
  const domain = artifact.domain || 'general';

  const facts = factsFromAttributes(artifact.attributes);
  const anchors = anchorsFromAnchor(artifact.anchor, concept_title);
  const symbol_map = symbolMapCanonical(artifact.symbol_map, facts);
  const scene_blueprint = sceneBlueprintFromArtifact(artifact, symbol_map);
  const hotspots = hotspotsCanonical(artifact, symbol_map, facts, concept_title, concept_id);

  return {
    concept_id,
    concept_title,
    domain,
    source_text: artifact.source_text ?? null,
    facts,
    anchors,
    symbol_map,
    scene_blueprint,
    render: {
      mode: 'image-gen',
      image_prompt: null,
      output_image_uri: null,
    },
    hotspots,
    study_modes: {
      learning_mode: { labels_default: true },
      recall_mode: { labels_default: false },
      quiz_prompts: buildQuizPromptsFromHotspots(hotspots),
    },
    versioning: {
      schema_version: SCHEMA_VERSION,
      symbol_library_version: SYMBOL_LIBRARY_VERSION,
      created_at: artifact.created_at ?? new Date().toISOString(),
    },
  };
}

/**
 * Get display hotspot list for MnemonicCanvas from canonical artifact.
 * Maps canonical hotspots (with reveals) to { id, label, mnemonicLogic, term, xPercent, yPercent }.
 * Order matches traversal_order for legend–hotspot parity.
 * When resolvedPositions is provided and length matches, overrides xPercent/yPercent (e.g. from vision-based placement).
 * @param {object} canonical - from toCanonicalArtifact
 * @param {Array<{ xPercent: number, yPercent: number }>} [resolvedPositions] - optional vision-derived positions in same order
 * @returns {Array<{ id: string, label: string, mnemonicLogic: string, term: string, xPercent: number, yPercent: number }>}
 */
export function getDisplayHotspots(canonical, resolvedPositions) {
  if (!canonical?.hotspots?.length) return [];
  const useResolved =
    Array.isArray(resolvedPositions) &&
    resolvedPositions.length === canonical.hotspots.length &&
    resolvedPositions.every(
      (p) => typeof p?.xPercent === 'number' && typeof p?.yPercent === 'number'
    );
  return canonical.hotspots.map((h, i) => ({
    id: h.hotspot_id,
    label: h.reveals?.fact_text || h.reveals?.term || '',
    mnemonicLogic: h.reveals?.mnemonic_phrase || '',
    term: h.reveals?.term || '',
    xPercent: useResolved ? resolvedPositions[i].xPercent : (h.xPercent ?? 50),
    yPercent: useResolved ? resolvedPositions[i].yPercent : (h.yPercent ?? 50),
  }));
}
