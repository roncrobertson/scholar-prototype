# What Else to Validate or Check

A practical checklist for the Scholar prototype (picmonics, study aides, and app health). Use after changes or before a release.

---

## 1. Picmonic / Mnemonic Content

| Check | How | Notes |
|-------|-----|--------|
| **Validation report** | Open a concept → Generate image (or not) → click **Validation report** → open JSON. | All `passed` and `hardFailure: false` for concepts you care about. If CHECK_1 fails, description is multi-sentence or >180 chars; we now prefer exam_summary. |
| **Multiple concepts** | Run Validation report on 3–5 concepts (e.g. cell-membrane, Working Memory, protein-synthesis, one without image_story). | Surfaces concepts that need shorter description or more facts/visuals. |
| **Create from text** | Paste a paragraph → suggest anchor (if API key) → submit. | Artifact builds; encoding_mode and visual_mnemonic appear when LLM returns them. |
| **Encoding mode** | Open **Working Memory** (Psych 101) → Generate image. | Uses characterization_only (simpler prompt). Compare with another concept (full_mnemonic). |
| **Recall story** | For concepts without `recall_story` in decomposition, open picmonic and check “Replay this in your head.” | Should show a causal sentence (derived), not only the zone list. |
| **Primary fact in UI** | Open any concept with `priority: 'primary'` on an attribute. | Exam-ready takeaway shows “Main idea:” for the primary fact first. |

---

## 2. Post-Image Quality

| Check | How | Notes |
|-------|-----|--------|
| **Accept/Reject** | Generate an image → use **Accept** or **Reject**. | “Thanks for the feedback” appears; no errors. |
| **Quality data (dev)** | With `npm run dev`, generate a few images, accept/reject → click **Export quality data** (dev-only button). | JSON downloads with records and outcomes. Or in console: `getPostImageRecords()`, `copy(exportPostImageRecordsJson())`. |
| **LocalStorage** | DevTools → Application → Local Storage → `scholar_picmonic_post_image_checks`. | Optional: confirm records persist after refresh. |

---

## 3. Cross-Concept Consistency

| Check | How | Notes |
|-------|-----|--------|
| **Concepts with long core_concept** | Validation report uses **exam_summary** (then summary) for CHECK_1. | Concepts whose exam_summary is also multi-sentence or >180 chars will still fail CHECK_1; fix by shortening exam_summary or adding a one-sentence field. |
| **Missing encoding_mode** | Artifacts from library get `encoding_mode` from decomposition or default `full_mnemonic`; pipeline gets it from options or default. | CHECK_15 fails if somehow missing; default is set in picmonics + pipeline. |
| **Missing recall_story** | Library concepts without `recall_story` get one from `deriveRecallStory`. | “Replay this in your head” should never be empty for a valid artifact. |

---

## 4. App & UX (from CODEBASE_AUDIT)

| Check | How | Notes |
|-------|-----|--------|
| **API key** | Remove or invalidate `VITE_OPENAI_API_KEY` → use Create from text, image gen, AI Tutor, Smart Notes. | Single, clear message (e.g. “Add VITE_OPENAI_API_KEY to .env to use AI features.”). |
| **Escape** | In Picmonics, SmartNotes, Practice, Flashcards → press Escape. | Exits study mode / closes overlay. |
| **Progress / due** | Progress (or Today) screen. | Shows “N due for review” (and optional streak) if implemented. |
| **Dev toggle** | Production build. | Desktop/Mobile toggle hidden when not in dev. |
| **Anchor suggestion** | Create from text → get suggestion → submit. | Suggested anchor is used (phrase → object) in the generated artifact. |

---

## 5. Accessibility (Optional)

| Check | How | Notes |
|-------|-----|--------|
| **Focus** | Tab through Study Aide Launcher → open a mode → Tab. | Focus moves into the panel; no focus lost. |
| **Screen reader** | Enable VoiceOver (or NVDA) → open Picmonics → Generate image → Quality check. | Buttons and status have sensible labels. |
| **Lighthouse** | Chrome DevTools → Lighthouse → Accessibility. | Fix any high-impact issues. |

---

## 6. Data & Code Health

| Check | How | Notes |
|-------|-----|--------|
| **Unit tests** | `npm test` (if configured). | spacedReview, mnemonicPipeline (extractFacts, rewriteFactsAsGroundTruth), visualMnemonicEngineValidation. |
| **Build** | `npm run build`. | No errors; chunk sizes reasonable. |
| **Lint** | `npm run lint` or IDE lint. | No new errors in changed files. |

---

## 7. Content Gaps (from PICMONIC_EVALUATION)

Worth validating over time; not one-off checks:

| Area | What to check |
|------|----------------|
| **Legend–hotspot parity** | Anchor has a hotspot (anchor is first hotspot in canonicalArtifact). If any concept’s legend has more items than hotspots, investigate. |
| **Hotspot position** | Hotspots are zone-based (left/right/center), not image-derived. Visually check a few images: circles roughly align with the main character and supporting elements. |
| **Concepts without image_story** | Concepts that rely on derived image_story (e.g. many psych concepts) may have vaguer images. Add hand-written `image_story` (and `recall_story`) for high-use concepts. |
| **Bizarre excellence** | Prompts already say “slightly absurd or whimsical.” Optionally A/B test a stronger “bizarre excellence” line if images feel too generic. |

---

## 8. Security & Env (Reminder)

| Check | Notes |
|-------|--------|
| **Production** | Do not ship with OpenAI API key in the frontend. Use a backend proxy; document in README or SETUP. |
| **.env** | `.env` in `.gitignore`; `.env.example` documents required vars without secrets. |

---

## Quick “Before Release” List

1. Run Validation report on 2–3 concepts; fix any CHECK_1/other hard failures.
2. Generate at least one image; confirm Accept/Reject and (in dev) Export quality data work.
3. Create from text once; confirm artifact and optional anchor suggestion.
4. `npm run build` succeeds.
5. (Optional) Quick a11y pass: focus order and one key flow with a screen reader.

Use this doc as a living checklist; add rows when you add new features or quality gates.
