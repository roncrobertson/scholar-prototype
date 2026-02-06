# What Else Should Be Improved

**Summary:** See **[docs/README.md](README.md)** §6 “What else to do (summary).” This doc is the **detailed backlog** with refs and suggested order.

A prioritized list of improvement opportunities across the Scholar prototype. Use this to pick the next area to work on.

---

## High impact, clear docs

These have dedicated improvement docs and high user/learning impact.

### 1. **Flashcards — wire to spaced repetition** (high impact)

**Gap:** Flashcards are labeled “Spaced repetition cards” but never call the spaced-review service. “Due for review” and study stats only reflect Picmonics.

**Do:** In `Flashcards.jsx`, call `recordStudied(courseId, card.id, 'flashcards')` on “Got it” and optionally `advanceInterval`; use `getDueForReview(courseId, 'flashcards')` to build a “Study due” deck. Surface “flashcards due” on Home. Include flashcards in `studyStats` and “Concepts studied” / streak.

**Ref:** `docs/FLASHCARD_IMPROVEMENT_OPPORTUNITIES.md` (ideas 1–2).

---

### 2. **Practice — fix “mastery updated” and session UX** (high impact, low effort)

**Gap:** Summary says “Mastery estimates have been updated” but nothing is persisted. “Generate more (AI)” replaces the session; users may expect “add more.”

**Do:**  
- **A.** Remove or reword the “mastery updated” sentence (quick).  
- **B.** Label AI action as “Replace with 3 new questions (AI)” and show session source/size (e.g. “5 from question bank” / “3 AI-generated”).

**Ref:** `docs/PRACTICE_FEATURE_REVIEW_AND_IMPROVEMENTS.md` (ideas 1–2).

---

### 3. **Practice — “Review missed” step** (high impact, medium effort)

**Gap:** Summary tells users to review rationales for missed questions but there’s no in-app step to do it.

**Do:** Before “Do 5 more” / Exit, add a “Review missed” step that shows missed questions with correct answer and rationale; then show summary. Keep attempts in state (or a small store) when moving to summary.

**Ref:** `docs/PRACTICE_FEATURE_REVIEW_AND_IMPROVEMENTS.md` (idea 3).

---

### 4. **Smart Notes — surface flagged/confused in Home and launcher** (medium impact)

**Gap:** “Flag for review” and “I’m confused” are stored and shown in Smart Notes, but Home and Study Aide Launcher don’t yet recommend “Review your Smart Notes for [concept]” or show a “Flagged for review” list.

**Do:** Use `getFlaggedForReview()` / `getConfusedConcepts()` from `smartNotesReviewFlags.js` to show a “Flagged for review” section or badge on Home/Course and a CTA that opens Smart Notes with that concept (and optionally context) pre-selected.

**Ref:** `docs/SMART_NOTES_IMPROVEMENTS.md` (idea 5, partial).

---

## Picmonic / Hotspot (optional polish)

Most hotspot/picmonic items in the doc are done. Remaining:

- **Hotspot callout styling** — When “Show all labels” is on, offset the tooltip from the circle (e.g. bubble to the side or below with a small gap or tail) so it reads as an overlay, not text on the image. `MnemonicCanvas.jsx`.
- **Later/optional:** Layout preset in `hotspotPositions.js`; vision-based placement is **done** (see HOTSPOT_AND_PICMONIC_IMPROVEMENTS); stricter overlap/UI checks.

**Ref:** [HOTSPOT_AND_PICMONIC_IMPROVEMENTS.md](HOTSPOT_AND_PICMONIC_IMPROVEMENTS.md), [SIMPLIFIED_HIGH_VALUE_ROADMAP.md](SIMPLIFIED_HIGH_VALUE_ROADMAP.md).

---

## UX and polish (roadmap)

From `SIMPLIFIED_HIGH_VALUE_ROADMAP.md`:

- **6.5 Dark mode** — Theme context, semantic tokens, toggle in nav; persist preference.
- **6.10 Color and branding** — Semantic success/warning/error tokens; strategic gradients on hero/CTAs.
- **Phase 0.4** — Responsive & a11y: focus order, aria-labels, reduced-motion where applicable.
- **Phase 4.2** — Progress & streaks: surface “N concepts due for review” and/or streak on Progress or Today.
- **API key experience** — Single shared check and one clear message (“Add VITE_OPENAI_API_KEY…”) everywhere; link to README. Already partially done via `aiCapability.js`; ensure every AI entry point uses it.

---

## Flashcard and Practice (full list)

| Area | Idea | Impact | Effort |
|------|------|--------|--------|
| Flashcards | Wire to spaced repetition (recordStudied, due deck) | High | Medium |
| Flashcards | Include in study stats and Home “due” | High | Low |
| Flashcards | Persist “study again” / per-card state | Medium | Medium |
| Flashcards | Due-first deck + topic filter | Medium | Low–Medium |
| Flashcards | Expand content (LMS, AI-generated, user-created) | Medium | Medium |
| Practice | Fix/remove “mastery updated” claim | High | Low |
| Practice | Clarify “Generate more (AI)” + session source | High | Low |
| Practice | “Review missed” step before summary | High | Medium |
| Practice | Richer short-answer feedback (matched/missing keywords) | Medium | Medium |

---

## Suggested order

1. **Practice:** Remove or reword “mastery updated” + clarify “Replace with 3 new (AI)” and session source (low effort).
2. **Flashcards:** Wire to spaced repetition and include in study stats / Home “due” (high impact, doc already written).
3. **Practice:** Add “Review missed” step (high impact).
4. **Smart Notes:** Surface flagged/confused on Home and launcher (medium impact, data already there).
5. **Picmonic:** Hotspot callout offset (polish).
6. **Roadmap:** Dark mode, 6.10 color, a11y pass, API key consistency as needed.

Use the refs above for implementation details and file paths.
