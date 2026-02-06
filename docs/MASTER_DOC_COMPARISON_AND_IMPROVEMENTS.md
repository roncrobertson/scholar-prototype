# Master Document Comparison — How We Generate Picmonics vs. the Spec

This doc compares our current picmonic generation system to the Master Document (memory-first, cognitive-science–grounded picture mnemonic generator). It maps **what we already do**, **where we fall short**, and **concrete opportunities for improvement**.

**Current status:** Many items listed as gaps here are now implemented (e.g. source_text, created_at, anchor.scores, render blob, safety line, occlusion, quiz, legend–hotspot parity, vision-based placement). For up-to-date pipeline and status see **[PICMONIC_FEATURE_OVERVIEW.md](PICMONIC_FEATURE_OVERVIEW.md)** and **[SIMPLIFIED_HIGH_VALUE_ROADMAP.md](SIMPLIFIED_HIGH_VALUE_ROADMAP.md)**.

**Reference:** The Master Document defines learning-science foundations, mnemonic visual grammar, a deterministic pipeline with validation gates, a canonical data model, anchor generation with concreteness scoring, retrieval modes (learning / recall / occlusion / spaced review), and reliability guardrails.

**Our flow (short):** Content → artifact (anchor + symbol_map + image_story) → prompt (style + scene + do/don’t rules) → DALL·E 3 → image + hotspots + legend. See [PICMONIC_FEATURE_OVERVIEW.md](PICMONIC_FEATURE_OVERVIEW.md) for the full walkthrough and pipeline.

---

## 1. Pipeline comparison (step by step)

| Master Doc step | What the spec says | What we do | Gap? |
|-----------------|--------------------|------------|------|
| **1) Input ingestion** | Accept messy text, term, or learning objective; store raw input for audit. | We accept concept selection (pre-authored) or pasted text (create from text). **Create-from-text** stores **source_text** (raw pasted input) on the artifact; canonical passes it through. | ✅ Aligned for create-from-text. |
| **2) Concept selection** | Identify primary tested concept + domain to avoid “one paragraph → one image.” | We have concept_id and domain (from decomposition or pipeline options). Create-from-text can run without a concept (generic anchor). | **Minor:** Stronger “one scene = one concept” enforcement and concept suggestion for pasted text. |
| **3) Fact extraction** | Extract 1–7 atomic, testable facts; label priority. | We do: LLM (when API key) or heuristic; 1–7 facts; priority from position or decomposition. | ✅ Aligned. |
| **4) Ground-truth rewrite** | Re-express each fact as short, exam-aligned statement; lock as source of truth. | We have `rewriteFactsAsGroundTruth` (trim, ensure period). Facts are the source of truth for hotspots/legend. | ✅ Aligned. |
| **5) Anchor generation** | Phonetic/keyword candidates; rank by **sound + concreteness/imageability + distinctiveness + familiarity**. Use norms (e.g. concreteness ratings) for scoring. | We use a **static lookup** (`phoneticAnchors.js`): one phrase + one visual per concept_id. No candidate generation, no phonetic algorithms (Soundex/Metaphone/CMU), no concreteness/imageability scoring. Create-from-text falls back to concept title or override. | **Major:** No anchor *generation* or *ranking*; no concreteness/imageability norms. |
| **6) Symbol mapping** | Map each fact to a visual using **global symbol library first**; generate new metaphors only when no match. | We have `visualGrammar.js` (type → symbol class) and `symbolLibrary.js` (refinements). We build symbol_map from attributes; library is used. New concepts get grammar-based symbols. | ✅ Largely aligned; could make “library first, then generate” more explicit. |
| **7) Scene blueprint** | Zones (center/foreground/left/right/background), **one micro-causal interaction**, **traversal order**. | We have zones, scene_blueprint with locus/zones/micro_story/traversal_order (in pipeline and canonical). Causal emphasis in prompts (“cause → effect”); micro_story from blueprint. | ✅ Aligned. |
| **8) Render plan** | (a) Asset-based compositing or (b) constrained generative prompt + layout. **Render downstream of blueprint.** | We use **generative only** (DALL·E 3). Prompt is derived from blueprint/image_story; we don’t have layout constraints or asset compositing. Blueprint/image_story is source; image is view. | **Minor:** No layout constraints or bounding boxes; no asset-based option. |
| **9) Hotspot map + legend** | Explicit mapping: visual element → (term, mnemonic phrase, fact). Dual coding + explainability. | We have canonical hotspots with `reveals: { term, mnemonic_phrase, fact_text }` and legend; one-to-one with symbol_map/facts. | ✅ Aligned. |
| **10) Retrieval modes** | Learning (labels on), Recall (labels off), **Occlusion** (hide one, “what’s missing?”), **Quiz** (image-only / missing-element prompts). | We have learning (hover) and recall (click to reveal). Canonical has `study_modes.quiz_prompts` from hotspots. **Occlusion** (“Cover one”) and **Quiz** UI may be partially implemented or planned; retrieval is not as prominent as in the spec. | **Medium:** Fully surface occlusion + quiz as first-class study modes; ensure “generate → retrieve → space” loop is obvious. |
| **11) Spacing scheduler** | Resurface at intervals; distributed practice. | We have `spacedReview.js`: `recordStudied`, `getDueForReview`, `advanceInterval` (e.g. 1d, 3d, 7d); “Due for review” in UI. | ✅ Aligned. |

---

## 2. Learning science & visual grammar

| Principle (Master Doc) | What we do | Gap? |
|------------------------|------------|------|
| **Picture superiority** | We optimize for concrete, depictable scenes; style prefix asks for “concrete, recognizable shapes.” | ✅ Aligned. |
| **Dual coding** | Every element has a label (term, mnemonic phrase, fact) in legend/hotspots; labels on/off (hover/click). | ✅ Aligned. |
| **Concreteness / imageability** | We encourage concrete anchors in copy but **don’t score** anchors by concreteness/imageability norms. | **Major:** Add concreteness/imageability scoring for anchor candidates (or for static anchors for consistency). |
| **Distinctiveness (benign weirdness)** | Style prefix asks for “exaggerated, memorable, slightly surreal” and “absurd or whimsical.” We don’t add bizarre imagery beyond that. | ✅ Aligned; could make “distinctiveness without confusion” explicit in validation. |
| **Spatial memory / zones** | Stable zones (center=anchor, foreground/left/right/background); scene_blueprint with zones and traversal_order. | ✅ Aligned. |
| **Working memory (3–5 elements)** | We cap elements (e.g. max 4–5 in prompt, MAX_ELEMENTS in policy); validation can check capacity. | ✅ Aligned. |
| **Micro-causal narrative** | We enforce single causal moment in prompts (“cause → effect”); image_story/blueprint emphasize one story. | ✅ Aligned. |
| **Retrieval + spacing** | Spaced review exists; retrieval modes (occlusion, quiz) need to be first-class and visible. | **Medium:** See retrieval modes above. |
| **Anchor first** | One primary anchor per concept; recognizable at a glance. We have it. | ✅ Aligned. |
| **Meaning layer → actions/metaphors** | Symbol map maps facts to visuals; grammar + library. We use a controlled metaphor set. | ✅ Aligned. |
| **Characters when agency helps** | We allow “main character” and exaggerated figures; not formalized as “agents vs properties vs outcomes.” | **Minor:** Could formalize agents vs properties vs outcomes in grammar. |
| **2–3 cues per fact** | We don’t explicitly limit to 2–3 encoding channels per fact; encoding_channels in canonical are currently `['object', 'position']`. | **Minor:** Document or enforce 2–3 channels per fact to avoid overload. |
| **Consistency (global symbol library)** | Symbol library and visual grammar are global and versioned (SYMBOL_LIBRARY_VERSION). | ✅ Aligned. |

---

## 3. Validation gates

| Master Doc gate | What we do | Gap? |
|-----------------|------------|------|
| **Semantic correctness (pre-visual)** | We reject empty/placeholder facts; flag “definition only” and long, non-action phrasing in `mnemonicValidation.js` and engine validation. | ✅ Aligned. |
| **Visualizability / concreteness** | We have blocklists and abstract-phrase checks (`isLikelyNonDepictable`); we can block image generation. We **don’t** use concreteness/imageability norms. | **Medium:** Add norms-based scoring or explicit “reject if below concreteness threshold.” |
| **Distinctiveness without confusion** | We check for orphan visuals and fact–symbol alignment; we don’t explicitly check “each element discriminable.” | **Minor:** Add a check that elements are discriminable (e.g. by role/position). |
| **Capacity and layout** | We enforce MAX_SCENE_ELEMENTS and max symbols per zone in validation; traversal_order exists. | ✅ Aligned. |

---

## 4. Data model (canonical artifact)

| Master Doc field | What we have | Gap? |
|------------------|--------------|------|
| concept_id, concept_title, domain, source_text | We have concept, domain; source_text not always stored for pre-authored. | **Minor:** Add source_text / raw_input where applicable. |
| facts[] (fact_id, fact_text, priority, fact_type) | We have attributes and canonical facts (fact_id, fact_text, priority, fact_type). | ✅ Aligned. |
| anchors[] (mnemonic_phrase, visual_description, **scores**) | We have a single anchor (phrase, object); canonical has anchors array. We **don’t** store phonetic/concreteness/distinctiveness/familiarity scores. | **Medium:** Add optional anchor scores for future ranking. |
| symbol_map[] (encodes_fact_id, encoding_channels, global_symbol_key) | We have symbol_id, encodes_fact_id, visual_description, encoding_channels (e.g. ['object', 'position']), zone, global_symbol_key. | ✅ Aligned. |
| scene_blueprint (locus, zones, micro_story, traversal_order) | We have it in pipeline and canonical. | ✅ Aligned. |
| render (mode, image_prompt, output_image_uri) | We don’t have a formal render object; we have prompt and image URL in UI state / post-image records. | **Minor:** Optional render blob (mode: image-gen, prompt snippet, image_uri) for audit. |
| hotspots[] (symbol_id, reveals) | We have hotspot_id, symbol_id, coordinates, reveals (term, mnemonic_phrase, fact_text). | ✅ Aligned. |
| study_modes (learning, recall, occlusion, quiz_prompts) | We have study_modes.quiz_prompts; learning/recall via hover/click. Occlusion may be in MnemonicCanvas or planned. | **Minor:** Ensure occlusion and quiz are first-class in UI and study_modes. |
| versioning (schema_version, symbol_library_version, created_at) | We have SCHEMA_VERSION and SYMBOL_LIBRARY_VERSION. **Pipeline** artifact has `created_at`; canonical passes `artifact.created_at` or falls back to now. | ✅ Aligned for pipeline. |

---

## 5. Anchor engine (biggest gap)

The Master Document specifies:

- **Phonetic tooling:** Soundex/Metaphone or CMU Pronouncing Dictionary for “sounds-like” candidate generation.
- **Candidate ranking:** Weighted score = sound similarity + **concreteness/imageability** (norms) + distinctiveness + familiarity.
- **Rule:** Reject anchors that are not depictable as a single object/character.

We currently have:

- **Static lookup only:** `phoneticAnchors.js` — one phrase + one object per concept_id. No candidate generation, no ranking.
- **Create-from-text:** Anchor = override, or concept_id anchor, or concept title (often not depictable).
- **No concreteness/imageability norms** (e.g. Brysbaert, MRC-style).

**Opportunity:** Add an optional **anchor generation + ranking** path (e.g. LLM or phonetic + concreteness scoring) for create-from-text and for new concepts, and persist chosen anchors in an anchor library. Even without full phonetic tooling, **concreteness/imageability scoring** of candidate phrases (or of existing anchors) would align with the spec and improve “depictability.”

---

## 6. Rendering

- **Spec:** Prefer asset-based compositing for hotspot fidelity; if generative, keep blueprint as source and treat image as view; avoid text in image.
- **Us:** Generative only (DALL·E 3); blueprint/image_story is source; we enforce no text and principle-based “only listed elements.” We don’t use layout constraints or bounding boxes.
- **Opportunity:** For future iterations, consider (a) constrained generation with explicit layout hints (e.g. “left third: X; center: Y”) or (b) a hybrid: key elements as positioned assets, background from gen. Not required for v1.

---

## 7. Reliability and safety

| Master Doc rule | What we do | Gap? |
|-----------------|------------|------|
| **Visuals never invent meaning** | Facts are extracted/rewritten first; visuals encode facts via symbol_map. We don’t let the image model add facts. | ✅ Aligned. |
| **One symbol ↔ one fact** | We have encodes_fact_id; validation checks fact–symbol alignment. | ✅ Aligned. |
| **Explainability** | Every element has a legend entry (term, mnemonic phrase, fact_text). | ✅ Aligned. |
| **Safe, classroom-appropriate affect** | We ask for “whimsical, absurd” but not violent/sexual; no formal safety layer. | **Minor:** Add explicit safety line in prompt or post-check. |

---

## 8. Prioritized improvement opportunities

### High impact

1. **Anchor generation + concreteness**  
   Add optional anchor *candidates* (e.g. LLM or phonetic) and rank by **concreteness/imageability** (norms or heuristic). Use for create-from-text and new concepts; persist in anchor library. Even scoring *existing* anchors improves audit and consistency.

2. **Retrieval modes first-class**  
   Make **occlusion** (“Cover one”) and **quiz** (from `quiz_prompts`) clearly visible and part of the default study flow (e.g. “Study: Hover | Click | Cover one | Quiz”). Ensure advanceInterval or equivalent is called after quiz/occlusion so spacing is tied to retrieval.

### Medium impact

3. **Visualizability gate with norms**  
   Where possible, use concreteness/imageability norms (or a simple heuristic) to reject or flag anchors/symbols that are not depictable. Integrate with existing mnemonicValidation/engine validation.

4. **Explicit “library first” in symbol mapping**  
   In pipeline and docs, state: “Resolve each fact to a visual via global symbol library first; only generate new metaphor when no match.” Reduces drift and supports transfer.

5. **Anchor scores in artifact**  
   Add optional `scores: { phonetic, concreteness, distinctiveness, familiarity }` to anchors in the canonical model so future ranking and audit are possible.

### Lower impact

6. **Source text / raw input**  
   Store raw pasted text and selected concept_id with the artifact (or in post-image record) for audit and “regenerate with same input.”

7. **Render blob**  
   Optional `render: { mode: 'image-gen', prompt_snippet, output_image_uri }` (or similar) for debugging and compliance.

8. **2–3 encoding channels**  
   Document or validate that each symbol uses at most 2–3 encoding channels (object, action, position, quantity, color) to avoid cognitive overload.

9. **Safety line**  
   Add one explicit line in prompt or post-check: “Safe for classroom; no violence, no sexual content.”

---

## 9. Summary table

| Area | Aligned | Gaps |
|------|---------|------|
| Pipeline steps 1–4, 6–7, 9 | ✅ Facts, ground-truth, symbol map, blueprint, hotspots/legend | Raw input storage, concept enforcement |
| Pipeline step 5 (anchor) | Static lookup only | **No generation, no ranking, no concreteness norms** |
| Pipeline step 8 (render) | Generative, blueprint as source | No layout constraints, no asset path |
| Pipeline steps 10–11 | Spaced review; quiz_prompts exist | **Occlusion + quiz not first-class in UI** |
| Learning science & grammar | Zones, causal narrative, dual coding, cap on elements | Concreteness scoring; 2–3 channels explicit |
| Validation | Semantic, visualizability (heuristic), capacity | **Norms-based concreteness**; discriminability check |
| Data model | facts, anchors, symbol_map, scene_blueprint, hotspots, quiz_prompts | **Anchor scores**; source_text; render blob; created_at |
| Reliability | Facts first; one symbol per fact; explainability | Explicit safety line |

---

**Bottom line:** We are largely aligned with the Master Document on facts-as-source-of-truth, zones, blueprint, hotspot/legend, spacing, and validation. The largest gaps are **(1) anchor generation and concreteness/imageability scoring**, **(2) making occlusion and quiz first-class retrieval modes**, and **(3) optional but useful enrichments** (anchor scores, source text, visualizability norms). Addressing (1) and (2) would bring the system closest to the spec’s “memory-first, retrieval-infrastructure” stance.
