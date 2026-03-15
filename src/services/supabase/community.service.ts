/**
 * community.service.ts
 * Service layer for community: posts, comments, likes, reports, notifications.
 * Components MUST NOT call db/api directly — use this service.
 *
 * Architecture: component → hook → community.service → db/api → data
 */
import * as api from '@/infrastructure/database/api';
import type { PostSortMode } from '@/infrastructure/database/api';
import type { Post, Comment } from '@/shared/types';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Posts ─────────────────────────────────────────────────────────────────────

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
): Promise<ServiceResult<void>> {
  return api.apiCreatePost(token, content, image);
}

export async function updatePost(
  token: string,
  id: string,
  content: string,
): Promise<ServiceResult<void>> {
  return api.apiUpdatePost(token, id, content);
}

export async function deletePost(
  token: string,
  id: string,
): Promise<ServiceResult<void>> {
  return api.apiDeletePost(token, id);
}

// ── Likes ─────────────────────────────────────────────────────────────────────

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

// ── Comments ──────────────────────────────────────────────────────────────────

export async function getComments(postId: string): Promise<Comment[]> {
  const r = await api.apiGetComments(postId);
  return r.data ?? [];
}

export async function createComment(
  token: string,
  postId: string,
  content: string,
): Promise<ServiceResult<void>> {
  return api.apiCreateComment(token, postId, content);
}

export async function deleteComment(
  token: string,
  id: string,
): Promise<ServiceResult<void>> {
  return api.apiDeleteComment(token, id);
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function createReport(
  token: string,
  type: 'post' | 'comment' | 'user',
  targetId: string,
  reason: string,
): Promise<ServiceResult<void>> {
  return api.apiCreateReport(token, type, targetId, reason);
}

// ── Community Notifications ───────────────────────────────────────────────────

export async function getCommunityNotifs(userId: string): Promise<unknown[]> {
  return api.apiGetCommunityNotifs(userId);
}

export async function markNotifRead(id: string): Promise<void> {
  await api.apiMarkNotifRead(id);
}

export async function markAllNotifsRead(userId: string): Promise<void> {
  await api.apiMarkAllNotifsRead(userId);
}
