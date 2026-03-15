/**
 * AdminSearch — reusable search input for admin tables.
 */
import React from 'react';

interface AdminSearchProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export const AdminSearch = React.memo(function AdminSearch({
  value,
  onChange,
  placeholder = 'بحث...',
  className = '',
}: AdminSearchProps) {
  return (
    <input
      type="search"
      className={`border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary-400 bg-white dark:bg-surface-100 dark:text-surface-900 ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
});
