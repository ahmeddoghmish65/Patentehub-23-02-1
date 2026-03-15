import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { UiLang } from '@/i18n';
import { cn } from '@/shared/utils/cn';

interface LanguageSwitcherProps {
  /** 'compact' shows a small pill, 'full' shows a wider button with labels, 'dropdown' shows a dropdown menu */
  variant?: 'compact' | 'full' | 'dropdown';
  className?: string;
}

const LANGUAGES: { code: UiLang; label: string; nativeLabel: string; flag: string }[] = [
  { code: 'ar', label: 'AR', nativeLabel: 'العربية', flag: '🇸🇦' },
  { code: 'it', label: 'IT', nativeLabel: 'Italiano', flag: '🇮🇹' },
  { code: 'en', label: 'EN', nativeLabel: 'English', flag: '🇬🇧' },
];

export function LanguageSwitcher({ variant = 'compact', className }: LanguageSwitcherProps) {
  const { uiLang, setUiLang } = useTranslation();
  const { lang } = useParams<{ lang?: string }>();
  const rawNavigate = useNavigate();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLang = (newLang: UiLang) => {
    setUiLang(newLang);
    const pathWithoutLang = pathname.replace(`/${lang}`, '') || '';
    rawNavigate(`/${newLang}${pathWithoutLang}`, { replace: true });
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (variant === 'dropdown') {
    const currentLang = LANGUAGES.find((l) => l.code === uiLang) ?? LANGUAGES[0];

    return (
      <div ref={dropdownRef} className={cn('relative', className)}>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold transition-all',
            'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200',
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{currentLang.flag}</span>
          <span className="font-bold text-blue-600">{currentLang.label}</span>
          <svg
            className={cn('w-3.5 h-3.5 text-surface-500 transition-transform duration-200', isOpen && 'rotate-180')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div
            className={cn(
              'absolute z-50 mt-1.5 min-w-[130px] rounded-xl border border-surface-200 bg-white dark:bg-surface-100 shadow-lg py-1',
              uiLang === 'ar' ? 'left-0' : 'right-0',
            )}
            role="listbox"
          >
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => switchLang(language.code)}
                role="option"
                aria-selected={uiLang === language.code}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                  uiLang === language.code
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-surface-700 hover:bg-surface-50',
                )}
              >
                <span className="text-base">{language.flag}</span>
                <span className="font-medium">{language.nativeLabel}</span>
                {uiLang === language.code && (
                  <svg className="w-3.5 h-3.5 ms-auto text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={cn('flex items-center bg-surface-100 rounded-xl p-1 gap-1', className)}>
        <button
          onClick={() => switchLang('ar')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            uiLang === 'ar'
              ? 'bg-white dark:bg-surface-200 text-surface-900 shadow-sm'
              : 'text-surface-500 hover:text-surface-700',
          )}
          title="العربية"
        >
          <span className="text-sm leading-none">ع</span>
          <span>AR</span>
        </button>
        <button
          onClick={() => switchLang('it')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            uiLang === 'it'
              ? 'bg-white dark:bg-surface-200 text-surface-900 shadow-sm'
              : 'text-surface-500 hover:text-surface-700',
          )}
          title="Italiano"
        >
          <span>IT</span>
        </button>
        <button
          onClick={() => switchLang('en')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            uiLang === 'en'
              ? 'bg-white dark:bg-surface-200 text-surface-900 shadow-sm'
              : 'text-surface-500 hover:text-surface-700',
          )}
          title="English"
        >
          <span>EN</span>
        </button>
      </div>
    );
  }

  // Compact: cycle AR → IT → EN → AR
  const nextLang: UiLang = uiLang === 'ar' ? 'it' : uiLang === 'it' ? 'en' : 'ar';
  const nextLabel = uiLang === 'ar' ? 'IT' : uiLang === 'it' ? 'EN' : 'ع';
  const nextTitle =
    uiLang === 'ar' ? "Passa all'italiano" :
    uiLang === 'it' ? 'Switch to English' :
    'التبديل إلى العربية';

  return (
    <button
      onClick={() => switchLang(nextLang)}
      title={nextTitle}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all',
        'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200',
        className,
      )}
    >
      <span className="text-blue-600 font-extrabold">{nextLabel}</span>
    </button>
  );
}
