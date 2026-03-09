/**
 * community.store.ts
 * Domain store for community features: posts, comments, likes, notifications.
 *
 * Extracted from the monolithic data.store.ts.
 * Architecture: component → useCommunityStore → communityService → db/api
 */
import { create } from 'zustand';
import * as communityService from '@/services/supabase/community.service';
import type { PostSortMode } from '@/db/api';
import type { Post, Comment } from '@/types';
import { useAuthStore } from './auth.store';

interface CommunityState {
  // Data
  posts:          Post[];
  communityNotifs: unknown[];

  // Loading
  loadingPosts: boolean;

  // Actions — posts
  loadPosts:    (sortMode?: PostSortMode, hashtag?: string) => Promise<void>;
  createPost:   (content: string, image: string) => Promise<boolean>;
  updatePost:   (id: string, content: string) => Promise<boolean>;
  deletePost:   (id: string) => Promise<boolean>;

  // Actions — likes
  toggleLike:   (postId: string) => Promise<{ liked: boolean; count: number } | null>;
  checkLike:    (postId: string) => Promise<boolean>;

  // Actions — comments
  getComments:    (postId: string) => Promise<Comment[]>;
  createComment:  (postId: string, content: string) => Promise<boolean>;
  deleteComment:  (id: string) => Promise<boolean>;

  // Actions — reports
  createReport: (
    type: 'post' | 'comment' | 'user',
    targetId: string,
    reason: string,
  ) => Promise<boolean>;

  // Actions — notifications
  loadCommunityNotifs:  () => Promise<void>;
  markNotifRead:        (id: string) => Promise<void>;
  markAllNotifsRead:    () => Promise<void>;
}

const token = () => useAuthStore.getState().token;
const userId = () => useAuthStore.getState().user?.id ?? null;
const userLang = () => useAuthStore.getState().user?.settings.language;

export const useCommunityStore = create<CommunityState>((set, get) => ({
  posts:           [],
  communityNotifs: [],
  loadingPosts:    false,

  // ── Posts ──────────────────────────────────────────────────────────────────

  loadPosts: async (sortMode = 'hot', hashtag) => {
    set({ loadingPosts: true });
    const r = await communityService.getPosts(sortMode, hashtag, userLang());
    if (r.success && r.data) set({ posts: r.data });
    set({ loadingPosts: false });
  },

  createPost: async (content, image) => {
    const t = token();
    if (!t) return false;
    const r = await communityService.createPost(t, content, image);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  updatePost: async (id, content) => {
    const t = token();
    if (!t) return false;
    const r = await communityService.updatePost(t, id, content);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  deletePost: async (id) => {
    const t = token();
    if (!t) return false;
    const r = await communityService.deletePost(t, id);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  // ── Likes ──────────────────────────────────────────────────────────────────

  toggleLike: async (postId) => {
    const t = token();
    if (!t) return null;
    const r = await communityService.toggleLike(t, postId);
    if (r.success && r.data) {
      await get().loadPosts();
      return r.data;
    }
    return null;
  },

  checkLike: async (postId) => {
    const t = token();
    if (!t) return false;
    return communityService.checkLike(t, postId);
  },

  // ── Comments ───────────────────────────────────────────────────────────────

  getComments: async (postId) => {
    return communityService.getComments(postId);
  },

  createComment: async (postId, content) => {
    const t = token();
    if (!t) return false;
    const r = await communityService.createComment(t, postId, content);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  deleteComment: async (id) => {
    const t = token();
    if (!t) return false;
    const r = await communityService.deleteComment(t, id);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  // ── Reports ────────────────────────────────────────────────────────────────

  createReport: async (type, targetId, reason) => {
    const t = token();
    if (!t) return false;
    const r = await communityService.createReport(t, type, targetId, reason);
    return r.success;
  },

  // ── Notifications ──────────────────────────────────────────────────────────

  loadCommunityNotifs: async () => {
    const uid = userId();
    if (!uid) return;
    const notifs = await communityService.getCommunityNotifs(uid);
    set({ communityNotifs: notifs });
  },

  markNotifRead: async (id) => {
    await communityService.markNotifRead(id);
    await get().loadCommunityNotifs();
  },

  markAllNotifsRead: async () => {
    const uid = userId();
    if (!uid) return;
    await communityService.markAllNotifsRead(uid);
    await get().loadCommunityNotifs();
  },
}));
