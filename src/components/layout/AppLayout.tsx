import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { PROFILE_GATED_PAGES } from '@/constants';
import { useState, useCallback } from 'react';
import { getConsentLevel, type ConsentLevel } from '@/utils/cookieManager';
import { ROUTES } from '@/constants';

export function AppLayout() {
  const { user } = useAuthStore();
  const { dir, t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // Cookie consent
  const [consentLevel, setConsentLevel] = useState<ConsentLevel | null>(() => getConsentLevel());
  const showConsentBanner = consentLevel === null;

  const handleConsent = useCallback((level: ConsentLevel) => {
    setConsentLevel(level);
  }, []);

  if (!user) return null;

  // Direction-aware sidebar positioning
  const mainMarginClass = dir === 'rtl' ? 'lg:mr-72' : 'lg:ml-72';

  // Profile completion gate — block access to learning pages
  const needsProfileComplete =
    !user.profileComplete &&
    user.progress.totalQuizzes >= 1 &&
    PROFILE_GATED_PAGES.has(pathname);

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

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <main className={cn('pb-20 lg:pb-0', mainMarginClass)}>
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
      <div className="bg-white rounded-2xl p-8 border border-warning-200 shadow-lg">
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
