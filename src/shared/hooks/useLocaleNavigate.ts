import { useNavigate, useParams } from 'react-router-dom';
import type { NavigateOptions } from 'react-router-dom';

/**
 * Wraps useNavigate to automatically prepend the current locale prefix (/:lang)
 * to all absolute path navigations.
 *
 * Usage:
 *   const { navigate, localePath, goBack } = useLocaleNavigate();
 *   navigate(ROUTES.DASHBOARD);        // → /ar/dashboard or /it/dashboard
 *   localePath('/login')               // → '/ar/login' or '/it/login'
 *   goBack(ROUTES.DASHBOARD);          // → navigate(-1) or fallback to /ar/dashboard
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

  /**
   * Navigate back in browser history if a previous entry exists,
   * otherwise fall back to the given route.
   */
  const goBack = (fallback: string): void => {
    if ((window.history.state?.idx ?? 0) > 0) {
      rawNavigate(-1);
    } else {
      rawNavigate(localePath(fallback));
    }
  };

  return { navigate, localePath, goBack };
}
