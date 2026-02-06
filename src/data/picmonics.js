/**
 * Picture mnemonics: memorable visual descriptions (and optional images) per concept.
 * Pipeline: Concept Decomposition → Phonetic Anchor → Attribute→Symbol Map → Scene → Artifact.
 * Artifact = retrieval-first mnemonic object: anchor + symbol_map + optional scene.
 */

import { getDecomposition } from './conceptDecompositions';
import { getPhoneticAnchor } from './phoneticAnchors';
import { buildSymbolMap } from './visualGrammar';
import { enrichSymbolMapWithLibrary } from './symbolLibrary';
import { getSceneSettingForArtifact, buildSceneBlueprint } from '../services/promptEngineer';
import { deriveRecallStory } from '../services/mnemonicPipeline';
import { withValidation } from '../utils/mnemonicValidation';

export const picmonicsBank = [
  // BIO 201
  {
    id: 'pic-bio-membrane',
    course_id: 'bio201',
    concept_id: 'cell-membrane',
    title: 'Cell Membrane',
    description: 'Imagine a bouncer at a club door—only certain people get in. The cell membrane is like that: it decides what enters and exits. "Selectively permeable" = the bouncer’s list.',
    image_seed: 'cell-membrane',
  },
  {
    id: 'pic-bio-membrane-2',
    course_id: 'bio201',
    concept_id: 'cell-membrane',
    title: 'Cell Membrane',
    description: 'Picture a screen door: air and small bugs get through, but not the dog. The membrane lets small molecules (water, oxygen) through but blocks others. Screen = selective.',
    image_seed: 'cell-membrane-2',
  },
  {
    id: 'pic-bio-protein',
    course_id: 'bio201',
    concept_id: 'protein-synthesis',
    title: 'Protein Synthesis',
    description: 'Think of a recipe (DNA) copied onto a card (mRNA) and read by a chef (ribosome) who assembles ingredients (amino acids) into a dish (protein). The kitchen is the cytoplasm.',
    image_seed: 'protein-synthesis',
  },
  {
    id: 'pic-bio-pmat',
    course_id: 'bio201',
    concept_id: 'cell-division',
    title: 'Mitosis (PMAT)',
    description: 'Picture a dance: **P**artner up (prophase—chromosomes pair), **M**eet in the middle (metaphase—line up), **A**part (anaphase—pull apart), **T**wo rooms (telophase—two nuclei). PMAT = one cell becomes two.',
    image_seed: 'mitosis-pmat',
  },
  {
    id: 'pic-bio-signaling',
    course_id: 'bio201',
    concept_id: 'cell-signaling',
    title: 'Cell Signaling',
    description: 'Imagine a doorbell: someone rings (signal molecule), the receptor answers (receptor on cell), and a message goes through the house (cascade inside the cell). One ring, big response.',
    image_seed: 'cell-signaling',
  },
  { id: 'pic-bio-osmosis', course_id: 'bio201', concept_id: 'osmosis', title: 'Osmosis', description: 'Water flows toward salt through a membrane. Picture a stretchy bag: water moves in.', image_seed: 'osmosis' },
  { id: 'pic-bio-respiration', course_id: 'bio201', concept_id: 'cellular-respiration', title: 'Cellular Respiration', description: 'Cell “breathes” glucose and makes ATP. Glycolysis, Krebs, ETC in mitochondria.', image_seed: 'cellular-respiration' },
  { id: 'pic-bio-photosynthesis', course_id: 'bio201', concept_id: 'photosynthesis', title: 'Photosynthesis', description: 'Plant + sun + CO₂ + water → glucose + O₂. Light reactions and Calvin cycle.', image_seed: 'photosynthesis' },
  { id: 'pic-bio-dna-replication', course_id: 'bio201', concept_id: 'dna-replication', title: 'DNA Replication', description: 'Zipper unzips; each side becomes a new double helix. Semi-conservative.', image_seed: 'dna-replication' },
  { id: 'pic-bio-enzymes', course_id: 'bio201', concept_id: 'enzymes', title: 'Enzymes', description: 'Key (enzyme) fits lock (substrate). Lowers activation energy; specific.', image_seed: 'enzymes' },
  { id: 'pic-bio-cell-cycle', course_id: 'bio201', concept_id: 'cell-cycle', title: 'Cell Cycle', description: 'G₁, S (copy DNA), G₂, M (divide). Checkpoints like stoplights.', image_seed: 'cell-cycle' },
  // PSYCH 101
  {
    id: 'pic-psych-memory',
    course_id: 'psych101',
    concept_id: 'memory',
    title: 'Working Memory',
    description: 'Picture a small desk (7±2 items): you can only hold a few things at once. Phone number? 7 digits. More than that and things fall off. The desk is working memory.',
    image_seed: 'working-memory',
  },
  {
    id: 'pic-psych-learning',
    course_id: 'psych101',
    concept_id: 'learning',
    title: 'Classical vs Operant',
    description: 'Classical: Pavlov’s dog—bell + food, no choice. Operant: a kid cleans room → gets allowance. One is stimulus–stimulus (automatic); the other is behavior–consequence (your action matters).',
    image_seed: 'classical-operant',
  },
  {
    id: 'pic-psych-encoding',
    course_id: 'psych101',
    concept_id: 'encoding',
    title: 'Encoding',
    description: 'Turning experience into a storable memory. Sticky note = encoding; elaborative encoding sticks better.',
    image_seed: 'encoding',
  },
  { id: 'pic-psych-retrieval', course_id: 'psych101', concept_id: 'retrieval', title: 'Retrieval', description: 'Opening the filing cabinet to get the memory out. Recall vs recognition.', image_seed: 'retrieval' },
  { id: 'pic-psych-schema', course_id: 'psych101', concept_id: 'schema', title: 'Schema', description: 'Mental filing folder that organizes knowledge. Guides perception; can distort.', image_seed: 'schema' },
  { id: 'pic-psych-dissonance', course_id: 'psych101', concept_id: 'cognitive-dissonance', title: 'Cognitive Dissonance', description: 'Two gears grinding: belief and behavior conflict. We change one to reduce discomfort.', image_seed: 'cognitive-dissonance' },
  { id: 'pic-psych-attachment', course_id: 'psych101', concept_id: 'attachment', title: 'Attachment', description: 'Bond between infant and caregiver. Secure base for exploration.', image_seed: 'attachment' },
  { id: 'pic-psych-developmental', course_id: 'psych101', concept_id: 'developmental-stages', title: 'Developmental Stages', description: 'Piaget and Erikson: staircase of stages. Order fixed, ages vary.', image_seed: 'developmental-stages' },
  { id: 'pic-psych-neuroplasticity', course_id: 'psych101', concept_id: 'neuroplasticity', title: 'Neuroplasticity', description: 'Brain made of clay: new connections, pruning. Use it or lose it.', image_seed: 'neuroplasticity' },
  { id: 'pic-psych-perception', course_id: 'psych101', concept_id: 'perception', title: 'Perception', description: 'Eye + light bulb: interpreting sensation. Bottom-up and top-down.', image_seed: 'perception' },
  // ECON 202
  {
    id: 'pic-econ-elastic',
    course_id: 'econ202',
    concept_id: 'elasticity',
    title: 'Elastic Demand',
    description: 'Picture a rubber band: when price goes up, quantity stretches way down (elastic = responsive). Inelastic = stiff rope: price changes, quantity barely moves.',
    image_seed: 'elasticity',
  },
  {
    id: 'pic-econ-surplus',
    course_id: 'econ202',
    concept_id: 'supply-demand',
    title: 'Consumer Surplus',
    description: 'You’d pay $10 for coffee but it costs $4. The $6 you “save” is consumer surplus—the gap between what you were willing to pay and what you paid. It’s the area under the demand curve above price.',
    image_seed: 'consumer-surplus',
  },
  {
    id: 'pic-econ-monopoly',
    course_id: 'econ202',
    concept_id: 'market-structures',
    title: 'Monopoly',
    description: 'One castle, one bridge, no other way across. The monopoly owns the bridge and sets the toll. No substitutes, high barriers—that’s why they’re the “price maker.”',
    image_seed: 'monopoly',
  },
  { id: 'pic-econ-supply-demand', course_id: 'econ202', concept_id: 'supply-and-demand', title: 'Supply and Demand', description: 'Two curves crossing: demand and supply. Equilibrium where they meet.', image_seed: 'supply-demand' },
  { id: 'pic-econ-marginal', course_id: 'econ202', concept_id: 'marginal-utility', title: 'Marginal Utility', description: 'One extra slice of pizza: less satisfaction than the first. Diminishing MU.', image_seed: 'marginal-utility' },
  { id: 'pic-econ-opportunity', course_id: 'econ202', concept_id: 'opportunity-cost', title: 'Opportunity Cost', description: 'Fork in the road: the path not taken has a price tag. Next-best alternative.', image_seed: 'opportunity-cost' },
  { id: 'pic-econ-gdp', course_id: 'econ202', concept_id: 'gdp', title: 'GDP', description: 'Big money bag: C + I + G + NX. Total output in an economy.', image_seed: 'gdp' },
  { id: 'pic-econ-inflation', course_id: 'econ202', concept_id: 'inflation', title: 'Inflation', description: 'Balloon inflating: prices rising. Demand-pull or cost-push.', image_seed: 'inflation' },
  { id: 'pic-econ-fiscal', course_id: 'econ202', concept_id: 'fiscal-policy', title: 'Fiscal Policy', description: 'Government hand on the dial: spending and taxes to heat or cool the economy.', image_seed: 'fiscal-policy' },
  { id: 'pic-econ-comparative', course_id: 'econ202', concept_id: 'comparative-advantage', title: 'Comparative Advantage', description: 'Two countries shaking hands: each makes what it gives up least to make. Gains from trade.', image_seed: 'comparative-advantage' },
  // ENG 215
  {
    id: 'pic-eng-symbol',
    course_id: 'eng215',
    concept_id: 'literary-analysis',
    title: 'Symbol in Literature',
    description: 'The green light in Gatsby isn’t just a light—it’s hope, the American Dream, what’s out of reach. A symbol = one thing that stands for something bigger. Picture the object; then picture what it really means.',
    image_seed: 'symbol',
  },
  {
    id: 'pic-eng-modernism',
    course_id: 'eng215',
    concept_id: 'modernism',
    title: 'Modernism',
    description: 'Imagine a mirror shattered: pieces everywhere, no single clear reflection. Modernism broke the old mirror (traditional form) and showed fragments, stream of consciousness, and disillusionment.',
    image_seed: 'modernism',
  },
  { id: 'pic-eng-theme', course_id: 'eng215', concept_id: 'theme', title: 'Theme', description: 'Light bulb over a book: the central idea or message. Often implied.', image_seed: 'theme' },
  { id: 'pic-eng-irony', course_id: 'eng215', concept_id: 'irony', title: 'Irony', description: 'Rain cloud at a picnic: expectation vs reality. Verbal, situational, dramatic.', image_seed: 'irony' },
  { id: 'pic-eng-narrator', course_id: 'eng215', concept_id: 'narrator', title: 'Narrator', description: 'Megaphone or voice: who tells the story. First, second, third; reliable vs unreliable.', image_seed: 'narrator' },
  { id: 'pic-eng-metaphor', course_id: 'eng215', concept_id: 'metaphor', title: 'Metaphor', description: 'Equals sign between two unlike things. Direct comparison; no "like" or "as."', image_seed: 'metaphor' },
  { id: 'pic-eng-genre', course_id: 'eng215', concept_id: 'genre', title: 'Genre', description: 'Bookshelf with sections: tragedy, comedy, satire. Conventions shape interpretation.', image_seed: 'genre' },
  { id: 'pic-eng-imagery', course_id: 'eng215', concept_id: 'imagery', title: 'Imagery', description: 'Paintbrush painting the senses. Visual, sound, touch—mental pictures.', image_seed: 'imagery' },
  { id: 'pic-eng-tone', course_id: 'eng215', concept_id: 'tone', title: 'Tone', description: 'Face with an expression: author’s attitude. Conveyed by diction and style.', image_seed: 'tone' },
  { id: 'pic-eng-conflict', course_id: 'eng215', concept_id: 'conflict', title: 'Conflict', description: 'Two fists or forces pushing. Person vs person, self, society, nature. Drives plot.', image_seed: 'conflict' },
];

/** Get mnemonics for a course. course can be { id } or null for all. */
export function getPicmonicsForCourse(course) {
  if (!course?.id) return picmonicsBank;
  return picmonicsBank.filter((m) => m.course_id === course.id);
}

/** Get unique concepts that have mnemonics for a course. */
export function getConceptsWithPicmonics(course) {
  const mnemonics = getPicmonicsForCourse(course);
  const seen = new Set();
  return mnemonics
    .filter((m) => {
      if (seen.has(m.concept_id)) return false;
      seen.add(m.concept_id);
      return true;
    })
    .map((m) => ({ concept_id: m.concept_id, title: m.title }));
}

/** Get mnemonics for a concept (may have multiple variants for "generate another"). */
export function getPicmonicsForConcept(course, conceptId) {
  const pool = getPicmonicsForCourse(course).filter((m) => m.concept_id === conceptId);
  return [...pool].sort(() => Math.random() - 0.5);
}

/** Get one mnemonic for a concept (random among variants). */
export function getOnePicmonicForConcept(course, conceptId) {
  const pool = getPicmonicsForConcept(course, conceptId);
  return pool[0] || null;
}

/** Placeholder image URL (deterministic per seed). */
export function getMnemonicImageUrl(mnemonic) {
  const seed = mnemonic?.image_seed || mnemonic?.id || 'default';
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/400/260`;
}

/** Single transcript for read-aloud (≤30 sec): concept + terms + visual references + story. Used by Play transcript. */
const NARRATIVE_TRANSCRIPTS = {
  'cell-membrane':
    'The cell membrane is the outer boundary of the cell. Think of it as the Jail Membrane—a stretchy door in a jail cell. The wall is the phospholipid bilayer. Selective permeability means the membrane controls who gets in: small molecules like water and oxygen slip through; large or charged ones are blocked. So the Jail Membrane is your bouncer—one scene, one concept.',
  'protein-synthesis':
    'Protein synthesis is how genes become proteins. Picture Proteen in the kitchen: the chef. The recipe is DNA; it gets copied onto a card—that’s mRNA, transcription. The chef at the counter, the ribosome, reads the card and assembles ingredients into a dish—that’s translation. So DNA to mRNA in the nucleus, mRNA to protein at the ribosome. Central dogma, one visual.',
  'cell-division':
    'Mitosis is how one cell becomes two identical daughter cells. Remember PMAT: Partner up is Prophase—chromosomes pair. Meet in the middle is Metaphase—they line up. Apart is Anaphase—they pull apart. Two rooms is Telophase—two nuclei. So two cells doing a simple dance: partner up, meet in the middle, apart, two rooms. One cell becomes two.',
  'cell-signaling':
    'Cell signaling is how one signal produces a big response. Picture a cell with a doorbell. A signal molecule rings the bell; the receptor on the cell surface answers; a message travels through the cell—that’s the cascade. One ring, big response. The doorbell is your mnemonic for the mechanism.',
  'elasticity':
    'Elasticity of demand is how much quantity demanded changes when price changes. Picture an elastic band in a marketplace. When the band stretches a lot, demand is elastic—quantity is very responsive. When it barely moves, demand is inelastic. So elastic band, elastic demand—one anchor.',
  'supply-demand':
    'Consumer surplus is the gap between what you were willing to pay and what you actually paid. Picture a marketplace: the area under the demand curve and above the price is that surplus. You’d pay more; you pay less; the difference is your gain.',
  'market-structures':
    'A monopoly is one seller with no close substitutes and high barriers to entry. Picture one castle and one bridge. The monopoly owns the bridge and sets the toll—it’s the price maker. No competition, so it controls the market.',
  'memory':
    'Working memory holds and manipulates information briefly—about seven items, plus or minus two. Picture a small desk, a memo board, with seven sticky notes. When the desk is full, things fall off. The desk is in the frontal lobe; that’s your anchor.',
  'learning':
    'Classical conditioning is learning by association—Pavlov’s dog, bell and food, no choice. Operant conditioning is learning by consequence—you do something, you get a reward or punishment. So classical is stimulus–stimulus; operant is behavior–consequence. One automatic, one where your action matters.',
};

/** Optional short narratives (story integration) per concept. Explains the concept and the visual. */
const SCENE_NARRATIVES = {
  'cell-membrane':
    'Picture a jail cell whose door is a stretchy membrane—that’s your main character, the Jail Membrane. The wall of the cell is the phospholipid bilayer; the membrane door controls who gets in (selective permeability). Around the cell, small molecules slip through; large or charged ones stay out. One scene, one concept.',
  'protein-synthesis':
    'Picture a chef in a kitchen: that’s your anchor, Proteen in the kitchen. The recipe (DNA) becomes a card (mRNA); the chef at the counter (ribosome) assembles ingredients (amino acids) into a dish (protein). The kitchen is the cytoplasm. Central dogma, one visual.',
  'cell-division':
    'Picture two cells doing a dance: Partner up, Meet in the middle, Apart, Two rooms—PMAT. The main character is the dividing cell; the dance steps are the phases. One cell becomes two identical daughters.',
  'cell-signaling':
    'Picture a cell holding a doorbell. Someone rings (signal molecule); the receptor answers; a message travels through the house (cascade). One ring, big response. The cell is the main character; the doorbell encodes the mechanism.',
  'elasticity':
    'Picture an elastic band in a marketplace: that’s your anchor for Elasticity of Demand. Elasticity is how much quantity demanded responds when price changes. When the band stretches a lot, demand is elastic—quantity moves a lot. When it barely moves, demand is inelastic.',
  'supply-demand':
    'Consumer surplus is the gap between what you were willing to pay and what you actually paid. Picture a marketplace: the area under the demand curve above the price is that surplus. You’d pay more; you pay less; the difference is your gain.',
  'market-structures':
    'Picture one castle and one bridge: that’s a monopoly. One seller, no close substitutes, high barriers to entry. The monopoly is the price maker—it sets the toll. No competition, so it controls the market.',
  'memory':
    'Picture a small desk: that’s working memory. It holds and manipulates information briefly—about seven items, plus or minus two. The desk is in the frontal lobe; when it’s full, things fall off.',
  'learning':
    'Classical conditioning: a bell and food—Pavlov’s dog, no choice. Operant conditioning: you do something, you get a consequence. One is stimulus–stimulus; the other is behavior–consequence. Picture the difference: automatic vs. your action matters.',
};

/**
 * Build a 2–3 sentence narrative from anchor + symbol_map (story integration).
 */
function buildNarrative(artifact) {
  const { anchor, symbol_map } = artifact;
  const byZone = { left: [], foreground: [], right: [], background: [], center: [] };
  symbol_map.forEach((s) => {
    if (byZone[s.zone]) byZone[s.zone].push(s);
  });
  const parts = [];
  parts.push(`Picture ${anchor.object}.`);
  // Prefer actual fact (value) for learner-facing narrative; avoid raw template strings from symbol library
  const slotText = (s) => (s.value && String(s.value).trim()) || s.symbol || '';
  if (byZone.left.length) parts.push(`To the left: ${byZone.left.map(slotText).join('; ')}.`);
  if (byZone.foreground.length) parts.push(`In the foreground: ${byZone.foreground.map(slotText).join('; ')}.`);
  if (byZone.right.length) parts.push(`To the right: ${byZone.right.map(slotText).join('; ')}.`);
  if (byZone.background.length) parts.push(`In the background: ${byZone.background.map(slotText).join('; ')}.`);
  return parts.join(' ');
}

/**
 * Build full mnemonic artifact from pipeline: decomposition → anchor → symbol_map → scene + narrative.
 * Returns null if concept has no decomposition (legacy mnemonic).
 */
export function getMnemonicArtifact(mnemonic) {
  if (!mnemonic?.concept_id) return null;
  const decomposition = getDecomposition(mnemonic.concept_id);
  if (!decomposition?.attributes?.length) return null;
  const anchor = getPhoneticAnchor(mnemonic.concept_id);
  const symbol_map = enrichSymbolMapWithLibrary(buildSymbolMap(decomposition.attributes));
  const scene = {
    center: 'phonetic anchor',
    foreground: 'mechanism',
    left: 'cause / class',
    right: 'effects / side effects',
    background: 'associations / exceptions',
  };
  const base = {
    concept: decomposition.concept,
    domain: decomposition.domain,
    summary: decomposition.summary || null,
    core_concept: decomposition.core_concept || null,
    exam_summary: decomposition.exam_summary || null,
    high_yield_distinctions: decomposition.high_yield_distinctions || null,
    image_story: decomposition.image_story || null,
    recall_story: decomposition.recall_story || deriveRecallStory({ anchor: anchor || { phrase: mnemonic.title, object: mnemonic.title }, symbol_map }),
    mnemonic_narrative: decomposition.mnemonic_narrative || null,
    attributes: decomposition.attributes,
    anchor: anchor || { phrase: mnemonic.title, object: mnemonic.title },
    symbol_map,
    scene,
    scene_blueprint: buildSceneBlueprint({ anchor: anchor || { phrase: mnemonic.title, object: mnemonic.title }, symbol_map, domain: decomposition.domain }),
    encoding_mode: decomposition.encoding_mode || 'full_mnemonic',
  };
  const narrative =
    SCENE_NARRATIVES[mnemonic.concept_id] || buildNarrative(base);
  const transcript = NARRATIVE_TRANSCRIPTS[mnemonic.concept_id] || narrative;
  const scene_setting = getSceneSettingForArtifact(base);
  const artifact = { ...base, narrative, transcript, scene_setting };
  return withValidation(artifact);
}
