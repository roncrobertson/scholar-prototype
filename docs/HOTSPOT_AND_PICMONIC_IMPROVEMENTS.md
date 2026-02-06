# Hotspot and Picmonic — Optional Work

**Main content:** Hotspot behavior, status (done/optional), code reference, and general problems are in **[PICMONIC_FEATURE_OVERVIEW.md](PICMONIC_FEATURE_OVERVIEW.md)** § **Hotspots and UX**.

This doc lists **optional / later** improvements only.

---

## Optional work

| Item | What | Where |
|------|------|--------|
| **Layout preset** | In `hotspotPositions.js`, support a preset (e.g. `"memory-palace"`) that sets different default (x, y) per zone/index to reduce overlap. | `src/utils/hotspotPositions.js` |
| **Callout styling** | When “Show all labels” is on, offset the tooltip from the circle (e.g. bubble to the side or below with a small gap or tail) so it reads as an overlay, not text on the image. | `src/components/MnemonicCanvas.jsx` |
| **Stricter overlap / UI** | Ensure no overlay sits on hotspot circles; keep legend below or beside the image. | `Picmonics.jsx`, `MnemonicCanvas.jsx` |

---

## Where to look

- **Pipeline, status, key files:** [PICMONIC_FEATURE_OVERVIEW.md](PICMONIC_FEATURE_OVERVIEW.md)
- **Validation checklist:** [VISUAL_MNEMONIC_ENGINE_VALIDATION.md](VISUAL_MNEMONIC_ENGINE_VALIDATION.md)
- **What else to do (summary):** [README.md](README.md) §6
