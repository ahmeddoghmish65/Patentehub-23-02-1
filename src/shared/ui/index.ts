/**
 * shared/ui/index.ts
 * Barrel export for the shared UI component system.
 *
 * Import UI components from here:
 *   import { Button, Badge, Modal } from '@/shared/ui';
 *
 * Note: Button, Input, Icon, VerifiedBadge currently live in
 * src/components/ui/ for backward compatibility. They are re-exported
 * here so consumers can use a single import path.
 */
export { Button }        from '@/components/ui/Button';
export { Input }         from '@/components/ui/Input';
export { Icon }          from '@/components/ui/Icon';
export { VerifiedBadge } from '@/components/ui/VerifiedBadge';

// New components added during refactor
export { Badge }         from './Badge';
export { Card }          from './Card';
export { Loader }        from './Loader';
export { Modal }         from './Modal';
export { Pagination }    from './Pagination';
export { Dropdown }      from './Dropdown';
export type { DropdownItem } from './Dropdown';
