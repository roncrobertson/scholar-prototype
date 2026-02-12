import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StudyAideIcon } from '../utils/studyAideIcons';
import {
  getCardsForCourse,
  shuffleCards,
  getStudyAgainPersisted,
  addToStudyAgainPersisted,
  removeFromStudyAgainPersisted,
  clearStudyAgainPersisted,
  getShowTermFirstPersisted,
  setShowTermFirstPersisted,
} from '../data/flashcards';
import { recordStudied, advanceInterval, getDueForReview } from '../services/spacedReview';
import { recordStudyActivity } from '../utils/studyStats';
import { loadGeneratedFlashcards } from '../services/flashcardGenerator';

/**
 * Flashcards - Core study flow: flip, rate (Got it / Study again), progress, review missed, session summary.
 * Options: which side first (term vs definition).
 */
const courseKey = (course) => (course?.id ?? 'all');

export function Flashcards({ course, onExit }) {
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTermFirst, setShowTermFirst] = useState(() => getShowTermFirstPersisted());
  const [studyAgainIds, setStudyAgainIds] = useState(new Set());
  const [totalRated, setTotalRated] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [persistedStudyAgainCount, setPersistedStudyAgainCount] = useState(0);
  const [showGoalPicker, setShowGoalPicker] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const rateHandlerRef = useRef(() => {});
  const cardButtonRef = useRef(null);
  const gotItButtonRef = useRef(null);

  const key = courseKey(course);

  // Session goals
  const GOALS = [
    { id: 'quick', label: 'Quick review', cards: 10, time: 5, emoji: '⚡' },
    { id: 'standard', label: 'Standard session', cards: 20, time: 10, emoji: '📚' },
    { id: 'deep', label: 'Deep practice', cards: 50, time: 25, emoji: '🎯' }
  ];

  /** Card IDs due for spaced review (this course or all). */
  const dueEntries = React.useMemo(
    () => getDueForReview(course?.id ?? undefined, 'flashcards'),
    [course?.id]
  );
  const dueCardIds = React.useMemo(
    () => dueEntries.map((d) => d.conceptId),
    [dueEntries]
  );
  const isShowingDueDeck =
    cards.length > 0 &&
    dueCardIds.length > 0 &&
    cards.every((c) => dueCardIds.includes(c.id)) &&
    cards.length === dueCardIds.length;

  const loadDeck = useCallback(
    (cardIds = null, limitToGoal = false) => {
      let deck = getCardsForCourse(course);
      
      // Merge with AI-generated flashcards
      if (course?.id) {
        const generatedCards = loadGeneratedFlashcards(course.id);
        deck = [...deck, ...generatedCards];
      }
      
      if (cardIds && cardIds.length > 0) {
        const idSet = new Set(cardIds);
        deck = deck.filter((c) => idSet.has(c.id));
        setStudyAgainIds(new Set());
        removeFromStudyAgainPersisted(key, cardIds);
      } else {
        setStudyAgainIds(new Set());
      }
      
      // Limit deck size based on goal
      if (limitToGoal && selectedGoal) {
        deck = deck.slice(0, selectedGoal.cards);
      }
      
      setTotalRated(0);
      const shuffled = shuffleCards(deck);
      setCards(shuffled);
      setIndex(0);
      setIsFlipped(false);
      setRoundComplete(false);
      setShowSummary(false);
      setPersistedStudyAgainCount(getStudyAgainPersisted(key).length);
      setSessionStartTime(Date.now());
    },
    [course, key, selectedGoal]
  );

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  useEffect(() => {
    setPersistedStudyAgainCount(getStudyAgainPersisted(key).length);
  }, [key]);

  const currentCard = cards[index];
  const hasPrev = index > 0;
  const hasNext = index < cards.length - 1;
  const isLastCard = index === cards.length - 1;
  const courseLabel = course?.code || 'All Courses';
  const courseColor = course?.color || '#9333ea';

  const handleRate = (again) => {
    if (!currentCard) return;
    const cid = currentCard.courseId || course?.id;
    if (cid) {
      recordStudied(cid, currentCard.id, 'flashcards');
      if (!again) advanceInterval(cid, currentCard.id, 'flashcards');
      if (again) addToStudyAgainPersisted(key, currentCard.id);
    }
    setTotalRated((n) => n + 1);
    if (again) setStudyAgainIds((prev) => new Set(prev).add(currentCard.id));
    if (isLastCard) {
      setRoundComplete(true);
    } else {
      setIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const handleExitClick = () => {
    setShowSummary(true);
  };

  const handleDone = () => {
    onExit();
  };

  const handleReviewAgain = () => {
    const againCards = cards.filter((c) => studyAgainIds.has(c.id));
    if (againCards.length === 0) {
      onExit();
      return;
    }
    removeFromStudyAgainPersisted(key, againCards.map((c) => c.id));
    loadDeck(againCards.map((c) => c.id));
  };

  const handleStartWithPersisted = () => {
    const ids = getStudyAgainPersisted(key);
    if (ids.length === 0) return;
    clearStudyAgainPersisted(key);
    setPersistedStudyAgainCount(0);
    loadDeck(ids);
  };

  const handleStudyDueFirst = () => {
    if (dueCardIds.length === 0) return;
    loadDeck(dueCardIds);
  };

  rateHandlerRef.current = handleRate;

  const progressPct = cards.length ? ((index + 1) / cards.length) * 100 : 0;

  // Keyboard: Space/Enter flip; 1/G Got it, 2/S Study again (when flipped); Left/Right prev/next
  useEffect(() => {
    if (showSummary || roundComplete || cards.length === 0) return;
    const onKeyDown = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return;
      if (isFlipped && (e.key === '1' || e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        rateHandlerRef.current(false);
        return;
      }
      if (isFlipped && (e.key === '2' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        rateHandlerRef.current(true);
        return;
      }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (hasPrev) {
          setIndex((i) => i - 1);
          setIsFlipped(false);
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (hasNext) {
          setIndex((i) => i + 1);
          setIsFlipped(false);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showSummary, roundComplete, cards.length, hasPrev, hasNext, isFlipped]);

  // Escape key exits study mode (always registered)
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);

  // Record study activity for streak when session ends (summary or round complete)
  useEffect(() => {
    if ((showSummary || roundComplete) && cards.length > 0) {
      recordStudyActivity();
    }
  }, [showSummary, roundComplete, cards.length]);

  // Accessibility: focus card or rate button when index/flip changes
  useEffect(() => {
    if (showSummary || roundComplete || cards.length === 0) return;
    const t = setTimeout(() => {
      if (isFlipped) gotItButtonRef.current?.focus();
      else cardButtonRef.current?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, [index, isFlipped, showSummary, roundComplete, cards.length]);

  // Swipe: left = next, right = prev (touch only)
  const [touchStartX, setTouchStartX] = useState(null);
  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (touchStartX == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const minSwipe = 50;
    if (dx < -minSwipe && hasNext) {
      setIndex((i) => i + 1);
      setIsFlipped(false);
    } else if (dx > minSwipe && hasPrev) {
      setIndex((i) => i - 1);
      setIsFlipped(false);
    }
    setTouchStartX(null);
  };

  // Goal picker (first-time or when resetting)
  if (showGoalPicker && !selectedGoal) {
    return (
      <div className="fade-in space-y-6">
        <div className="flex items-center gap-3">
          <StudyAideIcon aideId="flashcards" className="w-8 h-8 text-gray-700 dark:text-gray-300 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Flashcards</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{courseLabel}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Choose your session</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">How long do you want to study?</p>
          
          <div className="grid gap-4">
            {GOALS.map(goal => (
              <button
                key={goal.id}
                onClick={() => {
                  setSelectedGoal(goal);
                  setShowGoalPicker(false);
                  loadDeck(null, true);
                }}
                className="text-left p-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/20 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl" aria-hidden>{goal.emoji}</span>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg group-hover:text-brand-700 dark:group-hover:text-brand-300">
                        {goal.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        ~{goal.cards} cards · {goal.time} minutes
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl text-gray-300 dark:text-gray-600 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors">
                    →
                  </span>
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={() => {
              setShowGoalPicker(false);
              loadDeck();
            }}
            className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            Skip · Study all cards
          </button>
        </div>
      </div>
    );
  }

  // Empty deck
  if (cards.length === 0 && !showSummary) {
    return (
      <div className="fade-in bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-1">No flashcards for this course yet.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">Pick another course or try Quick Review for all decks.</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">Use the bar above to switch mode or back to course.</p>
      </div>
    );
  }

  // Session summary (after Exit or round complete)
  if (showSummary || (roundComplete && cards.length > 0)) {
    const toReview = studyAgainIds.size;
    const timeElapsed = sessionStartTime ? Math.round((Date.now() - sessionStartTime) / 60000) : 0;
    const goalMet = selectedGoal && totalRated >= selectedGoal.cards;
    
    return (
      <div className="fade-in bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 text-center">
        {goalMet && (
          <div className="mb-4 text-5xl animate-bounce">
            🎉
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {goalMet ? 'Goal complete!' : 'Session summary'}
        </h2>
        
        {selectedGoal && (
          <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-800">
            <span className="text-lg" aria-hidden>{selectedGoal.emoji}</span>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {selectedGoal.label} · {timeElapsed} min
            </span>
          </div>
        )}
        
        <p className="text-gray-600 dark:text-gray-300">
          You reviewed <strong>{totalRated}</strong> card{totalRated !== 1 ? 's' : ''}.
        </p>
        {toReview > 0 && (
          <>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              <strong>{toReview}</strong> need more practice.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Review these again soon to remember them better.</p>
          </>
        )}
        
        {goalMet && (
          <p className="text-sm text-green-700 dark:text-green-300 mt-3 font-medium">
            You stayed focused for {timeElapsed} minutes!
          </p>
        )}
        
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          {toReview > 0 && (
            <button
              type="button"
              onClick={handleReviewAgain}
              className="px-5 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors"
            >
              Review {toReview} again
            </button>
          )}
          <button
            type="button"
            onClick={handleDone}
            className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            aria-label="Done, back to course"
          >
            Done
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Use the bar above to switch mode or back to course.</p>
      </div>
    );
  }

  // Main study view
  const displayFront = showTermFirst ? currentCard.front : currentCard.back;
  const displayBack = showTermFirst ? currentCard.back : currentCard.front;
  const frontLabel = showTermFirst ? 'Term' : 'Definition';
  const backLabel = showTermFirst ? 'Definition' : 'Term';
  const currentVisibleText = isFlipped ? displayBack : displayFront;

  const handleReadAloud = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis || !currentVisibleText) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(currentVisibleText);
    window.speechSynthesis.speak(u);
  };
  const canReadAloud = typeof window !== 'undefined' && !!window.speechSynthesis;

  return (
    <div className="fade-in space-y-6">
      {/* Header — mode title only; options in menu */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <StudyAideIcon aideId="flashcards" className="w-8 h-8 text-gray-700 dark:text-gray-300 shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Flashcards</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{courseLabel}</p>
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOptionsOpen((o) => !o)}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Flashcard options"
            aria-expanded={optionsOpen}
            aria-haspopup="true"
          >
            <span className="text-lg leading-none" aria-hidden>⋮</span>
          </button>
          {optionsOpen && (
            <>
              <div className="fixed inset-0 z-10" aria-hidden onClick={() => setOptionsOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 min-w-[200px] py-1 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-600 shadow-lg">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Show first</p>
                  <div className="mt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={() => { setShowTermFirst(true); setShowTermFirstPersisted(true); setIsFlipped(false); setOptionsOpen(false); }}
                      className={`px-2 py-1 rounded text-sm ${showTermFirst ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      Term
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowTermFirst(false); setShowTermFirstPersisted(false); setIsFlipped(false); setOptionsOpen(false); }}
                      className={`px-2 py-1 rounded text-sm ${!showTermFirst ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                      Definition
                    </button>
                  </div>
                </div>
                {dueCardIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => { handleStudyDueFirst(); setOptionsOpen(false); }}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Study due first ({dueCardIds.length})
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { loadDeck(); setOptionsOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Shuffle deck
                </button>
                <button
                  type="button"
                  onClick={() => { handleExitClick(); setOptionsOpen(false); }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700"
                >
                  End & see summary
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Due for review: study due cards first */}
      {dueCardIds.length > 0 && !isShowingDueDeck && (
        <div className="rounded-xl bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 px-4 py-2 flex items-center justify-between gap-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            You have <strong>{dueCardIds.length}</strong> card{dueCardIds.length !== 1 ? 's' : ''} due for review.
          </p>
          <button
            type="button"
            onClick={handleStudyDueFirst}
            className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 hover:bg-blue-300 dark:hover:bg-blue-700 transition-colors"
          >
            Study due first
          </button>
        </div>
      )}

      {/* Persisted "study again" from last time */}
      {persistedStudyAgainCount > 0 && (
        <div className="rounded-xl bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 px-4 py-2 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You have <strong>{persistedStudyAgainCount}</strong> card{persistedStudyAgainCount !== 1 ? 's' : ''} to review from last time.
          </p>
          <button
            type="button"
            onClick={handleStartWithPersisted}
            className="shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-300 dark:hover:bg-amber-700 transition-colors"
          >
            Start with these
          </button>
        </div>
      )}

      {/* Progress bar + in-session tally */}
      <div>
        <div
          className="sr-only"
          aria-live="polite"
          aria-atomic="true"
        >
          Card {index + 1} of {cards.length}
        </div>
        <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-1">
          <span>Card {index + 1} of {cards.length}</span>
          {currentCard?.topic && (
            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-300">{currentCard.topic}</span>
          )}
        </div>
        {totalRated > 0 && (
          <div className="flex gap-4 text-sm mb-2">
            <span className="text-green-600 dark:text-green-400">Got it: {totalRated - studyAgainIds.size}</span>
            <span className="text-amber-600 dark:text-amber-400">Study again: {studyAgainIds.size}</span>
          </div>
        )}
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Card (3D flip) — tap to flip, swipe left/right for next/prev on touch */}
      <div
        className="flashcard-container touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          ref={cardButtonRef}
          type="button"
          onClick={() => setIsFlipped((f) => !f)}
          className="w-full focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-2xl"
          aria-label={isFlipped ? `Show ${frontLabel}` : `Show ${backLabel}`}
        >
          <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
            <div
              className="flashcard-face rounded-2xl shadow-sm hover:border-gray-200 dark:hover:border-gray-500 transition-colors"
              style={{ borderTopColor: courseColor, borderTopWidth: 4 }}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{frontLabel}</p>
              <p className="text-lg font-medium text-gray-900 leading-relaxed px-2">
                {displayFront}
              </p>
              <p className="text-sm text-brand-600 dark:text-brand-400 mt-4">Tap to flip</p>
            </div>
            <div
              className="flashcard-face back rounded-2xl shadow-sm hover:border-gray-200 dark:hover:border-gray-500 transition-colors"
              style={{ borderTopColor: courseColor, borderTopWidth: 4 }}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{backLabel}</p>
              <p className="text-lg font-medium text-gray-900 leading-relaxed px-2">
                {displayBack}
              </p>
              <p className="text-sm text-brand-600 dark:text-brand-400 mt-4">Tap to flip</p>
            </div>
          </div>
        </button>
      </div>

      {/* Read aloud — minimal icon button */}
      {canReadAloud && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleReadAloud}
            className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Read aloud"
            title="Listen"
          >
            <span className="text-lg" aria-hidden>🔊</span>
          </button>
        </div>
      )}

      {/* Rate (only when flipped) */}
      {isFlipped && (
        <div className="flex gap-3 justify-center">
          <button
            ref={gotItButtonRef}
            type="button"
            onClick={() => handleRate(false)}
            className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-sm"
          >
            Got it
          </button>
          <button
            type="button"
            onClick={() => handleRate(true)}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition-colors shadow-sm"
          >
            Study again
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setIndex((i) => Math.max(0, i - 1));
            setIsFlipped(false);
          }}
          disabled={!hasPrev}
          className="px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => {
            setIndex((i) => Math.min(cards.length - 1, i + 1));
            setIsFlipped(false);
          }}
          disabled={!hasNext}
          className="px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-brand-600 text-white hover:bg-brand-700 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default Flashcards;
