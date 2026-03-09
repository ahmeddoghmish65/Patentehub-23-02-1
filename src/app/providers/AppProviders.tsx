/**
 * AppProviders.tsx
 * Composes all application-level providers into one component.
 * Add new providers here — keeps App.tsx clean.
 *
 * Provider order (outer → inner):
 *  1. LanguageProvider  — i18n context (must wrap everything)
 *  2. RouterProvider    — React Router (needs i18n for lang detection)
 *  3. Toaster           — Toast notifications (needs to be inside React tree)
 */
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/i18n';
import { router } from '@/router';

export function AppProviders() {
  return (
    <LanguageProvider>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={4000}
      />
    </LanguageProvider>
  );
}
