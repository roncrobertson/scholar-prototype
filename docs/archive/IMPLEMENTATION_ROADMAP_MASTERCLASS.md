# Scholar — Master Class Prototype Implementation Roadmap

This roadmap turns the current Scholar prototype into a **master-class, AI-native learning app** that demonstrates exceptional functionality for student success through **intelligence** (adaptive, personalized) and **generative learning actions** (AI-generated content, tutoring, and retrieval). It builds on the handoff (`HANDOFF_CONTINUATION.md`) and the Picmonic roadmap (`PICMONIC_ROADMAP.md`).

**North star:** A prototype that clearly shows how modern AI can power learning—conversational tutor, generative mnemonics and practice, spaced retrieval—with a simple, guided flow and working features end-to-end.

---

## Phase 0: Foundation & Polish (Pre–AI)

**Goal:** Solid, predictable base. Every button works; flow is clear; content is teaching-grade.

| # | Deliverable | Details |
|---|-------------|---------|
| 0.1 | **Button & flow audit** | Verify Generate image, Show all labels, Hover/Click, Create from text, Pick another concept, Play narrative, Study mode switcher, Back. Fix any broken handlers or navigation. |
| 0.2 | **Picmonic image quality** | Simplify prompts: one clear anchor, minimal background, strict no-text. Optional: “Regenerate” with a tighter style variant. Reduce chaotic, busy scenes. |
| 0.3 | **Legend–hotspot parity** | “What each part means” in the right panel matches hotspot order and wording; student can decode from text or image. |
| 0.4 | **Responsive & accessibility** | Picmonics 50/50 stacks cleanly on mobile; focus states and labels for key actions; optional reduced motion. |

**Outcome:** App feels complete and trustworthy before adding more AI.

---

## Phase 1: AI-Powered Intelligence (Tutor & Guidance)

**Goal:** Make “AI” visible and useful: conversational tutor and context-aware help.

| # | Deliverable | Details | AI Leverage |
|---|-------------|---------|--------------|
| 1.1 | **AI Tutor chat** | Dedicated Tutor view: chat UI (input + message list). On send, call OpenAI Chat Completions (or configured LLM) with system prompt: “You are a patient tutor for [course]. Use the current concept when provided. Explain simply; ask one follow-up to check understanding.” Pass current concept name and optional “What it is” text as context. | **OpenAI/LLM** for dialogue. |
| 1.2 | **Context injection** | When user is in a study mode (Picmonics, Flashcards, etc.), “Current context” (concept name, 1–2 sentence summary) is sent with tutor messages so the model can reference the topic. | Same API; structured context in request. |
| 1.3 | **Smart “Explain this”** | In Picmonics or Smart Notes, add “Explain this” or “Ask tutor about this concept” that opens AI Tutor with the concept pre-loaded. | Same chat API; deep link into tutor with concept. |
| 1.4 | **Home / course suggestions** | Optional: “Suggested for you” on Home or course screen—e.g. “Review Cell Membrane” (from Phase 2 spacing) or “Try Picmonics: Photosynthesis.” Can be rule-based at first (e.g. least recently studied). | Later: LLM-generated suggestions from progress. |

**Outcome:** Students experience a real AI tutor that responds in context; the app clearly demonstrates “AI-enabled” learning.

---

## Phase 2: Generative Learning Actions (Content & Practice)

**Goal:** Use AI to generate or enrich learning content—mnemonics pipeline, practice questions, summaries.

| # | Deliverable | Details | AI Leverage |
|---|-------------|---------|--------------|
| 2.1 | **LLM-backed pipeline (Create from text)** | Replace heuristic `extractFacts` with an LLM call: “From this paragraph, extract 3–7 atomic, testable facts. Return JSON: [{ fact_text, fact_type, priority }].” Optional: “Rewrite each fact as one exam-style sentence.” Use structured output or parse. Fallback to current heuristic if no API key. | **OpenAI/LLM** for fact extraction and ground-truth rewrite. |
| 2.2 | **Anchor suggestion (optional)** | For “Create from text” or new concepts: “Suggest a sound-alike mnemonic phrase and one-sentence visual for [concept].” LLM returns 1–3 options; user picks or edits. Store in anchor library. | **OpenAI/LLM** for phonetic + visual suggestions. |
| 2.3 | **Generate practice questions** | In Practice or from a concept: “Generate 3 multiple-choice questions for [concept] with correct answer and brief explanation.” Call LLM; display in existing Practice UI or a simple quiz view. | **OpenAI/LLM** for question generation. |
| 2.4 | **Smart Notes enhancement** | Optional: “Summarize this concept in 3 bullet points” or “Expand this into a short paragraph” using the current concept text + LLM. | **OpenAI/LLM** for summarization or expansion. |
| 2.5 | **Picmonic prompt upgrade** | Use artifact (facts, anchor, symbol_map) to build a richer, more constrained DALL·E prompt (e.g. “Scene: [anchor]. Left: [left zone]. Center: [anchor action]. Right: [effect]. No text. Simple, memorable.”). Optionally one LLM call to turn blueprint into a single, clear scene sentence for DALL·E. | **DALL·E** + optional **LLM** for scene sentence. |

**Outcome:** The app generates facts, anchors, questions, and (optionally) better image prompts—demonstrating “generative” learning actions.

---

## Phase 3: Intelligent Retrieval & Adaptation

**Goal:** Spaced retrieval, occlusion, and quiz so learning is reinforced and measurable.

| # | Deliverable | Details | AI Leverage |
|---|-------------|---------|--------------|
| 3.1 | **Spaced review queue** | “Due for review” for Picmonics (and optionally Flashcards): last-seen + intervals (e.g. 1d, 3d, 7d). Persist in localStorage. Surface “Picmonics to review” on Home or in-course. | Logic only; later: model-predicted difficulty or interval. |
| 3.2 | **Occlusion mode (Picmonics)** | Third study mode: “Cover one.” Hide one hotspot; ask “What’s missing? What fact does it encode?” Reveal on tap; optional “Next” to cycle. | None; uses existing hotspot map. |
| 3.3 | **Quiz from artifact** | Auto-generate 2–4 quiz prompts per Picmonic (e.g. “What does [element] represent?”, “Which part encodes [fact]?”). Store in canonical `study_modes.quiz_prompts`. Simple quiz UI: show image, show question, check answer from hotspot/legend. | Optional: LLM to vary question phrasing. |
| 3.4 | **Retrieval summary** | After a session (Picmonics or Flashcards): “You reviewed X concepts. Y due again in Z days.” Optional: “Streak: N days.” | Logic + localStorage. |

**Outcome:** Students see “when to review” and can practice with occlusion and quiz—evidence-based retrieval and spacing in the UI.

---

## Phase 4: Cohesive Experience & “AI Study Buddy”

**Goal:** The app feels like one product: onboarding, progress, and clear AI touchpoints.

| # | Deliverable | Details | AI Leverage |
|---|-------------|---------|--------------|
| 4.1 | **Unified study session** | From a course, “Study” opens one session with a single top bar: AI Tutor | Smart Notes | Flashcards | Picmonics | Practice | Audio. Switch mode without leaving; “Back to course” exits. (Largely done; verify and polish.) | — |
| 4.2 | **Progress & streaks** | Today view or Progress: concepts studied, picmonics generated, “Due for review” count, streak. Simple dashboard. | Optional: LLM “weekly summary” or “what to focus on.” |
| 4.3 | **Onboarding / first-run** | Short “What Scholar does”: “Study with AI Tutor, visual mnemonics (Picmonics), and practice. Start by picking a course and a study mode.” Optional: one-time tooltip on Picmonics (“Generate an image to encode the concept”) and on AI Tutor (“Ask anything about your course”). | — |
| 4.4 | **AI visibility** | Clear labels: “AI Tutor,” “Generate image (AI),” “Create from text (AI pipeline),” “Generate practice questions (AI).” Optional: small “Powered by OpenAI” or “AI” badge where relevant. | — |

**Outcome:** Students understand how to use the app and where AI is helping.

---

## Phase 5: Optional “Next Level” (If Time)

| # | Idea | Notes |
|---|------|--------|
| 5.1 | **Voice (Audio Review)** | Text-to-speech for narratives or “Read this concept”; optional speech-to-text for tutor. | Browser APIs or OpenAI TTS/STT. |
| 5.2 | **Multi-turn tutor with memory** | Tutor remembers last N turns in the session; optional “Remember I’m studying for BIO 201” in system prompt. | Same chat API; client-side or minimal backend for history. |
| 5.3 | **Picmonic variant picker** | “Generate another” already exists; add “Save this variant” or “Use this as default” and persist. | — |
| 5.4 | **Export / share** | “Export this mnemonic as image + legend” or “Copy one-sentence story.” | — |

---

## Implementation Order (Suggested)

1. **Phase 0** — Foundation (0.1–0.4).  
2. **Phase 1** — AI Tutor (1.1–1.3).  
3. **Phase 2** — At least 2.1 (LLM pipeline) and 2.5 (picmonic prompt); then 2.3 (practice questions).  
4. **Phase 3** — 3.1 (spacing), 3.2 (occlusion), 3.3 (quiz).  
5. **Phase 4** — 4.1–4.4 (experience and AI visibility).  
6. **Phase 5** — As scope allows.  
7. **Phase 6** — UI/UX Modernization (see SIMPLIFIED_HIGH_VALUE_ROADMAP.md § Phase 6).

---

## Phase 6: 2026 UI/UX Modernization (Feb 2026)

**Goal:** Modernize nav and application so Scholar feels designed in 2026.

| # | Area | Deliverables |
|---|------|--------------|
| 6.1 | **Typography** | Replace Inter with Geist/Satoshi; variable fonts. |
| 6.2 | **Icons** | Replace emojis with Lucide/Phosphor/Heroicons. |
| 6.3 | **Sidebar** | Collapsible rail; persist preference. |
| 6.4 | **Depth** | Card shadows; glassmorphism overlays; background gradients. |
| 6.5 | **Dark mode** | Theme context; semantic tokens; toggle. |
| 6.6 | **Motion** | View Transitions; staggered reveals; reduced-motion support. |
| 6.7 | **Mobile nav** | Bottom nav with labels; sheet-style menu; safe area. |
| 6.8 | **Study bar** | Floating bar; segment control. |
| 6.9 | **Cards** | Softer corners; hover lift; bento layout. |
| 6.10 | **Color** | Richer palette; strategic gradients. |

**Detail:** See SIMPLIFIED_HIGH_VALUE_ROADMAP.md § Phase 6.

---

## Environment & API Assumptions

- **OpenAI (or substitute):**  
  - Chat Completions for AI Tutor, fact extraction, anchor suggestion, practice questions, Smart Notes.  
  - DALL·E 3 for Picmonics (already used).  
- **Keys:** `VITE_OPENAI_API_KEY` in `.env`; same key for chat and images unless split.  
- **No backend required for prototype:** All calls from browser. For production, proxy API keys through a backend.

---

## Success Criteria for “Master Class” Prototype

- **AI is visible and useful:** Tutor responds in context; at least one generative action (e.g. Create from text with LLM, or Generate practice questions) works end-to-end.  
- **Flow is simple:** One study session, clear mode switcher, back to course; no dead ends.  
- **Buttons and core paths work:** Generate image, Show all labels, Create from text, Play narrative, Tutor send, Practice attempt.  
- **Learning is guided:** Teaching-grade Picmonics (What it is, How to remember it, legend, one-sentence story, exam takeaway); retrieval (occlusion/quiz) and spacing surface in the UI.  
- **Picmonic images are on-mark:** Simpler, less chaotic, no text in image; optional regenerate.

---

## References

- **Handoff:** `docs/HANDOFF_CONTINUATION.md` — current state, key files, known issues.  
- **Picmonic roadmap:** `docs/PICMONIC_ROADMAP.md` — 10-item mnemonic system roadmap.  
- **Master document:** Learning-science foundations, visual grammar, pipeline, data model (referenced in Picmonic roadmap).

## Implemented (Autonomous Run — Feb 2026)

| Phase | Item | Status |
|-------|------|--------|
| 0.1 | Button & flow audit | Done: aria-labels, focus rings |
| 0.2 | Picmonic image quality | Done: simpler STYLE_PREFIX, Regenerate button |
| 0.3 | Legend–hotspot parity | Done: term in getDisplayHotspots; legend matches hotspots |
| 0.4 | Responsive & a11y | Done: focus:ring, aria-labels |
| 1.1–1.3 | AI Tutor + context + Explain this | Done: conceptContext; Ask tutor in Picmonics & Smart Notes |
| 2.1 | LLM-backed pipeline | Done: llmFacts.js; runPipeline async, LLM first |
| 2.5 | Picmonic prompt upgrade | Done: STYLE_PREFIX max 4 elements |
| 2.3 | Generate practice questions | Done: generatePracticeQuestions.js; Generate 3 questions (AI) |
| 3.1 | Spaced review queue | Done: spacedReview.js; recordStudied; HomeScreen Due for review |
| 3.2 | Occlusion mode | Done: Cover one in MnemonicCanvas |
| 3.3 | Quiz from artifact | Done: buildQuizPromptsFromHotspots; Quiz panel |
| 4.4 | AI visibility | Done: Generate image (AI), Generate mnemonic (AI), Generate 3 questions (AI) |

Use this roadmap in new Cursor threads: “Continue from IMPLEMENTATION_ROADMAP_MASTERCLASS.md; do Phase 0 and Phase 1.1 (AI Tutor).”
