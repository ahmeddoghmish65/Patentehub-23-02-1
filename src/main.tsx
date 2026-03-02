import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { getSavedTheme } from "@/utils/cookieManager";
import { applyTheme } from "@/store/authStore";
import { LanguageProvider } from "@/i18n";

// ─── Early startup: apply saved preferences before React renders ──────────
// Reading from localStorage here (synchronously) prevents a flash of the wrong
// theme or layout direction while the DB / Zustand store is loading.

const savedTheme = getSavedTheme();
if (savedTheme) {
  applyTheme(savedTheme);
}

// Apply saved UI language direction before first render to prevent layout flash
const savedUiLang = localStorage.getItem('ph_ui_lang');
if (savedUiLang === 'it') {
  document.documentElement.setAttribute('dir', 'ltr');
  document.documentElement.setAttribute('lang', 'it');
}
// ─────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);
