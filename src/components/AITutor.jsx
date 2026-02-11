import React, { useState, useRef, useEffect, useCallback } from 'react';
import { StudyAideIcon } from '../utils/studyAideIcons';
import { getApiKeyMessage, hasOpenAIKey } from '../utils/aiCapability';

const OPENAI_CHAT_URL = 'https://api.openai.com/v1/chat/completions';

/** Learning-science system prompt: retrieval-friendly, concise, Socratic, suggests Flashcards. */
function buildSystemPrompt(courseContext) {
  const base = [
    'You are a warm, expert academic tutor. Your goal is to help the student understand and remember.',
    'Be concise by default (2–4 sentences). If they want more depth, they can ask "go deeper" or "explain more."',
    'Use retrieval-friendly language: "One way to remember this is…", "For the exam, focus on…", "A key takeaway:…"',
    'When relevant, suggest next steps: "Practice with flashcards on this" or "Try the Smart Notes summary."',
    'Ask short guiding questions when it helps (Socratic): "What do you think happens when…?"',
    'No preamble like "Here is…" or "Sure!"—jump straight to the content.',
  ].join(' ');
  return courseContext ? `${base}\n\n${courseContext}` : base;
}

/** Course-aware context: topics, upcoming, instructor tip. */
function buildCourseContext(course, conceptContext, sessionMemory) {
  const parts = [];
  if (course) {
    parts.push(`The student is studying ${course.code} — ${course.name || ''}. Keep answers relevant to this course.`);
    parts.push(`Current course: ${course.code} — ${course.name || ''}.`);
    if (course.masteryTopics?.length) {
      const topics = course.masteryTopics.map((t) => t.name).join(', ');
      parts.push(`Topics: ${topics}.`);
    }
    if (course.upcoming?.length) {
      const next = course.upcoming
        .filter((u) => u.type === 'exam' || u.type === 'quiz')
        .map((u) => `${u.name} (${u.due})`)
        .join('; ');
      if (next) parts.push(`Upcoming: ${next}.`);
    }
    if (course.instructor?.tip) {
      parts.push(`Instructor tip: ${course.instructor.tip}`);
    }
  }
  if (conceptContext?.conceptName || conceptContext?.summary) {
    parts.push('Current concept (student asked to explain this): ' + (conceptContext.conceptName || '') + (conceptContext.summary ? '. Summary: ' + conceptContext.summary.slice(0, 200) : '') + '.');
    if (conceptContext?.hint) {
      parts.push('Student hint: ' + conceptContext.hint.slice(0, 300) + '.');
    }
  }
  if (sessionMemory?.trim()) {
    parts.push('Student asked to remember for this session: ' + sessionMemory.trim().slice(0, 200) + '.');
  }
  return parts.join(' ');
}

const STORAGE_KEY_PREFIX = 'scholar-aitutor-';

function getStorageKey(course) {
  return `${STORAGE_KEY_PREFIX}${course?.id || 'general'}`;
}

function loadMessages(course) {
  try {
    const key = getStorageKey(course);
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveMessages(course, messages) {
  try {
    localStorage.setItem(getStorageKey(course), JSON.stringify(messages));
  } catch (_) {}
}

/** Prompt used only to generate the opening "one thing to focus on today" message. */
function buildOpeningSystemPrompt(courseContext) {
  return (
    'You are an academic coach. Generate a single short paragraph (2–4 sentences). ' +
    'Do not say "Here is" or "Your message"—output only the paragraph. ' +
    'Content: 1) Greet the student warmly in their course. ' +
    '2) If there is an upcoming exam or quiz, mention it briefly. ' +
    '3) Suggest one concrete thing to focus on today (e.g. a topic they might be weak on, or a key concept). ' +
    '4) Invite them to ask a question. Be specific to the course and encouraging.' +
    (courseContext ? `\n\nContext: ${courseContext}` : '')
  );
}

const SUGGESTED_PROMPTS = [
  'Explain this topic in simple terms',
  "What's the main thing I need to know for the exam?",
  'Give me a practice question',
  'How do I remember this?',
  'Summarize the key takeaway',
];

/**
 * AI Tutor — chat UI with OpenAI, persistence, opener, suggested prompts, and course context.
 */
export function AITutor({ course, onExit, conceptContext, onContextConsumed }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingOpener, setLoadingOpener] = useState(false);
  const [openerError, setOpenerError] = useState(null);
  const [error, setError] = useState(null);
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);
  const [showOnboardingTip, setShowOnboardingTip] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && !localStorage.getItem('scholar-onboarding-tutor');
    } catch {
      return false;
    }
  });
  const listEndRef = useRef(null);
  const openerRequested = useRef(false);
  const conceptContextSent = useRef(false);
  const [sessionMemory, setSessionMemory] = useState('');
  const [showRememberInput, setShowRememberInput] = useState(false);
  const courseLabel = course?.code || 'All Courses';
  const courseContext = buildCourseContext(course, conceptContext, sessionMemory);
  const systemPrompt = buildSystemPrompt(courseContext);

  const scrollToBottom = useCallback(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);
  useEffect(() => scrollToBottom(), [messages]);

  // Load persisted messages on mount
  useEffect(() => {
    const stored = loadMessages(course);
    setMessages(stored);
    setHasLoadedFromStorage(true);
  }, [course?.id]);

  // When conceptContext is set (e.g. from "Explain this" in Smart Notes), auto-send one question and consume context
  useEffect(() => {
    if (!conceptContext?.conceptName) {
      conceptContextSent.current = false;
      return;
    }
    if (conceptContextSent.current || loading) return;
    conceptContextSent.current = true;
    const question = `Explain "${conceptContext.conceptName}" in simple terms. What's the main thing to remember?`;
    sendMessage(question);
    if (typeof onContextConsumed === 'function') onContextConsumed();
  }, [conceptContext?.conceptName, loading]);

  // Generate opening message when thread is empty (after load) and we have course + API key (and no conceptContext)
  const fetchOpener = useCallback(() => {
    if (!hasOpenAIKey()) {
      setOpenerError(getApiKeyMessage());
      return;
    }
    setOpenerError(null);
    openerRequested.current = true;
    setLoadingOpener(true);
    const openerPrompt = buildOpeningSystemPrompt(courseContext);
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    fetch(OPENAI_CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Generate my opening message.' }, { role: 'system', content: openerPrompt }],
        max_tokens: 256,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setOpenerError(data.error.message || getApiKeyMessage());
          return;
        }
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          const next = [{ role: 'assistant', content }];
          setMessages(next);
          saveMessages(course, next);
        } else {
          setOpenerError('Could not load opening message.');
        }
      })
      .catch((err) => {
        setOpenerError(err.message || 'Network error. Check your connection.');
      })
      .finally(() => setLoadingOpener(false));
  }, [course, courseContext]);

  useEffect(() => {
    if (!hasLoadedFromStorage || messages.length > 0 || loadingOpener || openerRequested.current || conceptContext?.conceptName) return;
    fetchOpener();
  }, [hasLoadedFromStorage, course?.id, courseContext, fetchOpener]);

  const sendMessage = async (textOverride = null) => {
    const text = (textOverride || input).trim();
    if (!text || loading) return;

    if (!hasOpenAIKey()) {
      setError(getApiKeyMessage());
      return;
    }
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    setError(null);
    const userMessage = { role: 'user', content: text };
    if (!textOverride) setInput('');
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          userMessage,
        ],
        max_tokens: 512,
      };
      const res = await fetch(OPENAI_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error.message || 'OpenAI error');
        setMessages((prev) => prev.slice(0, -1));
        if (!textOverride) setInput(text);
        return;
      }

      const assistantContent = data.choices?.[0]?.message?.content?.trim() || 'No response.';
      const next = [...messages, userMessage, { role: 'assistant', content: assistantContent }];
      setMessages(next);
      saveMessages(course, next);
    } catch (err) {
      setError(err.message || 'Network error');
      setMessages((prev) => prev.slice(0, -1));
      if (!textOverride) setInput(text);
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setError(null);
    setOpenerError(null);
    saveMessages(course, []);
    setLoadingOpener(false);
    openerRequested.current = false;
    setHasLoadedFromStorage(true);
    if (course) fetchOpener();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0;
  const showSuggestedPrompts = isEmpty && !loadingOpener;

  return (
    <div className="fade-in flex flex-col h-[min(75vh,700px)] bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-center gap-3 min-w-0">
          <StudyAideIcon aideId="tutor" className="w-8 h-8 shrink-0 text-gray-700 dark:text-gray-300" />
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">AI Tutor</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{courseLabel} • Ask anything</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          className="shrink-0 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          New chat
        </button>
        <button
          type="button"
          onClick={() => setShowRememberInput((v) => !v)}
          className="shrink-0 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Add context for this session (e.g. I'm focusing on cell membrane)"
        >
          Remember this
        </button>
      </div>

      {/* Session memory: "Remember this" (Phase 5.2) */}
      {showRememberInput && (
        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
          <input
            type="text"
            value={sessionMemory}
            onChange={(e) => setSessionMemory(e.target.value)}
            placeholder="e.g. I'm focusing on cell membrane"
            className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
            onKeyDown={(e) => e.key === 'Escape' && setShowRememberInput(false)}
          />
          <button type="button" onClick={() => setShowRememberInput(false)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">Done</button>
        </div>
      )}

      {/* One-time onboarding tip (Phase 4.3) */}
      {showOnboardingTip && (
        <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-700 bg-brand-50/30 dark:bg-brand-900/30 text-sm text-brand-900 dark:text-brand-200">
          <p className="flex-1">
            <span className="font-medium">Tip:</span> Ask anything about your course. I&apos;ll help you understand and remember—and suggest flashcards when it helps.
          </p>
          <button
            type="button"
            onClick={() => {
              setShowOnboardingTip(false);
              try {
                localStorage.setItem('scholar-onboarding-tutor', '1');
              } catch (_) {}
            }}
            className="shrink-0 rounded px-2 py-1 text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-800/50 font-medium"
            aria-label="Dismiss tip"
          >
            Got it
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {loadingOpener && (
          <div className="flex gap-3">
            <span className="shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400" aria-hidden>
              <StudyAideIcon aideId="tutor" className="w-5 h-5" />
            </span>
            <div className="rounded-2xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm shadow-sm max-w-[85%]">
              Thinking of what to focus on today…
            </div>
          </div>
        )}

        {openerError && !loadingOpener && isEmpty && (
          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200 flex flex-wrap items-center justify-between gap-2">
            <span>{openerError}</span>
            <button
              type="button"
              onClick={() => {
                openerRequested.current = false;
                fetchOpener();
              }}
              className="shrink-0 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-800/50 text-amber-800 dark:text-amber-200 font-medium hover:bg-amber-200 dark:hover:bg-amber-700"
            >
              Retry
            </button>
          </div>
        )}

        {!loadingOpener && isEmpty && !openerError && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6 px-4">
            Ask a question about your course or any topic. I&apos;ll help you understand and remember.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {m.role === 'assistant' && (
              <span
                className="shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400"
                aria-hidden
              >
                <StudyAideIcon aideId="tutor" className="w-5 h-5" />
              </span>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
                m.role === 'user'
                  ? 'bg-brand-600 text-white ml-auto'
                  : 'bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-600'
              }`}
            >
              {m.role === 'assistant' && (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Tutor</p>
              )}
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <span className="shrink-0 w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/50 flex items-center justify-center text-brand-600 dark:text-brand-400" aria-hidden>
              <StudyAideIcon aideId="tutor" className="w-5 h-5" />
            </span>
            <div className="rounded-2xl px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-gray-500 dark:text-gray-400 text-sm shadow-sm">
              Thinking…
            </div>
          </div>
        )}
        <div ref={listEndRef} />
      </div>

      {/* Suggested prompts (empty state) */}
      {showSuggestedPrompts && (
        <div className="px-4 pb-2">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => sendMessage(prompt)}
                disabled={loading}
                className="px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p className="px-4 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-t border-red-100 dark:border-red-800">{error}</p>
      )}

      {/* Optional quick prompts when thread has messages */}
      {!isEmpty && messages.length > 0 && (
        <div className="px-4 pb-1 flex flex-wrap gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 self-center">Try:</span>
          {['Explain in simple terms', 'Quiz me', 'Key takeaway?'].map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="px-2.5 py-1 rounded-lg text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            className="flex-1 min-h-[44px] max-h-32 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm"
            rows={1}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm shrink-0 shadow-sm"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default AITutor;
