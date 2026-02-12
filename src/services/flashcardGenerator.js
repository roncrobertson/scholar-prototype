/**
 * Flashcard Generator Service
 * 
 * Generates flashcards from Smart Notes content using OpenAI.
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generate flashcards from a Smart Note
 * @param {object} note - Smart note object with concept and smart_note content
 * @param {string} courseId - Course identifier
 * @returns {Promise<{ok: boolean, cards?: Array, error?: string}>}
 */
export async function generateFlashcardsFromNote(note, courseId) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      ok: false,
      error: 'OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.'
    };
  }

  const prompt = `Create 4-5 high-quality flashcard Q&A pairs from this concept for spaced repetition study.

Concept: ${note.concept}

What it is:
${note.smart_note.what_it_is}

Why it matters:
${note.smart_note.why_it_matters}

Common confusion:
${note.smart_note.common_confusion}

Requirements:
- Create 4-5 flashcard pairs
- Questions should test understanding, not just memorization
- Answers should be concise (1-3 sentences)
- Vary question types (definition, application, comparison, why/how)
- Focus on exam-relevant knowledge

Return ONLY a JSON array with this exact format (no markdown, no explanation):
[
  {"front": "Question text", "back": "Answer text"},
  {"front": "Question text", "back": "Answer text"}
]`;

  try {
    const response = await fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        ok: false,
        error: errorData.error?.message || `API error: ${response.status}`
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    if (!content) {
      return { ok: false, error: 'No content returned from API' };
    }

    // Parse JSON response
    let cards;
    try {
      // Remove markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      cards = JSON.parse(cleaned);
    } catch (parseError) {
      return { ok: false, error: 'Failed to parse flashcards from AI response' };
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      return { ok: false, error: 'Invalid flashcard format from AI' };
    }

    // Transform to flashcard format with IDs
    const flashcards = cards.map((card, idx) => ({
      id: `${courseId}-${note.concept.toLowerCase().replace(/\s+/g, '-')}-gen-${Date.now()}-${idx}`,
      front: card.front,
      back: card.back,
      courseId: courseId,
      topic: note.concept,
      source: 'ai-generated',
      generatedAt: new Date().toISOString()
    }));

    return { ok: true, cards: flashcards };

  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Network error while generating flashcards'
    };
  }
}

/**
 * Save generated flashcards to localStorage
 */
export function saveGeneratedFlashcards(courseId, cards) {
  try {
    const key = `scholar-flashcards-generated-${courseId}`;
    const existing = localStorage.getItem(key);
    const existingCards = existing ? JSON.parse(existing) : [];
    const updated = [...existingCards, ...cards];
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to save generated flashcards:', error);
    return false;
  }
}

/**
 * Load generated flashcards from localStorage
 */
export function loadGeneratedFlashcards(courseId) {
  try {
    const key = `scholar-flashcards-generated-${courseId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load generated flashcards:', error);
    return [];
  }
}

/**
 * Clear all generated flashcards for a course
 */
export function clearGeneratedFlashcards(courseId) {
  try {
    const key = `scholar-flashcards-generated-${courseId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear generated flashcards:', error);
    return false;
  }
}
