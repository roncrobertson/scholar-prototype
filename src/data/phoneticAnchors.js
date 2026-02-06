/**
 * Phonetic Anchor Engine: map concept name → one primary visual anchor.
 * Rule: phonetic similarity > semantic meaning. One primary anchor per concept.
 * Deterministic, reusable across sessions.
 */

export const phoneticAnchors = {
  'cell-membrane': { phrase: 'Jail Membrane', object: 'a jail cell made of a stretchy membrane door' },
  'protein-synthesis': { phrase: 'Proteen in the kitchen', object: 'a chef (ribosome) cooking protein in a kitchen' },
  'cell-division': { phrase: 'Cell + division', object: 'two cells doing a dance (PMAT)' },
  'cell-signaling': { phrase: 'Cell signal', object: 'a cell holding a doorbell / receiving a package' },
  memory: { phrase: 'Memo board', object: 'a small desk with 7 sticky notes (working memory)' },
  learning: { phrase: 'Pavlov + Operant', object: 'a dog with a bell + a kid with a piggy bank' },
  elasticity: { phrase: 'Elastic band', object: 'a rubber band stretching when price pulls' },
  'supply-demand': { phrase: 'Surplus under curve', object: 'a triangle under the demand curve above price' },
  'market-structures': { phrase: 'One castle', object: 'one castle with a single bridge (monopoly)' },
  'literary-analysis': { phrase: 'Symbol = stands for', object: 'one object standing in for a bigger idea' },
  modernism: { phrase: 'Shattered mirror', object: 'a broken mirror with fragments' },
  penicillin: { phrase: 'Pencil Villain', object: 'an evil pencil character' },
  // BIO 201 (expand)
  osmosis: { phrase: 'Osmosis', object: 'water flowing through a membrane toward salt' },
  'cellular-respiration': { phrase: 'Cell respire', object: 'a cell breathing fire (ATP)' },
  photosynthesis: { phrase: 'Photo synthesis', object: 'a plant with a sun and a factory' },
  'dna-replication': { phrase: 'DNA replicate', object: 'a zipper unzipping into two zippers' },
  enzymes: { phrase: 'Enzyme', object: 'a key fitting a lock (substrate)' },
  'cell-cycle': { phrase: 'Cell cycle', object: 'a bicycle wheel with G1, S, G2, M on the spokes' },
  // PSYCH 101 (expand)
  encoding: { phrase: 'Encode', object: 'a sticky note being written and stuck' },
  retrieval: { phrase: 'Retrieve', object: 'a filing cabinet drawer opening' },
  schema: { phrase: 'Schema', object: 'a mental filing folder' },
  'cognitive-dissonance': { phrase: 'Cognitive dissonance', object: 'two gears grinding against each other' },
  attachment: { phrase: 'Attachment', object: 'a baby and caregiver with a visible bond' },
  'developmental-stages': { phrase: 'Developmental stages', object: 'a staircase with stages labeled' },
  neuroplasticity: { phrase: 'Neuro plastic', object: 'a brain made of clay being reshaped' },
  perception: { phrase: 'Perception', object: 'an eye and a light bulb (interpretation)' },
  // ECON 202 (expand)
  'supply-and-demand': { phrase: 'Supply and demand', object: 'two curves crossing (X)' },
  'marginal-utility': { phrase: 'Marginal utility', object: 'one extra slice of pizza with a small smile' },
  'opportunity-cost': { phrase: 'Opportunity cost', object: 'a fork in the road with a price tag' },
  gdp: { phrase: 'GDP', object: 'a big money bag labeled C+I+G+NX' },
  inflation: { phrase: 'Inflation', object: 'a balloon inflating (prices rising)' },
  'fiscal-policy': { phrase: 'Fiscal policy', object: 'a government hand adjusting a dial' },
  'comparative-advantage': { phrase: 'Comparative advantage', object: 'two countries shaking hands over trade' },
  // ENG 215 (expand)
  theme: { phrase: 'Theme', object: 'a light bulb over a book' },
  irony: { phrase: 'Irony', object: 'a rain cloud at a picnic' },
  narrator: { phrase: 'Narrator', object: 'a megaphone or voice bubble' },
  metaphor: { phrase: 'Metaphor', object: 'an equals sign between two unlike things' },
  genre: { phrase: 'Genre', object: 'a bookshelf with labeled sections' },
  imagery: { phrase: 'Imagery', object: 'a paintbrush painting senses' },
  tone: { phrase: 'Tone', object: 'a face with an expression (attitude)' },
  conflict: { phrase: 'Conflict', object: 'two fists or forces pushing' },
};

/** Get phonetic anchor for a concept (by concept_id or term). */
export function getPhoneticAnchor(conceptIdOrTerm) {
  const key = (conceptIdOrTerm || '').toLowerCase().replace(/\s+/g, '-');
  return phoneticAnchors[key] || null;
}
