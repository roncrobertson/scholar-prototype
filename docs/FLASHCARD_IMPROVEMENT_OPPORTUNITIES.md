# Flashcard Improvement Opportunities

Top 5 improvement opportunities for the flashcard functionality, based on a review of the current implementation.

**Current behavior (verified in code):**
- **Data** (`src/data/flashcards.js`): Static decks per course (bio201, psych101, econ202, eng215), ~6 cards each. Cards have `id`, `front`, `back`, `courseId`, `topic`. Comment notes “In production would come from LMS or spaced-repetition API.”
- **UI** (`src/components/Flashcards.jsx`): Flip (tap/space/enter), rate (“Got it” / “Study again”), progress bar, session summary, “Review again” for missed cards. Options: term vs definition first, shuffle deck, end & summary. Keyboard (arrows prev/next, space flip) and swipe on touch. Read aloud (speech synthesis). No persistence of ratings or scheduling.
- **Spaced review** (`src/services/spacedReview.js`): Service supports `mode: 'flashcards'` (`recordStudied`, `advanceInterval`, `getDueForReview`, `getDueCountFromConcepts`), but **Flashcards.jsx never calls these**. Picmonics does call `recordStudied` when a concept is selected.
- **Study stats** (`src/utils/studyStats.js`): `getConceptsStudiedCount()` and `getStudySnapshot()` only count **picmonics** (filter by `mode === 'picmonics'`). Flashcards do not contribute to “Concepts studied,” “Due for review,” or streak.
- **Home** (`src/components/screens/HomeScreen.jsx`): “Due for review” uses only Picmonics. Quick Review shows total card count via `getCardsForCourse(null).length`; no “flashcards due” or spaced-repetition integration.

---

## Top 5 Improvement Opportunities

### 1. **Wire flashcards to spaced repetition (high impact)**

**Gap:** The product describes flashcards as “Spaced repetition cards,” but the flashcard flow never uses the existing spaced-review service.

**Opportunity:** In `Flashcards.jsx`, call the spaced-review API when the user rates a card:
- On **“Got it”**: `recordStudied(course.id, card.id, 'flashcards')` and optionally `advanceInterval(course.id, card.id, 'flashcards')` so next review is 1d → 3d → 7d.
- On **“Study again”**: record that the card was studied (so it’s in the system) but do not advance the interval (or use a shorter interval).

Then:
- Use `getDueForReview(courseId, 'flashcards')` to build a “Study due” or “Due for review” deck.
- Surface “flashcards due” on Home (e.g. badge or separate CTA) using `getDueCountFromConcepts` with a flashcard deck list, so users see what’s due for flashcards as well as Picmonics.

**Files:** `src/components/Flashcards.jsx`, `src/services/spacedReview.js`, `src/components/screens/HomeScreen.jsx`, and optionally a small flashcard “bank” structure for `getDueCountFromConcepts` (e.g. list of `{ course_id, concept_id }` where concept_id = card id).

---

### 2. **Include flashcards in study stats and dashboard (high impact)**

**Gap:** “Concepts studied,” “Due for review,” and “Day streak” only reflect Picmonics. Flashcard sessions are invisible to progress and home.

**Opportunity:**
- In `studyStats.js`, include flashcard activity: e.g. extend `getConceptsStudiedCount()` to count both `picmonics` and `flashcards` modes (or add a separate “Cards studied” metric), and ensure `recordStudyActivity()` is called when the user completes a flashcard session so streak counts.
- On Home, once spaced repetition is wired (above), show “X flashcards due” (or combined “X due” that includes both Picmonics and flashcards) so flashcards are a first-class study aide.
- Optionally add a “Flashcards studied today” or “Cards reviewed” to the study snapshot for quick feedback.

**Files:** `src/utils/studyStats.js`, `src/components/Flashcards.jsx` (call `recordStudyActivity()` on session end), `src/components/screens/HomeScreen.jsx`.

---

### 3. **Persist “study again” and per-card state (medium impact)**

**Gap:** “Study again” is session-only. Refreshing or leaving loses the queue; there is no persistence of difficulty or history.

**Opportunity:**
- Persist “study again” card IDs (or a per-card “last outcome” / difficulty) in localStorage keyed by course and session or user, so “Review X again” can span sessions and the app can prioritize weak cards next time.
- Once spaced repetition is implemented, “study again” can map to “don’t advance interval” and “due soon,” so the existing spaced-review logic drives which cards appear in “due” decks.
- Optional: persist last position in deck and “term first vs definition first” so returning users resume with the same options.

**Files:** `src/components/Flashcards.jsx`, new or existing localStorage key (e.g. under `scholar-spaced-review` or `scholar-flashcards-state`).

---

### 4. **Expand card content and sources (medium impact)**

**Gap:** Decks are static and small (~6 cards per course). There is no LMS integration, AI generation, or user-created cards.

**Opportunity:**
- **LMS / API:** Add a path to load cards from an external API or LMS (as noted in `flashcards.js`), with the same shape `{ id, front, back, courseId, topic? }`.
- **AI-generated cards:** For a given course or concept (e.g. from Smart Notes or course outline), call an LLM to generate question/answer pairs; store in state or a local “generated” deck so decks scale with course content.
- **User-created cards:** Allow “Add card” from the flashcard UI (and optionally from course/concept context) with simple form (front/back, optional topic); persist in localStorage or backend so decks grow with use.

**Files:** `src/data/flashcards.js` (or a new `flashcardLoader.js`), optional AI service for generation, `src/components/Flashcards.jsx` (add card UI / “Load from API” or “Generate from concept”).

---

### 5. **“Due first” flow and topic filter (medium impact)**

**Gap:** Users always study a full shuffled deck. There is no way to “study what’s due” or to focus by topic, even though cards have a `topic` field and spaced-review support exists for flashcards.

**Opportunity:**
- **Due-first deck:** Once spaced repetition is wired, add a “Study due first” or “Due for review” option that builds the deck from `getDueForReview(courseId, 'flashcards')` (and optionally merges with “never seen” cards). Make this the default or a prominent option on Home and in the flashcard header.
- **Topic filter:** In the flashcard options menu, add a “Topic” dropdown or filter (e.g. “Cell Membrane,” “Memory”) using the existing `topic` field so users can do focused practice on one topic.
- **Course + due:** When opening flashcards from a course, default to “cards due for this course” when available, then fall back to full deck.

**Files:** `src/components/Flashcards.jsx` (deck building and options UI), `src/data/flashcards.js` (helpers by topic if needed).

---

## Summary

| # | Opportunity                         | Impact   | Depends on        |
|---|-------------------------------------|----------|-------------------|
| 1 | Wire flashcards to spaced repetition | High     | —                 |
| 2 | Include flashcards in study stats/dashboard | High | 1 (for “due” count) |
| 3 | Persist “study again” and per-card state | Medium | 1 (optional) |
| 4 | Expand card content and sources     | Medium   | —                 |
| 5 | “Due first” flow and topic filter    | Medium   | 1                 |

Implementing (1) and (2) makes flashcards a true “spaced repetition” experience and surfaces them on the dashboard. (3), (4), and (5) improve retention, scalability, and control without changing the core UX.

---

## Status: 1–3 implemented

- **1. Wire flashcards to spaced repetition** — Done: `recordStudied` / `advanceInterval` on rate, flashcard bank, Home "Due for review" with Picmonics + Flashcards and "Review Flashcards" CTA.
- **2. Include flashcards in study stats/dashboard** — Done: `getConceptsStudiedCount` and `getDueCount` include flashcards; `recordStudyActivity()` on session end; Home shows combined due.
- **3. Persist "study again"** — Done: localStorage "study again" list, "Start with these" banner, merge/clear on "Review again" and "Start with these."

---

## What else to improve

### Remaining from the top 5

**4. Expand card content and sources (medium)**  
Decks are still static and small (~6 cards per course). Add: LMS/API import, AI-generated cards from course/concept, and/or user-created cards (with persistence) so decks scale.

**5. "Due first" flow and topic filter (medium)**  
- **Due-first deck:** In the flashcard options (or on open), add "Study due first" that builds the deck from `getDueForReview(courseId, 'flashcards')` and optionally never-seen cards; make it the default when there are due cards.  
- **Topic filter:** Use the existing `topic` field: add a topic dropdown in the options menu (e.g. "Cell Membrane", "Memory") so users can study one topic at a time.  
- **Default to due when opening from course:** When opening flashcards for a specific course, default to "due for this course" when any cards are due, then fall back to full deck.

### Further improvements

- **Keyboard shortcuts for rating:** When the card is flipped, support keys (e.g. **1** / **2** or **G** / **S**) for "Got it" / "Study again" so power users can rate without clicking.
- **Explicit "Done" on summary:** Session summary has "Review X again" but no clear "Done" or "Back to course" button; users rely on the study bar. Add a "Done" or "Back to course" button for clarity.
- **Quick Review badge on Home:** On the Quick Review button, show due count when relevant (e.g. "24 cards (3 due)" or a small badge) so flashcards due are visible at a glance.
- **Persist "term first" preference:** Save `showTermFirst` in localStorage so returning users keep their preference.
- **Accessibility:** Announce progress to screen readers (e.g. "Card 3 of 12"), and move focus to the card or rate buttons when advancing.
- **Empty "due" state:** If the user chooses "Study due first" and nothing is due, show a short message and a "Study full deck" action instead of an empty list.
- **Progress / history:** On the Progress screen, show which cards were studied recently and next due dates.
- **Confidence levels (later):** Replace binary "Got it" / "Study again" with 3–4 levels (Again / Hard / Good / Easy) and map them to different intervals.
- **Deep link from AI Tutor:** When the tutor says "Practice with flashcards on this," link to flashcards with the current concept or topic pre-filtered.
