import React, { useState, useEffect, useCallback } from 'react';
import { StudyAideIcon } from '../utils/studyAideIcons';
import {
  getQuestionsForSession,
  createSessionId,
  gradeShortAnswer,
} from '../data/questions';
import { generatePracticeQuestions } from '../services/generatePracticeQuestions';
import { getApiKeyMessage, hasOpenAIKey } from '../utils/aiCapability';
import { useEscapeToExit } from '../hooks/useEscapeToExit';

const DEFAULT_SESSION_SIZE = 5;

/** Format concept_id for display (e.g. "cell-membrane" -> "Cell membrane"). */
function formatConceptName(conceptId) {
  return (conceptId || '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * PracticeSession - Multiple choice + short answer practice with immediate feedback.
 * Concept-focused: optional targetConcepts for recommended/fragile concept(s).
 * Feedback: correct/incorrect, rationale, misconception hint if wrong.
 */
export function PracticeSession({ course, onExit, sessionOptions = {} }) {
  const { targetConcepts = [], reason_code, decision_rationale } = sessionOptions;
  const [sessionId] = useState(() => createSessionId());
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState(null);
  /** 'bank' | 'ai' — whether current questions are from question bank or AI. */
  const [sessionSource, setSessionSource] = useState('bank');
  /** When true, user is reviewing missed questions (read-only). */
  const [reviewingMissed, setReviewingMissed] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);

  const loadSession = useCallback(() => {
    const qs = getQuestionsForSession(course, {
      conceptIds: targetConcepts.length ? targetConcepts : undefined,
      limit: DEFAULT_SESSION_SIZE,
    });
    setQuestions(qs);
    setSessionSource('bank');
    setIndex(0);
    setSelectedChoiceId(null);
    setUserAnswer('');
    setAnswered(false);
    setAttempts([]);
    setCompleted(false);
    setReviewingMissed(false);
    setReviewIndex(0);
  }, [course, targetConcepts]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  const currentQuestion = questions[index];
  const isLast = index === questions.length - 1;
  const courseLabel = course?.code || 'All Courses';
  const courseColor = course?.color || '#10B981';
  const isShortAnswer = currentQuestion?.type === 'short_answer';
  const canSubmit = isShortAnswer ? userAnswer.trim().length > 0 : selectedChoiceId != null;

  const handleSubmit = () => {
    if (!currentQuestion) return;
    let isCorrect = false;
    let gradingResult = null;
    if (isShortAnswer) {
      gradingResult = gradeShortAnswer(userAnswer, currentQuestion);
      isCorrect = gradingResult.correct;
    } else {
      if (!selectedChoiceId) return;
      isCorrect = selectedChoiceId === currentQuestion.correct_answer_id;
    }
    setCorrect(isCorrect);
    setAnswered(true);
    setAttempts((prev) => [
      ...prev,
      {
        question_id: currentQuestion.id,
        concept_id: currentQuestion.concept_id,
        chosen_id: selectedChoiceId,
        user_answer: isShortAnswer ? userAnswer : undefined,
        correct: isCorrect,
        grading_result: gradingResult ?? undefined,
      },
    ]);
  };

  const handleNext = () => {
    if (isLast) {
      setCompleted(true);
    } else {
      setIndex((i) => i + 1);
      setSelectedChoiceId(null);
      setUserAnswer('');
      setAnswered(false);
    }
  };

  const correctCount = attempts.filter((a) => a.correct).length;
  const scorePct = questions.length ? Math.round((correctCount / questions.length) * 100) : 0;

  useEscapeToExit(onExit);

  const handleGenerateAI = useCallback(async () => {
    if (!hasOpenAIKey()) {
      setAiError(getApiKeyMessage());
      return;
    }
    setGeneratingAI(true);
    setAiError(null);
    try {
      const aiQuestions = await generatePracticeQuestions(course, targetConcepts?.[0] ? formatConceptName(targetConcepts[0]) : undefined);
      if (aiQuestions.length > 0) {
        setQuestions(aiQuestions);
        setSessionSource('ai');
        setIndex(0);
        setSelectedChoiceId(null);
        setUserAnswer('');
        setAnswered(false);
        setAttempts([]);
        setCompleted(false);
        setReviewingMissed(false);
      } else {
        setAiError(getApiKeyMessage());
      }
    } catch (_) {
      setAiError('Failed to generate questions. ' + getApiKeyMessage());
    } finally {
      setGeneratingAI(false);
    }
  }, [course, targetConcepts]);

  // No questions
  if (questions.length === 0) {
    return (
      <div className="fade-in bg-white rounded-2xl border border-gray-100 p-8 text-center">
        <p className="text-gray-500 mb-1">No practice questions for this course yet.</p>
        <p className="text-sm text-gray-400 mb-2">Pick another course or generate questions with AI.</p>
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={generatingAI}
          className="mt-4 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 text-sm"
        >
          {generatingAI ? 'Generating…' : 'Generate 3 questions (AI)'}
        </button>
        {aiError && <p className="mt-2 text-sm text-red-600">{aiError}</p>}
        <p className="text-xs text-gray-400 mt-4">Use the bar above to switch mode or back to course.</p>
      </div>
    );
  }

  // Review-missed flow: list of { question, attempt } for wrong answers
  const missedItems = completed && !reviewingMissed
    ? attempts
        .filter((a) => !a.correct)
        .map((a) => ({ attempt: a, question: questions.find((q) => q.id === a.question_id) }))
        .filter((x) => x.question)
    : [];
  const isReviewing = completed && reviewingMissed && missedItems.length > 0;
  const currentReviewItem = isReviewing ? missedItems[reviewIndex] : null;
  const isLastReview = isReviewing && reviewIndex === missedItems.length - 1;

  // Review missed: read-only card per missed question
  if (isReviewing && currentReviewItem) {
    const { question, attempt } = currentReviewItem;
    const isSA = question.type === 'short_answer';
    const correctChoice = !isSA && question.choices?.find((c) => c.id === question.correct_answer_id);
    return (
      <div className="fade-in space-y-6">
        <div className="flex items-center gap-3">
          <StudyAideIcon aideId="practice" className="w-8 h-8 text-gray-700 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Review missed</h1>
            <p className="text-sm text-gray-500">
              Question {reviewIndex + 1} of {missedItems.length}
            </p>
          </div>
        </div>
        <div
          className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-6 shadow-sm"
          style={{ borderTopColor: course?.color || '#10B981', borderTopWidth: 4 }}
        >
          <p className="text-lg font-medium text-gray-900 leading-relaxed mb-4">{question.prompt}</p>
          {isSA ? (
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-500">Your answer</p>
              <p className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-gray-800">
                {attempt.user_answer || '(empty)'}
              </p>
              {question.correct_keywords?.length > 0 && (
                <p className="text-sm text-green-700">
                  Acceptable keywords: {question.correct_keywords.join(', ')}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              <p className="text-sm text-red-700">Your answer: {question.choices?.find((c) => c.id === attempt.chosen_id)?.text ?? attempt.chosen_id}</p>
              {correctChoice && (
                <p className="text-sm text-green-700">Correct: {correctChoice.text}</p>
              )}
            </div>
          )}
          <div className="rounded-xl p-4 bg-amber-50 border border-amber-200">
            <p className="text-sm font-medium text-amber-900">Rationale</p>
            <p className="text-sm text-gray-700 mt-1">{question.rationale}</p>
            {question.misconception_hint && (
              <p className="text-sm text-amber-800 mt-2 font-medium">Hint: {question.misconception_hint}</p>
            )}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => (isLastReview ? setReviewingMissed(false) : setReviewIndex((i) => i + 1))}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
            >
              {isLastReview ? 'Back to summary' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // End-of-session summary (after quiz, or after review-missed)
  if (completed) {
    const wrongCount = questions.length - correctCount;
    return (
      <div className="fade-in bg-white rounded-2xl border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Session summary</h2>
        <p className="text-gray-600">
          You got <strong>{correctCount}</strong> of <strong>{questions.length}</strong> correct ({scorePct}%).
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {sessionSource === 'ai'
            ? `${questions.length} AI-generated question${questions.length !== 1 ? 's' : ''}`
            : `${questions.length} from question bank`}
        </p>

        {wrongCount > 0 && (
          <>
            <p className="text-sm text-amber-700 mt-3 bg-amber-50 rounded-lg p-3">
              Review the rationales for the {wrongCount} question{wrongCount !== 1 ? 's' : ''} you missed to strengthen those concepts.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => { setReviewingMissed(true); setReviewIndex(0); }}
                className="px-4 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 transition-colors text-left"
              >
                Review {wrongCount} missed
              </button>
            </div>
          </>
        )}

        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">Next</p>
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <button
              type="button"
              onClick={loadSession}
              className="px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors text-left"
            >
              Do {DEFAULT_SESSION_SIZE} more (from bank)
            </button>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={generatingAI}
              className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors text-left text-sm"
            >
              {generatingAI ? 'Generating…' : 'Replace with 3 new (AI)'}
            </button>
            <button
              type="button"
              onClick={onExit}
              className="px-4 py-2.5 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors text-left text-sm"
            >
              Exit
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">Use the bar above to switch mode or back to course.</p>
        </div>

        <p className="text-xs text-gray-400 mt-4">Session {sessionId}</p>
      </div>
    );
  }

  // Question view
  const progressPct = questions.length ? ((index + 1) / questions.length) * 100 : 0;

  return (
    <div className="fade-in space-y-6">
      {/* Header — mode title only; exit is in StudyModeSwitcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <StudyAideIcon aideId="practice" className="w-8 h-8 text-gray-700 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Practice</h1>
            <p className="text-sm text-gray-500">{courseLabel}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              {sessionSource === 'ai'
                ? `${questions.length} AI-generated question${questions.length !== 1 ? 's' : ''}`
                : `${questions.length} from question bank`}
            </p>
            {targetConcepts.length > 0 && (
              <p className="text-sm text-brand-600 mt-0.5">
                This session: {questions.length} questions on {targetConcepts.map(formatConceptName).join(', ')}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={generatingAI}
          className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          title={questions.length > 0 ? 'Replaces current questions with 3 new AI questions' : undefined}
        >
          {generatingAI ? 'Generating…' : questions.length > 0 ? 'Replace with 3 new (AI)' : 'Generate 3 questions (AI)'}
        </button>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Question {index + 1} of {questions.length}</span>
          {currentQuestion?.concept_id && (
            <span className="px-2 py-0.5 bg-gray-100 rounded text-gray-600 capitalize">
              {currentQuestion.concept_id.replace(/-/g, ' ')}
            </span>
          )}
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%`, backgroundColor: courseColor }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        className="rounded-2xl border-2 border-gray-100 bg-white p-6 shadow-sm"
        style={{ borderTopColor: courseColor, borderTopWidth: 4 }}
      >
        <p className="text-lg font-medium text-gray-900 leading-relaxed mb-6">
          {currentQuestion.prompt}
        </p>

        {!answered ? (
          <>
            {isShortAnswer ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your answer</label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && canSubmit && handleSubmit()}
                  placeholder="Type your answer..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-colors"
                  autoFocus
                />
              </div>
            ) : (
              <div className="space-y-2">
                {currentQuestion.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => setSelectedChoiceId(choice.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors ${
                      selectedChoiceId === choice.id
                        ? 'border-brand-500 bg-brand-50 text-brand-900'
                        : 'border-gray-100 bg-gray-50 text-gray-800 hover:border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium mr-2">{choice.id.toUpperCase()}.</span>
                    {choice.text}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit
              </button>
            </div>
          </>
        ) : (
          <>
            {isShortAnswer ? (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Your answer</p>
                <p className="px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">{userAnswer || '(empty)'}</p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {currentQuestion.choices.map((choice) => {
                  const isChosen = selectedChoiceId === choice.id;
                  const isCorrectChoice = choice.id === currentQuestion.correct_answer_id;
                  const showWrong = isChosen && !isCorrectChoice;
                  return (
                    <div
                      key={choice.id}
                      className={`px-4 py-3 rounded-xl border-2 ${
                        isCorrectChoice
                          ? 'border-green-500 bg-green-50'
                          : showWrong
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-100 bg-gray-50'
                      }`}
                    >
                      <span className="font-medium mr-2">{choice.id.toUpperCase()}.</span>
                      {choice.text}
                      {isCorrectChoice && <span className="ml-2 text-green-700">✓ Correct</span>}
                      {showWrong && <span className="ml-2 text-red-700">✗ Your answer</span>}
                    </div>
                  );
                })}
              </div>
            )}

            <div className={`rounded-xl p-4 ${correct ? 'bg-green-50' : 'bg-amber-50'}`}>
              <p className={`font-medium ${correct ? 'text-green-800' : 'text-amber-900'}`}>
                {correct ? 'Correct.' : 'Not quite.'}
              </p>
              <p className="text-sm text-gray-700 mt-1">{currentQuestion.rationale}</p>
              {!correct && currentQuestion.misconception_hint && (
                <p className="text-sm text-amber-800 mt-2 font-medium">
                  Hint: {currentQuestion.misconception_hint}
                </p>
              )}
              {!correct && isShortAnswer && (() => {
                const lastAttempt = attempts.find((a) => a.question_id === currentQuestion.id);
                const missing = lastAttempt?.grading_result?.missing;
                if (missing?.length > 0) {
                  return (
                    <p className="text-sm text-amber-800 mt-2 font-medium">
                      Try to include concepts like: {missing.slice(0, 5).join(', ')}{missing.length > 5 ? '…' : ''}
                    </p>
                  );
                }
                return null;
              })()}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
              >
                {isLast ? 'See summary' : 'Next'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PracticeSession;
