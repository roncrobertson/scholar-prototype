/**
 * LLM-backed anchor suggestion: sound-alike mnemonic phrase + one-sentence visual (Phase 2.2).
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are a mnemonic designer. For the given concept or topic name, suggest ONE sound-alike or pun-based mnemonic that helps remember it, plus one short sentence describing a single concrete visual (character or object) to draw. No abstract ideas—the visual must be something you can illustrate.
Return JSON only, no markdown: { "phrase": "the sound-alike phrase", "visual": "one sentence describing the visual to draw" }`;

/**
 * Suggest anchor (phrase + visual) for a concept name.
 * @param {string} conceptName - e.g. "Cell Membrane" or "Protein Synthesis"
 * @returns {Promise<{ phrase: string, visual: string }|null>}
 */
export async function suggestAnchor(conceptName) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || !conceptName?.trim()) return null;
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
          { role: 'user', content: `Concept: ${conceptName.trim()}` },
        ],
        max_tokens: 150,
      }),
    });
    const data = await res.json();
    if (data.error) return null;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    const jsonStr = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    const obj = JSON.parse(jsonStr);
    if (!obj?.phrase || !obj?.visual) return null;
    return { phrase: String(obj.phrase).trim(), visual: String(obj.visual).trim() };
  } catch {
    return null;
  }
}
