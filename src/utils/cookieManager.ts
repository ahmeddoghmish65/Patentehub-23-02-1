/**
 * Patente Hub — Cookie Manager
 *
 * Centralises all browser-cookie operations with security defaults.
 *
 * Security note: This is a fully client-side SPA; there is no server that can
 * set HttpOnly cookies.  All cookies written here are JavaScript-readable.
 * We compensate with:
 *   • SameSite=Lax  — prevents CSRF from cross-site requests
 *   • Secure         — automatically enabled on HTTPS origins
 *   • Short expiries — minimise the window for token theft
 *   • URI-encoding   — prevents value injection via special characters
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CookieOptions {
  /**
   * Expiry in days from now.
   * Omit (or pass undefined) for a session cookie that expires when the
   * browser is closed.
   */
  days?: number;
  /** URL path the cookie is valid for.  Default: '/' */
  path?: string;
  /**
   * Require HTTPS.
   * Defaults to `true` when the page is served over https://, `false` on
   * http:// (e.g. localhost during development).
   */
  secure?: boolean;
  /** SameSite policy.  Default: 'Lax' */
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/** All consent levels understood by the app. */
export type ConsentLevel = 'all' | 'essential';

// ---------------------------------------------------------------------------
// Cookie name registry — single source of truth
// ---------------------------------------------------------------------------

export const COOKIE_NAMES = {
  /** Auth session token (essential) */
  AUTH: 'ph_auth',
  /** Language preference: 'ar' | 'it' | 'both' (essential) */
  LANGUAGE: 'ph_lang',
  /** UI theme: 'light' | 'dark' (essential) */
  THEME: 'ph_theme',
  /** GDPR consent level: 'all' | 'essential' (essential) */
  CONSENT: 'ph_consent',
  /** Last visited page slug (non-essential) */
  LAST_PAGE: 'ph_last_page',
  /** Last quiz lessonId (non-essential) */
  LAST_QUIZ: 'ph_last_quiz',
  /** Last lesson opened (non-essential) */
  LAST_LESSON: 'ph_last_lesson',
} as const;

/** Canonical expiry durations in days. */
export const COOKIE_EXPIRY = {
  /** 30-day rolling window for the auth session */
  SESSION: 30,
  /** 1 year for stable user preferences */
  PREFERENCES: 365,
  /** 1 year for the consent record */
  CONSENT: 365,
  /** 7 days for "pick up where you left off" activity data */
  ACTIVITY: 7,
} as const;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** True when the page is served over HTTPS. */
const isSecureOrigin = (): boolean => window.location.protocol === 'https:';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Write (or overwrite) a cookie.
 *
 * Values are URI-encoded so any character is safe to store.
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  const {
    days,
    path = '/',
    secure = isSecureOrigin(),
    sameSite = 'Lax',
  } = options;

  // Sanitise — URI-encode both name and value
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(String(value));

  let cookie = `${encodedName}=${encodedValue}`;

  if (days !== undefined) {
    const expiry = new Date();
    expiry.setTime(expiry.getTime() + days * 24 * 60 * 60 * 1000);
    cookie += `; expires=${expiry.toUTCString()}`;
  }

  cookie += `; path=${path}`;
  cookie += `; SameSite=${sameSite}`;
  if (secure) cookie += '; Secure';

  document.cookie = cookie;
}

/**
 * Read a cookie by name.
 * Returns `null` when no matching cookie is found.
 */
export function getCookie(name: string): string | null {
  const encodedName = encodeURIComponent(name);
  for (const entry of document.cookie.split(';')) {
    const [rawKey, ...rest] = entry.trim().split('=');
    if (rawKey === encodedName) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

/**
 * Delete a cookie by name (sets expiry to the Unix epoch).
 */
export function deleteCookie(name: string, path = '/'): void {
  const encodedName = encodeURIComponent(name);
  // Set expiry in the past on both possible paths to ensure removal
  document.cookie = `${encodedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
}

/**
 * Returns `true` when a cookie with the given name exists (regardless of value).
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

// ---------------------------------------------------------------------------
// Consent helpers
// ---------------------------------------------------------------------------

/**
 * Return the stored consent level, or `null` when consent has never been recorded.
 */
export function getConsentLevel(): ConsentLevel | null {
  const v = getCookie(COOKIE_NAMES.CONSENT);
  if (v === 'all' || v === 'essential') return v;
  return null;
}

/**
 * True when the user explicitly accepted all cookies (not just essential ones).
 */
export function hasFullConsent(): boolean {
  return getConsentLevel() === 'all';
}

// ---------------------------------------------------------------------------
// Preference helpers (read-only — written elsewhere when settings change)
// ---------------------------------------------------------------------------

/** Return the persisted language preference, or `null`. */
export function getSavedLanguage(): 'ar' | 'it' | 'both' | null {
  const v = getCookie(COOKIE_NAMES.LANGUAGE);
  if (v === 'ar' || v === 'it' || v === 'both') return v;
  return null;
}

/** Return the persisted theme preference, or `null`. */
export function getSavedTheme(): 'light' | 'dark' | null {
  const v = getCookie(COOKIE_NAMES.THEME);
  if (v === 'light' || v === 'dark') return v;
  return null;
}

// ---------------------------------------------------------------------------
// Activity helpers (non-essential — only set after full consent)
// ---------------------------------------------------------------------------

/**
 * Persist the last visited page slug.
 * No-op unless the user has given full consent.
 */
export function saveLastPage(page: string): void {
  if (!hasFullConsent()) return;
  // Only persist safe, data-independent pages
  const safePagesForResume = [
    'dashboard', 'lessons', 'signs', 'dictionary',
    'training', 'community', 'profile',
    'contact', 'privacy-policy', 'terms-of-service',
  ];
  if (safePagesForResume.includes(page)) {
    setCookie(COOKIE_NAMES.LAST_PAGE, page, { days: COOKIE_EXPIRY.ACTIVITY });
  }
}

/**
 * Persist the last quiz lesson ID.
 * No-op unless the user has given full consent.
 */
export function saveLastQuiz(lessonId: string): void {
  if (!hasFullConsent()) return;
  setCookie(COOKIE_NAMES.LAST_QUIZ, lessonId, { days: COOKIE_EXPIRY.ACTIVITY });
}

/**
 * Persist the last opened lesson ID.
 * No-op unless the user has given full consent.
 */
export function saveLastLesson(lessonId: string): void {
  if (!hasFullConsent()) return;
  setCookie(COOKIE_NAMES.LAST_LESSON, lessonId, { days: COOKIE_EXPIRY.ACTIVITY });
}

/**
 * Clear all non-essential activity cookies (called on 'essential only' consent
 * or on logout).
 */
export function clearActivityCookies(): void {
  deleteCookie(COOKIE_NAMES.LAST_PAGE);
  deleteCookie(COOKIE_NAMES.LAST_QUIZ);
  deleteCookie(COOKIE_NAMES.LAST_LESSON);
}
