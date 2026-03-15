/**
 * Data Store — manages all content data (sections, lessons, questions, etc.)
 * and community data (posts, comments, notifications).
 */
import { create } from 'zustand';
import * as api from '@/infrastructure/database/api';
import type { PostSortMode } from '@/infrastructure/database/api';
import type {
  Section, Lesson, Question, Sign, SignSection,
  DictionarySection, DictionaryEntry, Post, Comment,
  QuizResult, UserMistake, Notification,
} from '@/shared/types';
import { useAuthStore } from './auth.store';

interface DataState {
  // Content
  sections: Section[];
  lessons: Lesson[];
  questions: Question[];
  signs: Sign[];
  signSections: SignSection[];
  dictSections: DictionarySection[];
  dictEntries: DictionaryEntry[];

  // Community
  posts: Post[];
  communityNotifs: unknown[];

  // User data
  quizHistory: QuizResult[];
  mistakes: UserMistake[];
  notifications: Notification[];

  // Loading flags per resource
  loadingSections: boolean;
  loadingLessons: boolean;
  loadingPosts: boolean;

  // Actions — content
  loadSections: () => Promise<void>;
  loadLessons: (sectionId?: string) => Promise<void>;
  loadQuestions: (lessonId?: string, sectionId?: string) => Promise<void>;
  loadSigns: (category?: string) => Promise<void>;
  loadSignSections: () => Promise<void>;
  loadDictSections: () => Promise<void>;
  loadDictEntries: (sectionId?: string) => Promise<void>;

  // Actions — community
  loadPosts: (sortMode?: PostSortMode, hashtag?: string) => Promise<void>;
  createPost: (content: string, image: string) => Promise<boolean>;
  updatePost: (id: string, content: string) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  toggleLike: (postId: string) => Promise<{ liked: boolean; count: number } | null>;
  checkLike: (postId: string) => Promise<boolean>;
  getComments: (postId: string) => Promise<Comment[]>;
  createComment: (postId: string, content: string) => Promise<boolean>;
  deleteComment: (id: string) => Promise<boolean>;
  createReport: (type: 'post' | 'comment' | 'user', targetId: string, reason: string) => Promise<boolean>;

  // Actions — community notifications
  loadCommunityNotifs: () => Promise<void>;
  markNotifRead: (id: string) => Promise<void>;
  markAllNotifsRead: () => Promise<void>;

  // Actions — user data
  loadQuizHistory: () => Promise<void>;
  loadMistakes: () => Promise<void>;
  practiceMistake: (questionId: string, correct: boolean) => Promise<void>;
  loadNotifications: () => Promise<void>;
  saveQuizResult: (result: Omit<QuizResult, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
}

const token = () => useAuthStore.getState().token;
const userId = () => useAuthStore.getState().user?.id ?? null;
const userLang = () => useAuthStore.getState().user?.settings.language;

export const useDataStore = create<DataState>((set, get) => ({
  sections: [],
  lessons: [],
  questions: [],
  signs: [],
  signSections: [],
  dictSections: [],
  dictEntries: [],
  posts: [],
  communityNotifs: [],
  quizHistory: [],
  mistakes: [],
  notifications: [],
  loadingSections: false,
  loadingLessons: false,
  loadingPosts: false,

  // ─── Content ──────────────────────────────────────────────────────────────

  loadSections: async () => {
    set({ loadingSections: true });
    const r = await api.apiGetSections();
    if (r.success && r.data) set({ sections: r.data });
    set({ loadingSections: false });
  },

  loadLessons: async (sId) => {
    set({ loadingLessons: true });
    const r = await api.apiGetLessons(sId);
    if (r.success && r.data) set({ lessons: r.data });
    set({ loadingLessons: false });
  },

  loadQuestions: async (lId, sId) => {
    const r = await api.apiGetQuestions(lId, sId);
    if (r.success && r.data) set({ questions: r.data });
  },

  loadSigns: async (cat) => {
    const r = await api.apiGetSigns(cat);
    if (r.success && r.data) set({ signs: r.data });
  },

  loadSignSections: async () => {
    const r = await api.apiGetSignSections();
    if (r.success && r.data) set({ signSections: r.data });
  },

  loadDictSections: async () => {
    const r = await api.apiGetDictSections();
    if (r.success && r.data) set({ dictSections: r.data });
  },

  loadDictEntries: async (sId) => {
    const r = await api.apiGetDictEntries(sId);
    if (r.success && r.data) set({ dictEntries: r.data });
  },

  // ─── Community ────────────────────────────────────────────────────────────

  loadPosts: async (sortMode = 'hot', hashtag) => {
    set({ loadingPosts: true });
    const r = await api.apiGetPosts(sortMode, hashtag, userLang());
    if (r.success && r.data) set({ posts: r.data });
    set({ loadingPosts: false });
  },

  createPost: async (content, image) => {
    const t = token();
    if (!t) return false;
    const r = await api.apiCreatePost(t, content, image);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  updatePost: async (id, content) => {
    const t = token();
    if (!t) return false;
    const r = await api.apiUpdatePost(t, id, content);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  deletePost: async (id) => {
    const t = token();
    if (!t) return false;
    const r = await api.apiDeletePost(t, id);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  toggleLike: async (postId) => {
    const t = token();
    if (!t) return null;
    const r = await api.apiToggleLike(t, postId);
    if (r.success && r.data) { await get().loadPosts(); return r.data; }
    return null;
  },

  checkLike: async (postId) => {
    const t = token();
    if (!t) return false;
    const r = await api.apiCheckLike(t, postId);
    return r.data ?? false;
  },

  getComments: async (postId) => {
    const r = await api.apiGetComments(postId);
    return r.data ?? [];
  },

  createComment: async (postId, content) => {
    const t = token();
    if (!t) return false;
    const r = await api.apiCreateComment(t, postId, content);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  deleteComment: async (id) => {
    const t = token();
    if (!t) return false;
    const r = await api.apiDeleteComment(t, id);
    if (r.success) await get().loadPosts();
    return r.success;
  },

  createReport: async (type, targetId, reason) => {
    const t = token();
    if (!t) return false;
    const r = await api.apiCreateReport(t, type, targetId, reason);
    return r.success;
  },

  loadCommunityNotifs: async () => {
    const uid = userId();
    if (!uid) return;
    const notifs = await api.apiGetCommunityNotifs(uid);
    set({ communityNotifs: notifs });
  },

  markNotifRead: async (id) => {
    await api.apiMarkNotifRead(id);
    await get().loadCommunityNotifs();
  },

  markAllNotifsRead: async () => {
    const uid = userId();
    if (!uid) return;
    await api.apiMarkAllNotifsRead(uid);
    await get().loadCommunityNotifs();
  },

  // ─── User data ────────────────────────────────────────────────────────────

  loadQuizHistory: async () => {
    const t = token();
    if (!t) return;
    const r = await api.apiGetQuizHistory(t);
    if (r.success && r.data) set({ quizHistory: r.data });
  },

  loadMistakes: async () => {
    const t = token();
    if (!t) return;
    const r = await api.apiGetUserMistakes(t);
    if (r.success && r.data) set({ mistakes: r.data });
  },

  practiceMistake: async (questionId, correct) => {
    const t = token();
    if (!t) return;
    await api.apiPracticeMistake(t, questionId, correct);
    const r = await api.apiGetUserMistakes(t);
    if (r.success && r.data) set({ mistakes: r.data });
  },

  loadNotifications: async () => {
    const t = token();
    if (!t) return;
    const r = await api.apiGetNotifications(t);
    if (r.success && r.data) set({ notifications: r.data });
  },

  saveQuizResult: async (result) => {
    const t = token();
    if (!t) return;
    await api.apiSaveQuizResult(t, result);
    // Refresh user progress in auth store
    await useAuthStore.getState().refreshUser();
  },
}));
