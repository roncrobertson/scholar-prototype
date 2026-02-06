# Visual Learning Generation Checklist — Integration Plan

**Goal (from checklist):** Generate visuals that teach by showing, not explaining.

This doc evaluates the current output against the checklist, maps rules to our codebase, and proposes Cursor-enforceable integration points.

---

## 1. Current output vs checklist (Cell Membrane example)

### A. Universal Rules

| Rule | Current state | Gap? |
|------|----------------|------|
| **1. One Scene, One Moment** | Jail cell + stretchy door + figures passing/blocked = one moment. | ✅ Passes. |
| **2. Objects Must Act** | Door stretches, figures pass/block, person manipulates. Clock/shelves may be decorative. | ⚠️ Prompt says "every element must have a mnemonic role" but we don't enforce *action*; DALL·E can still add static props. |
| **3. Facts Must Be Visible as Action** | Selective permeability = clearly acted (figures through/blocked). Phospholipid bilayer = "wall" (structural, not action). Fluid mosaic = weakly shown (stretchy door hints fluidity). | ❌ **Gap:** "phospholipid bilayer" and "fluid mosaic" are not inferable as *action*; they rely on text to decode. |
| **4. Cause → Effect Is Clear** | Membrane causes some to pass, some to be blocked. | ✅ Passes. |
| **5. Characterization Is Required** | Lab-coated person, blob figures; characterization present. | ✅ Passes. |
| **6. Familiar, Exaggerated** | Jail = familiar; stretchy door = exaggerated. | ✅ Passes. |
| **7. Label-Off Test (Hard Gate)** | With labels hidden: selective permeability = yes; phospholipid bilayer as "wall" = stretch; fluid mosaic = no. | ❌ **Gap:** Image does not fully pass "learner can explain at a high level without labels." |

### B. Fact Extraction

| Rule | Current state | Gap? |
|------|----------------|------|
| **8. Reduce to "What's Happening"** | We have `image_story` but don't require one plain-English sentence *before* generation. | ⚠️ Could add a pre-flight: "What is happening? [one sentence]." |
| **9. Limit Facts / Each fact can be acted out** | We have 3–6 facts (5 here). We don't check "each fact can be visually acted out." | ❌ **Gap:** Structural/definitional facts (e.g. "phospholipid bilayer — amphipathic...") are hard to *show*; we allow them in the blueprint. |

### C. Decision Rule (Characterization vs Full Mnemonic)

| Rule | Current state | Gap? |
|------|----------------|------|
| **Classify before generating** | We don't classify. We always use full mnemonic style (anchor + symbols). | ⚠️ Optional: for intuitive/process concepts we could relax to "familiar objects, clear flow" and reduce abstraction. |
| **Full mnemonic: secondary cues, strong separation** | We have anchor + 4 facts; separation is by zone. Secondary *visual* cues per fact are not enforced in the prompt. | ⚠️ Prompt could explicitly ask for "one clear action per fact" and "no fact only implied by structure." |

### D. Final Validation Questions

| Question | Current state |
|----------|----------------|
| "Oh, I see what's happening" in 5 seconds? | Partially — selective permeability yes; full concept no. |
| Image teaches before text? | Partially. |
| Works with narration muted? | For the main action yes; for all 4 facts no. |
| More than illustrated textbook? | Yes — stretchy door and blocking are active. |

**Summary:** The checklist **can** improve the feature. Main gaps: (1) facts as *action* not just placement, (2) label-off test, (3) "each fact can be acted out" before we add it to the scene, (4) explicit cause→effect and "objects act" in the prompt.

---

## 2. Mapping checklist to codebase

| Checklist item | Where we could enforce | Current |
|----------------|------------------------|--------|
| One scene, one moment | promptEngineer.js STYLE_PREFIX; mnemonicValidation | ✅ "One single continuous scene only; no split panels" |
| Objects must act | promptEngineer.js | ❌ We say "elements encode concept" but not "each element *acts*" |
| Facts visible as action | mnemonicValidation; prompt text | ❌ No check that each fact has an *action* in image_story |
| Cause → effect clear | promptEngineer.js | ❌ Not explicit |
| Characterization | promptEngineer.js | ✅ "One clear main character... strong personality" |
| Familiar, exaggerated | promptEngineer.js | ✅ "Exaggerated... slightly absurd or whimsical" |
| **Label-off test** | mnemonicValidation (new) | ❌ No gate; could add a post-generation or pre-accept checklist |
| Reduce to "what's happening" | mnemonicPipeline / pre-flight | ❌ No one-sentence requirement |
| 3–6 facts, each actable | mnemonicValidation; fact extraction | ⚠️ We cap 1–7; we don't filter "actable" |
| CHARACTERIZATION vs FULL | Concept classification | ❌ Not implemented; optional |

---

## 3. Proposed integration (Cursor-enforceable)

### 3.1 Prompt layer (promptEngineer.js)

Add to STYLE_PREFIX or a new block that is always appended when building the prompt:

- **Objects act:** "Every element in the scene must be doing something: moving, blocking, reacting, or causing a visible effect. No purely decorative or static props."
- **Cause → effect:** "Show a clear cause and effect: something causes something else to happen (e.g. one thing blocks, allows, or transforms another)."
- **Facts as action:** "Each key fact must be visible as an action or event in the scene, not only as a static object or label. If a fact cannot be shown as something happening, do not include it as a separate visual element."

These are content-agnostic and can be enforced on every prompt.

### 3.2 Validation layer (mnemonicValidation.js)

- **Actable-fact warning:** For each attribute, optionally check if the value is purely structural/definitional (e.g. long "X — Y, Z" with no verb). Flag: "Fact N may be hard to show as an action; consider shortening or rephrasing for the scene."
- **One-sentence gate (optional):** Require that `image_story` (or the derived micro_story) contains at least one clear subject-verb-object or cause-effect phrase. Warn if it's only a list of objects.
- **Label-off (manual or later):** Add a validation result flag `labelOffPass: boolean | null` that can be set by a human or a future LLM pass: "If labels were hidden, could a learner explain the concept?" Use it to block acceptance or flag for regeneration when false.

### 3.3 Pre-flight (optional, mnemonicPipeline or UI)

Before "Generate image":

- Require or suggest one plain-English sentence: **"What is happening in this scene?"** (from concept or from pipeline). If the system can't answer, don't generate.
- When building the scene blueprint (Path B), prefer facts that have a clear *action* (verb or cause-effect). Optionally cap at 3–4 facts that pass an "actable" heuristic (e.g. fact contains a verb or a short cause-effect clause).

### 3.4 Docs and Cursor rules

- Add this checklist (or a short pointer to it) to the repo so Cursor can enforce: e.g. in `.cursor/rules` or in `docs/` and reference from VISUAL_MNEMONIC_GENERATION.md.
- In VISUAL_MNEMONIC_GENERATION.md, add a "Checklist compliance" section: link to this doc and state that new or edited `image_story` and prompt logic must align with A–D.

---

## 4. Design philosophy (from checklist)

> We are not drawing concepts.  
> We are animating understanding.

This aligns with our existing principle: "Labels decode, never introduce." The checklist strengthens that by requiring **every fact to be visible as action** and **label-off test** as a hard gate. Implementing 3.1 (prompt) and 3.2 (validation) gives the biggest leverage with minimal change; 3.3 and 3.4 improve consistency and future edits.
