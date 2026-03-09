/**
 * services/supabase/index.ts
 * Barrel export for all Supabase service modules.
 * Import specific services from here, not from the individual files.
 */
export * as authService    from './auth.service';
export * as questionsService from './questions.service';
export * as progressService  from './progress.service';
export * as communityService from './community.service';
export * as profileService   from './profile.service';
export { supabase } from './client';
