import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import { App } from './App';
import { getSavedTheme } from '@/shared/utils/cookieManager';
import { applyTheme } from '@/store/helpers';
import { LanguageProvider } from '@/i18n';
import { initAnalytics } from '@/infrastructure/analytics';

// ─── Early startup — apply saved preferences before React renders ─────────────
// Reading from localStorage synchronously prevents a flash of the wrong theme
// or layout direction while the DB / Zustand store is loading.

const savedTheme = getSavedTheme();
if (savedTheme) {
  applyTheme(savedTheme);
}

// Initialise analytics if the user already gave full consent on a prior visit.
initAnalytics();

// Language direction is applied by the inline script in index.html (runs
// synchronously before any paint), so no additional DOM writes are needed here.
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
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
    </HelmetProvider>
  </StrictMode>,
);
