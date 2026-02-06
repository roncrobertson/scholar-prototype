/**
 * Flashcard data per course. In production this would come from LMS or spaced-repetition API.
 * Each card: { id, front, back, courseId, topic? }
 */

export const flashcardDecks = {
  bio201: [
    { id: 'bio-1', front: 'What is the primary function of the cell membrane?', back: 'To regulate what enters and exits the cell and maintain homeostasis. It is selectively permeable.', courseId: 'bio201', topic: 'Cell Membrane' },
    { id: 'bio-2', front: 'Where does protein synthesis occur?', back: 'Ribosomes—either free in the cytoplasm or bound to the rough ER. mRNA is translated into polypeptide chains there.', courseId: 'bio201', topic: 'Protein Synthesis' },
    { id: 'bio-3', front: 'Name the phases of mitosis in order.', back: 'Prophase, metaphase, anaphase, telophase (PMAT). Cytokinesis follows to split the cytoplasm.', courseId: 'bio201', topic: 'Cell Division' },
    { id: 'bio-4', front: 'What is cell signaling?', back: 'The process by which cells detect and respond to external signals (e.g., hormones) via receptors, often triggering a cascade of intracellular events.', courseId: 'bio201', topic: 'Cell Signaling' },
    { id: 'bio-5', front: 'What is osmosis?', back: 'The passive movement of water across a selectively permeable membrane from an area of lower solute concentration to higher solute concentration.', courseId: 'bio201', topic: 'Cell Membrane' },
    { id: 'bio-6', front: 'What is the role of ATP in the cell?', back: 'ATP (adenosine triphosphate) is the main energy currency. It stores and transfers energy for metabolic processes when hydrolyzed to ADP + Pi.', courseId: 'bio201', topic: 'Cell Membrane' },
  ],
  psych101: [
    { id: 'psych-1', front: 'What is the difference between classical and operant conditioning?', back: 'Classical: association between two stimuli (e.g., bell + food). Operant: behavior is strengthened or weakened by consequences (reinforcement/punishment).', courseId: 'psych101', topic: 'Learning' },
    { id: 'psych-2', front: 'What is working memory?', back: 'Short-term storage that holds and manipulates information for a few seconds. Limited capacity (about 7 ± 2 items). Involves prefrontal cortex.', courseId: 'psych101', topic: 'Memory' },
    { id: 'psych-3', front: 'Define cognitive dissonance.', back: 'Discomfort when holding conflicting beliefs or when behavior contradicts beliefs. People often reduce it by changing attitudes or behavior.', courseId: 'psych101', topic: 'Memory' },
    { id: 'psych-4', front: 'What is the scientific method in psychology?', back: 'Observe, form a hypothesis, design a study (experiment/survey), collect data, analyze, and draw conclusions. Replication is key.', courseId: 'psych101', topic: 'Research Methods' },
    { id: 'psych-5', front: 'What are neurotransmitters?', back: 'Chemical messengers released by neurons into the synapse. Examples: dopamine, serotonin, GABA. They bind receptors on the next cell.', courseId: 'psych101', topic: 'Biological Bases' },
    { id: 'psych-6', front: 'What is encoding in memory?', back: 'The process of transforming sensory input into a form that can be stored. Elaborative encoding (linking to existing knowledge) improves recall.', courseId: 'psych101', topic: 'Memory' },
  ],
  econ202: [
    { id: 'econ-1', front: 'What is elasticity of demand?', back: 'Measures how much quantity demanded changes when price changes. Elastic: % change in Qd > % change in P. Inelastic: the opposite.', courseId: 'econ202', topic: 'Elasticity' },
    { id: 'econ-2', front: 'Define the law of supply.', back: 'Holding else constant, a higher price leads to a higher quantity supplied. Producers supply more when they can get a higher price.', courseId: 'econ202', topic: 'Supply & Demand' },
    { id: 'econ-3', front: 'What is marginal utility?', back: 'The additional satisfaction (utility) from consuming one more unit of a good. Often diminishes as consumption increases.', courseId: 'econ202', topic: 'Consumer Theory' },
    { id: 'econ-4', front: 'What is a monopoly?', back: 'A market with a single seller, no close substitutes, and high barriers to entry. Monopolist can set price (price maker).', courseId: 'econ202', topic: 'Market Structures' },
    { id: 'econ-5', front: 'What is consumer surplus?', back: 'The difference between what consumers are willing to pay and what they actually pay. Area below demand curve and above price.', courseId: 'econ202', topic: 'Supply & Demand' },
    { id: 'econ-6', front: 'What is perfect competition?', back: 'Many buyers and sellers, identical product, free entry/exit, perfect information. Firms are price takers; P = MC in long run.', courseId: 'econ202', topic: 'Market Structures' },
  ],
  eng215: [
    { id: 'eng-1', front: 'What is close reading?', back: 'Careful, detailed analysis of a short passage—focus on diction, imagery, structure, and how they create meaning and effect.', courseId: 'eng215', topic: 'Literary Analysis' },
    { id: 'eng-2', front: 'Name a key theme of American Romanticism.', back: 'Emphasis on emotion, nature, individualism, and the supernatural. Reaction against Enlightenment rationalism and industrialization.', courseId: 'eng215', topic: 'American Romanticism' },
    { id: 'eng-3', front: 'What is Modernism in literature?', back: 'Early 20th-century movement: experimentation, fragmentation, stream of consciousness, disillusionment, breaking from traditional form.', courseId: 'eng215', topic: 'Modernism' },
    { id: 'eng-4', front: 'What is a symbol in literature?', back: 'An object, character, or event that represents a larger idea or theme. Example: the green light in Gatsby representing hope/the American Dream.', courseId: 'eng215', topic: 'Literary Analysis' },
    { id: 'eng-5', front: 'What is an unreliable narrator?', back: 'A narrator whose account we cannot fully trust—due to bias, ignorance, or intent to deceive. Forces readers to question the story.', courseId: 'eng215', topic: 'Literary Analysis' },
    { id: 'eng-6', front: 'Define irony in literature.', back: 'A contrast between expectation and reality. Verbal: say one thing, mean another. Situational: outcome differs from expectation. Dramatic: audience knows more than characters.', courseId: 'eng215', topic: 'Literary Analysis' },
  ],
};

/** Get cards for a course. course can be { id } or null for all. */
export function getCardsForCourse(course) {
  if (!course?.id) {
    return Object.values(flashcardDecks).flat();
  }
  return flashcardDecks[course.id] || [];
}

/**
 * Bank of all flashcard (course_id, concept_id) for getDueCountFromConcepts.
 * concept_id = card id.
 */
export function getFlashcardsBank() {
  const list = [];
  for (const [courseId, deck] of Object.entries(flashcardDecks)) {
    for (const card of deck) {
      list.push({ course_id: courseId, concept_id: card.id });
    }
  }
  return list;
}

/** Shuffle array (Fisher–Yates). */
export function shuffleCards(cards) {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// --- Persist "study again" across sessions (improvement 3) ---
const STORAGE_KEY_STUDY_AGAIN = 'scholar-flashcards-study-again';

function getStudyAgainStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STUDY_AGAIN);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function setStudyAgainStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY_STUDY_AGAIN, JSON.stringify(data));
  } catch (_) {}
}

/**
 * courseKey: course?.id ?? 'all'
 * @returns {string[]} card ids
 */
export function getStudyAgainPersisted(courseKey) {
  const key = courseKey ?? 'all';
  const data = getStudyAgainStorage();
  const list = data[key];
  return Array.isArray(list) ? list : [];
}

export function addToStudyAgainPersisted(courseKey, cardId) {
  const key = courseKey ?? 'all';
  const data = getStudyAgainStorage();
  const list = Array.isArray(data[key]) ? data[key] : [];
  if (!list.includes(cardId)) {
    data[key] = [...list, cardId];
    setStudyAgainStorage(data);
  }
}

/**
 * Remove given card ids from persisted "study again" for this course key.
 */
export function removeFromStudyAgainPersisted(courseKey, cardIds) {
  if (!cardIds || cardIds.length === 0) return;
  const key = courseKey ?? 'all';
  const data = getStudyAgainStorage();
  const list = Array.isArray(data[key]) ? data[key] : [];
  const removeSet = new Set(cardIds);
  const next = list.filter((id) => !removeSet.has(id));
  if (next.length !== list.length) {
    data[key] = next;
    setStudyAgainStorage(data);
  }
}

export function clearStudyAgainPersisted(courseKey) {
  const key = courseKey ?? 'all';
  const data = getStudyAgainStorage();
  data[key] = [];
  setStudyAgainStorage(data);
}

// --- Persist "term first" preference ---
const STORAGE_KEY_TERM_FIRST = 'scholar-flashcards-term-first';

export function getShowTermFirstPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TERM_FIRST);
    if (raw === 'false') return false;
    if (raw === 'true') return true;
  } catch (_) {}
  return true;
}

export function setShowTermFirstPersisted(showTermFirst) {
  try {
    localStorage.setItem(STORAGE_KEY_TERM_FIRST, String(showTermFirst));
  } catch (_) {}
}
