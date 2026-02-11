# Scholar Prototype — Documentation

Enterprise-style index. **Single source of truth** for each area is called out below.

---

## 1. Getting started

| Doc | Purpose |
|-----|--------|
| **[HANDOFF_CONTINUATION.md](HANDOFF_CONTINUATION.md)** | Onboarding: what the app is, key files, how to continue in a new thread. Use when starting a new Cursor chat. |

---

## 2. Roadmap and priorities

| Doc | Purpose |
|-----|--------|
| **[SIMPLIFIED_HIGH_VALUE_ROADMAP.md](SIMPLIFIED_HIGH_VALUE_ROADMAP.md)** | App-wide priorities: phases (0–6), done/not done, recommended next steps. **Use this to decide what to build next.** |

---

## 3. Reference (design and spec)

| Doc | Purpose |
|-----|--------|
| [MASTER_DOC_COMPARISON_AND_IMPROVEMENTS.md](MASTER_DOC_COMPARISON_AND_IMPROVEMENTS.md) | Comparison of current system to the Master Document (learning science, pipeline). See SIMPLIFIED_HIGH_VALUE_ROADMAP for current status. |

---

## 4. Improvement backlog

| Doc | Purpose |
|-----|--------|
| **[WHAT_ELSE_TO_IMPROVE.md](WHAT_ELSE_TO_IMPROVE.md)** | Prioritized list across features (Flashcards, Practice, Smart Notes, etc.). Pick one area at a time. |
| [FLASHCARD_IMPROVEMENT_OPPORTUNITIES.md](FLASHCARD_IMPROVEMENT_OPPORTUNITIES.md) | Flashcards: wire to spaced repetition, "due" deck. |
| [PRACTICE_FEATURE_REVIEW_AND_IMPROVEMENTS.md](PRACTICE_FEATURE_REVIEW_AND_IMPROVEMENTS.md) | Practice: mastery messaging, "Review missed," session UX. |
| [SMART_NOTES_IMPROVEMENTS.md](SMART_NOTES_IMPROVEMENTS.md) | Smart Notes: flagged/confused on Home, launcher. |

**What else to do (summary):** See **§5** below for a short list; full detail is in WHAT_ELSE_TO_IMPROVE.md.

---

## 5. What else to do (summary)

Use this to pick the next focus. Full rationale and refs are in WHAT_ELSE_TO_IMPROVE.md.

### App-wide (roadmap)

| Priority | What | Effort |
|----------|------|--------|
| 1 | **Phase 0.4 — a11y** — Full a11y audit: focus order, aria-labels, reduced-motion preference. | 1–2 sessions. |
| 2 | **Phase 4.2 — Progress/streaks** — Surface "N concepts due for review" and/or streak on Progress or Today view. | Small. |
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
| Extend unit tests for study aides, AI flows, and utilities. | Small. |

---

## 6. Archive

Older or one-off docs are in **`docs/archive/`**. Use them for background, not as source of truth. (Note: Picmonic docs were moved to a standalone app and removed from this project.)

| File | What it is |
|------|------------|
| CODEBASE_AUDIT_AND_IMPROVEMENTS.md | Bug list, API key messaging, UX ideas. |
| COMPETING_IMAGE_REVIEW_AND_IMPROVEMENTS.md | What we adopted from a reference image. |
| CORE_IA_SPEC_RECOMMENDATION.md | IA spec (concept → facts → visuals → story → image). |
| ENCODING_OUTPUT_EVALUATION.md | Encoding evaluation notes. |
| IMPLEMENTATION_ROADMAP_MASTERCLASS.md | Full Phases 0–5 plan (source for simplified roadmap). |
| MEMORY_TECHNIQUES_AND_PIPELINE_REFERENCE.md | Cognitive foundations, pipeline mapping. |
| PICMONIC_* (archive) | Picmonic evaluation and roadmap docs — Picmonic is now a standalone app. |
| SCHOLAR_VISION_REVIEW.md | Vision vs current state. |
| TOP_3_EXECUTION_PLAN.md | One-time execution plan (complete). |
| VALIDATION_AND_QUALITY_CHECKLIST.md | Quality checklist. |
| VISUAL_LEARNING_CHECKLIST_INTEGRATION.md | Checklist → prompt/validation mapping. |
| VISUAL_MNEMONIC_ITERATION_RECOMMENDATIONS.md | Iteration ideas. |

---

*Last updated: Feb 2026.*
