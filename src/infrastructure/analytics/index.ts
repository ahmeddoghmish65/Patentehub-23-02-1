/**
 * Patente Hub — Analytics Service
 *
 * Supports three providers simultaneously:
 *   • Google Analytics 4 (GA4) — via gtag.js
 *   • PostHog                  — via posthog-js (npm)
 *   • Plausible                — via script injection
 *
 * All providers are gated behind full cookie consent.
 * Call `initAnalytics()` on app start and again whenever consent changes to 'all'.
 * Call `trackPageView(path)` on every route change.
 * Call `trackEvent(name, props)` for custom events.
 */

import posthog from 'posthog-js';
import { hasFullConsent } from '@/shared/utils/cookieManager';

// ─── Environment variables ────────────────────────────────────────────────────
const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com';
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN as string | undefined;

// ─── State ────────────────────────────────────────────────────────────────────
let gaReady = false;
let posthogReady = false;
let plausibleReady = false;

// ─── Type augmentation ────────────────────────────────────────────────────────
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
  }
}

// ─── Google Analytics 4 ───────────────────────────────────────────────────────
function initGA(): void {
  if (!GA_ID || gaReady) return;

  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params
  window.gtag = function gtag() { window.dataLayer!.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, {
    send_page_view: false, // we fire page_view manually per route
    anonymize_ip: true,
  });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  gaReady = true;
}

// ─── PostHog ──────────────────────────────────────────────────────────────────
function initPostHog(): void {
  if (!POSTHOG_KEY || posthogReady) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false,       // only capture what we explicitly track
    capture_pageview: false,  // we fire $pageview manually per route
    persistence: 'cookie',
    loaded: () => {
      posthogReady = true;
    },
  });
}

// ─── Plausible ────────────────────────────────────────────────────────────────
function initPlausible(): void {
  if (!PLAUSIBLE_DOMAIN || plausibleReady) return;

  const script = document.createElement('script');
  script.defer = true;
  script.src = 'https://plausible.io/js/script.js';
  script.setAttribute('data-domain', PLAUSIBLE_DOMAIN);
  document.head.appendChild(script);

  plausibleReady = true;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialise all configured analytics providers.
 * Safe to call multiple times — providers initialise only once.
 * Must be called after the user gives full cookie consent.
 */
export function initAnalytics(): void {
  if (!hasFullConsent()) return;
  initGA();
  initPostHog();
  initPlausible();
}

/**
 * Fire a page-view event on every route change.
 * No-op when providers are not yet initialised or consent is missing.
 */
export function trackPageView(path: string, title?: string): void {
  if (!hasFullConsent()) return;

  const location = `https://patentehub.com${path}`;
  const pageTitle = title ?? document.title;

  if (gaReady && window.gtag) {
    window.gtag('event', 'page_view', {
      page_location: location,
      page_title: pageTitle,
    });
  }

  if (posthogReady) {
    posthog.capture('$pageview', { $current_url: window.location.href });
  }

  if (plausibleReady && window.plausible) {
    window.plausible('pageview');
  }
}

/**
 * Track a custom event across all initialised providers.
 * @param name  Event name (e.g. 'quiz_started', 'register_click')
 * @param props Optional properties (e.g. { topic: 'segnali' })
 */
export function trackEvent(name: string, props?: Record<string, unknown>): void {
  if (!hasFullConsent()) return;

  if (gaReady && window.gtag) {
    window.gtag('event', name, props);
  }

  if (posthogReady) {
    posthog.capture(name, props);
  }

  if (plausibleReady && window.plausible) {
    window.plausible(name, props ? { props: props as Record<string, string> } : undefined);
  }
}

/**
 * Identify the current user in PostHog (call after successful login).
 * @param userId   Unique user identifier (Supabase user.id)
 * @param traits   Optional profile traits (avoid PII in production)
 */
export function identifyUser(userId: string, traits?: Record<string, unknown>): void {
  if (!hasFullConsent() || !posthogReady) return;
  posthog.identify(userId, traits);
}

/**
 * Reset the PostHog identity (call on logout).
 */
export function resetAnalyticsIdentity(): void {
  if (posthogReady) posthog.reset();
}
