/**
 * AdminFilters — reusable pill-style filter button group.
 */
import React from 'react';
import { cn } from '@/utils/cn';

interface FilterOption {
  value: string;
  label: string;
}

interface AdminFiltersProps {
  options: FilterOption[];
  value: string;
  onChange: (v: string) => void;
}

export const AdminFilters = React.memo(function AdminFilters({
  options,
  value,
  onChange,
}: AdminFiltersProps) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map(opt => (
        <button
          key={opt.value}
          className={cn(
            'px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border',
            value === opt.value
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-surface-50 text-surface-500 border-surface-200 hover:border-primary-300'
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
});
