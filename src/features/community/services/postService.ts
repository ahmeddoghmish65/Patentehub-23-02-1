/**
 * postService.ts
 * Post CRUD + admin moderation (pin / feature / lock).
 */
import * as api from '@/db/api';
import type { PostSortMode } from '@/db/api';
import type { Post } from '../types';

export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function getPosts(
  sortMode: PostSortMode = 'hot',
  hashtag?: string,
  lang?: string,
): Promise<ServiceResult<Post[]>> {
  return api.apiGetPosts(sortMode, hashtag, lang as 'ar' | 'it' | 'both' | undefined);
}

export async function createPost(
  token: string,
  content: string,
  image: string,
): Promise<ServiceResult> {
  const r = await api.apiCreatePost(token, content, image);
  return { success: r.success, error: r.error };
}

export async function updatePost(
  token: string,
  id: string,
  content: string,
): Promise<ServiceResult> {
  const r = await api.apiUpdatePost(token, id, content);
  return { success: r.success, error: r.error };
}

export async function deletePost(
  token: string,
  id: string,
): Promise<ServiceResult> {
  const r = await api.apiDeletePost(token, id);
  return { success: r.success, error: (r as { error?: string }).error };
}

export async function toggleLike(
  token: string,
  postId: string,
): Promise<ServiceResult<{ liked: boolean; count: number }>> {
  return api.apiToggleLike(token, postId);
}

export async function checkLike(
  token: string,
  postId: string,
): Promise<boolean> {
  const r = await api.apiCheckLike(token, postId);
  return r.data ?? false;
}

// ── Admin moderation ──────────────────────────────────────────────────────────

export async function pinPost(
  token: string,
  postId: string,
  pinned: boolean,
): Promise<void> {
  await api.apiPinPost(token, postId, pinned);
}

export async function featurePost(
  token: string,
  postId: string,
  featured: boolean,
): Promise<void> {
  await api.apiFeaturePost(token, postId, featured);
}

export async function lockPost(
  token: string,
  postId: string,
  locked: boolean,
): Promise<void> {
  await api.apiLockPost(token, postId, locked);
}
