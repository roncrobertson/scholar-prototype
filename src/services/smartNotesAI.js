/**
 * Smart Notes AI: summarize in 3 bullets or expand into a short paragraph.
 * Returns { ok, text?, errorType?, message? } for richer error handling and retry.
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/** @typedef {'api_key_missing'|'network'|'openai'} SmartNotesErrorType */

/**
 * @param {string} [conceptName]
 * @param {string} [noteText]
 * @returns {Promise<{ ok: true, text: string }|{ ok: false, errorType: SmartNotesErrorType, message: string }>}
 */
async function summarizeInBulletsResult(conceptName, noteText) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return { ok: false, errorType: 'api_key_missing', message: 'Add VITE_OPENAI_API_KEY to .env to use AI features. See README for setup.' };
  }
  if (!noteText?.trim()) {
    return { ok: false, errorType: 'openai', message: 'No note text to summarize.' };
  }
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
          {
            role: 'system',
            content: 'You are a study assistant. Summarize the given note into exactly 3 short bullet points. Output only the bullets, no intro. Use • for bullets.',
          },
          {
            role: 'user',
            content: `Concept: ${conceptName || 'Unknown'}\n\n${noteText.slice(0, 1500)}`,
          },
        ],
        max_tokens: 300,
      }),
    });
    const data = await res.json();
    if (data.error) {
      const msg = data.error?.message || 'OpenAI error. Try again in a moment.';
      return { ok: false, errorType: 'openai', message: msg };
    }
    const content = data.choices?.[0]?.message?.content?.trim();
    if (content) return { ok: true, text: content };
    return { ok: false, errorType: 'openai', message: 'No response. Try again.' };
  } catch (err) {
    const isNetwork = err?.name === 'TypeError' && (err?.message?.includes('fetch') || err?.message?.includes('network'));
    return {
      ok: false,
      errorType: isNetwork ? 'network' : 'openai',
      message: isNetwork ? 'Network error. Check your connection.' : 'Request failed. Try again in a moment.',
    };
  }
}

/**
 * @param {string} [conceptName]
 * @param {string} [noteText]
 * @returns {Promise<{ ok: true, text: string }|{ ok: false, errorType: SmartNotesErrorType, message: string }>}
 */
async function expandToParagraphResult(conceptName, noteText) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    return { ok: false, errorType: 'api_key_missing', message: 'Add VITE_OPENAI_API_KEY to .env to use AI features. See README for setup.' };
  }
  if (!noteText?.trim()) {
    return { ok: false, errorType: 'openai', message: 'No note text to expand.' };
  }
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
          {
            role: 'system',
            content: 'You are a study assistant. Expand the given note into one short paragraph (2–4 sentences) that a student could use for an exam. Do not add an intro like "Here is."',
          },
          {
            role: 'user',
            content: `Concept: ${conceptName || 'Unknown'}\n\n${noteText.slice(0, 1500)}`,
          },
        ],
        max_tokens: 250,
      }),
    });
    const data = await res.json();
    if (data.error) {
      const msg = data.error?.message || 'OpenAI error. Try again in a moment.';
      return { ok: false, errorType: 'openai', message: msg };
    }
    const content = data.choices?.[0]?.message?.content?.trim();
    if (content) return { ok: true, text: content };
    return { ok: false, errorType: 'openai', message: 'No response. Try again.' };
  } catch (err) {
    const isNetwork = err?.name === 'TypeError' && (err?.message?.includes('fetch') || err?.message?.includes('network'));
    return {
      ok: false,
      errorType: isNetwork ? 'network' : 'openai',
      message: isNetwork ? 'Network error. Check your connection.' : 'Request failed. Try again in a moment.',
    };
  }
}

/**
 * Summarize concept text into 3 bullet points.
 * @param {string} conceptName
 * @param {string} noteText - Full note (what it is, why it matters, etc.)
 * @returns {Promise<string|null>} Markdown bullets or null on error (kept for backward compatibility)
 */
export async function summarizeInBullets(conceptName, noteText) {
  const result = await summarizeInBulletsResult(conceptName, noteText);
  return result.ok ? result.text : null;
}

/**
 * Expand concept text into a short paragraph (2–4 sentences).
 * @param {string} conceptName
 * @param {string} noteText
 * @returns {Promise<string|null>}
 */
export async function expandToParagraph(conceptName, noteText) {
  const result = await expandToParagraphResult(conceptName, noteText);
  return result.ok ? result.text : null;
}

/**
 * Summarize with full result for UI (error type + retry).
 * @param {string} conceptName
 * @param {string} noteText
 * @returns {Promise<{ ok: true, text: string }|{ ok: false, errorType: SmartNotesErrorType, message: string }>}
 */
export async function summarizeInBulletsWithResult(conceptName, noteText) {
  return summarizeInBulletsResult(conceptName, noteText);
}

/**
 * Expand with full result for UI (error type + retry).
 * @param {string} conceptName
 * @param {string} noteText
 * @returns {Promise<{ ok: true, text: string }|{ ok: false, errorType: SmartNotesErrorType, message: string }>}
 */
export async function expandToParagraphWithResult(conceptName, noteText) {
  return expandToParagraphResult(conceptName, noteText);
}
