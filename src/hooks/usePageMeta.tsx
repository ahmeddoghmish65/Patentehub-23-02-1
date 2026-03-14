/**
 * usePageMeta — manages document <head> meta tags per page via react-helmet-async.
 *
 * Export a <PageMeta> component for declarative usage in JSX.
 * The app root must be wrapped in <HelmetProvider> (see main.tsx).
 */
import { Helmet } from 'react-helmet-async';

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

/**
 * <PageMeta> — declarative SEO head manager.
 *
 * Place this as the first child in any page component to set its meta tags.
 *
 * @example
 * ```tsx
 * export function MyPage() {
 *   return (
 *     <>
 *       <PageMeta title="My Page" description="..." />
 *       <main>…</main>
 *     </>
 *   );
 * }
 * ```
 */
export function PageMeta({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  jsonLd,
}: PageMetaOptions) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl =
    canonical ?? `${BASE_URL}${typeof window !== 'undefined' ? window.location.pathname : '/'}`;
  const resolvedOgTitle = ogTitle ?? fullTitle;
  const resolvedOgDesc = ogDescription ?? description ?? '';
  const schemas: Record<string, unknown>[] = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      {description && <meta name="description" content={description} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />

      {/* Open Graph */}
      <meta property="og:title" content={resolvedOgTitle} />
      <meta property="og:description" content={resolvedOgDesc} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={resolvedOgTitle} />
      <meta name="twitter:description" content={resolvedOgDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical */}
      <link rel="canonical" href={canonicalUrl} />

      {/* JSON-LD Structured Data */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

/**
 * @deprecated Use <PageMeta> component instead.
 * Kept for backward compatibility — renders nothing, no-op.
 */
export function usePageMeta(_options: PageMetaOptions): void {
  // Deprecated: migrated to <PageMeta> component.
  // Pages that still call this hook should be updated to render <PageMeta {...props} />.
}
