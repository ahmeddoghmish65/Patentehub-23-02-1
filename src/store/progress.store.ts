/**
 * progress.store.ts
 * Domain store for user learning progress: quiz history, mistakes, notifications.
 *
 * Extracted from the monolithic data.store.ts.
 * Architecture: component → useProgressStore → progressService → db/api
 */
import { create } from 'zustand';
import * as progressService from '@/services/supabase/progress.service';
import type { QuizResult, UserMistake, Notification } from '@/shared/types';
import { useAuthStore } from './auth.store';

interface ProgressState {
  // Data
  quizHistory:   QuizResult[];
  mistakes:      UserMistake[];
  notifications: Notification[];

  // Actions
  loadQuizHistory:  () => Promise<void>;
  loadMistakes:     () => Promise<void>;
  practiceMistake:  (questionId: string, correct: boolean) => Promise<void>;
  loadNotifications:() => Promise<void>;
  saveQuizResult:   (result: Omit<QuizResult, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
}

const token = () => useAuthStore.getState().token;

export const useProgressStore = create<ProgressState>((set) => ({
  quizHistory:   [],
  mistakes:      [],
  notifications: [],

  loadQuizHistory: async () => {
    const t = token();
    if (!t) return;
    const r = await progressService.getQuizHistory(t);
    if (r.success && r.data) set({ quizHistory: r.data });
  },

  loadMistakes: async () => {
    const t = token();
    if (!t) return;
    const r = await progressService.getMistakes(t);
    if (r.success && r.data) set({ mistakes: r.data });
  },

  practiceMistake: async (questionId, correct) => {
    const t = token();
    if (!t) return;
    await progressService.practiceMistake(t, questionId, correct);
    // Reload to get updated mistake counts
    const r = await progressService.getMistakes(t);
    if (r.success && r.data) set({ mistakes: r.data });
  },

  loadNotifications: async () => {
    const t = token();
    if (!t) return;
    const r = await progressService.getNotifications(t);
    if (r.success && r.data) set({ notifications: r.data });
  },

  saveQuizResult: async (result) => {
    const t = token();
    if (!t) return;
    await progressService.saveQuizResult(t, result);
    // Refresh user progress in auth store
    await useAuthStore.getState().refreshUser();
  },
}));
