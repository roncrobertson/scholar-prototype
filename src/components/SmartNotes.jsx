import React, { useState, useCallback } from 'react';
import { StudyAideIcon } from '../utils/studyAideIcons';
import { getSmartNote, getTopicsWithNotes } from '../data/smartNotes';
import {
  addFlaggedForReview,
  removeFlaggedForReview,
  isFlaggedForReview,
  addConfused,
  removeConfused,
  isConfused,
  getFlaggedForReview,
  getConfusedConcepts,
} from '../data/smartNotesReviewFlags';
import { loadSavedResult, saveResult } from '../data/smartNotesAICache';
import { summarizeInBulletsWithResult, expandToParagraphWithResult } from '../services/smartNotesAI';
import { getApiKeyMessage, hasOpenAIKey } from '../utils/aiCapability';
import { useEscapeToExit } from '../hooks/useEscapeToExit';

const CONTEXTS = [
  { id: 'exam', label: 'Exam prep' },
  { id: 'class', label: 'Before class' },
  { id: 'review', label: 'Quick review' },
];

/** Build plain-text copy of the full note. */
function getNoteCopyText(note) {
  if (!note?.smart_note) return '';
  return [
    note.concept,
    '',
    'What it is',
    note.smart_note.what_it_is,
    '',
    'Why it matters',
    note.smart_note.why_it_matters,
    '',
    'Common confusion',
    note.smart_note.common_confusion,
  ].join('\n');
}

/**
 * Smart Notes — one-concept study notes (demo mode).
 * Input: course, topic, context. Output: concept + what_it_is, why_it_matters, common_confusion.
 */
export function SmartNotes({ course, onExit, onAskTutor }) {
  const topicsWithNotes = getTopicsWithNotes(course);
  const rawTopics = course?.masteryTopics || [];
  const courseIdForSort = course?.id || '';
  const flaggedSet = new Set(getFlaggedForReview().filter((f) => f.courseId === courseIdForSort).map((f) => f.topicName));
  const confusedSet = new Set(getConfusedConcepts().filter((c) => c.courseId === courseIdForSort).map((c) => c.topicName));
  const topics = [...rawTopics].sort((a, b) => {
    const aDue = flaggedSet.has(a.name) || confusedSet.has(a.name);
    const bDue = flaggedSet.has(b.name) || confusedSet.has(b.name);
    if (aDue && !bDue) return -1;
    if (!aDue && bDue) return 1;
    return 0;
  });
  const [topicName, setTopicName] = useState(topicsWithNotes[0] || topics[0]?.name || '');
  const [context, setContext] = useState('exam');
  const [copied, setCopied] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  /** When set, Retry will re-run the last failed AI action (summarize or expand). */
  const [aiLastAction, setAiLastAction] = useState(null);
  /** When true, current aiResult was loaded from cache (show "Saved" / "Regenerate"). */
  const [aiResultFromCache, setAiResultFromCache] = useState(false);
  const courseId = course?.id || '';
  const note = topicName ? getSmartNote(course, topicName, context) : null;

  // When topic or context changes, try to load saved AI result for this concept
  React.useEffect(() => {
    if (!courseId || !topicName) return;
    const forBullets = loadSavedResult(courseId, topicName, context, 'bullets');
    const forParagraph = loadSavedResult(courseId, topicName, context, 'paragraph');
    if (forBullets?.text) {
      setAiResult({ type: 'bullets', text: forBullets.text });
      setAiResultFromCache(true);
    } else if (forParagraph?.text) {
      setAiResult({ type: 'paragraph', text: forParagraph.text });
      setAiResultFromCache(true);
    } else {
      setAiResult(null);
      setAiResultFromCache(false);
    }
    setAiError(null);
    setAiLastAction(null);
  }, [courseId, topicName, context]);

  const [flagsVersion, setFlagsVersion] = useState(0);
  const flagged = isFlaggedForReview(courseId, topicName);
  const confused = isConfused(courseId, topicName);

  const toggleFlagged = useCallback(() => {
    if (flagged) removeFlaggedForReview(courseId, topicName);
    else addFlaggedForReview(courseId, topicName);
    setFlagsVersion((v) => v + 1);
  }, [courseId, topicName, flagged]);
  const toggleConfused = useCallback(() => {
    if (confused) removeConfused(courseId, topicName);
    else addConfused(courseId, topicName);
    setFlagsVersion((v) => v + 1);
  }, [courseId, topicName, confused]);

  const handleAskTutorConfused = useCallback(() => {
    if (typeof onAskTutor !== 'function') return;
    addConfused(courseId, topicName);
    onAskTutor({
      conceptName: note?.concept,
      summary: note?.smart_note?.what_it_is,
      hint: 'Student marked this concept as confusing—please focus on clarification.',
    });
  }, [courseId, topicName, note, onAskTutor]);

  useEscapeToExit(onExit);

  const handleCopy = useCallback(() => {
    if (!note) return;
    const text = getNoteCopyText(note);
    if (typeof navigator?.clipboard?.writeText === 'function') {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }, [note]);

  const noteTextForAI = note ? [note.concept, note.smart_note?.what_it_is, note.smart_note?.why_it_matters, note.smart_note?.common_confusion].filter(Boolean).join('\n\n') : '';

  const runSummarize = useCallback(async () => {
    if (!noteTextForAI) return;
    setAiLoading(true); setAiError(null); setAiResult(null); setAiLastAction(null); setAiResultFromCache(false);
    const result = await summarizeInBulletsWithResult(note?.concept, noteTextForAI);
    setAiLoading(false);
    if (result.ok) {
      setAiResult({ type: 'bullets', text: result.text });
      saveResult(courseId, topicName, context, 'bullets', result.text);
    } else {
      setAiError(result.message);
      setAiLastAction('summarize');
    }
  }, [note?.concept, noteTextForAI, courseId, topicName, context]);
  const runExpand = useCallback(async () => {
    if (!noteTextForAI) return;
    setAiLoading(true); setAiError(null); setAiResult(null); setAiLastAction(null); setAiResultFromCache(false);
    const result = await expandToParagraphWithResult(note?.concept, noteTextForAI);
    setAiLoading(false);
    if (result.ok) {
      setAiResult({ type: 'paragraph', text: result.text });
      saveResult(courseId, topicName, context, 'paragraph', result.text);
    } else {
      setAiError(result.message);
      setAiLastAction('expand');
    }
  }, [note?.concept, noteTextForAI, courseId, topicName, context]);

  const handleSummarize = useCallback(() => {
    if (!hasOpenAIKey()) { setAiError(getApiKeyMessage()); setAiLastAction(null); return; }
    runSummarize();
  }, [runSummarize]);
  const handleExpand = useCallback(() => {
    if (!hasOpenAIKey()) { setAiError(getApiKeyMessage()); setAiLastAction(null); return; }
    runExpand();
  }, [runExpand]);

  const handleRetry = useCallback(() => {
    setAiError(null);
    if (aiLastAction === 'summarize') runSummarize();
    else if (aiLastAction === 'expand') runExpand();
  }, [aiLastAction, runSummarize, runExpand]);

  const handleRegenerate = useCallback(() => {
    setAiResultFromCache(false);
    if (aiResult?.type === 'bullets') runSummarize();
    else if (aiResult?.type === 'paragraph') runExpand();
  }, [aiResult?.type, runSummarize, runExpand]);

  const courseLabel = course?.code || 'All Courses';
  const courseColor = course?.color || '#F59E0B';

  return (
    <div className="fade-in space-y-6">
      {/* Header — mode title only; exit is in StudyModeSwitcher */}
      <div className="flex items-center gap-3">
        <StudyAideIcon aideId="summary" className="w-8 h-8 text-gray-700 shrink-0" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">Smart Notes</h1>
          <p className="text-sm text-gray-500">{courseLabel}</p>
        </div>
      </div>

      {/* Topic & context — compact filter row */}
      <div className="bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
        <p className="text-xs font-medium text-gray-500 mb-2">Topic & context</p>
        <div className="flex flex-wrap gap-3 items-center">
          <label className="flex items-center gap-2">
            <span className="sr-only">Topic</span>
            <select
              value={topicName}
              onChange={(e) => setTopicName(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-gray-900 bg-white text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-0 focus:ring-gray-300"
              aria-label="Topic"
            >
              {topics.map((t) => {
                const isFlagged = flaggedSet.has(t.name);
                const isConfusedTopic = confusedSet.has(t.name);
                const label = [t.name, isFlagged && '📌', isConfusedTopic && '?'].filter(Boolean).join(' ');
                return (
                  <option key={t.name} value={t.name}>
                    {label}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="sr-only">Context</span>
            <select
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-gray-900 bg-white text-sm font-medium shadow-sm focus:ring-2 focus:ring-offset-0 focus:ring-gray-300"
              aria-label="Context"
            >
              {CONTEXTS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <span className="text-xs text-gray-400">Note updates as you change.</span>
        </div>
      </div>

      {/* Smart note card — softer accent, clear hierarchy */}
      {note && (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="border-l-4 p-6 pl-6" style={{ borderLeftColor: courseColor }}>
            {/* Badges: commonly tested, flagged, confused */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
                aria-label="Reason this note is shown"
              >
                <span aria-hidden>✓</span>
                Commonly tested
              </span>
              {flagged && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  <span aria-hidden>📌</span> You flagged this for review
                </span>
              )}
              {confused && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-800">
                  <span aria-hidden>?</span> You marked this as confusing
                </span>
              )}
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                aria-label="Copy note"
              >
                {copied ? 'Copied' : 'Copy note'}
              </button>
              {typeof window !== 'undefined' && window.speechSynthesis && note && (
                <button
                  type="button"
                  onClick={() => {
                    window.speechSynthesis.cancel();
                    const text = getNoteCopyText(note);
                    const u = new SpeechSynthesisUtterance(text);
                    u.rate = 0.92;
                    window.speechSynthesis.speak(u);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                  aria-label="Read note aloud"
                >
                  <span aria-hidden>🔊</span> Read aloud
                </button>
              )}
              <button
                type="button"
                onClick={handleSummarize}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors disabled:opacity-50"
              >
                {aiLoading ? '…' : 'Summarize (AI)'}
              </button>
              <button
                type="button"
                onClick={handleExpand}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors disabled:opacity-50"
              >
                Expand (AI)
              </button>
            </div>
            {aiError && (
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="text-sm text-red-600">{aiError}</p>
                {aiLastAction && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={aiLoading}
                    className="text-sm font-medium text-brand-700 hover:text-brand-800 disabled:opacity-50"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
            {aiResult && (
              <div className="mb-4 p-3 rounded-lg bg-brand-50 border border-brand-200">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-xs font-semibold text-brand-800">{aiResult.type === 'bullets' ? 'Summary (AI)' : 'Expanded (AI)'}</p>
                  {aiResultFromCache && (
                    <span className="text-xs text-brand-700">Saved</span>
                  )}
                  {aiResultFromCache && (
                    <button type="button" onClick={handleRegenerate} disabled={aiLoading} className="text-xs text-brand-600 hover:text-brand-800 disabled:opacity-50">
                      Regenerate
                    </button>
                  )}
                </div>
                <p className="text-gray-800 whitespace-pre-wrap text-sm">{aiResult.text}</p>
                <button type="button" onClick={() => { setAiResult(null); setAiResultFromCache(false); }} className="mt-2 text-xs text-brand-600 hover:text-brand-800">Dismiss</button>
              </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ color: courseColor }}>
              {note.concept}
            </h2>

            <div className="space-y-6">
              <section className="space-y-1.5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">What it is</h3>
                <p className="text-gray-800 leading-relaxed">{note.smart_note.what_it_is}</p>
              </section>
              <section className="space-y-1.5 pt-2 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Why it matters</h3>
                <p className="text-gray-800 leading-relaxed">{note.smart_note.why_it_matters}</p>
              </section>
              <section className="space-y-1.5 pt-2 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1.5">
                  <span aria-hidden>💡</span>
                  Common confusion
                </h3>
                <p className="text-amber-900 bg-amber-50 rounded-lg px-4 py-3 text-sm leading-relaxed border border-amber-200/80">
                  {note.smart_note.common_confusion}
                </p>
              </section>
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={toggleFlagged}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${flagged ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    aria-pressed={flagged}
                  >
                    <span aria-hidden>{flagged ? '📌' : '📌'}</span>
                    {flagged ? 'Remove from review' : 'Flag for review'}
                  </button>
                  <button
                    type="button"
                    onClick={confused ? toggleConfused : handleAskTutorConfused}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${confused ? 'bg-red-50 text-red-800 border-red-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                    aria-pressed={confused}
                  >
                    <span aria-hidden>?</span>
                    {confused ? 'Remove "I\'m confused"' : "I'm confused"}
                  </button>
                </div>
                {typeof onAskTutor === 'function' && (
                  <button
                    type="button"
                    onClick={() => onAskTutor({ conceptName: note.concept, summary: note.smart_note?.what_it_is })}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-brand-100 text-brand-800 hover:bg-brand-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    <StudyAideIcon aideId="tutor" className="w-4 h-4 shrink-0" /> Ask tutor about this concept
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!note && topicName && (
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-500 text-sm">
          No note for this topic yet. Pick another topic or try a different context.
        </div>
      )}
    </div>
  );
}

export default SmartNotes;
