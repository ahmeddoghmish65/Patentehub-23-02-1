import { memo } from 'react';
import { cn } from '@/shared/utils/cn';

type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoaderProps {
  size?:      LoaderSize;
  className?: string;
  /** Show full-screen overlay */
  fullScreen?: boolean;
  /** Optional accessible label */
  label?:     string;
}

const SIZE_MAP: Record<LoaderSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-4',
};

export const Loader = memo(function Loader({
  size = 'md',
  className,
  fullScreen,
  label = 'Loading…',
}: LoaderProps) {
  const spinner = (
    <div
      role="status"
      aria-label={label}
      className={cn(
        'animate-spin rounded-full border-primary-200 border-t-primary-600',
        SIZE_MAP[size],
        className,
      )}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-surface-50/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  return spinner;
});
