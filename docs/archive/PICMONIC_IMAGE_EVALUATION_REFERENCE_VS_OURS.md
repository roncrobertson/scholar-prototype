# Picmonic Image Evaluation: Reference (Competing App) vs Ours

Comparison of the competing app’s “Jail Membrane Cell” mnemonic scene with our Lovable-generated Cell Membrane picmonic, and concrete changes to improve our prompt and image generation.

---

## 1. Side-by-side summary

| Dimension | Reference (competing app) | Ours (scholar-prototype) |
|----------|--------------------------|---------------------------|
| **Scene focus** | One coherent steampunk “jail membrane” room: jail, ghosts, giant, gears, mosaic walls only | Same concept but image shows lab clutter: shelves, beakers, scientists, traffic cones, DNA helix, clock |
| **Prompt adherence** | Image matches the described scene | Our prompt says “Only these elements… Empty, minimal background—no lab, no shelves, no beakers, no second person, no signs” but the image ignores it |
| **Metaphor strength** | “Tiny thin ghosts” (pass through mesh), “massive hulking giant” (stuck in bars), “mechanical gears (proteins)” — vivid, characterful | “Small blob figures,” “larger figure” — generic; less memorable and less directive for the model |
| **Style** | Rich steampunk: brass gears, mosaic tiles, steam, expressive characters | Flat cartoon, blue/teal; style is fine but setting drifts to “lab” |
| **Legend alignment** | Every legend item maps to one clear visual (jail = membrane, ghosts = permeable, giant = blocked) | Legend maps to stretchy door + blobs, but extra lab elements add noise |
| **Setting** | Explicit: “Steampunk Machine Room” — one named theme | Implicit “lab or cell interior” (from domain) may be encouraging lab clutter |

---

## 2. Why our image drifted

1. **Negative instructions are diluted**  
   We say “no lab, no shelves, no beakers…” in the middle of a long prompt. DALL·E often obeys the first and last parts more; our “only these elements” and “empty background” are buried after STYLE_PREFIX and scene text.

2. **Biology domain suggests “lab”**  
   We don’t inject “lab” into the prompt for Cell Membrane when using `image_story`, but the concept words “cell,” “membrane,” “phospholipid” are strongly associated with labs. The model fills in lab equipment unless we explicitly forbid it and repeat “only these elements.”

3. **Weak character descriptions**  
   “Small blob figures” and “larger figure” don’t give the model a strong visual recipe. The reference’s “tiny thin ghosts” and “massive hulking giant” are specific and memorable, and they steer the composition (who passes, who is blocked).

4. **No explicit “DO NOT draw” list at the end**  
   We append NO_TEXT_SUFFIX and noTextReinforcement but don’t list forbidden objects (lab, beakers, scientists, cones, DNA, etc.) in one clear, final sentence.

---

## 3. What to change

### 3.1 Prompt and policy (global)

- **Explicit “only these elements” at scene start and end**  
  After the style block, start the scene with: “Only draw these elements: [list]. Do not draw anything else.” Repeat a short “Do not draw: lab, shelves, beakers, scientists, people, traffic cones, DNA, clocks, equipment, or any object not listed” at the very end of the prompt.

- **Stronger no-extra-props reinforcement**  
  In `imageGeneration.js`, add to the reinforcement line: “Draw ONLY the elements listed in the prompt. Do not add laboratories, shelves, beakers, flasks, people, scientists, traffic cones, DNA helixes, clocks, or props not listed.”

- **Optional “minimal scene” override for biology**  
  When `image_story` already says “empty, minimal background” or “no lab,” do not add any domain setting that suggests “lab or cell interior.” Either omit the domain setting for that prompt or replace it with “a single stylized [anchor] scene only.”

### 3.2 Cell Membrane content (concept-specific)

- **Upgrade metaphors in `image_story`** to match reference quality:
  - Instead of “small blob figures passing through” → “two or three tiny, translucent ghost-like figures slipping through the stretchy door.”
  - Instead of “one larger figure blocked” → “one massive, hulking giant stuck outside, unable to squeeze through.”
  - Optionally add “wall of the jail made of mosaic-like tiles” (phospholipid bilayer) and “mechanical gears on the wall” (proteins) if we want to align with the reference’s legend.

- **Tighten the “only these elements” line**  
  Keep: “Only these elements: jail cell, stretchy door, small figures going through, large figure stuck outside.” Optionally add: “No laboratory, no shelves, no beakers, no scientists, no traffic cones, no DNA, no clock.”

### 3.3 Policy (visualMnemonicPolicy.js)

- **Forbidden phrases**  
  Add patterns that strip or block lab-related phrasing when it appears in *generated* or legacy story text (e.g. “lab,” “laboratory,” “beakers,” “scientists,” “shelf with,” “traffic cone”) so they never make it into the prompt. Option: only apply these when the scene description already contains “empty, minimal background” or “only these elements” (minimal scene).

- **Optional: named setting without “lab”**  
  For biology concepts with a self-contained `image_story` (e.g. jail cell only), set scene setting to something like “a single stylized jail cell room” instead of “lab or cell interior” so the model isn’t nudged toward a lab.

---

## 4. Recommended implementation order

1. **Quick win:** Update Cell Membrane `image_story` with vivid metaphors (ghosts, giant) and a final “Do not draw: lab, beakers…” sentence in the story text.
2. **Global:** Add an explicit “DO NOT draw” list to the end of every prompt in `promptEngineer.js` (or in a shared suffix) and strengthen `imageGeneration.js` reinforcement.
3. **Policy:** Extend `visualMnemonicPolicy.js` with forbidden lab/scientist/equipment phrases and use them when applying policy to minimal-scene descriptions.
4. **Optional:** For concepts with full `image_story`, avoid injecting “lab or cell interior” from domain; use a setting derived from the story (e.g. “stylized jail cell room”) when present.

---

## 5. Success criteria

- Generated image contains only: jail cell, stretchy membrane door, small figures (ghost-like) passing through, large figure (giant-like) blocked outside, and optionally wall/gears if we add them.
- No lab furniture, shelves, beakers, scientists, traffic cones, DNA helix, or clock unless we explicitly add them in the future.
- Metaphors are vivid enough that the legend (Jail Membrane, phospholipid bilayer, selective permeability) maps 1:1 to clear, characterful visuals.

This doc should be used together with `VISUAL_MNEMONIC_GENERATION.md` and `COMPETING_IMAGE_REVIEW_AND_IMPROVEMENTS.md` for ongoing prompt and policy iteration.
