# Practice Feature: Code, Logic & UX Review + Improvement Ideas

## Summary of Current Implementation

- **Entry points:** Study Aide launcher (Practice), Course screen "Practice weak areas", Progress/tasks.
- **Flow:** `PracticeSession` loads 5 questions via `getQuestionsForSession(course, { conceptIds: targetConcepts, limit: 5 })`. When launched from app/course, `sessionOptions.targetConcepts` is the single lowest-mastery concept from `getRecommendedConceptIds(course, 1)`.
- **Question sources:** Static `questionBank` (questions.js) + AI-generated questions via `generatePracticeQuestions` (3 MC questions, no short answer).
- **Grading:** Multiple choice by `correct_answer_id`; short answer by `gradeShortAnswer` (any of `correct_keywords` = correct).
- **Session end:** Summary shows score and "Mastery estimates have been updated"; CTA "Do 5 more practice" calls `loadSession()` (same targetConcepts, new shuffle).

---

## Code & Logic Findings

1. **Mastery is not updated**  
   The summary says *"Mastery estimates for the concepts in this session have been updated"* but no code updates mastery. Course/mastery data is static in `courses.js`. This is misleading.

2. **"Generate more (AI)" replaces the whole session**  
   `handleGenerateAI` sets `setQuestions(aiQuestions)` and resets index, attempts, completed. The user loses the current set (e.g. 5 from bank) and gets exactly 3 AI questions. The button label doesn’t say "Replace with 3 new questions."

3. **Session size vs copy**  
   After an AI session (3 questions), the summary still says "Do **5** more practice" and `loadSession()` then loads 5 from the bank. Wording is consistent for bank-only flow but not when the last run was AI-only.

4. **No review-of-missed path**  
   Summary suggests *"Review the rationales for the questions you missed"* but there is no way to re-view those questions in-app; attempts are only in component state and not exposed for a "Review missed" step.

5. **Short-answer grading is minimal**  
   `gradeShortAnswer` returns only `{ correct }`; no feedback on which keywords matched or what was missing. AI-generated questions don’t support short answer.

6. **Picmonic quiz prompts unused**  
   `canonicalArtifact.js` builds `quiz_prompts` from hotspots (`buildQuizPromptsFromHotspots`) for retrieval practice, but Practice uses only `questionBank` + AI. There’s no integration with picmonic-based "which part of the image encodes X?" questions.

7. **mixConcepts never used**  
   `getQuestionsForSession` supports `mixConcepts` for mixed-topic sessions, but `PracticeSession` never passes it; every bank session is either single-concept (targetConcepts) or full-pool random.

---

## UX Findings

- Empty state and "Generate 3 questions (AI)" are clear; API key errors surface via `aiError`.
- Progress bar and concept tag per question are good.
- "Generate more (AI)" in-header can surprise users who expect to add questions, not replace.
- No indication of session source (e.g. "5 from question bank" vs "3 AI-generated").
- After completion, no way to review missed questions before "Do 5 more" or exit.
- Keyboard: Enter submits short answer; no explicit shortcut for "Next" after feedback (Escape still exits via `useEscapeToExit`).

---

## Improvement Ideas (3–5)

### 1. Fix or remove the “mastery updated” claim (high impact, low effort)

**Problem:** Summary says mastery was updated but nothing is persisted.

**Options:**

- **A.** Remove the sentence: e.g. delete *"Mastery estimates for the concepts in this session have been updated."*
- **B.** Implement a lightweight update: e.g. a small bump for correct answers per concept (stored in context/localStorage/course state) and show it in Progress/Course screens so the claim is true.

Recommendation: Do A for the prototype; plan B if you add a real mastery/retention model.

---

### 2. Clarify “Generate more (AI)” and session source (UX)

**Problem:** "Generate more (AI)" replaces the session; users may expect “add more.” Session size (3 vs 5) and source (bank vs AI) are invisible.

**Changes:**

- **Label:** Make replacement explicit, e.g. *"Replace with 3 new questions (AI)"* in the header, and in the empty state keep *"Generate 3 questions (AI)"*.
- **Session source/size:** Show a short line under the title, e.g. *"5 questions from question bank"* or *"3 AI-generated questions"* (and update when they click replace).
- **Optional:** Add an "Add 3 more (AI)" that appends AI questions to the current set (with a cap, e.g. max 10) so “more” can mean append when desired.

---

### 3. Add a “Review missed” step before summary actions (UX + logic)

**Problem:** Summary tells users to review rationales for missed questions but doesn’t let them do it in the same flow.

**Changes:**

- Keep `attempts` (and optionally the full question list) when moving to summary.
- If `wrongCount > 0`, show a primary CTA: *"Review X missed"* that:
  - Re-displays only the questions the user got wrong, in order, with their chosen answer and the correct answer + rationale + misconception_hint.
  - After the last missed question, show the same summary again with "Do 5 more practice" and "Schedule review later."
- Optionally track "reviewed missed" so the summary can say "You reviewed the rationales for the questions you missed."

This reuses existing question/feedback UI and makes the copy accurate.

---

### 4. Richer short-answer feedback and optional AI short answer (logic + UX)

**Problem:** Short answer only returns correct/incorrect; no hint on what was missing. AI practice is MC-only.

**Changes:**

- **Keyword feedback:** In `gradeShortAnswer`, optionally return which keywords matched and which were missing (e.g. `{ correct, matched: [...], missing: [...] }`). In PracticeSession, when wrong, show e.g. *"Hint: include concepts like …"* from missing keywords (or a generic “Try to include [topic] terms”).
- **AI short answer (optional):** Extend `generatePracticeQuestions` to optionally generate 1–2 short-answer questions with `correct_keywords` (and rationale); then show them in Practice with the same keyword feedback. Keeps one grading path (keyword-based) while improving usefulness of AI questions.

---

### 5. Use Picmonic quiz prompts in Practice (integration)

**Problem:** Picmonic artifacts already define `study_modes.quiz_prompts` (from hotspots) for retrieval practice, but Practice doesn’t use them.

**Changes:**

- When starting a Practice session for a concept that has a picmonic with a canonical artifact, call `toCanonicalArtifact` (or an existing getter) and read `study_modes.quiz_prompts`.
- Map those prompts into a small set of Practice-compatible items (e.g. short-answer or single-choice “which hotspot?”) with expected term/fact for grading.
- Merge them into the session (e.g. 2–4 picmonic quiz questions + bank/AI questions) so "Practice weak areas" for that concept includes "which part of the image encodes X?" style retrieval. This ties Practice to the rest of the learning pipeline and reuses existing artifact data.

---

## Optional: “Do 5 more” variety

- **Today:** "Do 5 more practice" calls `loadSession()` with same `targetConcepts`; with a small bank, users can see the same questions again quickly.
- **Idea:** When calling `getQuestionsForSession` for "Do 5 more," pass `mixConcepts: 2` (or a user preference) so the next round can pull from two concepts, or temporarily exclude recently seen question IDs so the next 5 are different. Reduces repetition without changing the overall flow.

---

## Suggested order of work

1. **Quick win:** Remove or fix the mastery-updated sentence (Idea 1).
2. **UX clarity:** Relabel "Generate more (AI)" and show session source/size (Idea 2).
3. **High value:** Add "Review missed" before summary actions (Idea 3).
4. **Depth:** Short-answer feedback and optional AI short answer (Idea 4).
5. **Integration:** Picmonic quiz prompts in Practice (Idea 5).

This keeps the current code and logic intact while making behavior honest, clearer, and more aligned with the rest of the product (picmonics, mastery, and review).

---

## What's next (after 1–4)

Improvements **1–4 are implemented**. Remaining and follow-on ideas:

### 5. Use Picmonic quiz prompts in Practice (from original list)

**Goal:** When practicing a concept that has a picmonic with a canonical artifact, mix in 2–4 *"which part of the image encodes X?"* style questions from `study_modes.quiz_prompts` (built in `canonicalArtifact.js` from hotspots).

**Why:** Ties Practice to the Picmonic pipeline and reinforces retrieval from the visual mnemonic.

**Rough steps:**
- When building a session for a concept that has a picmonic: get picmonic from picmonics bank → `getMnemonicArtifact(mnemonic)` → `toCanonicalArtifact(mnemonic, artifact)` → read `study_modes.quiz_prompts`.
- Map each quiz prompt into a Practice-compatible item (e.g. short-answer with `expected_term` / `expected_fact` as `correct_keywords`, or single-choice “which hotspot?”).
- Merge 2–4 of these into the session (e.g. prepend or interleave with bank/AI questions).

**Dependency:** Need a way to resolve “concept_id” (e.g. `cell-membrane`) to a picmonic + artifact for the current course (picmonics are per-concept; artifact comes from `getMnemonicArtifact` in `picmonics.js`).

---

### Optional / v2

- **“Do 5 more” variety**  
  Use `mixConcepts: 2` when calling `getQuestionsForSession` for the *next* round, or track recently seen question IDs (e.g. in session or localStorage) and exclude them for the next N questions so repeats are less likely.

- **Lightweight mastery update**  
  If you add any persistence (e.g. course state in context or localStorage), bump mastery slightly for concepts where the user got most questions right in a session, so the summary line “Mastery estimates have been updated” can be re-introduced and be true.

- **Session size picker**  
  Let the user choose “5 / 10 / 15” (or “Quick / Standard / Long”) before starting; pass `limit` into `getQuestionsForSession` and use it for AI “Replace with 3 new” vs “Add 3 more” behavior if you add append mode.

- **Keyboard shortcuts**  
  “Next” / “See summary” on Enter (when not in short-answer input); optional shortcut for “Review missed” from summary.

- **Accessibility**  
  Ensure “Review missed” flow has clear focus management and aria-labels (e.g. “Review missed question 1 of 3”); optional live region for score updates.
