/**
 * AdminCard — generic card wrapper used throughout admin tabs.
 */
import React from 'react';
import { cn } from '@/shared/utils/cn';

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export const AdminCard = React.memo(function AdminCard({
  children,
  className = '',
  padding = 'p-5',
}: AdminCardProps) {
  return (
    <div className={cn('bg-white rounded-xl border border-surface-100', padding, className)}>
      {children}
    </div>
  );
});
