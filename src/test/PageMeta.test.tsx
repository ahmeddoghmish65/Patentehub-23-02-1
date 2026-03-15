/**
 * Integration tests for <PageMeta> component.
 * Verifies that react-helmet-async correctly sets document head meta tags.
 */
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, beforeEach } from 'vitest';
import { PageMeta } from '@/shared/hooks/usePageMeta';

function renderWithHelmet(ui: React.ReactElement) {
  return render(<HelmetProvider>{ui}</HelmetProvider>);
}

describe('PageMeta', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('sets the page title with site name appended', () => {
    renderWithHelmet(<PageMeta title="Quiz Patente B" />);
    expect(document.title).toBe('Quiz Patente B | Patente Hub');
  });

  it('does not duplicate site name if already present in title', () => {
    renderWithHelmet(<PageMeta title="Patente Hub – Home" />);
    expect(document.title).toBe('Patente Hub – Home');
  });

  it('sets description meta tag', () => {
    renderWithHelmet(
      <PageMeta title="Test" description="Studia per l'esame con quiz gratuiti." />,
    );
    const desc = document.querySelector('meta[name="description"]');
    expect(desc?.getAttribute('content')).toBe("Studia per l'esame con quiz gratuiti.");
  });

  it('sets Open Graph title and description', () => {
    renderWithHelmet(
      <PageMeta title="Quiz" description="Descrizione" ogTitle="OG Title" ogDescription="OG Desc" />,
    );
    expect(document.querySelector('meta[property="og:title"]')?.getAttribute('content')).toBe(
      'OG Title',
    );
    expect(document.querySelector('meta[property="og:description"]')?.getAttribute('content')).toBe(
      'OG Desc',
    );
  });

  it('sets og:type to website', () => {
    renderWithHelmet(<PageMeta title="Test" />);
    expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe(
      'website',
    );
  });

  it('sets Twitter Card meta tags', () => {
    renderWithHelmet(<PageMeta title="Test" description="Twitter Desc" />);
    expect(document.querySelector('meta[name="twitter:card"]')?.getAttribute('content')).toBe(
      'summary_large_image',
    );
  });

  it('sets noindex robots tag when noIndex=true', () => {
    renderWithHelmet(<PageMeta title="Auth" noIndex />);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'noindex, nofollow',
    );
  });

  it('sets index robots tag by default', () => {
    renderWithHelmet(<PageMeta title="Public Page" />);
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe(
      'index, follow',
    );
  });

  it('injects JSON-LD structured data script tags', () => {
    const schema = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Patente Hub' };
    renderWithHelmet(<PageMeta title="Test" jsonLd={schema} />);
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThan(0);
    const parsed = JSON.parse(scripts[0].textContent ?? '{}');
    expect(parsed['@type']).toBe('WebSite');
  });

  it('injects multiple JSON-LD schemas when array is provided', () => {
    const schemas = [
      { '@context': 'https://schema.org', '@type': 'WebSite' },
      { '@context': 'https://schema.org', '@type': 'Organization' },
    ];
    renderWithHelmet(<PageMeta title="Test" jsonLd={schemas} />);
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(2);
  });

  it('sets canonical link to provided canonical URL', () => {
    const canonical = 'https://patentehub.com/it/quiz-patente-b';
    renderWithHelmet(<PageMeta title="Test" canonical={canonical} />);
    const link = document.querySelector('link[rel="canonical"]');
    expect(link?.getAttribute('href')).toBe(canonical);
  });
});
