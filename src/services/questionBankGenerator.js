/**
 * Question Bank Generator Service
 * 
 * Generates practice questions from course topics using OpenAI.
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Generate practice questions for a topic
 * @param {object} course - Course object
 * @param {string} topicName - Topic name to generate questions for
 * @param {number} count - Number of questions to generate (default 5)
 * @returns {Promise<{ok: boolean, questions?: Array, error?: string}>}
 */
export async function generateQuestionBankForTopic(course, topicName, count = 5) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      ok: false,
      error: 'OpenAI API key not configured. Add VITE_OPENAI_API_KEY to your .env file.'
    };
  }

  const prompt = `Create ${count} high-quality multiple choice practice questions for a college ${course.name} course.

Topic: ${topicName}
Course: ${course.code} - ${course.name}

Requirements:
- Create ${count} multiple choice questions with 4 options each (A, B, C, D)
- Mix difficulty levels (some straightforward, some application-based)
- Include detailed rationale explaining the correct answer
- Add a misconception_hint that addresses why wrong answers might seem appealing
- Questions should test understanding and application, not just memorization
- Make questions exam-realistic for college level

Return ONLY a JSON array with this exact format (no markdown, no explanation):
[
  {
    "prompt": "Question text here?",
    "choices": [
      {"id": "a", "text": "First option"},
      {"id": "b", "text": "Second option"},
      {"id": "c", "text": "Third option"},
      {"id": "d", "text": "Fourth option"}
    ],
    "correct_answer_id": "a",
    "rationale": "Explanation of why this is correct and how to approach this question.",
    "misconception_hint": "Common mistake: Students often think... but actually..."
  }
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
        temperature: 0.8,
        max_tokens: 2000
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
    let questions;
    try {
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      questions = JSON.parse(cleaned);
    } catch (parseError) {
      return { ok: false, error: 'Failed to parse questions from AI response' };
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return { ok: false, error: 'Invalid question format from AI' };
    }

    // Transform to question bank format with IDs
    const conceptId = topicName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const formattedQuestions = questions.map((q, idx) => ({
      id: `${course.id}-${conceptId}-gen-${Date.now()}-${idx}`,
      concept_id: conceptId,
      prompt: q.prompt,
      type: 'multiple_choice',
      choices: q.choices,
      correct_answer_id: q.correct_answer_id,
      rationale: q.rationale,
      misconception_hint: q.misconception_hint,
      source: 'ai-generated',
      generatedAt: new Date().toISOString()
    }));

    return { ok: true, questions: formattedQuestions };

  } catch (error) {
    return {
      ok: false,
      error: error.message || 'Network error while generating questions'
    };
  }
}

/**
 * Save generated questions to localStorage
 */
export function saveGeneratedQuestions(courseId, questions) {
  try {
    const key = `scholar-questions-generated-${courseId}`;
    const existing = localStorage.getItem(key);
    const existingQuestions = existing ? JSON.parse(existing) : [];
    const updated = [...existingQuestions, ...questions];
    localStorage.setItem(key, JSON.stringify(updated));
    return true;
  } catch (error) {
    console.error('Failed to save generated questions:', error);
    return false;
  }
}

/**
 * Load generated questions from localStorage
 */
export function loadGeneratedQuestions(courseId) {
  try {
    const key = `scholar-questions-generated-${courseId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load generated questions:', error);
    return [];
  }
}

/**
 * Clear all generated questions for a course
 */
export function clearGeneratedQuestions(courseId) {
  try {
    const key = `scholar-questions-generated-${courseId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear generated questions:', error);
    return false;
  }
}
