import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { UiLang } from '@/i18n';
import { cn } from '@/utils/cn';

interface LanguageSwitcherProps {
  /** 'compact' shows a small pill, 'full' shows a wider button with labels */
  variant?: 'compact' | 'full';
  className?: string;
}

export function LanguageSwitcher({ variant = 'compact', className }: LanguageSwitcherProps) {
  const { uiLang, setUiLang } = useTranslation();
  const { lang } = useParams<{ lang?: string }>();
  const rawNavigate = useNavigate();
  const { pathname } = useLocation();

  const switchLang = (newLang: UiLang) => {
    setUiLang(newLang);
    // Replace current lang prefix with new one, keeping the rest of the path
    const pathWithoutLang = pathname.replace(`/${lang}`, '') || '';
    rawNavigate(`/${newLang}${pathWithoutLang}`, { replace: true });
  };

  if (variant === 'full') {
    return (
      <div className={cn('flex items-center bg-surface-100 rounded-xl p-1 gap-1', className)}>
        <button
          onClick={() => switchLang('ar')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
            uiLang === 'ar'
              ? 'bg-white text-surface-900 shadow-sm'
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
              ? 'bg-white text-surface-900 shadow-sm'
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
              ? 'bg-white text-surface-900 shadow-sm'
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
