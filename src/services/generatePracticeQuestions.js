/**
 * Generate 3 multiple-choice practice questions via OpenAI for a course/concept.
 * Returns same shape as questionBank: { id, course_id, concept_id, prompt, choices, correct_answer_id, rationale, ... }
 */

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are an academic question writer. Generate exactly 3 questions for the given course and topic: 2 multiple-choice and 1 short-answer.
Return a JSON array only, no markdown. Each item must have:
- "type": "multiple_choice" or "short_answer"
- "prompt": string (the question)
For multiple_choice only:
- "choices": array of { "id": "a"|"b"|"c"|"d", "text": string }
- "correct_answer_id": "a"|"b"|"c"|"d"
For short_answer only:
- "correct_keywords": array of 2-4 strings (acceptable keywords/phrases; any match = correct, case-insensitive)
- "rationale": string (brief explanation)
- "misconception_hint": string (short hint when wrong)
For multiple_choice also include: "rationale", "misconception_hint".
Use ids a, b, c, d for choices. Exactly 4 choices per MC question.`;

/**
 * @param {object} course - { id, code, name }
 * @param {string} [conceptName] - e.g. "Cell membrane" or topic name
 * @returns {Promise<Array<object>>} Questions in questionBank shape, or [] on error
 */
export async function generatePracticeQuestions(course, conceptName) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || !course?.id) return [];

  const topic = conceptName || (course.masteryTopics?.[0]?.name) || 'key concepts';
  const userPrompt = `Course: ${course.code} — ${course.name}. Topic: ${topic}. Generate 2 multiple-choice and 1 short-answer question.`;

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
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1200,
      }),
    });
    const data = await res.json();
    if (data.error) return [];
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return [];
    const jsonStr = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '').trim();
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr) || arr.length === 0) return [];
    const conceptId = (conceptName || topic).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return arr.slice(0, 3).map((q, i) => {
      const type = q.type === 'short_answer' ? 'short_answer' : 'multiple_choice';
      const prompt = (q.prompt || '').trim();
      const rationale = (q.rationale || '').trim();
      const misconception_hint = (q.misconception_hint || '').trim();
      if (type === 'short_answer') {
        const correct_keywords = Array.isArray(q.correct_keywords)
          ? q.correct_keywords.slice(0, 6).map((k) => String(k).trim()).filter(Boolean)
          : [];
        return {
          id: `ai-${course.id}-${conceptId}-${i}-${Date.now()}`,
          course_id: course.id,
          concept_id: conceptId,
          type: 'short_answer',
          prompt,
          choices: [],
          correct_answer_id: 'a',
          correct_keywords: correct_keywords.length ? correct_keywords : ['key concept'],
          rationale,
          misconception_hint,
          difficulty: 2,
          source_anchors: [],
        };
      }
      return {
        id: `ai-${course.id}-${conceptId}-${i}-${Date.now()}`,
        course_id: course.id,
        concept_id: conceptId,
        type: 'multiple_choice',
        prompt,
        choices: Array.isArray(q.choices) ? q.choices.slice(0, 4).map((c, j) => ({
          id: (c.id && ['a','b','c','d'].includes(c.id)) ? c.id : ['a','b','c','d'][j],
          text: (c.text || '').trim(),
        })) : [],
        correct_answer_id: ['a','b','c','d'].includes(q.correct_answer_id) ? q.correct_answer_id : 'a',
        rationale,
        misconception_hint,
        difficulty: 2,
        source_anchors: [],
      };
    });
  } catch {
    return [];
  }
}
