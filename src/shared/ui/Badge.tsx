import { memo } from 'react';
import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';
import { componentTokens } from '@/theme/tokens';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
type BadgeSize    = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children:  ReactNode;
  variant?:  BadgeVariant;
  size?:     BadgeSize;
  className?: string;
  dot?:      boolean;
}

const SIZES: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2   py-0.5 text-sm',
  lg: 'px-2.5 py-1   text-sm',
};

const DOT_COLORS: Record<BadgeVariant, string> = {
  default: 'bg-surface-500',
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger:  'bg-danger-500',
  info:    'bg-blue-500',
};

export const Badge = memo(function Badge({
  children,
  variant = 'default',
  size    = 'sm',
  dot,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full',
        componentTokens.badge[variant],
        SIZES[size],
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', DOT_COLORS[variant])} />
      )}
      {children}
    </span>
  );
});
