# Competing App Image Review — What We Like, Dislike, and How We Improve

Review of a Lovable-built Picmonic-style image (Steampunk machine room: Diffusion + Active Transport) and concrete changes to our Picmonic generator.

---

## What We Like

1. **Vivid, characterful, cohesive style** — "Pixar-meets-Sketchy," vibrant colors, slightly absurd. Matches our goal: images with "life" and personality. Steampunk setting is consistent and memorable.

2. **Single continuous scene** — No split panels; one coherent scene. We already enforce this in `promptEngineer.js`; keep it.

3. **Clear mnemonic → visual links** — "Greased Chutes and Ladders" = Diffusion (things sliding down); "Mechanical Salt and Kale Shaker (Na+)" = Active Transport (ATP as coal, Na+/K+). Explanations in the UI tie directly to the image. This is the bar for our encoding checklist and hotspots.

4. **Mnemonic Legend + hover** — "Hover over symbols to see the memory logic" makes the image explorable. We have Learning (hover) and Retrieval (click to reveal); we should surface the same idea and add a **named setting** (e.g. "Setting: Steampunk Machine Room") so learners know the scene.

5. **Concise, explanatory copy** — "Passive, effortless sliding down from a high pile to a low pile" and "A machine chugging coal (ATP) to forcefully pump Salt (Na+) out" are simple but explanatory. Our Core Concept + Key Terms + Exam Summary already provide that; we ensure **legend text** (per hotspot) matches that tone.

6. **Explicit setting name** — Naming the setting grounds the image and answers "what am I looking at?" We should add a **named scene setting** to the artifact/prompt and show it in the UI.

---

## What We Dislike / Improvement Areas

1. **Visual clutter and ambiguous elements** — Piano keys, diver's helmet, knight with ghosts don't map to the two concepts in the legend. If an element isn't on the encoding checklist, it adds noise and makes "what am I looking at?" harder.

   **Our change:** Prompt explicitly: *Include only elements that encode the concept and key terms; avoid decorative or unrelated objects.* Validation already caps scene elements (anchor + up to 4); we reinforce that every element should be **on** the encoding checklist.

2. **Non-mnemonic elements** — The knight and ghosts are characterful but unexplained. Every major visual should be linkable to a term in the Mnemonic Legend.

   **Our change:** In `promptEngineer.js`, add a line: *Every visible element should represent one concept or key term from the encoding list; no extra characters or props without a mnemonic role.*

3. **Legend-only academic depth** — The competing UI only shows the mnemonic legend. We already show Core Concept, Key Terms, High-Yield, Exam Summary. We keep that and add a **Mnemonic Legend** block (setting + concept/term → visual) so the image and legend mirror theirs, while we still offer deeper academic context above.

4. **Scaling with many concepts** — One image encoding too many terms can become overwhelming. We already validate 1–7 attributes and cap scene elements. We continue to **chunk**: one image = one concept + a small set of key terms (encoding checklist = ceiling for what appears in the scene).

5. **Consistent visual lexicon** — For recurring abstract ideas (ATP, ions, energy), a stable symbol (e.g. coal = ATP) helps. We can extend a **global symbol** map later; for now we ensure `image_story` and phonetic anchors use concrete, consistent metaphors where possible.

---

## Concrete Improvements Implemented

| Area | Change |
|------|--------|
| **Prompt** | Add "Include only elements that encode the concept and key terms; avoid decorative or unrelated objects." and "Every visible element should represent one concept or key term; no extra characters or props without a mnemonic role." |
| **Setting** | Add named scene setting to prompt (from domain or artifact); surface "Setting: …" in UI next to Mnemonic Legend. |
| **UI** | Add "Mnemonic Legend" section with setting bar + list of concept/term → visual (encoding checklist styled as legend, with "Hover/click on image to see memory logic"). |
| **Docs** | This file + reference in `VISUAL_MNEMONIC_ITERATION_RECOMMENDATIONS.md`. |

---

## Summary

The competing image is strong on style, single scene, and direct mnemonic links for the terms it shows. We adopt: (1) explicit named setting in prompt and UI, (2) prompt rules to avoid non-encoding clutter, (3) a Mnemonic Legend block that mirrors theirs (setting + term → visual) while keeping our fuller academic block above. That keeps our academic depth and improves image focus and "what am I looking at?" clarity.
