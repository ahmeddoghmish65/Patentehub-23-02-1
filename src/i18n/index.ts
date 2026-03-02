import { createContext, useContext, useState, useEffect, useCallback, createElement } from 'react';
import type { ReactNode } from 'react';
import arDict from './ar.json';
import itDict from './it.json';

export type UiLang = 'ar' | 'it';

interface I18nContextValue {
  uiLang: UiLang;
  setUiLang: (lang: UiLang) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const I18nContext = createContext<I18nContextValue>({
  uiLang: 'ar',
  setUiLang: () => {},
  t: (key) => key,
  dir: 'rtl',
});

const STORAGE_KEY = 'ph_ui_lang';

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

function getInitialLang(): UiLang {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'it' || stored === 'ar') return stored;
  // Browser language auto-detection
  const browserLang = navigator.language?.split('-')[0];
  if (browserLang === 'it') return 'it';
  return 'ar'; // default
}

function applyDocumentLang(lang: UiLang) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('dir', dir);
  document.documentElement.setAttribute('lang', lang);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [uiLang, setUiLangState] = useState<UiLang>(getInitialLang);

  useEffect(() => {
    applyDocumentLang(uiLang);
  }, [uiLang]);

  const setUiLang = useCallback((lang: UiLang) => {
    setUiLangState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
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
    { value: { uiLang, setUiLang, t, dir } },
    children,
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
