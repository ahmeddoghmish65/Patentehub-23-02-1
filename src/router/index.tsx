import { lazy, Suspense, useEffect } from 'react';
import {
  createHashRouter,
  Navigate,
  Outlet,
  useNavigate,
  useLocation,
  useParams,
} from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';
import { useTranslation } from '@/i18n';
import type { UiLang } from '@/i18n';
import { PrivateRoute } from '@/components/guards/PrivateRoute';
import { AdminRoute } from '@/components/guards/AdminRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageLoader } from '@/components/feedback/PageLoader';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';

// ─── Lazy-loaded pages ────────────────────────────────────────────────────────
const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const AuthPage = lazy(() => import('@/pages/AuthPage').then(m => ({ default: m.AuthPage })));
const ContactPage = lazy(() => import('@/pages/ContactPage').then(m => ({ default: m.ContactPage })));
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsOfServicePage = lazy(() => import('@/pages/TermsOfServicePage').then(m => ({ default: m.TermsOfServicePage })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const LessonsPage = lazy(() => import('@/pages/LessonsPage').then(m => ({ default: m.LessonsPage })));
const LessonDetailPage = lazy(() => import('@/pages/LessonDetailPage').then(m => ({ default: m.LessonDetailPage })));
const QuizPage = lazy(() => import('@/pages/QuizPage').then(m => ({ default: m.QuizPage })));
const SignsPage = lazy(() => import('@/pages/SignsPage').then(m => ({ default: m.SignsPage })));
const DictionaryPage = lazy(() => import('@/pages/DictionaryPage').then(m => ({ default: m.DictionaryPage })));
const TrainingPage = lazy(() => import('@/pages/TrainingPage').then(m => ({ default: m.TrainingPage })));
const CommunityPage = lazy(() => import('@/pages/CommunityPage').then(m => ({ default: m.CommunityPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const UserProfilePage = lazy(() => import('@/pages/UserProfilePage').then(m => ({ default: m.UserProfilePage })));
const MistakesPage = lazy(() => import('@/pages/MistakesPage').then(m => ({ default: m.MistakesPage })));
const ExamSimulatorPage = lazy(() => import('@/pages/ExamSimulatorPage').then(m => ({ default: m.ExamSimulatorPage })));
const QuestionsBrowsePage = lazy(() => import('@/pages/QuestionsBrowsePage').then(m => ({ default: m.QuestionsBrowsePage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then(m => ({ default: m.AdminPage })));

// ─── Root redirect — sends / to /:defaultLang ─────────────────────────────────
function RootRedirect() {
  const stored = localStorage.getItem('ph_ui_lang');
  const lang: UiLang = stored === 'it' ? 'it' : 'ar';
  return <Navigate to={`/${lang}`} replace />;
}

// ─── Fallback inside /:lang — redirect back to lang root ──────────────────────
function LocaleFallback() {
  const { lang } = useParams<{ lang: string }>();
  return <Navigate to={`/${lang ?? 'ar'}`} replace />;
}

// ─── Locale layout — validates :lang, syncs i18n, handles auth redirects ──────
function LocaleLayout() {
  const { lang } = useParams<{ lang: string }>();
  const { setUiLang, uiLang } = useTranslation();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { checkAuth, user, isLoading } = useAuthStore();

  // Redirect to valid lang if the :lang param is not supported
  useEffect(() => {
    if (lang !== 'ar' && lang !== 'it') {
      const validLang = localStorage.getItem('ph_ui_lang') === 'it' ? 'it' : 'ar';
      navigate(`/${validLang}`, { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Sync URL :lang param → i18n state
  useEffect(() => {
    if ((lang === 'ar' || lang === 'it') && lang !== uiLang) {
      setUiLang(lang as UiLang);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang]);

  // Initialise auth from stored cookie on first mount
  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect authenticated users away from public-only pages
  useEffect(() => {
    if (isLoading || !lang || (lang !== 'ar' && lang !== 'it')) return;
    const publicOnlyPaths = [ROUTES.LANDING, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.RESET_PASSWORD];
    const pathWithoutLang = pathname.replace(`/${lang}`, '') || '/';
    if (user && publicOnlyPaths.some(p => pathWithoutLang === p)) {
      navigate(`/${lang}${ROUTES.DASHBOARD}`, { replace: true });
    }
  }, [user, isLoading, pathname, navigate, lang]);

  // Scroll to top on route change
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  if (lang !== 'ar' && lang !== 'it') return null;

  return <Outlet />;
}

// ─── Suspense wrapper ─────────────────────────────────────────────────────────
function SuspensePage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const router = createHashRouter([
  // Root redirect: / → /:defaultLang
  { path: '/', element: <RootRedirect /> },

  // Locale subtree: /ar/... and /it/...
  {
    path: '/:lang',
    element: <LocaleLayout />,
    children: [
      // ── Public routes ──────────────────────────────────────────────────
      { index: true, element: <SuspensePage><LandingPage /></SuspensePage> },
      { path: 'login', element: <SuspensePage><AuthPage mode="login" /></SuspensePage> },
      { path: 'register', element: <SuspensePage><AuthPage mode="register" /></SuspensePage> },
      { path: 'reset-password', element: <SuspensePage><AuthPage mode="reset-password" /></SuspensePage> },
      { path: 'contact', element: <SuspensePage><ContactPage /></SuspensePage> },
      { path: 'privacy-policy', element: <SuspensePage><PrivacyPolicyPage /></SuspensePage> },
      { path: 'terms-of-service', element: <SuspensePage><TermsOfServicePage /></SuspensePage> },

      // ── Private routes (auth guard + app shell) ────────────────────────
      {
        element: <PrivateRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <SuspensePage><Dashboard /></SuspensePage> },
              { path: 'lessons', element: <SuspensePage><LessonsPage /></SuspensePage> },
              { path: 'lessons/:lessonId', element: <SuspensePage><LessonDetailPage /></SuspensePage> },
              { path: 'quiz', element: <SuspensePage><QuizPage /></SuspensePage> },
              { path: 'signs', element: <SuspensePage><SignsPage /></SuspensePage> },
              { path: 'dictionary', element: <SuspensePage><DictionaryPage /></SuspensePage> },
              { path: 'training', element: <SuspensePage><TrainingPage /></SuspensePage> },
              { path: 'community', element: <SuspensePage><CommunityPage /></SuspensePage> },
              { path: 'profile', element: <SuspensePage><ProfilePage /></SuspensePage> },
              { path: 'profile/:userId', element: <SuspensePage><UserProfilePage /></SuspensePage> },
              { path: 'mistakes', element: <SuspensePage><MistakesPage /></SuspensePage> },
              { path: 'exam', element: <SuspensePage><ExamSimulatorPage /></SuspensePage> },
              { path: 'questions', element: <SuspensePage><QuestionsBrowsePage /></SuspensePage> },

              // Admin-only sub-tree
              {
                element: <AdminRoute />,
                children: [
                  { path: 'admin', element: <SuspensePage><AdminPage /></SuspensePage> },
                ],
              },
            ],
          },
        ],
      },

      // ── Fallback under /:lang ──────────────────────────────────────────
      { path: '*', element: <LocaleFallback /> },
    ],
  },

  // ── Global fallback ────────────────────────────────────────────────────────
  { path: '*', element: <RootRedirect /> },
]);
