/**
 * commentService.ts
 * Comment CRUD operations.
 */
import * as api from '@/infrastructure/database/api';
import type { Comment } from '../types';

export interface ServiceResult {
  success: boolean;
  error?: string;
}

export async function getComments(postId: string): Promise<Comment[]> {
  const r = await api.apiGetComments(postId);
  return r.data ?? [];
}

export async function createComment(
  token: string,
  postId: string,
  content: string,
): Promise<ServiceResult> {
  const r = await api.apiCreateComment(token, postId, content);
  return { success: r.success, error: r.error };
}

export async function deleteComment(
  token: string,
  id: string,
): Promise<ServiceResult> {
  const r = await api.apiDeleteComment(token, id);
  return { success: r.success, error: (r as { error?: string }).error };
}
