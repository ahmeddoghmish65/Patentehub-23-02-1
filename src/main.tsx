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

// Language direction is applied by the inline script in index.html (runs
// synchronously before any paint), so no additional DOM writes are needed here.
// ─────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>
);
