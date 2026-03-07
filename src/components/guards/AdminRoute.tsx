import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { ROUTES } from '@/constants';
import { PageLoader } from '@/components/feedback/PageLoader';

/**
 * AdminRoute — restricts access to admin and manager users.
 * Non-admin authenticated users are redirected to the dashboard.
 */
export function AdminRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const isAdmin = user.role === 'admin' || user.role === 'manager';
  if (!isAdmin) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}
