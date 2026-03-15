/**
 * ThemeToggle — switches between Light, System, and Dark themes.
 *
 * Two variants:
 *   'compact' (default) — a single icon button that cycles through options.
 *   'full'              — a 3-segment control showing all options at once.
 */

import { memo } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import type { Theme } from '@/providers/ThemeProvider';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

interface Option {
  value: Theme;
  icon: string;
  label: string;
}

const OPTIONS: Option[] = [
  { value: 'light',  icon: 'light_mode',      label: 'Light'  },
  { value: 'system', icon: 'brightness_auto',  label: 'System' },
  { value: 'dark',   icon: 'dark_mode',        label: 'Dark'   },
];

const CYCLE: Record<Theme, Theme> = {
  light:  'dark',
  dark:   'system',
  system: 'light',
};

export const ThemeToggle = memo(function ThemeToggle({
  variant = 'compact',
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const current = OPTIONS.find(o => o.value === theme) ?? OPTIONS[1];

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setTheme(CYCLE[theme])}
        className={cn(
          'p-2 rounded-xl transition-colors',
          'text-surface-500 hover:text-surface-700 hover:bg-surface-100',
          className,
        )}
        aria-label={`Theme: ${theme}. Click to switch.`}
        title={`Theme: ${theme}`}
      >
        <Icon name={current.icon} size={20} />
      </button>
    );
  }

  // Full 3-segment control
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 p-1 rounded-xl',
        'bg-surface-100',
        className,
      )}
      role="group"
      aria-label="Theme selector"
    >
      {OPTIONS.map(opt => {
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            aria-pressed={active}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
              active
                ? 'bg-white dark:bg-surface-700 text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700',
            )}
          >
            <Icon name={opt.icon} size={16} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
});
