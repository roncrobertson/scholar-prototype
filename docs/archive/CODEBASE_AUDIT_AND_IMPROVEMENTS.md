# Scholar Prototype — Codebase Audit & Improvement Ideas

**Date:** February 2026  
**Scope:** Architecture, logic, state, error handling, UX, performance, maintainability.

---

## Executive summary

The app is a coherent, feature-rich learning prototype with clear separation of screens, study aides, and services. The audit surfaces one **logic bug**, several **consistency and UX improvements**, and concrete ideas to harden and extend the app without rewriting it.

---

## 1. Bugs & logic issues

### 1.1 Anchor suggestion not applied in “Create from text” (bug)

**Where:** `Picmonics.jsx` → `handleCreateFromTextSubmit` passes `suggestedAnchor` as `anchorOverride`.  
**Issue:** `anchorSuggestion.js` returns `{ phrase, visual }`, but `mnemonicPipeline.js` expects `anchorOverride.phrase` and `anchorOverride.object`. The UI shows `suggestedAnchor.visual` correctly, but the pipeline checks `suggestedAnchor?.object`, which is always `undefined`, so the suggested anchor is never used when generating the mnemonic.

**Fix:** When calling `runPipeline`, pass:

```js
anchorOverride: suggestedAnchor?.phrase && suggestedAnchor?.visual
  ? { phrase: suggestedAnchor.phrase, object: suggestedAnchor.visual }
  : undefined,
```

(Or change `anchorSuggestion` to return `object` instead of `visual` and use that everywhere for consistency.)

---

## 2. API key & error handling

### 2.1 Inconsistent API key messaging (as in SIMPLIFIED_HIGH_VALUE_ROADMAP)

**Current state:** Each AI feature checks `VITE_OPENAI_API_KEY` in isolation and shows different messages (or silent failure):

- AITutor: “Missing VITE_OPENAI_API_KEY. Add it to .env to use the AI Tutor.”
- imageGeneration: “Missing VITE_OPENAI_API_KEY. Add it to .env to generate images.”
- SmartNotes: “Could not summarize. Check VITE_OPENAI_API_KEY.”
- PracticeSession: “Could not generate questions. Check VITE_OPENAI_API_KEY or try again.”

**Suggestion:** Introduce a small shared helper and a single user-facing message.

- **Helper:** e.g. `src/utils/aiCapability.js`:
  - `hasOpenAIKey() -> boolean`
  - `getApiKeyMessage() -> string` (e.g. “Add VITE_OPENAI_API_KEY to .env to use AI features.”)
- **Usage:** Services return a structured result when key is missing (e.g. `{ error: 'api_key_missing' }`); components use the helper to show the same message and optionally a link to README or SETUP.md.
- Keep existing heuristic fallbacks (e.g. Create from text without key) so the app remains usable.

### 2.2 Swallow errors in AI flows

**Where:** Several places use empty `catch` or ignore error payloads.

- **AITutor** opener: `.catch(() => {})` — opener fails silently.
- **smartNotesAI / anchorSuggestion / llmFacts:** Return `null` on any error; UI shows generic “Check VITE_OPENAI_API_KEY” or “failed” without distinguishing network, 4xx/5xx, or key missing.

**Suggestion:**

- In AITutor opener: at least set a non-blocking error state or log; optionally show a small “Couldn’t load opening message” with a retry or dismiss.
- In AI services: return a small shape, e.g. `{ ok: boolean, data?: T, errorCode?: 'api_key_missing' | 'network' | 'openai_error', message?: string }`. Components can then show the shared API key message for `api_key_missing` and a short user-friendly line for others.

---

## 3. State & architecture

### 3.1 All state in App.jsx

**Current:** `isMobile`, `showMobileMenu`, `showStudyAides`, `activeStudySession`, `tutorContext`, `exitSummary`, `showWelcome` all live in `App`. This is fine for a prototype but will grow.

**Suggestions:**

- **Study session:** Consider a small context (e.g. `StudySessionContext`) that holds `{ activeSession, exitSession, switchMode, askTutor }` so deep children (Picmonics, SmartNotes, AITutor) don’t need long prop chains. Optional; only if you add more session-level state or screens.
- **Device toggle:** `isMobile` is currently a manual toggle for prototyping. For production, derive from `window.matchMedia('(max-width: 768px)')` (or your breakpoint) and remove the Desktop/Mobile buttons, or move them behind a “dev only” flag.

### 3.2 “Ask tutor” when not in a session

**Current:** `handleAskTutor` switches to the tutor aide only if `activeStudySession?.course` exists. So “Ask tutor about this concept” from Picmonics/SmartNotes always has a course (we’re already in a session). If you later add “Ask tutor” from the course screen or home, you’ll need to either start a minimal study session (e.g. tutor + course) or have a tutor-only route that doesn’t require a course.

**Suggestion:** Document this in code or a small ADR: “Tutor is always used in the context of an active study session and a course.” If you add entry points outside the session, extend the logic explicitly (e.g. “start tutor session with this course”).

### 3.3 Exit summary and picmonicsBank

**Current:** `handleExitStudySession` calls `getDueCountFromConcepts(picmonicsBank, 'picmonics')`. That’s correct for a global “concepts due” count. If you later add per-course or per-mode (e.g. flashcards) due counts, you may want `getDueCountFromConcepts` to accept an optional course id or mode filter so the banner can say “X from this course” or “X Picmonics, Y Flashcards” without duplicating logic.

---

## 4. Data & services

### 4.1 Single source of picmonics

**Current:** Picmonics come from `data/picmonics.js` (and “Create from text” adds in-memory `pipelineArtifact`). Spaced review uses `picmonicsBank` for due counts. No conflict today.

**Suggestion:** If you add “save this mnemonic” or “my generated picmonics,” decide where they live (e.g. same bank with a `source: 'user'` flag, or a separate store). Keep one function that “all picmonics for course X” uses so the rest of the app doesn’t care about the source.

### 4.2 localStorage robustness

**Current:** Several modules use localStorage (spaced review, AITutor messages, onboarding flags, saved variant). They already guard with try/catch and optional chaining.

**Suggestions:**

- Use a tiny wrapper (e.g. `utils/storage.js`) that: get/set with try/catch, optional namespace/prefix, and return defaults on parse error. Then spaced review, tutor, onboarding, and saved variant call that wrapper so behavior and key naming are consistent.
- Document key names in one place (e.g. `STORAGE_KEYS` or in the wrapper) so you don’t collide with other tools or future features.

### 4.3 Pipeline and validation

**Current:** `mnemonicPipeline.runPipeline` returns an artifact; `withValidation` can set `_validation.blockImageGeneration` and `_validation.warnings`. Picmonics correctly disables “Generate image” and shows the first warning. Good.

**Suggestion:** If you add more validation rules, consider moving validation to a list of rules (e.g. array of `{ check, message }`) so adding a new rule doesn’t scatter conditionals across the codebase.

---

## 5. UX & UI

### 5.1 Loading and disabled states

**Current:** Buttons show “Generating…”, “Extracting facts…”, “…” and use `disabled={loading}`. Clear.

**Suggestions:**

- For long operations (e.g. image generation with 65s retry), consider a progress or “Still working…” message so users don’t think the app froze.
- Consistently use `aria-busy` or `aria-live` on the region that’s loading so screen readers get feedback.

### 5.2 Escape and keyboard

**Current:** Escape exits study mode in Picmonics, SmartNotes, PracticeSession; Flashcards use Space/Enter for flip and arrows for prev/next. Good.

**Suggestions:**

- Centralize “Escape exits study” in one place if possible (e.g. a `useEscapeToExit(onExit)` hook used by all study aides) so you don’t forget it when adding a new mode.
- Document keyboard shortcuts in a small “?” or “Keyboard shortcuts” panel for power users.

### 5.3 Prototype-only UI

**Current:** Desktop/Mobile toggle in the top-right is useful for prototyping.

**Suggestion:** Hide it behind an env flag (e.g. `VITE_DEV_UI=1`) or a “dev mode” in settings so production builds don’t show it.

### 5.4 Progress and streaks (Phase 4.2)

**Current:** Progress screen exists; SIMPLIFIED_HIGH_VALUE_ROADMAP notes “Due for review” count or streak could be added there.

**Suggestion:** On Progress (or Today), show “N concepts due for review” and optionally “M day streak” using existing `getDueCountFromConcepts` and `student.streak` (or real streak logic when you have it). Low effort, high perceived value.

---

## 6. Performance & bundles

### 6.1 Lazy loading

**Current:** All screens and study aides are imported in `App.jsx`, so they’re in the main bundle.

**Suggestion:** Use `React.lazy` + `Suspense` for heavy or rarely used screens (e.g. Timeline, Recovery, Social) and for study aides (Picmonics, PracticeSession, AITutor). Keep Home and Course in the main chunk so first paint stays fast. Measure with `vite build --mode production` and check chunk sizes.

### 6.2 Picmonics list and large lists

**Current:** Concept list and “Due for review” are small; no virtualization.

**Suggestion:** If a course ever has hundreds of concepts, consider virtualizing the concept list (e.g. `react-window` or a simple “load more”) so scrolling stays smooth.

---

## 7. Maintainability & consistency

### 7.1 Naming

**Current:** Mix of `course_id` / `concept_id` (snake_case) in data and `courseId` / `conceptId` in some JS. React props use camelCase. No major inconsistency, but worth keeping one convention for “ids from API/data” (e.g. always camelCase in JS, snake_case only at API boundary).

### 7.2 Magic strings

**Current:** Aide ids like `'flashcards'`, `'practice'`, `'picmonics'`, `'tutor'`, `'summary'` appear in `App.jsx` and `student.js` (studyAides). Mode names like `MODE_LEARNING`, `MODE_RETRIEVAL` are constants in Picmonics. Good.

**Suggestion:** Export aide ids from a single module (e.g. `constants/aides.js`) and use them in both `studyAides` and `App.jsx` so adding/renaming an aide is one place.

### 7.3 Tests

**Current:** No tests in the repo.

**Suggestions:**

- Unit tests for pure logic first: `spacedReview` (due calculation, advance interval), `extractFacts` / `rewriteFactsAsGroundTruth` in mnemonicPipeline, `getDueForReview` / `getDueCountFromConcepts`.
- One or two integration tests (e.g. “open course → open Picmonics → see concept list”) with React Testing Library to guard refactors.
- No need to test every component at first; focus on “if this breaks, the product is wrong” paths.

---

## 8. Accessibility (Phase 0.4)

**Current:** Some `aria-label`, `aria-live`, `role="status"`, and `sr-only` are present. Focus and reduced-motion are not fully audited.

**Suggestions:**

- Run axe-core (or Lighthouse a11y) on key flows: Home → Course → Picmonics → Generate image; Flashcards; AI Tutor.
- Ensure focus order: after opening Study Aide Launcher or a modal, focus moves into the modal and is trapped until close; on close, focus returns to the trigger.
- If you support reduced motion, add a small hook or class that respects `prefers-reduced-motion: reduce` for fade-in and any heavy animations.

---

## 9. Security & env

**Current:** `VITE_OPENAI_API_KEY` is used in the client; Vite exposes only `VITE_*` to the browser. So the key is visible in the client bundle and in network requests. For a prototype this is common; for production you’d proxy API calls through your backend and keep the key server-side.

**Suggestion:** Add a short note in README or SETUP.md: “For production, do not put the OpenAI API key in the frontend; use a backend proxy.” No code change required for the prototype.

---

## 10. Prioritized action list

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| P0 | Fix anchor suggestion bug (use `suggestedAnchor.visual` as `object`) | Small | High — feature currently no-op |
| P1 | Centralize API key check and user message | Small | Better first-run and support |
| P1 | Phase 4.2: Show “N due for review” (and optional streak) on Progress/Today | Small | High perceived value |
| P2 | AITutor opener: don’t swallow errors; show retry or message | Small | Reliability |
| P2 | useEscapeToExit hook + document shortcuts | Small | Consistency and a11y |
| P2 | Hide Desktop/Mobile toggle in production (env flag) | Small | Cleaner prod UX |
| P3 | Lazy-load Timeline, Recovery, Social, and/or study aides | Medium | Smaller initial bundle |
| P3 | localStorage wrapper + document keys | Small | Maintainability |
| P3 | Unit tests for spacedReview and mnemonicPipeline | Medium | Safe refactors |
| P4 | Optional StudySessionContext if session state grows | Medium | Cleaner props |
| P4 | a11y pass (axe + focus + reduced-motion) | Medium | Inclusivity and compliance |

**Implemented (Feb 2026):** P0 anchor fix, P1 API key + due/streak, P2 opener error+retry + useEscapeToExit + hide dev toggle. See `utils/aiCapability.js`, `hooks/useEscapeToExit.js`, ProgressScreen CTA, AITutor openerError.

---

## Summary

- **Fix first:** Anchor suggestion not applied in Create from text (`object` vs `visual`).
- **Then:** One shared API key message and, if you want a quick win, “due for review” (and optionally streak) on Progress/Today.
- **Next:** Better error handling for AI flows, a bit of structure (hooks, constants, storage wrapper), and optional lazy loading and tests.
- The codebase is in good shape for a prototype; these changes will make it more robust, easier to support, and ready for the next phase (e.g. real LMS, auth, or backend proxy).
