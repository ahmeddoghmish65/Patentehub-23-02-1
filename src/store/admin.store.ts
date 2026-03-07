/**
 * Admin Store — manages all admin-only state and operations.
 */
import { create } from 'zustand';
import * as api from '@/db/api';
import type {
  User, Section, Lesson, Question, Sign, SignSection,
  DictionarySection, DictionaryEntry, Post, Comment, Report, AdminLog,
} from '@/types';
import { useAuthStore } from './auth.store';
import { useDataStore } from './data.store';

interface AdminState {
  adminUsers: Omit<User, 'password'>[];
  adminReports: Report[];
  adminLogs: AdminLog[];
  adminStats: {
    totalUsers: number; totalPosts: number; totalQuestions: number;
    totalSections: number; totalLessons: number; totalSigns: number;
    totalReports: number; activeToday: number;
  } | null;
  deletedPosts: Post[];
  deletedComments: (Comment & { postContent?: string })[];
  deletedUsers: Omit<User, 'password'>[];

  // User management
  loadAdminUsers: () => Promise<void>;
  banUser: (userId: string, banned: boolean) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  restoreUser: (id: string) => Promise<boolean>;
  permanentDeleteUser: (id: string) => Promise<boolean>;
  loadDeletedUsers: () => Promise<void>;
  setCommunityRestrictions: (userId: string, r: { canPost?: boolean; canComment?: boolean; canReply?: boolean }) => Promise<boolean>;
  seedData: () => Promise<boolean>;

  // Reports & Logs
  loadAdminReports: () => Promise<void>;
  updateReport: (id: string, status: 'reviewed' | 'dismissed') => Promise<boolean>;
  loadAdminLogs: () => Promise<void>;
  deleteAdminLogsByDateRange: (from: string, to: string) => Promise<number>;
  loadAdminStats: () => Promise<void>;

  // Content CRUD — Sections
  createSection: (data: Omit<Section, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSection: (id: string, data: Partial<Section>) => Promise<boolean>;
  deleteSection: (id: string) => Promise<boolean>;
  archiveSection: (id: string, archive: boolean) => Promise<boolean>;
  restoreSection: (id: string) => Promise<boolean>;
  permanentDeleteSection: (id: string) => Promise<boolean>;

  // Content CRUD — Lessons
  createLesson: (data: Omit<Lesson, 'id' | 'createdAt'>) => Promise<boolean>;
  updateLesson: (id: string, data: Partial<Lesson>) => Promise<boolean>;
  deleteLesson: (id: string) => Promise<boolean>;
  archiveLesson: (id: string, archive: boolean) => Promise<boolean>;
  restoreLesson: (id: string) => Promise<boolean>;
  permanentDeleteLesson: (id: string) => Promise<boolean>;

  // Content CRUD — Questions
  createQuestion: (data: Omit<Question, 'id' | 'createdAt'>) => Promise<boolean>;
  updateQuestion: (id: string, data: Partial<Question>) => Promise<boolean>;
  deleteQuestion: (id: string) => Promise<boolean>;
  archiveQuestion: (id: string, archive: boolean) => Promise<boolean>;
  restoreQuestion: (id: string) => Promise<boolean>;
  permanentDeleteQuestion: (id: string) => Promise<boolean>;
  bulkDeleteQuestions: (ids: string[]) => Promise<boolean>;
  bulkPermanentDeleteQuestions: (ids: string[]) => Promise<boolean>;
  bulkArchiveQuestions: (ids: string[], archive: boolean) => Promise<boolean>;
  bulkRestoreQuestions: (ids: string[]) => Promise<boolean>;

  // Content CRUD — Signs
  createSign: (data: Omit<Sign, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSign: (id: string, data: Partial<Sign>) => Promise<boolean>;
  deleteSign: (id: string) => Promise<boolean>;
  archiveSign: (id: string, archive: boolean) => Promise<boolean>;
  restoreSign: (id: string) => Promise<boolean>;
  permanentDeleteSign: (id: string) => Promise<boolean>;

  // Content CRUD — Sign Sections
  createSignSection: (data: Omit<SignSection, 'id' | 'createdAt'>) => Promise<boolean>;
  updateSignSection: (id: string, data: Partial<SignSection>) => Promise<boolean>;
  deleteSignSection: (id: string) => Promise<boolean>;
  archiveSignSection: (id: string, archive: boolean) => Promise<boolean>;
  restoreSignSection: (id: string) => Promise<boolean>;
  permanentDeleteSignSection: (id: string) => Promise<boolean>;

  // Content CRUD — Dictionary Sections
  createDictSection: (data: Omit<DictionarySection, 'id' | 'createdAt'>) => Promise<boolean>;
  updateDictSection: (id: string, data: Partial<DictionarySection>) => Promise<boolean>;
  deleteDictSection: (id: string) => Promise<boolean>;
  archiveDictSection: (id: string, archive: boolean) => Promise<boolean>;
  restoreDictSection: (id: string) => Promise<boolean>;
  permanentDeleteDictSection: (id: string) => Promise<boolean>;

  // Content CRUD — Dictionary Entries
  createDictEntry: (data: Omit<DictionaryEntry, 'id' | 'createdAt'>) => Promise<boolean>;
  updateDictEntry: (id: string, data: Partial<DictionaryEntry>) => Promise<boolean>;
  deleteDictEntry: (id: string) => Promise<boolean>;
  archiveDictEntry: (id: string, archive: boolean) => Promise<boolean>;
  restoreDictEntry: (id: string) => Promise<boolean>;
  permanentDeleteDictEntry: (id: string) => Promise<boolean>;

  // Admin posts/comments
  adminDeletePost: (id: string) => Promise<boolean>;
  adminDeleteComment: (id: string) => Promise<boolean>;
  loadDeletedPosts: () => Promise<void>;
  loadDeletedComments: () => Promise<void>;
  restorePost: (id: string) => Promise<boolean>;
  permanentDeletePost: (id: string) => Promise<boolean>;
  restoreComment: (id: string) => Promise<boolean>;
  permanentDeleteComment: (id: string) => Promise<boolean>;

  // Import/Export
  exportData: (storeName: string) => Promise<unknown[]>;
  importData: (storeName: string, data: unknown[]) => Promise<number>;

  // Page visit stats
  recordPageVisit: (page: string) => Promise<void>;
  getPageVisitStats: () => Promise<unknown>;
}

const token = () => useAuthStore.getState().token;
const reloadSections = () => useDataStore.getState().loadSections();
const reloadLessons = () => useDataStore.getState().loadLessons();
const reloadQuestions = () => useDataStore.getState().loadQuestions();
const reloadSigns = () => useDataStore.getState().loadSigns();
const reloadSignSections = () => useDataStore.getState().loadSignSections();
const reloadDictSections = () => useDataStore.getState().loadDictSections();
const reloadDictEntries = () => useDataStore.getState().loadDictEntries();
const reloadPosts = () => useDataStore.getState().loadPosts();

export const useAdminStore = create<AdminState>((set, get) => ({
  adminUsers: [],
  adminReports: [],
  adminLogs: [],
  adminStats: null,
  deletedPosts: [],
  deletedComments: [],
  deletedUsers: [],

  // ─── User management ──────────────────────────────────────────────────────
  loadAdminUsers: async () => {
    const t = token(); if (!t) return;
    const r = await api.apiAdminGetUsers(t);
    if (r.success && r.data) set({ adminUsers: r.data });
  },

  banUser: async (userId, banned) => {
    const t = token(); if (!t) return false;
    const r = await api.apiAdminBanUser(t, userId, banned);
    if (r.success) await get().loadAdminUsers();
    return r.success;
  },

  deleteUser: async (userId) => {
    const t = token(); if (!t) return false;
    const r = await api.apiAdminDeleteUser(t, userId);
    if (r.success) { await get().loadAdminUsers(); await get().loadDeletedUsers(); }
    return r.success;
  },

  restoreUser: async (id) => {
    const t = token(); if (!t) return false;
    const r = await api.apiAdminRestoreUser(t, id);
    if (r.success) { await get().loadAdminUsers(); await get().loadDeletedUsers(); }
    return r.success;
  },

  permanentDeleteUser: async (id) => {
    const t = token(); if (!t) return false;
    const r = await api.apiAdminPermanentDeleteUser(t, id);
    if (r.success) await get().loadDeletedUsers();
    return r.success;
  },

  loadDeletedUsers: async () => {
    const t = token(); if (!t) return;
    const r = await api.apiAdminGetDeletedUsers(t);
    if (r.success && r.data) set({ deletedUsers: r.data });
  },

  setCommunityRestrictions: async (userId, restrictions) => {
    const t = token(); if (!t) return false;
    const r = await api.apiSetCommunityRestrictions(t, userId, restrictions);
    if (r.success) await get().loadAdminUsers();
    return r.success;
  },

  seedData: async () => {
    const t = token(); if (!t) return false;
    const r = await api.apiSeedData(t);
    return r.success;
  },

  // ─── Reports & Logs ───────────────────────────────────────────────────────
  loadAdminReports: async () => {
    const t = token(); if (!t) return;
    const r = await api.apiAdminGetReports(t);
    if (r.success && r.data) set({ adminReports: r.data });
  },

  updateReport: async (id, status) => {
    const t = token(); if (!t) return false;
    const r = await api.apiAdminUpdateReport(t, id, status);
    if (r.success) await get().loadAdminReports();
    return r.success;
  },

  loadAdminLogs: async () => {
    const t = token(); if (!t) return;
    const r = await api.apiAdminGetLogs(t);
    if (r.success && r.data) set({ adminLogs: r.data });
  },

  deleteAdminLogsByDateRange: async (from, to) => {
    const t = token(); if (!t) return 0;
    const r = await api.apiAdminDeleteLogsByDateRange(t, from, to);
    if (r.success && r.data) { await get().loadAdminLogs(); return r.data.deleted; }
    return 0;
  },

  loadAdminStats: async () => {
    const t = token(); if (!t) return;
    const r = await api.apiAdminGetStats(t);
    if (r.success && r.data) set({ adminStats: r.data });
  },

  // ─── Sections ─────────────────────────────────────────────────────────────
  createSection: async (data) => { const t = token(); if (!t) return false; const r = await api.apiCreateSection(t, data); if (r.success) await reloadSections(); return r.success; },
  updateSection: async (id, data) => { const t = token(); if (!t) return false; const r = await api.apiUpdateSection(t, id, data); if (r.success) await reloadSections(); return r.success; },
  deleteSection: async (id) => { const t = token(); if (!t) return false; const r = await api.apiDeleteSection(t, id); if (r.success) await reloadSections(); return r.success; },
  archiveSection: async (id, archive) => { const t = token(); if (!t) return false; const r = await api.apiArchiveSection(t, id, archive); if (r.success) await reloadSections(); return r.success; },
  restoreSection: async (id) => { const t = token(); if (!t) return false; const r = await api.apiRestoreSection(t, id); if (r.success) await reloadSections(); return r.success; },
  permanentDeleteSection: async (id) => { const t = token(); if (!t) return false; const r = await api.apiPermanentDeleteSection(t, id); if (r.success) await reloadSections(); return r.success; },

  // ─── Lessons ──────────────────────────────────────────────────────────────
  createLesson: async (data) => { const t = token(); if (!t) return false; const r = await api.apiCreateLesson(t, data); if (r.success) await reloadLessons(); return r.success; },
  updateLesson: async (id, data) => { const t = token(); if (!t) return false; const r = await api.apiUpdateLesson(t, id, data); if (r.success) await reloadLessons(); return r.success; },
  deleteLesson: async (id) => { const t = token(); if (!t) return false; const r = await api.apiDeleteLesson(t, id); if (r.success) await reloadLessons(); return r.success; },
  archiveLesson: async (id, archive) => { const t = token(); if (!t) return false; const r = await api.apiArchiveLesson(t, id, archive); if (r.success) await reloadLessons(); return r.success; },
  restoreLesson: async (id) => { const t = token(); if (!t) return false; const r = await api.apiRestoreLesson(t, id); if (r.success) await reloadLessons(); return r.success; },
  permanentDeleteLesson: async (id) => { const t = token(); if (!t) return false; const r = await api.apiPermanentDeleteLesson(t, id); if (r.success) await reloadLessons(); return r.success; },

  // ─── Questions ────────────────────────────────────────────────────────────
  createQuestion: async (data) => { const t = token(); if (!t) return false; const r = await api.apiCreateQuestion(t, data); if (r.success) await reloadQuestions(); return r.success; },
  updateQuestion: async (id, data) => { const t = token(); if (!t) return false; const r = await api.apiUpdateQuestion(t, id, data); if (r.success) await reloadQuestions(); return r.success; },
  deleteQuestion: async (id) => { const t = token(); if (!t) return false; const r = await api.apiDeleteQuestion(t, id); if (r.success) await reloadQuestions(); return r.success; },
  archiveQuestion: async (id, archive) => { const t = token(); if (!t) return false; const r = await api.apiArchiveQuestion(t, id, archive); if (r.success) await reloadQuestions(); return r.success; },
  restoreQuestion: async (id) => { const t = token(); if (!t) return false; const r = await api.apiRestoreQuestion(t, id); if (r.success) await reloadQuestions(); return r.success; },
  permanentDeleteQuestion: async (id) => { const t = token(); if (!t) return false; const r = await api.apiPermanentDeleteQuestion(t, id); if (r.success) await reloadQuestions(); return r.success; },
  bulkDeleteQuestions: async (ids) => { const t = token(); if (!t) return false; const r = await api.apiBulkDeleteQuestions(t, ids); if (r.success) await reloadQuestions(); return r.success; },
  bulkPermanentDeleteQuestions: async (ids) => { const t = token(); if (!t) return false; const r = await api.apiBulkPermanentDeleteQuestions(t, ids); if (r.success) await reloadQuestions(); return r.success; },
  bulkArchiveQuestions: async (ids, archive) => { const t = token(); if (!t) return false; const r = await api.apiBulkArchiveQuestions(t, ids, archive); if (r.success) await reloadQuestions(); return r.success; },
  bulkRestoreQuestions: async (ids) => { const t = token(); if (!t) return false; const r = await api.apiBulkRestoreQuestions(t, ids); if (r.success) await reloadQuestions(); return r.success; },

  // ─── Signs ────────────────────────────────────────────────────────────────
  createSign: async (data) => { const t = token(); if (!t) return false; const r = await api.apiCreateSign(t, data); if (r.success) await reloadSigns(); return r.success; },
  updateSign: async (id, data) => { const t = token(); if (!t) return false; const r = await api.apiUpdateSign(t, id, data); if (r.success) await reloadSigns(); return r.success; },
  deleteSign: async (id) => { const t = token(); if (!t) return false; const r = await api.apiDeleteSign(t, id); if (r.success) await reloadSigns(); return r.success; },
  archiveSign: async (id, archive) => { const t = token(); if (!t) return false; const r = await api.apiArchiveSign(t, id, archive); if (r.success) await reloadSigns(); return r.success; },
  restoreSign: async (id) => { const t = token(); if (!t) return false; const r = await api.apiRestoreSign(t, id); if (r.success) await reloadSigns(); return r.success; },
  permanentDeleteSign: async (id) => { const t = token(); if (!t) return false; const r = await api.apiPermanentDeleteSign(t, id); if (r.success) await reloadSigns(); return r.success; },

  // ─── Sign Sections ────────────────────────────────────────────────────────
  createSignSection: async (data) => { const t = token(); if (!t) return false; const r = await api.apiCreateSignSection(t, data); if (r.success) await reloadSignSections(); return r.success; },
  updateSignSection: async (id, data) => { const t = token(); if (!t) return false; const r = await api.apiUpdateSignSection(t, id, data); if (r.success) await reloadSignSections(); return r.success; },
  deleteSignSection: async (id) => { const t = token(); if (!t) return false; const r = await api.apiSoftDeleteSignSection(t, id); if (r.success) await reloadSignSections(); return r.success; },
  archiveSignSection: async (id, archive) => { const t = token(); if (!t) return false; const r = await api.apiArchiveSignSection(t, id, archive); if (r.success) await reloadSignSections(); return r.success; },
  restoreSignSection: async (id) => { const t = token(); if (!t) return false; const r = await api.apiRestoreSignSection(t, id); if (r.success) await reloadSignSections(); return r.success; },
  permanentDeleteSignSection: async (id) => { const t = token(); if (!t) return false; const r = await api.apiPermanentDeleteSignSection(t, id); if (r.success) await reloadSignSections(); return r.success; },

  // ─── Dictionary Sections ──────────────────────────────────────────────────
  createDictSection: async (data) => { const t = token(); if (!t) return false; const r = await api.apiCreateDictSection(t, data); if (r.success) await reloadDictSections(); return r.success; },
  updateDictSection: async (id, data) => { const t = token(); if (!t) return false; const r = await api.apiUpdateDictSection(t, id, data); if (r.success) await reloadDictSections(); return r.success; },
  deleteDictSection: async (id) => { const t = token(); if (!t) return false; const r = await api.apiSoftDeleteDictSection(t, id); if (r.success) await reloadDictSections(); return r.success; },
  archiveDictSection: async (id, archive) => { const t = token(); if (!t) return false; const r = await api.apiArchiveDictSection(t, id, archive); if (r.success) await reloadDictSections(); return r.success; },
  restoreDictSection: async (id) => { const t = token(); if (!t) return false; const r = await api.apiRestoreDictSection(t, id); if (r.success) await reloadDictSections(); return r.success; },
  permanentDeleteDictSection: async (id) => { const t = token(); if (!t) return false; const r = await api.apiPermanentDeleteDictSection(t, id); if (r.success) await reloadDictSections(); return r.success; },

  // ─── Dictionary Entries ───────────────────────────────────────────────────
  createDictEntry: async (data) => { const t = token(); if (!t) return false; const r = await api.apiCreateDictEntry(t, data); if (r.success) await reloadDictEntries(); return r.success; },
  updateDictEntry: async (id, data) => { const t = token(); if (!t) return false; const r = await api.apiUpdateDictEntry(t, id, data); if (r.success) await reloadDictEntries(); return r.success; },
  deleteDictEntry: async (id) => { const t = token(); if (!t) return false; const r = await api.apiSoftDeleteDictEntry(t, id); if (r.success) await reloadDictEntries(); return r.success; },
  archiveDictEntry: async (id, archive) => { const t = token(); if (!t) return false; const r = await api.apiArchiveDictEntry(t, id, archive); if (r.success) await reloadDictEntries(); return r.success; },
  restoreDictEntry: async (id) => { const t = token(); if (!t) return false; const r = await api.apiRestoreDictEntry(t, id); if (r.success) await reloadDictEntries(); return r.success; },
  permanentDeleteDictEntry: async (id) => { const t = token(); if (!t) return false; const r = await api.apiPermanentDeleteDictEntry(t, id); if (r.success) await reloadDictEntries(); return r.success; },

  // ─── Admin posts/comments ─────────────────────────────────────────────────
  adminDeletePost: async (id) => { const t = token(); if (!t) return false; const r = await api.apiAdminSoftDeletePost(t, id); if (r.success) { await reloadPosts(); await get().loadDeletedPosts(); } return r.success; },
  adminDeleteComment: async (id) => { const t = token(); if (!t) return false; const r = await api.apiAdminSoftDeleteComment(t, id); if (r.success) await get().loadDeletedComments(); return r.success; },
  loadDeletedPosts: async () => { const t = token(); if (!t) return; const r = await api.apiAdminGetDeletedPosts(t); if (r.success && r.data) set({ deletedPosts: r.data }); },
  loadDeletedComments: async () => { const t = token(); if (!t) return; const r = await api.apiAdminGetDeletedComments(t); if (r.success && r.data) set({ deletedComments: r.data as (Comment & { postContent?: string })[] }); },
  restorePost: async (id) => { const t = token(); if (!t) return false; const r = await api.apiAdminRestorePost(t, id); if (r.success) { await reloadPosts(); await get().loadDeletedPosts(); } return r.success; },
  permanentDeletePost: async (id) => { const t = token(); if (!t) return false; const r = await api.apiAdminPermanentDeletePost(t, id); if (r.success) await get().loadDeletedPosts(); return r.success; },
  restoreComment: async (id) => { const t = token(); if (!t) return false; const r = await api.apiAdminRestoreComment(t, id); if (r.success) await get().loadDeletedComments(); return r.success; },
  permanentDeleteComment: async (id) => { const t = token(); if (!t) return false; const r = await api.apiAdminPermanentDeleteComment(t, id); if (r.success) await get().loadDeletedComments(); return r.success; },

  // ─── Import / Export ──────────────────────────────────────────────────────
  exportData: async (storeName) => { const t = token(); if (!t) return []; const r = await api.apiExportData(t, storeName); return (r.data ?? []) as unknown[]; },
  importData: async (storeName, data) => { const t = token(); if (!t) return 0; const r = await api.apiImportData(t, storeName, data); return (r.data ?? 0) as number; },

  // ─── Page visit tracking ──────────────────────────────────────────────────
  recordPageVisit: async (page) => {
    const uid = useAuthStore.getState().user?.id ?? null;
    let sessionId = sessionStorage.getItem('ph_session');
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2);
      sessionStorage.setItem('ph_session', sessionId);
    }
    await api.apiRecordPageVisit(uid, page, sessionId);
  },

  getPageVisitStats: async () => api.apiGetPageVisitStats(),
}));
