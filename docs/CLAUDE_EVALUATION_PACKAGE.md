# What to Provide Claude to Evaluate the Picmonic System

Use this list when feeding the **current system** into Claude so it can evaluate it against **supporting documentation** on how to make excellent picmonics.

---

## 1. Code that drives current logic (in flow order)

These files **are** the implementation. Provide them so Claude knows exactly how the system works.

| Order | File | Role |
|-------|------|------|
| 1 | `src/data/conceptDecompositions.js` | Concept data: attributes, image_story, recall_story, visual_mnemonic per fact. |
| 2 | `src/data/phoneticAnchors.js` | Phonetic anchor (phrase + object) per concept. |
| 3 | `src/data/visualGrammar.js` | Attribute type → symbol, zone; buildSymbolMap. |
| 4 | `src/data/symbolLibrary.js` | Global symbol by type (library-first). |
| 5 | `src/data/picmonics.js` | getMnemonicArtifact (Path A: decomposition + anchor + symbol map). |
| 6 | `src/services/mnemonicPipeline.js` | Path B: create-from-text; deriveRecallStory; merge when concept_id. |
| 7 | `src/utils/mnemonicValidation.js` | Artifact-level validation (semantic, visualizability). |
| 8 | `src/utils/visualMnemonicEngineValidation.js` | Pre-image engine checks (CHECK_1 … CHECK_15). |
| 9 | `src/services/visualMnemonicPolicy.js` | applyPolicy on scene text (plurality, forbidden phrases). |
| 10 | `src/services/promptEngineer.js` | **Prompt construction:** STYLE_PREFIX, deriveMinimalSceneFromBlueprint (strong-verb causal), layout, distinct-elements, anthropomorphism, buildScenePrompt, buildScenePromptWithLLM. |
| 11 | `src/services/imageGeneration.js` | DALL·E call, no-text reinforcement. |
| 12 | `src/data/canonicalArtifact.js` | toCanonicalArtifact, hotspotsCanonical, getDisplayHotspots (overrides, vision). |
| 13 | `src/data/hotspotOverrides.js` | Per-concept position overrides. |
| 14 | `src/utils/hotspotPositions.js` | Zone-based default x/y; same-zone spread. |
| 15 | `src/services/hotspotFromImage.js` | Vision-based placement after image gen. |

**UI (optional for “how the image is specified”):** `src/components/Picmonics.jsx` (artifact choice, prompt build, hotspots, legend); `src/components/MnemonicCanvas.jsx` (hotspots, labels, hover).

---

## 2. Docs that describe current behavior (authoritative)

These docs are derived from or aligned with the code. They describe **how the system works today**.

| Doc | Purpose |
|-----|--------|
| **docs/PICMONIC_GENERATION_PROCESS.md** | **Full specification:** every step (Path A/B, artifact, validation, prompt §6, style prefix, strong-verb causal, anthropomorphism, layout, suffixes, DALL·E, hotspots). Use as the single “how generation works” reference. |
| **docs/PICMONIC_FEATURE_OVERVIEW.md** | Pipeline overview, data flow, image generation paragraph, hotspots and UX status, completed items, key files. “How Picmonics work” in brief. |

Provide both so Claude has both high-level and step-by-step descriptions of current behavior.

---

## 3. Supporting docs: what “excellent” means (criteria and principles)

These define **quality criteria** and **best practices** so Claude can evaluate the current system against them.

| Doc | Purpose |
|-----|--------|
| **docs/VISUAL_MNEMONIC_ENGINE_VALIDATION.md** | **Validation checklist:** CHECK_1 … CHECK_15, north star (“image must independently reconstruct key facts”), story/causal logic, pre-image gates. Defines “valid” and “invalid” outputs. |
| **docs/MNEMONIC_IMAGE_AND_CHARACTER_IMPROVEMENTS.md** | Maps Visual Learning / Picmonic-Sketchy-Pixorize principles to our system; what we implemented (strong verbs, character distinctiveness, anthropomorphism, bizarre excellence, size/color); optional gaps (locus, global symbol by meaning). Use as the bridge between “excellent picmonics” theory and our current prompt/artifact logic. |

**External reference (if you have it in a doc):** Your “Visual Learning Info” / memory techniques / cognitive principles (phonetic anchoring, Von Restorff, Method of Loci, narrative binding, etc.). If it’s not in the repo, paste the relevant excerpts or summarize; MNEMONIC_IMAGE_AND_CHARACTER_IMPROVEMENTS.md already summarizes and maps much of it to our code.

---

## 4. Optional context (not required for evaluation)

| Doc | Use |
|-----|-----|
| docs/HOTSPOT_AND_PICMONIC_IMPROVEMENTS.md | Optional UI/hotspot work (layout preset, callout styling). |
| docs/MASTER_DOC_COMPARISON_AND_IMPROVEMENTS.md | Comparison to a master spec; some gaps may be outdated. |
| docs/README.md | Doc index; points to the authoritative docs above. |

---

## 5. Minimal “evaluation package” (if token-limited)

**Smallest set that still lets Claude evaluate “current system vs. excellence criteria”:**

1. **Code:** `src/services/promptEngineer.js` (full file) — this is where the mnemonic image is specified (style, causal sentence, layout, anthropomorphism).
2. **Current behavior:** `docs/PICMONIC_GENERATION_PROCESS.md` (at least §1–2, §6, §7.1).
3. **Excellence criteria:** `docs/VISUAL_MNEMONIC_ENGINE_VALIDATION.md` (full); `docs/MNEMONIC_IMAGE_AND_CHARACTER_IMPROVEMENTS.md` (§1 table, §2 gaps, §3 list).

Add more code (e.g. visualGrammar, canonicalArtifact, mnemonicPipeline) and PICMONIC_FEATURE_OVERVIEW if you want evaluation of the full pipeline, not just the prompt.

---

## 6. Suggested prompt to Claude

After providing the files above, you can say something like:

- “Using the code and docs I provided: (1) Describe how our picmonic system currently works end-to-end. (2) Evaluate it against the validation checklist (VISUAL_MNEMONIC_ENGINE_VALIDATION) and the principles in MNEMONIC_IMAGE_AND_CHARACTER_IMPROVEMENTS. (3) List specific gaps or risks and suggest concrete, content-agnostic improvements that would make our outputs closer to ‘excellent picmonics’ without changing product scope.”

This keeps the evaluation grounded in **current logic and implementation** (code + PICMONIC_GENERATION_PROCESS + PICMONIC_FEATURE_OVERVIEW) and **supporting documentation** (validation + mnemonic image principles).
