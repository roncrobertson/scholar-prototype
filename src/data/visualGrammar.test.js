/**
 * Visual grammar tests — buildSymbolMap uses visual_mnemonic when present, else default.
 */
import { describe, it, expect } from 'vitest';
import { buildSymbolMap, attributeToSymbol } from './visualGrammar.js';

describe('buildSymbolMap', () => {
  it('returns one slot per attribute with zone and symbol', () => {
    const attributes = [
      { type: 'mechanism', value: 'G1, S, G2, M; checkpoints' },
      { type: 'effect', value: 'ordered growth and division' },
    ];
    const map = buildSymbolMap(attributes);
    expect(map.length).toBe(2);
    expect(map[0]).toMatchObject({ attribute_type: 'mechanism', value: attributes[0].value });
    expect(map[1]).toMatchObject({ attribute_type: 'effect', value: attributes[1].value });
    expect(map[0].zone).toBeDefined();
    expect(map[0].symbol).toBeDefined();
  });

  it('uses visual_mnemonic when present instead of default grammar', () => {
    const custom = 'Spokes labeled G1, S, G2, M; checkpoint signs';
    const attributes = [
      { type: 'mechanism', value: 'G1, S, G2, M; checkpoints', visual_mnemonic: custom },
    ];
    const map = buildSymbolMap(attributes);
    expect(map[0].symbol).toBe(custom);
    expect(map[0].symbol).not.toBe(attributeToSymbol('mechanism', attributes[0].value));
  });

  it('uses default symbol when visual_mnemonic is empty', () => {
    const attributes = [
      { type: 'mechanism', value: 'some mechanism', visual_mnemonic: '' },
    ];
    const map = buildSymbolMap(attributes);
    const defaultSymbol = attributeToSymbol('mechanism', 'some mechanism');
    expect(map[0].symbol).toBe(defaultSymbol);
  });
});
