import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

export interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'canchas3-theme';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * Resolves initial theme following strict specification:
 * 1. Saved preference in localStorage ('canchas3-theme')
 * 2. Default to 'light' (Never infer from prefers-color-scheme on first load)
 */
function getInitialTheme(): Theme {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    }
  } catch (err) {
    // Graceful fallback for security/sandbox restrictions
    console.warn('Could not read saved theme from localStorage:', err);
  }
  return 'light';
}

function applyThemeToDOM(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // Set semantic attribute and class for Tailwind / CSS variables
  root.setAttribute('data-theme', theme);
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Also update color-scheme meta or property for browser native elements
  root.style.colorScheme = theme;
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  // Apply on mount and state changes
  useEffect(() => {
    applyThemeToDOM(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch (err) {
      console.warn('Could not persist theme to localStorage:', err);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextValue = {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
