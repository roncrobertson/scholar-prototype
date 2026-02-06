/**
 * Centralized OpenAI API key check and user-facing message.
 * Use for consistent "missing API key" UX across AI Tutor, Picmonics, Smart Notes, Practice, etc.
 */

export function hasOpenAIKey() {
  try {
    const key = import.meta.env.VITE_OPENAI_API_KEY;
    return typeof key === 'string' && key.trim().length > 0;
  } catch {
    return false;
  }
}

/** Single message to show when AI features are unavailable due to missing key. */
export function getApiKeyMessage() {
  return 'Add VITE_OPENAI_API_KEY to .env to use AI features. See README for setup.';
}

/**
 * If key is missing, returns { error: 'api_key_missing', message }.
 * Otherwise returns null (caller can proceed).
 */
export function checkApiKey() {
  if (!hasOpenAIKey()) {
    return { error: 'api_key_missing', message: getApiKeyMessage() };
  }
  return null;
}
