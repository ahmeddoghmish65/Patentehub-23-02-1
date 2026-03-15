import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Icon } from '@/shared/ui/Icon';

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

    // Production logging hook
    if (this.props.onError) {
      this.props.onError(error, info);
    } else {
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

  const goHome = () => {
    // Navigate to the app root and do a hard refresh to clear any bad state
    const segments = window.location.pathname.split('/').filter(Boolean);
    const lang = (segments[0] === 'ar' || segments[0] === 'it') ? segments[0] : 'ar';
    window.location.href = `/${lang}/dashboard`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-danger-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="error" size={32} className="text-danger-500" />
        </div>

        <h2 className="text-xl font-bold text-surface-900 mb-2">
          {repeatedError ? 'Persistent error' : 'Something went wrong'}
        </h2>

        <p className="text-sm text-surface-500 mb-6 leading-relaxed">
          {repeatedError
            ? 'This component keeps failing. Please navigate to a different page.'
            : 'An unexpected error occurred. Please try again.'}
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
            Try again
          </button>
        )}

        <button
          onClick={goHome}
          className="w-full text-surface-400 text-sm hover:text-surface-600 py-2"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
