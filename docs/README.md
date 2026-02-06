# Scholar Prototype — Documentation

Enterprise-style index. **Single source of truth** for each area is called out below.

---

## 1. Getting started

| Doc | Purpose |
|-----|--------|
| **[HANDOFF_CONTINUATION.md](HANDOFF_CONTINUATION.md)** | Onboarding: what the app is, key files, how to continue in a new thread. Use when starting a new Cursor chat. |

---

## 2. Core system: Picmonic (visual mnemonics)

**Primary reference:** **[PICMONIC_FEATURE_OVERVIEW.md](PICMONIC_FEATURE_OVERVIEW.md)** — pipeline, simple walkthrough, Path A/B and policy, hotspots and UX, completed items, what’s next, key files, testing. **Single doc for “how Picmonics work.”**

| Doc | Purpose |
|-----|--------|
| **PICMONIC_FEATURE_OVERVIEW.md** | Pipeline (concept → artifact → prompt → image), data flow, validation, canonical artifact, image generation, hotspots and UX. **Status and “what’s next” live here.** |
| **[PICMONIC_GENERATION_PROCESS.md](PICMONIC_GENERATION_PROCESS.md)** | **Full specification:** every step of picmonic generation — how information is created (Path A/B), how visuals are created (prompt, policy, DALL·E), logic (symbol map, zones, canonical, hotspots), rules (validation, policy, prompt), and guidelines. Use for full review. |
| [HOTSPOT_AND_PICMONIC_IMPROVEMENTS.md](HOTSPOT_AND_PICMONIC_IMPROVEMENTS.md) | Optional work only (layout preset, callout styling). Main hotspot content is in the overview § Hotspots and UX. |
| [VISUAL_MNEMONIC_ENGINE_VALIDATION.md](VISUAL_MNEMONIC_ENGINE_VALIDATION.md) | Pre-image validation checklist (CHECK_1 … CHECK_15). North star: *If the image does not independently reconstruct the concept’s key facts, it is invalid.* |

---

## 3. Roadmap and priorities

| Doc | Purpose |
|-----|--------|
| **[SIMPLIFIED_HIGH_VALUE_ROADMAP.md](SIMPLIFIED_HIGH_VALUE_ROADMAP.md)** | App-wide priorities: phases (0–6), done/not done, recommended next steps. **Use this to decide what to build next.** |

---

## 4. Reference (design and spec)

| Doc | Purpose |
|-----|--------|
| [MASTER_DOC_COMPARISON_AND_IMPROVEMENTS.md](MASTER_DOC_COMPARISON_AND_IMPROVEMENTS.md) | Comparison of current picmonic system to the Master Document (learning science, pipeline, validation). Some gaps listed there are now addressed (e.g. source_text, render blob, safety line, occlusion, quiz); see PICMONIC_FEATURE_OVERVIEW and SIMPLIFIED_HIGH_VALUE_ROADMAP for current status. |

---

## 5. Improvement backlog

| Doc | Purpose |
|-----|--------|
| **[WHAT_ELSE_TO_IMPROVE.md](WHAT_ELSE_TO_IMPROVE.md)** | Prioritized list across features (Flashcards, Practice, Smart Notes, Picmonic polish, etc.). Pick one area at a time. |
| [FLASHCARD_IMPROVEMENT_OPPORTUNITIES.md](FLASHCARD_IMPROVEMENT_OPPORTUNITIES.md) | Flashcards: wire to spaced repetition, “due” deck. |
| [PRACTICE_FEATURE_REVIEW_AND_IMPROVEMENTS.md](PRACTICE_FEATURE_REVIEW_AND_IMPROVEMENTS.md) | Practice: mastery messaging, “Review missed,” session UX. |
| [SMART_NOTES_IMPROVEMENTS.md](SMART_NOTES_IMPROVEMENTS.md) | Smart Notes: flagged/confused on Home, launcher. |

**What else to do (summary):** See **§6** below for a short list; full detail is in WHAT_ELSE_TO_IMPROVE.md.

---

## 6. What else to do (summary)

Use this to pick the next focus. Full rationale and refs are in WHAT_ELSE_TO_IMPROVE.md.

### Picmonic (content and polish)

| Priority | What | Effort |
|----------|------|--------|
| 1 | **Mnemonic narrative** — Add 2–4 sentence “how to remember” narratives in `conceptDecompositions.js` for high-value concepts. UI already shows them. | Content only. |
| 2 | **Post-image checks** — After generation: store prompt + image; optional human or model pass/fail to gate accept and tune prompts. | Small feature. |
| 3 | **Hotspot callout styling** — When “Show all labels” is on, offset tooltip from circle (e.g. bubble to side/below) so it reads as overlay. | Small. |

### App-wide (roadmap)

| Priority | What | Effort |
|----------|------|--------|
| 1 | **Phase 0.4 — a11y** — Full a11y audit: focus order, aria-labels, reduced-motion preference. | 1–2 sessions. |
| 2 | **Phase 4.2 — Progress/streaks** — Surface “N concepts due for review” and/or streak on Progress or Today view. | Small. |
| 3 | **Phase 6.5 — Dark mode** — Theme context, semantic tokens, nav toggle, persist in localStorage. | Medium. |

### AI Tutor

| What | Effort |
|------|--------|
| Chat UI + LLM integration (OpenAI or configured provider) for Q&A; mount when aide is `tutor`. See `App.jsx`, `studyAides` in `src/data/student.js`. | Medium. |

### Codebase (from audit)

| What | Effort |
|------|--------|
| **Error handling** — AI flows: return structured result (`ok`, `errorCode`, `message`); show shared API key message for `api_key_missing`. | Small. |
| **Device toggle** — Replace manual Desktop/Mobile toggle with `window.matchMedia` (or keep behind dev flag). | Small. |

### Testing

| What | Effort |
|------|--------|
| Extend unit tests: e.g. `promptEngineer` (primary phrase, encoding_mode), `mnemonicPipeline` (merge visual_mnemonic when concept_id provided). | Small. |

---

## 7. Archive

Older or one-off docs are in **`docs/archive/`**. Use them for background, not as source of truth.

| File | What it is |
|------|------------|
| CODEBASE_AUDIT_AND_IMPROVEMENTS.md | Bug list, API key messaging, UX ideas. |
| COMPETING_IMAGE_REVIEW_AND_IMPROVEMENTS.md | What we adopted from a reference image. |
| CORE_IA_SPEC_RECOMMENDATION.md | IA spec (concept → facts → visuals → story → image). |
| ENCODING_OUTPUT_EVALUATION.md | Encoding evaluation notes. |
| IMPLEMENTATION_ROADMAP_MASTERCLASS.md | Full Phases 0–5 plan (source for simplified roadmap). |
| MEMORY_TECHNIQUES_AND_PIPELINE_REFERENCE.md | Cognitive foundations, pipeline mapping. |
| PICMONIC_EVALUATION_AND_RECOMMENDATIONS.md | Learning-science evaluation, R1–R8. |
| PICMONIC_IMAGE_EVALUATION_REFERENCE_VS_OURS.md | Image comparison notes. |
| PICMONIC_IMPROVEMENTS_ACTIONABLE_REVIEW.md | Actionable improvement list (superseded by PICMONIC_FEATURE_OVERVIEW status). |
| PICMONIC_ROADMAP.md | Original 10-item Picmonic roadmap (superseded by feature overview + SIMPLIFIED_HIGH_VALUE_ROADMAP). |
| PICMONIC_UX_EVALUATION_ENCODING.md | UX/encoding evaluation. |
| PICMONIC_VISUAL_AND_HOTSPOT_IMPROVEMENTS.md | Cell Membrane–specific visual/hotspot notes (general guidance in HOTSPOT_AND_PICMONIC_IMPROVEMENTS). |
| SCHOLAR_VISION_REVIEW.md | Vision vs current state. |
| TOP_3_EXECUTION_PLAN.md | One-time execution plan (complete). |
| VALIDATION_AND_QUALITY_CHECKLIST.md | Quality checklist (overlaps engine validation). |
| VISUAL_LEARNING_CHECKLIST_INTEGRATION.md | Checklist → prompt/validation mapping. |
| VISUAL_MNEMONIC_ITERATION_RECOMMENDATIONS.md | Iteration ideas (overlaps feature overview). |

---

*Last updated: Feb 2026.*
