import { useNavigate, useParams } from 'react-router-dom';
import type { NavigateOptions } from 'react-router-dom';

/**
 * Wraps useNavigate to automatically prepend the current locale prefix (/:lang)
 * to all absolute path navigations.
 *
 * Usage:
 *   const { navigate, localePath } = useLocaleNavigate();
 *   navigate(ROUTES.DASHBOARD);  // → /ar/dashboard or /it/dashboard
 *   localePath('/login')         // → '/ar/login' or '/it/login'
 */
export function useLocaleNavigate() {
  const rawNavigate = useNavigate();
  const { lang } = useParams<{ lang?: string }>();

  const localePath = (path: string): string => {
    const locale = lang ?? localStorage.getItem('ph_ui_lang') ?? 'ar';
    return `/${locale}${path === '/' ? '' : path}`;
  };

  const navigate = (to: string, options?: NavigateOptions): void => {
    rawNavigate(localePath(to), options);
  };

  return { navigate, localePath };
}
