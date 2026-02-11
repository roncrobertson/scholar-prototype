/**
 * Post-image validation: automated vision-model scoring for CHECK_10, 11, 12.
 * Aligns with PICMONIC_IMPROVEMENT_PROPOSAL.md §2.1C and VISUAL_MNEMONIC_ENGINE_VALIDATION.md.
 */

import { checkApiKey } from '../utils/aiCapability';
import { getPrimaryFactVisual } from './promptEngineer';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const VALIDATION_SYSTEM = `You are a visual mnemonic quality auditor. Evaluate the image against three checks. Return a valid JSON object only, no markdown or explanation.

{
  "check10_primary_dominant": { "pass": boolean, "reason": "brief explanation" },
  "check11_no_text": { "pass": boolean, "reason": "brief explanation" },
  "check12_image_teaches": { "pass": boolean, "reason": "brief explanation" }
}

Rules:
- CHECK_10 (primary dominant): The primary concept/fact should be visually dominant (size, placement, or motion). Pass if the main character or central concept is clearly the focus.
- CHECK_11 (no text): The image must have NO visible text, labels, numbers, digits, letters, or writing anywhere (signs, papers, screens, etc.). Fail if any text appears.
- CHECK_12 (image teaches): A learner should infer "what's happening" within ~5 seconds. Pass if the scene's meaning is readable without reading any text.`;

/**
 * Validate a generated picmonic image against CHECK_10, 11, 12.
 * Uses GPT-4 Vision when API key is present; returns null on failure or no key.
 *
 * @param {string} imageUrl - Data URL (base64) or HTTPS URL
 * @param {object} artifact - { concept, anchor, attributes, symbol_map }
 * @param {string} [promptSnippet] - Optional prompt snippet for context
 * @returns {Promise<{ check10: boolean, check11: boolean, check12: boolean, overallPass: boolean, details: object } | null>}
 */
export async function validateGeneratedImage(imageUrl, artifact, promptSnippet = '') {
  const keyCheck = checkApiKey();
  if (keyCheck) return null;

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey?.trim()) return null;

  const concept = artifact?.concept || 'Unknown';
  const primaryVisual = getPrimaryFactVisual(artifact);
  const primaryDesc = primaryVisual ? `Primary fact visual: "${primaryVisual}".` : '';

  const userContent = `Concept: "${concept}". ${primaryDesc}

${promptSnippet ? `Prompt snippet: "${promptSnippet.slice(0, 400)}"` : ''}

Evaluate the image and return the JSON.`;

  try {
    const res = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: VALIDATION_SYSTEM },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageUrl } },
              { type: 'text', text: userContent },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });
    const data = await res.json();
    if (data.error) return null;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return null;
    const jsonStr = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    const parsed = JSON.parse(jsonStr);
    const c10 = parsed.check10_primary_dominant?.pass === true;
    const c11 = parsed.check11_no_text?.pass === true;
    const c12 = parsed.check12_image_teaches?.pass === true;
    return {
      check10: c10,
      check11: c11,
      check12: c12,
      overallPass: c10 && c11 && c12,
      details: {
        check10: parsed.check10_primary_dominant?.reason || '',
        check11: parsed.check11_no_text?.reason || '',
        check12: parsed.check12_image_teaches?.reason || '',
      },
    };
  } catch {
    return null;
  }
}
