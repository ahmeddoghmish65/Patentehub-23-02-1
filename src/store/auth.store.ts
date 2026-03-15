/**
 * Auth Store — manages authentication state.
 * Backed by IndexedDB (local mock database) via db/api.ts.
 */
import { create } from 'zustand';
import * as api from '@/infrastructure/database/api';
import {
  setCookie,
  getCookie,
  deleteCookie,
  clearActivityCookies,
  COOKIE_NAMES,
  COOKIE_EXPIRY,
} from '@/shared/utils/cookieManager';
import type { User } from '@/shared/types';

// Re-export applyTheme so main.tsx can use it from here
export { applyTheme } from './helpers';

interface AuthState {
  user: Omit<User, 'password'> | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  /** Always false for local DB — no email confirmation required */
  confirmationEmailSent: boolean;

  // Actions
  register:       (email: string, password: string, name: string, username?: string) => Promise<boolean>;
  checkUsername:  (username: string) => Promise<{ available: boolean; suggestions: string[] }>;
  login:          (email: string, password: string) => Promise<boolean>;
  logout:         () => Promise<void>;
  checkAuth:      () => Promise<void>;
  clearError:     () => void;
  resetPassword:  (email: string, newPassword: string) => Promise<boolean>;
  updateProfile:  (data: { name?: string; avatar?: string }) => Promise<void>;
  updateSettings: (settings: Partial<User['settings']>) => Promise<void>;
  updateProgress: (p: Partial<User['progress']>) => Promise<void>;
  refreshUser:    () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:                  null,
  token:                 null,
  isLoading:             true,
  error:                 null,
  confirmationEmailSent: false,

  checkUsername: async (username) => {
    const r = await api.apiCheckUsername(username);
    return r.data ?? { available: false, suggestions: [] };
  },

  register: async (email, password, name, username) => {
    set({ isLoading: true, error: null, confirmationEmailSent: false });
    const nameParts = name.split(' ');
    const firstName = nameParts[0] ?? '';
    const lastName  = nameParts.slice(1).join(' ') || '';
    const r = await api.apiRegister(email, password, name, { firstName, lastName, username });
    if (r.success && r.data) {
      setCookie(COOKIE_NAMES.AUTH, r.data.token, { days: COOKIE_EXPIRY.SESSION });
      set({ user: r.data.user, token: r.data.token, isLoading: false });
      return true;
    }
    set({ error: r.error, isLoading: false });
    return false;
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null, confirmationEmailSent: false });
    const r = await api.apiLogin(email, password);
    if (r.success && r.data) {
      setCookie(COOKIE_NAMES.AUTH, r.data.token, { days: COOKIE_EXPIRY.SESSION });
      set({ user: r.data.user, token: r.data.token, isLoading: false });

      // Sync preferences cookies
      if (r.data.user.settings?.language) {
        setCookie(COOKIE_NAMES.LANGUAGE, r.data.user.settings.language, {
          days: COOKIE_EXPIRY.PREFERENCES,
        });
      }
      if (r.data.user.settings?.theme) {
        setCookie(COOKIE_NAMES.THEME, r.data.user.settings.theme, {
          days: COOKIE_EXPIRY.PREFERENCES,
        });
        const { applyTheme } = await import('./helpers');
        applyTheme(r.data.user.settings.theme);
      }
      return true;
    }
    set({ error: r.error, isLoading: false });
    return false;
  },

  logout: async () => {
    const { token } = get();
    if (token) await api.apiLogout(token);
    deleteCookie(COOKIE_NAMES.AUTH);
    clearActivityCookies();
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = getCookie(COOKIE_NAMES.AUTH);
    if (!token) { set({ isLoading: false }); return; }
    const r = await api.apiGetUser(token);
    if (r.success && r.data) {
      set({ user: r.data, token, isLoading: false });
    } else {
      deleteCookie(COOKIE_NAMES.AUTH);
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null, confirmationEmailSent: false }),

  resetPassword: async (email, newPassword) => {
    const r = await api.apiResetPassword(email, newPassword);
    if (!r.success) set({ error: r.error });
    return r.success;
  },

  updateProfile: async (data) => {
    const { token } = get();
    if (!token) return;
    const r = await api.apiUpdateProfile(token, data);
    if (r.success && r.data) set({ user: r.data });
  },

  updateSettings: async (settings) => {
    const { token } = get();
    if (!token) return;
    const r = await api.apiUpdateSettings(token, settings);
    if (r.success && r.data) {
      set(s => ({ user: s.user ? { ...s.user, settings: r.data! } : null }));
      if (settings.language) {
        setCookie(COOKIE_NAMES.LANGUAGE, settings.language, { days: COOKIE_EXPIRY.PREFERENCES });
      }
      if (settings.theme) {
        setCookie(COOKIE_NAMES.THEME, settings.theme, { days: COOKIE_EXPIRY.PREFERENCES });
        const { applyTheme } = await import('./helpers');
        applyTheme(settings.theme);
      }
    }
  },

  updateProgress: async (p) => {
    const { token } = get();
    if (!token) return;
    const r = await api.apiUpdateProgress(token, p);
    if (r.success && r.data) {
      set(s => ({ user: s.user ? { ...s.user, progress: r.data! } : null }));
    }
  },

  refreshUser: async () => {
    const { token } = get();
    if (!token) return;
    const r = await api.apiGetUser(token);
    if (r.success && r.data) set({ user: r.data });
  },
}));
