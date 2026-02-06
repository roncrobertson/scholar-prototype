import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

function prefersReducedMotion() {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Returns a navigate function wrapped with View Transitions API (Phase 6.6.1).
 * When the browser supports it, route changes get a smooth cross-fade.
 * Skips transition when user prefers reduced motion (Phase 6.6.4).
 */
export function useViewTransitionNavigate() {
  const navigate = useNavigate();

  const navigateWithTransition = useCallback(
    (to, options) => {
      const doNavigate = () => {
        flushSync(() => navigate(to, options));
      };

      const useTransition =
        typeof document !== 'undefined' &&
        document.startViewTransition &&
        !prefersReducedMotion();

      if (useTransition) {
        document.startViewTransition(doNavigate);
      } else {
        doNavigate();
      }
    },
    [navigate]
  );

  return navigateWithTransition;
}
