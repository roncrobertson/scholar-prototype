# Simplified High-Value Roadmap — Masterful Learning System

**Source:** IMPLEMENTATION_ROADMAP_MASTERCLASS.md (Phases 0–5); Phase 6 from Feb 2026 UI/UX audit.  
**Goal:** Pick the highest-value, executable items that make Scholar feel like a masterful learning system.  
**Last updated:** Feb 2026; Phase 6 (2026 UI/UX Modernization) added.

---

## Where to store project info

- **This file (roadmap)** — When we agree on a feature or verify it’s done: add/update a phase item here (What’s Done, Not Done, or Recommended Next Steps).
- **Feature/domain docs** — When you give detailed info about *how* something works (constraints, policy, flow): put it in the relevant doc so it persists across conversations.
  - **Picmonics / image generation:** `docs/PICMONIC_FEATURE_OVERVIEW.md` (flow, policy, Path A/B, hotspots, Master Doc comparison).
  - **Full phase plan:** `docs/IMPLEMENTATION_ROADMAP_MASTERCLASS.md`.
  - **Other areas:** create or use an existing doc in `docs/` and mention it here or in README.

---

## Docs

**Primary docs:** See **`docs/README.md`** for the full index. Five living docs (handoff, roadmap, Picmonic overview, image flow, validation) stay in `docs/`; the rest are in **`docs/archive/`** for reference.

---

## Code-check: what’s already done (Feb 2026)

These items from PICMONIC_EVALUATION, CODEBASE_AUDIT, and roadmap are **verified in code** — no need to redo.

| Item | Where verified |
|------|----------------|
| **Anchor suggestion applied** | Picmonics.jsx passes `{ phrase: suggestedAnchor.phrase, object: suggestedAnchor.visual }` to runPipeline; mnemonicPipeline uses anchorOverride.object. |
| **R1/R5 recall_story** | conceptDecompositions has recall_story for several concepts; Picmonics “One-sentence story (for recall)” shows `artifact.recall_story \|\| transcript…`; pipeline derives recall_story. |
| **R2 Anchor hotspot** | canonicalArtifact.js: hotspotsCanonical builds anchor as first hotspot (hotspot-anchor, center); getDisplayHotspots returns anchor + symbol_map in order. |
| **R3 Bizarre excellence** | promptEngineer.js STYLE_PREFIX: “Make the scene slightly absurd or whimsical so it is highly memorable…” |
| **API key experience** | aiCapability.js: hasOpenAIKey(), getApiKeyMessage(), checkApiKey(); used by AITutor, SmartNotes, PracticeSession, imageGeneration. |
| **Phase 4.2 Due count on Progress** | ProgressScreen shows snapshot.dueCount “Due for review” and “Review Picmonics” button; studyStats.getStudySnapshot() includes dueCount; HomeScreen and exit summary show due count. |

**Picmonic completions (Feb 2026):** Per-fact `visual_mnemonic` everywhere; “Try another scene” when multiple variants exist; primary fact in prompt; pipeline vs library parity (same artifact shape, visual_mnemonic/encoding_mode); encoding_mode in prompt/validation. See `docs/PICMONIC_FEATURE_OVERVIEW.md` for details and remaining items.

---

## What’s Already Done (Verified in Code)

### Phase 0 — Foundation
- **0.1** Button & flow audit — Handlers wired; Generate image, Show all labels, Create from text, Pick another concept, Play narrative, Study mode switcher, Back. ✅
- **0.2** Picmonic image quality — Minimal blueprint path: when artifact has anchor + symbol_map, `buildScenePrompt` uses `deriveMinimalSceneFromBlueprint` (one anchor + up to 3 elements); global policy (`visualMnemonicPolicy.applyPolicy`) on all scene text. ✅
- **0.3** Legend–hotspot parity — “What each part means (same order as hotspots on image)” in Picmonics; legend built from `getDisplayHotspots(canonical)` in same order; anchor first, then `hotspots.map` with term/mnemonicLogic/label. ✅

### Phase 1 — AI Tutor & Guidance
- **1.1–1.3** AI Tutor chat with course context; “Ask tutor about this concept” from Picmonics and Smart Notes → Tutor with concept pre-loaded. ✅

### Phase 2 — Generative Actions
- **2.1** LLM fact extraction for “Create from text” — `mnemonicPipeline.runPipeline` calls `extractFactsWithLLM(rawInput)` first (`llmFacts.js`), fallback to heuristic `extractFacts(rawInput)` if no/minimal facts. ✅
- **2.2** Anchor suggestion — Picmonics “Create from text” has “Suggest anchor (AI)” calling `suggestAnchor` (anchorSuggestion.js). ✅
- **2.3** Generate practice questions — PracticeSession has “Generate 3 questions (AI)” / “Generate more (AI)”. ✅
- **2.5** LLM scene sentence for DALL·E — When `VITE_OPENAI_API_KEY` is set, Picmonics “Generate image” uses `buildScenePromptWithLLM` (llmSceneSentence.js turns blueprint into one sentence via OpenAI); fallback to non-LLM `buildScenePrompt` on failure. ✅

### Phase 3 — Retrieval & Spacing
- **3.1** “Due for review” on Home and in Picmonics (filter “Due for review (N)”); CourseScreen “Picmonics to review” card; spacedReview.js (recordStudied, getDueForReview, advanceInterval). ✅
- **3.2** Occlusion mode (“Cover one”) in Picmonics; MnemonicCanvas supports occlusionHiddenIndex, onOcclusionNext. ✅
- **3.3** Quiz from artifact — Canonical artifact has `study_modes.quiz_prompts` from `buildQuizPromptsFromHotspots`; Picmonics Quiz panel (prompt, reveal answer, prev/next); advanceInterval on Close. ✅
- **3.4** Retrieval summary on session exit — App.jsx: `handleExitStudySession` sets `exitSummary` with dueCount; green banner “Session complete. N concepts due for review” with Dismiss; auto-dismiss 5s. ✅

### Phase 4 — Cohesive Experience
- **4.1** Unified study session with mode switcher and Back to course. ✅
- **4.3** Onboarding / first-run — OnboardingWelcome modal (“What Scholar does”, AI Tutor, Picmonics, Practice, Flashcards); `getHasSeenWelcome()` / localStorage; shown on first load. ✅
- **4.4** AI visibility — StudyModeSwitcher “AI” badge next to AI Tutor; Picmonics “Create from text (AI)”, “Generate mnemonic (AI)”, “Generate image (AI)”, “Regenerate image (AI)”, “Suggest anchor (AI)”; SmartNotes “Summarize (AI)”, “Expand (AI)”; Practice “Generate 3 questions (AI)”. ✅

### Phase 6 — 2026 UI/UX Modernization (Partial)
- **6.1** Typography — Geist font via Google Fonts. ✅
- **6.2** Icons — Lucide React (nav, study aides, HomeScreen, AllCoursesScreen). ✅
- **6.3** Sidebar — Collapsible rail; persist in localStorage; CSS variable for main margin. ✅
- **6.4** Depth — Card shadows, backdrop-blur on mobile menu and sidebar, gradient bg. ✅
- **6.7** Mobile nav — Bottom tab bar with icon + label. ✅
- **6.8** Study bar — Floating bar with shadow. ✅
- **6.9** Cards — Hover lift, softer corners (rounded-3xl on hero). ✅
- **6.6** Motion — View Transitions API for route changes; staggered list reveals; btn-press micro-interactions; prefers-reduced-motion support. ✅

---

## Not Done / Optional Next (Code-Checked)

| Item | Status / note |
|------|----------------|
| **Phase 0.4** Responsive & a11y | Focus states and mobile stack present; full a11y audit is separate. |
| **Phase 4.2** Progress & streaks | Progress screen exists; “Due for review” count or streak on Progress/Today could be added. |
| **Phase 5.x** Voice, export | Variant picker done (“Try another scene” + Save this variant). Voice and export remain optional. |

---

## Phase 6: 2026 UI/UX Modernization

**Goal:** Modernize nav and application so Scholar feels designed in 2026—distinctive typography, professional icons, depth, motion, and contemporary patterns.

**Source:** Nav/UX audit (Feb 2026). Use this section when planning or implementing UI polish. Items can be tackled in the suggested order below or in parallel with other roadmap work.

### 6.1 Typography — Beyond Inter

| # | Deliverable | Details |
|---|-------------|---------|
| 6.1.1 | **Replace Inter** | Inter reads as generic. Use **Geist** or **Geist Mono** (Vercel), **Satoshi**, or **General Sans** for a distinctive but readable identity. |
| 6.1.2 | **Variable fonts** | Use a variable font with weight/width axes for lighter bundle and smoother scaling. |

**Files:** `index.html` (font link), `tailwind.config.js` (fontFamily), `src/index.css`.

---

### 6.2 Icons — Replace Emojis

| # | Deliverable | Details |
|---|-------------|---------|
| 6.2.1 | **Install icon library** | Add **Lucide React**, **Phosphor**, or **Heroicons** for consistent, professional icons. |
| 6.2.2 | **Update nav items** | Replace emoji icons (🏠 📚 📅 📊 👥 🔄) in Navigation.jsx with SVG icons. Map: Today→Home, All Courses→BookOpen, Semester→Calendar, Progress→BarChart, Community→Users, Recovery→RefreshCw. |
| 6.2.3 | **Update cards and buttons** | Replace emoji in HomeScreen quick actions, StudyAideLauncher, etc., with matching icons. |

**Files:** `src/components/Navigation.jsx`, `src/components/screens/HomeScreen.jsx`, `src/components/StudyAideLauncher.jsx`, `src/data/student.js` (studyAides icons).

---

### 6.3 Sidebar — Collapsible Rail

| # | Deliverable | Details |
|---|-------------|---------|
| 6.3.1 | **Collapsible state** | Desktop sidebar: collapsed = icons only (~64px wide), expanded = full labels (~256px). Toggle via button or double-click on rail. |
| 6.3.2 | **Persist preference** | Store collapsed/expanded in `localStorage`; restore on load. |
| 6.3.3 | **Refined styling** | Softer border (e.g. `border-gray-100`), subtle shadow; clear hover/active states. |

**Files:** `src/components/Navigation.jsx`, `src/App.jsx` (main content margin when collapsed).

---

### 6.4 Depth and Layering

| # | Deliverable | Details |
|---|-------------|---------|
| 6.4.1 | **Card shadows** | Add `shadow-sm` or `shadow-md` to main cards (HomeScreen, CourseScreen, Picmonics panels). |
| 6.4.2 | **Glassmorphism for overlays** | Mobile menu, modals: `backdrop-blur-md` + semi-transparent background instead of solid white. |
| 6.4.3 | **Background gradient** | Subtle `bg-gradient-to-b` from gray-50 to white for main content area. |

**Files:** `src/components/Navigation.jsx` (mobile overlay), `src/components/screens/*.jsx`, `src/App.jsx`, `src/index.css`.

---

### 6.5 Dark Mode

| # | Deliverable | Details |
|---|-------------|---------|
| 6.5.1 | **Theme context** | Create `ThemeContext` or use `prefers-color-scheme` + manual toggle. |
| 6.5.2 | **Semantic tokens** | Use CSS variables (`--bg-primary`, `--text-primary`, etc.) instead of hard-coded grays. |
| 6.5.3 | **Toggle in nav** | Add sun/moon or toggle in sidebar or profile area. Persist preference in `localStorage`. |

**Files:** New `src/contexts/ThemeContext.jsx`, `src/index.css` (variables), `tailwind.config.js` (dark mode), `src/components/Navigation.jsx`.

---

### 6.6 Motion and Transitions

| # | Deliverable | Details |
|---|-------------|---------|
| 6.6.1 | **View Transitions API** | Add router-level transitions for screen changes (React Router + View Transitions API or `framer-motion` AnimatePresence). |
| 6.6.2 | **Staggered list reveals** | Cards and nav items: `animation-delay` based on index for a subtle cascade. |
| 6.6.3 | **Micro-interactions** | Button press feedback (scale/opacity), toggle animations. |
| 6.6.4 | **Reduced motion** | Respect `prefers-reduced-motion: reduce`—disable or shorten animations. |

**Files:** `src/App.jsx` (Suspense/transitions), `src/index.css` (animations), `src/components/*.jsx`.

---

### 6.7 Mobile Navigation

| # | Deliverable | Details |
|---|-------------|---------|
| 6.7.1 | **Bottom nav with labels** | Show icon + text in bottom tab bar (e.g. “Today”, “Courses”, “Progress”, “Community”) instead of icon-only. |
| 6.7.2 | **Sheet-style menu** | Replace full-screen mobile overlay with slide-up sheet (e.g. 80% height) so context remains visible. |
| 6.7.3 | **Safe area** | Add `env(safe-area-inset-*)` padding for notched devices. |

**Files:** `src/components/Navigation.jsx` (MobileNav).

---

### 6.8 Study Mode Bar

| # | Deliverable | Details |
|---|-------------|---------|
| 6.8.1 | **Floating bar** | StudyModeSwitcher: sticky with soft `shadow-lg`; feels like a floating pill or toolbar. |
| 6.8.2 | **Segment/pill control** | Style study mode buttons as a segmented control (pill background, clear active state). |
| 6.8.3 | **Course accent** | Use course color for active study mode tint. (Partially done; ensure consistent application.) |

**Files:** `src/components/StudyModeSwitcher.jsx`, `src/App.jsx` (container).

---

### 6.9 Cards and Content

| # | Deliverable | Details |
|---|-------------|---------|
| 6.9.1 | **Softer corners** | Use `rounded-3xl` for hero cards (e.g. Today header, Active Challenge). |
| 6.9.2 | **Hover lift** | `hover:scale-[1.01]` and `hover:shadow-lg` on interactive cards. |
| 6.9.3 | **Bento layout** | Mix card sizes (e.g. 2/3 + 1/3 grid) for visual hierarchy on HomeScreen. |

**Files:** `src/components/screens/HomeScreen.jsx`, `src/components/screens/CourseScreen.jsx`.

---

### 6.10 Color and Branding

| # | Deliverable | Details |
|---|-------------|---------|
| 6.10.1 | **Richer palette** | Add semantic tokens for success, warning, error; surface variants for cards/overlays. |
| 6.10.2 | **Strategic gradients** | Use gradients on hero areas (e.g. Active Challenge) and primary CTAs, not everywhere. |

**Files:** `tailwind.config.js`, `src/index.css`.

---

### Quick Wins (Low Effort, High Impact)

| Change | Effort | Impact | Files |
|--------|--------|--------|-------|
| Swap emojis for Lucide icons | Low | High | Navigation.jsx, HomeScreen, student.js |
| Add `backdrop-blur` to mobile menu | Low | Medium | Navigation.jsx |
| Add `hover:shadow-md` on main cards | Low | Medium | HomeScreen, CourseScreen |
| New font (Geist) | Low | High | index.html, tailwind.config.js |

---

### Larger Investments

| Change | Effort | Impact |
|--------|--------|--------|
| Dark mode | Medium | High |
| View Transitions API / page transitions | Medium | High |
| Collapsible rail nav | Medium | High |
| Bottom sheet mobile menu | Medium | High |

---

### Suggested Implementation Order

1. **6.2 Icons** — Replace emojis with Lucide (or similar). High impact, low effort.
2. **6.1 Typography** — Swap Inter for Geist. High impact, low effort.
3. **6.4 Depth** — Add shadows and card hover states. Medium effort.
4. **6.3 Collapsible sidebar** — Improves desktop UX.
5. **6.5 Dark mode** — Full theme support.
6. **6.6 Motion** — Transitions and micro-interactions.
7. **6.7 Mobile nav** — Bottom labels and sheet-style menu.
8. **6.8–6.10** — Polish study bar, cards, and branding.

---

## Recommended Next Steps (In Order)

**Learning & Picmonic UX:**
1. **Hotspot callout styling (UX)** — When “Show all labels” is on, callouts sit at the hotspot and can look like text *on* the image (e.g. “Encode” on the sticky note in screenshots). **Improve:** Offset the tooltip so it’s clearly an overlay (e.g. position bubble to the side or below the circle with a small gap, or add a visible “tail”/connector). MnemonicCanvas.jsx: adjust `transform`/position so the popover is offset from the circle; keep pointer at hotspot. *Ref: ENCODING_OUTPUT_EVALUATION §5 UX (hotspot overlays).*
2. **Phase 0.4** — Responsive & a11y: quick pass — focus order, aria-labels on key actions, reduced-motion preference if desired.
3. **Phase 4.2** — Progress & streaks: surface “N concepts due for review” and/or streak on Progress or Today view.
4. **Phase 5.x** — Export/share (“Copy one-sentence story”, “Export mnemonic as image + legend”), or Picmonic variant picker (“Save this variant”).
5. **Content pass** — Add `recall_story` (and `image_story` where missing) for remaining high-use concepts (e.g. retrieval, schema, cell-signaling, memory) so every Picmonic has a causal one-sentence story and a clear scene for DALL·E.

**UI/UX Modernization (Phase 6):**  
See **Phase 6: 2026 UI/UX Modernization** above. **Implemented (Feb 2026):** 6.1 Typography (Geist), 6.2 Icons (Lucide), 6.3 Collapsible sidebar (rail + localStorage), 6.4 Depth (shadows, backdrop-blur, gradient bg), 6.6 Motion (View Transitions API, staggered reveals, btn-press, reduced-motion), 6.7 Mobile nav (bottom labels), 6.8 Study bar (floating), 6.9 Cards (hover lift, softer corners). **Remaining:** 6.5 Dark mode, 6.10 Color.

---

## Success Criteria (From Master Class Roadmap)

- **AI is visible and useful:** Tutor in context; “Explain this” → Tutor; “(AI)” labels where relevant. ✅
- **Flow is simple:** One study session, mode switcher, Back to course. ✅
- **Buttons and core paths work:** Generate image, Show all labels, Create from text, Play narrative, Tutor send, Quiz, Cover one, Back. ✅
- **Learning is guided:** Picmonics (What it is, legend in hotspot order, story); retrieval (occlusion, quiz, “due for review”); session-end summary. ✅
- **Picmonic images:** Global policy, minimal blueprint path (0.2), and LLM scene sentence when API key set (2.5); “(AI)” labels in place. ✅

This doc is updated to match the codebase; use it to decide what to build next.

---

## API key experience (item 2 — simplified)

**Problem:** When `VITE_OPENAI_API_KEY` is missing, each AI feature (Tutor, Create from text, Suggest anchor, Summarize, Generate questions) fails with its own message or silent failure. New users don’t know what’s wrong or how to fix it.

**Solution:** One shared check (e.g. a small hook or helper) and one clear message everywhere: “Add `VITE_OPENAI_API_KEY` to `.env` to use AI features.” Link to README or SETUP.md. Keep heuristic fallbacks where they exist (e.g. Create from text) so the app still works without a key.

**Recommendation:** Do it when you’re ready to polish onboarding/setup. Impact: fewer support questions and a cleaner first-run experience; not required for core learning flow.
