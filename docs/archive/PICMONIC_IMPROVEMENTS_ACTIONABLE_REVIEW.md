# Picmonic “How It Could Be Improved” — Actionable Review

**Date:** February 2026  
**Source:** `docs/PICMONIC_FEATURE_OVERVIEW.md` (§ How It Could Be Improved) + codebase audit  
**Purpose:** Determine which improvements are still actionable and relevant for the app.

---

## Summary

| # | Improvement | Status | Actionable? |
|---|-------------|--------|------------|
| 1 | Per-fact visuals by default | **Not done** | ✅ Yes |
| 2 | Encoding mode up front | **Not done** | ✅ Yes |
| 3 | Post-image checks | **Not done** | ✅ Yes |
| 4 | Single causal story in prompt | **Partial** | ✅ Yes |
| 5 | Primary fact and layout | **Partial** | ✅ Yes |
| 6 | Pipeline vs library parity | **Partial** | ✅ Yes |
| 7 | Machine-readable checklist | **Not done** | ✅ Yes |

All seven items remain **actionable**. None are obsolete; several are partially addressed and can be completed.

---

## 1. Per-fact visuals by default

**Doc:** Many concepts only have a custom anchor; facts fall back to generic grammar (“action (cutting, blocking…)”). Add or generate `visual_mnemonic` for every attribute so every fact has a concrete visual phrase.

**Codebase state:**
- `visualGrammar.buildSymbolMap()` already supports `attr.visual_mnemonic` and uses it when set (`visualGrammar.js` L95–99).
- `conceptDecompositions.js`: only a few concepts set `visual_mnemonic` (e.g. photosynthesis, cell-cycle); most attributes use the generic `attributeToSymbol(type)` fallback.
- Pipeline path (`mnemonicPipeline.factsToAttributes`) does **not** pass or produce `visual_mnemonic`; pipeline-generated artifacts always get grammar fallbacks.

**Verdict:** **Actionable.**  
- **Library path:** Add `visual_mnemonic` to more attributes in `conceptDecompositions.js`, or add a step (template or LLM) to generate one per attribute for concepts that lack it.  
- **Pipeline path:** Extend fact extraction (e.g. `llmFacts` or a new LLM call) to optionally emit a short visual phrase per fact and pass it through as `visual_mnemonic` in attributes.

---

## 2. Encoding mode up front

**Doc:** Engine validation (CHECK_15) expects a choice: characterization-only vs full mnemonic. Today the pipeline is always full mnemonic. Add explicit `encoding_mode` and use it to simplify prompts for “easy” concepts and strengthen symbolism for “exam-heavy” ones.

**Codebase state:**
- `visualMnemonicEngineValidation.js` CHECK_15: “Encoding mode: we currently always use full mnemonic; could add artifact.encoding_mode later.” Returns `pass: true` (no enforcement).
- No `encoding_mode` on artifacts in `picmonics.js`, `mnemonicPipeline.js`, or `conceptDecompositions.js`.
- `promptEngineer.js` and `llmSceneSentence.js` do not branch on any mode.

**Verdict:** **Actionable.**  
- Add `encoding_mode: 'full_mnemonic' | 'characterization_only'` to artifact shape (and optionally to decomposition or runPipeline options).  
- In validation: CHECK_15 fails if `encoding_mode` is missing.  
- In prompt building: use mode to shorten/soften prompts for characterization-only and keep current (or stronger) symbolism for full mnemonic.

---

## 3. Post-image checks

**Doc:** CHECK_11 (label-off) and CHECK_12 (image teaches before text) are documented but not run automatically. Add a lightweight post-generation step: store prompt + image, then human “pass/fail” or a simple model call to gate “accept image” and feed back into prompt tuning.

**Codebase state:**
- `visualMnemonicEngineValidation.js`: CHECK_11 and CHECK_12 return `pass: true, skipped: true` (post-image).
- `imageGeneration.generateMnemonicImage()` returns `{ url }` or `{ error }`; no validation after generation. No storage of prompt+image for review.
- No UI for “accept/reject image” or for running a post-check (human or model).

**Verdict:** **Actionable.**  
- **Minimal:** Persist `{ concept_id, prompt, image_url, generated_at }` when an image is generated (e.g. in state or a simple store). Add an optional “Pass / Fail” (or 1–5) in dev/admin UI to collect labels.  
- **Next:** Call a small “describe what you see” (e.g. GPT-4o) on the image and compare to expected concept/facts to auto-flag failures; optionally block “accept” until pass or override.

---

## 4. Single causal story in prompt

**Doc:** CHECK_9 (single causal narrative) is asserted but not always enforced in the prompt. Make cause→effect explicit in the scene sentence (e.g. “X does Y, so Z”) and keep “and also” / multiple processes out.

**Codebase state:**
- **Validation:** CHECK_9 fails if `image_story`/`recall_story` contain “and also” or multiple “second/third/additionally” (`visualMnemonicEngineValidation.js` L118–124).
- **Prompt building:** `promptEngineer.js` uses `ACTION_RULES` (“Show a clear cause and effect…”) but `deriveMinimalSceneFromBlueprint()` only concatenates “One main character… One or two supporting elements: …” — no explicit “X does Y, so Z” structure.  
- **Pipeline:** `deriveRecallStory()` in `mnemonicPipeline.js` does build a causal sentence (“The [anchor] does [mechanism], so [effect]”) for recall_story; that is not the same as the text sent to DALL·E.

**Verdict:** **Actionable (partial).**  
- Enforce cause→effect in the **scene sentence used for the image**: e.g. in `deriveMinimalSceneFromBlueprint` or in `llmSceneSentence` system prompt, require “Main character does [action], so [outcome]” and forbid “and also” / multiple processes.  
- Optionally run CHECK_9 against the final prompt (or the sentence passed to DALL·E) before calling the image API.

---

## 5. Primary fact and layout

**Doc:** CHECK_3 (one primary fact) and CHECK_10 (primary visually dominant) are only partly enforced. Mark primary in decomposition (e.g. `priority: 'primary'` on one attribute) and pass it into the prompt (“Main character shows [primary]; other elements support.”).

**Codebase state:**
- **CHECK_3:** “Primary fact: we treat first attribute or anchor as primary” — no explicit `priority: 'primary'` in data (`visualMnemonicEngineValidation.js` L75–79).
- **CHECK_10:** Returns `pass: true, skipped: true` (layout dominance is post-image) (L126–129).
- **Data:** `canonicalArtifact.factsFromAttributes()` sets `priority: 'high'` for every fact (L23); no decomposition field for primary. `conceptDecompositions` attributes have no `priority`.
- **Prompt:** `promptEngineer.js` does not mention “primary” or “main fact”; layout is “main character in center” + “supporting elements.”

**Verdict:** **Actionable (partial).**  
- In decomposition (and pipeline if desired): allow one attribute to have `priority: 'primary'` (or equivalent).  
- In `canonicalArtifact.factsFromAttributes`, map that to canonical facts (e.g. one `priority: 'primary'`, rest secondary).  
- In `buildSceneBlueprint` / `deriveMinimalSceneFromBlueprint` (or LLM scene sentence): pass primary fact into the prompt, e.g. “Main character shows [primary fact]; other elements support.”  
- CHECK_3 can then require exactly one primary; CHECK_10 remains post-image unless you add a prompt-level check that the primary is mentioned as dominant.

---

## 6. Pipeline vs library parity

**Doc:** “Create from text” and library picmonics should produce the same artifact shape; both should be able to attach `visual_mnemonic` and `encoding_mode` for downstream and validation.

**Codebase state:**
- **Library:** `picmonics.getMnemonicArtifact()` uses decomposition (attributes with optional `visual_mnemonic`) and phonetic anchor; artifact has `concept`, `domain`, `anchor`, `symbol_map`, `attributes`, `image_story`, `recall_story`, etc.  
- **Pipeline:** `mnemonicPipeline.runPipeline()` builds `attributes` via `factsToAttributes(facts)` (no `visual_mnemonic`), same `buildSymbolMap` + `enrichSymbolMapWithLibrary`, and derives `image_story` / `recall_story` from blueprint. Output is passed through `withValidation(artifact)` and has the same top-level shape.  
- **Gaps:** Pipeline attributes are `{ type, value }` only (no `visual_mnemonic`). Neither path sets `encoding_mode`. Library uses pre-written `image_story`/`recall_story` where present; pipeline always derives. So artifact shape is the same, but pipeline cannot yet carry per-fact visuals or encoding mode.

**Verdict:** **Actionable (partial).**  
- Unify by: (1) allowing pipeline to set `visual_mnemonic` per fact (see #1), and (2) adding `encoding_mode` to both paths (see #2).  
- Ensure both paths call the same validation and canonical artifact builder so that “Create from text” and library picmonics are interchangeable for downstream (legend, quiz, validation export).

---

## 7. Machine-readable checklist

**Doc:** Optionally export engine validation results (e.g. JSON or dashboard) per concept or per run (passed/failed/skipped, hard failure) to track quality over time and tune thresholds.

**Codebase state:**
- `runEngineValidation(artifact, options)` returns `{ passed, failed, skipped, hardFailure }` in memory only.  
- No export to JSON/file, no dashboard, no persistence.  
- Validation is run before image generation in the UI flow but results are not stored or aggregated.

**Verdict:** **Actionable.**  
- Add a small export helper, e.g. `exportValidationReport(artifact, runResult, options)` → JSON object (concept_id, timestamp, passed/failed/skipped ids, hardFailure, optional prompt/image ref).  
- Call it when running validation (e.g. in Picmonics when building artifact or when “Generate image” is clicked) and either log it, send to a backend, or offer a “Download validation report” in dev.  
- Later: dashboard or batch script over stored reports for “per concept” or “per run” views.

---

## Cross-reference: CODEBASE_AUDIT_AND_IMPROVEMENTS.md

From the general codebase audit, these items are **already implemented** (as of the audit’s “Implemented” note):

- P0: Anchor suggestion fix (`suggestedAnchor.visual` → `object` in Picmonics) — **done** (confirmed in `Picmonics.jsx` L195–196).
- P1: API key centralization (`aiCapability.js`), due/streak on Progress — **done**.
- P2: AITutor opener error + retry, `useEscapeToExit`, hide dev toggle — **done**.

Still **actionable** from the audit (and consistent with this doc):

- **Validation as list of rules** (audit §4.3): Move validation to an array of `{ check, message }` to avoid scattering conditionals — supports improvement #7 and future checks.
- **Lazy loading** (audit §6.1): Lazy-load Timeline, Recovery, Social, study aides — improves performance; orthogonal to picmonic content improvements.
- **Tests** (audit §7.3): Unit tests for `spacedReview`, `extractFacts`/`rewriteFactsAsGroundTruth`, `getDueForReview` — improves safety when changing pipeline (#6) or validation (#7).

---

## Recommended order of work

1. **High impact, low effort**  
   - **#4 Single causal story in prompt:** Tighten `deriveMinimalSceneFromBlueprint` or LLM scene prompt to “X does Y, so Z” and avoid “and also.”  
   - **#7 Machine-readable checklist:** Add `exportValidationReport()` and call it where validation runs; optional “Download report” in dev.

2. **High impact, medium effort**  
   - **#1 Per-fact visuals:** Add `visual_mnemonic` to more library concepts and/or generate it in the pipeline.  
   - **#5 Primary fact and layout:** Add `priority: 'primary'` to one attribute in decomposition (and pipeline), then pass primary into scene prompt and canonical facts.

3. **Medium impact, clarifies design**  
   - **#2 Encoding mode:** Add `encoding_mode` to artifact and CHECK_15; use it in prompt/validation.  
   - **#6 Pipeline vs library parity:** After #1 and #2, ensure both paths set `visual_mnemonic` and `encoding_mode` and share the same validation/canonical path.

4. **Quality gate and tuning**  
   - **#3 Post-image checks:** Store prompt+image; add optional human pass/fail or model-based “describe what you see” and gate accept.

---

## Implementation summary (Feb 2026)

Primary fact (#5): canonicalArtifact respects priority; conceptDecompositions + pipeline set primary; promptEngineer builds causal sentence and primary emphasis; Picmonics shows "Main idea:" first. Single causal story (#4): image_story sanitized; recall_story derived when missing; deriveRecallStory exported. Per-fact visuals (#1): llmFacts returns visual_mnemonic; pipeline passes it through; more concepts have visual_mnemonic in decomposition.

---

## Conclusion

All seven “How It Could Be Improved” items are still **actionable and relevant**. The codebase already supports part of the work (e.g. `visual_mnemonic` in grammar, CHECK_9 in validation, anchor fix and API key centralization from the audit). Prioritizing **#4** and **#7** first gives quick wins; **#1** and **#5** then improve content and layout; **#2** and **#6** align encoding mode and pipeline/library; **#3** adds a quality loop after image generation.
