import { lazy, Suspense, useEffect } from 'react';
import { createHashRouter, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAuthStore } from '@/store';
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

// ─── Root layout — bootstraps auth & handles redirects ────────────────────────
function RootLayout() {
  const { checkAuth, user, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Initialise auth from stored cookie on first mount
  useEffect(() => {
    checkAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redirect authenticated users away from public-only pages
  useEffect(() => {
    if (isLoading) return;
    const publicOnlyPaths = [ROUTES.LANDING, ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.RESET_PASSWORD];
    if (user && publicOnlyPaths.some(p => pathname === p)) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [user, isLoading, pathname, navigate]);

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
  {
    element: <RootLayout />,
    children: [
      // ── Public routes ──────────────────────────────────────────────────
      { path: ROUTES.LANDING, element: <SuspensePage><LandingPage /></SuspensePage> },
      { path: ROUTES.LOGIN, element: <SuspensePage><AuthPage mode="login" /></SuspensePage> },
      { path: ROUTES.REGISTER, element: <SuspensePage><AuthPage mode="register" /></SuspensePage> },
      { path: ROUTES.RESET_PASSWORD, element: <SuspensePage><AuthPage mode="reset-password" /></SuspensePage> },
      { path: ROUTES.CONTACT, element: <SuspensePage><ContactPage /></SuspensePage> },
      { path: ROUTES.PRIVACY_POLICY, element: <SuspensePage><PrivacyPolicyPage /></SuspensePage> },
      { path: ROUTES.TERMS_OF_SERVICE, element: <SuspensePage><TermsOfServicePage /></SuspensePage> },

      // ── Private routes (auth guard + app shell) ────────────────────────
      {
        element: <PrivateRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: ROUTES.DASHBOARD, element: <SuspensePage><Dashboard /></SuspensePage> },
              { path: ROUTES.LESSONS, element: <SuspensePage><LessonsPage /></SuspensePage> },
              { path: ROUTES.LESSON_DETAIL, element: <SuspensePage><LessonDetailPage /></SuspensePage> },
              { path: ROUTES.QUIZ, element: <SuspensePage><QuizPage /></SuspensePage> },
              { path: ROUTES.SIGNS, element: <SuspensePage><SignsPage /></SuspensePage> },
              { path: ROUTES.DICTIONARY, element: <SuspensePage><DictionaryPage /></SuspensePage> },
              { path: ROUTES.TRAINING, element: <SuspensePage><TrainingPage /></SuspensePage> },
              { path: ROUTES.COMMUNITY, element: <SuspensePage><CommunityPage /></SuspensePage> },
              { path: ROUTES.PROFILE, element: <SuspensePage><ProfilePage /></SuspensePage> },
              { path: ROUTES.USER_PROFILE, element: <SuspensePage><UserProfilePage /></SuspensePage> },
              { path: ROUTES.MISTAKES, element: <SuspensePage><MistakesPage /></SuspensePage> },
              { path: ROUTES.EXAM_SIMULATOR, element: <SuspensePage><ExamSimulatorPage /></SuspensePage> },
              { path: ROUTES.QUESTIONS_BROWSE, element: <SuspensePage><QuestionsBrowsePage /></SuspensePage> },

              // Admin-only sub-tree
              {
                element: <AdminRoute />,
                children: [
                  { path: ROUTES.ADMIN, element: <SuspensePage><AdminPage /></SuspensePage> },
                ],
              },
            ],
          },
        ],
      },

      // ── Fallback ───────────────────────────────────────────────────────
      { path: '*', element: <Navigate to={ROUTES.LANDING} replace /> },
    ],
  },
]);
