/**
 * Toast helpers — thin wrappers around Sonner so we have one central place
 * to style and configure toast notifications.
 *
 * Import from here, not from 'sonner' directly.
 *
 * Usage:
 *   import { toast } from '@/shared/lib/toast';
 *   toast.success('Saved!');
 *   toast.error('Something went wrong');
 *   toast.promise(myAsyncFn(), { loading: '...', success: 'Done!', error: 'Failed' });
 */
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),

  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),

  info: (message: string, description?: string) =>
    sonnerToast(message, { description }),

  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),

  promise: <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) => sonnerToast.promise(promise, messages),

  /** Show a toast for an API action result */
  fromResult: (success: boolean, successMsg: string, errorMsg: string) => {
    if (success) sonnerToast.success(successMsg);
    else sonnerToast.error(errorMsg);
  },
};

/**
 * Global API error handler — maps HTTP status codes to user-friendly toasts.
 */
export function handleApiError(code: number | undefined, fallback = 'An error occurred') {
  switch (code) {
    case 401:
      sonnerToast.error('Session expired', { description: 'Please sign in again.' });
      break;
    case 403:
      sonnerToast.error('Access denied', { description: 'You do not have permission to perform this action.' });
      break;
    case 404:
      sonnerToast.error('Not found', { description: 'The requested resource was not found.' });
      break;
    case 429:
      sonnerToast.error('Too many requests', { description: 'Please slow down and try again.' });
      break;
    case 500:
      sonnerToast.error('Server error', { description: 'Something went wrong. Please try again.' });
      break;
    default:
      sonnerToast.error(fallback);
  }
}
