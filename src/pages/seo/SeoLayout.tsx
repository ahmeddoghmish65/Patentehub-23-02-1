/**
 * SeoLayout — minimal public layout used exclusively by SEO landing pages.
 * No auth required. Provides header nav + footer for consistent branding.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface SeoLayoutProps {
  children: ReactNode;
}

export function SeoLayout({ children }: SeoLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <nav
          className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between"
          aria-label="Navigazione principale"
        >
          <Link
            to="/it"
            className="flex items-center gap-2 font-bold text-xl text-indigo-600"
            aria-label="Patente Hub – torna alla home"
          >
            <span className="text-2xl" aria-hidden="true">🚗</span>
            <span>Patente Hub</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link to="/it/quiz-patente-b" className="hover:text-indigo-600 transition-colors">Quiz Patente B</Link>
            <Link to="/it/simulatore-esame-patente" className="hover:text-indigo-600 transition-colors">Simulatore</Link>
            <Link to="/it/segnali-stradali-italia" className="hover:text-indigo-600 transition-colors">Segnali</Link>
            <Link to="/it/lezioni-patente-b" className="hover:text-indigo-600 transition-colors">Lezioni</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/it/login"
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Accedi
            </Link>
            <Link
              to="/it/register"
              className="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Inizia Gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <p className="font-bold text-white text-lg mb-2">Patente Hub</p>
              <p className="text-sm leading-relaxed">
                La piattaforma gratuita per prepararsi all&apos;esame della patente B in Italia.
                Quiz, segnali stradali, simulazioni d&apos;esame e lezioni in italiano e arabo.
              </p>
            </div>
            {/* Resources */}
            <nav aria-label="Risorse SEO">
              <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Risorse</p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/it/quiz-patente-b" className="hover:text-white transition-colors">Quiz Patente B</Link></li>
                <li><Link to="/it/simulatore-esame-patente" className="hover:text-white transition-colors">Simulatore Esame</Link></li>
                <li><Link to="/it/segnali-stradali-italia" className="hover:text-white transition-colors">Segnali Stradali</Link></li>
                <li><Link to="/it/lezioni-patente-b" className="hover:text-white transition-colors">Lezioni Patente</Link></li>
                <li><Link to="/it/errori-comuni-esame-patente" className="hover:text-white transition-colors">Errori Comuni Esame</Link></li>
              </ul>
            </nav>
            {/* Legal */}
            <nav aria-label="Link legali">
              <p className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Legale</p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/it/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/it/terms-of-service" className="hover:text-white transition-colors">Termini di Servizio</Link></li>
                <li><Link to="/it/contact" className="hover:text-white transition-colors">Contatti</Link></li>
              </ul>
            </nav>
          </div>
          <div className="border-t border-gray-800 pt-6 text-sm text-center">
            <p>© {new Date().getFullYear()} Patente Hub. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
