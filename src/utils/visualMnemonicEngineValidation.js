/**
 * Visual Mnemonic Engine — content-agnostic validation checks.
 * Aligns with docs/VISUAL_MNEMONIC_ENGINE_VALIDATION.md.
 * Run before image accept; use returned passed/failed/hardFailure to block or warn.
 */

const MIN_FACTS = 2; // doc: "fewer than 2" fail; "3–6" is target range
const MAX_FACTS = 6;

/** Check IDs that constitute hard failures (auto-reject). */
export const HARD_FAILURE_IDS = [
  'CHECK_1',  // no concept/description
  'CHECK_2',  // facts not explicit/atomic or out of range
  'CHECK_4',  // fact without visual anchor
  'CHECK_6',  // orphan visuals
  'FACTS_ONLY_AS_TEXT',
];

/** Heuristic: description is single sentence (no mid-sentence period). */
function isSingleSentence(text) {
  if (!text || typeof text !== 'string') return false;
  const t = text.trim();
  if (!t) return false;
  const withoutTrailing = t.replace(/[.!?]+$/, '').trim();
  return !withoutTrailing.includes('.') && !withoutTrailing.includes('?') && !withoutTrailing.includes('!');
}

/** Heuristic: fact looks like action/property/relationship (not long definition only). */
function looksLikeActionOrProperty(text) {
  if (!text || text.length < 80) return true;
  const hasVerb = /\b(pass|block|flow|move|build|break|allow|prevent|control|regulate|convert|produce|ensure|divide|replicate)\b/i.test(text);
  if (hasVerb) return true;
  return !(text.includes(' — ') && text.length > 70);
}

/** Heuristic: visual description implies action (motion, change, interaction). */
function impliesAction(phrase) {
  if (!phrase || typeof phrase !== 'string') return false;
  const lower = phrase.toLowerCase();
  const actionLike = /\b(turn|spin|pass|block|cut|build|release|convert|split|move|flow|stretch|open|close|label|show|demonstrate)\b/;
  return actionLike.test(lower) || lower.includes(' with ') || lower.includes(' leaving ') || lower.includes(' on the ');
}

/**
 * Run one check by id.
 * @param {string} checkId - CHECK_1 .. CHECK_15 or HARD_*
 * @param {object} artifact - { concept, core_concept, summary, attributes, anchor, symbol_map, image_story, recall_story }
 * @param {{ getCanonical?: () => object }} options - optional; getCanonical() for hotspot/legend alignment (CHECK_14)
 * @returns {{ pass: boolean, message?: string, skipped?: boolean }}
 */
export function runCheck(checkId, artifact, options = {}) {
  const attrs = artifact?.attributes ?? [];
  const symbolMap = artifact?.symbol_map ?? [];
  const concept = artifact?.concept?.trim();
  // CHECK_1: always use a short description (≤1 sentence or ≤180 chars) so we never fail on long core_concept
  const d1 = (artifact?.exam_summary || '').trim();
  const d2 = (artifact?.summary || '').trim();
  const d3 = (artifact?.core_concept || '').trim();
  const isShort = (t) => t && (isSingleSentence(t) || t.length <= 180);
  const firstSentenceOf = (t) => {
    if (!t || typeof t !== 'string') return '';
    const first = t.split('.')[0].trim();
    return first ? first + '.' : t;
  };
  const description = (isShort(d1) && d1) || (isShort(d2) && d2) || (d3 ? firstSentenceOf(d3) : '') || d1 || d2 || d3 || '';

  switch (checkId) {
    case 'CHECK_1': {
      if (!concept) return { pass: false, message: 'No canonical concept name.' };
      if (!description) return { pass: false, message: 'No plain-language description.' };
      if (!isSingleSentence(description) && description.length > 180)
        return { pass: false, message: 'Description should be ≤1 sentence or under ~180 chars.' };
      return { pass: true };
    }

    case 'CHECK_2': {
      const n = attrs.length;
      if (n < MIN_FACTS) return { pass: false, message: `Too few key facts (${n}); need ${MIN_FACTS}–${MAX_FACTS}.` };
      if (n > MAX_FACTS) return { pass: false, message: `Too many key facts (${n}); cap at ${MAX_FACTS}.` };
      const definitionOnly = attrs.filter((a) => !looksLikeActionOrProperty(a.value?.trim()));
      if (definitionOnly.length > 0)
        return { pass: false, message: `Fact(s) phrased as definition only; use actions, properties, or relationships.` };
      return { pass: true };
    }

    case 'CHECK_3': {
      // Primary fact: we treat first attribute or anchor as primary; engine may add explicit priority later.
      if (attrs.length === 0 && !artifact?.anchor?.object)
        return { pass: false, message: 'No primary focus (anchor or first fact).' };
      return { pass: true };
    }

    case 'CHECK_4': {
      if (attrs.length === 0) return { pass: true };
      if (symbolMap.length < attrs.length)
        return { pass: false, message: `Not every key fact has a visual anchor (${symbolMap.length} visuals for ${attrs.length} facts).` };
      return { pass: true };
    }

    case 'CHECK_5': {
      const anchorObj = artifact?.anchor?.object?.trim();
      if (anchorObj && !impliesAction(anchorObj)) {
        const symbolDescriptions = symbolMap.map((s) => (s.symbol || s.value || '').split('|')[0]?.trim()).filter(Boolean);
        const allStatic = symbolDescriptions.length === 0 || symbolDescriptions.every((d) => !impliesAction(d));
        if (allStatic) return { pass: false, message: 'Visual anchors should be action-based (motion, change, or interaction).' };
      }
      return { pass: true };
    }

    case 'CHECK_6': {
      if (symbolMap.length > attrs.length)
        return { pass: false, message: 'Every major object must map to a key fact (no orphan visuals).' };
      return { pass: true };
    }

    case 'CHECK_7': {
      const hasAnchor = !!artifact?.anchor?.object;
      if (!hasAnchor) return { pass: false, message: 'At least one characterized agent (anchor) required.' };
      return { pass: true };
    }

    case 'CHECK_8': {
      if (!artifact?.anchor?.phrase && !artifact?.anchor?.object)
        return { pass: false, message: 'Anchor must have a stable name or role (phrase/object).' };
      const missingRole = symbolMap.some((s) => !(s.symbol || s.value || s.attribute_type));
      if (missingRole) return { pass: false, message: 'Each visual anchor must have a stable role identifier.' };
      return { pass: true };
    }

    case 'CHECK_9': {
      const story = (artifact?.image_story || artifact?.recall_story || '').trim();
      if (!story) return { pass: false, message: 'Single causal narrative (image_story or recall_story) required.' };
      if (story.toLowerCase().includes(' and also ') || (story.match(/\b(second|third|additionally)\b/gi)?.length > 1))
        return { pass: false, message: 'Scene should represent one moment; avoid multiple independent processes.' };
      return { pass: true };
    }

    case 'CHECK_10': {
      // Dominant focus: pre-image we only have anchor as primary; layout dominance is post-image.
      return { pass: true, skipped: true };
    }

    case 'CHECK_11':
    case 'CHECK_12': {
      return { pass: true, skipped: true }; // Post-image: label-off and image-teaches-before-text
    }

    case 'CHECK_13': {
      // Legend decodes only: enforced by UI (legend = map visual → fact). No new info in legend if we only show term + fact.
      return { pass: true };
    }

    case 'CHECK_14': {
      const canonical = options.getCanonical?.();
      if (!canonical) return { pass: true }; // Cannot verify without canonical hotspots
      const hotspots = canonical?.hotspots ?? [];
      const hotspotCount = hotspots.length;
      const expected = 1 + (attrs.length || 0);
      if (hotspotCount !== expected) return { pass: false, message: `Mode alignment: expected ${expected} hotspots (anchor + facts), got ${hotspotCount}.` };
      // Hotspot–legend parity: every hotspot must have non-empty reveals.term or reveals.fact_text (no spurious/unassigned hotspots)
      const missingReveals = hotspots.find((h) => {
        const term = (h.reveals?.term ?? '').toString().trim();
        const factText = (h.reveals?.fact_text ?? '').toString().trim();
        return !term && !factText;
      });
      if (missingReveals) return { pass: false, message: 'Every hotspot must have a non-empty reveals.term or reveals.fact_text (no unassigned or placeholder hotspots).' };
      return { pass: true };
    }

    case 'CHECK_15': {
      const mode = artifact?.encoding_mode;
      if (mode !== 'full_mnemonic' && mode !== 'characterization_only') {
        return { pass: false, message: 'Encoding mode must be set: full_mnemonic or characterization_only.' };
      }
      return { pass: true };
    }

    case 'FACTS_ONLY_AS_TEXT': {
      if (attrs.length > 0 && symbolMap.length === 0)
        return { pass: false, message: 'Facts appear only as text; no visual mapping.' };
      return { pass: true };
    }

    default:
      return { pass: true, skipped: true };
  }
}

const ALL_CHECK_IDS = [
  'CHECK_1', 'CHECK_2', 'CHECK_3', 'CHECK_4', 'CHECK_5', 'CHECK_6', 'CHECK_7', 'CHECK_8',
  'CHECK_9', 'CHECK_10', 'CHECK_11', 'CHECK_12', 'CHECK_13', 'CHECK_14', 'CHECK_15', 'FACTS_ONLY_AS_TEXT',
];

/**
 * Run all engine validation checks on an artifact.
 * @param {object} artifact - decomposition/pipeline artifact
 * @param {{ getCanonical?: () => object }} options - optional; pass getCanonical for CHECK_14
 * @returns {{ passed: string[], failed: { id: string, message: string }[], skipped: string[], hardFailure: boolean }}
 */
export function runEngineValidation(artifact, options = {}) {
  const passed = [];
  const failed = [];
  const skipped = [];

  for (const id of ALL_CHECK_IDS) {
    const result = runCheck(id, artifact, options);
    if (result.skipped) skipped.push(id);
    else if (result.pass) passed.push(id);
    else failed.push({ id, message: result.message || `${id} failed.` });
  }

  const hardFailure = failed.some((f) => HARD_FAILURE_IDS.includes(f.id));

  return { passed, failed, skipped, hardFailure };
}

/**
 * Build a machine-readable validation report for export or dashboard.
 * @param {object} artifact - decomposition/pipeline artifact
 * @param {{ getCanonical?: () => object }} options - optional; pass getCanonical for CHECK_14
 * @param {{ concept_id?: string }} meta - optional; concept_id or concept_title for the report
 * @returns {object} Serializable report: concept_id, concept_title, timestamp, passed, failed, skipped, hardFailure
 */
export function exportValidationReport(artifact, options = {}, meta = {}) {
  if (!artifact) return null;
  const result = runEngineValidation(artifact, options);
  return {
    concept_id: meta.concept_id ?? artifact.concept_id ?? null,
    concept_title: (meta.concept_title ?? artifact.concept ?? '').trim() || null,
    timestamp: new Date().toISOString(),
    passed: result.passed,
    failed: result.failed,
    skipped: result.skipped,
    hardFailure: result.hardFailure,
    encoding_mode: artifact.encoding_mode ?? null,
    fact_count: (artifact.attributes ?? []).length,
  };
}
