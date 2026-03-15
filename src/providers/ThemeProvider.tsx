/**
 * ThemeProvider — global theme context for PatenteHub.
 *
 * Supports three modes:
 *   'light'  — always light
 *   'dark'   — always dark
 *   'system' — follows the OS/browser preference (default)
 *
 * The resolved class ('dark' or nothing) is applied to <html> so Tailwind's
 * `dark:` variant works across the entire component tree.
 *
 * Storage: localStorage key 'ph_theme' (read before React mounts for FOUC prevention).
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { THEME_STORAGE_KEY } from '@/config/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  /** The stored preference: 'light' | 'dark' | 'system' */
  theme: Theme;
  /** What's actually applied to the DOM: 'light' | 'dark' */
  resolvedTheme: 'light' | 'dark';
  /** Update the theme preference */
  setTheme: (theme: Theme) => void;
}

// ─── Internals ────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
  return 'system';
}

function applyToDOM(resolved: 'light' | 'dark'): void {
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(getSystemTheme);

  const resolvedTheme: 'light' | 'dark' =
    theme === 'system' ? systemTheme : theme;

  // Apply class to <html> whenever resolved theme changes
  useEffect(() => {
    applyToDOM(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for OS preference changes (relevant when theme === 'system')
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) =>
      setSystemTheme(e.matches ? 'dark' : 'light');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Listen for external writes to localStorage (e.g., auth store on login)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === THEME_STORAGE_KEY && e.newValue) {
        const v = e.newValue;
        if (v === 'light' || v === 'dark' || v === 'system') {
          setThemeState(v);
        }
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Listen for same-tab theme changes dispatched by store/helpers.ts
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Theme>).detail;
      if (detail === 'light' || detail === 'dark' || detail === 'system') {
        setThemeState(detail);
      }
    };
    window.addEventListener('ph-theme-change', handler);
    return () => window.removeEventListener('ph-theme-change', handler);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // ignore
    }
    // Notify any external listeners (e.g., auth store sync)
    window.dispatchEvent(
      new CustomEvent('ph-theme-change', { detail: newTheme }),
    );
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a <ThemeProvider>');
  }
  return ctx;
}
