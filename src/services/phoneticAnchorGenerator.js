/**
 * Phonetic Anchor Generator: produce { phrase, object } when no pre-authored anchor exists.
 * Rule: phrase sounds like concept (phonetic mnemonic); object is concrete and depictable.
 * Aligns with PICMONIC_IMPROVEMENT_PROPOSAL.md §2.1B.
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const ANCHOR_SYSTEM = `You are a mnemonic designer. Given a concept name, produce a phonetic anchor for a visual memory aid.
- "phrase": A short phrase that sounds like or evokes the concept (for recall).
- "object": A concrete, depictable visual: one character or object in a scene. Must be drawable (no abstract terms).
Return JSON only: { "phrase": "...", "object": "..." }. No markdown, no explanation.`;

/**
 * Generate a phonetic anchor from concept title using LLM.
 * Returns { phrase, object } or null on failure / no API key.
 *
 * @param {string} conceptTitle - e.g. "gram-positive bacteria"
 * @param {string} [domain] - Optional domain hint (biology, pharmacology, etc.)
 * @returns {Promise<{ phrase: string, object: string } | null>}
 */
export async function generatePhoneticAnchor(conceptTitle, domain = 'general') {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || !conceptTitle?.trim()) return null;

  const userContent = domain !== 'general'
    ? `Concept: "${conceptTitle}". Domain: ${domain}. Output a phonetic anchor (phrase + object).`
    : `Concept: "${conceptTitle}". Output a phonetic anchor (phrase + object).`;

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
          { role: 'system', content: ANCHOR_SYSTEM },
          { role: 'user', content: userContent },
        ],
        max_tokens: 120,
      }),
    });
    const data = await res.json();
    if (data.error) return null;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    const jsonStr = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(jsonStr);
    const phrase = (parsed.phrase || '').trim();
    const object = (parsed.object || '').trim();
    if (!phrase || !object) return null;
    return { phrase, object };
  } catch {
    return null;
  }
}
