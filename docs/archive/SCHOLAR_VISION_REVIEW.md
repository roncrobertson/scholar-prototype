# Scholar Vision Review — Master Class Prototype

**Purpose:** Review the app and codebase against the full Scholar vision (Intelligence Layer, Generative AI + Learning Science, Student Experience) and identify what’s in place vs. what’s needed for a master-class prototype.

---

## 1. Vision Summary (Reference)

| Pillar | Vision |
|--------|--------|
| **Contextual** | Knows the course: auto-ingests syllabi/schedules, deadlines, grading weights, instructor intent. No uploads, no setup. |
| **Personalized** | Knows the student: concept-level mastery, confidence/decay risk, confusion flags, learning styles. |
| **Proactive** | Makes decisions: prioritizes across courses, identifies at-risk concepts early, **one action / one reason / one path**, stays quiet when on track. |
| **Generative** | Study materials (summaries, flashcards, quizzes), explanations (breakdowns, Q&A), multi-modal (audio, visual, text), **course-grounded, no hallucination**. |
| **Learning Science** | Spaced repetition, active recall, interleaving, metacognition, desirable difficulty, spacing. |
| **Student Experience** | Morning briefing, just-in-time prep (cram mode), grade trajectory (“Here’s your path to a B+”). |

---

## 2. What’s Already Aligned

### 2.1 Contextual — Knows the Course

| Vision | Current State | Notes |
|-------|----------------|-------|
| Syllabi / schedules | ✅ `courses.js`: schedule, room, nextClass, upcoming (exams, quizzes, papers) | Static; no LMS auto-ingest. |
| Deadlines, grading weights | ✅ `upcoming[].due`, `upcoming[].weight`, `missingWork` | Present in data model. |
| Instructor intent | ✅ `instructor.style`, `instructor.tip` on each course | Shown on CourseScreen and injected into AI Tutor context. |
| No uploads | ⚠️ Prototype uses static data; vision implies auto-ingest from LMS (future). | Fine for prototype. |

**Verdict:** Course context is well represented in data and UI. Instructor tips are used (AITutor, CourseScreen). Missing: real syllabus ingestion; for prototype, this is acceptable.

### 2.2 Personalized — Knows the Student

| Vision | Current State | Notes |
|-------|----------------|-------|
| Concept-level mastery | ✅ `course.masteryTopics[]` with name + mastery % | Shown on CourseScreen, used in Home “focus” and `getRecommendedNext()`. |
| Confidence / decay risk | ❌ Not modeled | No “last studied” or “decay risk” in data. |
| Confusion flags | ⚠️ Partial | Smart Notes has “common confusion” per topic; no student-specific “I’m confused” flag. |
| Learning styles | ❌ Not modeled | No preference (visual/audio/text) in `student.js`. |

**Verdict:** Mastery by topic is there and drives recommendations. Confidence, decay, and explicit confusion/blockers are absent—important for “knows the student.”

### 2.3 Proactive — Makes Decisions

| Vision | Current State | Notes |
|-------|----------------|-------|
| Prioritizes across courses | ✅ `getRecommendedNext()` in `courses.js` | Recovery → exam prep → weak mastery; single CTA on Home. |
| One action, one reason, one path | ✅ Home “Recommended next” + single primary CTA | Label + sublabel + one button (“Prep now” / “Go to Recovery”). |
| Identifies at-risk concepts | ✅ Weakest topic surfaced in “Your focus” and in recommendation sublabel | e.g. “Practice weak areas • BIO 201 • Cell Signaling (45%)”. |
| Stays quiet when on track | ⚠️ Not differentiated | No “you’re on track, no nudge” state; recommendation always shown. |

**Verdict:** One clear recommendation and prioritization logic exist. Missing: “on track” state that suppresses or softens the nudge.

### 2.4 Generative AI + Learning Science

| Vision | Current State | Notes |
|-------|----------------|-------|
| Summaries | ✅ Smart Notes: what_it_is, why_it_matters, common_confusion | Demo data; structure is course/topic/context aware. |
| Flashcards | ✅ Flashcards.jsx + `flashcards.js` | Flip, rate (Got it / Study again), session summary; no spaced intervals yet. |
| Practice quizzes | ✅ PracticeSession + `questions.js` | MC + short answer, concept_id, rationale, misconception_hint. |
| Explanations / Q&A | ✅ AI Tutor with course context + optional concept | System prompt is retrieval-friendly; suggests Picmonics/Flashcards. |
| Visual mnemonics | ✅ Picmonics: decomposition → anchor → symbol map → DALL·E image | Create from text (heuristic pipeline), Learning/Retrieval modes. |
| Multi-modal | ✅ Picmonics: image + narrative; Smart Notes: text; “Play narrative” (TTS) | Audio Review (podcast) is launcher-only, no implementation. |
| Course-grounded | ✅ Tutor gets course + topics + upcoming + instructor tip; Smart Notes/Questions are per-course/concept | No citation of “from syllabus p.3”; for prototype, grounding is conceptual. |
| Spaced repetition | ❌ Not implemented | Roadmap Phase 3.1: “Due for review” with intervals (1d, 3d, 7d). |
| Active recall | ✅ Flashcards (flip, rate), Picmonics Retrieval mode (hide labels, tap to reveal) | Good. |
| Interleaving | ⚠️ Optional | Practice can mix concepts; no explicit “mix topics across courses” UI. |
| Metacognition | ⚠️ Partial | Mastery % and “weak areas” visible; no “what you know vs don’t” summary. |
| Desirable difficulty / Spacing | ❌ No scheduling | No weekly review schedule or difficulty calibration. |

**Verdict:** Strong generative and retrieval features (Picmonics, Tutor, Smart Notes, Practice, Flashcards). Learning-science gaps: spaced repetition, “due for review,” and explicit spacing/desirable difficulty.

### 2.5 Student Experience

| Vision | Current State | Notes |
|-------|----------------|-------|
| Morning briefing | ⚠️ Partial | “Good morning, Jordan” + today’s classes + recommended next; no “2 classes today, 4 tasks” or “focus time available.” |
| Just-in-time prep / Cram mode | ⚠️ Partial | “Prep now” and “Your focus” for first class today; no “PSYCH 101 in 4 hours — 15-min cram” with key points + quick quiz. |
| Grade trajectory | ⚠️ Partial | ProgressScreen: grade vs target per course; no “Here’s your path to a B+” with current / with effort / best case or actionable plan. |
| Streak tracking | ✅ Student streak + challenges (e.g. Mastery Sprint) | Activity rings, challenges. |
| Proactive nudge | ✅ Single “Recommended next” and “Your focus” | As above; could be time-aware (e.g. before class). |

**Verdict:** Home feels like a daily hub with one priority. Morning briefing and cram mode are under-specified; grade trajectory is present but not narrative (“path to B+”).

---

## 3. Gap Summary (Prioritized for Master-Class Prototype)

### High impact (core to “intelligence layer” and “one action”)

1. **“On track” vs “nudge” state**  
   Use a simple rule: e.g. all courses at/above target and no missing work and no exam in next 7 days → show “You’re on track” (or hide the big CTA) instead of always showing “Recommended next.”

2. **Morning briefing copy**  
   Add: “X classes today • Y tasks to stay on track” and optional “Focus time available: Zh” (from a simple daily-capacity constant or placeholder). Keeps current one-action CTA but frames it as the briefing.

3. **Grade trajectory narrative**  
   On Progress (or a dedicated card): “Here’s your path to a B+” with current grade, “if you do X” grade, and one or two focus areas (e.g. from lowest mastery). Data is mostly there; needs one screen or section and copy.

4. **Just-in-time prep (cram mode)**  
   For “next class today”: one click to “15-min cram” that opens a pre-filled flow: key points (from Smart Notes or Tutor), optional quick quiz (Practice), optional audio (narrative). Can be a dedicated route or a variant of “Prep now” that goes to a cram view instead of the launcher.

5. **Spaced repetition / “Due for review”**  
   Persist last-seen (and optionally interval) for Picmonics (and optionally Flashcards) in localStorage. Surface “Due for review” count on Home or in-course and a “Review” queue. Aligns with “resurface at optimal intervals” and roadmap Phase 3.1.

### Medium impact (stronger “knows the student” and learning science)

6. **Decay / confidence**  
   Add `lastStudiedAt` (or `lastSeenAt`) per concept or card; use it in “Recommended next” (e.g. prefer concepts not seen in 7 days) and for a simple “Due for review” list.

7. **Confusion flags**  
   In Smart Notes or Tutor: “I’m confused” (or “Flag for review”) that marks the concept for the student and bumps it in recommendations. Stored in localStorage per user/concept.

8. **Learning style / modality**  
   In `student.js` add `preferredModality: 'visual' | 'audio' | 'text'` (or similar). Use it to sort or highlight study aides (e.g. “Start with Picmonics” vs “Start with Audio Review”).

9. **Metacognition view**  
   One screen or section: “What you know” (e.g. topics ≥80% mastery) vs “What to work on” (e.g. &lt;70%), with one “next best action” per at-risk concept.

### Lower priority (polish and scale)

10. **Syllabus auto-ingest**  
    Out of scope for prototype; keep static course data and document “would connect to LMS” in README or product notes.

11. **Course-grounded citations**  
    “From lecture slide 3” / “From Ch. 2” in Tutor or Smart Notes requires syllabus chunking; optional later.

12. **Interleaving**  
    “Study across courses” could be a toggle in Practice or Flashcards (e.g. “Mix BIO + PSYCH”). Nice-to-have.

---

## 4. Architecture and Codebase Notes

- **App.jsx:** Clean routing and study-session state; single place for “active study session” and mode switcher (Picmonics, Flashcards, Practice, Tutor, Smart Notes). Good for adding “cram” as a flow that sets `activeStudySession` with pre-chosen aide and concept.
- **Data:** `courses.js`, `student.js`, `timeline.js`, `questions.js`, `flashcards.js`, `smartNotes.js`, `picmonics.js` (and related) are well-scoped. Adding `lastStudiedAt` or `dueForReview` would fit in a small `reviewState.js` or inside existing `student.js` / course helpers.
- **AI:** Tutor uses course context and learning-oriented system prompt. Picmonics uses pipeline + DALL·E. Smart Notes and Practice are static/demo data; roadmap’s LLM-backed fact extraction and generated questions would align with “generative, course-grounded” without changing UX drastically.
- **Docs:** `IMPLEMENTATION_ROADMAP_MASTERCLASS.md` already aligns with this vision (Phases 0–5). This review complements it by mapping every vision pillar to current behavior and gaps.

---

## 5. Recommended Next Steps (Ordered)

1. **Copy and framing**  
   Implement “on track” logic and morning-briefing copy (“X classes today • Y tasks”; optional “Focus time: Zh”). No new screens—Home only.

2. **Grade trajectory**  
   Add “Path to B+” (or target) section to ProgressScreen with current vs target and 1–2 focus areas from mastery data.

3. **Cram mode**  
   Add “15-min cram for [course]” from Home or course: opens a dedicated flow (key points + quick quiz + optional audio) for the next class today.

4. **Due for review**  
   Implement localStorage-backed “last seen” for Picmonics (and optionally Flashcards); add “Due for review” count and queue (Phase 3.1 of roadmap).

5. **Decay / confidence**  
   Use last-seen in `getRecommendedNext()` so “practice weak areas” prefers long-unchanged concepts where possible.

6. **Confusion flag**  
   Add “Flag for review” in Smart Notes or Tutor; persist and use in recommendations.

7. **Metacognition**  
   Add “What you know / What to work on” plus one next action per at-risk concept (can reuse Progress or Home).

---

## 6. Success Criteria for Master-Class Prototype

- **Intelligence layer**  
  Scholar “knows the course” (data + instructor tips), “knows the student” (mastery + optional decay/confusion), and “makes decisions” (one action, one reason; quiet when on track).

- **Generative + learning science**  
  Tutor, Picmonics, Smart Notes, Practice, Flashcards are visible and usable; at least one “due for review” or spaced cue is visible; learning-science language (spaced repetition, active recall) is reflected in UI copy or docs.

- **Student experience**  
  Morning briefing (with task count and optional focus time), one clear nudge, optional cram mode for “class in N hours,” and grade trajectory (“path to B+”) are present and readable in one pass.

This review should be used alongside `IMPLEMENTATION_ROADMAP_MASTERCLASS.md` and the product vision doc to prioritize the next sprint and keep the prototype aligned with Scholar’s aspiration.
