import { memo } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { componentTokens, tokens } from '@/theme/tokens';

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
  const base = hoverable ? componentTokens.cardHoverable : componentTokens.card;

  return (
    <Tag
      className={cn(
        base,
        !noPadding && tokens.spacing.card,
        onClick && 'w-full text-start cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </Tag>
  );
});
