import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { ROUTES } from '@/constants';
import { PageLoader } from '@/components/feedback/PageLoader';
import { useLocaleNavigate } from '@/hooks/useLocaleNavigate';

/**
 * AdminRoute — restricts access to admin and manager users.
 * Non-admin authenticated users are redirected to the dashboard.
 */
export function AdminRoute() {
  const { user, isLoading } = useAuthStore();
  const { localePath } = useLocaleNavigate();

  if (isLoading) return <PageLoader />;

  if (!user) {
    return <Navigate to={localePath(ROUTES.LOGIN)} replace />;
  }

  const isAdmin = user.role === 'admin' || user.role === 'manager';
  if (!isAdmin) {
    return <Navigate to={localePath(ROUTES.DASHBOARD)} replace />;
  }

  return <Outlet />;
}
