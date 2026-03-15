/**
 * UI Store — global UI state managed with Zustand.
 *
 * Keeps lightweight boolean flags that need to be accessible across the tree
 * without prop-drilling, but don't warrant a full React context.
 *
 * Theme and Focus Mode state live in their own React context providers
 * (ThemeProvider, FocusModeProvider) because they require DOM side-effects
 * and localStorage persistence on mount.
 */
import { create } from 'zustand';

interface UIState {
  /** Hide the bottom navigation bar (used during quiz / exam sessions) */
  hideBottomNav: boolean;
  setHideBottomNav: (hide: boolean) => void;
}

export const useUIStore = create<UIState>(set => ({
  hideBottomNav: false,
  setHideBottomNav: (hide) => set({ hideBottomNav: hide }),
}));
