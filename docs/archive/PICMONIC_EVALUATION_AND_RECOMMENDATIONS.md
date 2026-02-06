# Picmonic Functionality: Evaluation & Recommendations

**Purpose:** Evaluate the picmonic (visual mnemonic) feature in Scholar against cognitive-science principles (Visual Learning Info) and the current code/UX. Identify what works, what doesn’t, and concrete steps to improve student learning outcomes.

---

## 1. Executive Summary

The picmonic system is **architecturally aligned** with the Visual Mnemonic Engine spec: concept decomposition → phonetic anchor → attribute→symbol map → scene → artifact → retrieval modes. **Phonetic anchoring, hotspot/legend structure, and study modes (Hover, Click, Cover one, Quiz)** are in place and support learning. The main gaps are: **narrative is zone-based rather than causal**, **“One-sentence story” is often the definition instead of a visual story**, **no explicit “bizarre excellence” in prompts**, **legend lists the anchor but the anchor has no hotspot**, and **multi-layer encoding (color/size/action per fact)** is not modeled. Addressing these will bring the experience closer to Picmonic/Sketchy-style stickiness and recall.

---

## 2. What Works (Student Learning Perspective)

### 2.1 Phonetic Anchoring

- **Code:** `phoneticAnchors.js` maps concept_id → `{ phrase, object }` (e.g. neuroplasticity → "Neuro plastic", "a brain made of clay being reshaped").
- **UX:** “How to remember it” shows **Core mnemonic idea:** `Neuroplasticity → "Neuro plastic": a brain made of clay being reshaped`.
- **Verdict:** Strong. Sound-alike is visible and explained; aligns with “phonetic accuracy + visualizable object.”

### 2.2 Visual Metaphor & Scene Structure

- **Code:** `visualGrammar.js` maps attribute types to symbol classes (mechanism → action; effect → result on anchor/scene). Zones: center=anchor, foreground=mechanism, left=cause/class, right=effects. `promptEngineer.js` builds one scene, no text, 3–5 elements, Pixar-style.
- **UX:** Single coherent scene (e.g. clay brain + hand reshaping), relatable setting (psychology → “relatable indoor scene”).
- **Verdict:** Metaphor (clay = plastic/reorganizable) and spatial layout follow Method of Loci; scene is concrete and single-frame.

### 2.3 Hotspots & Legend

- **Code:** `canonicalArtifact.js` builds hotspots from `symbol_map` with `reveals: { term, mnemonic_phrase, fact_text }`. `MnemonicCanvas` supports hover/click to reveal; “Show all labels” toggles.
- **UX:** Circles on image; hover/click shows term and mnemonic logic; legend “What each part means” explains each element.
- **Verdict:** Hotspot–legend mapping supports decoding and active recall; matches “Hotspot & Legend Mapping” in the spec.

### 2.4 Retrieval Modes

- **Code:** Learning (labels on/hover), Retrieval (click to reveal), Occlusion (one hidden, “What’s missing?”, Next). Quiz prompts from `buildQuizPromptsFromHotspots`; Play narrative = TTS of transcript.
- **UX:** Study tabs (Hover, Click, Cover one, Quiz); Play narrative for auditory reinforcement.
- **Verdict:** Multiple retrieval paths and occlusion support “image-only recall” and “What does this represent?” as in the doc.

### 2.5 Ground Truth & Exam-Ready Takeaway

- **Code:** Facts from decomposition or pipeline; `rewriteFactsAsGroundTruth` normalizes; attributes drive symbol_map and legend. `exam_summary` and attributes shown in “Exam-ready takeaway.”
- **UX:** “What it is” (definition); “Exam-ready takeaway” (mechanism/effect bullets).
- **Verdict:** Facts are source-of-truth; visuals encode them; exam summary gives a clear recall target.

### 2.6 Validation & Policy

- **Code:** `mnemonicValidation.js` (chunking 1–7, anchor present, visualizability, scene cap). `visualMnemonicPolicy.js` (no text, no crowds). `encodingChecklist` for term→visual.
- **Verdict:** Quality gates and policy keep prompts within cognitive-load and “no text in image” rules.

---

## 3. What Doesn’t (or Could Be Much Better)

### 3.1 Narrative: Zone List vs Causal Story

- **Current:** Narrative is built from zones: “Picture [anchor]. To the left: … In the foreground: … To the right: …” (`mnemonicPipeline.js` `buildNarrativeFromArtifact`; `picmonics.js` `buildNarrative`). “One-sentence story (for recall)” in the UI is `artifact.exam_summary || first sentence of transcript` (Picmonics.jsx ~606).
- **Problem:** exam_summary is the **definition** (e.g. “Neuroplasticity is the brain’s ability to change structure and function in response to experience”), not a **causal story** that ties visual elements together (e.g. “The hand reshapes the clay brain, so new connections form and old ones are pruned”).
- **Doc:** “Narrative Integration (Minimal, Causal Stories)”: cause–effect; one memorable moment; “Character A blocks Character B, causing Structure C to collapse.”
- **Impact:** Recall is stronger when the story links *elements in the image*; a definition-only “story” doesn’t leverage the visual.

### 3.2 “One-Sentence Story” Is Definition-Only

- **Current:** “One-sentence story (for recall)” displays `artifact.exam_summary` or the first sentence of the transcript. For Neuroplasticity that’s the definition.
- **Problem:** The spec asks for a **narrative that connects the picture** (e.g. hand + clay brain → new connections / pruning). Using exam_summary here blurs “exam takeaway” with “story that replays the image.”
- **Impact:** Students don’t get a single causal sentence that replays the scene for recall.

### 3.3 Von Restorff / “Bizarre Excellence” Underused

- **Current:** Prompt says “exaggerated, memorable, slightly surreal” and “strong personality” but not “bizarre, absurd, humorous, emotionally charged.” No explicit instruction to maximize distinctiveness.
- **Doc:** “Unusual, bizarre, or emotionally charged items are remembered better”; “A ridiculous image is far more valuable than a beautiful one.”
- **Impact:** Images (e.g. clay brain) are clear and literal but may be less “sticky” than more absurd or vivid variants.

### 3.4 Legend–Hotspot Parity: Anchor Has No Hotspot

- **Current:** Hotspots are built only from `symbol_map` (`hotspotsCanonical` in canonicalArtifact.js). The **anchor** is not in symbol_map, so it gets **no** hotspot. “What each part means” lists “Anchor: [object] → [concept]” plus one line per hotspot.
- **Result:** For Neuroplasticity: legend has 3 items (anchor + mechanism + effect), image has 2 circles. The main character (clay brain) is not tappable.
- **Impact:** In retrieval/occlusion/quiz, the anchor can’t be directly cued from the image; parity between “what’s on the image” and “what’s in the legend” is broken.

### 3.5 Multi-Layer Encoding Not Modeled

- **Current:** Each attribute maps to one symbol (e.g. mechanism → “action (cutting, blocking, tying, building)”). There is no schema or prompt layer for **color, size, position, action** per fact (2–3 dimensions per key fact).
- **Doc:** “2–3 layers per key fact (visual object, color, position, action, quantity); avoid overloading one symbol.”
- **Impact:** Single-layer encoding; less redundancy and fewer retrieval paths under stress.

### 3.6 Hotspot Positions Are Zone-Based, Not Image-Based

- **Current:** `hotspotPositions.js` sets x from zone (left=18, right=82, foreground=50), y spread by index. Positions are **not** derived from the generated image.
- **Impact:** Circles may not align with where the corresponding object actually appears in the DALL·E output (e.g. “effect” might be drawn left while the hotspot is right). “Same order as hotspots on image” is order-parity, not spatial parity.

### 3.7 Neuroplasticity (and Others) Lack Dedicated image_story

- **Current:** Many concepts (e.g. neuroplasticity) have no `image_story` in `conceptDecompositions.js`. Pipeline derives image_story from micro_story (anchor + zone phrases). Effect symbol is generic: “result visible on anchor or scene.”
- **Impact:** Generated scene may be vaguer and less tailored than concepts with a hand-written image_story (e.g. cell-membrane, protein-synthesis).

### 3.8 Quiz From Artifact Not Fully Wired

- **Current:** `buildQuizPromptsFromHotspots` exists and quiz UI is in Picmonics.jsx; roadmap (Phase 3.3) calls for “Quiz from artifact: 2–4 questions per Picmonic from hotspot/legend.”
- **Impact:** Quiz is present but flow (e.g. advance interval on close, prominence in study bar) could be clearer and more central to retrieval practice.

---

## 4. Recommendations (Prioritized)

### 4.1 High impact, code + content

**R1. Add a causal “one-sentence story” and use it for recall**

- **Goal:** One sentence that replays the *visual* cause–effect, not the definition.
- **Implementation:**
  - In artifact schema, add optional `recall_story` (e.g. “The hand reshapes the clay brain, so new connections form and old ones are pruned.”).
  - In conceptDecompositions, add `recall_story` for key concepts (e.g. neuroplasticity). In mnemonicPipeline, either derive a short causal sentence from anchor + symbol_map (e.g. “The [anchor] is [action], so [effect].”) or call a small LLM step: “One sentence that links the visual elements in a cause–effect way.”
  - In Picmonics.jsx, under “One-sentence story (for recall)”, show `artifact.recall_story || artifact.exam_summary` and clearly label: “Story to replay the image” vs “Exam definition” so exam_summary stays in “Exam-ready takeaway.”
- **Success:** Students can recite a single causal sentence that matches the picture.

**R2. Give the anchor a hotspot (legend–hotspot parity)**

- **Goal:** Every legend entry (including the anchor) has a corresponding interactive hotspot.
- **Implementation:**
  - In canonicalArtifact, build one “anchor” hotspot (e.g. center, or first in list) from `artifact.anchor` with `reveals: { term: concept_title, mnemonic_phrase: anchor.phrase, fact_text: optional_definition_snippet }`.
  - Append symbol_map-based hotspots after it so display order = anchor + attributes. Update `getHotspotPositions` (or equivalent) so the anchor gets a fixed position (e.g. center 50,50 or first in traversal).
  - In Picmonics “What each part means,” keep current order (anchor first, then list); ensure list length = number of circles on image.
- **Success:** Tapping the main character reveals the concept/anchor; legend and circles match 1:1.

### 4.2 High impact, prompt + policy

**R3. Strengthen “bizarre excellence” in the image prompt**

- **Goal:** Nudge DALL·E toward more distinctive, slightly absurd or vivid scenes without changing the semantic content.
- **Implementation:**
  - In `promptEngineer.js`, add a short line to STYLE_PREFIX or a dedicated “distinctiveness” sentence, e.g. “Make the scene slightly absurd or whimsical so it is highly memorable (e.g. exaggerated expressions, unexpected juxtapositions), while keeping the same meaning.”
  - Optionally make it configurable (e.g. “vivid” vs “neutral”) for future A/B tests.
- **Success:** Images feel more “Picmonic-like” (sticky, distinctive) while still encoding the same facts.

**R4. Add image_story (and recall_story) for neuroplasticity and other high-use concepts**

- **Goal:** Better DALL·E output and a clear recall story where they’re missing.
- **Implementation:**
  - In conceptDecompositions, for neuroplasticity (and similar), add:
    - `image_story`: one sentence describing the scene (clay brain, hand reshaping, foreground action, result visible).
    - `recall_story`: one causal sentence linking those elements (see R1).
  - Reuse existing pipeline logic that prefers decomposition.image_story when present.
- **Success:** Fewer generic “result visible on anchor or scene” images; clearer narrative for those concepts.

### 4.3 Medium impact, schema + UX

**R5. Differentiate “Story for recall” vs “Exam definition” in the UI**

- **Goal:** Avoid conflating the visual story with the exam takeaway.
- **Implementation:**
  - In “How to remember it,” keep “One-sentence story (for recall)” for the causal/story sentence (from recall_story or fallback).
  - Keep “Exam-ready takeaway” for exam_summary and attribute bullets only. Optionally add a short label under the one-sentence story: “Replay this in your head with the image.”
- **Success:** Students know what to “replay” vs what to “know for the exam.”

**R6. Optional: multi-layer encoding in schema and prompt**

- **Goal:** Encode key facts in 2–3 ways (e.g. object + position + action) for redundancy.
- **Implementation:**
  - Extend symbol_map slot (or a parallel structure) with optional `encoding_layers: { color?, size?, action? }` and pass these into the scene description (e.g. “the mechanism is shown by a large red character cutting”).
  - Start with one or two concepts and one extra layer (e.g. “foreground = mechanism, shown by action”) and expand if it helps recall in testing.
- **Success:** Important facts are reinforced by position and action (and optionally color) in the prompt and legend.

### 4.4 Lower priority / follow-up

**R7. Quiz flow and spacing**

- Make “Quiz” more prominent in the study bar and ensure “Close” / “Finish quiz” advances the spaced-interval (already partially there). Consider “Quiz after viewing” as a suggested next step.

**R8. Hotspot positions from image (longer term)**

- When you have image-understanding or layout APIs, consider deriving hotspot coordinates from the generated image so circles align with actual regions (e.g. “hand,” “brain,” “result”). Until then, zone-based positions are acceptable if legend order and count match.

---

## 5. Summary Table

| Area                     | Works well                                      | Gap / risk                                           | Recommendation      |
|--------------------------|--------------------------------------------------|------------------------------------------------------|---------------------|
| Phonetic anchoring       | phrase + object in code and UI                   | —                                                    | —                   |
| Visual metaphor & zones  | Grammar + scene layout + no-text policy         | Generic “effect” wording for some concepts          | R4 (image_story)    |
| Hotspots & legend        | Hover/click, Show all labels                    | Anchor in legend but no hotspot                     | R2 (anchor hotspot) |
| Retrieval modes          | Learning / Retrieval / Occlusion / Quiz / Play   | Quiz flow could be more prominent                   | R7                  |
| Narrative                | Zone-based narrative + transcript               | Not causal; “one-sentence story” = definition       | R1, R4, R5          |
| Distinctiveness          | “Exaggerated, memorable” in prompt              | No explicit “bizarre excellence”                   | R3                  |
| Multi-layer encoding     | One symbol per attribute                        | No color/size/action layering                        | R6 (optional)       |
| Validation & policy      | Chunking, visualizability, no text              | —                                                    | —                   |

---

## 6. Conclusion

The picmonic feature is **structurally sound** and already supports phonetic anchoring, scene structure, hotspots, legend, and retrieval modes in line with the Visual Learning doc. The largest gains for **student recall** will come from:

1. **Causal narrative:** A dedicated “recall story” that links visual elements (and showing it instead of the definition as “One-sentence story”).
2. **Legend–hotspot parity:** One hotspot for the anchor so the main character is tappable and legend matches the image.
3. **Stronger distinctiveness:** Small prompt changes to encourage more memorable, slightly absurd or vivid images.
4. **Richer content for key concepts:** image_story and recall_story in conceptDecompositions where they’re missing (e.g. neuroplasticity).

Implementing R1–R5 will align the experience with the “Narrative Integration,” “Hotspot & Legend Mapping,” and “Bizarre Excellence” principles without changing the overall architecture.
