/**
 * ThemeToggle — switches between Light, System, and Dark themes.
 *
 * Two variants:
 *   'compact' (default) — a single icon button that cycles through options.
 *   'full'              — a 3-segment control showing all options at once.
 *
 * Uses centralized config from @/config/theme for option metadata and cycle order.
 */

import { memo } from 'react';
import { useTheme } from '@/providers/ThemeProvider';
import type { Theme } from '@/providers/ThemeProvider';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { THEME_OPTIONS, THEME_CYCLE } from '@/config/theme';
import { useTranslation } from '@/i18n';

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const ThemeToggle = memo(function ThemeToggle({
  variant = 'compact',
  className,
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const current = THEME_OPTIONS.find(o => o.id === theme) ?? THEME_OPTIONS[1];

  const themeLabel = (id: string) =>
    t(`profile.theme_${id}`) || id.charAt(0).toUpperCase() + id.slice(1);

  if (variant === 'compact') {
    return (
      <button
        onClick={() => setTheme(THEME_CYCLE[theme as Theme])}
        className={cn(
          'p-2 rounded-xl transition-colors duration-200',
          'text-surface-500 hover:text-surface-700 hover:bg-surface-100',
          className,
        )}
        aria-label={`Theme: ${theme}. Click to switch.`}
        title={current.description}
      >
        <Icon name={current.icon} size={20} />
      </button>
    );
  }

  // Full 3-segment control
  return (
    <div
      className={cn(
        'flex items-center gap-0.5 p-1 rounded-xl bg-surface-100',
        className,
      )}
      role="group"
      aria-label="Theme selector"
    >
      {THEME_OPTIONS.map(opt => {
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            aria-pressed={active}
            title={opt.description}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              active
                ? 'bg-white dark:bg-surface-700 text-surface-900 shadow-sm'
                : 'text-surface-500 hover:text-surface-700',
            )}
          >
            <Icon name={opt.icon} size={16} />
            <span>{themeLabel(opt.id)}</span>
          </button>
        );
      })}
    </div>
  );
});
