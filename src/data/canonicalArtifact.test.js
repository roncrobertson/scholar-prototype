/**
 * Canonical artifact tests — toCanonicalArtifact and getDisplayHotspots.
 */
import { describe, it, expect } from 'vitest';
import { toCanonicalArtifact, getDisplayHotspots } from './canonicalArtifact.js';

const mnemonic = { concept_id: 'cell-cycle', title: 'Cell Cycle' };
const artifact = {
  concept: 'Cell Cycle',
  domain: 'biology',
  attributes: [
    { type: 'mechanism', value: 'G1, S, G2, M; checkpoints', visual_mnemonic: 'Spokes labeled G1, S, G2, M' },
    { type: 'effect', value: 'ordered growth and division', visual_mnemonic: 'Wheel turning one rotation' },
  ],
  anchor: { phrase: 'Cell cycle', object: 'a bicycle wheel with G1, S, G2, M on the spokes' },
  symbol_map: [
    { attribute_type: 'mechanism', value: 'G1, S, G2, M; checkpoints', symbol: 'Spokes labeled G1, S, G2, M', zone: 'left' },
    { attribute_type: 'effect', value: 'ordered growth and division', symbol: 'Wheel turning one rotation', zone: 'foreground' },
  ],
};

describe('toCanonicalArtifact', () => {
  it('produces concept_id, concept_title, facts, anchors, hotspots', () => {
    const canon = toCanonicalArtifact(mnemonic, artifact);
    expect(canon).not.toBeNull();
    expect(canon.concept_id).toBe('cell-cycle');
    expect(canon.concept_title).toBe('Cell Cycle');
    expect(canon.facts.length).toBe(2);
    expect(canon.anchors.length).toBe(1);
    expect(canon.hotspots.length).toBe(3); // 1 anchor + 2 facts
  });

  it('hotspots have reveals.term, reveals.fact_text, reveals.mnemonic_phrase where custom', () => {
    const canon = toCanonicalArtifact(mnemonic, artifact);
    const anchorHotspot = canon.hotspots.find((h) => h.hotspot_id === 'hotspot-anchor');
    expect(anchorHotspot.reveals.term).toBe('Cell Cycle');
    expect(anchorHotspot.reveals.fact_text).toBe(artifact.anchor.object);
    const factHotspot = canon.hotspots.find((h) => h.hotspot_id === 'hotspot-0');
    expect(factHotspot.reveals.mnemonic_phrase).toBe('Spokes labeled G1, S, G2, M');
    expect(factHotspot.reveals.fact_text).toBe(artifact.attributes[0].value);
  });
});

describe('getDisplayHotspots', () => {
  it('returns one entry per canonical hotspot with id, label, mnemonicLogic, xPercent, yPercent', () => {
    const canon = toCanonicalArtifact(mnemonic, artifact);
    const display = getDisplayHotspots(canon);
    expect(display.length).toBe(3);
    display.forEach((h) => {
      expect(h.id).toBeDefined();
      expect(h.label).toBeDefined();
      expect(typeof h.xPercent).toBe('number');
      expect(typeof h.yPercent).toBe('number');
    });
  });

  it('mnemonicLogic is set for anchor and for facts with custom symbol', () => {
    const canon = toCanonicalArtifact(mnemonic, artifact);
    const display = getDisplayHotspots(canon);
    const anchor = display.find((h) => h.id === 'hotspot-anchor');
    expect(anchor.mnemonicLogic).toBe(artifact.anchor.phrase);
    const fact0 = display.find((h) => h.id === 'hotspot-0');
    expect(fact0.mnemonicLogic).toBe('Spokes labeled G1, S, G2, M');
  });

  it('overrides xPercent/yPercent when resolvedPositions provided and length matches', () => {
    const canon = toCanonicalArtifact(mnemonic, artifact);
    const resolved = [
      { xPercent: 48, yPercent: 52 },
      { xPercent: 20, yPercent: 35 },
      { xPercent: 80, yPercent: 45 },
    ];
    const display = getDisplayHotspots(canon, resolved);
    expect(display[0].xPercent).toBe(48);
    expect(display[0].yPercent).toBe(52);
    expect(display[1].xPercent).toBe(20);
    expect(display[2].xPercent).toBe(80);
  });
});
