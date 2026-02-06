/**
 * Engine validation tests — content-agnostic checks (see docs/VISUAL_MNEMONIC_ENGINE_VALIDATION.md).
 */
import { describe, it, expect } from 'vitest';
import { runEngineValidation, runCheck, HARD_FAILURE_IDS } from './visualMnemonicEngineValidation.js';

const validArtifact = {
  concept: 'Cell Cycle',
  core_concept: 'The cell cycle is the ordered sequence of events from one cell division to the next.',
  summary: 'G1 → S → G2 → M. Checkpoints.',
  attributes: [
    { type: 'mechanism', value: 'G1, S, G2, M; checkpoints', visual_mnemonic: 'Spokes labeled G1, S, G2, M' },
    { type: 'effect', value: 'ordered growth and division', visual_mnemonic: 'Wheel turning one rotation' },
  ],
  anchor: { phrase: 'Cell cycle', object: 'a bicycle wheel with G1, S, G2, M on the spokes' },
  symbol_map: [
    { attribute_type: 'mechanism', value: 'G1, S, G2, M; checkpoints', symbol: 'Spokes labeled G1, S, G2, M', zone: 'left' },
    { attribute_type: 'effect', value: 'ordered growth and division', symbol: 'Wheel turning one rotation', zone: 'foreground' },
  ],
  image_story: 'One scene: a bicycle wheel with G1, S, G2, M on the spokes. No split panels.',
  recall_story: 'Picture a bicycle wheel with G1, S, G2, M on the spokes.',
};

describe('runEngineValidation', () => {
  it('passes for a valid artifact (concept, 2–6 facts, anchor, symbol_map, story)', () => {
    const result = runEngineValidation(validArtifact);
    expect(result.hardFailure).toBe(false);
    expect(result.failed.map((f) => f.id)).not.toContain('CHECK_1');
    expect(result.failed.map((f) => f.id)).not.toContain('CHECK_4');
    expect(result.passed.length).toBeGreaterThan(0);
  });

  it('fails CHECK_1 when concept or description is missing', () => {
    const noConcept = { ...validArtifact, concept: '' };
    const r1 = runCheck('CHECK_1', noConcept);
    expect(r1.pass).toBe(false);

    const noDesc = { ...validArtifact, core_concept: '', summary: '', exam_summary: '' };
    const r2 = runCheck('CHECK_1', noDesc);
    expect(r2.pass).toBe(false);
  });

  it('fails CHECK_4 when a fact has no visual (symbol_map shorter than attributes)', () => {
    const noVisual = { ...validArtifact, symbol_map: [validArtifact.symbol_map[0]] };
    const result = runEngineValidation(noVisual);
    const check4 = result.failed.find((f) => f.id === 'CHECK_4');
    expect(check4).toBeDefined();
    expect(result.hardFailure).toBe(true);
  });

  it('fails FACTS_ONLY_AS_TEXT when attributes exist but symbol_map is empty', () => {
    const textOnly = { ...validArtifact, symbol_map: [] };
    const result = runEngineValidation(textOnly);
    const hard = result.failed.find((f) => f.id === 'FACTS_ONLY_AS_TEXT');
    expect(hard).toBeDefined();
    expect(result.hardFailure).toBe(true);
  });
});

describe('HARD_FAILURE_IDS', () => {
  it('includes CHECK_1, CHECK_2, CHECK_4, CHECK_6, FACTS_ONLY_AS_TEXT', () => {
    expect(HARD_FAILURE_IDS).toContain('CHECK_1');
    expect(HARD_FAILURE_IDS).toContain('CHECK_4');
    expect(HARD_FAILURE_IDS).toContain('FACTS_ONLY_AS_TEXT');
  });
});
