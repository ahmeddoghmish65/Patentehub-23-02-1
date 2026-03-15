/**
 * profile.service.ts
 * Service layer for user profile management.
 * Stores/components MUST use this — never call Supabase directly.
 *
 * Architecture: store → profile.service → supabase-auth / db/api → data
 */
import * as api from '@/infrastructure/database/api';
import type { User } from '@/shared/types';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getUserById(
  token: string,
): Promise<ServiceResult<Omit<User, 'password'>>> {
  return api.apiGetUser(token);
}

export async function updateProfile(
  token: string,
  data: { name?: string; avatar?: string },
): Promise<ServiceResult<Omit<User, 'password'>>> {
  return api.apiUpdateProfile(token, data);
}

export async function updateSettings(
  token: string,
  settings: Partial<User['settings']>,
): Promise<ServiceResult<User['settings']>> {
  return api.apiUpdateSettings(token, settings);
}

export async function updateProgress(
  token: string,
  progress: Partial<User['progress']>,
): Promise<ServiceResult<User['progress']>> {
  return api.apiUpdateProgress(token, progress);
}

export async function checkUsername(
  username: string,
): Promise<{ available: boolean; suggestions: string[] }> {
  const r = await api.apiCheckUsername(username);
  return r.data ?? { available: false, suggestions: [] };
}
