/**
 * Phase 2.5: LLM-derived scene sentence for DALL·E.
 * Turns blueprint (anchor + symbol_map + zones) into one short, clear sentence for image generation.
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a visual mnemonic designer. Given a mnemonic blueprint (one main anchor + a few supporting elements), output exactly one short sentence for an image generator. Rules:
- One main character or focal object (the anchor) in the center.
- At most 2–4 supporting elements; list them briefly.
- No text, numbers, or labels in the scene.
- Minimal background; simple, memorable scene.
- Output only the sentence, no preamble or explanation.`;

const SCENE_SETTING_BY_DOMAIN = {
  biology: 'a clear, well-lit scene like a lab or cell interior',
  pharmacology: 'a memorable scene like a medieval castle or battlefield',
  psychology: 'a relatable indoor scene',
  economics: 'a marketplace or room with clear zones',
};

/**
 * Build a short blueprint summary for the LLM (anchor + elements).
 * @param {object} artifact - { anchor, symbol_map, domain }
 * @returns {string}
 */
function blueprintSummary(artifact) {
  if (!artifact?.anchor) return '';
  const setting = SCENE_SETTING_BY_DOMAIN[artifact.domain] || 'a single memorable scene';
  const anchorVisual = artifact.anchor.object || 'subject';
  const elements = [anchorVisual];
  (artifact.symbol_map || []).slice(0, 3).forEach((slot) => {
    const visual = (slot.symbol || '').split('|')[0]?.trim() || slot.value;
    if (visual) elements.push(visual);
  });
  const parts = [`Setting: ${setting}.`, `Main anchor (center): ${anchorVisual}.`];
  if (elements.length > 1) parts.push(`Supporting elements: ${elements.slice(1).join('; ')}.`);
  return parts.join(' ');
}

/**
 * Derive one short scene sentence from blueprint using LLM.
 * @param {object} artifact - full mnemonic artifact (anchor, symbol_map, domain)
 * @returns {Promise<string|null>} One sentence for DALL·E, or null on failure/no key
 */
export async function deriveSceneSentenceFromBlueprint(artifact) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || !artifact?.anchor) return null;

  const summary = blueprintSummary(artifact);
  try {
    const res = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Turn this blueprint into one image-generator sentence:\n\n${summary}` },
        ],
        max_tokens: 150,
      }),
    });
    const data = await res.json();
    if (data.error) return null;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    return content.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  } catch {
    return null;
  }
}
