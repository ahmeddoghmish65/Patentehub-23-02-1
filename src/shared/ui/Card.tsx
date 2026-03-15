import { memo } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface CardProps {
  children:    ReactNode;
  className?:  string;
  /** Click handler makes the card interactive */
  onClick?:    () => void;
  /** Removes default padding */
  noPadding?:  boolean;
  /** Adds a hover lift effect */
  hoverable?:  boolean;
}

export const Card = memo(function Card({
  children,
  className,
  onClick,
  noPadding  = false,
  hoverable  = false,
}: CardProps) {
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      className={cn(
        'bg-white dark:bg-surface-100 rounded-2xl border border-surface-100',
        'transition-colors duration-200',
        !noPadding && 'p-4',
        hoverable && 'hover:shadow-md hover:border-primary-100 dark:hover:border-primary-800 transition-all duration-200',
        onClick && 'w-full text-start cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
});
