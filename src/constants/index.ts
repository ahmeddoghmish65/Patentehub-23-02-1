export * from './routes';

/** Role hierarchy — higher index = more privileged */
export const ROLE_HIERARCHY: Record<string, number> = {
  user: 0,
  manager: 1,
  admin: 2,
};

/** Returns true when the given role has at least as much access as `required` */
export function hasRole(role: string | undefined, required: string): boolean {
  return (ROLE_HIERARCHY[role ?? ''] ?? -1) >= (ROLE_HIERARCHY[required] ?? 0);
}

/** Pages that require full profile completion before access */
export const PROFILE_GATED_PAGES = new Set([
  '/lessons',
  '/quiz',
  '/signs',
  '/dictionary',
  '/training',
  '/exam',
  '/questions',
]);

/** Activity pages we remember in the "last page" cookie */
export const RESUMABLE_PAGES = new Set([
  '/dashboard',
  '/lessons',
  '/signs',
  '/dictionary',
  '/training',
  '/community',
  '/profile',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
]);
