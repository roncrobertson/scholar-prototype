/**
 * Concept Decomposer output: one concept → list of testable atomic attributes.
 * Academic quality: core_concept (simple but explanatory), key terms (attributes),
 * high_yield_distinctions, exam_summary (one sentence).
 * Optional: image_story (DALL·E prompt), recall_story (one sentence), mnemonic_narrative (2–4 sentences linking each visual to its concept; shown in legend when present).
 */
export const conceptDecompositions = {
  'cell-membrane': {
    concept: 'Cell Membrane',
    domain: 'biology',
    core_concept:
      'The cell membrane is a dynamic, selectively permeable barrier that regulates what enters and exits the cell, supports signaling, and maintains cellular identity.',
    summary: 'The outer boundary of the cell; a phospholipid bilayer that controls what enters and exits (selective permeability).',
    exam_summary: 'The cell membrane maintains cellular homeostasis by controlling molecular movement and communication.',
    high_yield_distinctions: [
      'Passive vs active transport — energy requirement is the key difference.',
      'Integral vs peripheral proteins — embedded in the bilayer vs loosely attached.',
    ],
    image_story:
      'One scene: a single jail cell with one stretchy membrane door in the center (the Jail Membrane). Show the action: two or three tiny, translucent ghost-like figures slipping through the stretchy door; one massive, hulking giant stuck outside, unable to squeeze through. Only these elements: jail cell, stretchy door, ghost-like figures going through, giant blocked outside. Empty, minimal background. Do not draw: lab, shelves, beakers, workers, people in uniforms, traffic cones, barrels, DNA, clock, signs, or any text. One room, one door, no split panels.',
    recall_story: 'The stretchy jail door (Jail Membrane) controls who gets in—small figures slip through, the larger one stays out; that\'s selective permeability.',
    attributes: [
      { type: 'structure', value: 'phospholipid bilayer: amphipathic lipids build a barrier (hydrophobic core, hydrophilic surfaces)', visual_mnemonic: 'wall' },
      { type: 'mechanism', value: 'selective permeability — small nonpolar pass freely; ions/polar need channels or carriers', visual_mnemonic: 'small figures pass through door; large figure blocked', priority: 'primary' },
      { type: 'location', value: 'surrounds the cell', visual_mnemonic: 'jail bars or frame encircling the figure' },
      { type: 'effect', value: 'fluid mosaic — proteins float in lipid bilayer; diffusion and active transport', visual_mnemonic: 'stretchy, flexible door that can bend' },
    ],
  },
  'protein-synthesis': {
    concept: 'Protein Synthesis',
    domain: 'biology',
    core_concept:
      'Protein synthesis is how genes become proteins: DNA is transcribed to mRNA in the nucleus, and mRNA is translated into protein at the ribosome (central dogma).',
    summary: 'DNA is transcribed to mRNA in the nucleus; mRNA is translated into protein at the ribosome. Central dogma: genes → proteins.',
    exam_summary: 'Genes code for proteins via transcription (DNA → mRNA) and translation (mRNA → protein at the ribosome).',
    high_yield_distinctions: [
      'Transcription vs translation — nucleus vs cytoplasm; DNA→RNA vs RNA→protein.',
      'Ribosome = site of translation; mRNA is the template.',
    ],
    image_story:
      'One scene: a chef in a kitchen (Proteen) holding a recipe card (mRNA), cooking at the counter (ribosome) to make one dish (protein). Recipe, card, chef, and dish all in the same kitchen. No split panels.',
    recall_story: 'The chef (Proteen) copies the recipe onto a card, then cooks at the counter to make the dish—that\'s DNA to mRNA to protein.',
    attributes: [
      { type: 'mechanism', value: 'DNA → mRNA (transcription); mRNA → protein (translation)', priority: 'primary', visual_mnemonic: 'chef copying recipe onto card, then cooking at counter' },
      { type: 'location', value: 'nucleus (transcription); ribosome/cytoplasm (translation)', visual_mnemonic: 'recipe book in one room, kitchen counter in another' },
      { type: 'class', value: 'central dogma', visual_mnemonic: 'recipe → card → dish flow' },
      { type: 'effect', value: 'genes code for proteins', visual_mnemonic: 'one finished dish on the counter' },
    ],
  },
  'cell-division': {
    concept: 'Mitosis (PMAT)',
    domain: 'biology',
    core_concept:
      'Mitosis is the process by which a somatic cell divides its nucleus to produce two genetically identical daughter cells, preserving chromosome number (M phase of the cell cycle).',
    summary: 'Eukaryotic cell division: one cell becomes two identical daughter cells. Phases: Prophase (pair), Metaphase (middle), Anaphase (apart), Telophase (two).',
    exam_summary: 'Mitosis ensures growth and tissue repair by equally distributing duplicated chromosomes into two identical cells.',
    high_yield_distinctions: [
      'Mitosis vs meiosis — mitosis preserves diploid number; meiosis reduces it and creates diversity.',
      'Somatic vs germ cells — mitosis occurs in somatic cells only.',
    ],
    image_story:
      'One scene: two cartoon cells doing a simple dance on a single stage. First they partner up (pair), then meet in the middle, then step apart, then split into two separate cells. One continuous stage, no dividers or panels.',
    attributes: [
      { type: 'mechanism', value: 'Prophase—pair; Metaphase—middle; Anaphase—apart; Telophase—two (PMAT)', priority: 'primary', visual_mnemonic: 'two cells dancing: partner up, meet middle, step apart, split into two' },
      { type: 'effect', value: 'one cell becomes two identical daughter cells', visual_mnemonic: 'two separate cells where there was one' },
      { type: 'class', value: 'eukaryotic cell division; somatic cells', visual_mnemonic: 'stage with one then two cells' },
    ],
  },
  'cell-signaling': {
    concept: 'Cell Signaling',
    domain: 'biology',
    core_concept:
      'Cell signaling is how cells receive and respond to signals: a signal molecule binds a receptor on the cell surface, triggering a cascade inside the cell that amplifies the response.',
    summary: 'A signal molecule binds a receptor on the cell surface, triggering a cascade inside the cell. One signal can produce a large response.',
    exam_summary: 'One signal binds a receptor and triggers an intracellular cascade, producing an amplified response.',
    high_yield_distinctions: [
      'Receptor on surface vs inside — many hormones bind surface receptors; steroid receptors can be nuclear.',
      'Amplification — one signal molecule can activate many downstream effectors.',
    ],
    image_story:
      'One scene: a cartoon cell with a doorbell on its surface. A small figure rings the doorbell; the cell lights up or reacts. One cell, one doorbell, one ring—all in the same frame.',
    attributes: [
      { type: 'mechanism', value: 'signal molecule binds receptor → cascade inside cell', priority: 'primary', visual_mnemonic: 'small figure ringing doorbell on cell; cell lights up' },
      { type: 'receptor', value: 'receptor on cell surface', visual_mnemonic: 'doorbell on the cell surface' },
      { type: 'effect', value: 'one signal, amplified response', visual_mnemonic: 'one ring, whole cell reacting' },
    ],
  },
  memory: {
    concept: 'Working Memory',
    domain: 'psychology',
    encoding_mode: 'characterization_only',
    core_concept:
      'Working memory is the system that holds and manipulates information briefly (e.g. a phone number while dialing). It has limited capacity (~7±2 items) and is linked to the frontal lobe and executive function.',
    summary: 'Holds and manipulates information briefly. Limited capacity (~7±2 items); involved in reasoning, planning, and holding a phone number in mind.',
    exam_summary: 'Working memory holds a limited amount of information briefly for manipulation; capacity is about 7±2 items.',
    high_yield_distinctions: [
      'Working memory vs long-term memory — temporary hold vs lasting storage.',
      'Central executive — controls attention and coordinates the phonological loop and visuospatial sketchpad.',
    ],
    image_story:
      'One scene: a small desk (memo board) with exactly seven sticky notes or items on it. One person at the desk. When too many items appear, one falls off. One desk, one room, no dividers.',
    attributes: [
      { type: 'mechanism', value: 'holds and manipulates info briefly', priority: 'primary', visual_mnemonic: 'person at desk with sticky notes' },
      { type: 'effect', value: 'capacity ~7±2 items', visual_mnemonic: 'exactly seven items on desk; one falls off when more appear' },
      { type: 'location', value: 'frontal lobe / executive', visual_mnemonic: 'desk in center of room' },
    ],
  },
  learning: {
    concept: 'Classical vs Operant Conditioning',
    domain: 'psychology',
    core_concept:
      'Classical conditioning is learning by association (e.g. Pavlov: bell + food → salivation to bell alone). Operant conditioning is learning by consequence — behavior is reinforced or punished.',
    summary: 'Classical: learning by association (Pavlov—bell + food). Operant: learning by consequence (behavior → reward or punishment).',
    exam_summary: 'Classical = stimulus–stimulus association; operant = behavior–consequence (reinforcement or punishment).',
    high_yield_distinctions: [
      'Classical: involuntary, automatic (e.g. fear, salivation). Operant: voluntary behavior shaped by consequences.',
      'Reinforcement increases behavior; punishment decreases it.',
    ],
    attributes: [
      { type: 'class', value: 'Classical: stimulus–stimulus (Pavlov); Operant: behavior–consequence', visual_mnemonic: 'bell + food (Pavlov); kid cleans room → allowance' },
      { type: 'mechanism', value: 'Classical = automatic; Operant = action matters', visual_mnemonic: 'dog drools at bell; kid chooses action for reward' },
    ],
  },
  elasticity: {
    concept: 'Elasticity of Demand',
    domain: 'economics',
    core_concept:
      'Elasticity of demand measures how much quantity demanded changes when price changes. Elastic demand means quantity is very responsive to price; inelastic means quantity barely moves.',
    summary: 'How much quantity demanded changes when price changes. Elastic demand = quantity is very responsive to price; inelastic = quantity barely moves.',
    exam_summary: 'Elasticity of demand describes how responsive quantity demanded is to a change in price.',
    high_yield_distinctions: [
      'Elastic vs inelastic — elastic: big % change in quantity; inelastic: small % change in quantity.',
      'Substitutes and time horizon — more substitutes or longer time → more elastic.',
    ],
    image_story:
      'One scene: a large elastic band (rubber band) in the center of a simple marketplace. When the band stretches a lot, a sign or arrow says elastic; when it barely moves, a sign says inelastic. One band, one setting, no split panels.',
    attributes: [
      { type: 'mechanism', value: 'responsiveness of quantity demanded to price', visual_mnemonic: 'rubber band stretches when price pulls' },
      { type: 'effect', value: 'elastic = big quantity change; inelastic = small change', visual_mnemonic: 'elastic band stretches a lot; stiff rope barely moves' },
    ],
  },
  'supply-demand': {
    concept: 'Consumer Surplus',
    domain: 'economics',
    core_concept:
      'Consumer surplus is the difference between what you were willing to pay for a good and what you actually paid. It is shown as the area under the demand curve and above the market price.',
    summary: 'The difference between what you were willing to pay and what you actually paid. Shown as the area under the demand curve and above the price.',
    exam_summary: 'Consumer surplus is the gain to consumers from paying less than their maximum willingness to pay.',
    high_yield_distinctions: [
      'Consumer vs producer surplus — consumer = above price, under demand; producer = below price, above supply.',
      'Price ceiling can increase consumer surplus (if binding); price floor can decrease it.',
    ],
    attributes: [
      { type: 'mechanism', value: 'willingness to pay minus actual price', visual_mnemonic: 'gap between max you would pay and price tag' },
      { type: 'effect', value: 'area under demand curve above price', visual_mnemonic: 'shaded triangle under curve above price line' },
    ],
  },
  'market-structures': {
    concept: 'Monopoly',
    domain: 'economics',
    core_concept:
      'A monopoly is a market with one seller, no close substitutes, and high barriers to entry. The monopolist is a price maker (sets price) rather than a price taker.',
    summary: 'One seller, no close substitutes, high barriers to entry. The firm is a price maker (sets price) rather than a price taker.',
    exam_summary: 'A monopoly has market power: one seller, no close substitutes, and the ability to set price.',
    high_yield_distinctions: [
      'Monopoly vs perfect competition — monopoly sets P > MC; competition takes P = MC.',
      'Barriers to entry — economies of scale, patents, control of inputs — keep competitors out.',
    ],
    image_story:
      'One scene: a single castle with one bridge across a moat. One gatekeeper sets the toll. No other bridges or paths visible. One castle, one bridge, one scene.',
    attributes: [
      { type: 'class', value: 'one seller', visual_mnemonic: 'single castle on the hill' },
      { type: 'mechanism', value: 'high barriers to entry; no close substitutes', visual_mnemonic: 'moat and one bridge; no other paths' },
      { type: 'effect', value: 'price maker', visual_mnemonic: 'gatekeeper sets the toll' },
    ],
  },
  // ENG 215 — ensure literary-analysis and modernism have full academic fields
  'literary-analysis': {
    concept: 'Symbol in Literature',
    domain: 'literature',
    core_concept:
      'A symbol in literature is one object, image, or event that stands for a larger idea or theme. It adds layers of meaning beyond the literal (e.g. the green light in Gatsby = hope, the American Dream).',
    summary: 'One thing that stands for something bigger. Objects and images carry thematic meaning beyond the literal.',
    exam_summary: 'A symbol is a concrete object or image that represents an abstract idea or theme.',
    high_yield_distinctions: [
      'Symbol vs metaphor — symbol recurs and carries thematic weight; metaphor is a direct comparison.',
      'Context determines meaning — the same object can symbolize different things in different works.',
    ],
    attributes: [
      { type: 'class', value: 'one object stands for a bigger idea', visual_mnemonic: 'one object (e.g. green light) pointing to bigger idea' },
      { type: 'effect', value: 'adds thematic depth; reader interprets', visual_mnemonic: 'layers of meaning behind the object' },
    ],
  },
  modernism: {
    concept: 'Modernism',
    domain: 'literature',
    core_concept:
      'Modernism is a literary and cultural movement (roughly early 20th century) that broke with traditional form: fragmentation, stream of consciousness, disillusionment, and experimentation with narrative.',
    summary: 'Broke traditional form; fragments, stream of consciousness, disillusionment.',
    exam_summary: 'Modernism rejected traditional narrative and form in favor of fragmentation and subjective experience.',
    high_yield_distinctions: [
      'Modernism vs realism — modernism fragments plot and consciousness; realism aims for coherent, objective representation.',
      'Key traits: stream of consciousness, unreliable narrator, allusion, ambiguity.',
    ],
    attributes: [
      { type: 'class', value: 'fragmentation; break from tradition', visual_mnemonic: 'broken mirror or shattered frame' },
      { type: 'effect', value: 'stream of consciousness; disillusionment', visual_mnemonic: 'flowing thought bubbles; faded ideals' },
    ],
  },
  // ——— BIO 201 (expand to 10) ———
  osmosis: {
    concept: 'Osmosis',
    domain: 'biology',
    core_concept: 'Osmosis is the passive diffusion of water across a selectively permeable membrane from a region of lower solute concentration to higher solute concentration.',
    summary: 'Water moves across a membrane toward higher solute concentration; passive, no energy.',
    exam_summary: 'Osmosis is passive movement of water across a membrane down its concentration gradient.',
    high_yield_distinctions: ['Osmosis vs diffusion — osmosis is water only; diffusion is solute movement.', 'Hypotonic vs hypertonic — water enters in hypotonic, exits in hypertonic.'],
    attributes: [
      { type: 'mechanism', value: 'passive diffusion of water only', visual_mnemonic: 'water droplets crossing a membrane' },
      { type: 'effect', value: 'water moves toward higher solute concentration', visual_mnemonic: 'water flowing toward the salty side' },
    ],
  },
  'cellular-respiration': {
    concept: 'Cellular Respiration',
    domain: 'biology',
    core_concept: 'Cellular respiration is the process by which cells break down glucose (and other fuels) to produce ATP, with CO₂ and H₂O as waste. Key stages: glycolysis, Krebs cycle, electron transport chain.',
    summary: 'Glucose → ATP + CO₂ + H₂O. Glycolysis, Krebs, ETC. Occurs in mitochondria.',
    exam_summary: 'Cellular respiration converts glucose to ATP via glycolysis, Krebs cycle, and oxidative phosphorylation.',
    high_yield_distinctions: ['Aerobic vs anaerobic — aerobic uses O₂ and yields more ATP; anaerobic (fermentation) does not.', 'Glycolysis in cytoplasm; Krebs and ETC in mitochondria.'],
    attributes: [
      { type: 'mechanism', value: 'glycolysis → Krebs → ETC; glucose to ATP', visual_mnemonic: 'glucose entering factory; ATP and exhaust leaving' },
      { type: 'location', value: 'cytoplasm (glycolysis); mitochondria (Krebs, ETC)', visual_mnemonic: 'first room then powerhouse' },
      { type: 'effect', value: 'ATP produced; CO₂ and H₂O released', visual_mnemonic: 'ATP coins and CO₂/H₂O exhaust' },
    ],
  },
  photosynthesis: {
    concept: 'Photosynthesis',
    domain: 'biology',
    core_concept: 'Photosynthesis is how plants (and some microbes) convert light energy into chemical energy (glucose), using CO₂ and H₂O and releasing O₂. Light reactions and Calvin cycle.',
    summary: 'Light + CO₂ + H₂O → glucose + O₂. Light reactions (thylakoid); Calvin cycle (stroma).',
    exam_summary: 'Photosynthesis converts light energy to chemical energy (glucose) and releases O₂.',
    high_yield_distinctions: ['Light reactions capture light; Calvin cycle fixes CO₂ into sugar.', 'Occurs in chloroplasts; chlorophyll absorbs light.'],
    attributes: [
      { type: 'mechanism', value: 'light reactions + Calvin cycle', visual_mnemonic: 'Sun and factory assembly line (light + dark reactions)' },
      { type: 'location', value: 'chloroplasts (thylakoid, stroma)', visual_mnemonic: 'Green factory building' },
      { type: 'effect', value: 'glucose and O₂ produced', visual_mnemonic: 'Sugar packets and oxygen bubbles leaving the factory' },
    ],
  },
  'dna-replication': {
    concept: 'DNA Replication',
    domain: 'biology',
    core_concept: 'DNA replication is the semi-conservative process by which DNA is copied before cell division. Each strand serves as a template; enzymes (helicase, polymerase, ligase) unwind, copy, and seal.',
    summary: 'Semi-conservative: each new double helix has one old and one new strand. Helicase, polymerase, ligase.',
    exam_summary: 'DNA replication is semi-conservative and produces two identical double helices.',
    high_yield_distinctions: ['Semi-conservative — each daughter molecule has one parental and one new strand.', 'Leading strand continuous; lagging strand Okazaki fragments.'],
    attributes: [
      { type: 'mechanism', value: 'helicase unwinds; polymerase synthesizes; ligase seals', visual_mnemonic: 'zipper unzipping; two sides copied; zipper closing' },
      { type: 'class', value: 'semi-conservative', visual_mnemonic: 'each new helix has one old strand, one new' },
      { type: 'effect', value: 'two identical DNA molecules', visual_mnemonic: 'two identical zippers where there was one' },
    ],
  },
  enzymes: {
    concept: 'Enzymes',
    domain: 'biology',
    core_concept: 'Enzymes are biological catalysts that speed up reactions by lowering activation energy. They are specific to substrates (lock-and-key or induced fit) and can be affected by pH, temperature, and inhibitors.',
    summary: 'Catalysts that lower activation energy; substrate-specific; affected by pH, temperature, inhibitors.',
    exam_summary: 'Enzymes catalyze reactions by lowering activation energy and are substrate-specific.',
    high_yield_distinctions: ['Competitive vs noncompetitive inhibition — competitive binds active site; noncompetitive binds elsewhere.', 'Denaturation — high heat or wrong pH destroys enzyme shape and function.'],
    attributes: [
      { type: 'mechanism', value: 'lower activation energy; lock-and-key or induced fit', visual_mnemonic: 'key fitting lock; reaction hill lowered' },
      { type: 'effect', value: 'speed up reactions; specific to substrate', visual_mnemonic: 'one key for one lock; reaction speeds up' },
    ],
  },
  'cell-cycle': {
    concept: 'Cell Cycle',
    domain: 'biology',
    core_concept: 'The cell cycle is the ordered sequence of events from one cell division to the next: G₁, S (DNA replication), G₂, and M (mitosis). Checkpoints ensure DNA is intact before division.',
    summary: 'G₁ → S (replication) → G₂ → M (mitosis). Checkpoints prevent division if DNA is damaged.',
    exam_summary: 'The cell cycle includes interphase (G₁, S, G₂) and mitosis; checkpoints regulate progression.',
    high_yield_distinctions: ['S phase — DNA replication; M phase — mitosis.', 'p53 and other checkpoint proteins halt cycle if DNA is damaged.'],
    attributes: [
      { type: 'mechanism', value: 'G₁, S, G₂, M; checkpoints', visual_mnemonic: 'Spokes labeled G1, S, G2, M; checkpoint signs' },
      { type: 'effect', value: 'ordered growth and division', visual_mnemonic: 'Wheel turning one full rotation' },
    ],
  },
  // ——— PSYCH 101 (expand to 10) ———
  encoding: {
    concept: 'Encoding',
    domain: 'psychology',
    core_concept: 'Encoding is the process of transforming sensory input into a form that can be stored in memory. Elaborative encoding (linking to existing knowledge) improves retention.',
    summary: 'Turning experience into a storable memory. Elaborative encoding strengthens retention.',
    exam_summary: 'Encoding is the process of putting information into memory; elaboration improves recall.',
    high_yield_distinctions: ['Encoding vs retrieval — encoding is putting in; retrieval is getting out.', 'Visual, acoustic, and semantic encoding — semantic is typically strongest.'],
    image_story:
      'One scene: a hand writing on a blank yellow sticky note and sticking it to a bulletin board. The sticky note is completely blank—no letters or words. In the foreground: the action of writing and sticking (transform input into storable form). To the right: two or three small figures linking hands or connected by a line, suggesting connections and retention. Relatable indoor scene. No text or numbers on any note, board, or surface. No split panels.',
    recall_story: 'You write on a sticky note and stick it up (encode), so the input becomes storable and elaborative encoding improves retention.',
    attributes: [
      { type: 'mechanism', value: 'transform input into storable form', visual_mnemonic: 'hand writing on sticky note and sticking to board' },
      { type: 'effect', value: 'elaborative encoding improves retention', visual_mnemonic: 'figures linking hands; connections to board' },
    ],
  },
  retrieval: {
    concept: 'Retrieval',
    domain: 'psychology',
    core_concept: 'Retrieval is the process of accessing stored information. Recall (producing the info) vs recognition (identifying it). Context and cues aid retrieval.',
    summary: 'Getting information out of memory. Recall vs recognition; context-dependent memory.',
    exam_summary: 'Retrieval is accessing stored information; cues and context improve retrieval.',
    high_yield_distinctions: ['Recall vs recognition — recall is harder (e.g. essay); recognition is easier (e.g. multiple choice).', 'Encoding specificity — retrieval is better when context matches encoding.'],
    attributes: [
      { type: 'mechanism', value: 'accessing stored information', visual_mnemonic: 'opening filing cabinet to get memory out' },
      { type: 'effect', value: 'recall vs recognition; cues help', visual_mnemonic: 'producing from scratch vs spotting in a lineup' },
    ],
  },
  schema: {
    concept: 'Schema',
    domain: 'psychology',
    core_concept: 'A schema is a mental framework that organizes and interprets information. Schemas guide perception and memory; they can also lead to stereotyping or distortion.',
    summary: 'Mental framework for organizing knowledge. Guides perception and memory; can distort.',
    exam_summary: 'Schemas are mental structures that organize knowledge and influence perception and memory.',
    high_yield_distinctions: ['Schema-consistent information is remembered better; inconsistent info may be distorted to fit.', 'Scripts are schemas for events (e.g. going to a restaurant).'],
    attributes: [
      { type: 'class', value: 'mental framework', visual_mnemonic: 'filing folder that organizes knowledge' },
      { type: 'effect', value: 'organizes knowledge; can bias perception and memory', visual_mnemonic: 'folder shapes what we see and remember' },
    ],
  },
  'cognitive-dissonance': {
    concept: 'Cognitive Dissonance',
    domain: 'psychology',
    core_concept: 'Cognitive dissonance is the discomfort felt when holding conflicting beliefs or when behavior contradicts beliefs. People reduce it by changing beliefs, behavior, or rationalizing.',
    summary: 'Discomfort from conflicting beliefs or behavior. Reduced by changing belief, behavior, or rationalizing.',
    exam_summary: 'Cognitive dissonance is tension from inconsistency; people reduce it by changing attitudes or behavior.',
    high_yield_distinctions: ['Festinger — we are motivated to reduce dissonance.', 'Justification of effort — we value what we work hard for.'],
    image_story:
      'One scene: two gears grinding against each other in the center (Dissonance = conflict). One character or hand adjusts one gear so they mesh—reducing discomfort. Relatable indoor or mechanical scene. No split panels.',
    recall_story: 'Two gears grind (conflict); when one is adjusted they mesh—that’s reducing cognitive dissonance by changing belief or behavior.',
    attributes: [
      { type: 'mechanism', value: 'conflict between beliefs or between belief and behavior', visual_mnemonic: 'two gears grinding against each other' },
      { type: 'effect', value: 'motivation to reduce discomfort (change belief or behavior)', visual_mnemonic: 'person adjusting one gear to stop grinding' },
    ],
  },
  attachment: {
    concept: 'Attachment',
    domain: 'psychology',
    core_concept: 'Attachment is the emotional bond between infant and caregiver. Secure attachment supports exploration and resilience; insecure (avoidant, anxious, disorganized) is linked to stress and later relationship patterns.',
    summary: 'Bond between infant and caregiver. Secure vs insecure (avoidant, anxious, disorganized).',
    exam_summary: 'Attachment is the infant–caregiver bond; secure attachment predicts better outcomes.',
    high_yield_distinctions: ['Strange Situation — Ainsworth; measures secure vs insecure.', 'Secure base — caregiver as safe haven for exploration.'],
    attributes: [
      { type: 'class', value: 'secure vs insecure attachment', visual_mnemonic: 'infant and caregiver bond; safe base' },
      { type: 'effect', value: 'influences exploration, stress response, later relationships', visual_mnemonic: 'child exploring from safe base or clinging' },
    ],
  },
  'developmental-stages': {
    concept: 'Developmental Stages',
    domain: 'psychology',
    core_concept: 'Developmental theories (e.g. Piaget, Erikson) describe stages of cognitive and psychosocial development. Piaget: sensorimotor, preoperational, concrete operational, formal operational. Erikson: trust vs mistrust through integrity vs despair.',
    summary: 'Piaget: cognitive stages. Erikson: psychosocial stages. Order is relatively fixed.',
    exam_summary: 'Development proceeds through stages (e.g. Piaget, Erikson) that build on prior stages.',
    high_yield_distinctions: ['Piaget — focus on cognition; Erikson — focus on identity and social tasks.', 'Stages are sequential but ages can vary.'],
    attributes: [
      { type: 'mechanism', value: 'sequential stages (Piaget, Erikson)', visual_mnemonic: 'staircase of stages; order fixed' },
      { type: 'effect', value: 'cognitive and psychosocial milestones', visual_mnemonic: 'landmarks at each step' },
    ],
  },
  neuroplasticity: {
    concept: 'Neuroplasticity',
    domain: 'psychology',
    core_concept: 'Neuroplasticity is the brain’s ability to reorganize by forming new neural connections and pruning unused ones. It underlies learning, recovery from injury, and adaptation.',
    summary: 'Brain can rewire: new connections, pruning. Learning and recovery depend on it.',
    exam_summary: 'Neuroplasticity is the brain’s ability to change structure and function in response to experience.',
    high_yield_distinctions: ['Use-dependent — “use it or lose it”; practice strengthens pathways.', 'Critical periods — some plasticity is greatest early in life.'],
    image_story:
      'One scene: a brain made of clay in the center, with a hand or tool actively reshaping or sculpting it (new connections and pruning). In the foreground: the action of cutting or molding. To the right: visible result—learning, recovery, or adaptation suggested by the changed shape. Relatable indoor workspace. No split panels.',
    recall_story: "The hand reshapes the clay brain, so new connections form and old ones are pruned—that's learning, recovery, and adaptation.",
    attributes: [
      { type: 'mechanism', value: 'new connections; pruning', visual_mnemonic: 'clay brain being sculpted; new wires and cuts' },
      { type: 'effect', value: 'learning, recovery, adaptation', visual_mnemonic: 'brain shape changing; learning and recovery' },
    ],
  },
  perception: {
    concept: 'Perception',
    domain: 'psychology',
    core_concept: 'Perception is the process of organizing and interpreting sensory input to give it meaning. Bottom-up (data-driven) and top-down (expectation-driven) processing both play a role.',
    summary: 'Interpreting sensation into meaningful experience. Bottom-up and top-down processing.',
    exam_summary: 'Perception is the interpretation of sensory information; it is influenced by context and expectations.',
    high_yield_distinctions: ['Sensation vs perception — sensation is raw input; perception is interpretation.', 'Gestalt principles — we organize stimuli into wholes (proximity, similarity, closure).'],
    image_story:
      'One scene: a large eye and a light bulb in the center (Perception = “see” + “interpret”). The eye receives raw input; the light bulb lights up as meaning is made. One or two simple shapes suggesting data flowing up and expectations flowing down. Relatable indoor scene. No split panels.',
    recall_story: 'The eye takes in raw input and the light bulb turns on—that’s perception: organizing and interpreting sensation into meaning.',
    attributes: [
      { type: 'mechanism', value: 'organize and interpret sensory input', visual_mnemonic: 'eye and light bulb; making sense of input' },
      { type: 'effect', value: 'bottom-up and top-down; Gestalt principles', visual_mnemonic: 'data flowing up; expectations flowing down; whole shapes' },
    ],
  },
  // ——— ECON 202 (expand to 10) ———
  'supply-and-demand': {
    concept: 'Supply and Demand',
    domain: 'economics',
    core_concept: 'Supply and demand are the forces that determine market price and quantity. Demand: quantity buyers want at each price. Supply: quantity sellers offer. Equilibrium is where supply meets demand.',
    summary: 'Demand and supply curves; equilibrium where they cross. Surpluses and shortages move price.',
    exam_summary: 'Market price and quantity are determined by the intersection of supply and demand.',
    high_yield_distinctions: ['Surplus — price above equilibrium; shortage — price below.', 'Shifts in demand or supply change equilibrium price and quantity.'],
    image_story:
      'One scene: two clear curves (one demand, one supply) crossing in an X in the center. The crossing point is emphasized—equilibrium. Marketplace or simple diagram-style scene. No split panels.',
    recall_story: 'Two curves cross at one point—that’s supply and demand meeting at equilibrium price and quantity.',
    attributes: [
      { type: 'mechanism', value: 'demand curve and supply curve', visual_mnemonic: 'two curves crossing' },
      { type: 'effect', value: 'equilibrium price and quantity', visual_mnemonic: 'X where curves meet' },
    ],
  },
  'marginal-utility': {
    concept: 'Marginal Utility',
    domain: 'economics',
    core_concept: 'Marginal utility is the additional satisfaction from consuming one more unit of a good. Diminishing marginal utility: each extra unit adds less satisfaction. Consumers maximize utility when MU per dollar is equal across goods.',
    summary: 'Extra satisfaction from one more unit. Diminishes with quantity; equalize MU per dollar.',
    exam_summary: 'Marginal utility is the added satisfaction from one more unit; it typically diminishes.',
    high_yield_distinctions: ['Diminishing MU — first slice of pizza gives more satisfaction than the fifth.', 'Utility maximization — spend so that MU/P is equal across goods.'],
    attributes: [
      { type: 'mechanism', value: 'additional satisfaction per unit', visual_mnemonic: 'one more slice of pizza' },
      { type: 'effect', value: 'diminishing; equalize MU per dollar', visual_mnemonic: 'first slice big smile; fifth slice small; balance across goods' },
    ],
  },
  'opportunity-cost': {
    concept: 'Opportunity Cost',
    domain: 'economics',
    core_concept: 'Opportunity cost is the value of the next-best alternative forgone when making a choice. It is the true cost of a decision, not just the monetary price.',
    summary: 'Value of the next-best option you give up. Every choice has an opportunity cost.',
    exam_summary: 'Opportunity cost is the value of the best alternative given up when choosing an option.',
    high_yield_distinctions: ['Sunk cost — past cost that should not affect current decisions.', 'Opportunity cost includes time, forgone wages, etc.'],
    attributes: [
      { type: 'mechanism', value: 'next-best alternative forgone', visual_mnemonic: 'fork in road; path not taken' },
      { type: 'effect', value: 'true cost of a decision', visual_mnemonic: 'value of the road you did not take' },
    ],
  },
  gdp: {
    concept: 'GDP',
    domain: 'economics',
    core_concept: 'Gross Domestic Product (GDP) is the total value of final goods and services produced within a country in a period. It can be measured by expenditure (C+I+G+NX) or income.',
    summary: 'Total value of output in a country. C+I+G+NX; real vs nominal.',
    exam_summary: 'GDP measures total production in an economy; real GDP adjusts for inflation.',
    high_yield_distinctions: ['Real vs nominal GDP — real adjusts for inflation.', 'GDP does not include unpaid work, underground economy, or environmental cost.'],
    attributes: [
      { type: 'mechanism', value: 'C + I + G + (X - M)', visual_mnemonic: 'four spending streams adding up' },
      { type: 'effect', value: 'measures output; real vs nominal', visual_mnemonic: 'total output gauge; inflation-adjusted dial' },
    ],
  },
  inflation: {
    concept: 'Inflation',
    domain: 'economics',
    core_concept: 'Inflation is a sustained increase in the general price level. It erodes purchasing power. Causes include demand-pull, cost-push, and monetary expansion. Measured by CPI, PPI.',
    summary: 'Rising general price level. Demand-pull, cost-push; CPI measures it.',
    exam_summary: 'Inflation is a sustained rise in the price level; it reduces purchasing power.',
    high_yield_distinctions: ['Demand-pull — too much spending; cost-push — rising input costs.', 'CPI (consumer), PPI (producer) — common inflation indexes.'],
    attributes: [
      { type: 'mechanism', value: 'demand-pull; cost-push; money supply', visual_mnemonic: 'prices rising; money chasing goods' },
      { type: 'effect', value: 'erodes purchasing power; measured by CPI', visual_mnemonic: 'dollar buying less; CPI gauge' },
    ],
  },
  'fiscal-policy': {
    concept: 'Fiscal Policy',
    domain: 'economics',
    core_concept: 'Fiscal policy is the use of government spending and taxation to influence the economy. Expansionary (increase G or cut T) to boost output; contractionary to cool inflation.',
    summary: 'Government spending and taxes to stabilize economy. Expansionary vs contractionary.',
    exam_summary: 'Fiscal policy uses government spending and taxes to influence aggregate demand.',
    high_yield_distinctions: ['Expansionary — increase spending or cut taxes in recession.', 'Multiplier effect — one dollar of G can increase output by more than one dollar.'],
    attributes: [
      { type: 'mechanism', value: 'government spending and taxation', visual_mnemonic: 'government turning spending and tax dials' },
      { type: 'effect', value: 'influences aggregate demand; multiplier', visual_mnemonic: 'one dollar of G multiplies into more output' },
    ],
  },
  'comparative-advantage': {
    concept: 'Comparative Advantage',
    domain: 'economics',
    core_concept: 'A country has a comparative advantage in producing a good if it can produce it at a lower opportunity cost than another country. Trade benefits both when each specializes in what it does at lower opportunity cost.',
    summary: 'Produce what you give up least to make. Trade benefits both when specializing by comparative advantage.',
    exam_summary: 'Comparative advantage is producing at lower opportunity cost; trade increases total welfare.',
    high_yield_distinctions: ['Comparative vs absolute advantage — comparative is about opportunity cost.', 'Gains from trade — even the “weaker” country gains by specializing.'],
    attributes: [
      { type: 'mechanism', value: 'lower opportunity cost', visual_mnemonic: 'country giving up less to make one good' },
      { type: 'effect', value: 'specialization and gains from trade', visual_mnemonic: 'each country focusing on one good; both gain' },
    ],
  },
  // ——— ENG 215 (expand to 10) ———
  theme: {
    concept: 'Theme',
    domain: 'literature',
    core_concept: 'A theme is the central idea or message of a work—what the author is saying about human nature, society, or life. It is often implied rather than stated directly.',
    summary: 'Central idea or message of a work. Often implied; supported by plot, character, symbol.',
    exam_summary: 'Theme is the central idea or message of a literary work, often implied.',
    high_yield_distinctions: ['Theme vs topic — topic is subject (e.g. love); theme is the claim about it.', 'Themes are supported by evidence from the text.'],
    attributes: [
      { type: 'class', value: 'central idea or message', visual_mnemonic: 'one big idea at the center' },
      { type: 'effect', value: 'implied; woven through plot and character', visual_mnemonic: 'thread running through story' },
    ],
  },
  irony: {
    concept: 'Irony',
    domain: 'literature',
    core_concept: 'Irony is a contrast between expectation and reality. Verbal irony (say one thing, mean another), situational irony (outcome contradicts expectation), dramatic irony (audience knows more than character).',
    summary: 'Contrast between expectation and reality. Verbal, situational, dramatic.',
    exam_summary: 'Irony is a gap between expectation and reality; types include verbal, situational, dramatic.',
    high_yield_distinctions: ['Verbal — sarcasm or saying the opposite of what is meant.', 'Dramatic — audience knows what character does not.'],
    attributes: [
      { type: 'class', value: 'verbal, situational, dramatic', visual_mnemonic: 'say opposite; outcome flips; audience knows more' },
      { type: 'effect', value: 'contrast between expectation and reality', visual_mnemonic: 'expectation vs what actually happens' },
    ],
  },
  narrator: {
    concept: 'Narrator',
    domain: 'literature',
    core_concept: 'The narrator is the voice telling the story. First person (I), second (you), third (he/she); limited vs omniscient. Unreliable narrators distort or withhold truth.',
    summary: 'Voice of the story. First, second, third person; reliable vs unreliable.',
    exam_summary: 'The narrator is the storytelling voice; point of view and reliability shape interpretation.',
    high_yield_distinctions: ['First person — inside one character’s head; third omniscient — knows all.', 'Unreliable narrator — reader must question what is told.'],
    attributes: [
      { type: 'mechanism', value: 'first, second, third person; limited vs omniscient', visual_mnemonic: 'I / you / he; one head or all-seeing eye' },
      { type: 'effect', value: 'shapes what reader knows; unreliable narrator', visual_mnemonic: 'voice that may distort or hide' },
    ],
  },
  metaphor: {
    concept: 'Metaphor',
    domain: 'literature',
    core_concept: 'A metaphor is a figure of speech that directly compares two unlike things without “like” or “as” (that would be simile). It creates meaning by association and imagery.',
    summary: 'Direct comparison without “like” or “as.” Creates meaning by association.',
    exam_summary: 'Metaphor is a direct comparison of two unlike things to suggest similarity.',
    high_yield_distinctions: ['Metaphor vs simile — metaphor is direct (A is B); simile uses “like” or “as.”', 'Extended metaphor — sustained throughout a passage or work.'],
    attributes: [
      { type: 'class', value: 'direct comparison; no like/as', visual_mnemonic: 'A is B; no like or as' },
      { type: 'effect', value: 'imagery and layered meaning', visual_mnemonic: 'one thing standing for another' },
    ],
  },
  genre: {
    concept: 'Genre',
    domain: 'literature',
    core_concept: 'Genre is a category of literature (e.g. tragedy, comedy, romance, satire) with shared conventions, expectations, and forms. Genre shapes how readers interpret a work.',
    summary: 'Category with shared conventions. Tragedy, comedy, satire, etc. Shapes interpretation.',
    exam_summary: 'Genre is a category of literature with shared conventions and reader expectations.',
    high_yield_distinctions: ['Genre conventions — tragedy: downfall; comedy: resolution; satire: critique.', 'Hybrid genres mix conventions (e.g. tragicomedy).'],
    attributes: [
      { type: 'class', value: 'category; conventions', visual_mnemonic: 'tragedy mask, comedy mask; shared rules' },
      { type: 'effect', value: 'shapes expectations and interpretation', visual_mnemonic: 'reader expecting certain pattern' },
    ],
  },
  imagery: {
    concept: 'Imagery',
    domain: 'literature',
    core_concept: 'Imagery is language that appeals to the senses (visual, auditory, tactile, etc.) to create mental pictures and emotional effect. It makes abstract ideas concrete.',
    summary: 'Sensory language that creates mental pictures. Visual, sound, touch, smell, taste.',
    exam_summary: 'Imagery is sensory language that creates vivid mental pictures and emotional response.',
    high_yield_distinctions: ['Imagery supports theme and tone.', 'Concrete imagery — specific details; abstract — general or conceptual.'],
    attributes: [
      { type: 'mechanism', value: 'sensory language', visual_mnemonic: 'words that make you see, hear, touch' },
      { type: 'effect', value: 'mental pictures; mood and theme', visual_mnemonic: 'vivid picture in mind; feeling' },
    ],
  },
  tone: {
    concept: 'Tone',
    domain: 'literature',
    core_concept: 'Tone is the author’s attitude toward the subject or audience—serious, ironic, nostalgic, critical. It is conveyed through word choice, syntax, and context.',
    summary: 'Author’s attitude toward subject or audience. Conveyed by diction and style.',
    exam_summary: 'Tone is the author’s attitude, conveyed through diction and style.',
    high_yield_distinctions: ['Tone vs mood — tone is author’s attitude; mood is feeling in the reader.', 'Tone can shift within a work.'],
    attributes: [
      { type: 'class', value: 'author’s attitude', visual_mnemonic: 'author face toward subject' },
      { type: 'effect', value: 'conveyed by diction, syntax, context', visual_mnemonic: 'word choice and style show attitude' },
    ],
  },
  conflict: {
    concept: 'Conflict',
    domain: 'literature',
    core_concept: 'Conflict is the struggle between opposing forces that drives the plot. Types: person vs person, vs self, vs society, vs nature, vs fate/technology.',
    summary: 'Struggle that drives plot. Person vs person, self, society, nature, fate.',
    exam_summary: 'Conflict is the central struggle in a narrative; it drives the plot.',
    high_yield_distinctions: ['Internal (vs self) vs external (vs others, society, nature).', 'Conflict creates tension and shapes character change.'],
    attributes: [
      { type: 'mechanism', value: 'person vs person, self, society, nature', visual_mnemonic: 'person against another, mirror, crowd, storm' },
      { type: 'effect', value: 'drives plot; tension and change', visual_mnemonic: 'struggle that moves story forward' },
    ],
  },
};

/** Get decomposition for a concept (by concept_id). */
export function getDecomposition(conceptId) {
  return conceptDecompositions[conceptId] || null;
}
