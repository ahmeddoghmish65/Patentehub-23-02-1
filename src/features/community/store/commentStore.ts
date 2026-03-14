/**
 * commentStore.ts
 * Manages comments, detail comments, and local comment-like state.
 */
import { create } from 'zustand';
import { useAuthStore } from '@/store/auth.store';
import * as commentService from '../services/commentService';
import type { Comment } from '../types';

interface CommentState {
  comments: Comment[];
  detailComments: Comment[];
  commentLikes: Record<string, boolean>;
  commentLikeCounts: Record<string, number>;

  loadComments: (postId: string) => Promise<Comment[]>;
  loadDetailComments: (postId: string) => Promise<void>;
  createComment: (postId: string, content: string) => Promise<boolean>;
  deleteComment: (id: string) => Promise<boolean>;
  toggleCommentLike: (commentId: string, userId: string) => void;
  initFromStorage: (userId: string) => void;
}

const token = () => useAuthStore.getState().token;

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  detailComments: [],
  commentLikes: {},
  commentLikeCounts: {},

  loadComments: async (postId) => {
    const c = await commentService.getComments(postId);
    set({ comments: c });
    return c;
  },

  loadDetailComments: async (postId) => {
    const c = await commentService.getComments(postId);
    set({ detailComments: c, comments: c });
  },

  createComment: async (postId, content) => {
    const t = token();
    if (!t) return false;
    const r = await commentService.createComment(t, postId, content);
    if (r.success) {
      const c = await commentService.getComments(postId);
      set({ comments: c });
    }
    return r.success;
  },

  deleteComment: async (id) => {
    const t = token();
    if (!t) return false;
    const r = await commentService.deleteComment(t, id);
    return r.success;
  },

  toggleCommentLike: (commentId, userId) => {
    set(state => {
      const wasLiked = state.commentLikes[commentId];
      const commentLikes = { ...state.commentLikes, [commentId]: !wasLiked };
      const commentLikeCounts = {
        ...state.commentLikeCounts,
        [commentId]: Math.max(0, (state.commentLikeCounts[commentId] || 0) + (wasLiked ? -1 : 1)),
      };
      try {
        localStorage.setItem(`commentLikes_${userId}`, JSON.stringify(commentLikes));
        localStorage.setItem(`commentLikeCounts_${userId}`, JSON.stringify(commentLikeCounts));
      } catch { /* ignore */ }
      return { commentLikes, commentLikeCounts };
    });
  },

  initFromStorage: (userId) => {
    try {
      const cl = localStorage.getItem(`commentLikes_${userId}`);
      if (cl) set({ commentLikes: JSON.parse(cl) });
    } catch { /* ignore */ }
    try {
      const clc = localStorage.getItem(`commentLikeCounts_${userId}`);
      if (clc) set({ commentLikeCounts: JSON.parse(clc) });
    } catch { /* ignore */ }
  },
}));
