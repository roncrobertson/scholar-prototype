import { useEffect } from 'react';

/**
 * Register Escape key to call onExit (e.g. exit study session).
 * Use in study aides (Picmonics, SmartNotes, PracticeSession, etc.) for consistent keyboard UX.
 * @param {function} onExit - Called when user presses Escape
 */
export function useEscapeToExit(onExit) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (typeof onExit === 'function') onExit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onExit]);
}
