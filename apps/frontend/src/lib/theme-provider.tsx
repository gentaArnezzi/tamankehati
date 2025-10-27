'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'taman-kehati-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return defaultTheme;
    }

    const storedTheme = window.localStorage.getItem(storageKey) as Theme | null;
    if (storedTheme) {
      return storedTheme;
    }

    if (defaultTheme === 'system') {
      return getSystemTheme();
    }

    return defaultTheme;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const root = window.document.documentElement;
    const applyThemeToDocument = (value: Theme) => {
      root.classList.remove('light', 'dark');

      if (value === 'system') {
        root.classList.add(getSystemTheme());
        return;
      }

      root.classList.add(value);
    };

    applyThemeToDocument(theme);

    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      applyThemeToDocument(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSetTheme = useCallback(
    (value: Theme) => {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, value);
      }

      setTheme(value);
    },
    [storageKey]
  );

  const value = useMemo<ThemeProviderState>(
    () => ({
      theme,
      setTheme: handleSetTheme,
    }),
    [handleSetTheme, theme]
  );

  return (
    <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
};
