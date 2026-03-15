import { memo, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import { componentTokens, tokens } from '@/theme/tokens';

interface ModalProps {
  open:         boolean;
  onClose:      () => void;
  title?:       string;
  children:     ReactNode;
  footer?:      ReactNode;
  size?:        'sm' | 'md' | 'lg' | 'xl';
  className?:   string;
  /** Prevent closing when clicking backdrop */
  persistent?:  boolean;
}

const SIZE_MAP = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
} as const;

export const Modal = memo(function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size       = 'md',
  className,
  persistent = false,
}: ModalProps) {
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !persistent) onClose();
  }, [onClose, persistent]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className={cn('absolute inset-0', tokens.bg.overlay)}
        onClick={persistent ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={cn(componentTokens.modal, SIZE_MAP[size], className)}>
        {/* Header */}
        {(title || !persistent) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-0 shrink-0">
            {title && (
              <h2 id="modal-title" className={cn(tokens.type.h3, tokens.text.primary)}>
                {title}
              </h2>
            )}
            {!persistent && (
              <button
                onClick={onClose}
                className={cn(
                  'ms-auto p-1.5 rounded-lg',
                  tokens.text.placeholder,
                  'hover:text-surface-600 hover:bg-surface-100',
                  tokens.transition.colors,
                )}
                aria-label="Close"
              >
                <Icon name="close" size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={cn('px-6 pb-5 pt-0 shrink-0 border-t', tokens.border.default)}>
            <div className="pt-4">{footer}</div>
          </div>
        )}
      </div>
    </div>
  );
});
