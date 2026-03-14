import { create } from 'zustand';

interface UIState {
  hideBottomNav: boolean;
  setHideBottomNav: (hide: boolean) => void;
}

export const useUIStore = create<UIState>(set => ({
  hideBottomNav: false,
  setHideBottomNav: (hide) => set({ hideBottomNav: hide }),
}));
