import { Outlet, useLocation, useParams } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/store';
import { Icon } from '@/shared/ui/Icon';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import { PROFILE_GATED_PAGES } from '@/shared/constants';
import { useState, useCallback, useEffect } from 'react';
import { getConsentLevel, type ConsentLevel } from '@/shared/utils/cookieManager';
import { initAnalytics } from '@/infrastructure/analytics';
import { ROUTES } from '@/shared/constants';
import { useLocaleNavigate } from '@/shared/hooks/useLocaleNavigate';
import { useFocusMode } from '@/features/focus-mode';

export function AppLayout() {
  const { user } = useAuthStore();
  const hideBottomNav = useUIStore(s => s.hideBottomNav);
  const { isActive: focusActive, exit: exitFocus } = useFocusMode();
  const { dir } = useTranslation();
  const { pathname } = useLocation();
  const { lang } = useParams<{ lang?: string }>();
  const { navigate } = useLocaleNavigate();

  // Scroll to top on route change
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  // Cookie consent
  const [consentLevel, setConsentLevel] = useState<ConsentLevel | null>(() => getConsentLevel());
  const showConsentBanner = consentLevel === null;

  const handleConsent = useCallback((level: ConsentLevel) => {
    setConsentLevel(level);
    if (level === 'all') initAnalytics();
  }, []);

  if (!user) return null;

  // Direction-aware sidebar positioning
  const mainMarginClass = dir === 'rtl' ? 'lg:mr-72' : 'lg:ml-72';

  // Strip /:lang prefix from pathname before checking gated pages
  const pathWithoutLang = pathname.replace(`/${lang ?? 'ar'}`, '') || '/';

  // Profile completion gate — block access to learning pages
  const needsProfileComplete =
    !user.profileComplete &&
    user.progress.totalQuizzes >= 1 &&
    PROFILE_GATED_PAGES.has(pathWithoutLang);

  if (needsProfileComplete) {
    return (
      <div className="min-h-screen bg-surface-50">
        <Sidebar />
        <main className={cn('pb-20 lg:pb-0', mainMarginClass)}>
          <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            <ProfileGate onNavigate={(path) => navigate(path)} />
          </div>
        </main>
        <BottomNav />
        {showConsentBanner && <CookieConsentBanner onConsent={handleConsent} />}
      </div>
    );
  }

  // ─── Focus Mode Layout ─────────────────────────────────────────────────────
  // When focus mode is active: full-screen, no sidebar/bottom-nav, centred
  if (focusActive) {
    return (
      <div className="min-h-screen bg-surface-50 transition-colors duration-200">
        {/* Minimal focus mode header */}
        <header className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-4 py-3 bg-surface-50/90 backdrop-blur-sm border-b border-surface-100 transition-colors duration-200">
          {/* Logo text */}
          <div className="flex items-center gap-2" dir="ltr">
            <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
              <Icon name="directions_car" size={16} className="text-white" filled />
            </div>
            <span className="text-sm font-bold text-primary-500">Patente Hub</span>
          </div>

          {/* Exit focus mode button */}
          <button
            onClick={exitFocus}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
            aria-label="Exit focus mode"
          >
            <Icon name="fullscreen_exit" size={16} />
            <span className="hidden sm:inline">Exit Focus</span>
          </button>
        </header>

        {/* Centred study area */}
        <main className="pt-16 pb-8 min-h-screen">
          <div className="max-w-2xl mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    );
  }

  // ─── Normal Layout ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <main className={cn(hideBottomNav ? '' : 'pb-20', 'lg:pb-0', mainMarginClass)}>
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
      <BottomNav />
      {showConsentBanner && <CookieConsentBanner onConsent={handleConsent} />}
    </div>
  );
}

// ─── Profile completion gate ──────────────────────────────────────────────────
function ProfileGate({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="max-w-md mx-auto text-center py-12">
      <div className="bg-white dark:bg-surface-100 rounded-2xl p-8 border border-warning-200 shadow-lg transition-colors duration-200">
        <div className="w-20 h-20 mx-auto bg-warning-50 rounded-2xl flex items-center justify-center mb-6">
          <Icon name="person_add" size={40} className="text-warning-500" filled />
        </div>
        <h2 className="text-xl font-bold text-surface-900 mb-3">{t('profile_gate.title')}</h2>
        <p className="text-surface-500 text-sm mb-6 leading-relaxed">{t('profile_gate.desc')}</p>
        <div className="space-y-3">
          <button
            className="w-full bg-primary-500 text-white rounded-xl py-3 font-semibold hover:bg-primary-600 transition-colors"
            onClick={() => onNavigate(ROUTES.PROFILE)}
          >
            {t('profile_gate.go_to_profile')}
          </button>
          <button
            className="w-full text-surface-500 text-sm hover:text-surface-700"
            onClick={() => onNavigate(ROUTES.DASHBOARD)}
          >
            {t('profile_gate.back_home')}
          </button>
        </div>
      </div>
    </div>
  );
}
