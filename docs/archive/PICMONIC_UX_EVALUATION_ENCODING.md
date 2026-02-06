# Picmonic Output & UX Evaluation — Encoding (Post–R1–R5)

**Context:** Screenshots of the Encoding concept in Picmonics (learning/retrieval + Cover one mode). Evaluation against mnemonic principles and current UX.

---

## What’s Working Well

- **Anchor and legend:** "Encoding → 'Encode': a sticky note being written and stuck" is clear; Anchor + Mechanism + Effect are in the same order as hotspots (1:1 parity).
- **Study modes:** Hover, Click, Cover one, Quiz and "What's missing? Tap the gray circle to reveal" + Next support active recall.
- **Structure:** "What it is," "How to remember it," "What each part means," "One-sentence story," "Exam-ready takeaway," and "Replay this in your head with the image" are all present and scannable.
- **Controls:** Regenerate image (AI), Play narrative, Ask tutor are visible and understandable.
- **Cover one UX:** Gray circle for the hidden fact and a clear prompt; Next advances the hidden index.

---

## Issues Identified

### 1. One-sentence story too minimal (Encoding)

- **Current:** "Picture a sticky note being written and stuck" — restates only the anchor.
- **Problem:** Encoding has no `recall_story` in conceptDecompositions, so the UI falls back to the first sentence of the transcript (or anchor). A causal sentence that ties anchor → mechanism → effect would better support recall.
- **Fix:** Add `recall_story` (and optional `image_story`) for Encoding and other high-use concepts so "One-sentence story (for recall)" is causal, not anchor-only.

### 2. Duplicate text in hotspot tooltips

- **Current:** Tooltip shows **label** (e.g. "transform input into storable form") and **mnemonicLogic** on a second line. When the symbol map doesn’t supply a distinct mnemonic phrase, both come from the same fact text.
- **Result:** Same phrase appears twice (e.g. "transform input into storable form" twice), adding clutter.
- **Fix:** In MnemonicCanvas, show the second line (mnemonicLogic) only when it exists and is different from the label.

### 3. Instruction vs button state

- **Current:** Instruction above the image is always: "Use **Show all labels** below the image to reveal everything."
- **Problem:** When labels are already visible, the button says "Hide labels," so the instruction is wrong and can confuse.
- **Fix:** Use a neutral instruction, e.g. "Tap circles to recall each fact. Use the button below to show or hide all labels."

### 4. Unencoded elements in the image (DALL·E)

- **Observation:** AI-generated image can include extra text/numbers (e.g. "Yemmhbe!" and numbers on a sticky note) that don’t map to any fact.
- **Impact:** Possible distraction; doesn’t break the mnemonic but can dilute focus.
- **Fix (prompt):** Strengthen no-text rule: e.g. "No handwritten text, numbers, or writing on sticky notes, boards, papers, or any surface."

### 5. Mechanism metaphor still abstract

- **Current:** "transform input into storable form" is the mechanism; the visual (sticky note written and stuck) is good but the *phrase* is abstract.
- **Note:** Improving this is a content/symbol-library task (more concrete phrasing or metaphor); not a quick UI fix.

---

## Recommendations Implemented This Pass

1. **Add `recall_story` (and optional `image_story`) for Encoding** so the one-sentence story is causal.
2. **Tooltip:** Show mnemonicLogic only when it exists and differs from label to avoid duplicate text.
3. **Instruction copy:** Change to "Use the button below to show or hide all labels."
4. **Prompt:** Add one line in the image prompt to forbid handwritten text/numbers on any surface (to reduce DALL·E scribbles).

---

## Not Changed This Pass (Backlog)

- **Narrative agent:** Longer-term, a dedicated step could generate a 1–2 sentence causal story for every concept (including pipeline-generated) so even concepts without a hand-written `recall_story` get a strong narrative.
- **A/B testing:** Compare narrative length, label density, and visual complexity with real students for recall and comprehension.
- **Global symbol library:** Expand concrete metaphors for abstract mechanisms (e.g. "transform into storable form") so visuals and legend text align more tightly.
