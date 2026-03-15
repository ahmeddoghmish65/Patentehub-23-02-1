import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { ROUTES } from '@/shared/constants';
import { PageLoader } from '@/components/feedback/PageLoader';
import { useLocaleNavigate } from '@/shared/hooks/useLocaleNavigate';

/**
 * PrivateRoute — only renders children when the user is authenticated.
 * Redirects to /:lang/login with the intended destination saved in `state.from`.
 */
export function PrivateRoute() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();
  const { localePath } = useLocaleNavigate();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return (
      <Navigate
        to={localePath(ROUTES.LOGIN)}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
