// ─── Barrel: re-exports all domain API modules ────────────────────────────────
// Maintains the same public surface as the original monolithic api.ts so
// all existing imports (`from '@/infrastructure/database/api'`) continue to work.

export type { ApiRes } from './_shared';

export * from './auth.api';
export * from './content.api';
export * from './admin-content.api';
export * from './community.api';
export * from './quiz.api';
export * from './admin.api';
export * from './notifications.api';
export * from './data.api';
