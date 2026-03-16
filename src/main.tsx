import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import { App } from './App';
import { queryClient } from '@/app/providers/AppProviders';
import { getSavedTheme } from '@/shared/utils/cookieManager';
import { applyTheme } from '@/store/helpers';
import { LanguageProvider } from '@/i18n';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { initAnalytics } from '@/infrastructure/analytics';
import { initSentry, initLogRocket } from '@/infrastructure/monitoring';

// ─── Early startup — apply saved preferences before React renders ─────────────
// Reading from localStorage synchronously prevents a flash of the wrong theme
// or layout direction while the DB / Zustand store is loading.

const savedTheme = getSavedTheme();
if (savedTheme) {
  applyTheme(savedTheme);
}

// Sentry: initialise early so no errors are missed (no consent required).
initSentry();

// Analytics & LogRocket: only active when the user gave full cookie consent.
initAnalytics();
initLogRocket();

// Language direction is applied by the inline script in index.html (runs
// synchronously before any paint), so no additional DOM writes are needed here.
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <LanguageProvider>
              <App />
            {/* Global toast notification system */}
            <Toaster
              position="top-center"
              richColors
              closeButton
              duration={4000}
              toastOptions={{
                style: {
                  fontFamily: 'inherit',
                  borderRadius: '12px',
                },
              }}
            />
            </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>,
);
