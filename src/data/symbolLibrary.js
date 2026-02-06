/**
 * Global symbol library — versioned metaphor dictionary.
 * Map abstract meanings to stable visual descriptions; use library first when building symbol_map.
 * Aligns with Master Document: consistency reduces extraneous load and supports transfer.
 * Mirrors visualGrammar.ATTRIBUTE_TO_SYMBOL keys so the same types get the same global_symbol_key.
 */

export const SYMBOL_LIBRARY_VERSION = '1.0';

/**
 * Library: meaning key -> { visual_description, global_symbol_key }.
 * Primary visual_description is the first option when multiple are given (e.g. "chains" from "chains | lock | stop sign").
 */
const LIBRARY = {
  mechanism: { visual_description: 'action (cutting, blocking, tying, building)', global_symbol_key: 'symbol_lib:mechanism' },
  inhibition: { visual_description: 'chains, lock, or stop sign', global_symbol_key: 'symbol_lib:inhibition' },
  synthesis: { visual_description: 'assembly line, chef cooking, or building', global_symbol_key: 'symbol_lib:synthesis' },
  breakdown: { visual_description: 'cracking, demolition, or leak', global_symbol_key: 'symbol_lib:breakdown' },
  location: { visual_description: 'where object is placed (zone)', global_symbol_key: 'symbol_lib:location' },
  class: { visual_description: 'broken ring, badge, or uniform', global_symbol_key: 'symbol_lib:class' },
  structure: { visual_description: 'wall, door, or gate', global_symbol_key: 'symbol_lib:structure' },
  increase: { visual_description: 'growing, inflating, or fire', global_symbol_key: 'symbol_lib:increase' },
  decrease: { visual_description: 'shrinking, leaking, or deflating', global_symbol_key: 'symbol_lib:decrease' },
  side_effect: { visual_description: 'damage to main character, rash, or spill', global_symbol_key: 'symbol_lib:side_effect' },
  effect: { visual_description: 'result visible on anchor or scene', global_symbol_key: 'symbol_lib:effect' },
  spectrum: { visual_description: 'purple bacteria or colored zone', global_symbol_key: 'symbol_lib:spectrum' },
  resistance: { visual_description: 'shield, armor, or enzyme cutting key', global_symbol_key: 'symbol_lib:resistance' },
  exception: { visual_description: 'background or small label', global_symbol_key: 'symbol_lib:exception' },
  enzyme: { visual_description: 'character holding tool', global_symbol_key: 'symbol_lib:enzyme' },
  receptor: { visual_description: 'doorbell, mailbox, or antenna', global_symbol_key: 'symbol_lib:receptor' },
};

/**
 * Look up a stable visual for a fact type (attribute type).
 * @param {string} factType - e.g. "mechanism", "side_effect", "inhibition"
 * @returns {{ visual_description: string, global_symbol_key: string } | null}
 */
export function getSymbolFromLibrary(factType) {
  if (!factType || typeof factType !== 'string') return null;
  const key = factType.toLowerCase().replace(/\s+/g, '_');
  return LIBRARY[key] || null;
}

/**
 * Enrich existing symbol_map entries with global_symbol_key when the library has a match.
 * Non-destructive: returns new array with added global_symbol_key on each slot.
 * @param {Array<{ attribute_type: string, value: string, symbol: string, zone: string }>} symbolMap
 * @returns {Array<{ attribute_type: string, value: string, symbol: string, zone: string, global_symbol_key?: string }>}
 */
export function enrichSymbolMapWithLibrary(symbolMap) {
  if (!symbolMap?.length) return [];
  return symbolMap.map((slot) => {
    const entry = getSymbolFromLibrary(slot.attribute_type);
    if (entry) {
      return { ...slot, global_symbol_key: entry.global_symbol_key };
    }
    return { ...slot };
  });
}
