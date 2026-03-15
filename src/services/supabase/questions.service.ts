/**
 * questions.service.ts
 * Service layer for content: sections, lessons, questions, signs, dictionary.
 * Components/stores MUST NOT call the DB layer directly — use this service.
 *
 * Architecture: store → questions.service → db/api (IndexedDB) → data
 *
 * When migrating to Supabase tables, only this file needs updating.
 */
import * as api from '@/infrastructure/database/api';
import type {
  Section, Lesson, Question, Sign, SignSection,
  DictionarySection, DictionaryEntry,
} from '@/shared/types';

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ── Sections ─────────────────────────────────────────────────────────────────

export async function getSections(): Promise<ServiceResult<Section[]>> {
  return api.apiGetSections();
}

export async function getSectionById(id: string): Promise<ServiceResult<Section>> {
  const r = await api.apiGetSections();
  const section = r.data?.find(s => s.id === id);
  if (!section) return { success: false, error: 'Section not found' };
  return { success: true, data: section };
}

// ── Lessons ───────────────────────────────────────────────────────────────────

export async function getLessons(sectionId?: string): Promise<ServiceResult<Lesson[]>> {
  return api.apiGetLessons(sectionId);
}

export async function getLessonById(id: string): Promise<ServiceResult<Lesson>> {
  const r = await api.apiGetLessons();
  const lesson = r.data?.find(l => l.id === id);
  if (!lesson) return { success: false, error: 'Lesson not found' };
  return { success: true, data: lesson };
}

// ── Questions ─────────────────────────────────────────────────────────────────

export async function getQuestions(
  lessonId?: string,
  sectionId?: string,
): Promise<ServiceResult<Question[]>> {
  return api.apiGetQuestions(lessonId, sectionId);
}

export async function getRandomQuestions(
  count: number,
  sectionId?: string,
): Promise<ServiceResult<Question[]>> {
  const r = await api.apiGetQuestions(undefined, sectionId);
  if (!r.success || !r.data) return r;
  const shuffled = [...r.data].sort(() => Math.random() - 0.5).slice(0, count);
  return { success: true, data: shuffled };
}

// ── Signs ─────────────────────────────────────────────────────────────────────

export async function getSigns(category?: string): Promise<ServiceResult<Sign[]>> {
  return api.apiGetSigns(category);
}

export async function getSignSections(): Promise<ServiceResult<SignSection[]>> {
  return api.apiGetSignSections();
}

// ── Dictionary ────────────────────────────────────────────────────────────────

export async function getDictionarySections(): Promise<ServiceResult<DictionarySection[]>> {
  return api.apiGetDictSections();
}

export async function getDictionaryEntries(
  sectionId?: string,
): Promise<ServiceResult<DictionaryEntry[]>> {
  return api.apiGetDictEntries(sectionId);
}
