/**
 * Auth Store — manages authentication state.
 * Backed by Supabase (PostgreSQL + JWT + auto Refresh Tokens).
 *
 * Supabase client handles:
 *  - JWT access token (1-hour default)
 *  - Refresh token (auto-renewed, stored in localStorage)
 *  - onAuthStateChange fires on: SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED
 */
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import {
  supabaseRegister,
  supabaseLogin,
  supabaseLogout,
  supabaseGetCurrentUser,
  supabaseSendPasswordReset,
  supabaseUpdatePassword,
  supabaseUpdateProfile,
  supabaseUpdateSettings,
  supabaseUpdateProgress,
  supabaseCheckUsername,
} from '@/lib/supabase-auth';
import {
  setCookie,
  deleteCookie,
  clearActivityCookies,
  COOKIE_NAMES,
  COOKIE_EXPIRY,
} from '@/utils/cookieManager';
import type { User } from '@/types';

// Re-export applyTheme so main.tsx can use it from here
export { applyTheme } from './helpers';

interface AuthState {
  user: Omit<User, 'password'> | null;
  /** Supabase JWT access token (auto-refreshed by the client) */
  token: string | null;
  isLoading: boolean;
  error: string | null;

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

export const useAuthStore = create<AuthState>((set, get) => {
  // ── Supabase real-time auth listener ────────────────────────
  // Fires on: SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT, PASSWORD_RECOVERY
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT') {
      set({ user: null, token: null });
      return;
    }

    if (session) {
      // TOKEN_REFRESHED — update token in store (no need to re-fetch profile)
      set(s => ({ token: session.access_token, user: s.user }));

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        // Keep ph_lang / ph_theme cookies in sync with user settings
        const { user } = get();
        if (user?.settings?.language) {
          setCookie(COOKIE_NAMES.LANGUAGE, user.settings.language, {
            days: COOKIE_EXPIRY.PREFERENCES,
          });
        }
        if (user?.settings?.theme) {
          setCookie(COOKIE_NAMES.THEME, user.settings.theme, {
            days: COOKIE_EXPIRY.PREFERENCES,
          });
        }
      }
    }
  });

  return {
    user:      null,
    token:     null,
    isLoading: true,
    error:     null,

    checkUsername: async (username) => supabaseCheckUsername(username),

    register: async (email, password, name, username) => {
      set({ isLoading: true, error: null });
      const nameParts  = name.split(' ');
      const firstName  = nameParts[0] ?? '';
      const lastName   = nameParts.slice(1).join(' ') || '';

      const r = await supabaseRegister(email, password, name, { firstName, lastName, username });

      if (r.success && r.data) {
        set({ user: r.data.user, token: r.data.accessToken, isLoading: false });
        return true;
      }
      set({ error: r.error, isLoading: false });
      return false;
    },

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      const r = await supabaseLogin(email, password);

      if (r.success && r.data) {
        set({ user: r.data.user, token: r.data.accessToken, isLoading: false });

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
      await supabaseLogout();
      deleteCookie(COOKIE_NAMES.AUTH);
      clearActivityCookies();
      set({ user: null, token: null });
    },

    /**
     * Called once on app mount to restore session.
     * Supabase reads the stored session from localStorage and validates it.
     * If the access token is expired, it silently refreshes via the refresh token.
     */
    checkAuth: async () => {
      set({ isLoading: true });
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          set({ isLoading: false });
          return;
        }

        const user = await supabaseGetCurrentUser();
        if (user) {
          set({ user, token: session.access_token, isLoading: false });
        } else {
          await supabase.auth.signOut();
          set({ isLoading: false });
        }
      } catch {
        set({ isLoading: false });
      }
    },

    clearError: () => set({ error: null }),

    /**
     * Password reset flow:
     *  Step 1 (email form) → call with just email, newPassword = ''
     *    → Supabase sends a reset link to the user's email
     *  Step 2 (user clicks link → lands on /reset-password with token in URL)
     *    → call with email = '', newPassword = 'newPass'
     *    → Supabase verifies the token and updates the password
     */
    resetPassword: async (email, newPassword) => {
      if (!newPassword) {
        // Step 1: send reset email
        const r = await supabaseSendPasswordReset(email);
        if (!r.success) { set({ error: r.error }); return false; }
        return true;
      }
      // Step 2: set new password (called after user lands on the reset URL)
      const r = await supabaseUpdatePassword(newPassword);
      if (!r.success) { set({ error: r.error }); return false; }
      return true;
    },

    updateProfile: async (data) => {
      const { user } = get();
      if (!user) return;
      const r = await supabaseUpdateProfile(user.id, data);
      if (r.success && r.data) set({ user: r.data });
    },

    updateSettings: async (settings) => {
      const { user } = get();
      if (!user) return;
      const r = await supabaseUpdateSettings(user.id, settings);
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
      const { user } = get();
      if (!user) return;
      const r = await supabaseUpdateProgress(user.id, p);
      if (r.success && r.data) {
        set(s => ({ user: s.user ? { ...s.user, progress: r.data! } : null }));
      }
    },

    refreshUser: async () => {
      const { user } = get();
      if (!user) return;
      const fresh = await supabaseGetCurrentUser();
      if (fresh) set({ user: fresh });
    },
  };
});
