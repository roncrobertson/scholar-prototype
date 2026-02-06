/**
 * Derive hotspot (x, y) percentages from symbol_map zones for SVG overlay.
 * Spatial grammar: left = cause/class, right = effects, foreground = mechanism, background = associations.
 * No LLM coordinates yet—positions are deterministic from zone + index.
 */

import { attributeToSymbol } from '../data/visualGrammar';

const ZONE_X = {
  left: 18,
  right: 82,
  foreground: 50,
  background: 50,
  center: 50,
};

/**
 * When multiple slots share the same zone (e.g. all "foreground" -> x=50), spread them horizontally
 * so hotspots don't stack in a vertical line down the center.
 * @param {number} sameX - the x value they would all get (e.g. 50)
 * @param {number} index - 0-based index among slots with this x
 * @param {number} total - total slots with this x
 * @returns {number} xPercent to use
 */
function spreadSameZoneX(sameX, index, total) {
  if (total <= 1) return sameX;
  const spread = 24;
  const step = total > 1 ? (spread * 2) / (total - 1) : 0;
  const offset = -spread + index * step;
  return Math.round(Math.max(5, Math.min(95, sameX + offset)));
}

/**
 * @param {Array<{ zone: string }>} symbolMap - from artifact.symbol_map (each has zone)
 * @returns {Array<{ xPercent: number, yPercent: number }>} same length as symbolMap
 */
export function getHotspotPositions(symbolMap) {
  if (!symbolMap?.length) return [];
  const n = symbolMap.length;
  const raw = symbolMap.map((slot, i) => {
    const x = ZONE_X[slot.zone] ?? 50;
    const y = 22 + (i / Math.max(1, n - 1)) * 56;
    return { xPercent: x, yPercent: y };
  });
  // Spread slots that share the same x (e.g. all foreground -> 50) so they don't stack vertically
  const byX = Object.create(null);
  raw.forEach((p, i) => {
    const k = String(p.xPercent);
    if (!byX[k]) byX[k] = [];
    byX[k].push({ i, ...p });
  });
  return raw.map((p, i) => {
    const k = String(p.xPercent);
    const group = byX[k];
    if (group.length <= 1) return p;
    const idxInGroup = group.findIndex((g) => g.i === i);
    const newX = spreadSameZoneX(p.xPercent, idxInGroup, group.length);
    return { xPercent: newX, yPercent: p.yPercent };
  });
}

/**
 * Positions for anchor (center) + symbol_map hotspots. First position is center (50, 50); rest follow getHotspotPositions(symbolMap).
 * @param {Array<{ zone: string }>} symbolMap - from artifact.symbol_map
 * @returns {Array<{ xPercent: number, yPercent: number }>} length 1 + symbolMap.length
 */
export function getHotspotPositionsWithAnchor(symbolMap) {
  const symbolPositions = getHotspotPositions(symbolMap || []);
  return [{ xPercent: 50, yPercent: 50 }, ...symbolPositions];
}

/**
 * Build full hotspot list for MnemonicCanvas: symbol_map + positions + label/fact.
 * @param {object} artifact - { symbol_map, anchor }
 * @returns {Array<{ id: string, label: string, mnemonicLogic: string, xPercent: number, yPercent: number }>}
 */
export function buildHotspots(artifact) {
  if (!artifact?.symbol_map?.length) return [];
  const positions = getHotspotPositions(artifact.symbol_map);
  return artifact.symbol_map.map((slot, i) => {
    const symbolPart = slot.symbol?.split('|')[0]?.trim() || '';
    const defaultSymbol = attributeToSymbol(slot.attribute_type, slot.value);
    const isDefaultGrammar = symbolPart && symbolPart === defaultSymbol;
    const mnemonicLogic = isDefaultGrammar ? '' : (symbolPart || slot.attribute_type || '');
    return {
      id: `hotspot-${i}`,
      label: slot.value,
      mnemonicLogic,
      xPercent: positions[i]?.xPercent ?? 50,
      yPercent: positions[i]?.yPercent ?? 50,
    };
  });
}
