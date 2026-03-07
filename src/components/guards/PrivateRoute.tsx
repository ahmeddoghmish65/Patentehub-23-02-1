import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { ROUTES } from '@/constants';
import { PageLoader } from '@/components/feedback/PageLoader';

/**
 * PrivateRoute — only renders children when the user is authenticated.
 * Redirects to /login with the intended destination saved in `state.from`.
 */
export function PrivateRoute() {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
