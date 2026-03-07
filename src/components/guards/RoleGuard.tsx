import type { ReactNode } from 'react';
import { useAuthStore } from '@/store';
import { hasRole } from '@/constants';
import type { Role } from '@/types';

interface RoleGuardProps {
  /** Minimum role required to render children */
  role: Role;
  /** Rendered when the user has the required role */
  children: ReactNode;
  /** Optionally rendered when the user does not have the required role */
  fallback?: ReactNode;
}

/**
 * RoleGuard — component-level permission check.
 * Renders `children` when the current user satisfies the minimum `role`;
 * renders `fallback` (or nothing) otherwise.
 *
 * Usage:
 *   <RoleGuard role="admin">
 *     <DeleteButton />
 *   </RoleGuard>
 */
export function RoleGuard({ role, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuthStore();
  if (!user || !hasRole(user.role, role)) return <>{fallback}</>;
  return <>{children}</>;
}

/**
 * useHasRole — hook version of the permission check.
 */
export function useHasRole(role: Role): boolean {
  const { user } = useAuthStore();
  return !!user && hasRole(user.role, role);
}

/**
 * usePermission — check whether the current manager user has a specific permission.
 */
export function usePermission(permission: string): boolean {
  const { user } = useAuthStore();
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'manager') {
    return (user as { permissions?: string[] }).permissions?.includes(permission) ?? false;
  }
  return false;
}
