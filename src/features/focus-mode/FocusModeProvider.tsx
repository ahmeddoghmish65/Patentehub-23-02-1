/**
 * FocusModeProvider — distraction-free study mode context.
 *
 * When active, Focus Mode:
 *   • Hides sidebar, bottom nav, and non-essential chrome
 *   • Applies the `focus-mode` class to <html> for global CSS targeting
 *   • Persists the preference across sessions (localStorage)
 *   • Dispatches 'ph-focus-change' custom event for cross-component sync
 *
 * Usage:
 *   const { isActive, toggle, enter, exit } = useFocusMode();
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import { FOCUS_MODE_STORAGE_KEY } from '@/config/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FocusModeContextValue {
  /** Whether focus mode is currently active */
  isActive: boolean;
  /** Toggle between active / inactive */
  toggle: () => void;
  /** Enter focus mode */
  enter: () => void;
  /** Exit focus mode */
  exit: () => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const FocusModeContext = createContext<FocusModeContextValue | null>(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function loadStored(): boolean {
  try {
    return localStorage.getItem(FOCUS_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function applyToDOM(active: boolean): void {
  if (active) {
    document.documentElement.classList.add('focus-mode');
  } else {
    document.documentElement.classList.remove('focus-mode');
  }
}

function persist(active: boolean): void {
  try {
    localStorage.setItem(FOCUS_MODE_STORAGE_KEY, String(active));
  } catch {
    // ignore
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function FocusModeProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState<boolean>(loadStored);

  // Sync DOM and localStorage whenever state changes
  useEffect(() => {
    applyToDOM(isActive);
    persist(isActive);
    window.dispatchEvent(
      new CustomEvent('ph-focus-change', { detail: isActive }),
    );
  }, [isActive]);

  // Listen for cross-tab changes (e.g., user opens settings in another tab)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === FOCUS_MODE_STORAGE_KEY && e.newValue !== null) {
        setIsActive(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const enter  = useCallback(() => setIsActive(true),  []);
  const exit   = useCallback(() => setIsActive(false), []);
  const toggle = useCallback(() => setIsActive(v => !v), []);

  return (
    <FocusModeContext.Provider value={{ isActive, toggle, enter, exit }}>
      {children}
    </FocusModeContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useFocusMode(): FocusModeContextValue {
  const ctx = useContext(FocusModeContext);
  if (!ctx) {
    throw new Error('useFocusMode must be used within a <FocusModeProvider>');
  }
  return ctx;
}
