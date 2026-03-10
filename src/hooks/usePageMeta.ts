/**
 * usePageMeta — dynamically updates document <head> meta tags per page.
 *
 * Because this is a client-rendered SPA, Googlebot (which executes JavaScript)
 * will pick up these tags after hydration. Social-media crawlers that don't run
 * JS will fall back to the base meta tags already present in index.html.
 */
import { useEffect, useRef } from 'react';

export interface PageMetaOptions {
  /** Page title — ` | Patente Hub` is appended automatically unless already present. */
  title: string;
  description?: string;
  /** Absolute canonical URL. Falls back to current pathname on patentehub.com. */
  canonical?: string;
  /** Overrides the Open Graph / Twitter title (defaults to `title`). */
  ogTitle?: string;
  ogDescription?: string;
  /** Absolute URL to the OG share image. */
  ogImage?: string;
  /** Set true for auth-only pages to prevent indexing. */
  noIndex?: boolean;
  /** One or more JSON-LD schema.org objects injected as <script> tags. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const BASE_URL = 'https://patentehub.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Patente Hub';

// ─── helpers ─────────────────────────────────────────────────────────────────

function setMetaName(name: string, content: string) {
  let el = document.querySelector(`meta[name="${CSS.escape(name)}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setMetaProp(property: string, content: string) {
  let el = document.querySelector(`meta[property="${CSS.escape(property)}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(url: string) {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function injectJsonLd(schemas: Record<string, unknown>[]) {
  // Remove previously injected dynamic schemas
  document.querySelectorAll('script[data-ph-seo]').forEach(s => s.remove());
  schemas.forEach(schema => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-ph-seo', 'true');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
}

// ─── hook ────────────────────────────────────────────────────────────────────

export function usePageMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  jsonLd,
}: PageMetaOptions): void {
  const prevTitle = useRef(document.title);

  useEffect(() => {
    const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = canonical ?? `${BASE_URL}${window.location.pathname}`;
    const resolvedOgTitle = ogTitle ?? fullTitle;
    const resolvedOgDesc = ogDescription ?? description ?? '';

    // ── <title> ──────────────────────────────────────────────────────────────
    document.title = fullTitle;

    // ── name meta ────────────────────────────────────────────────────────────
    setMetaName('title', fullTitle);
    if (description) setMetaName('description', description);
    setMetaName('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // ── Open Graph ───────────────────────────────────────────────────────────
    setMetaProp('og:title', resolvedOgTitle);
    setMetaProp('og:description', resolvedOgDesc);
    setMetaProp('og:image', ogImage);
    setMetaProp('og:url', canonicalUrl);
    setMetaProp('og:site_name', SITE_NAME);

    // ── Twitter Card ─────────────────────────────────────────────────────────
    setMetaName('twitter:title', resolvedOgTitle);
    setMetaName('twitter:description', resolvedOgDesc);
    setMetaName('twitter:image', ogImage);

    // ── Canonical ────────────────────────────────────────────────────────────
    setCanonical(canonicalUrl);

    // ── JSON-LD ──────────────────────────────────────────────────────────────
    if (jsonLd) {
      injectJsonLd(Array.isArray(jsonLd) ? jsonLd : [jsonLd]);
    } else {
      document.querySelectorAll('script[data-ph-seo]').forEach(s => s.remove());
    }

    // ── cleanup: restore previous title on unmount ───────────────────────────
    const saved = prevTitle.current;
    return () => {
      document.title = saved;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, canonical, ogTitle, ogDescription, ogImage, noIndex]);
}
