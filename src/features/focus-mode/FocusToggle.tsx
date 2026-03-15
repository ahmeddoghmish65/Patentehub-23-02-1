/**
 * FocusToggle — button to enter or exit Focus Study Mode.
 *
 * Two variants:
 *   'icon'   (default) — compact icon-only button (for toolbar / sidebar)
 *   'button'           — labelled button with icon (for settings row)
 */

import { memo } from 'react';
import { useFocusMode } from './FocusModeProvider';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';

interface FocusToggleProps {
  variant?: 'icon' | 'button';
  className?: string;
}

export const FocusToggle = memo(function FocusToggle({
  variant = 'icon',
  className,
}: FocusToggleProps) {
  const { isActive, toggle } = useFocusMode();

  if (variant === 'button') {
    return (
      <button
        onClick={toggle}
        aria-pressed={isActive}
        className={cn(
          'relative flex items-center gap-3 w-full px-4 py-3 rounded-xl',
          'transition-all duration-200 font-medium text-sm',
          isActive
            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
            : 'bg-surface-100 text-surface-700 hover:bg-surface-200',
          className,
        )}
      >
        <Icon
          name={isActive ? 'center_focus_strong' : 'center_focus_weak'}
          size={18}
          className={isActive ? 'text-primary-600' : 'text-surface-500'}
          filled={isActive}
        />
        <span className="flex-1 text-start">
          {isActive ? 'Exit Focus Mode' : 'Enter Focus Mode'}
        </span>
        {/* Toggle pill */}
        <span
          className={cn(
            'relative inline-flex items-center h-5 w-9 rounded-full transition-colors duration-200 shrink-0',
            isActive ? 'bg-primary-500' : 'bg-surface-300',
          )}
        >
          <span
            className={cn(
              'absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200',
              isActive ? 'translate-x-4' : 'translate-x-1',
            )}
          />
        </span>
      </button>
    );
  }

  // 'icon' variant — compact button for toolbar / sidebar
  return (
    <button
      onClick={toggle}
      aria-pressed={isActive}
      aria-label={isActive ? 'Exit focus mode' : 'Enter focus mode'}
      title={isActive ? 'Exit focus mode' : 'Enter focus mode'}
      className={cn(
        'p-2 rounded-xl transition-colors duration-200',
        isActive
          ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600'
          : 'text-surface-500 hover:bg-surface-100 hover:text-surface-700',
        className,
      )}
    >
      <Icon
        name={isActive ? 'center_focus_strong' : 'center_focus_weak'}
        size={20}
        filled={isActive}
      />
    </button>
  );
});
