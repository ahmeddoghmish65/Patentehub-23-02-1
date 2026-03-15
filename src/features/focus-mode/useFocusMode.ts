/**
 * Re-exports useFocusMode from the provider so consumers can import from
 * either path:
 *
 *   import { useFocusMode } from '@/features/focus-mode';
 *   import { useFocusMode } from '@/features/focus-mode/useFocusMode';
 */
export { useFocusMode } from './FocusModeProvider';
