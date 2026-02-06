/**
 * Visual Mnemonic Grammar — Attribute type → symbol class (deterministic).
 * Same attribute types always map to same symbol class. No decorative elements.
 * Used by: Attribute → Symbol Mapper.
 * Library-first: when symbolLibrary has a match for the attribute type, use its visual_description.
 */

import { getSymbolFromLibrary } from './symbolLibrary';

const ATTRIBUTE_TO_SYMBOL = {
  // Mechanism / process
  mechanism: 'action (cutting, blocking, tying, building)',
  inhibition: 'chains | lock | stop sign',
  synthesis: 'assembly line | chef cooking | building',
  breakdown: 'cracking | demolition | leak',

  // Location / structure
  location: 'where object is placed (zone)',
  class: 'broken ring | badge | uniform',
  structure: 'wall | door | gate',

  // Direction / change
  increase: 'growing | inflating | fire',
  decrease: 'shrinking | leaking | deflating',

  // Effects
  side_effect: 'damage to main character | rash | spill',
  effect: 'result visible on anchor or scene',
  spectrum: 'purple bacteria | colored zone',

  // Resistance / exception
  resistance: 'shield | armor | enzyme cutting key',
  exception: 'background | small label',

  // Entity types
  enzyme: 'character holding tool',
  receptor: 'doorbell | mailbox | antenna',
};

const ZONE_LABELS = {
  center: 'Main character (phonetic anchor)',
  foreground: 'Mechanism / action',
  left: 'Cause / class',
  right: 'Effects / side effects',
  background: 'Associations / exceptions',
};

/**
 * Map an attribute to a visual symbol (deterministic).
 * @param {string} attributeType - e.g. "mechanism", "side_effect"
 * @param {string} value - optional; can refine symbol
 * @returns {string} symbol phrase for the visual
 */
export function attributeToSymbol(attributeType, value = '') {
  const key = (attributeType || '').toLowerCase().replace(/\s+/g, '_');
  const base = ATTRIBUTE_TO_SYMBOL[key] || ATTRIBUTE_TO_SYMBOL.mechanism;
  return base;
}

/**
 * Get zone label for layout (memory palace).
 */
export function getZoneLabel(zone) {
  return ZONE_LABELS[zone] || zone;
}

/** Memory-palace zone order by attribute type (Sketchy-style). */
const DEFAULT_ZONE_BY_TYPE = {
  class: 'left',
  structure: 'left',
  mechanism: 'foreground',
  synthesis: 'foreground',
  breakdown: 'foreground',
  inhibition: 'foreground',
  effect: 'right',
  side_effect: 'right',
  spectrum: 'right',
  increase: 'right',
  decrease: 'right',
  resistance: 'background',
  exception: 'background',
  location: 'background',
  receptor: 'foreground',
};

/**
 * Build symbol_map from decomposition attributes using the grammar.
 * Supports optional per-fact visual_mnemonic (character/anchor name for the image).
 * @param {Array<{type: string, value: string, visual_mnemonic?: string}>} attributes
 * @param {Object} zoneOrder - optional override: [type] -> zone
 * @returns {Array<{attribute_type, value, symbol, zone}>}
 */
export function buildSymbolMap(attributes, zoneOrder = {}) {
  const defaultZones = ['left', 'foreground', 'right', 'background'];
  let zoneIndex = 0;
  return (attributes || []).map((attr) => {
    const zone =
      zoneOrder[attr.type] ?? DEFAULT_ZONE_BY_TYPE[attr.type] ?? defaultZones[zoneIndex % defaultZones.length];
    zoneIndex += 1;
    const customVisual = (attr.visual_mnemonic || '').trim();
    // Library first: use global symbol library when available (Master Doc: consistency, transfer)
    const lib = getSymbolFromLibrary(attr.type);
    const symbolFromLibrary = lib?.visual_description ?? null;
    const symbol = customVisual || symbolFromLibrary || attributeToSymbol(attr.type, attr.value);
    return {
      attribute_type: attr.type,
      value: attr.value,
      symbol,
      zone,
      ...(lib?.global_symbol_key ? { global_symbol_key: lib.global_symbol_key } : {}),
    };
  });
}

export { ATTRIBUTE_TO_SYMBOL, ZONE_LABELS };
