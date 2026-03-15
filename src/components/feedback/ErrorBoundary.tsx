import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { captureException } from '@/infrastructure/monitoring';

interface Props {
  children:  ReactNode;
  /** Custom fallback UI; receives the error and a reset callback */
  fallback?: (error: Error, reset: () => void) => ReactNode;
  /** Called when an error is caught — use to send to Sentry / logging */
  onError?:  (error: Error, info: ErrorInfo) => void;
  /** Optional component name for debugging */
  name?:     string;
}

interface State {
  hasError:    boolean;
  error:       Error | null;
  errorCount:  number;
}

/**
 * ErrorBoundary — catches unhandled render errors in the React tree.
 *
 * Features:
 *  - Custom fallback UI via render prop
 *  - onError callback for logging services (Sentry, etc.)
 *  - Error count tracking to detect repeated failures
 *  - Clean navigation to dashboard on hard failures
 *  - Trilingual UI (ar / it / en) via localStorage
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState(s => ({ errorCount: s.errorCount + 1 }));

    // Report to Sentry with component context
    captureException(error, {
      componentName: this.props.name,
      componentStack: info.componentStack,
    });

    // Additional custom handler (e.g. for tests or parent components)
    if (this.props.onError) {
      this.props.onError(error, info);
    } else if (import.meta.env.DEV) {
      console.error(
        `[ErrorBoundary${this.props.name ? `:${this.props.name}` : ''}]`,
        error.message,
        '\nComponent stack:',
        info.componentStack,
      );
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return (
        <DefaultErrorScreen
          error={this.state.error}
          onReset={this.reset}
          repeatedError={this.state.errorCount > 2}
        />
      );
    }
    return this.props.children;
  }
}

// ── Minimal translation helper (no hooks — works in class components) ─────────

type Lang = 'ar' | 'it' | 'en';

const TRANSLATIONS: Record<Lang, {
  title: string; titlePersistent: string;
  desc: string; descPersistent: string;
  tryAgain: string; goDashboard: string;
}> = {
  ar: {
    title:           'حدث خطأ ما',
    titlePersistent: 'خطأ متكرر',
    desc:            'حدث خطأ غير متوقع. يرجى المحاولة مجدداً.',
    descPersistent:  'هذه الصفحة تواجه خطأً متكرراً. يرجى الانتقال لصفحة أخرى.',
    tryAgain:        'حاول مجدداً',
    goDashboard:     'الذهاب للرئيسية',
  },
  it: {
    title:           'Qualcosa è andato storto',
    titlePersistent: 'Errore persistente',
    desc:            'Si è verificato un errore imprevisto. Riprova.',
    descPersistent:  'Questa pagina continua a fallire. Vai su un\'altra pagina.',
    tryAgain:        'Riprova',
    goDashboard:     'Vai alla home',
  },
  en: {
    title:           'Something went wrong',
    titlePersistent: 'Persistent error',
    desc:            'An unexpected error occurred. Please try again.',
    descPersistent:  'This component keeps failing. Please navigate to a different page.',
    tryAgain:        'Try again',
    goDashboard:     'Go to dashboard',
  },
};

function getUiLang(): Lang {
  try {
    const stored = localStorage.getItem('ph_ui_lang');
    if (stored === 'it' || stored === 'ar' || stored === 'en') return stored;
  } catch { /* ignore */ }
  return 'ar';
}

// ── Default error screen ──────────────────────────────────────────────────────

function DefaultErrorScreen({
  error,
  onReset,
  repeatedError,
}: {
  error:          Error | null;
  onReset:        () => void;
  repeatedError?: boolean;
}) {
  const isDev = import.meta.env.DEV;
  const lang  = getUiLang();
  const tr    = TRANSLATIONS[lang];
  const isRtl = lang === 'ar';

  const goHome = () => {
    // Navigate to the app root and do a hard refresh to clear any bad state
    const segments = window.location.pathname.split('/').filter(Boolean);
    const urlLang = (segments[0] === 'ar' || segments[0] === 'it' || segments[0] === 'en') ? segments[0] : lang;
    window.location.href = `/${urlLang}/dashboard`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-surface-50 p-4"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-danger-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="error" size={32} className="text-danger-500" />
        </div>

        <h2 className="text-xl font-bold text-surface-900 mb-2">
          {repeatedError ? tr.titlePersistent : tr.title}
        </h2>

        <p className="text-sm text-surface-500 mb-6 leading-relaxed">
          {repeatedError ? tr.descPersistent : tr.desc}
        </p>

        {/* Dev-only: show error details */}
        {isDev && error && (
          <pre className="text-xs text-start bg-surface-50 border border-surface-200 rounded-lg p-3 mb-4 overflow-x-auto text-danger-700 whitespace-pre-wrap break-words">
            {error.message}
          </pre>
        )}

        {!repeatedError && (
          <button
            onClick={onReset}
            className="w-full bg-primary-500 text-white rounded-xl py-3 font-semibold hover:bg-primary-600 transition-colors mb-2"
          >
            {tr.tryAgain}
          </button>
        )}

        <button
          onClick={goHome}
          className="w-full text-surface-400 text-sm hover:text-surface-600 py-2"
        >
          {tr.goDashboard}
        </button>
      </div>
    </div>
  );
}
