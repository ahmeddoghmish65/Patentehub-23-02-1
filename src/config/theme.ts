/**
 * Theme Configuration — single source of truth for theme metadata.
 *
 * Used by ThemeProvider, ThemeToggle, and settings pages.
 * Adding a new theme: add an entry to THEME_OPTIONS and extend ThemeProvider logic.
 */

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeOption {
  id: Theme;
  /** Display label shown in UI */
  label: string;
  /** Material Symbols icon name */
  icon: string;
  /** Short description for tooltips / settings */
  description: string;
}

/** All available theme options in display order */
export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'light',
    label: 'Light',
    icon: 'light_mode',
    description: 'Always use the light theme',
  },
  {
    id: 'system',
    label: 'System',
    icon: 'brightness_auto',
    description: 'Follow your device preference',
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: 'dark_mode',
    description: 'Always use the dark theme',
  },
];

/** Cycle order for the compact toggle button */
export const THEME_CYCLE: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

// ─── Storage keys (shared between provider + anti-flash script) ───────────────

export const THEME_STORAGE_KEY = 'ph_theme' as const;
