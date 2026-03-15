import { memo } from 'react';
import { cn } from '@/shared/utils/cn';
import type { InputHTMLAttributes } from 'react';
import { Icon } from './Icon';
import { componentTokens, tokens } from '@/theme/tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string;
}

export const Input = memo(function Input({ label, error, icon, className, ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className={cn('block mb-1.5', tokens.type.label, tokens.text.secondary)}>
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400">
            <Icon name={icon} size={20} />
          </div>
        )}
        <input
          className={cn(
            componentTokens.input,
            icon && 'pr-11',
            error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-100',
            className,
          )}
          {...props}
        />
      </div>
      {error && (
        <p className={cn('mt-1 flex items-center gap-1', tokens.type.caption, tokens.text.danger)}>
          <Icon name="error" size={16} />
          {error}
        </p>
      )}
    </div>
  );
});
