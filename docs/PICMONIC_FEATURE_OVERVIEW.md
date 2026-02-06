# Picmonic Feature — How It Works

Concise overview: logic, inputs/outputs, and improvement directions.

---

## What It Does

Picmonics turn a **concept** into a **single visual scene** that encodes 2–6 **key facts** via a **phonetic anchor** (main character) and **symbol map** (supporting visuals). The image is generated from a text prompt; the UI shows the image plus hotspots, legend, and study modes (hover/click/quiz).

**North star:** If the image does not independently reconstruct the concept’s key facts, it is invalid. (See [VISUAL_MNEMONIC_ENGINE_VALIDATION.md](VISUAL_MNEMONIC_ENGINE_VALIDATION.md).)

---

## Simple walkthrough (no code)

1. **Content** (concept or pasted text) → **artifact** (anchor + symbol_map + image_story). Two ways: **Path A** = pre-authored concept (decomposition + phonetic anchor + symbol map; hand-written `image_story`). **Path B** = create from text (LLM/heuristic facts → attributes → anchor + symbol map → blueprint → derived `image_story`).
2. **Artifact** → **prompt** (style + “only draw…” + scene + no-text + scope). Built by `buildScenePrompt(artifact)` or `buildScenePromptWithLLM`; all scene text passes through `visualMnemonicPolicy.applyPolicy`.
3. **Prompt** → **DALL·E 3** → image; post-image record stored; image shown with hotspots and legend. Hotspot positions: zone-based defaults, per-concept overrides when present, or vision-based placement after generation.

---

## Logic Pipeline

```
Concept ID or raw text
    → Decomposition (key facts + metadata)
    → Phonetic anchor (concept → “main character”)
    → Symbol map (each fact → one visual)
    → Scene blueprint + image_story
    → Validation
    → Canonical artifact (facts, hotspots, quiz)
    → [Optional] Image generation (DALL·E)
    → UI: image + legend + study modes
```

### 1. Inputs

| Input | Source | Role |
|-------|--------|------|
| **Concept ID** | Course/topic (e.g. `cell-cycle`, `photosynthesis`) | Picks decomposition + anchor from static data. |
| **Raw text** (optional) | “Create from text” paste | Fed to pipeline: LLM/heuristic fact extraction → same downstream path. |
| **Decomposition** | `conceptDecompositions.js` | `concept`, `core_concept`, `summary`, `attributes[]` (type + value; optional `visual_mnemonic`). |
| **Phonetic anchor** | `phoneticAnchors.js` | `phrase` + `object` (e.g. “Cell cycle” → “a bicycle wheel with G1, S, G2, M on the spokes”). |

### 2. Core Transformations

| Step | Module | In → Out |
|------|--------|----------|
| **Facts → symbols** | `visualGrammar.buildSymbolMap(attributes)` | Each attribute → `{ attribute_type, value, symbol, zone }`. Symbol = `visual_mnemonic` if set, else `attributeToSymbol(type)` (e.g. mechanism → “action (cutting, blocking…)”). Zone from type (left/foreground/right/background). |
| **Symbol map enrichment** | `symbolLibrary.enrichSymbolMapWithLibrary` | Can override symbols from a library by type/value. |
| **Scene blueprint** | Pipeline / `promptEngineer.buildSceneBlueprint` | Anchor (center) + symbol_map (zones) → `scene_setting`, `elements[]` (visual + position). |
| **Image story** | Decomposition `image_story` or `deriveImageStoryFromBlueprint` / `deriveMinimalSceneFromBlueprint` | One short scene description (anchor + up to 3 elements) for the prompt. |
| **Narrative / recall** | Decomposition `recall_story` or `deriveRecallStory` | One causal sentence for “replay in your head” and transcript. |

### 3. Validation

- **Pre-artifact:** Engine checks (`visualMnemonicEngineValidation.runEngineValidation`): concept + description, 2–6 facts, fact↔visual binding, anchor present, single causal story, etc. Hard failures block image generation.
- **Artifact-level:** `mnemonicValidation.validateMnemonicArtifact`: semantic correctness, visualizability, attribute count, anchor, scene element cap, zones, no abstract phrasing in `image_story`. Warnings + `blockImageGeneration` when critical.

### 4. Canonical Artifact

`canonicalArtifact.toCanonicalArtifact(mnemonic, artifact)` produces the contract used by the UI:

- **facts** — from `artifact.attributes` (fact_id, fact_text, priority, fact_type).
- **anchors** — single primary anchor (target_term, mnemonic_phrase, visual_description).
- **hotspots** — one per anchor + one per symbol_map slot: `reveals: { term, mnemonic_phrase, fact_text }`, plus xPercent/yPercent. `mnemonic_phrase` is the **custom visual** (e.g. per-fact `visual_mnemonic`) when it differs from the default grammar; otherwise empty so the legend doesn’t repeat template text.
- **study_modes** — learning/recall/occlusion, quiz_prompts from hotspots.

`getDisplayHotspots(canonical)` maps to `{ id, label, mnemonicLogic, term, xPercent, yPercent }` for the canvas and legend.

### 5. Image Generation

- **Prompt:** `promptEngineer.buildScenePrompt(artifact)` (or `buildScenePromptWithLLM`): style + action rules + no-text rule + minimal scene (anchor + up to 3 elements). Policy applied to any user-facing scene text.
- **API:** `imageGeneration.generateMnemonicImage(prompt, onStatus)` → image URL. No labels in the image; all meaning via hotspots/legend.

### 6. Outputs (to UI / downstream)

| Output | Shape | Use |
|--------|--------|-----|
| **Artifact** | concept, domain, anchor, symbol_map, attributes, image_story, recall_story, narrative, scene_setting, _validation | Single source for legend, narrative, validation UI. |
| **Canonical** | facts, anchors, hotspots, scene_blueprint, study_modes (quiz_prompts) | Encoding, retrieval, quiz. |
| **Display hotspots** | id, label (fact_text), mnemonicLogic (custom visual phrase), term, xPercent, yPercent | Overlays, “Map to the image,” Key Facts hints. |
| **Image URL** | string | Rendered in canvas; study modes toggle labels. |

---

## Data Flow (Simplified)

```
conceptDecompositions[concept_id]     phoneticAnchors[concept_id]
         │                                      │
         ▼                                      ▼
   attributes (2–6)  ──► buildSymbolMap ──► symbol_map (zone, symbol per fact)
         │                    │
         │                    └── optional visual_mnemonic per attribute
         │
         └── anchor (phrase, object) ──► center of scene

artifact = { concept, anchor, symbol_map, attributes, image_story, recall_story, ... }
         │
         ├── withValidation(artifact)  → _validation.warnings, blockImageGeneration
         ├── toCanonicalArtifact(...)   → hotspots, facts, quiz_prompts
         └── buildScenePrompt(artifact) → DALL·E prompt → image URL
```

---

## Path A vs B and policy

| What | Scope |
|------|--------|
| **STYLE_PREFIX, NO_TEXT_SUFFIX, noTextReinforcement** | **Global** — every prompt. |
| **visualMnemonicPolicy.applyPolicy** | **Global** — all scene text (plurality, forbidden props, cap). |
| **image_story** (per concept) | **Per-concept** — hand-written in decomposition for Path A; derived from blueprint for Path B. |
| **buildSceneBlueprint** / **deriveMinimalSceneFromBlueprint** | **Global** — used when no image_story or to build layout line. |

**Policy today:** Pre-authored `image_story` when present (long enough); otherwise derive from blueprint. Primary fact injected into prompt when available. Optional future: **Option B** (blueprint-first for every concept) or **Option C** (blueprint default + optional image_story override after policy). See archive for full policy options doc.

---

## Hotspots and UX

**Status (done):** Layout line + distinct-elements clause in prompt; per-concept overrides (`hotspotOverrides.js`); CHECK_14 hotspot–legend parity; legend-hover → highlight hotspot (`narrativeHighlightId`); recall story between Core mnemonic and hotspot list; vision-based placement after image gen (`hotspotFromImage.js`). **Optional:** Layout preset in `hotspotPositions.js`; callout styling (offset tooltip from circle when “Show all labels”).

**Current behavior:** Hotspots from symbol_map (one per anchor + one per fact). Positions: zone defaults → overrides by concept_id when length matches → vision (x%, y%) when available. Prompt includes layout (left/center/right) and “Elements to show: (1) … Each must be clearly visible and distinct.” Legend order = hotspot order; ★/1,2,3 and accent color shared; hover legend row highlights hotspot.

**Code (hotspots):** `hotspotPositions.js` (zone x/y), `hotspotOverrides.js`, `canonicalArtifact.hotspotsCanonical(…, conceptId)`, `hotspotFromImage.getHotspotPositionsFromImage`, `promptEngineer.deriveLayoutLine` / `deriveDistinctElementsClause`, `MnemonicCanvas` (hotspots, accentColor, narrativeHighlightId), `Picmonics.getDisplayHotspots`. Validation: `visualMnemonicEngineValidation` CHECK_14.

**General problems (reference):** Anchor off-center; clusters on one blob; missing distinct object for a fact; hotspot on empty space; prompt layout not respected; spurious hotspots; overlap with UI. Mitigations in place: layout in prompt, overrides, vision, CHECK_14.

---

## Completed (verified in code)

- **Per-fact `visual_mnemonic`** — All concepts in `conceptDecompositions.js` have `visual_mnemonic` on every attribute; legend uses them in Map to the image.
- **Try another scene** — When multiple variants exist (e.g. Cell Membrane × 2), “Try another scene” button cycles variants; saved preference via `savedVariant.js`.
- **Primary fact in prompt** — `getPrimaryFactVisual(artifact)` used; “Main character shows or does [primary]” appended when using `image_story` so CHECK_10 is reinforced.
- **Pipeline vs library parity** — Library artifact includes `scene_blueprint`; pipeline merges `visual_mnemonic` and `priority` from decomposition when `concept_id` is provided; same artifact shape and encoding_mode.
- **Encoding mode** — `encoding_mode` (full_mnemonic / characterization_only) in decomposition and options; used in prompt (CHARACTERIZATION_STYLE when characterization_only) and validation (CHECK_15).
- **Setting + type tags + mnemonic_narrative** — Setting line above Map to the image when `scene_setting` exists; type tag per fact from attribute type; optional `mnemonic_narrative` shown at top of “How to remember it.”

## Remaining improvements

- **Optional `mnemonic_narrative`** — Add 2–4 sentence narratives in decomposition for key concepts; UI already shows them. Content only.
- **Post-image checks** — After generation: store prompt + image; optional human or model pass/fail to gate accept and tune prompts (CHECK_11/12).

---

## Key Files

| Role | Path |
|------|------|
| Concept + fact source | `src/data/conceptDecompositions.js` |
| Phonetic anchors | `src/data/phoneticAnchors.js` |
| Fact → symbol + zone | `src/data/visualGrammar.js` |
| Library enrichment | `src/data/symbolLibrary.js` |
| Pipeline (text → artifact) | `src/services/mnemonicPipeline.js` |
| Library artifact builder | `src/data/picmonics.js` (getMnemonicArtifact) |
| Scene prompt for DALL·E | `src/services/promptEngineer.js` |
| Image API | `src/services/imageGeneration.js` |
| Canonical + hotspots | `src/data/canonicalArtifact.js` |
| Validation (semantic + engine) | `src/utils/mnemonicValidation.js`, `src/utils/visualMnemonicEngineValidation.js` |
| UI | `src/components/Picmonics.jsx`, `MnemonicCanvas.jsx` |

---

## How to Test

### Manual (UI)

1. **Run the app:** `npm run dev` → open the URL (e.g. http://localhost:5173).
2. **Open Picmonics:** Go to a course (e.g. BIO 201) and open the Picmonics / visual mnemonics section.
3. **Pick a concept:** Select e.g. **Cell Cycle** or **Photosynthesis**.
4. **Check content:**
   - **What it is** — One clear lead sentence + optional detail; no template phrases.
   - **How to remember it** — Core mnemonic card + **Map to the image** (★ anchor + numbered facts, blue picmonic characters, definitions, optional type tags and Setting); optional mnemonic narrative when present.
5. **Validation:** If you see “Validation: … Generate image is disabled,” fix the reported issue (e.g. empty fact, missing anchor) in decomposition or pipeline.
6. **Generate image (optional):** Click “Regenerate image (AI)” (requires API key). Confirm prompt has no baked-in labels and image matches the scene.
7. **Study modes:** Switch Hover / Click / Cover one / Quiz; labels and hotspots should match the same facts.

### Automated (unit tests)

Run the engine validation and canonical path in isolation:

```bash
npm test
```

Tests cover:

- **Engine validation** — `runEngineValidation(artifact)` passes for valid artifacts (e.g. Cell Cycle, Photosynthesis), fails hard when facts missing or no visual mapping.
- **Canonical artifact** — `toCanonicalArtifact` + `getDisplayHotspots`: correct number of hotspots (1 anchor + N facts), `mnemonicLogic` set when symbol ≠ default.
- **Symbol map** — `buildSymbolMap(attributes)`: uses `visual_mnemonic` when present, else grammar default; zones assigned.

Add or extend tests in:
- `src/utils/visualMnemonicEngineValidation.test.js`
- `src/data/canonicalArtifact.test.js`
- `src/data/visualGrammar.test.js`

---

## What’s Next

| Priority | What | Effort |
|----------|------|--------|
| **1** | **Optional `mnemonic_narrative`** | Add 2–4 sentence “how to remember” narratives in decomposition for high-value concepts. No code change. |
| **2** | **Post-image checks** | Store prompt + image after generation; optional pass/fail (human or model) to gate accept and tune prompts. |

---

## See also

- **Validation checklist:** [VISUAL_MNEMONIC_ENGINE_VALIDATION.md](VISUAL_MNEMONIC_ENGINE_VALIDATION.md)
- **Hotspot optional work:** [HOTSPOT_AND_PICMONIC_IMPROVEMENTS.md](HOTSPOT_AND_PICMONIC_IMPROVEMENTS.md) (layout preset, callout styling; main hotspot content is above)
- **App-wide priorities:** [SIMPLIFIED_HIGH_VALUE_ROADMAP.md](SIMPLIFIED_HIGH_VALUE_ROADMAP.md)
- **Doc index:** [README.md](README.md)
