/**
 * LLM-backed fact extraction for "Create from text" pipeline.
 * Returns [{ fact_text, fact_type, priority }] or null on failure; fallback to heuristic in mnemonicPipeline.
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const EXTRACT_SYSTEM = `You are a learning-content analyst. From the given paragraph, extract 3–7 atomic, testable facts. 
Return a JSON array only, no markdown or explanation. Each item must have:
- "fact_text": one clear sentence.
- "fact_type": "definition"|"mechanism"|"location"|"effect"|"class"|"structure"|"inhibition"|"side_effect"
- "priority": "high"|"medium"
- "visual_mnemonic": one short phrase for an illustration (concrete object or action, e.g. "chef holding recipe card", "door with small figures passing through"). No abstract words; something drawable in one scene.`;

/**
 * Extract facts from raw text using OpenAI. Falls back to null if no API key or error.
 * @param {string} rawInput - Paragraph or learning objective
 * @returns {Promise<Array<{ fact_text: string, fact_type: string, priority: string }>|null>}
 */
export async function extractFactsWithLLM(rawInput) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || !rawInput?.trim()) return null;

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
          { role: 'system', content: EXTRACT_SYSTEM },
          { role: 'user', content: rawInput.trim().slice(0, 3000) },
        ],
        max_tokens: 800,
      }),
    });
    const data = await res.json();
    if (data.error) return null;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    // Strip possible markdown code block
    const jsonStr = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr.slice(0, 7).map((item, i) => ({
      fact_id: `fact-${i}`,
      fact_text: (item.fact_text || '').trim().replace(/\s+/g, ' '),
      fact_type: item.fact_type || 'definition',
      priority: item.priority || (i < 3 ? 'high' : 'medium'),
      visual_mnemonic: (item.visual_mnemonic || '').trim().replace(/\s+/g, ' ') || undefined,
    }));
  } catch {
    return null;
  }
}
