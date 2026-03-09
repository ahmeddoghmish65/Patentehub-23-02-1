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
  const isAr = uiLang === 'ar';

  const switchLang = (newLang: UiLang) => {
    setUiLang(newLang);
    // Replace current lang prefix with new one, keeping the rest of the path
    const pathWithoutLang = pathname.replace(`/${lang}`, '') || '';
    rawNavigate(`/${newLang}${pathWithoutLang}`, { replace: true });
  };

  const toggle = () => switchLang(isAr ? 'it' : 'ar');

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
      </div>
    );
  }

  // Compact toggle pill
  return (
    <button
      onClick={toggle}
      title={isAr ? 'Passa all\'italiano' : 'التبديل إلى العربية'}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all',
        'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200',
        className,
      )}
    >
      {isAr ? (
        <>
          <span className="text-blue-600 font-extrabold">IT</span>
        </>
      ) : (
        <>
          <span className="text-surface-700 font-extrabold">ع</span>
        </>
      )}
    </button>
  );
}
