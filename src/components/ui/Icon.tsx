import { memo } from 'react';
import { cn } from '@/utils/cn';

interface IconProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const Icon = memo(function Icon({ name, filled = false, size = 24, className, style }: IconProps) {
  return (
    <span
      className={cn(
        'material-symbols-rounded select-none',
        filled && 'filled',
        className
      )}
      style={{ fontSize: size, ...style }}
      translate="no"
      aria-hidden="true"
    >
      {name}
    </span>
  );
});
