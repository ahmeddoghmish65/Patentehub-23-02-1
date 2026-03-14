/**
 * postStore.ts
 * Manages posts, likes, and per-post liker avatars.
 */
import { create } from 'zustand';
import { useAuthStore } from '@/store/auth.store';
import { getDB } from '@/db/database';
import * as postService from '../services/postService';
import type { Post, PostSortMode, PostLiker } from '../types';

interface PostState {
  posts: Post[];
  loadingPosts: boolean;
  likes: Record<string, boolean>;
  postLikers: Record<string, PostLiker[]>;

  // Actions — posts
  loadPosts: (sortMode?: PostSortMode, hashtag?: string) => Promise<void>;
  createPost: (content: string, image: string) => Promise<boolean>;
  updatePost: (id: string, content: string) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;

  // Actions — likes
  toggleLike: (postId: string) => Promise<{ liked: boolean; count: number } | null>;
  checkLike: (postId: string) => Promise<boolean>;
  checkAllLikes: (postIds: string[]) => Promise<void>;

  // Actions — admin moderation
  pinPost: (postId: string, pinned: boolean) => Promise<void>;
  featurePost: (postId: string, featured: boolean) => Promise<void>;
  lockPost: (postId: string, locked: boolean) => Promise<void>;

  // Internal
  loadPostLikers: (posts: Post[]) => Promise<void>;
}

const token = () => useAuthStore.getState().token;
const userLang = () => useAuthStore.getState().user?.settings.language;

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  loadingPosts: false,
  likes: {},
  postLikers: {},

  // ── Posts ──────────────────────────────────────────────────────────────────

  loadPosts: async (sortMode = 'hot', hashtag) => {
    set({ loadingPosts: true });
    const r = await postService.getPosts(sortMode, hashtag, userLang());
    if (r.success && r.data) {
      set({ posts: r.data });
      await get().loadPostLikers(r.data);
    }
    set({ loadingPosts: false });
  },

  createPost: async (content, image) => {
    const t = token();
    if (!t) return false;
    const r = await postService.createPost(t, content, image);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  updatePost: async (id, content) => {
    const t = token();
    if (!t) return false;
    const r = await postService.updatePost(t, id, content);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  deletePost: async (id) => {
    const t = token();
    if (!t) return false;
    const r = await postService.deletePost(t, id);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  // ── Likes ──────────────────────────────────────────────────────────────────

  toggleLike: async (postId) => {
    const t = token();
    if (!t) return null;
    const r = await postService.toggleLike(t, postId);
    if (r.success && r.data) {
      set(state => ({
        likes: { ...state.likes, [postId]: r.data!.liked },
      }));
      return r.data;
    }
    return null;
  },

  checkLike: async (postId) => {
    const t = token();
    if (!t) return false;
    const liked = await postService.checkLike(t, postId);
    set(state => ({ likes: { ...state.likes, [postId]: liked } }));
    return liked;
  },

  checkAllLikes: async (postIds) => {
    const t = token();
    if (!t) return;
    const results = await Promise.all(postIds.map(id => postService.checkLike(t, id)));
    const likesMap: Record<string, boolean> = {};
    postIds.forEach((id, i) => { likesMap[id] = results[i]; });
    set(state => ({ likes: { ...state.likes, ...likesMap } }));
  },

  // ── Admin moderation ───────────────────────────────────────────────────────

  pinPost: async (postId, pinned) => {
    const t = token();
    if (!t) return;
    await postService.pinPost(t, postId, pinned);
  },

  featurePost: async (postId, featured) => {
    const t = token();
    if (!t) return;
    await postService.featurePost(t, postId, featured);
  },

  lockPost: async (postId, locked) => {
    const t = token();
    if (!t) return;
    await postService.lockPost(t, postId, locked);
  },

  // ── Likers ─────────────────────────────────────────────────────────────────

  loadPostLikers: async (posts) => {
    if (!posts.length) return;
    const db = await getDB();
    const allLikes = await db.getAll('likes');
    const allUsers = await db.getAll('users');
    const userMap: Record<string, { name: string; avatar: string }> = {};
    for (const u of allUsers) userMap[u.id] = { name: u.name, avatar: u.avatar || '' };
    const map: Record<string, PostLiker[]> = {};
    for (const l of allLikes) {
      if (!map[l.postId]) map[l.postId] = [];
      map[l.postId].push({
        userId: l.userId,
        userName: userMap[l.userId]?.name || 'مستخدم',
        userAvatar: userMap[l.userId]?.avatar || '',
      });
    }
    set({ postLikers: map });
  },
}));
