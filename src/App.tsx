import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { Dashboard } from '@/pages/Dashboard';
import { LessonsPage } from '@/pages/LessonsPage';
import { LessonDetailPage } from '@/pages/LessonDetailPage';
import { QuizPage } from '@/pages/QuizPage';
import { SignsPage } from '@/pages/SignsPage';
import { DictionaryPage } from '@/pages/DictionaryPage';
import { TrainingPage } from '@/pages/TrainingPage';
import { CommunityPage } from '@/pages/CommunityPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';
import { MistakesPage } from '@/pages/MistakesPage';
import { ExamSimulatorPage } from '@/pages/ExamSimulatorPage';
import { QuestionsBrowsePage } from '@/pages/QuestionsBrowsePage';
import { ContactPage } from '@/pages/ContactPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { TermsOfServicePage } from '@/pages/TermsOfServicePage';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { getConsentLevel, saveLastPage, type ConsentLevel } from '@/utils/cookieManager';
import { useTranslation } from '@/i18n';

type Page = 'landing' | 'login' | 'register' | 'reset-password' | 'dashboard' | 'lessons' | 'lesson-detail' | 'quiz' | 'signs' | 'dictionary' | 'training' | 'community' | 'profile' | 'admin' | 'mistakes' | 'exam-simulator' | 'questions-browse' | 'contact' | 'privacy-policy' | 'terms-of-service';

export function App() {
  const { user, isLoading, checkAuth, recordPageVisit } = useAuthStore();
  const { t, dir } = useTranslation();
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [pageData, setPageData] = useState<Record<string, string>>({});

  // ── Cookie consent ──────────────────────────────────────────────────────
  const [consentLevel, setConsentLevel] = useState<ConsentLevel | null>(
    () => getConsentLevel(),
  );
  const showConsentBanner = consentLevel === null;

  const handleConsent = useCallback((level: ConsentLevel) => {
    setConsentLevel(level);
  }, []);
  // ────────────────────────────────────────────────────────────────────────

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    if (!isLoading && user && ['landing', 'login', 'register'].includes(currentPage)) {
      setCurrentPage('dashboard');
    }
  }, [user, isLoading, currentPage]);

  const navigate = useCallback((page: string, data?: Record<string, string>) => {
    setCurrentPage(page as Page);
    if (data) setPageData(prev => ({ ...prev, ...data }));
    window.scrollTo({ top: 0, behavior: 'instant' });
    recordPageVisit(page).catch(() => {});
    saveLastPage(page);
  }, [recordPageVisit]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-200 mb-4 animate-pulse">
            <Icon name="directions_car" size={32} className="text-white" filled />
          </div>
          <h1 className="text-xl font-bold text-surface-900 mb-2">Patente Hub</h1>
          <div className="flex items-center justify-center gap-2 text-surface-400">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <span className="text-sm">{t('common.loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  // Public pages
  const legalPages: Page[] = ['contact', 'privacy-policy', 'terms-of-service'];
  if (!user || ['landing', 'login', 'register', 'reset-password', ...legalPages].includes(currentPage)) {
    let publicContent: React.ReactNode;
    if (currentPage === 'login' || currentPage === 'register' || currentPage === 'reset-password') {
      publicContent = <AuthPage mode={currentPage as 'login' | 'register' | 'reset-password'} onNavigate={navigate} />;
    } else if (currentPage === 'contact') {
      publicContent = <ContactPage onNavigate={navigate} />;
    } else if (currentPage === 'privacy-policy') {
      publicContent = <PrivacyPolicyPage onNavigate={navigate} />;
    } else if (currentPage === 'terms-of-service') {
      publicContent = <TermsOfServicePage onNavigate={navigate} />;
    } else {
      publicContent = <LandingPage onNavigate={navigate} />;
    }
    return (
      <>
        {publicContent}
        {showConsentBanner && <CookieConsentBanner onConsent={handleConsent} />}
      </>
    );
  }

  const managerPerms: string[] = user.role === 'manager' ? ((user as Record<string, unknown>).permissions as string[] || []) : [];
  const isAdminUser = user.role === 'admin' || (user.role === 'manager' && managerPerms.length > 0);

  // Bottom navigation items (mobile)
  const bottomNavItems = [
    { id: 'dashboard', icon: 'home', label: t('nav.home') },
    { id: 'lessons', icon: 'school', label: t('nav.lessons') },
    { id: 'training', icon: 'fitness_center', label: t('nav.training') },
    { id: 'community', icon: 'forum', label: t('nav.community') },
    { id: 'profile', icon: 'person', label: t('nav.profile') },
  ];

  // Desktop sidebar items
  const sideNavItems = [
    { id: 'dashboard', icon: 'home', label: t('nav.home') },
    { id: 'lessons', icon: 'school', label: t('nav.lessons') },
    { id: 'signs', icon: 'traffic', label: t('nav.signs') },
    { id: 'dictionary', icon: 'menu_book', label: t('nav.dictionary') },
    { id: 'training', icon: 'fitness_center', label: t('nav.training') },
    { id: 'community', icon: 'forum', label: t('nav.community') },
    { id: 'profile', icon: 'person', label: t('nav.profile') },
    ...(isAdminUser ? [{ id: 'admin', icon: 'admin_panel_settings', label: t('nav.admin') }] : []),
  ];

  // Profile completion gate
  const needsProfileComplete = user && !user.profileComplete && user.progress.totalQuizzes >= 1;
  const isContentPage = ['lessons', 'lesson-detail', 'quiz', 'signs', 'dictionary', 'training', 'exam-simulator', 'questions-browse'].includes(currentPage);

  const renderPage = () => {
    if (needsProfileComplete && isContentPage) {
      return (
        <div className="max-w-md mx-auto text-center py-12">
          <div className="bg-white rounded-2xl p-8 border border-warning-200 shadow-lg">
            <div className="w-20 h-20 mx-auto bg-warning-50 rounded-2xl flex items-center justify-center mb-6">
              <Icon name="person_add" size={40} className="text-warning-500" filled />
            </div>
            <h2 className="text-xl font-bold text-surface-900 mb-3">{t('profile_gate.title')}</h2>
            <p className="text-surface-500 text-sm mb-6 leading-relaxed">
              {t('profile_gate.desc')}
            </p>
            <div className="space-y-3">
              <button className="w-full bg-primary-500 text-white rounded-xl py-3 font-semibold hover:bg-primary-600 transition-colors" onClick={() => navigate('profile')}>
                {t('profile_gate.go_to_profile')}
              </button>
              <button className="w-full text-surface-500 text-sm hover:text-surface-700" onClick={() => navigate('dashboard')}>
                {t('profile_gate.back_home')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={navigate} />;
      case 'lessons': return <LessonsPage onNavigate={navigate} initialSectionId={pageData.sectionId} />;
      case 'lesson-detail': return <LessonDetailPage lessonId={pageData.lessonId || ''} onNavigate={navigate} />;
      case 'quiz': return <QuizPage lessonId={pageData.lessonId} sectionId={pageData.sectionId} onNavigate={navigate} />;
      case 'signs': return <SignsPage onNavigate={navigate} />;
      case 'dictionary': return <DictionaryPage />;
      case 'training': return <TrainingPage onNavigate={navigate} />;
      case 'community': return <CommunityPage openPostId={pageData.openPostId} />;
      case 'profile': return <ProfilePage onNavigate={navigate} />;
      case 'admin': return isAdminUser ? <AdminPage /> : <Dashboard onNavigate={navigate} />;
      case 'mistakes': return <MistakesPage />;
      case 'exam-simulator': return <ExamSimulatorPage onNavigate={navigate} />;
      case 'questions-browse': return <QuestionsBrowsePage onNavigate={navigate} />;
      case 'contact': return <ContactPage onNavigate={navigate} />;
      case 'privacy-policy': return <PrivacyPolicyPage onNavigate={navigate} />;
      case 'terms-of-service': return <TermsOfServicePage onNavigate={navigate} />;
      default: return <Dashboard onNavigate={navigate} />;
    }
  };

  // Direction-aware sidebar positioning
  // In RTL (Arabic): sidebar on the right, main content has margin-right
  // In LTR (Italian): sidebar on the left, main content has margin-left
  const sidebarPositionClass = dir === 'rtl'
    ? 'top-0 right-0 border-l'
    : 'top-0 left-0 border-r';
  const mainMarginClass = dir === 'rtl' ? 'lg:mr-72' : 'lg:ml-72';
  const navButtonAlign = dir === 'rtl' ? 'text-right' : 'text-left';

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className={cn('hidden lg:flex fixed z-50 h-full w-72 bg-white flex-col', sidebarPositionClass)}>
        <div className="p-6 border-b border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <Icon name="directions_car" size={22} className="text-white" filled />
            </div>
            <div>
              <h1 className="text-lg font-bold text-surface-900">Patente Hub</h1>
              <p className="text-xs text-surface-400">{t('nav.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 bg-surface-50 rounded-xl p-3">
            {user.avatar ? (
              <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-surface-800 truncate">{user.name}</p>
              <p className="text-xs text-surface-400">{t('nav.level')} {user.progress.level}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {sideNavItems.map(item => (
            <button
              key={item.id}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                navButtonAlign,
                currentPage === item.id ? 'bg-primary-50 text-primary-700 font-semibold' : 'text-surface-500 hover:bg-surface-50'
              )}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} size={22} filled={currentPage === item.id} className={currentPage === item.id ? 'text-primary-600' : 'text-surface-400'} />
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 space-y-3">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="local_fire_department" size={20} className="text-orange-500" filled />
              <span className="text-sm font-semibold text-orange-700">{t('nav.streak')}</span>
            </div>
            <p className="text-3xl font-bold text-orange-600">{user.progress.currentStreak}</p>
            <p className="text-xs text-orange-400 mt-1">{t('nav.exam_readiness')}: {user.progress.examReadiness}%</p>
          </div>
          {/* Language Switcher */}
          <div className="flex items-center justify-center">
            <LanguageSwitcher variant="full" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn('pb-20 lg:pb-0', mainMarginClass)}>
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-surface-100 pb-safe">
        <div className="flex items-center justify-around h-16">
          {bottomNavItems.map(item => (
            <button key={item.id} className={cn('flex flex-col items-center gap-0.5 px-3 py-2 min-w-0', currentPage === item.id ? 'text-primary-600' : 'text-surface-400')} onClick={() => navigate(item.id)}>
              <Icon name={item.icon} size={22} filled={currentPage === item.id} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {showConsentBanner && <CookieConsentBanner onConsent={handleConsent} />}
    </div>
  );
}
