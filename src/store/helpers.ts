/**
 * Shared helper — apply dark/light/system theme to the DOM.
 * Lives here so it can be imported by both auth.store and main.tsx
 * without creating circular dependencies.
 *
 * Also writes to localStorage so the ThemeProvider stays in sync and the
 * anti-flash script in index.html can restore the preference on next load.
 */

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ph_theme';

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;

  // Resolve 'system' → actual light/dark based on OS preference
  const resolved: 'light' | 'dark' =
    theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : theme;

  if (resolved === 'dark') {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.removeAttribute('data-theme');
  }

  // Persist so the ThemeProvider and anti-flash script are in sync
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore in environments where localStorage is unavailable
  }

  // Notify the ThemeProvider (same-tab) so it can update React state
  window.dispatchEvent(new CustomEvent('ph-theme-change', { detail: theme }));
}
