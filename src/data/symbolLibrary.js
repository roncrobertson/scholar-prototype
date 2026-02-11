/**
 * Global symbol library — versioned metaphor dictionary.
 * Map abstract meanings to stable visual descriptions; use library first when building symbol_map.
 * Aligns with Master Document: consistency reduces extraneous load and supports transfer.
 * Mirrors visualGrammar.ATTRIBUTE_TO_SYMBOL keys so the same types get the same global_symbol_key.
 */

export const SYMBOL_LIBRARY_VERSION = '1.0';

/**
 * Value-level symbols: when fact value contains a key, use this visual.
 * Keys are lowercase; match against value.toLowerCase(). Longest match wins.
 */
const VALUE_SYMBOLS = {
  'gram-positive': { visual_description: 'purple bacteria', global_symbol_key: 'symbol_lib:gram_positive' },
  'gram negative': { visual_description: 'pink bacteria', global_symbol_key: 'symbol_lib:gram_negative' },
  'cell membrane': { visual_description: 'stretchy barrier or gate', global_symbol_key: 'symbol_lib:cell_membrane' },
  'cell wall': { visual_description: 'rigid wall or fence', global_symbol_key: 'symbol_lib:cell_wall' },
  'atp': { visual_description: 'energy coin or battery', global_symbol_key: 'symbol_lib:atp' },
  'mitochondria': { visual_description: 'power plant or furnace', global_symbol_key: 'symbol_lib:mitochondria' },
  'nucleus': { visual_description: 'control room or brain', global_symbol_key: 'symbol_lib:nucleus' },
  'ribosome': { visual_description: 'chef or factory line', global_symbol_key: 'symbol_lib:ribosome' },
  'enzyme': { visual_description: 'key fitting a lock', global_symbol_key: 'symbol_lib:enzyme' },
  'substrate': { visual_description: 'lock or slot', global_symbol_key: 'symbol_lib:substrate' },
  'inhibitor': { visual_description: 'blocking bar or stop sign', global_symbol_key: 'symbol_lib:inhibitor' },
  'receptor': { visual_description: 'doorbell or antenna', global_symbol_key: 'symbol_lib:receptor' },
  'antibiotic': { visual_description: 'weapon or key attacking bacteria', global_symbol_key: 'symbol_lib:antibiotic' },
  'penicillin': { visual_description: 'pencil or pen attacking bacteria', global_symbol_key: 'symbol_lib:penicillin' },
  'bacteria': { visual_description: 'small rounded figure', global_symbol_key: 'symbol_lib:bacteria' },
  'virus': { visual_description: 'tiny spiky invader', global_symbol_key: 'symbol_lib:virus' },
  'dna': { visual_description: 'twisted ladder or zipper', global_symbol_key: 'symbol_lib:dna' },
  'rna': { visual_description: 'single strand or messenger', global_symbol_key: 'symbol_lib:rna' },
  'photosynthesis': { visual_description: 'plant with sun and factory', global_symbol_key: 'symbol_lib:photosynthesis' },
  'respiration': { visual_description: 'breathing or burning fuel', global_symbol_key: 'symbol_lib:respiration' },
  'osmosis': { visual_description: 'water flowing toward salt', global_symbol_key: 'symbol_lib:osmosis' },
  'diffusion': { visual_description: 'particles spreading out', global_symbol_key: 'symbol_lib:diffusion' },
  'neurotransmitter': { visual_description: 'small package passed between neurons', global_symbol_key: 'symbol_lib:neurotransmitter' },
  'synapse': { visual_description: 'gap or handoff point', global_symbol_key: 'symbol_lib:synapse' },
  'neuron': { visual_description: 'tree-shaped cell with branches', global_symbol_key: 'symbol_lib:neuron' },
  'action potential': { visual_description: 'wave or signal traveling', global_symbol_key: 'symbol_lib:action_potential' },
  'supply': { visual_description: 'upward curve or pile', global_symbol_key: 'symbol_lib:supply' },
  'demand': { visual_description: 'downward curve or crowd', global_symbol_key: 'symbol_lib:demand' },
  'equilibrium': { visual_description: 'balance scale or crossing lines', global_symbol_key: 'symbol_lib:equilibrium' },
  'selective permeability': { visual_description: 'tiny figures passing through stretchy door; large figure blocked', global_symbol_key: 'symbol_lib:selective_permeability' },
  'phospholipid bilayer': { visual_description: 'double layer wall or stretchy barrier', global_symbol_key: 'symbol_lib:phospholipid_bilayer' },
  'size-dependent': { visual_description: 'small key passing; large padlock blocked', global_symbol_key: 'symbol_lib:size_dependent' },
};

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
 * Look up symbol by type and value; value-level match overrides type-level.
 * Keys in VALUE_SYMBOLS are matched against value (longest match wins).
 * @param {string} factType - e.g. "mechanism", "spectrum"
 * @param {string} value - Fact text or value; checked for value-level keys
 * @returns {{ visual_description: string, global_symbol_key: string } | null}
 */
export function getSymbolForAttribute(factType, value) {
  if (!value || typeof value !== 'string') return getSymbolFromLibrary(factType);
  const valLower = value.toLowerCase().trim();
  // Longest matching key first (e.g. "gram-positive" before "gram")
  const valueKeys = Object.keys(VALUE_SYMBOLS).sort((a, b) => b.length - a.length);
  for (const key of valueKeys) {
    if (valLower.includes(key)) {
      return VALUE_SYMBOLS[key];
    }
  }
  return getSymbolFromLibrary(factType);
}

/**
 * Enrich existing symbol_map entries with global_symbol_key when the library has a match.
 * Uses value-level lookup when value is present.
 * Non-destructive: returns new array with added global_symbol_key on each slot.
 * @param {Array<{ attribute_type: string, value: string, symbol: string, zone: string }>} symbolMap
 * @returns {Array<{ attribute_type: string, value: string, symbol: string, zone: string, global_symbol_key?: string }>}
 */
export function enrichSymbolMapWithLibrary(symbolMap) {
  if (!symbolMap?.length) return [];
  return symbolMap.map((slot) => {
    const entry = getSymbolForAttribute(slot.attribute_type, slot.value);
    if (entry) {
      return { ...slot, global_symbol_key: entry.global_symbol_key };
    }
    return { ...slot };
  });
}
