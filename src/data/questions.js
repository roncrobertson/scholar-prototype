/**
 * Question bank: multiple choice per course + concept_id.
 * Each question: prompt, choices[], correct_answer_id, rationale, difficulty (1–5),
 * misconception_hint (short hint when wrong), concept_id, source_anchors (optional).
 * Prototype: in-memory only; no de-duplication or versioning.
 */

export const questionBank = [
  // BIO 201
  {
    id: 'q-bio-1',
    course_id: 'bio201',
    concept_id: 'cell-membrane',
    prompt: 'What is the primary function of the cell membrane?',
    choices: [
      { id: 'a', text: 'To store genetic material' },
      { id: 'b', text: 'To regulate what enters and exits the cell and maintain homeostasis' },
      { id: 'c', text: 'To produce ATP' },
      { id: 'd', text: 'To synthesize proteins' },
    ],
    correct_answer_id: 'b',
    rationale: 'The cell membrane is selectively permeable and maintains homeostasis by controlling the passage of substances.',
    misconception_hint: 'Think about what "selectively permeable" means—it controls what goes in and out.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-bio-2',
    course_id: 'bio201',
    concept_id: 'protein-synthesis',
    prompt: 'Where does protein synthesis occur?',
    choices: [
      { id: 'a', text: 'In the nucleus only' },
      { id: 'b', text: 'In the mitochondria' },
      { id: 'c', text: 'At ribosomes (free in cytoplasm or bound to rough ER)' },
      { id: 'd', text: 'In the Golgi apparatus' },
    ],
    correct_answer_id: 'c',
    rationale: 'Ribosomes translate mRNA into polypeptide chains; they can be free or bound to the rough ER.',
    misconception_hint: 'Translation (mRNA → protein) happens at ribosomes, not in the nucleus.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-bio-3',
    course_id: 'bio201',
    concept_id: 'cell-signaling',
    prompt: 'What is cell signaling?',
    choices: [
      { id: 'a', text: 'The process of DNA replication' },
      { id: 'b', text: 'The process by which cells detect and respond to external signals via receptors' },
      { id: 'c', text: 'The breakdown of glucose' },
      { id: 'd', text: 'The movement of water across a membrane' },
    ],
    correct_answer_id: 'b',
    rationale: 'Cell signaling involves receptors, signal molecules, and often a cascade of intracellular events.',
    misconception_hint: 'Signaling is about communication between cells or between environment and cell.',
    difficulty: 3,
    source_anchors: [],
  },
  {
    id: 'q-bio-4',
    course_id: 'bio201',
    concept_id: 'cell-division',
    prompt: 'Name the phases of mitosis in order.',
    choices: [
      { id: 'a', text: 'Metaphase, prophase, anaphase, telophase' },
      { id: 'b', text: 'Prophase, metaphase, anaphase, telophase (PMAT)' },
      { id: 'c', text: 'Anaphase, telophase, prophase, metaphase' },
      { id: 'd', text: 'Telophase, anaphase, metaphase, prophase' },
    ],
    correct_answer_id: 'b',
    rationale: 'PMAT is the standard order: chromosomes condense, align, separate, then nuclei reform.',
    misconception_hint: 'Prophase comes first (chromosomes condense); metaphase is when they line up.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-bio-5',
    course_id: 'bio201',
    concept_id: 'cell-membrane',
    prompt: 'Osmosis is best described as:',
    choices: [
      { id: 'a', text: 'Active transport of ions' },
      { id: 'b', text: 'Passive movement of water across a selectively permeable membrane' },
      { id: 'c', text: 'Diffusion of proteins' },
      { id: 'd', text: 'Endocytosis of large molecules' },
    ],
    correct_answer_id: 'b',
    rationale: 'Osmosis is passive movement of water from lower to higher solute concentration.',
    misconception_hint: 'Osmosis is only about water; it is passive, not active transport.',
    difficulty: 2,
    source_anchors: [],
  },
  // PSYCH 101
  {
    id: 'q-psych-1',
    course_id: 'psych101',
    concept_id: 'memory',
    prompt: 'What is working memory?',
    choices: [
      { id: 'a', text: 'Long-term storage of facts' },
      { id: 'b', text: 'Short-term storage that holds and manipulates information for a few seconds' },
      { id: 'c', text: 'Procedural memory for skills' },
      { id: 'd', text: 'Autobiographical memory' },
    ],
    correct_answer_id: 'b',
    rationale: 'Working memory has limited capacity (~7±2 items) and involves the prefrontal cortex.',
    misconception_hint: 'Working memory is short-term and active—you use it to hold and manipulate info.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-psych-2',
    course_id: 'psych101',
    concept_id: 'learning',
    prompt: 'Classical conditioning differs from operant conditioning in that:',
    choices: [
      { id: 'a', text: 'Operant involves reflexes; classical involves voluntary behavior' },
      { id: 'b', text: 'Classical involves association between two stimuli; operant involves consequences of behavior' },
      { id: 'c', text: 'Classical uses punishment; operant uses reinforcement only' },
      { id: 'd', text: 'They are the same process' },
    ],
    correct_answer_id: 'b',
    rationale: 'Classical: stimulus–stimulus (e.g. bell–food). Operant: behavior–consequence (reinforcement/punishment).',
    misconception_hint: 'Classical = learning by association of stimuli; operant = learning by consequences.',
    difficulty: 3,
    source_anchors: [],
  },
  {
    id: 'q-psych-3',
    course_id: 'psych101',
    concept_id: 'memory',
    prompt: 'Encoding in memory refers to:',
    choices: [
      { id: 'a', text: 'Retrieving stored information' },
      { id: 'b', text: 'Transforming sensory input into a form that can be stored' },
      { id: 'c', text: 'Forgetting over time' },
      { id: 'd', text: 'The capacity of short-term memory' },
    ],
    correct_answer_id: 'b',
    rationale: 'Encoding is the process of putting information into a storable format.',
    misconception_hint: 'Encoding happens at input; retrieval happens when you recall.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-psych-4',
    course_id: 'psych101',
    concept_id: 'research-methods',
    prompt: 'A key feature of the scientific method in psychology is:',
    choices: [
      { id: 'a', text: 'Using only case studies' },
      { id: 'b', text: 'Forming a hypothesis, collecting data, and replicating findings' },
      { id: 'c', text: 'Avoiding measurement' },
      { id: 'd', text: 'Relying only on intuition' },
    ],
    correct_answer_id: 'b',
    rationale: 'Hypothesis, systematic data collection, and replication are central to the scientific method.',
    misconception_hint: 'Science relies on testable hypotheses and repeatable results.',
    difficulty: 1,
    source_anchors: [],
  },
  {
    id: 'q-psych-5',
    course_id: 'psych101',
    concept_id: 'biological-bases',
    prompt: 'Neurotransmitters are:',
    choices: [
      { id: 'a', text: 'Hormones that travel in the bloodstream' },
      { id: 'b', text: 'Chemical messengers released into the synapse that bind receptors' },
      { id: 'c', text: 'Electrical signals only' },
      { id: 'd', text: 'Found only in the spinal cord' },
    ],
    correct_answer_id: 'b',
    rationale: 'Neurotransmitters are released from the presynaptic neuron and bind receptors on the postsynaptic cell.',
    misconception_hint: 'They cross the synapse (gap between neurons), unlike hormones in blood.',
    difficulty: 2,
    source_anchors: [],
  },
  // ECON 202
  {
    id: 'q-econ-1',
    course_id: 'econ202',
    concept_id: 'elasticity',
    prompt: 'Demand is "elastic" when:',
    choices: [
      { id: 'a', text: 'Quantity demanded does not change when price changes' },
      { id: 'b', text: 'The percentage change in quantity demanded is greater than the percentage change in price' },
      { id: 'c', text: 'Price is very high' },
      { id: 'd', text: 'Supply is fixed' },
    ],
    correct_answer_id: 'b',
    rationale: 'Elastic means quantity is responsive to price—% change in Qd > % change in P.',
    misconception_hint: 'Elastic = responsive; inelastic = not very responsive to price.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-econ-2',
    course_id: 'econ202',
    concept_id: 'supply-demand',
    prompt: 'Consumer surplus is:',
    choices: [
      { id: 'a', text: 'The cost of production' },
      { id: 'b', text: 'The difference between what consumers are willing to pay and what they actually pay' },
      { id: 'c', text: 'Total revenue' },
      { id: 'd', text: 'Producer profit' },
    ],
    correct_answer_id: 'b',
    rationale: 'Consumer surplus is the area below the demand curve and above the price.',
    misconception_hint: 'It measures the benefit to buyers from paying less than their max willingness to pay.',
    difficulty: 3,
    source_anchors: [],
  },
  {
    id: 'q-econ-3',
    course_id: 'econ202',
    concept_id: 'market-structures',
    prompt: 'A monopoly has:',
    choices: [
      { id: 'a', text: 'Many sellers and identical products' },
      { id: 'b', text: 'A single seller, no close substitutes, and high barriers to entry' },
      { id: 'c', text: 'No barriers to entry' },
      { id: 'd', text: 'Perfect information for all' },
    ],
    correct_answer_id: 'b',
    rationale: 'A monopolist is the only seller and can set price (price maker).',
    misconception_hint: 'Monopoly = one seller; think about what keeps others out (barriers).',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-econ-4',
    course_id: 'econ202',
    concept_id: 'consumer-theory',
    prompt: 'Marginal utility typically:',
    choices: [
      { id: 'a', text: 'Increases as you consume more' },
      { id: 'b', text: 'Decreases as you consume more of a good (diminishing marginal utility)' },
      { id: 'c', text: 'Stays constant' },
      { id: 'd', text: 'Equals total cost' },
    ],
    correct_answer_id: 'b',
    rationale: 'The first unit gives more satisfaction than the second; additional units add less.',
    misconception_hint: 'Think "one more slice of pizza"—the first slice vs the fifth.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-econ-5',
    course_id: 'econ202',
    concept_id: 'supply-demand',
    prompt: 'The law of supply states that, all else equal:',
    choices: [
      { id: 'a', text: 'Higher price leads to lower quantity supplied' },
      { id: 'b', text: 'Higher price leads to higher quantity supplied' },
      { id: 'c', text: 'Supply is always fixed' },
      { id: 'd', text: 'Price equals cost' },
    ],
    correct_answer_id: 'b',
    rationale: 'Producers supply more when they can get a higher price.',
    misconception_hint: 'Supply curve slopes up: more quantity supplied at higher prices.',
    difficulty: 1,
    source_anchors: [],
  },
  // ENG 215
  {
    id: 'q-eng-1',
    course_id: 'eng215',
    concept_id: 'literary-analysis',
    prompt: 'Close reading emphasizes:',
    choices: [
      { id: 'a', text: 'Summarizing the plot only' },
      { id: 'b', text: 'Careful analysis of diction, imagery, and structure to understand meaning' },
      { id: 'c', text: 'The author\'s biography only' },
      { id: 'd', text: 'Ignoring the text' },
    ],
    correct_answer_id: 'b',
    rationale: 'Close reading focuses on how the text creates meaning through language and form.',
    misconception_hint: 'Close reading = slow, detailed attention to the words on the page.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-eng-2',
    course_id: 'eng215',
    concept_id: 'literary-analysis',
    prompt: 'A symbol in literature is:',
    choices: [
      { id: 'a', text: 'Only a character' },
      { id: 'b', text: 'An object, character, or event that represents a larger idea or theme' },
      { id: 'c', text: 'The same as the plot' },
      { id: 'd', text: 'Always explicitly stated' },
    ],
    correct_answer_id: 'b',
    rationale: 'Symbols carry meaning beyond their literal presence (e.g. green light = hope/dream).',
    misconception_hint: 'Symbol = something that stands for something else, often thematically.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-eng-3',
    course_id: 'eng215',
    concept_id: 'modernism',
    prompt: 'Modernist literature often features:',
    choices: [
      { id: 'a', text: 'Only traditional rhyme schemes' },
      { id: 'b', text: 'Experimentation, fragmentation, and stream of consciousness' },
      { id: 'c', text: 'No characters' },
      { id: 'd', text: 'Only happy endings' },
    ],
    correct_answer_id: 'b',
    rationale: 'Modernism broke from traditional form and explored inner experience and fragmentation.',
    misconception_hint: 'Modernism = early 20th century, experimental, often disillusioned.',
    difficulty: 3,
    source_anchors: [],
  },
  // Short answer (keyword grading)
  {
    id: 'q-bio-sa-1',
    course_id: 'bio201',
    concept_id: 'cell-membrane',
    type: 'short_answer',
    prompt: 'In one short phrase, what does "selectively permeable" mean for the cell membrane?',
    correct_keywords: ['select', 'choose', 'control', 'regulate', 'what enters', 'what exits', 'some substances', 'certain'],
    rationale: 'Selectively permeable means the membrane controls which substances can enter or leave the cell.',
    misconception_hint: 'Think about the membrane "choosing" or "controlling" what passes through.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-psych-sa-1',
    course_id: 'psych101',
    concept_id: 'memory',
    type: 'short_answer',
    prompt: 'What is the approximate capacity of working memory (number of items)?',
    correct_keywords: ['7', 'five', '5', 'nine', '9', '7±2', 'seven', '6', '8'],
    rationale: 'Working memory holds about 7±2 items (Miller\'s magic number).',
    misconception_hint: 'It\'s a small number—think "magic number" from research.',
    difficulty: 2,
    source_anchors: [],
  },
  {
    id: 'q-econ-sa-1',
    course_id: 'econ202',
    concept_id: 'supply-demand',
    type: 'short_answer',
    prompt: 'When price goes up, what happens to quantity supplied (in one word or short phrase)?',
    correct_keywords: ['increase', 'increases', 'higher', 'more', 'goes up', 'rises'],
    rationale: 'The law of supply: higher price leads to higher quantity supplied.',
    misconception_hint: 'Supply curve slopes up—producers supply more when price is higher.',
    difficulty: 1,
    source_anchors: [],
  },
];

/** Slug from topic name for concept_id match (e.g. "Cell Membrane" -> "cell-membrane"). */
function topicNameToConceptId(name) {
  return name.toLowerCase().replace(/\s+/g, '-');
}

/** Recommended concept IDs: lowest mastery topic(s) for a course. count = 1 for focus, 2–3 for mixed. */
export function getRecommendedConceptIds(course, count = 1) {
  if (!course?.masteryTopics?.length) return [];
  const sorted = [...course.masteryTopics].sort((a, b) => a.mastery - b.mastery);
  return sorted.slice(0, count).map((t) => topicNameToConceptId(t.name));
}

/** Get questions for a practice session.
 * course: { id } or null for all.
 * options: { conceptIds?: string[], limit?: number, mixConcepts?: number }
 * - conceptIds: focus on these concepts; if fewer than limit questions, fill from pool.
 * - mixConcepts: sample from up to this many concepts (e.g. 2 for mixed session).
 */
export function getQuestionsForSession(course, options = {}) {
  const limit = options.limit ?? 5;
  const pool = course?.id
    ? questionBank.filter((q) => q.course_id === course.id)
    : questionBank;

  if (options.conceptIds?.length) {
    const focused = pool.filter((q) => options.conceptIds.includes(q.concept_id));
    const shuffled = [...focused].sort(() => Math.random() - 0.5);
    let out = shuffled.slice(0, limit);
    if (out.length < limit) {
      const rest = pool.filter((q) => !options.conceptIds.includes(q.concept_id));
      const restShuffled = [...rest].sort(() => Math.random() - 0.5);
      out = [...out, ...restShuffled.slice(0, limit - out.length)];
    }
    return out.sort(() => Math.random() - 0.5);
  }

  if (options.mixConcepts && options.mixConcepts >= 1) {
    const byConcept = {};
    pool.forEach((q) => {
      if (!byConcept[q.concept_id]) byConcept[q.concept_id] = [];
      byConcept[q.concept_id].push(q);
    });
    const conceptIds = Object.keys(byConcept).sort(() => Math.random() - 0.5).slice(0, options.mixConcepts);
    const perConcept = Math.ceil(limit / conceptIds.length);
    const selected = [];
    conceptIds.forEach((cid) => {
      const qs = [...(byConcept[cid] || [])].sort(() => Math.random() - 0.5).slice(0, perConcept);
      selected.push(...qs);
    });
    return selected.sort(() => Math.random() - 0.5).slice(0, limit);
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(limit, shuffled.length));
}

/** Grade short answer by keyword match (any keyword present = correct; case-insensitive).
 * Returns { correct, matched, missing } for feedback when wrong. */
export function gradeShortAnswer(userText, question) {
  if (!question?.correct_keywords?.length) return { correct: false, matched: [], missing: [] };
  const text = (userText || '').trim().toLowerCase();
  const keywords = question.correct_keywords.map((kw) => kw.toLowerCase());
  const matched = keywords.filter((kw) => text.includes(kw));
  const missing = keywords.filter((kw) => !text.includes(kw));
  return { correct: matched.length > 0, matched, missing };
}

/** Simple session id for prototype (audit-style). */
export function createSessionId() {
  return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
