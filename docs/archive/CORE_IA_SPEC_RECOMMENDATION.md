# Core Information Architecture Spec — Codebase Review & Next Steps

**Spec goal:** Concept → Key Facts → Visual Anchors → Story → Image. No skipping. No collapsing.

---

## 1. Gap summary (spec vs codebase)

| Spec section | We have | We're missing |
|--------------|---------|----------------|
| **§1 Concept block** | `artifact.concept`, `core_concept`/`summary` in "What it is" | Single labeled "WHAT IT MEANS (PLAIN ENGLISH)"; no enforced one-sentence gate |
| **§2 Key Fact Table** | `artifact.attributes` (type + value) in decomposition | **Dedicated Key Facts block before any visuals.** Facts are only shown inside "Map to the image" mixed with visuals. Spec: "This table defines what must be encoded" — we never show facts alone first. |
| **§3 Visual Translation** | `anchor` (phrase + object); `symbol_map` (value + symbol + zone) | Per-fact **Visual mnemonic** is now supported via optional `visual_mnemonic` on each attribute (see below). Optional "why this works" per fact still not in schema. |
| **§4 Character naming** | `anchor.phrase` (name), `anchor.object` (description) | Explicit **role** field; spec says "name + role" and consistency across UI/narration/quiz — we're mostly consistent but role is implicit. |
| **§5 Storyline** | `image_story`, `recall_story`, transcript | Validation that story **introduces no new facts**; explicit "one moment, cause→effect only" check. |
| **§6 Image constraints** | ACTION_RULES in prompt; validation warnings | Explicit "can each key fact be pointed to?" gate before accept. |
| **§7 Legend** | Map to the image: key term + visual (blue) + definition | Spec: **decode only**, one line per fact (Visual → fact), no new info, no repetition of definitions. We show definition per card; could add a strict decode-only legend. |
| **§8 Study mode alignment** | Hover/click/quiz/narration exist | Verify: quiz asks about **fact** not art; narration retells **story** not definitions. |
| **Decision rule** | Always full mnemonic (anchor + symbols) | No **Characterization vs Full Mnemonic** classification; no lighter IA path for intuitive concepts. |

---

## 2. What to do next (prioritized)

### 2.1 Add the Key Facts block (spec §2) — **Do first**

- **What:** A "Key Facts" section that appears **before** "Core mnemonic" and "Map to the image."
- **Content:** 3–5 numbered facts only. Source: `artifact.attributes` (or `artifact` facts). No visuals, no mnemonics.
- **Where:** In Picmonics.jsx, insert between "What it is" and "How to remember it." Order becomes: Concept (What it is) → **Key Facts** → Core mnemonic + Map to the image → Story → Legend/Exam takeaway.
- **Why:** Spec says "Before any visuals are referenced" and "This table defines what must be encoded." Right now we skip straight to visuals; adding this block enforces the IA and removes ambiguity.

**Implementation:** One new collapsible (or always-visible) block: heading "Key Facts", list `artifact.attributes.slice(0, 5).map((a, i) => (i+1) + ". " + a.value)`. Optional: enforce 3–5 in validation and show warning if &lt;3 or &gt;5.

### 2.2 Enforce IA order in the UI — **Do with 2.1**

- **What:** Ensure the right panel always follows: 1) Concept (What it is), 2) Key Facts, 3) How to remember it (Core mnemonic + Map to the image), 4) One-sentence story, 5) Exam takeaway / Play narrative.
- **Where:** Picmonics.jsx layout. Currently we have What it is → How to remember it (core mnemonic + map + story + exam). Insert Key Facts between 1 and 2; no other reorder needed if Key Facts is added as above.

### 2.3 Optional: One-sentence plain-English gate (spec §1)

- **What:** If "What it is" content is longer than one sentence, show a warning or truncate for the concept block; optionally require decomposition to have a single `plain_english` or use first sentence of `core_concept`/`summary`.
- **Where:** conceptDecompositions (add optional one-liner) or Picmonics (show first sentence only in "What it is" with "Read more" for full). Low effort; improves spec alignment.

### 2.4 Legend: decode-only option (spec §7)

- **What:** Add a compact "Legend" that is strictly decode-only: one line per fact, format `Visual anchor → fact`. Or simplify "Map to the image" so the primary line is decode-only (e.g. "Elastic Band → responsiveness of demand") and move full definition to a tooltip or secondary line.
- **Where:** Picmonics.jsx "Map to the image" cards. We already have key term + visual + definition; spec wants "no repetition of definitions" in legend. Easiest: add a short legend list (visual → fact only) above or beside the current cards, or make the first line of each card "Visual → fact" and collapse definition.

### 2.5 Character role (spec §4)

- **What:** Give the main anchor an explicit **role** (e.g. "Shows how strongly demand reacts to price"). Use it in narration and quiz.
- **Where:** phoneticAnchors or conceptDecompositions: add optional `role`; canonicalArtifact/hotspots: pass role through; UI/narration: use role where we currently use object or phrase. Keeps naming consistent.

### 2.6 Validation: story introduces no new facts (spec §5)

- **What:** Before accepting image_story or recall_story, check that every noun/claim in the story maps to a key fact or the anchor. If the story introduces new facts, reject or flag.
- **Where:** mnemonicValidation.js. Heuristic: extract key phrases from story; check they're subset of (anchor.object + attributes[].value). Optional; can be Phase 2.

### 2.7 Decision rule: Characterization vs Full Mnemonic (spec end)

- **What:** Classify concept (e.g. from domain + concept_id or a tag) as "characterization" vs "full mnemonic." For characterization: lighter IA (fewer symbols, more familiar visuals). For full mnemonic: current behavior (strong anchors, exaggerated, label-off).
- **Where:** Pipeline or decomposition: add `ia_mode: 'characterization' | 'full_mnemonic'`; promptEngineer and validation branch on it. Phase 2; improves fit for intuitive vs exam-heavy concepts.

---

## 3. Concise recommendation

1. **Implement §2 (Key Facts block) and enforce IA order** in the Picmonics UI. This is the single biggest gap: we never show "key facts only" before visuals. Add a "Key Facts" section between "What it is" and "How to remember it," sourced from `artifact.attributes`, 3–5 items, no visuals.
2. **Tighten §1** by showing one-sentence plain-English first (e.g. first sentence of core_concept/summary) in "What it is."
3. **Optionally add a decode-only legend** (one line per fact: Visual → fact) and/or make the first line of each Map card decode-only to align with §7.
4. **Later:** Add anchor role (§4), "story introduces no new facts" validation (§5), "can each fact be pointed to?" gate (§6), and Characterization vs Full Mnemonic (§ decision rule).

This keeps the pipeline (concept → attributes → anchor → symbol_map → story → image) unchanged and adds the missing **surface-layer IA**: Key Facts before visuals, and strict order, so every concept decomposes cleanly from Concept → Key Facts → Visual Anchors → Story → Image.

---

## 4. Per-fact visual mnemonic characters (§3)

**Why facts were missing visuals:** Each attribute was only `{ type, value }`. The symbol for every fact came from the generic template for that type (e.g. mechanism → "action (cutting, blocking, tying, building)"). The canonical hotspot only shows a **mnemonic_phrase** when the slot’s symbol is *different* from that default, so all facts showed no visual character.

**Fix (implemented):** Attributes in `conceptDecompositions.js` can now include an optional **`visual_mnemonic`** string. When present, it is used as that fact’s symbol and appears in "Map to the image" as the blue visual character line.

**How to add per-fact visuals for any concept:** In `conceptDecompositions.js`, add `visual_mnemonic` to each attribute, e.g.:

```js
attributes: [
  { type: 'mechanism', value: 'light reactions + Calvin cycle', visual_mnemonic: 'Sun and factory assembly line (light + dark reactions)' },
  { type: 'location', value: 'chloroplasts (thylakoid, stroma)', visual_mnemonic: 'Green factory building' },
  { type: 'effect', value: 'glucose and O₂ produced', visual_mnemonic: 'Sugar packets and oxygen bubbles leaving the factory' },
],
```

**Where it flows:** `buildSymbolMap` (visualGrammar.js) uses `attr.visual_mnemonic` when present; otherwise it falls back to the type’s default symbol. Canonical hotspots then set `mnemonic_phrase` from the slot’s symbol, and the UI shows it in blue under the key term. "Create from text" pipeline attributes do not have `visual_mnemonic` unless you add an LLM step to generate them; pre-authored concepts get visuals by editing the decomposition.
