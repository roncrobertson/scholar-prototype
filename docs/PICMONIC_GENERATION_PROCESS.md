# Picmonic Generation Process — Full Specification

This document details **every step** of the picmonic generation process: how information is created, how visuals are created, what logic is used, what rules exist, and what guidelines apply. It is derived from the codebase and serves as a single reference for full review.

---

## 1. North star and objective

**Objective:** Turn a **concept** into a **single visual scene** that encodes 2–6 **key facts** via a **phonetic anchor** (main character) and **symbol map** (supporting visuals). The image is generated from a text prompt; the UI shows the image plus hotspots, legend, and study modes.

**North star (validation):** *If the image does not independently reconstruct the concept's key facts, it is invalid.*

**Implementation:** Pre-image validation is in `src/utils/visualMnemonicEngineValidation.js`. Post-image checks (label-off, image-teaches-before-text) are documented in `docs/VISUAL_MNEMONIC_ENGINE_VALIDATION.md` for manual or future automated use.

---

## 2. High-level flow

```
[Path A: Pre-authored concept]     OR     [Path B: Create from text]
         │                                          │
         ▼                                          ▼
   getMnemonicArtifact()                    runPipeline()
   (decomposition + anchor                  (extract facts → rewrite
    + symbol_map + image_story               → attributes → anchor
    from conceptDecompositions)              + symbol_map → blueprint
         │                                   → image_story)
         │                                          │
         +------------------+------------------------+
         ▼
   ARTIFACT (anchor, symbol_map, image_story, domain, attributes, scene_blueprint, ...)
         │
         ├── withValidation(artifact)  → _validation.warnings, blockImageGeneration
         ├── toCanonicalArtifact(...)   → canonical (facts, hotspots, quiz_prompts)
         └── buildScenePrompt(artifact) [or buildScenePromptWithLLM]
         │
         ▼
   PROMPT (style + scope + scene + layout + distinct-elements + no-text + scope)
         │
         ▼
   generateMnemonicImage(prompt)  →  append scope reinforcement  →  DALL·E 3
         │
         ▼
   IMAGE (base64)  →  [optional] getHotspotPositionsFromImage(imageUrl, artifact)
         │
         ▼
   UI: image + getDisplayHotspots(canonical, resolvedPositions) + legend
```

---

## 3. Path A — Pre-authored concept (how information is created)

**Entry:** User selects a concept from the picmonics list (e.g. Cell Membrane, Cognitive Dissonance).  
**Module:** `src/data/picmonics.js` → `getMnemonicArtifact(mnemonic)`.

### 3.1 Lookup and data sources

| Step | What | Source / logic |
|------|------|----------------|
| 1 | **Concept decomposition** | `getDecomposition(concept_id)` from `src/data/conceptDecompositions.js`. Returns one object per concept_id. |
| 2 | **Phonetic anchor** | `getPhoneticAnchor(concept_id)` from `src/data/phoneticAnchors.js`. Returns `{ phrase, object }` (e.g. "Jail Membrane" → "a jail cell made of a stretchy membrane door"). |
| 3 | **Symbol map** | `buildSymbolMap(decomposition.attributes)` from `src/data/visualGrammar.js`, then `enrichSymbolMapWithLibrary(symbolMap)` from `src/data/symbolLibrary.js`. |

**Decomposition shape (per concept):**

- **concept** — Display name (e.g. "Cell Membrane").
- **domain** — e.g. `biology`, `psychology`, `economics`, `literature`. Used for scene setting and optional encoding_mode.
- **core_concept** — One or more sentences explaining the concept.
- **summary** — Short summary.
- **exam_summary** — One-sentence exam-ready takeaway.
- **high_yield_distinctions** — Optional array of distinctions.
- **image_story** — Optional hand-written scene text for DALL·E (single causal narrative, minimal background). When present and length > 60, it is used as the scene in the prompt.
- **recall_story** — Optional one-sentence causal story for "replay in your head." If missing, `deriveRecallStory(artifact)` from pipeline is used.
- **mnemonic_narrative** — Optional 2–4 sentence narrative; shown at top of "How to remember it" when present.
- **encoding_mode** — Optional `'full_mnemonic'` or `'characterization_only'`. Default `'full_mnemonic'`. When `characterization_only`, prompt uses a shorter style (CHARACTERIZATION_STYLE) with less heavy symbolism.
- **attributes** — Array of 2–6 facts. Each attribute: `{ type, value, visual_mnemonic?, priority? }`.
  - **type** — One of: `mechanism`, `location`, `effect`, `class`, `structure`, `inhibition`, `side_effect`, `receptor`, etc. Drives zone and default symbol.
  - **value** — The fact text (ground truth for legend and hotspots).
  - **visual_mnemonic** — Optional short phrase for the visual (e.g. "small figures pass through door; large figure blocked"). When set, it overrides the grammar default for that slot.
  - **priority** — Optional `'primary'`; one fact can be primary for prompt emphasis (CHECK_10, primary fact in prompt).

### 3.2 Symbol map construction (Path A)

**Logic:** `visualGrammar.buildSymbolMap(attributes)` then `symbolLibrary.enrichSymbolMapWithLibrary(symbolMap)`.

- **Zone assignment:** Each attribute gets a **zone** from `DEFAULT_ZONE_BY_TYPE` in `visualGrammar.js`:
  - `class`, `structure` → `left`
  - `mechanism`, `synthesis`, `breakdown`, `inhibition`, `receptor` → `foreground`
  - `effect`, `side_effect`, `spectrum`, `increase`, `decrease` → `right`
  - `resistance`, `exception`, `location` → `background`
  - If type not in map, zones cycle: `left`, `foreground`, `right`, `background`.
- **Symbol (visual) per slot:** **Library first**, then custom, then grammar:
  1. `getSymbolFromLibrary(attr.type)` from `symbolLibrary.js` — if present, use its `visual_description` (and attach `global_symbol_key`).
  2. Else use `attr.visual_mnemonic` if non-empty.
  3. Else `attributeToSymbol(attr.type, attr.value)` from `visualGrammar.js` (e.g. `mechanism` → `"action (cutting, blocking, tying, building)"`).

**Output:** Array of `{ attribute_type, value, symbol, zone, global_symbol_key? }`. Same length as attributes.

### 3.3 Scene blueprint (Path A)

**Logic:** `promptEngineer.buildSceneBlueprint(artifact)` in `src/services/promptEngineer.js`.

- **scene_setting** — From `SCENE_SETTING_BY_DOMAIN[artifact.domain]` (e.g. biology → "a clear, well-lit scene like a lab or cell interior") or "a single memorable scene".
- **elements** — Array of `{ visual, position }`:
  - First element: `artifact.anchor.object`, position `'center'`.
  - Next up to 3 from `symbol_map`: `visual` = first part of `slot.symbol` (before `|`) or `slot.value`; `position` = `slot.zone` (left, right, foreground, background).

### 3.4 Narrative and recall story (Path A)

- **recall_story** — From `decomposition.recall_story` if set; else `mnemonicPipeline.deriveRecallStory({ anchor, symbol_map })` (one causal sentence from anchor + foreground/right slot).
- **narrative** — From `SCENE_NARRATIVES[concept_id]` if set; else `buildNarrative(artifact)` (anchor + "To the left: …", "In the foreground: …", etc.).
- **scene_setting (UI)** — `getSceneSettingForArtifact(artifact)` for "Setting: …" in the legend.

### 3.5 Validation (Path A)

**Logic:** `withValidation(artifact)` → `mnemonicValidation.validateMnemonicArtifact(artifact)`.

- Semantic correctness (non-empty facts, no placeholders, avoid definition-only phrasing).
- Visualizability (anchor and symbols not in NON_DEPICTABLE_TERMS or ABSTRACT_PHRASE_PATTERNS; anchor concreteness heuristic).
- Chunking: 1–7 attributes; anchor present; scene element cap (5); max symbols per zone (2).
- Engine validation: `runEngineValidation(artifact)`; any failure in `HARD_FAILURE_IDS` contributes to `blockImageGeneration`.

Result is attached as `artifact._validation = { valid, warnings, blockImageGeneration }`.

---

## 4. Path B — Create from text (how information is created)

**Entry:** User pastes a paragraph or learning objective.  
**Module:** `src/services/mnemonicPipeline.js` → `runPipeline(rawInput, options)`.

### 4.1 Fact extraction

**Logic:** Try LLM first; fall back to heuristic.

1. **LLM (when `VITE_OPENAI_API_KEY` is set):** `extractFactsWithLLM(rawInput)` in `src/services/llmFacts.js`.
   - Model: `gpt-4o-mini`.
   - System prompt: Extract 3–7 atomic, testable facts; each with `fact_text`, `fact_type`, `priority`, and optional `visual_mnemonic` (short drawable phrase).
   - Returns array of `{ fact_id, fact_text, fact_type, priority, visual_mnemonic? }` or `null` on error.
2. **Fallback:** `extractFacts(rawInput)` in `mnemonicPipeline.js`:
   - Split on `[.\n;]+`, trim, drop chunks with length ≤ 10.
   - Take up to `MAX_FACTS` (7) chunks.
   - Infer **fact_type** from first word or keywords (e.g. "location", "mechanism", "effect") via `FACT_TYPE_PATTERNS`.
   - Priority: first 3 are `high`, rest `medium`.

**Constraint:** At least `MIN_FACTS` (1) fact required; otherwise pipeline returns `null`.

### 4.2 Ground-truth rewrite

**Logic:** `rewriteFactsAsGroundTruth(facts)`.

- Trim each `fact_text`, collapse whitespace, ensure it ends with a period.
- No semantic change; these sentences are the source of truth for hotspots and legend.

### 4.3 Facts → attributes

**Logic:** `factsToAttributes(facts)` (internal).

- Each fact → `{ type: fact_type, value: fact_text, priority: first is 'primary', visual_mnemonic? }`.
- When `options.concept_id` is provided, attributes are **merged** with decomposition attributes: library `visual_mnemonic` and `priority` from decomposition are applied to the same index so pipeline output matches library shape where applicable.

### 4.4 Anchor (Path B)

**Logic:** In order of precedence:

1. **Override:** If `options.anchorOverride` has `phrase` and `object`, use it.
2. **Concept:** If `options.concept_id` is set, `getPhoneticAnchor(concept_id)` from `phoneticAnchors.js`.
3. **Fallback:** `{ phrase: concept_title, object: concept_title }` (e.g. from `options.concept_title` or `"Generated concept"`).

### 4.5 Symbol map and scene blueprint (Path B)

- **Symbol map:** Same as Path A — `buildSymbolMap(attributes)` then `enrichSymbolMapWithLibrary(symbolMap)`.
- **Scene blueprint:** `buildSceneBlueprintFromPipeline(anchor, symbol_map, domain)` (in pipeline):
  - locus from `getSceneSettingForArtifact`; zones and traversal_order from symbol_map; micro_story built from "To the left: …", "In the foreground: …", etc., using fact text or symbol for each zone.

### 4.6 Image story (Path B)

**Logic:** `deriveImageStoryFromBlueprint(scene_blueprint, anchor)`.

- If `micro_story` length < 200: `"One scene: ${micro_story} No split panels."`
- Else: anchor part + first one or two sentences of micro_story + "No split panels."
- **Path B never uses hand-written image_story;** it is always derived from the blueprint.

### 4.7 Artifact assembly (Path B)

- **source_text** — Raw pasted input (trimmed).
- **created_at** — `new Date().toISOString()`.
- **encoding_mode** — From `options.encoding_mode` or `'full_mnemonic'`.
- **recall_story** — `deriveRecallStory({ anchor, symbol_map, attributes })`.
- **narrative** — `buildNarrativeFromArtifact(base)` (same zone-based narrative as Path A).
- **scene_setting** — `getSceneSettingForArtifact(base)`.
- Then `withValidation(artifact)` as in Path A.

---

## 5. Canonical artifact (logic used for UI and retrieval)

**Module:** `src/data/canonicalArtifact.js` → `toCanonicalArtifact(mnemonic, artifact)`.

**Purpose:** Single contract for encoding, retrieval, quiz prompts, and validation. Built from the same artifact whether from Path A or Path B.

### 5.1 Facts

- From `artifact.attributes`: `fact_id`, `fact_text`, `priority` (primary or high), `fact_type`.

### 5.2 Anchors

- Single primary anchor: `target_term` (concept title), `mnemonic_phrase`, `visual_description` (anchor.object), optional `scores` (for future ranking).

### 5.3 Symbol map (canonical)

- Each slot: `symbol_id`, `encodes_fact_id`, `visual_description`, `encoding_channels: ['object', 'position']`, `zone`, optional `global_symbol_key`.

### 5.4 Scene blueprint (canonical)

- `locus`, `zones`, `micro_story`, `traversal_order` (symbol_ids).

### 5.5 Hotspots

**Logic:** `hotspotsCanonical(artifact, symbolMapCanon, facts, conceptTitle, conceptId)`.

- **Positions:**  
  1. If `getHotspotOverrides(conceptId, expectedLength)` returns an array (from `src/data/hotspotOverrides.js`), use it for (xPercent, yPercent) in order [anchor, symbol_0, symbol_1, …].  
  2. Else `getHotspotPositionsWithAnchor(symbolMap)` from `src/utils/hotspotPositions.js`: anchor at (50, 50); symbols from zone-based x/y (see §7.1).

- **Structure:**  
  - First hotspot: anchor — `reveals: { term: conceptTitle, mnemonic_phrase: anchor.phrase, fact_text: anchor.object }`.  
  - Rest: one per symbol_map slot — `reveals: { term: humanized attribute_type, mnemonic_phrase: custom visual phrase if different from grammar default, fact_text: fact_text }`.

- **Validation (CHECK_14):** Hotspot count must equal `1 + attributes.length`; every hotspot must have non-empty `reveals.term` or `reveals.fact_text`.

### 5.6 Study modes

- **quiz_prompts:** `buildQuizPromptsFromHotspots(hotspots)` — up to 4 prompts (e.g. "Which part of the image encodes this? \"…\"" or "What concept does hotspot N represent?").

### 5.7 Display hotspots for UI

**Logic:** `getDisplayHotspots(canonical, resolvedPositions)`.

- If `resolvedPositions` is provided and length matches hotspots, **xPercent/yPercent are overridden** (e.g. from vision-based placement). Otherwise use canonical hotspot coordinates.
- Returns array of `{ id, label, mnemonicLogic, term, xPercent, yPercent }` for MnemonicCanvas and legend. Legend order = hotspot order.

---

## 6. Prompt construction (how the visual is specified)

**Module:** `src/services/promptEngineer.js`.  
**Entry:** `buildScenePrompt(artifact)` or `buildScenePromptWithLLM(artifact)`.

### 6.1 Style prefix (global)

**Constant:** `STYLE_PREFIX` (or `CHARACTERIZATION_STYLE` when `encoding_mode === 'characterization_only'`).

- One clear main character or focal object in the center; minimal, uncluttered background.
- High-contrast, vivid digital illustration; Pixar-style, whimsical, exaggerated, memorable, slightly surreal.
- Wide shot: one main character, at most 2–3 secondary elements.
- Concrete, recognizable shapes; one single continuous scene (no split panels).
- **ACTION_RULES:** Every element must be doing something (moving, blocking, reacting); clear cause and effect; each key fact visible as an action or event.
- **CRITICAL:** No text, words, labels, numbers, digits, or letters anywhere in the image.
- Include only elements that encode the concept; every visible element must have a mnemonic role; maximum 4 total elements; no crowds, cones, equipment, etc.
- Safe for classroom: no violence, no sexual content, no graphic or disturbing imagery.

### 6.2 Scene content (concept-dependent)

**When artifact has long image_story (length > 60):**

1. **Only-draw lead:** "Draw only the main character and the 2–4 supporting elements explicitly named in the next sentence. Do not add any other characters, objects, environments, props, or text."
2. **Normalize story:** Replace " and also " with ". "; remove "secondly", "thirdly", "additionally".
3. **Policy:** `applyPolicy(raw)` from `src/services/visualMnemonicPolicy.js` (see §8.1).
4. **Prepend anchor if needed:** If story doesn't mention "foreground" or "main character", prepend "One exaggerated main character or focal object in the foreground: [anchor.object]. "
5. **Primary fact:** Append " Main character shows or does [primaryFactVisual]."
6. **Layout line:** `deriveLayoutLine(artifact)` — e.g. "Place the main character in the center, X on the left, Y on the right."
7. **Distinct elements clause:** `deriveDistinctElementsClause(artifact)` — "Elements to show: (1) …, (2) …, … Each must be clearly visible and distinct."
8. **Minimal constraint:** " Empty, minimal background—only what is listed in the scene; no extra environments, props, or text."

**When no long image_story:**

- Scene from `deriveMinimalSceneFromBlueprint(artifact)` (single causal sentence when primary + effect exist; else primary emphasis + supporting elements), then `applyPolicy`.
- Same layout line and distinct-elements clause appended.

### 6.3 Suffixes (global)

- **NO_TEXT_SUFFIX:** " No text, no words, no labels, no numbers… Only the elements explicitly described above; no extra objects, crowds, or equipment. Purely visual illustration only."
- **SCOPE_SUFFIX:** DO_DRAW_RULE (only main character + 2–4 supporting elements named above) + DO_NOT_DRAW_RULE (no extra characters, environments, props, furniture, equipment, or text).

### 6.4 LLM scene sentence (optional)

**When:** "Regenerate image (AI)" with API key and optional use of `buildScenePromptWithLLM`.

**Logic:** `llmSceneSentence.deriveSceneSentenceFromBlueprint(artifact)` — `gpt-4o-mini` given blueprint summary (setting, anchor, supporting elements); returns one short sentence. That sentence is then passed through `applyPolicy` and composed with the same layout and distinct-elements clause and suffixes. On failure or no API key, fallback is `buildScenePrompt(artifact)`.

---

## 7. Hotspot positions (logic)

**Modules:** `src/utils/hotspotPositions.js`, `src/data/hotspotOverrides.js`, `src/services/hotspotFromImage.js`.

### 7.1 Zone-based positions (default)

- **ZONE_X:** left 18, right 82, foreground 50, background 50, center 50 (percent).
- **Y:** For N symbols, `y = 22 + (i / max(1, N-1)) * 56` (linear spread).
- When multiple slots share the same zone (same x), they are spread horizontally via `spreadSameZoneX` so they don’t stack in one vertical line.
- **Anchor:** Always first position: (50, 50). Then one position per symbol_map entry from `getHotspotPositions(symbolMap)`.

### 7.2 Per-concept overrides

- **Source:** `src/data/hotspotOverrides.js` — `HOTSPOT_OVERRIDES[concept_id]` = array of `{ xPercent, yPercent }` in order [anchor, symbol_0, …].
- **Use:** When length equals `1 + symbol_map.length` and all entries are valid 0–100, canonical build uses these instead of zone-based positions.

### 7.3 Vision-based placement (post-image)

- **When:** After DALL·E returns an image, Picmonics can call `getHotspotPositionsFromImage(imageUrl, artifact)` in the background.
- **Logic:** Object list from `getObjectListFromArtifact(artifact)` (anchor.object + each symbol_map visual). Send image + list to `gpt-4o-mini` with a system prompt asking for approximate center (xPercent, yPercent) per object. Parse JSON array; validate indices and 0–100 range.
- **Use:** If returned array length matches hotspot count, `getDisplayHotspots(canonical, resolvedPositions)` uses these coordinates instead of zone-based or override positions. Fallback: zone-based (or overrides) if vision fails or returns incomplete.

---

## 8. Rules and policy

### 8.1 Visual mnemonic policy (scene text)

**Module:** `src/services/visualMnemonicPolicy.js` → `applyPolicy(sceneDescription)`.

**Applied to:** Every scene string (from image_story or blueprint) before it is included in the DALL·E prompt.

- **Plurality rules:** Replace "small figures" → "one or two small figures", "large figures" → "one larger figure", "multiple figures/characters/people" → "one or two …", "many … figures" → "one or two small figures", "crowds" → "one or two figures", "several …" → "one or two …".
- **Forbidden phrases (removed):** traffic cones, construction equipment, cameras on tripods, spotlights, signs with numbers, scoreboards, digital displays, numbers/digits, crowds, many/numerous extra figures/people, lab/laboratory, shelves with/holding, beakers and flasks, scientists in/with/at, second/extra person, DNA helix/structure, clock on the wall. Removal is by regex; then whitespace and double periods collapsed.

**Constant:** `MAX_ELEMENTS = 5` (not enforced in applyPolicy; enforced in validation and prompt text).

### 8.2 Prompt rules (summary)

- **No text in image:** Stated in STYLE_PREFIX, NO_TEXT_SUFFIX, SCOPE_SUFFIX, and again in `imageGeneration.js` scope reinforcement at send time.
- **Element cap:** Maximum 4 total elements in scene (stated in prompt); validation caps at 5.
- **Single scene:** No split panels, no diptych, no dividers.
- **Only listed elements:** Draw only main character + 2–4 supporting elements explicitly named; nothing else.
- **Layout and distinct elements:** Layout line and "Elements to show: (1) … Each must be clearly visible and distinct" appended so DALL·E aligns with hotspot zones.

### 8.3 Image generation (send time)

**Module:** `src/services/imageGeneration.js` → `generateMnemonicImage(prompt, onStatus)`.

- **Scope reinforcement:** Appended to prompt before send: " Draw only the main character and supporting elements explicitly listed in the prompt; nothing else. Do not add any other characters, environments, props, furniture, equipment, or decorative objects. No text, words, letters, or numbers anywhere in the image. Purely visual only."
- **API:** POST to OpenAI `/v1/images/generations`; model `dall-e-3`, size `1024x1024`, quality `standard`, response_format `b64_json`. Prompt trimmed to 4000 chars.
- **Retries:** One retry on rate limit (after 65s); one retry on transient server error (after 4s).
- **Response:** Base64 image converted to data URL for display.

---

## 9. Validation (rules and gates)

### 9.1 Mnemonic validation (semantic and visualizability)

**Module:** `src/utils/mnemonicValidation.js` → `validateMnemonicArtifact(artifact)`.

- **Semantic:** Empty fact text; placeholder patterns (TBD, TODO, …); long definition-only phrasing (suggest action/cause-effect).
- **Visualizability:** Anchor and symbol descriptions checked against NON_DEPICTABLE_TERMS and ABSTRACT_PHRASE_PATTERNS; anchor concreteness heuristic (score &lt; 0.4 → warn).
- **Chunking:** 1–7 attributes; anchor (phrase or object) present; scene element count ≤ 5; per-zone symbol count ≤ 2.
- **image_story:** Abstract phrasing in image_story warned.
- **Engine:** `runEngineValidation(artifact)`; any failure in `HARD_FAILURE_IDS` (CHECK_1, CHECK_2, CHECK_4, CHECK_6, FACTS_ONLY_AS_TEXT) sets `blockImageGeneration`.

### 9.2 Engine validation (content-agnostic checks)

**Module:** `src/utils/visualMnemonicEngineValidation.js`. See also `docs/VISUAL_MNEMONIC_ENGINE_VALIDATION.md`.

| Check | Assertion | Fail condition |
|-------|-----------|-----------------|
| CHECK_1 | Concept and short description exist | No concept; no description; description &gt; 1 sentence / ~180 chars |
| CHECK_2 | 2–6 key facts; each action/property/relationship | &lt; 2 or &gt; 6 facts; definition-only facts |
| CHECK_3 | One fact marked primary (or first as primary) | No anchor and no attributes |
| CHECK_4 | Every fact has a visual (symbol_map length ≥ attributes) | Fewer visuals than facts |
| CHECK_5 | Visuals are action-based (motion, change, interaction) | Anchor + all symbols static (heuristic) |
| CHECK_6 | No orphan visuals | More symbol_map entries than attributes |
| CHECK_7 | At least one characterized agent (anchor) | No anchor.object |
| CHECK_8 | Anchor and each visual have stable name/role | Missing phrase/object or symbol/value/type |
| CHECK_9 | Single causal narrative (image_story or recall_story) | No story; "and also" or multiple "second/third/additionally" |
| CHECK_10 | (Post-image) Dominant focus = primary fact | Skipped pre-image |
| CHECK_11/12 | (Post-image) Label-off; image teaches before text | Skipped pre-image |
| CHECK_13 | Legend decodes only (no new info) | Pass (enforced by UI) |
| CHECK_14 | Hotspot count = 1 + attrs; every hotspot has term or fact_text | Count mismatch; empty reveals |
| CHECK_15 | encoding_mode is full_mnemonic or characterization_only | Other or missing |
| FACTS_ONLY_AS_TEXT | Facts not only as text (symbol_map present) | Facts but no symbol_map |

**Hard failure IDs:** CHECK_1, CHECK_2, CHECK_4, CHECK_6, FACTS_ONLY_AS_TEXT. When any of these fail, `blockImageGeneration` is set in mnemonic validation.

---

## 10. Guidelines (design and checklist)

### 10.1 Visual learning checklist (prompt and validation)

- Every element must be **doing something** (moving, blocking, reacting, causing a visible effect).
- **Cause and effect** visible in the scene.
- Each key fact **visible as an action or event**, not only as a static object.
- **Concrete, recognizable shapes** with strong personality; not a literal diagram or generic lab.
- **One single continuous scene**; no split panels.

### 10.2 Symbol library and grammar

- **Library first:** For each attribute type, `symbolLibrary.getSymbolFromLibrary(type)` is used first; then per-attribute `visual_mnemonic`; then `visualGrammar.attributeToSymbol(type)`.
- **Zones:** Fixed mapping from attribute type to zone (cause/class left, mechanism foreground, effect/right, associations/background) to support spatial memory and consistent layout.
- **Versioning:** `SYMBOL_LIBRARY_VERSION` in symbolLibrary; `SCHEMA_VERSION` in canonicalArtifact; both appear in canonical `versioning`.

### 10.3 Data flow invariants

- **Facts = source of truth:** Hotspots and legend always reflect `attributes` / canonical `facts`; visuals encode them, they do not invent new facts.
- **One anchor per concept:** Single primary anchor; first hotspot is always the anchor.
- **Legend–hotspot parity:** Same order (anchor then symbol_map); CHECK_14 enforces count and non-empty reveals.
- **No text in image:** Enforced by style, suffix, scope, and send-time reinforcement; all meaning in overlay hotspots and legend.

### 10.4 Optional / future

- **Layout preset:** In `hotspotPositions.js`, a preset (e.g. "memory-palace") could supply different default (x, y) per zone/index (not implemented).
- **Post-image checks:** Store prompt + image; optional human or model pass/fail to gate accept and tune prompts (CHECK_11/12; documented, not automated).
- **Anchor generation:** Master Doc suggests phonetic + concreteness ranking; current system uses static lookup only (phoneticAnchors.js).

---

## 11. File reference (traceability)

| Role | File |
|------|------|
| Concept/fact source | `src/data/conceptDecompositions.js` |
| Phonetic anchors | `src/data/phoneticAnchors.js` |
| Fact → symbol + zone | `src/data/visualGrammar.js` |
| Library enrichment | `src/data/symbolLibrary.js` |
| Path A artifact | `src/data/picmonics.js` (getMnemonicArtifact) |
| Path B pipeline | `src/services/mnemonicPipeline.js` |
| LLM fact extraction | `src/services/llmFacts.js` |
| LLM scene sentence | `src/services/llmSceneSentence.js` |
| Scene prompt | `src/services/promptEngineer.js` |
| Scene policy | `src/services/visualMnemonicPolicy.js` |
| Image API | `src/services/imageGeneration.js` |
| Canonical + hotspots | `src/data/canonicalArtifact.js` |
| Hotspot positions (zone) | `src/utils/hotspotPositions.js` |
| Hotspot overrides | `src/data/hotspotOverrides.js` |
| Vision-based placement | `src/services/hotspotFromImage.js` |
| Semantic/visualizability validation | `src/utils/mnemonicValidation.js` |
| Engine validation | `src/utils/visualMnemonicEngineValidation.js` |
| UI (concept list, artifact → prompt → image) | `src/components/Picmonics.jsx` |
| Canvas (hotspots, study modes) | `src/components/MnemonicCanvas.jsx` |

---

*This document reflects the codebase as of Feb 2026. For pipeline summary and what’s next, see [PICMONIC_FEATURE_OVERVIEW.md](PICMONIC_FEATURE_OVERVIEW.md). For the validation checklist only, see [VISUAL_MNEMONIC_ENGINE_VALIDATION.md](VISUAL_MNEMONIC_ENGINE_VALIDATION.md).*
