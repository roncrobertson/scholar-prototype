# Scholar Prototype — Handoff for New Thread / Continuation

Use this file when starting a **new Cursor chat** so the next session can continue building without re-explaining the whole project. Copy or reference it in your first message (e.g. "Read docs/HANDOFF_CONTINUATION.md and continue from there").

---

## 1. What This App Is

**Scholar Academic Coach** — A learning app with study modes: AI Tutor, Smart Notes, Flashcards, **Picmonics** (visual mnemonics), Practice, Audio Review. Courses (BIO 201, PSYCH 101, etc.) and concepts are seeded in data files. The **Picmonics** path is the most built-out: concept → decomposition → phonetic anchor → symbol map → DALL·E image → interactive hotspots for retrieval.

**Stack:** React (Vite), Tailwind, client-side only (no backend). Optional: `.env` with `VITE_OPENAI_API_KEY` for DALL·E image generation in Picmonics.

---

## 2. Key Directories and Files

| Area | Path | Purpose |
|------|------|--------|
| App shell, study session routing | `src/App.jsx` | Routes, StudyModeSwitcher, main content width (Picmonics gets `max-w-[90rem]`) |
| Picmonics UI | `src/components/Picmonics.jsx` | Concept list, 50/50 layout (image left, text right), "Create from text" pipeline, teaching-grade sections |
| Mnemonic canvas | `src/components/MnemonicCanvas.jsx` | Hotspots on image, Hover/Click modes, "Show all labels" |
| Image generation | `src/services/imageGeneration.js` | DALL·E 3 call, no-text reinforcement |
| Prompt engineering | `src/services/promptEngineer.js` | Style prefix, no-text rules, scene prompt from artifact |
| Pipeline (text → artifact) | `src/services/mnemonicPipeline.js` | extractFacts, rewriteFactsAsGroundTruth, scene blueprint, deriveImageStoryFromBlueprint, runPipeline |
| Canonical artifact | `src/data/canonicalArtifact.js` | toCanonicalArtifact, getDisplayHotspots, schema (facts, anchors, symbol_map, scene_blueprint, hotspots) |
| Validation | `src/utils/mnemonicValidation.js` | Semantic + visualizability + capacity + layout gates, blockImageGeneration |
| Symbol library | `src/data/symbolLibrary.js` | Versioned metaphor dictionary, enrichSymbolMapWithLibrary |
| Phonetic anchors | `src/data/phoneticAnchors.js` | concept_id → { phrase, object } (e.g. Cell Membrane → "Jail Membrane", jail cell door) |
| Decompositions | `src/data/conceptDecompositions.js` | concept_id → attributes, core_concept, image_story, exam_summary |
| Visual grammar | `src/data/visualGrammar.js` | attribute type → symbol class, zones, buildSymbolMap |
| Roadmap | `docs/SIMPLIFIED_HIGH_VALUE_ROADMAP.md` | App-wide phases, done/not done, recommended next steps |
| Doc index | `docs/README.md` | Full doc list; Picmonic status in PICMONIC_FEATURE_OVERVIEW.md |
| Master doc (design) | `docs/MASTER_DOC_COMPARISON_AND_IMPROVEMENTS.md` | Comparison to learning-science spec; current status in feature overview |

---

## 3. What’s Been Done (Verified in Code)

- **Picmonics UX:** 50/50 layout, image first; “What it is” (one lead sentence), “How to remember it” with Map to the image (anchor + facts + blue picmonic + definitions); optional Setting line, type tags, mnemonic_narrative. No Key Facts block or Exam-ready takeaway.
- **Canonical artifact + hotspots:** Single schema; anchor as first hotspot; per-fact `visual_mnemonic` in legend when set.
- **Validation:** Semantic + visualizability + engine checks (`visualMnemonicEngineValidation`); hard failures block image generation.
- **Pipeline:** “Create from text” → LLM/heuristic facts → symbol_map → scene_blueprint → image_story → artifact; same shape as library; pipeline merges `visual_mnemonic`/`priority` from decomposition when concept_id provided.
- **Per-fact visuals:** All concepts in `conceptDecompositions.js` have `visual_mnemonic` on every attribute.
- **Try another scene:** When multiple variants exist, “Try another scene” cycles them; “Save this variant” persists preference.
- **Primary fact in prompt:** “Main character shows or does [primary]” appended when image_story used; encoding_mode in prompt/validation.
- **Retrieval & spacing:** Occlusion (“Cover one”), Quiz from hotspots, “Due for review” filter, spacedReview (recordStudied, getDueForReview, advanceInterval).

**Source of truth for Picmonic status:** `docs/PICMONIC_FEATURE_OVERVIEW.md`. App-wide priorities: `docs/SIMPLIFIED_HIGH_VALUE_ROADMAP.md`.

---

## 4. User Goals and Next Focus

**User goals:** Top-tier prototype; buttons work; simple flow; teaching-grade content; modern, AI-enabled (AI Tutor, Picmonic generator).

**Next focus (see docs for full lists)**

1. **Picmonic:** Optional `mnemonic_narrative` for key concepts (content only); post-image checks (store prompt + image, pass/fail to tune). See `docs/PICMONIC_FEATURE_OVERVIEW.md`.
2. **Picmonic images:** Prompt already enforces one anchor, minimal background, no text; “Regenerate image (AI)” available. Further: post-gen pass/fail to tune prompts.
3. **AI Tutor:** Chat UI and LLM integration per roadmap.
4. **App-wide:** Phase 0.4 (a11y), Phase 4.2 (Progress/streaks), Phase 6.5 (dark mode). See `docs/SIMPLIFIED_HIGH_VALUE_ROADMAP.md`.

---

## 5. How to Continue in a New Thread

**First message in a new chat (suggested):**

```
Read docs/HANDOFF_CONTINUATION.md. I want to continue evolving the Scholar prototype.

Priority:
1. [e.g. Improve picmonic image quality — simpler, less chaotic, no text in image.]
2. [e.g. Add AI Tutor chat using OpenAI so the prototype feels AI-enabled.]
3. [e.g. Verify all buttons and flows work and simplify navigation.]

[Add any specific ask, e.g. "Start with the picmonic prompt and image constraints."]
```

**Ways to assist the next session**

- **Reference this file:** “Use HANDOFF_CONTINUATION.md for context.”
- **One priority at a time:** e.g. “This session: only picmonic image quality” or “This session: only AI Tutor chat.”
- **Accept incremental work:** e.g. “Implement occlusion mode” or “Add a simple chat pane that calls OpenAI.”
- **Point at files:** “Prompt logic is in src/services/promptEngineer.js and imageGeneration.js.”

---

## 6. Quick Wins for Next Session

- **Picmonic content:** Add `mnemonic_narrative` (2–4 sentences) to high-value concepts in `conceptDecompositions.js`; UI already shows it.
- **AI Tutor:** Add chat UI + OpenAI (or configured LLM) for Q&A; mount when aide is `tutor` (see `App.jsx`, `studyAides` in `src/data/student.js`).
- **Roadmap:** Pick one of Phase 0.4 (a11y), Phase 4.2 (Progress/streaks), or Phase 6.5 (dark mode) from `docs/SIMPLIFIED_HIGH_VALUE_ROADMAP.md`.

---

## 7. References

- **Doc index:** `docs/README.md` — lists all primary docs and archive.
- **Picmonic status + what’s next:** `docs/PICMONIC_FEATURE_OVERVIEW.md`
- **App-wide priorities:** `docs/SIMPLIFIED_HIGH_VALUE_ROADMAP.md`
- **Picmonic image flow & policy:** `docs/PICMONIC_FEATURE_OVERVIEW.md` (§ Path A vs B and policy, § Hotspots and UX)
- **Validation checklist:** `docs/VISUAL_MNEMONIC_ENGINE_VALIDATION.md`

---

*Last updated: Feb 2026. Use this file to pick up in a new Cursor thread without losing context.*
