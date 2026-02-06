/**
 * Smart Notes — demo data for AI-generated study notes.
 * Format: one concept per note; what_it_is, why_it_matters, common_confusion.
 * In production this would be an API call with course, topic, context.
 */

const NOTES_BY_COURSE_TOPIC = {
  bio201: {
    'Cell Membrane': {
      concept: 'Selective Permeability',
      smart_note: {
        what_it_is:
          'The cell membrane is selectively permeable: it lets some things through and blocks others. Small, nonpolar molecules (like oxygen and CO₂) pass freely; ions and large polar molecules need channels or pumps. The phospholipid bilayer does the filtering.',
        why_it_matters:
          'Exam questions often ask you to predict what crosses the membrane and how (diffusion vs facilitated diffusion vs active transport). Know which substances need help and why.',
        common_confusion:
          'Students confuse "permeable" with "semi-permeable"—selective permeability means the membrane chooses what passes, not that everything small gets through.',
      },
      by_context: {
        exam: {
          what_it_is:
            'The cell membrane is selectively permeable: it lets some things through and blocks others. Small, nonpolar molecules (like oxygen and CO₂) pass freely; ions and large polar molecules need channels or pumps. The phospholipid bilayer does the filtering.',
          why_it_matters:
            'Exam questions often ask you to predict what crosses the membrane and how (diffusion vs facilitated diffusion vs active transport). Know which substances need help and why.',
          common_confusion:
            'Students confuse "permeable" with "semi-permeable"—selective permeability means the membrane chooses what passes, not that everything small gets through.',
        },
        class: {
          what_it_is:
            'Selective permeability: the membrane lets some things through and blocks others. Listen for: diffusion vs facilitated diffusion vs active transport, and which molecules need channels or pumps.',
          why_it_matters:
            'In class, focus on which substances cross freely (small, nonpolar) vs which need help (ions, large polar). The phospholipid bilayer does the filtering.',
          common_confusion:
            'Don’t mix up "permeable" with "semi-permeable"—selective means the membrane chooses what passes.',
        },
        review: {
          what_it_is:
            'Selective permeability = membrane filters what enters/leaves. Small nonpolar (O₂, CO₂) pass freely; ions and large polar need channels/pumps.',
          why_it_matters:
            'Quick check: predict what crosses and how (diffusion, facilitated, active). Know which need help and why.',
          common_confusion:
            'Permeable vs semi-permeable: selective means the membrane chooses, not that everything small gets through.',
        },
      },
    },
    'Protein Synthesis': {
      concept: 'Transcription vs Translation',
      smart_note: {
        what_it_is:
          'Transcription happens in the nucleus: DNA is copied into mRNA. Translation happens at the ribosome: mRNA is read and amino acids are assembled into a protein. DNA → mRNA → protein. Never the reverse.',
        why_it_matters:
          'You will be asked where each step occurs and what molecule is the template. Central dogma is non-negotiable for any cell bio exam.',
        common_confusion:
          'Mixing up which strand is "read" (template vs coding) and thinking tRNA brings DNA to the ribosome instead of amino acids.',
      },
    },
    'Cell Division': {
      concept: 'Mitosis vs Meiosis',
      smart_note: {
        what_it_is:
          'Mitosis produces two identical diploid daughter cells; meiosis produces four genetically different haploid cells (gametes). Mitosis is for growth and repair; meiosis is for sexual reproduction. Chromosome number halves only in meiosis.',
        why_it_matters:
          'Exams love to compare them: number of divisions, number of offspring cells, genetic variation, and when each occurs in the life cycle.',
        common_confusion:
          'Thinking meiosis has one division or that mitosis can produce gametes. The "two divisions" in meiosis is the key structural difference.',
      },
    },
    'Cell Signaling': {
      concept: 'Signal Transduction Cascade',
      smart_note: {
        what_it_is:
          'A signal molecule binds a receptor on the cell surface; that activates proteins inside the cell in a chain reaction (cascade), amplifying the message. One signal can trigger a large response. Kinases often phosphorylate the next protein in line.',
        why_it_matters:
          'You need to trace the path: ligand → receptor → second messenger or kinase cascade → cellular response. Exam questions often show a diagram and ask what happens if step X is blocked.',
        common_confusion:
          'Assuming the signal molecule enters the cell. Most first messengers never cross the membrane—they bind surface receptors and the message is relayed inside.',
      },
    },
  },
  psych101: {
    'Learning': {
      concept: 'Classical Conditioning',
      smart_note: {
        what_it_is:
          'Classical conditioning is learning by association, where a neutral stimulus becomes linked to an automatic response. The key is that the response is reflexive, not something you choose to do.',
        why_it_matters:
          'On exams, this is often tested by contrasting it with operant conditioning, which involves voluntary behavior and consequences.',
        common_confusion:
          'Students often mix this up with operant conditioning by focusing on rewards instead of automatic responses.',
      },
      by_context: {
        class: {
          what_it_is:
            'Classical conditioning: a neutral stimulus becomes linked to an automatic (reflexive) response. Listen for: unconditioned vs conditioned stimulus/response.',
          why_it_matters:
            'In class, focus on what is reflexive vs voluntary. Operant is voluntary behavior + consequences; classical is automatic association.',
          common_confusion:
            'Don’t mix with operant: classical = automatic response; operant = rewards/consequences for behavior.',
        },
        review: {
          what_it_is:
            'Classical conditioning = learning by association; neutral stimulus → automatic response. Reflexive, not chosen.',
          why_it_matters:
            'Contrast with operant (voluntary + consequences). Know UCS, UCR, CS, CR.',
          common_confusion:
            'Classical = automatic; operant = rewards. Don’t focus on rewards for classical.',
        },
      },
    },
    'Memory': {
      concept: 'Encoding vs Retrieval',
      smart_note: {
        what_it_is:
          'Encoding is getting information into memory; retrieval is getting it out. Forgetting can be an encoding problem (you never really stored it well) or a retrieval problem (it’s there but you can’t access it). Context and cues affect retrieval.',
        why_it_matters:
          'Exam questions often describe a scenario and ask whether the failure is encoding or retrieval. Recognition vs recall also tests retrieval.',
        common_confusion:
          'Treating "I can’t remember" as one thing. If you recognize the answer when you see it, that’s a retrieval issue; if you never learned it, that’s encoding.',
      },
    },
    'Biological Bases': {
      concept: 'Neurotransmitters and Behavior',
      smart_note: {
        what_it_is:
          'Neurotransmitters are chemicals that carry messages between neurons. Different ones have different effects: dopamine with reward and movement, serotonin with mood and sleep, GABA with inhibition. Balance and receptor type matter more than "one chemical = one behavior."',
        why_it_matters:
          'You’ll be asked which neurotransmitter is involved in what, and what happens when there’s too much or too little (e.g., Parkinson’s and dopamine).',
        common_confusion:
          'Assigning one function to one neurotransmitter. Real behavior involves many systems; exams simplify but expect you to know the main associations.',
      },
    },
    'Research Methods': {
      concept: 'Independent vs Dependent Variable',
      smart_note: {
        what_it_is:
          'The independent variable (IV) is what the experimenter manipulates; the dependent variable (DV) is what is measured as the outcome. The IV is the cause you’re testing; the DV is the effect you’re watching.',
        why_it_matters:
          'Every methods question expects you to identify IV and DV and to know that correlation does not imply causation—only experiments manipulate the IV.',
        common_confusion:
          'Calling "time" or "age" the IV in a correlational study. If you didn’t assign people to conditions, you didn’t manipulate an IV.',
      },
    },
  },
  econ202: {
    'Supply & Demand': {
      concept: 'Equilibrium and Shifts',
      smart_note: {
        what_it_is:
          'Equilibrium is where supply and demand curves cross—quantity supplied equals quantity demanded at that price. A shift in demand or supply moves the equilibrium. Demand shifts come from preferences, income, substitutes; supply shifts from costs, technology, number of sellers.',
        why_it_matters:
          'You will draw shifts and predict new price and quantity. The trick is to shift one curve at a time and read the new intersection.',
        common_confusion:
          'Moving along the curve (quantity change) when something shifted the curve (price or quantity both change). "Demand increased" means the curve shifted right, not that we slid along it.',
      },
    },
    'Elasticity': {
      concept: 'Price Elasticity of Demand',
      smart_note: {
        what_it_is:
          'Elasticity measures how much quantity demanded changes when price changes. Elastic demand: quantity is very responsive (flat curve). Inelastic: quantity barely moves (steep curve). Revenue rises when you raise price only if demand is inelastic.',
        why_it_matters:
          'Exams ask whether demand is elastic or inelastic in a scenario, and what happens to total revenue when price changes. Know the formula and the intuition.',
        common_confusion:
          'Thinking "elastic" means "stretchy" in a vague way. Here it means "responsive to price." Elastic = quantity changes a lot; inelastic = quantity is sticky.',
      },
    },
    'Market Structures': {
      concept: 'Perfect Competition vs Monopoly',
      smart_note: {
        what_it_is:
          'Perfect competition: many sellers, identical product, no barriers to entry, price takers. Monopoly: one seller, no close substitutes, high barriers, price maker. In between: oligopoly, monopolistic competition.',
        why_it_matters:
          'You’ll compare price, output, and efficiency across market types. Monopoly produces less and charges more than the competitive outcome; that’s the welfare loss.',
        common_confusion:
          'Calling any big company a "monopoly." Monopoly means no close substitutes and barriers that block entry—not just "they’re big."',
      },
    },
  },
  eng215: {
    'Literary Analysis': {
      concept: 'Theme vs Subject',
      smart_note: {
        what_it_is:
          'Subject is the topic (e.g., love, war). Theme is the argument or insight the work suggests about that subject—what the author is saying about it. "Love" is a subject; "love demands sacrifice" could be a theme.',
        why_it_matters:
          'Essays and exams want you to state themes as claims, not one-word subjects. A theme is debatable and specific to the text.',
        common_confusion:
          'Stating the plot or subject as the theme. Theme is the takeaway, not "what happens" or a single word.',
      },
    },
    'Modernism': {
      concept: 'Modernist Fragmentation',
      smart_note: {
        what_it_is:
          'Modernist writers broke with linear narrative and stable meaning: stream of consciousness, fragmented structure, unreliable narrators, and ambiguity. The world is not one story anymore; the text reflects that.',
        why_it_matters:
          'You’ll be asked to identify modernist techniques and how they create meaning (or doubt meaning). Know the shift from Victorian clarity to modernist uncertainty.',
        common_confusion:
          'Assuming "modern" means "recent." Modernism is a specific early-20th-century movement; don’t conflate it with "contemporary."',
      },
    },
    'American Romanticism': {
      concept: 'Romanticism and Nature',
      smart_note: {
        what_it_is:
          'American Romantics treated nature as a source of truth, spirituality, and moral clarity—often in contrast to society and industrialization. The individual in nature (sublime, wild) is a central image.',
        why_it_matters:
          'Exams link works to Romantic values: nature, individualism, emotion over reason, the sublime. You’ll identify how a passage reflects these.',
        common_confusion:
          'Confusing Romantic with "romantic love." Romanticism is a philosophical and artistic movement; nature and the individual are the focus.',
      },
    },
  },
};

/** Fallback when no note exists for course/topic. */
const FALLBACK_NOTE = {
  concept: 'Core Idea',
  smart_note: {
    what_it_is:
      'This concept is central to the topic. Focus on the main mechanism or definition your instructor emphasized.',
    why_it_matters:
      'This distinction is commonly tested. Know how it differs from related ideas.',
    common_confusion:
      'Students often mix this up with a similar concept—be clear on the boundary between them.',
  },
};

/**
 * Get a smart note for course + topic + context.
 * Uses context-specific variant (by_context[context]) when present, else base smart_note.
 * @param {object} course - { id, code, masteryTopics }
 * @param {string} topic - topic name (e.g. from masteryTopics[].name)
 * @param {string} context - "exam" | "class" | "review"
 * @returns {{ concept: string, smart_note: { what_it_is, why_it_matters, common_confusion } }}
 */
export function getSmartNote(course, topic, context = 'exam') {
  const byCourse = NOTES_BY_COURSE_TOPIC[course?.id];
  if (!byCourse) return FALLBACK_NOTE;
  const raw = byCourse[topic];
  if (!raw) return FALLBACK_NOTE;
  const base = raw.smart_note;
  const byContext = raw.by_context;
  if (byContext && byContext[context]) {
    return { concept: raw.concept, smart_note: byContext[context] };
  }
  return { concept: raw.concept, smart_note: base };
}

/**
 * Topics that have a smart note for this course (subset of masteryTopics).
 */
export function getTopicsWithNotes(course) {
  const byCourse = NOTES_BY_COURSE_TOPIC[course?.id];
  if (!byCourse) return [];
  return (course?.masteryTopics || [])
    .map((t) => t.name)
    .filter((name) => byCourse[name]);
}
