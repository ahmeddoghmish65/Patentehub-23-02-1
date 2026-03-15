import { memo, useCallback } from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';

interface PaginationProps {
  page:        number;
  totalPages:  number;
  onChange:    (page: number) => void;
  className?:  string;
  /** RTL-aware: pass dir from useTranslation */
  dir?:        'rtl' | 'ltr';
}

export const Pagination = memo(function Pagination({
  page,
  totalPages,
  onChange,
  className,
  dir = 'ltr',
}: PaginationProps) {
  const prev = useCallback(() => onChange(Math.max(1, page - 1)), [onChange, page]);
  const next = useCallback(() => onChange(Math.min(totalPages, page + 1)), [onChange, page, totalPages]);

  if (totalPages <= 1) return null;

  const prevIcon = dir === 'rtl' ? 'chevron_right' : 'chevron_left';
  const nextIcon = dir === 'rtl' ? 'chevron_left'  : 'chevron_right';

  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      <PaginationButton
        onClick={prev}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <Icon name={prevIcon} size={18} />
      </PaginationButton>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <PaginationButton
          key={p}
          onClick={() => onChange(p)}
          active={p === page}
        >
          {p}
        </PaginationButton>
      ))}

      <PaginationButton
        onClick={next}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <Icon name={nextIcon} size={18} />
      </PaginationButton>
    </div>
  );
});

// ── Internal button ───────────────────────────────────────────────────────────

interface PbProps {
  onClick:    () => void;
  disabled?:  boolean;
  active?:    boolean;
  children:   React.ReactNode;
  'aria-label'?: string;
}

function PaginationButton({ onClick, disabled, active, children, ...rest }: PbProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors',
        active
          ? 'bg-primary-600 text-white'
          : 'text-surface-600 hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed',
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
