/**
 * progress.service.ts
 * Service layer for user progress: quiz history, mistakes, notifications.
 * Components/stores MUST use this — never call db/api directly.
 *
 * Architecture: store → progress.service → db/api → data
 */
import * as api from '@/infrastructure/database/api';
import type { QuizResult, UserMistake, Notification } from '@/shared/types';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Quiz History ──────────────────────────────────────────────────────────────

export async function getQuizHistory(
  token: string,
): Promise<ServiceResult<QuizResult[]>> {
  return api.apiGetQuizHistory(token);
}

export async function saveQuizResult(
  token: string,
  result: Omit<QuizResult, 'id' | 'userId' | 'createdAt'>,
): Promise<ServiceResult<void>> {
  await api.apiSaveQuizResult(token, result);
  return { success: true };
}

// ── Mistakes ──────────────────────────────────────────────────────────────────

export async function getMistakes(
  token: string,
): Promise<ServiceResult<UserMistake[]>> {
  return api.apiGetUserMistakes(token);
}

export async function practiceMistake(
  token: string,
  questionId: string,
  correct: boolean,
): Promise<ServiceResult<void>> {
  await api.apiPracticeMistake(token, questionId, correct);
  return { success: true };
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function getNotifications(
  token: string,
): Promise<ServiceResult<Notification[]>> {
  return api.apiGetNotifications(token);
}
