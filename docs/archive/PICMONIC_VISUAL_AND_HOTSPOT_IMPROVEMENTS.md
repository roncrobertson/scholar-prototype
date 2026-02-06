# Picmonic Visual and Hotspot Improvements

Review of the generated Cell Membrane visual and hotspot tagging, with concrete improvement ideas aligned to the engine validation checklist.

---

## What Went Wrong in the Current Cell Membrane Image

1. **Prompt was ignored** — The pipeline used the generic blueprint (anchor + symbol_map phrases) instead of the curated `image_story`, so the prompt said "lab or cell interior" and listed raw fact text. Result: DALL·E drew a detailed lab, second person, shelves, beakers, biohazard sign, orange tubing.
2. **One visual for two facts** — "Surrounds the cell" and "fluid mosaic" were both tagged to orange tubing, so one element carried two meanings (ambiguous; CHECK 6).
3. **Selective permeability not shown as action** — Narrative says "small figures slip through, larger one stays out," but the image showed one figure inside pushing the membrane. The *action* of passing vs blocked was missing.
4. **Fact 1 (phospholipid bilayer)** — The "wall" is the stretchy door; that’s fine, but the hotspot/label didn’t make the cause–effect (barrier built by lipids) obvious.
5. **Orphan visuals** — Lab worker, shelves, beakers, sign, extra tubing had no fact mapping (CHECK 6 fail).

---

## Changes Already Made in Code

- **Prefer `image_story` when present** — `buildScenePrompt()` now uses the decomposition’s `image_story` (when length > 60) instead of the minimal blueprint, so the intended narrative and "empty, minimal background" are sent to DALL·E.
- **Stronger minimal-background rule** — When using `image_story`, the prompt appends: "Empty, minimal background only—no laboratory equipment, no shelves, no beakers, no extra people, no signs."
- **Cell Membrane `image_story` tightened** — Explicit "Show the action: two or three small blob figures passing through the stretchy door; one larger figure blocked outside" and "Only these elements: jail cell, stretchy door, small figures going through, large figure stuck outside."

Regenerating the image after these changes should yield a simpler scene that matches the narrative and reduces orphans.

---

## Hotspot Improvements

| Issue | Idea |
|------|------|
| **One element, two facts** | Map each fact to a *distinct* visual. For Cell Membrane: "surrounds the cell" = the jail bars or the door frame encircling the space; "fluid mosaic" = the stretchy, flexible quality of the door (or small shapes floating in it), not the same tubing as "surrounds." In decomposition, give fact 3 and fact 4 different `visual_mnemonic` so the blueprint doesn’t reuse one prop. |
| **Hotspot on non-mnemonic area** | Hotspot positions come from zone (left/right/foreground) and index. If the image no longer has "left" content (e.g. no lab), the left-most hotspot can land on empty or wrong area. **Idea:** When using `image_story`, derive positions from narrative order (center = anchor, then left-to-right or top-to-bottom for the described elements) or allow optional `hotspot_positions` in decomposition for that concept. |
| **Label cut-off** | Long fact text in the hotspot tooltip can be truncated in the UI. **Idea:** Show short `visual_mnemonic` (e.g. "wall") as the primary tooltip and full fact on click or in a "More" expansion. |

---

## Visual Design Improvements (Checklist Alignment)

| Check | Current gap | Improvement |
|-------|-------------|-------------|
| **CHECK 5 (action-based)** | Phospholipid bilayer and fluid mosaic read as static. | Describe in `image_story` or symbol text an *action*: e.g. "wall that blocks" or "door that stretches and lets small ones through." |
| **CHECK 6 (no orphans)** | Lab, second person, shelves added by model. | Already addressed by using `image_story` + minimal-background constraint. For other concepts, keep "Only the elements listed; no extra objects" and, if needed, add concept-specific negative instructions (e.g. "no lab for this scene"). |
| **CHECK 9 (single causal narrative)** | Lab worker + jail + tubing = multiple stories. | Single narrative is now enforced by using one curated `image_story` (one cause → one effect: door controls who gets in). |
| **CHECK 11 / 12 (label-off, image teaches)** | Without labels, "amphipathic," "fluid mosaic" are hard to infer. | Accept that some facts are reinforced by labels; prioritize that the *main* story (Jail Membrane + selective permeability) is readable in 5 seconds without text. Use exam takeaway for the rest. |

---

## Optional: Per-Concept Prompt Overrides

For concepts where the default style or domain setting fights the scene:

- Add optional `prompt_override` or `negative_prompt` to decomposition (e.g. `no_lab: true`, `background: 'empty gradient'`).
- In `buildScenePrompt()`, when using `image_story`, append or replace with these overrides so DALL·E gets explicit "do not draw X" for that concept.

---

## Summary

1. **Done:** Use curated `image_story` when present; add minimal-background constraint; tighten Cell Membrane narrative and element list.
2. **Hotspots:** One distinct visual per fact; avoid reusing the same element for two facts; consider narrative-based or override positions when using `image_story`.
3. **UX:** Prefer short visual phrase in tooltip, full fact on demand.
4. **Later:** Optional per-concept negative prompts or position overrides for difficult scenes.

Regenerating the Cell Membrane image with the current code should already improve adherence to the checklist; the rest can be phased in as needed.
