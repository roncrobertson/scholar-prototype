import React, { useRef, useEffect } from 'react';
import { StudyAideIcon } from '../utils/studyAideIcons';

const STORAGE_KEY = 'scholar-onboarding-welcome';

export function getHasSeenWelcome() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return true;
  }
}

export function setHasSeenWelcome() {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch (_) {}
}

/**
 * One-time welcome modal: "What Scholar does" — study with AI Tutor, Smart Notes, flashcards, practice.
 * Focus trap: focus stays inside until dismissed; Escape dismisses.
 */
export function OnboardingWelcome({ onDismiss }) {
  const modalRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setHasSeenWelcome();
        onDismiss?.();
        return;
      }
      if (e.key !== 'Tab' || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDismiss]);

  const handleDismiss = () => {
    setHasSeenWelcome();
    onDismiss?.();
  };

  const features = [
    { aideId: 'tutor', name: 'AI Tutor', desc: 'Ask anything about your course; get explanations and practice ideas.' },
    { aideId: 'summary', name: 'Smart Notes', desc: 'AI-generated summaries; expand or condense concepts.' },
    { aideId: 'flashcards', name: 'Flashcards', desc: 'Spaced repetition cards — switch modes anytime without leaving your session.' },
    { aideId: 'practice', name: 'Practice', desc: 'Quiz yourself; generate more questions with AI.' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100 dark:border-gray-700"
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 id="onboarding-title" className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            Welcome to Scholar
          </h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Your AI-powered study buddy. Pick a course, then choose how to study:
          </p>
        </div>

        {/* Feature list — icons match nav/StudyModeSwitcher */}
        <ul className="px-6 pb-4 space-y-3">
          {features.map(({ aideId, name, desc }) => (
            <li key={name} className="flex gap-3">
              <div className="shrink-0 w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center">
                <StudyAideIcon aideId={aideId} className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="min-w-0">
                <strong className="text-gray-900 dark:text-gray-100 block text-sm">{name}</strong>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            When you exit a session, we’ll remind you how many concepts are due for review so you can space your learning.
          </p>
          <button
            ref={buttonRef}
            type="button"
            onClick={handleDismiss}
            className="btn-press w-full py-3 rounded-xl bg-brand-600 text-white font-semibold hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
          >
            Get started
          </button>
        </div>
      </div>
    </div>
  );
}

export default OnboardingWelcome;
