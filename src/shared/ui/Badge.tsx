import { memo } from 'react';
import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary';
type BadgeSize    = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children:  ReactNode;
  variant?:  BadgeVariant;
  size?:     BadgeSize;
  className?: string;
  dot?:      boolean;
}

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-surface-100 text-surface-600',
  primary: 'bg-primary-100 text-primary-700',
  success: 'bg-success-50  text-success-700',
  warning: 'bg-warning-50  text-warning-700',
  danger:  'bg-danger-50   text-danger-700',
  info:    'bg-blue-50     text-blue-700',
};

const SIZES: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2   py-0.5 text-sm',
  lg: 'px-2.5 py-1   text-sm',
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
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', {
          'bg-surface-500': variant === 'default',
          'bg-primary-500': variant === 'primary',
          'bg-success-500': variant === 'success',
          'bg-warning-500': variant === 'warning',
          'bg-danger-500':  variant === 'danger',
          'bg-blue-500':    variant === 'info',
        })} />
      )}
      {children}
    </span>
  );
});
