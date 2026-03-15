import type { ReactNode } from 'react';
import { Icon } from '@/shared/ui/Icon';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/**
 * EmptyState — shown when a list or section has no data.
 *
 * Usage:
 *   <EmptyState
 *     icon="search_off"
 *     title="No results found"
 *     description="Try adjusting your search"
 *     action={<Button onClick={clear}>Clear filters</Button>}
 *   />
 */
export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon name={icon} size={32} className="text-surface-400" />
      </div>
      <h3 className="text-base font-semibold text-surface-700 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-surface-400 max-w-xs mb-6">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
