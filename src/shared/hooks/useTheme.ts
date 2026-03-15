/**
 * Re-exports `useTheme` and the `Theme` type from ThemeProvider so consumers
 * can import from either path:
 *
 *   import { useTheme } from '@/shared/hooks/useTheme';
 *   import { useTheme } from '@/providers/ThemeProvider';
 */
export { useTheme } from '@/providers/ThemeProvider';
export type { Theme } from '@/providers/ThemeProvider';
