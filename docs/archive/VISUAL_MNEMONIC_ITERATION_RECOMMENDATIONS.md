# Visual Mnemonic Feature — 10 Iteration Recommendations

Based on Picmonic/Sketchy/Pixorize principles, cognitive science (Dual Coding, Method of Loci, Von Restorff), and feedback on the current Scholar Picmonics flow.

**See also:** [Competing Image Review and Improvements](./COMPETING_IMAGE_REVIEW_AND_IMPROVEMENTS.md) — what we adopted from a Lovable-built Picmonic-style image (encoding-only elements, named setting, Mnemonic Legend).

---

## 1. **Single transcript read once (≤30 sec) — DONE**

- **What:** One narrative transcript that explains the concept academically, introduces each key term, references its visual mnemonic counterpart, and ties it into the story. User clicks Play and hears the full transcript (no step-through).
- **Why:** Step-through TTS felt “1990s” and monotone; a single, well-written script under 30 seconds is easier to follow and aligns with “narrative layer” (Step 9) without cycling.
- **Status:** Implemented: `NARRATIVE_TRANSCRIPTS` per concept, `artifact.transcript`, Play transcript / Stop, transcript panel for read-along.

---

## 2. **Give images “life” (vibrant, characterful, bizarre excellence)**

- **What:** Prompt and style should push toward “Pixar-meets-Sketchy”: vibrant colors, clear lighting, characterful or slightly absurd elements. Avoid “flat,” “limited palette,” and “muted” unless the concept explicitly needs it.
- **Why:** “No life” comes from over-simplifying style (flat, 3–4 colors). Reference doc: “Bizarre Excellence,” “humor and absurdity,” “vivid,” “high-contrast.”
- **Status:** Prompt updated to “Vivid, characterful… Pixar-meets-Sketchy,” “vibrant colors,” “personality—slightly absurd or humorous.” Continue to A/B with generated images and tighten per concept if needed.

---

## 3. **Enforce direct term → phonetic visual in every scene**

- **What:** Every key term must have an explicit phonetic/sound-alike visual in the scene (e.g. “Jail Membrane” = stretchy door; “Proteen in the kitchen” = chef). Validate that `image_story` and prompts name those visuals so the model doesn’t default to generic “lab” or “diagrams.”
- **Why:** Feedback: “miss the direct relationship between key term and a phonetic representation.” Picmonic/Sketchy: one tested concept → one scene where each fact maps to a drawable, phonetic/semantic symbol.
- **Next:** Review each `image_story` and prompt; add a small “encoding checklist” (e.g. concept + 3–5 terms, each with “visual = …”) before final prompt build.

---

## 4. **Global symbol library (recurring symbols)**

- **What:** Maintain a small “symbol dictionary”: same meaning → same visual across concepts (e.g. inhibition → chains/lock; renal failure → cracked kidney vase; high levels → overflow).
- **Why:** Sketchy/Picmonic use recurring icons so learners build familiarity; consistency beats novelty for recall.
- **Next:** Add `visualGrammar.js` (or a new module) “global symbols” map; when building scene/attribute visuals, prefer global symbol if the fact type matches, then fall back to phonetic/attribute-specific.

---

## 5. **One scene, one story (no split panels) — reinforced**

- **What:** Every prompt must explicitly require one continuous scene: no diptych, no left/right panels, no vertical divider. All elements share one “memory palace.”
- **Why:** Generated images were splitting into two panels (e.g. lab + diagrams); that breaks Method of Loci and confuses “what am I looking at?”
- **Status:** Already in prompt; keep in style prefix and in any future LLM-generated scene descriptions.

---

## 6. **Transcript as the “story” that the image illustrates**

- **What:** The read-aloud transcript should be the canonical story: it names the concept, the terms, and their visual counterparts. The image should be illustrable from that story alone.
- **Why:** Aligns narrative (Step 9) with the image: “what you’re looking at” and “what you’re hearing” are the same story.
- **Next:** When adding or editing concepts, write transcript first, then derive or align `image_story` and hotspots so the image “plays out” the transcript.

---

## 7. **Optional: higher-quality TTS (premium or external)**

- **What:** Browser `speechSynthesis` is free but often monotone. Consider: (a) optional premium TTS (e.g. ElevenLabs, Play.ht) behind a feature flag, or (b) pre-recorded narration for flagship concepts.
- **Why:** “Super monotone and like 1990s voice” points to engine limits; better TTS improves engagement without changing content.
- **Next:** Prototype one concept with a premium TTS API; compare engagement and decide whether to offer as upgrade or for select concepts.

---

## 8. **Character development (anthropomorphism)**

- **What:** Where possible, turn the main concept into a character with a clear identity (e.g. “Jail Membrane” as a bouncer character, not just a door). Encode properties in clothing, expression, or one clear action.
- **Why:** “Baker/baker” paradox: we remember characters with attributes better than abstract labels. Picmonic/Sketchy rely on characters (e.g. Pencil Villain).
- **Next:** In `image_story` and prompts, prefer “a character that…” over “an object that…”; add one concrete action or trait per main anchor.

---

## 9. **Validation gate: “Can this be drawn?”**

- **What:** Before sending a prompt to DALL·E, check that every element in the scene is concrete and drawable (no abstract phrases like “responsiveness of quantity” as a visual; use “elastic band stretching” instead).
- **Why:** Step 5 in the Mnemonic doc: “Can this be drawn? Is it concrete? Is it distinct?” Reject or rewrite vague visuals.
- **Next:** Add a small validation step (rule-based or LLM) that maps each `image_story` sentence to “one concrete noun/action”; flag or auto-rewrite abstractions.

---

## 10. **Retrieval-first modes (image-only, tap-to-reveal, “what’s missing?”)**

- **What:** Keep and strengthen retrieval modes: (1) image only, no labels; (2) tap hotspot → reveal term + definition; (3) optional “Which element is missing?” or “What does this represent?” quiz.
- **Why:** The system is “retrieval infrastructure,” not a one-time explainer. Picmonic/Sketchy emphasize active recall and spaced repetition.
- **Next:** Ensure “Click to reveal” and “Show all labels” are discoverable; add one quiz-style prompt per concept (e.g. “What does the stretchy door represent?”) that can be reused in practice or review.

---

## Summary

| # | Recommendation | Status / Next |
|---|----------------|---------------|
| 1 | Single transcript (≤30 s), read once | Done |
| 2 | Images with “life” (vibrant, characterful) | Prompt updated; monitor outputs |
| 3 | Direct term → phonetic visual in every scene | Audit prompts + encoding checklist |
| 4 | Global symbol library | Add module + use in scene build |
| 5 | One scene, no split panels | Enforced in prompt; keep |
| 6 | Transcript = story the image illustrates | Write transcript first when adding concepts |
| 7 | Higher-quality TTS (optional) | Prototype with premium API |
| 8 | Character development (anthropomorphism) | Prefer characters in image_story/prompts |
| 9 | Validation: “Can this be drawn?” | Add pre-prompt validation step |
| 10 | Retrieval-first modes | Keep; add quiz-style prompts |

These align with the Mnemonic Image Generator steps (0–12), the “Bizarre Excellence” and Method of Loci principles, and the goal of turning each concept into a single, recall-optimized visual + narrative artifact.
