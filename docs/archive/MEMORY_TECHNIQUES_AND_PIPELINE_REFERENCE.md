# Memory Techniques & Pipeline Reference

Picture mnemonics are **memory-first**: they convert abstract, symbolic information into concrete, sensory-rich experiences the brain is built to remember. This doc ties the cognitive principles and multi-agent mental model to Scholar’s current build logic so we can improve it systematically.

---

## 1. Core cognitive foundations (why it works)

| Principle | What it means for our build |
|-----------|-----------------------------|
| **Picture superiority** | Images beat text for recall → we never bake labels into the image; we use hotspots for decode. |
| **Dual coding** | Word + image = two retrieval paths → every concept has an anchor (phonetic) + scene. |
| **Von Restorff (distinctiveness)** | Bizarre/exaggerated beats mundane → prompts ask for “slightly absurd or humorous,” vivid colors. |
| **Elaborative encoding** | More hooks = stronger memory → transcript + summary + key terms + image_story + hotspots. |
| **Method of Loci** | “Where” is recalled before “what” → scene has zones (center, foreground, left, right); one scene only. |
| **Chunking** | Working memory ~5–9 items → we cap attributes and scene elements (e.g. max 3–4 extra symbols). |

**Transformation sequence** (what the pipeline does):

- abstract → concrete  
- verbal → visual  
- isolated → spatial  
- static → causal  
- symbolic → episodic  

---

## 2. Multi-agent roles → current Scholar pipeline

The “multi-agent” model is a **mental model** for the steps we run. We don’t run separate LLM agents today; we map each role to data and code so the logic is explicit and we can add gates or LLM steps later.

| Agent role | Cognitive function | Current implementation |
|------------|--------------------|-------------------------|
| **Concept Analyst** | What will be tested? Concept type, domain. | `conceptDecompositions.js`: `concept`, `domain`, `attributes`. |
| **Fact Decomposition** | Atomic recall units, 1–7 items, importance. | `conceptDecompositions.attributes` (list of `{ type, value }`). |
| **Phonetic Anchor** | Make term visible: sound → concrete object. | `phoneticAnchors.js`: `phrase`, `object` per concept. |
| **Symbol Mapping** | Meaning → stable visual metaphor (inhibition → chains, etc.). | `visualGrammar.js`: `attributeToSymbol`, `buildSymbolMap`; optional global symbol library. |
| **Scene Architect** | One environment, spatial zones, no split panels. | `promptEngineer.js`: `buildSceneBlueprint`, zones; `image_story` for single-scene narrative. |
| **Narrative Integration** | Minimal causal story; facts interact. | `SCENE_NARRATIVES`, `NARRATIVE_TRANSCRIPTS`, `image_story` in conceptDecompositions. |
| **Distinctiveness & Emotion** | Humor, absurdity, vividness (Von Restorff). | `promptEngineer.js` STYLE_PREFIX: “vivid, characterful… slightly absurd or humorous.” |
| **Cognitive Load & Quality Gate** | Encode all facts? Misleading? Too dense? Drawable? | `validateMnemonicArtifact()` in code; chunking caps in blueprint. |
| **Learner Context** (future) | Adapt anchors/scene when recall fails. | Not implemented; placeholder for personalization. |

**End-to-end flow we implement:**

1. Concept Analyst → decomposition (concept, domain, attributes).  
2. Fact Decomposition → attributes already atomic; cap at ~7.  
3. Phonetic Anchor → anchor phrase + object.  
4. Symbol Mapping → symbol_map from attributes + visual grammar.  
5. Scene Architect → scene blueprint or image_story (one scene).  
6. Narrative Integration → narrative + transcript (+ image_story).  
7. Distinctiveness → baked into image prompt style.  
8. Quality Gate → validate artifact before use/generation.  
9. Output → one mnemonic artifact (image prompt, hotspots, transcript, summary).  

---

## 3. Core formula (per concept)

A strong picture mnemonic follows:

- **Abstract concept** → **Phonetic anchor** → **Visual metaphor** → **Spatial placement** → **Character & action** → **Minimal story** → **Redundant encoding** → **Distinctiveness**

In our build:

- **Phonetic anchor:** `phoneticAnchors[concept_id]`.  
- **Visual metaphor:** `visualGrammar` + optional global symbols.  
- **Spatial placement:** zones in blueprint; `image_story` describes one scene.  
- **Character & action:** `image_story` and prompts use “character” or “object doing X.”  
- **Minimal story:** `image_story`, narrative, transcript.  
- **Redundant encoding:** same fact in summary, key terms, transcript, and hotspot label.  
- **Distinctiveness:** style prefix (vivid, absurd, no flat/muted).  

---

## 4. Validation (quality gate) — what we check

To align with “Cognitive Load & Quality Gate”:

- **Chunking:** Attribute count in 1–7 range (already enforced by data; can enforce in code).  
- **Anchor present:** Artifact has an anchor (phrase + object).  
- **Scene single:** Prompt explicitly forbids split panels (in STYLE_PREFIX).  
- **Drawable:** image_story uses concrete nouns/actions, not abstract jargon (e.g. “elastic band” not “responsiveness of quantity”).  

We implement a small `validateMnemonicArtifact(artifact)` so the pipeline can gate on these before generating an image or showing the artifact.

---

## 5. Structure of “Map to the image” content (★ Anchor, 1–4 facts)

**What you see in the UI**

- **★ Anchor** = the main character/object (e.g. “Cell Membrane” → “Jail Membrane”: a jail cell made of a stretchy membrane door). Comes from `phoneticAnchors`: one phrase + one concrete object per concept.
- **1, 2, 3, 4** = one card per **fact** in the concept. Each card has:
  - **Term** = attribute type, humanized: Structure, Mechanism, Location, Effect, etc.
  - **Label** = the actual fact text (what to remember).

**What are Structure, Mechanism, Location, Effect?**

They are **attribute types** from the concept decomposition. They form a small, fixed schema so every concept is broken into the same kinds of recall units:

| Type        | Role in the mnemonic | Typical zone (memory palace) |
|------------|-----------------------|------------------------------|
| **Structure** | What it’s made of / composition | Left |
| **Mechanism** | How it works / process | Foreground |
| **Location**  | Where it is / happens | Background |
| **Effect**    | Result / outcome      | Right |
| (others)      | class, side_effect, inhibition, etc. | Left / Right / Background |

So “Structure” = “this fact is about composition”; “Mechanism” = “this fact is about process”; and so on. They exist so that:

1. **Encoding is consistent** — same types across concepts, so the brain gets used to “mechanism = how it works.”
2. **Zones are predictable** — mechanism in foreground, effect on the right, etc. (Method of Loci).
3. **Facts are testable** — each `{ type, value }` is one recall unit for quizzes and retrieval.

**How it’s generated**

1. **Source of truth:** `conceptDecompositions.js` (or pipeline extraction) defines per concept a list of **attributes**: `{ type: 'mechanism', value: 'selective permeability — small nonpolar pass freely; …' }`.
2. **Symbol map:** `visualGrammar.buildSymbolMap(attributes)` turns each attribute into a **slot** with `attribute_type`, `value`, `zone`, and a **symbol** (internal visual cue; e.g. mechanism → “action (cutting, blocking, tying, building)” — that phrase is for image logic only, not shown to the learner).
3. **Hotspots:** `canonicalArtifact` builds one hotspot per slot (anchor = ★, rest = 1, 2, 3, 4). Each hotspot has **term** (humanized type: “Mechanism”), **mnemonic_phrase** (short visual cue only, e.g. “wall,” when different from the default), and **fact_text** (the `value`).
4. **Display:** “Map to the image” renders those hotspots as cards: **Term** (and optional short cue in parentheses) + **fact text** as the label. Numbers 1–4 match the order of slots so they align with the circles on the image.

So: **Structure, Mechanism, Location, Effect** = the names we give to each *kind* of fact so we can place it in the scene and show one card per fact without repeating the same sentence twice.

---

## 6. Why this improves the logic of how we build

- **Single source of truth:** This doc and the validation function make the “why” and “what we enforce” explicit.  
- **Clear extension points:** Each agent role maps to a file or step; adding an LLM for Phonetic Anchor or Symbol Mapping is a drop-in step.  
- **Memory-first, not creativity-first:** Pipeline order is fixed: meaning (decomposition, definitions) → anchors → symbols → scene → narrative → image. Image generation is downstream, not leading.  
- **Retrieval-first:** Output is an artifact optimized for recall (hotspots, transcript, one scene), not for explanation.  

When adding features or new concepts, we can check against this pipeline and the validation list so the logic stays consistent with the cognitive principles and multi-agent mental model.
