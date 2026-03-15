/**
 * useApiError.ts
 * Hook for standardised API error handling.
 *
 * Usage:
 *   const { error, handleError, clearError, withErrorHandling } = useApiError();
 *
 *   const result = await withErrorHandling(someService.doThing());
 *   if (!result) return; // error was handled automatically
 */
import { useState, useCallback } from 'react';
import { toast } from '@/shared/lib/toast';

interface ApiErrorState {
  error:    string | null;
  isError:  boolean;
}

export function useApiError(options?: { showToast?: boolean }) {
  const showToast = options?.showToast ?? true;

  const [state, setState] = useState<ApiErrorState>({
    error:   null,
    isError: false,
  });

  const handleError = useCallback((err: unknown) => {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === 'string'
          ? err
          : 'An unexpected error occurred';

    setState({ error: message, isError: true });

    if (showToast) {
      toast.error(message);
    }
  }, [showToast]);

  const clearError = useCallback(() => {
    setState({ error: null, isError: false });
  }, []);

  /**
   * Wraps an async operation. Returns the result on success or null on failure.
   * The error is stored in state and optionally shown as a toast.
   */
  const withErrorHandling = useCallback(async <T>(
    promise: Promise<{ success: boolean; data?: T; error?: string } | T>,
  ): Promise<T | null> => {
    clearError();
    try {
      const result = await promise;
      // Handle service result objects ({ success, data, error })
      if (
        result !== null &&
        typeof result === 'object' &&
        'success' in result
      ) {
        const sr = result as { success: boolean; data?: T; error?: string };
        if (!sr.success) {
          handleError(sr.error ?? 'Operation failed');
          return null;
        }
        return (sr.data ?? null) as T | null;
      }
      return result as T;
    } catch (err) {
      handleError(err);
      return null;
    }
  }, [clearError, handleError]);

  return {
    error:              state.error,
    isError:            state.isError,
    handleError,
    clearError,
    withErrorHandling,
  };
}
