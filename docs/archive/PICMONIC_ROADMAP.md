# Picmonic System Roadmap — 10 Key Improvements

This roadmap aligns the Scholar picmonic prototype with the **Master Document for a Picture Mnemonic Generator App**. It prioritizes learning-science constraints (retrieval-first, dual coding, cognitive load, spacing) and the deterministic pipeline described there. Each item is scoped so it can be implemented incrementally.

---

## Current state (brief)

- **Pipeline:** Concept → static decomposition (attributes, image_story) → static phonetic anchor → symbol_map from visual grammar → DALL·E prompt → generated image → hotspots (zone-based positions).
- **Retrieval:** Learning mode (labels on/hover) and recall mode (click to reveal); no occlusion, no quiz prompts, no spaced review.
- **Data:** Decompositions and anchors are static (JS modules); no global symbol library, no anchor library with versioning or concreteness scoring.
- **Validation:** Basic mnemonic validation (chunking, anchor present, scene element cap, abstract-phrase check); no semantic-correctness or visualizability gates.

---

## Roadmap — 10 items

### 1. **Retrieval modes: occlusion + quiz prompts**

**Why first:** The master doc treats retrieval practice and testing as non-negotiable. Right now the app stops at “generate image + hover/click”; it doesn’t deliver occlusion or image-only/missing-element prompts.

**Scope:**

- **Occlusion mode:** In Picmonics, add a third study mode (e.g. “Cover one”) that hides one hotspot at a time and asks: “What’s missing? What fact does it encode?” with feedback on reveal.
- **Quiz prompts:** For each artifact, generate and store 2–4 short prompts (e.g. “What does [element] represent?”, “Which element encodes [fact]?”). Expose them in a simple “Quiz” step or panel (image-only prompts; optional missing-element). No scheduling yet—just the prompts and UI.

**Outcome:** Generate → decode (learning) → retrieve (recall + occlusion + quiz) as the core loop.

---

### 2. **Spaced review queue for picmonics**

**Why:** Spaced repetition has strong evidence; the master doc requires “resurface at intervals” and treats it as part of the training loop.

**Scope:**

- Add a minimal **review queue** for picmonic artifacts: “Due for review” driven by last-seen + simple intervals (e.g. 1d, 3d, 7d). No need to implement SM-2 or Anki sync in v1.
- Surface this in the app: e.g. “Picmonics to review” on Home or inside a course, and/or a “Review” filter in the Picmonics concept list that shows concepts due by date.
- Persist “last studied” (and optionally “next due”) per user/concept (localStorage or backend when available).

**Outcome:** Generate → retrieve → **space** → retrieve again.

---

### 3. **Canonical artifact schema and hotspot map**

**Why:** The master doc’s data model keeps facts as source-of-truth and visuals as encodings; hotspots are an explicit map from visual element to (term, mnemonic phrase, fact). Aligning the codebase to that contract will make retrieval, quiz generation, and future pipeline steps consistent.

**Scope:**

- Introduce a **canonical artifact shape** (concept_id, concept_title, domain, facts[], anchors[], symbol_map[], scene_blueprint{}, hotspots[], study_modes.quiz_prompts[], versioning) and migrate current decomposition + anchor + symbol_map + buildHotspots into that shape (or a thin adapter that produces it).
- Store **hotspots** as first-class: each with symbol_id, coordinates or zone, and `reveals: { term, mnemonic_phrase, fact_text }`. Keep existing zone-based coordinate derivation until you add layout constraints or segmentation.
- Ensure every displayed element has a legend entry (term + mnemonic phrase + fact); no “orphan” visuals.

**Outcome:** Single contract for encoding, retrieval, and quiz prompts; ready for validation gates and pipeline extensions.

---

### 4. **Validation gates: semantic correctness + visualizability**

**Why:** The master doc uses hard validation gates so the pipeline stays deterministic and avoids “clever but useless” or wrong mnemonics.

**Scope:**

- **Pre-visual gate (semantic):** Before building scene/image_story, check that extracted facts are non-ambiguous and internally consistent (e.g. no contradictory mechanism/effect). Reject or flag for human review instead of “fixing” by hallucination.
- **Visualizability gate:** For anchor and symbol_map entries, reject or down-rank candidates that are not depictable as a single concrete object/character. Optionally plug in a small concreteness checklist or keyword list (e.g. “no abstract X”) until norms are integrated (see item 7).
- Run these gates in the existing `validateMnemonicArtifact` (or a separate pre-render validation step) and block image generation when critical checks fail; surface warnings in the UI.

**Outcome:** Fewer wrong or non-decodable mnemonics; pipeline stays fact-led.

---

### 5. **Global symbol library (versioned metaphor dictionary)**

**Why:** The master doc says “map each fact into a visual element using the global symbol library first; only generate new metaphors when the library has no match” to reduce extraneous load and keep consistency (e.g. “inhibition” → same class everywhere).

**Scope:**

- Define a **symbol library** (e.g. JSON or code): mapping abstract meanings (e.g. “inhibition”, “mechanism”, “location”, “warning”) to stable visual descriptions (e.g. “block/chain/lock”). Reuse the existing visual grammar’s metaphor set as the initial library.
- In the pipeline, when building symbol_map from facts, **look up library first**; only create new metaphors when there is no match. Attach `global_symbol_key` to each symbol for traceability.
- Version the library (e.g. symbol_library_version in artifact versioning) so you can reason about compatibility and A/B tests later.

**Outcome:** Consistent metaphors across concepts; fewer one-off encodings that confuse retrieval.

---

### 6. **Anchor library + optional concreteness/imageability scoring**

**Why:** The master doc treats anchors as “term handles” that should be stored and reused, and recommends ranking by phonetic similarity + concreteness/imageability + familiarity so anchors are depictable and retrievable.

**Scope:**

- **Anchor library:** Persist chosen anchors per concept (and optionally per term) so the same term doesn’t get a different character each time. Allow learner override and “lock” (per master doc).
- **Scoring (optional for v1):** Add a small rubric for anchor candidates: sound similarity (e.g. Metaphone/Soundex or simple string similarity), concreteness (checklist or later norms), distinctiveness (penalize “thing”, “object”), familiarity (optional). Use it to rank/suggest anchors when moving from static to generated anchors (item 8).
- Keep current static phonetic anchors as the default source until anchor generation is implemented; the library becomes the store for both static and generated anchors.

**Outcome:** Sticky, consistent anchors; path to deterministic anchor generation.

---

### 7. **Deterministic anchor generation with phonetic + concreteness**

**Why:** Right now anchors are fully static. The master doc specifies an anchor engine: phonetic/keyword candidates ranked by sound similarity + concreteness/imageability + familiarity.

**Scope:**

- **Phonetic tooling:** Integrate a simple phonetic matcher (e.g. Metaphone or Soundex, or a small phoneme dictionary) to generate “sounds-like” candidates for a given term.
- **Candidate ranking:** Combine phonetic score with a concreteness check (depictable as one object/character?). Optionally use norms (e.g. Brysbaert concreteness, MRC-style imageability) if you have or can add a small dataset; otherwise use a curated blocklist of abstract terms and a simple “is depictable” heuristic.
- **Pipeline integration:** Add an “anchor generation” step that runs when no anchor exists in the library; write the chosen anchor back to the anchor library. Keep static anchors as overrides.

**Outcome:** New concepts can get anchors without manual table updates; anchors stay concrete and sound-aligned.

---

### 8. **Pipeline: fact extraction → ground-truth rewrite → scene blueprint**

**Plain-language summary:** Right now, concepts are hand-authored (e.g. in `conceptDecompositions.js`): you write the facts, image_story, and attributes. Item 8 means: for *new* concepts (e.g. when a user pastes a paragraph or learning objective), add automatic steps that (1) **extract** 1–7 atomic facts from the text, (2) **rewrite** each fact into one short, exam-style sentence and lock it as the single source of truth, (3) **build a scene blueprint** (who’s center/left/right, one-sentence micro-story, traversal order) from anchors + symbol_map. Image_story and the DALL·E prompt would then be *derived* from that blueprint instead of written by hand. You can defer full implementation and add a stub for “pipeline (item 8)” to implement later.

**Why:** The master doc describes a sequential pipeline: input → concept selection → fact extraction (1–7 atomic facts) → ground-truth rewrite (exam-aligned statements) → anchor → symbol mapping → scene blueprint (zones, micro-story, traversal) → render. Today, decomposition and image_story are largely hand-authored.

**Scope:**

- **Fact extraction:** From raw input or learning objective, extract 1–7 atomic, testable facts; assign priority (high/medium/low) and optional fact_type (definition, mechanism, cause, effect, etc.). Can be LLM-based with strict output schema and validation.
- **Ground-truth rewrite:** Re-express each fact as a short, exam-aligned sentence. This becomes the locked “fact_text” used everywhere (hotspots, quiz, legend). No visual step may change it.
- **Scene blueprint:** Explicitly build scene_blueprint from anchor + symbol_map: locus (setting), zones (center, foreground, left, right, background), micro_story (one causal moment), traversal_order. Feed this into the existing prompt builder so image_story is derived from the blueprint rather than free-form.
- Prefer doing this for “new” concepts (e.g. from pasted text or URL) first; existing static decompositions can stay as-is and be gradually migrated to the same schema.

**Outcome:** Facts as source-of-truth; visuals as encodings; render downstream of blueprint; ready for asset-based compositing later.

---

### 9. **Capacity and layout gate + traversal order**

**Why:** The master doc and cognitive load theory cap “simultaneously decodable” elements and require a stable traversal order; validation should reject scenes that exceed the limit or lack traversal.

**Scope:**

- **Capacity gate:** Enforce a configurable cap (e.g. 5–7 elements per scene including anchor). Reject or trim symbol_map so the scene never exceeds the cap. Already partially present in mnemonicValidation; make it a hard gate before image generation.
- **Traversal order:** Store traversal_order (ordered list of symbol_ids) in scene_blueprint. Use it for (a) validation (every symbol in the scene appears in traversal), (b) optional “guided tour” or narrative order in the UI, (c) future occlusion order. Derive a default order from zones (e.g. center → foreground → left → right → background) if not generated.
- **Layout gate:** Reject scenes that have no zone assignment for any symbol or that duplicate the same zone for too many elements in a way that would create overlap (simple heuristic is enough for v1).

**Outcome:** Every scene has a bounded number of elements and a well-defined decoding order; aligns with loci and working-memory constraints.

---

### 10. **Render path: layout constraints or asset-based compositing (prep)**

**Why:** The master doc says hotspots need stable geometry; generative full images are rich but require either storing blueprint zones, post-hoc segmentation, or constrained generation with layout. It also recommends asset-based compositing (SVG/scene graph) for highest control and determinism.

**Scope:**

- **Short term (layout constraints):** If staying with DALL·E (or similar), add **explicit layout constraints** to the prompt or post-processing: e.g. “place the main character in the center third; place supporting elements left and right; no overlap of key elements.” Optionally store bounding-box hints per zone so that, in the future, you can approximate hotspot positions from layout rather than zone-only heuristics.
- **Medium term (prep for compositing):** Define a **scene graph / asset plan**: list of symbols with visual_description, zone, and optional asset_id. This can be the same structure that later drives SVG or 2D compositing (each symbol → one asset or icon). No need to implement the renderer yet; just the data shape and a path from scene_blueprint to “render plan.”
- Keep the current “single generative prompt from blueprint” as the default; the goal is to make the pipeline ready for a future asset-based or layout-constrained path without a big rewrite.

**Outcome:** Hotspot fidelity and scalability path; optional future move to full asset-based mnemonics without changing the rest of the pipeline.

---

## Suggested order of implementation

| Order | Item | Rationale |
|-------|------|-----------|
| 1 | Retrieval modes (occlusion + quiz prompts) | Highest impact on learning outcome; no new data model required. |
| 2 | Spaced review queue | Completes the generate → retrieve → space loop. |
| 3 | Canonical artifact schema + hotspot map | Unblocks consistent validation, quiz, and pipeline work. |
| 4 | Validation gates (semantic + visualizability) | Improves correctness and decode-ability before scaling content. |
| 5 | Global symbol library | Reduces inconsistency and cognitive load; enables item 8. |
| 6 | Anchor library + concreteness scoring | Enables sticky anchors and later anchor generation. |
| 7 | Deterministic anchor generation | Scales to new concepts without manual anchor tables. |
| 8 | Pipeline (fact extraction → rewrite → blueprint) | Moves from hand-authored to fact-led, blueprint-driven scenes. |
| 9 | Capacity/layout gate + traversal order | Hardens scene quality and supports guided decode. |
| 10 | Render path (layout / compositing prep) | Improves hotspot fidelity and future compositing option. |

---

## Out of scope for this roadmap

- **Full Anki/SuperMemo sync:** Treat scheduler as interchangeable; simple intervals first.
- **Multi-language and multi-domain content:** Design the schema and pipeline to be domain-agnostic; actual content expansion is separate.
- **Emotion tagging and safety filters:** Document calls for “emotion tagging” and safety (no sexual/graphic content); implement as part of content policy and prompt/response filters when you scale generation.
- **Norms integration in depth:** Concreteness/imageability norms (Brysbaert, MRC) are mentioned as optional enrichment; item 6/7 allow a lightweight version first.

---

## References

- Master Document for a Picture Mnemonic Generator App (learning science foundations, visual grammar, pipeline, data model, anchor engine, retrieval modes, reliability guardrails).
- Existing code: `conceptDecompositions.js`, `phoneticAnchors.js`, `visualGrammar.js`, `picmonics.js`, `promptEngineer.js`, `mnemonicValidation.js`, `hotspotPositions.js`, `encodingChecklist.js`, `MnemonicCanvas.jsx`, `Picmonics.jsx`.
