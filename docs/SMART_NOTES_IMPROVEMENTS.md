# Smart Notes Feature — Review & Top 5 Improvement Ideas

A concise review of the Smart Notes feature and five high-impact ideas to improve it.

---

## Current Behavior (verified in code)

- **Purpose:** One-concept study notes with three sections: *What it is*, *Why it matters*, *Common confusion*. Part of the study session (AI Tutor, Smart Notes, Flashcards, Picmonics, Practice, Audio).
- **Data:** Static demo data in `src/data/smartNotes.js` keyed by course id and topic. `getSmartNote(course, topic, context)` accepts `context` ("exam" | "class" | "review") but **does not use it**—the same note is returned for every context.
- **UI:** Topic + context dropdowns; note card with "Commonly tested" badge; Copy note, Read aloud, **Summarize (AI)**, **Expand (AI)**; "Ask tutor about this concept."
- **AI:** `src/services/smartNotesAI.js` — OpenAI `gpt-4o-mini` for summarize (3 bullets) and expand (2–4 sentences). Errors surface a generic "Add VITE_OPENAI_API_KEY…" message; no distinction between missing key, network, or API errors.
- **Integration:** "Ask tutor about this concept" opens AI Tutor with `conceptName` and `summary` pre-loaded (`onAskTutor`). Escape exits study mode via `useEscapeToExit`.

**Gaps:** Context has no effect on content. AI results are ephemeral (no history, no save). No "Flag for review" / "I'm confused." No link to spaced repetition or "due for review." No citation (e.g. "from syllabus p.3").

---

## Top 5 Ideas to Improve Smart Notes

### 1. **Make context actually change the note (context-aware content)**

**Problem:** The context dropdown (Exam prep / Before class / Quick review) does nothing—same note for all three.

**Idea:** Use context to tailor content or phrasing.

- **Option A (data):** In `smartNotes.js`, store optional variants per context, e.g. `smart_note.exam`, `smart_note.class`, `smart_note.review` with slightly different phrasing (exam = "commonly tested" angle; class = "what to listen for"; review = "quick recap"). `getSmartNote()` returns the variant for the selected context, with fallback to the current single blob.
- **Option B (AI):** Keep one base note; on context change (or on first load per context), call a light AI endpoint: "Rephrase this note for [exam prep | before class | quick review]" and cache the result in component state or a small store. Reduces static data but adds latency and cost.

**Why it matters:** Users chose a context expecting different emphasis; honoring it increases perceived value and usefulness.

**Effort:** Low (Option A, data-only) to medium (Option B, new AI prompt + caching).

---

### 2. **Persist or reuse AI results (Summarize / Expand)**

**Problem:** Summarize and Expand replace the previous result each time and are lost on topic/context change or when leaving Smart Notes.

**Idea:** Give AI outputs a longer life.

- **In-session:** Keep a small cache keyed by `(conceptId or topicName, type)` so re-selecting a topic shows the last "Summary (AI)" or "Expanded (AI)" for that concept if it exists. Optionally show "Generated earlier" with a "Regenerate" control.
- **Across sessions:** Persist to `localStorage` (or later, backend) by course + concept + type. On load, if a saved summary/expansion exists for current concept, offer "Show saved summary" or pre-fill the AI result area.

**Why it matters:** Students often revisit the same concept; regenerating every time wastes tokens and loses a potentially good prior result.

**Effort:** Low to medium (in-memory cache is quick; persistence adds a bit more).

---

### 3. **"Flag for review" / "I'm confused" on the concept**

**Problem:** Vision docs (e.g. SCHOLAR_VISION_REVIEW.md) suggest "I'm confused" or "Flag for review" in Smart Notes or Tutor, but Smart Notes has no such action.

**Idea:** Add one or two actions on the note card.

- **"Flag for review"** — Mark this concept as needing later review. Store in `localStorage` (or backend) as a set of `courseId + conceptId/topicName`. In Home/Course/Study Aide Launcher, show a "Flagged for review" list or badge and prioritize these concepts when recommending "what to study next."
- **"I'm confused"** — Same storage idea; optionally open AI Tutor with this concept pre-loaded and a hint like "Student flagged this as confusing," so the tutor can focus on clarification.

**Why it matters:** Aligns with learning-science and product vision; gives students a sense of control and a path from "stuck" to "get help."

**Effort:** Low (UI + localStorage) to medium (if you wire into recommendations and Tutor).

---

### 4. **Richer AI error handling and optional retry**

**Problem:** Any failure (missing key, network, 4xx/5xx) shows the same message: "Summarize failed. Add VITE_OPENAI_API_KEY…" which is wrong when the key is present but the request failed.

**Idea:** Differentiate errors and add retry.

- **Errors:** Use `checkApiKey()` before the request; if key is missing, show the existing API-key message. On `fetch` failure or `data.error`, show a short, specific message: e.g. "Network error. Check your connection." or "OpenAI error. Try again in a moment." Do not mention the env var when the key is present.
- **Retry:** Add a "Retry" button (or automatic retry once) when the error is network or 5xx, and keep "Summarize (AI)" / "Expand (AI)" disabled only while loading.

**Why it matters:** Reduces support confusion and helps users know whether to fix env vs. network vs. wait.

**Effort:** Low (small changes in `smartNotesAI.js` and `SmartNotes.jsx`).

---

### 5. **Link Smart Notes to "due for review" and study recommendations**

**Problem:** Smart Notes is isolated from spaced repetition and "due for review" — the app has or plans due-counts and recommendations (e.g. from Picmonics), but Smart Notes doesn’t surface or consume them.

**Idea:** Connect notes to the rest of the learning loop.

- **In Smart Notes:** Show a small cue when the current concept is "due for review" (e.g. from `getDueCountFromConcepts` or a shared review state): e.g. "You marked this for review" or "Due for review today." Optionally sort or highlight topics that are due in the topic dropdown.
- **From Home / Launcher:** When recommending "what to study next," include "Review your Smart Notes for [concept]" as an action that opens Smart Notes with that concept (and optionally context) pre-selected.

**Why it matters:** Makes Smart Notes part of a single "what to do next" story and reinforces spaced review without building a full SRS inside Smart Notes.

**Effort:** Medium (depends on how due-for-review and recommendations are modeled; likely a small amount of shared state or helpers).

---

## Summary Table

| # | Idea | Impact | Effort |
|---|------|--------|--------|
| 1 | Context-aware content (exam/class/review) | High — matches user expectation | Low–Medium |
| 2 | Persist or reuse AI (Summarize/Expand) | High — less waste, better UX | Low–Medium |
| 3 | "Flag for review" / "I'm confused" | High — aligns with vision, reduces helplessness | Low–Medium |
| 4 | Better AI errors + retry | Medium — fewer support dead-ends | Low |
| 5 | Link to "due for review" & recommendations | Medium — Smart Notes in the learning loop | Medium |

**Suggested order:** Do **4** first (quick win), then **1** (data or AI variant), then **3** (flag/confused), then **2** (cache/persist), then **5** (integration with due-for-review and recommendations).
