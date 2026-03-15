/**
 * AppProviders.tsx
 * Composes all application-level providers into one component.
 * Add new providers here — keeps App.tsx clean.
 *
 * Provider order (outer → inner):
 *  1. QueryClientProvider — TanStack Query (must wrap everything for data fetching)
 *  2. LanguageProvider  — i18n context (must wrap everything)
 *  3. RouterProvider    — React Router (needs i18n for lang detection)
 *  4. Toaster           — Toast notifications (needs to be inside React tree)
 */
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { LanguageProvider } from '@/i18n';
import { router } from '@/router';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProviders() {
  return (
    <QueryClientProvider client={queryClient}>
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
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
