import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.svg", "robots.txt"],
      manifest: {
        name: "Patente Hub – Quiz Patente B",
        short_name: "Patente Hub",
        description:
          "Quiz patente B gratuiti, segnali stradali e simulazioni esame. تطبيق لتعليم رخصة القيادة الإيطالية.",
        theme_color: "#6366f1",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        orientation: "portrait",
        lang: "ar",
        icons: [
          {
            src: "pwa-192x192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
          },
          {
            src: "pwa-512x512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
          },
          {
            src: "pwa-512x512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
        runtimeCaching: [
          {
            // CSS metadata from Google Fonts — use StaleWhileRevalidate so the
            // cached copy is served immediately while a fresh copy is fetched in
            // the background.  CacheFirst was incorrect here: a stale cached CSS
            // can reference font file URLs that are no longer in the binary cache,
            // causing icons and text fonts to disappear entirely.
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Actual font binary files from gstatic — these are content-addressed
            // (URL changes when content changes), so CacheFirst for 1 year is safe.
            // Raised maxEntries to 30 to cover Cairo (9 weights) + Inter (9 weights)
            // + Material Symbols Rounded variable font.
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
