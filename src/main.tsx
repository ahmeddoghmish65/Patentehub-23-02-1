import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { getSavedTheme } from "@/utils/cookieManager";
import { applyTheme } from "@/store/authStore";

// ─── Early startup: apply saved preferences before React renders ──────────
// Reading from cookies here (synchronously) prevents a flash of the wrong
// theme or layout direction while the DB / Zustand store is loading.

const savedTheme = getSavedTheme();
if (savedTheme) {
  applyTheme(savedTheme);
}
// ─────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
