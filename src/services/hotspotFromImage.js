/**
 * Vision-based hotspot placement: use OpenAI vision to locate artifact-derived objects in the image
 * and return (xPercent, yPercent) per object. Same VITE_OPENAI_API_KEY as DALL·E; no new keys.
 * Fallback: return null and caller uses zone-based positions.
 */

import { checkApiKey } from '../utils/aiCapability';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Build ordered list of object descriptions from artifact (anchor + symbol_map visuals).
 * Used as the "what to find" list for the vision model. Content-agnostic.
 * @param {object} artifact - { anchor, symbol_map }
 * @returns {string[]}
 */
export function getObjectListFromArtifact(artifact) {
  const list = [];
  if (artifact?.anchor?.object) list.push(artifact.anchor.object.trim());
  (artifact?.symbol_map || []).forEach((slot) => {
    const visual = (slot.symbol || '').split('|')[0]?.trim() || slot.value || '';
    if (visual) list.push(visual.trim());
  });
  return list.filter(Boolean);
}

const VISION_SYSTEM_PROMPT = `You are locating visual elements in an illustration. You will receive an image and a numbered list of object descriptions (in order: first = main character/anchor, then supporting elements). For each object that is clearly visible in the image, estimate the approximate center point as a percentage of image dimensions.
Rules:
- xPercent: 0 = left edge, 100 = right edge.
- yPercent: 0 = top edge, 100 = bottom edge.
- Only include objects you can clearly locate.
- Return a valid JSON array of objects, each with "index" (0-based, matching the list order), "xPercent" (number 0-100), and "yPercent" (number 0-100). Example: [{"index":0,"xPercent":50,"yPercent":45},{"index":1,"xPercent":22,"yPercent":40}]
- Output only the JSON array, no markdown or explanation.`;

/**
 * Call OpenAI vision to get approximate (xPercent, yPercent) for each object in the image.
 * Uses same VITE_OPENAI_API_KEY as image generation. Returns null on any failure.
 * @param {string} imageUrl - Data URL (e.g. data:image/png;base64,...) or HTTPS URL of the image
 * @param {object} artifact - Mnemonic artifact (anchor, symbol_map) for object list
 * @returns {Promise<Array<{ xPercent: number, yPercent: number }> | null>} Same order as anchor + symbol_map, or null
 */
export async function getHotspotPositionsFromImage(imageUrl, artifact) {
  const keyCheck = checkApiKey();
  if (keyCheck) return null;

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const objectList = getObjectListFromArtifact(artifact);
  if (objectList.length === 0) return null;

  const listText = objectList.map((obj, i) => `${i}. ${obj}`).join('\n');
  const userText = `Objects to locate (by index):\n${listText}\n\nReturn a JSON array with one entry per object you can find: {"index": <0-based index>, "xPercent": <0-100>, "yPercent": <0-100>}. Only include objects that are clearly visible.`;

  try {
    const content = [
      { type: 'image_url', image_url: { url: imageUrl } },
      { type: 'text', text: userText },
    ];

    const res = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: [
          { role: 'system', content: VISION_SYSTEM_PROMPT },
          { role: 'user', content },
        ],
      }),
    });

    const data = await res.json();
    if (data.error) return null;

    const raw = data.choices?.[0]?.message?.content?.trim();
    if (!raw) return null;

    // Strip markdown code fence if present
    const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(jsonStr);
    if (!Array.isArray(parsed)) return null;

    const expectedLength = objectList.length;
    const byIndex = {};
    for (const item of parsed) {
      const idx = item.index;
      const x = Number(item.xPercent);
      const y = Number(item.yPercent);
      if (typeof idx !== 'number' || idx < 0 || idx >= expectedLength) continue;
      if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
      if (x < 0 || x > 100 || y < 0 || y > 100) continue;
      byIndex[idx] = { xPercent: x, yPercent: y };
    }

    // Build result in order; if any index missing, return null and fall back to zone-based
    const result = [];
    for (let i = 0; i < expectedLength; i++) {
      if (!byIndex[i]) return null;
      result.push(byIndex[i]);
    }

    // Reject "all centered" vision results: if all positions are within a small radius, treat as low confidence
    const minSpreadPct = 12;
    const xs = result.map((p) => p.xPercent);
    const ys = result.map((p) => p.yPercent);
    const xRange = Math.max(...xs) - Math.min(...xs);
    const yRange = Math.max(...ys) - Math.min(...ys);
    if (result.length > 1 && (xRange < minSpreadPct && yRange < minSpreadPct)) return null;
    return result;
  } catch (_) {
    return null;
  }
}
