# Top 3 Execution Plan — Autonomous Implementation

**Date:** Feb 6, 2026  
**Source:** Scholar Vision Review (`SCHOLAR_VISION_REVIEW.md`); top 3 gaps chosen for autonomous execution.

---

## Chosen Top 3

1. **On-track state + Morning briefing** — Scholar “stays quiet when on track”; morning copy: “X classes today • Y tasks • Focus time: Zh”.
2. **Grade trajectory narrative** — “Here’s your path to a B+” with current vs target and focus areas from mastery.
3. **Due for review (MVP)** — Spaced repetition: surface “due for review” count on Home and link to Picmonics.

---

## 1. On-track state + Morning briefing

**Goal:** Differentiate “on track” (no nudge) vs “needs action” (one CTA), and add vision-aligned morning copy.

**Changes:**

- **`src/data/courses.js`**
  - `isOnTrack()` — true when no missing work and all courses at/above target (grade >= target - 3).
  - `getTasksToStayOnTrackCount()` — count of high-level tasks: missing work + “has exam/quiz soon” + “any course below target”; capped for display.
  - `getFocusTimeAvailable()` — returns `FOCUS_TIME_HOURS` (4.5) for prototype.
- **`src/components/screens/HomeScreen.jsx`**
  - Under “Good morning, {name}”: “X classes today • Y tasks to stay on track” and “Focus time available: Zh”.
  - If `isOnTrack()`: show green “You’re on track” block with soft CTA “Quick review →” (opens study aides).
  - Else: keep existing “Recommended next” block with “Prep now” / “Go to Recovery →”.

**How to verify:** Load Home. With current seed data (missing work + exams + below-target courses), you see “Recommended next”. Manually adjust `courses.js` so no missing work and all grades ≥ target - 3 → Home should show “You’re on track” and “Quick review →”. Morning line and focus time should always show.

---

## 2. Grade trajectory narrative

**Goal:** One place that answers “Here’s your path to a B+” with current grade, target, and focus areas.

**Changes:**

- **`src/data/courses.js`**
  - `getGradeTrajectory(course)` — returns `{ current, target, focusAreas, targetLabel, gap }`. `focusAreas` = up to 2 lowest-mastery topics; `targetLabel` = “A” / “B+” / “C+” / “X%” from target.
- **`src/components/screens/ProgressScreen.jsx`**
  - Grade section retitled to “Here’s your path forward” with subtext “Current vs target • Focus on weak areas to close the gap”.
  - Per course: “X% → targetLabel (target%)” and progress bar; if `gap > 0`, show “Focus: topic1 (mastery%), topic2 (mastery%) — practice these to raise your grade.”

**How to verify:** Open Progress. Each course shows current → target and, when below target, 1–2 focus topics from lowest mastery.

---

## 3. Due for review (MVP)

**Goal:** Show how many Picmonic concepts are “due for review” (never studied or next review due) and link to review.

**Changes:**

- **`src/services/spacedReview.js`**
  - `getDueCountFromConcepts(list, mode)` — `list` = e.g. `picmonicsBank`. For each unique (course_id, concept_id): if no stored review or `nextDue <= end of today`, count as due. Returns total count.
- **`src/components/screens/HomeScreen.jsx`**
  - Import `picmonicsBank` and `getDueCountFromConcepts`.
  - `dueForReviewCount = getDueCountFromConcepts(picmonicsBank, 'picmonics')`.
  - When `dueForReviewCount > 0`: show a “Due for review” block with count and “Review Picmonics →” (opens study aides; user picks Picmonics).

**Existing behavior:** Picmonics already calls `recordStudied(course.id, conceptId, 'picmonics')` when a concept is selected (`handleSelectConcept`), so “last studied” and “next due” are updated. New code only adds the count and Home surface.

**How to verify:** Fresh localStorage → all concepts count as “due” (never studied), so “Due for review” appears on Home with a count. Open a course → Picmonics → select a concept; that concept is recorded. After 1 day (or by temporarily changing `INTERVALS_DAYS[0]` in spacedReview) it can become “due” again; or clear localStorage to see full count again.

---

## Implementation order (executed)

1. On-track + morning briefing (courses.js + HomeScreen).
2. Grade trajectory (courses.js + ProgressScreen).
3. Due for review (spacedReview.js + HomeScreen).

---

## Files touched

| File | Change |
|------|--------|
| `src/data/courses.js` | `isOnTrack`, `getTasksToStayOnTrackCount`, `getFocusTimeAvailable`, `getGradeTrajectory` |
| `src/components/screens/HomeScreen.jsx` | Morning line, focus time, on-track vs nudge block, due-for-review block |
| `src/components/screens/ProgressScreen.jsx` | Grade section → “Here’s your path forward” + focus areas |
| `src/services/spacedReview.js` | `getDueCountFromConcepts(list, mode)` |
| `src/data/reviewState.js` | **Deleted** — logic lives in spacedReview only |

---

## Build

- `npm run build` — succeeds.
- No new env vars or backend; all client-side (localStorage for spaced review).

Use this doc to hand off or re-run the same three items in another branch.
