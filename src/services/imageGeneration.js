/**
 * DALL-E image generation for picmonics.
 * Uses b64_json so the image displays without relying on OpenAI's URL (avoids CORS/expiry).
 * On rate limit: auto-retries once after 65 seconds.
 */

import { checkApiKey, getApiKeyMessage } from '../utils/aiCapability';

const OPENAI_API = 'https://api.openai.com/v1/images/generations';
const RATE_LIMIT_RETRY_WAIT_MS = 65_000;

function isRateLimitError(msg) {
  const m = (msg || '').toLowerCase();
  return m.includes('rate limit') || m.includes('images per minute');
}

function isBillingError(msg) {
  const m = (msg || '').toLowerCase();
  return m.includes('billing') || m.includes('hard limit');
}

/** OpenAI transient server error (e.g. "The server had an error processing your request"). */
function isServerError(msg) {
  const m = (msg || '').toLowerCase();
  return m.includes('server had an error') || m.includes('internal server error');
}

/** Extract request ID from error message or object for support. */
function getRequestId(data) {
  if (data?.error?.request_id) return data.error.request_id;
  const msg = data?.error?.message || '';
  const match = msg.match(/req_[a-f0-9]+/i);
  return match ? match[0] : null;
}

/**
 * Generate one image from a text prompt using DALL-E 3.
 * @param {string} prompt - Visual description
 * @param {function(string): void} [onStatus] - Optional callback for status (e.g. "Retrying in 65s...")
 * @returns {Promise<{ url?: string, error?: string }>} url is either data URL or hosted URL
 */
export async function generateMnemonicImage(prompt, onStatus) {
  const keyCheck = checkApiKey();
  if (keyCheck) {
    return { error: keyCheck.message };
  }
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Principle-based scope at send time (global for all picmonics)
  const scopeReinforcement =
    ' Draw only the main character and supporting elements explicitly listed in the prompt; nothing else. Do not add any other characters, environments, props, furniture, equipment, or decorative objects. No text, words, letters, or numbers anywhere in the image. Purely visual only.';
  const finalPrompt = (prompt + scopeReinforcement).slice(0, 4000);

  const body = {
    model: 'dall-e-3',
    prompt: finalPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    response_format: 'b64_json',
  };

  async function doRequest() {
    const res = await fetch(OPENAI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (data.error) {
      const msg = data.error.message || 'OpenAI error';
      const requestId = getRequestId(data);
      if (isRateLimitError(msg)) {
        return { rateLimited: true, error: msg };
      }
      if (isBillingError(msg)) {
        return { error: 'Billing limit reached. Add a payment method at platform.openai.com and wait a few minutes.' };
      }
      if (isServerError(msg)) {
        return { serverError: true, error: msg, requestId };
      }
      return { error: msg, requestId };
    }
    const b64 = data.data?.[0]?.b64_json;
    if (b64) return { url: `data:image/png;base64,${b64}` };
    return { error: 'No image in response' };
  }

  const SERVER_ERROR_RETRY_WAIT_MS = 4000;

  const drawingMessages = [
    'Drawing your mnemonic…',
    'Summoning your memory image…',
    'Bringing your mnemonic to life…',
    'Painting your memory into existence…',
    'Weaving your visual spell…',
    'Conjuring your memory aid…',
    'Creating something unforgettable…',
    'Turning your idea into magic…',
    'Crafting your mental anchor…',
    'Dreaming up your mnemonic…',
  ];
  const drawingMessage = drawingMessages[Math.floor(Math.random() * drawingMessages.length)];

  try {
    if (typeof onStatus === 'function') onStatus(drawingMessage);
    let result = await doRequest();

    // Retry once on rate limit
    if (result.rateLimited && typeof onStatus === 'function') {
      onStatus('Rate limited. Retrying in 65s…');
      await new Promise((r) => setTimeout(r, RATE_LIMIT_RETRY_WAIT_MS));
      result = await doRequest();
    }
    if (result.rateLimited) {
      return {
        error:
          'Images per minute limit may be 0 on your plan. Check platform.openai.com → Billing → Limits for DALL-E. After paying, tier upgrades can take time.',
      };
    }

    // Retry once on transient server error
    if (result.serverError && typeof onStatus === 'function') {
      onStatus('Server hiccup, retrying in a moment…');
      await new Promise((r) => setTimeout(r, SERVER_ERROR_RETRY_WAIT_MS));
      result = await doRequest();
    }
    if (result.serverError) {
      const id = result.requestId ? ` (Request ID: ${result.requestId})` : '';
      return {
        error: `OpenAI's servers had a temporary issue. Please try again in a moment. If it keeps happening, contact help.openai.com and include the request ID from this message.${id}`,
      };
    }

    return result;
  } catch (err) {
    return { error: err.message || 'Network error' };
  }
}
