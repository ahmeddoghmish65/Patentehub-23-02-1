import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Icon } from '@/components/ui/Icon';

interface Props {
  children: ReactNode;
  /** Custom fallback UI; receives the error and a reset callback */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary — catches unhandled render errors in the React tree.
 * Shows a friendly error screen and offers a "Try again" button.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where you'd send to Sentry / logging service
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <DefaultErrorScreen error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

function DefaultErrorScreen({
  error,
  onReset,
}: {
  error: Error | null;
  onReset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-danger-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Icon name="error" size={32} className="text-danger-500" />
        </div>
        <h2 className="text-xl font-bold text-surface-900 mb-2">Something went wrong</h2>
        <p className="text-sm text-surface-500 mb-6 leading-relaxed">
          {error?.message ?? 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={onReset}
          className="w-full bg-primary-500 text-white rounded-xl py-3 font-semibold hover:bg-primary-600 transition-colors"
        >
          Try again
        </button>
        <button
          onClick={() => { window.location.hash = '/dashboard'; window.location.reload(); }}
          className="w-full mt-2 text-surface-400 text-sm hover:text-surface-600"
        >
          Go to dashboard
        </button>
      </div>
    </div>
  );
}
