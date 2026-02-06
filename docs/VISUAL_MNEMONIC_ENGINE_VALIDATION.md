# VISUAL MNEMONIC ENGINE

## CONTENT-AGNOSTIC VALIDATION CHECKS

> **Objective:** Ensure every generated output follows a correct logic pipeline from concept → facts → visuals → story → image.

These checks must run **before an image is accepted**.

**Implementation:** Pre-image checks are run by `src/utils/visualMnemonicEngineValidation.js`. Post-image checks (label-off, image-teaches-before-text) are documented here for manual or future automated use. See also `archive/VISUAL_LEARNING_CHECKLIST_INTEGRATION.md` for mapping to prompts and existing validation.

---

## I. CONCEPT & FACT STRUCTURE VALIDATION

### ✅ CHECK 1 — Concept Normalization Exists

**Assert:**

* A single canonical concept name exists
* A single plain-language description exists
* Description ≤ 1 sentence

**Fail if:**

* Concept meaning requires multiple sentences
* Jargon appears without explanation

---

### ✅ CHECK 2 — Key Facts Are Explicit and Atomic

**Assert:**

* 3–6 key facts are present
* Each fact is independently meaningful
* Facts are phrased as actions, properties, or relationships

**Fail if:**

* Facts are definitions only
* Facts depend on other facts to make sense
* Facts exceed 6 or are fewer than 2

---

### ✅ CHECK 3 — Fact Priority Is Declared

**Assert:**

* One fact is marked as **primary**
* Remaining facts are secondary or tertiary

**Fail if:**

* All facts are treated equally
* No primary instructional focus exists

---

## II. FACT ↔ VISUAL BINDING VALIDATION

### ✅ CHECK 4 — Every Key Fact Has a Visual Anchor

**Assert:**

* Each fact is mapped to exactly one visual element or action

**Fail if:**

* A fact exists only in text
* A visual element exists without a mapped fact

---

### ✅ CHECK 5 — Visual Anchors Are Action-Based

**Assert:**

* Each visual anchor performs or demonstrates something
* Motion, change, or interaction is present

**Fail if:**

* Visuals are static symbols
* Meaning depends on labels to infer action

---

### ✅ CHECK 6 — No Orphan Visuals

**Assert:**

* Every major object in the image maps to a key fact

**Fail if:**

* Decorative or aesthetic objects exist without semantic purpose

---

## III. CHARACTERIZATION VALIDATION

### ✅ CHECK 7 — At Least One Characterized Agent Exists

**Assert:**

* One primary visual anchor shows intent, effort, or reaction
* Characterization supports meaning (not just style)

**Fail if:**

* All elements are passive
* Anthropomorphism is decorative only

---

### ✅ CHECK 8 — Visual Roles Are Named

**Assert:**

* Each major visual anchor has a stable name or role identifier

**Fail if:**

* Visuals cannot be referenced consistently across legend, narration, quiz

---

## IV. STORY & CAUSAL LOGIC VALIDATION

### ✅ CHECK 9 — Single Causal Narrative

**Assert:**

* The scene represents one moment in time
* One cause → one main outcome can be described

**Fail if:**

* Multiple independent processes compete visually
* The scene requires "and also…" to explain

---

### ✅ CHECK 10 — Dominant Visual Focus Matches Primary Fact

**Assert:**

* The primary fact is visually dominant via size, motion, or placement

**Fail if:**

* Secondary facts visually overpower the primary one

---

## V. LABEL-OFF & MODALITY VALIDATION

### ✅ CHECK 11 — Label-Off Reconstruction

**Assert:**

* With all labels hidden, a learner can explain the concept at a high level

**Fail if:**

* Meaning collapses without text

---

### ✅ CHECK 12 — Image Teaches Before Text

**Assert:**

* A learner can infer "what's happening" within ~5 seconds of seeing the image

**Fail if:**

* Text is required to introduce the idea

---

## VI. LEGEND & OUTPUT CONSISTENCY VALIDATION

### ✅ CHECK 13 — Legend Decodes, Does Not Teach

**Assert:**

* Legend entries map visual → fact only
* No new information introduced in legend

**Fail if:**

* Legend explains concepts not visible in the image

---

### ✅ CHECK 14 — Mode Alignment

**Assert:**

* Hover / click / quiz / narration all reference the same facts and anchors

**Fail if:**

* Different modes imply different meanings

---

## VII. GENERATION MODE DECISION CHECK (LOGIC ONLY)

### ✅ CHECK 15 — Encoding Mode Selected

**Assert:**

* Engine classifies concept as:

  * Characterization-only **OR**
  * Full mnemonic encoding

**Fail if:**

* No mode decision is made before visual generation

*(Mode choice does not affect the checks above — only how aggressively symbolism is used.)*

---

## VIII. HARD FAILURE CONDITIONS (NON-NEGOTIABLE)

Auto-reject output if **any** of the following are true:

* Facts appear only as text
* Image is primarily decorative
* Multiple causal stories exist
* Primary fact is not visually obvious
* Image cannot stand alone without explanation

---

## ENGINE NORTH STAR (Single Line)

> **If the image does not independently reconstruct the concept's key facts, it is invalid.**

---

## How This Helps

* A **mechanical definition of "good"**
* A way to debug failures without subjective taste
* A system that scales across biology, economics, psychology, etc.
* A shared language between design, engineering, and pedagogy

---

## Next Steps (Optional)

* **Machine-readable JSON validator** — see `src/utils/visualMnemonicEngineValidation.js`
* **Apply to concepts** — run `runEngineValidation(artifact)` before image accept; use `runEngineValidation(artifact, { getCanonical })` when canonical hotspots exist
* **Scoring weights** — soft vs hard failures; see `HARD_FAILURE_IDS` and `runEngineValidation` return shape for wiring weights
