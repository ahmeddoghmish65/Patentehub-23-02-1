/**
 * Patente Hub — Monitoring & Error Tracking Service
 *
 * Integrates two providers:
 *   • Sentry     — error tracking, performance monitoring (no consent required)
 *   • LogRocket  — session replay & logging (requires full cookie consent)
 *
 * Sentry is initialised early (before React renders) so no errors are missed.
 * LogRocket is gated behind consent because it records user sessions (PII).
 */

import * as Sentry from '@sentry/react';
import LogRocket from 'logrocket';
import { hasFullConsent } from '@/shared/utils/cookieManager';

// ─── Environment variables ────────────────────────────────────────────────────
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const SENTRY_ENVIRONMENT = (import.meta.env.VITE_SENTRY_ENVIRONMENT as string | undefined) ?? 'production';
const LOGROCKET_APP_ID = import.meta.env.VITE_LOGROCKET_APP_ID as string | undefined;

// ─── State ────────────────────────────────────────────────────────────────────
let sentryReady = false;
let logRocketReady = false;

// ─── Sentry ───────────────────────────────────────────────────────────────────
/**
 * Initialise Sentry error & performance monitoring.
 * Called once at app startup — does NOT require cookie consent.
 * Safe to call multiple times; initialises only once.
 */
export function initSentry(): void {
  if (!SENTRY_DSN || sentryReady) return;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: SENTRY_ENVIRONMENT,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text and inputs by default to protect user privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    // Performance monitoring: capture 10% of transactions in production
    tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.1,
    // Session replay: capture 1% of sessions, 100% of sessions with errors
    replaysSessionSampleRate: 0.01,
    replaysOnErrorSampleRate: 1.0,
    // Do not send errors in development to avoid noise
    enabled: !import.meta.env.DEV,
    beforeSend(event) {
      // Strip any auth tokens from breadcrumbs/request data
      if (event.request?.cookies) {
        event.request.cookies = '[Filtered]';
      }
      return event;
    },
  });

  sentryReady = true;
}

// ─── LogRocket ────────────────────────────────────────────────────────────────
/**
 * Initialise LogRocket session replay.
 * Requires full cookie consent (records user sessions).
 * Safe to call multiple times; initialises only once.
 */
export function initLogRocket(): void {
  if (!LOGROCKET_APP_ID || logRocketReady || !hasFullConsent()) return;

  LogRocket.init(LOGROCKET_APP_ID, {
    // Sanitise sensitive fields in network requests and DOM
    network: {
      requestSanitizer: request => {
        // Strip Authorization headers
        if (request.headers['Authorization']) {
          request.headers['Authorization'] = '[Filtered]';
        }
        return request;
      },
      responseSanitizer: response => response,
    },
    dom: {
      // Mask password and card fields
      inputSanitizer: true,
    },
  });

  // Link LogRocket sessions to Sentry errors when both are active
  if (sentryReady) {
    LogRocket.getSessionURL(sessionURL => {
      Sentry.getCurrentScope().setExtra('logRocketSession', sessionURL);
    });
  }

  logRocketReady = true;
}

// ─── Public helpers ───────────────────────────────────────────────────────────

/**
 * Identify the current user in Sentry and LogRocket (call after login).
 * @param userId  Supabase user.id (UUID — not PII by itself)
 * @param traits  Optional safe traits (avoid email/name in production)
 */
export function identifyMonitoringUser(
  userId: string,
  traits?: { name?: string; email?: string; [key: string]: unknown },
): void {
  if (sentryReady) {
    Sentry.setUser({ id: userId, ...traits });
  }
  if (logRocketReady) {
    LogRocket.identify(userId, traits);
  }
}

/**
 * Clear the user identity (call on logout).
 */
export function resetMonitoringUser(): void {
  if (sentryReady) {
    Sentry.setUser(null);
  }
}

/**
 * Manually capture an exception in Sentry.
 * Useful for caught errors that you still want to track.
 */
export function captureException(error: unknown, context?: Record<string, unknown>): void {
  if (!sentryReady) {
    console.error('[Monitoring]', error);
    return;
  }
  Sentry.withScope(scope => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => scope.setExtra(key, value));
    }
    Sentry.captureException(error);
  });
}

export { Sentry };
