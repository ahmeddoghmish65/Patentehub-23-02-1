import { createContext, useContext, useState, useEffect, useCallback, createElement } from 'react';
import type { ReactNode } from 'react';
import arDict from './ar.json';
import itDict from './it.json';

export type UiLang = 'ar' | 'it';
export type ContentLang = 'ar' | 'it' | 'both';

interface I18nContextValue {
  uiLang: UiLang;
  setUiLang: (lang: UiLang) => void;
  contentLang: ContentLang;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextValue>({
  uiLang: 'ar',
  setUiLang: () => {},
  contentLang: 'both',
  t: (key) => key,
  dir: 'rtl',
});

const STORAGE_KEY = 'ph_ui_lang';
const CONTENT_LANG_KEY = 'ph_content_lang';

type NestedDict = { [k: string]: string | NestedDict };

function getNestedValue(obj: NestedDict, key: string): string {
  const parts = key.split('.');
  let current: string | NestedDict = obj;
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return key;
    current = (current as NestedDict)[part];
    if (current === undefined) return key;
  }
  return typeof current === 'string' ? current : key;
}

/** Scans navigator.languages (then navigator.language) for the first supported lang. */
function detectBrowserLang(): UiLang | null {
  const langs: readonly string[] =
    navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const lang of langs) {
    if (!lang) continue;
    const prefix = lang.split('-')[0].toLowerCase();
    if (prefix === 'it') return 'it';
    if (prefix === 'ar') return 'ar';
  }
  return null;
}

function getInitialLang(): UiLang {
  // Priority 1: manual selection saved by the user
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'it' || stored === 'ar') return stored;
  // Priority 2: browser preferred language
  const browserLang = detectBrowserLang();
  if (browserLang) return browserLang;
  // Priority 3: application default
  return 'ar';
}

/**
 * Derives the initial content language from the browser language.
 * Italian browser → 'it' (Italian content only)
 * Arabic browser  → 'both' (Arabic + Italian content)
 * Other/default   → 'both'
 */
function getInitialContentLang(): ContentLang {
  const stored = localStorage.getItem(CONTENT_LANG_KEY);
  if (stored === 'ar' || stored === 'it' || stored === 'both') return stored;
  const browserLang = detectBrowserLang();
  if (browserLang === 'it') return 'it';
  return 'both';
}

function applyDocumentLang(lang: UiLang) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [uiLang, setUiLangState] = useState<UiLang>(getInitialLang);
  const [contentLang] = useState<ContentLang>(getInitialContentLang);

  useEffect(() => {
    applyDocumentLang(uiLang);
  }, [uiLang]);

  const setUiLang = useCallback((lang: UiLang) => {
    setUiLangState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    // Sync content language with UI language change when no user preference is stored
    if (!localStorage.getItem(CONTENT_LANG_KEY)) {
      const derived: ContentLang = lang === 'it' ? 'it' : 'both';
      localStorage.setItem(CONTENT_LANG_KEY, derived);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const dict = uiLang === 'it' ? (itDict as NestedDict) : (arDict as NestedDict);
    const val = getNestedValue(dict, key);
    // Fallback to Arabic if key missing in Italian
    if (val === key && uiLang === 'it') {
      return getNestedValue(arDict as NestedDict, key);
    }
    return val;
  }, [uiLang]);

  const dir: 'rtl' | 'ltr' = uiLang === 'ar' ? 'rtl' : 'ltr';

  return createElement(
    I18nContext.Provider,
    { value: { uiLang, setUiLang, contentLang, t, dir } },
    children,
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
