/**
 * Shared helper — apply dark/light theme to the DOM.
 * Lives here so it can be imported by both auth.store and main.tsx
 * without creating circular dependencies.
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.setAttribute('data-theme', 'dark');
    root.classList.add('dark');
  } else {
    root.removeAttribute('data-theme');
    root.classList.remove('dark');
  }
}
