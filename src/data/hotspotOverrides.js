/**
 * Optional per-concept hotspot position overrides.
 * Keyed by concept_id only; value is array of { xPercent, yPercent } in order [anchor, symbol_0, symbol_1, …].
 * When length matches 1 + symbol_map.length, canonical artifact uses these instead of zone-based positions.
 * Content-agnostic: no concept names or domain in code; only IDs as keys.
 */

/** @type {Record<string, Array<{ xPercent: number, yPercent: number }>>} */
export const HOTSPOT_OVERRIDES = {
  // Example (uncomment and adjust for a concept that needs tuned positions):
  // 'cell-membrane': [
  //   { xPercent: 50, yPercent: 50 },   // anchor
  //   { xPercent: 22, yPercent: 35 },   // symbol 0
  //   { xPercent: 78, yPercent: 45 },  // symbol 1
  // ],
};

/**
 * Get override positions for a concept if available and length matches expected.
 * @param {string} conceptId - concept_id (e.g. from mnemonic.concept_id)
 * @param {number} expectedLength - 1 + symbol_map.length (anchor + symbols)
 * @returns {Array<{ xPercent: number, yPercent: number }> | null} Override array or null to use zone-based
 */
export function getHotspotOverrides(conceptId, expectedLength) {
  if (!conceptId || expectedLength == null || expectedLength < 1) return null;
  const override = HOTSPOT_OVERRIDES[conceptId];
  if (!Array.isArray(override) || override.length !== expectedLength) return null;
  const valid = override.every(
    (p) =>
      typeof p?.xPercent === 'number' &&
      typeof p?.yPercent === 'number' &&
      p.xPercent >= 0 &&
      p.xPercent <= 100 &&
      p.yPercent >= 0 &&
      p.yPercent <= 100
  );
  return valid ? override : null;
}
