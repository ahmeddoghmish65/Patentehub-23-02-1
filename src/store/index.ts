/**
 * Store barrel — import from here throughout the app.
 *
 * New domain stores (preferred):
 *   useContentStore   — sections, lessons, questions, signs, dictionary
 *   useCommunityStore — posts, comments, likes, notifications
 *   useProgressStore  — quiz history, mistakes, progress
 *
 * Legacy store (backward compatible):
 *   useDataStore — re-exports all data from the three domain stores above
 *
 * Usage:
 *   import { useAuthStore, useContentStore, useCommunityStore } from '@/store';
 *   import { useDataStore } from '@/store'; // backward compat
 */
export { useAuthStore }      from './auth.store';
export { useDataStore }      from './data.store';        // backward compat
export { useContentStore }   from './content.store';
export { useCommunityStore } from './community.store';
export { useProgressStore }  from './progress.store';
export { useAdminStore }     from './admin.store';
export { applyTheme }        from './helpers';
