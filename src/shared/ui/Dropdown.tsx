import { memo, useState, useRef, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';

export interface DropdownItem {
  label:    string;
  value:    string;
  icon?:    string;
  danger?:  boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger:   ReactNode;
  items:     DropdownItem[];
  onSelect:  (value: string) => void;
  align?:    'start' | 'end';
  className?: string;
}

export const Dropdown = memo(function Dropdown({
  trigger,
  items,
  onSelect,
  align     = 'end',
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>

      {open && (
        <div
          className={cn(
            'absolute z-40 mt-1 min-w-[10rem]',
            'bg-white dark:bg-surface-100 rounded-xl shadow-lg',
            'border border-surface-100 py-1 overflow-hidden',
            'transition-colors duration-200',
            align === 'end' ? 'end-0' : 'start-0',
          )}
        >
          {items.map((item) => (
            <button
              key={item.value}
              disabled={item.disabled}
              onClick={() => { onSelect(item.value); close(); }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm text-start transition-colors',
                item.danger
                  ? 'text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10'
                  : 'text-surface-700 hover:bg-surface-50',
                item.disabled && 'opacity-50 cursor-not-allowed',
              )}
            >
              {item.icon && <Icon name={item.icon} size={16} />}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});
