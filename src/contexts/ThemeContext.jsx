import React, { createContext, useContext, useLayoutEffect } from 'react';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

/**
 * ThemeProvider - Light mode only. No dark mode or toggle.
 */
export function ThemeProvider({ children }) {
  useLayoutEffect(() => {
    document.documentElement.setAttribute('class', 'light');
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) meta.setAttribute('content', 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light' }}>
      {children}
    </ThemeContext.Provider>
  );
}
