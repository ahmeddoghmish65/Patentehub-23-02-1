/**
 * supabase-auth.ts
 * Real backend auth layer using Supabase (PostgreSQL + JWT + Refresh Tokens).
 * Replaces the client-side IndexedDB auth in db/api.ts.
 *
 * Supabase automatically:
 *  - Issues JWT access tokens (default 1-hour expiry)
 *  - Issues refresh tokens (default 1-week, auto-renewed)
 *  - Stores session in localStorage and refreshes silently
 *  - Fires onAuthStateChange on TOKEN_REFRESHED, SIGNED_IN, SIGNED_OUT
 */

import { supabase } from './supabase';
import type { User, UserProgress, UserSettings } from '@/types';
import type { ProfileRow, UserProgressJson, UserSettingsJson } from './supabase.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Map a DB profile row to the app's User type (no password field needed). */
function profileToUser(row: ProfileRow): Omit<User, 'password'> {
  return {
    id:               row.id,
    email:            row.email,
    name:             row.name ?? '',
    firstName:        row.first_name ?? '',
    lastName:         row.last_name ?? '',
    username:         row.username ?? '',
    avatar:           row.avatar,
    bio:              row.bio,
    role:             row.role as User['role'],
    permissions:      row.permissions as string[],
    isBanned:         row.is_banned,
    verified:         row.verified,
    following:        row.following as string[],
    profileComplete:  row.profile_complete,
    birthDate:        row.birth_date,
    country:          row.country,
    province:         row.province,
    gender:           row.gender,
    phone:            row.phone,
    phoneCode:        row.phone_code,
    italianLevel:     row.italian_level,
    privacyHideStats: row.privacy_hide_stats,
    createdAt:        row.created_at,
    lastLogin:        row.last_login,
    progress:         row.progress as unknown as UserProgress,
    settings:         row.settings as unknown as UserSettings,
  };
}

interface AuthResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  /** True when Supabase requires the user to confirm their email before signing in */
  pendingEmailConfirmation?: boolean;
}

// ── Timeout helper ────────────────────────────────────────────────────────────

/** Wraps a promise with a maximum wait time (ms). Rejects with Error('timeout'). */
function withTimeout<T>(promise: Promise<T>, ms = 12000): Promise<T> {
  const t = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), ms),
  );
  return Promise.race([promise, t]);
}

// ── Auth API ──────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * Supabase creates the auth record; the DB trigger creates the profile row.
 */
export async function supabaseRegister(
  email: string,
  password: string,
  name: string,
  extra?: { firstName?: string; lastName?: string; username?: string },
): Promise<AuthResult<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }>> {
  let data: Awaited<ReturnType<typeof supabase.auth.signUp>>['data'];
  let error: Awaited<ReturnType<typeof supabase.auth.signUp>>['error'];
  try {
    ({ data, error } = await withTimeout(supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          firstName: extra?.firstName ?? '',
          lastName:  extra?.lastName  ?? '',
          username:  extra?.username  ?? null,
        },
      },
    })));
  } catch {
    return { success: false, error: 'انتهت مهلة الاتصال، يرجى التحقق من الإنترنت والمحاولة مجدداً' };
  }

  if (error)               return { success: false, error: error.message };
  if (!data.user)          return { success: false, error: 'فشل إنشاء الحساب' };

  // Email confirmation is required — session will be null until user confirms.
  // The account IS created; flag it so the UI can show a "check your email" state.
  if (!data.session) {
    return { success: false, pendingEmailConfirmation: true };
  }

  // Fetch the profile created by the DB trigger (with retries for race condition)
  const profile = await fetchProfileWithRetry(data.user.id);
  if (!profile) return { success: false, error: 'فشل تحميل بيانات المستخدم' };

  return {
    success: true,
    data: {
      user:         profile,
      accessToken:  data.session.access_token,
      refreshToken: data.session.refresh_token,
    },
  };
}

/**
 * Sign in with email + password.
 * Returns fresh JWT access token + refresh token from Supabase.
 */
export async function supabaseLogin(
  email: string,
  password: string,
): Promise<AuthResult<{ user: Omit<User, 'password'>; accessToken: string; refreshToken: string }>> {
  let data: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>['data'];
  let error: Awaited<ReturnType<typeof supabase.auth.signInWithPassword>>['error'];
  try {
    ({ data, error } = await withTimeout(supabase.auth.signInWithPassword({ email, password })));
  } catch {
    return { success: false, error: 'انتهت مهلة الاتصال، يرجى التحقق من الإنترنت والمحاولة مجدداً' };
  }

  if (error) {
    if (
      error.message?.toLowerCase().includes('email not confirmed') ||
      error.message?.toLowerCase().includes('email_not_confirmed')
    ) {
      return { success: false, pendingEmailConfirmation: true };
    }
    return { success: false, error: 'بريد أو كلمة مرور خاطئة' };
  }
  if (!data.session) return { success: false, error: 'فشل تسجيل الدخول' };

  // Run update_last_login and fetchProfile in parallel to save one round-trip
  const [, profile] = await Promise.all([
    supabase.rpc('update_last_login', { user_id: data.user.id }),
    fetchProfile(data.user.id),
  ]);

  if (!profile) return { success: false, error: 'فشل تحميل بيانات المستخدم' };

  if (profile.isBanned) {
    await supabase.auth.signOut();
    return { success: false, error: 'هذا الحساب محظور' };
  }

  return {
    success: true,
    data: {
      user:         profile,
      accessToken:  data.session.access_token,
      refreshToken: data.session.refresh_token,
    },
  };
}

/** Sign out the current user (invalidates session on Supabase). */
export async function supabaseLogout(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * Get current user from the active Supabase session.
 * Called on app load to restore auth state.
 * Accepts an optional userId to skip a redundant getSession() call.
 */
export async function supabaseGetCurrentUser(userId?: string): Promise<Omit<User, 'password'> | null> {
  if (userId) return fetchProfile(userId);
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  return fetchProfile(session.user.id);
}

/**
 * Reset password — Supabase sends a magic link to the email.
 * The user clicks the link → redirected back → updatePassword is called.
 */
export async function supabaseSendPasswordReset(email: string): Promise<AuthResult> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Set a new password (called after the user follows the reset link).
 * Supabase verifies the reset token in the URL automatically.
 */
export async function supabaseUpdatePassword(newPassword: string): Promise<AuthResult> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/**
 * Update display name and/or avatar URL in the profiles table.
 *
 * SECURITY FIX (VULN-014): The userId parameter is no longer trusted from
 * the caller. We derive the authenticated user's ID from the active Supabase
 * session, ensuring a user can only update their own profile. The RLS trigger
 * on the database also enforces this, but defence-in-depth is preferred.
 */
export async function supabaseUpdateProfile(
  _callerUserId: string,
  data: { name?: string; avatar?: string },
): Promise<AuthResult<Omit<User, 'password'>>> {
  // Always use the session-verified user ID, never the caller-supplied one.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'غير مصرح — الجلسة منتهية' };
  const userId = session.user.id;

  const update: Partial<{ name: string; avatar: string }> = {};
  if (data.name   !== undefined) update.name   = data.name;
  if (data.avatar !== undefined) update.avatar = data.avatar;

  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId);

  if (error) return { success: false, error: error.message };

  const profile = await fetchProfile(userId);
  if (!profile) return { success: false, error: 'فشل تحميل البيانات' };
  return { success: true, data: profile };
}

/**
 * Update app settings (language, theme, etc.) in the profiles table.
 *
 * SECURITY FIX (VULN-014): Uses session-derived userId, not caller-supplied.
 */
export async function supabaseUpdateSettings(
  _callerUserId: string,
  settings: Partial<UserSettings>,
): Promise<AuthResult<UserSettings>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'غير مصرح — الجلسة منتهية' };
  const userId = session.user.id;

  // Fetch current settings first, then merge
  const { data: row, error: fetchErr } = await supabase
    .from('profiles')
    .select('settings')
    .eq('id', userId)
    .single();

  if (fetchErr) return { success: false, error: fetchErr.message };

  const merged = { ...(row?.settings as unknown as UserSettings), ...settings };

  const { error } = await supabase
    .from('profiles')
    .update({ settings: merged as unknown as UserSettingsJson })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: merged };
}

/**
 * Update learning progress in the profiles table.
 *
 * SECURITY FIX (VULN-014): Uses session-derived userId, not caller-supplied.
 */
export async function supabaseUpdateProgress(
  _callerUserId: string,
  progress: Partial<UserProgress>,
): Promise<AuthResult<UserProgress>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { success: false, error: 'غير مصرح — الجلسة منتهية' };
  const userId = session.user.id;

  const { data: row, error: fetchErr } = await supabase
    .from('profiles')
    .select('progress')
    .eq('id', userId)
    .single();

  if (fetchErr) return { success: false, error: fetchErr.message };

  const merged = { ...(row?.progress as unknown as UserProgress), ...progress };

  const { error } = await supabase
    .from('profiles')
    .update({ progress: merged as unknown as UserProgressJson })
    .eq('id', userId);

  if (error) return { success: false, error: error.message };
  return { success: true, data: merged };
}

/** Check if a username is taken. Returns availability + up to 3 suggestions. */
export async function supabaseCheckUsername(
  username: string,
): Promise<{ available: boolean; suggestions: string[] }> {
  const { data, error } = await supabase.rpc(
    'check_username',
    { requested_username: username },
  );
  if (error) return { available: false, suggestions: [] };
  return data as { available: boolean; suggestions: string[] };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function fetchProfile(userId: string): Promise<Omit<User, 'password'> | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return profileToUser(data as unknown as ProfileRow);
}

/**
 * Fetch the profile with retries to handle the race condition where
 * the DB trigger (handle_new_user) may not have completed yet after signUp.
 */
async function fetchProfileWithRetry(
  userId: string,
  maxAttempts = 4,
  delayMs = 150,
): Promise<Omit<User, 'password'> | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const profile = await fetchProfile(userId);
    if (profile) return profile;
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return null;
}
