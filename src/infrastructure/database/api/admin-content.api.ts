import {
  getDB,
  type Section, type Lesson, type Question, type Sign, type SignSection,
  type DictionarySection, type DictionaryEntry,
} from '../database';
import { isAdmin, ok, err } from './_shared';
import type { ApiRes } from './_shared';

// ============ ADMIN — GET ALL CONTENT (including archived/deleted) ============
export async function apiAdminGetAllSections(token: string): Promise<ApiRes<Section[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('sections');
  all.sort((a, b) => a.order - b.order);
  return ok(all);
}

export async function apiAdminGetAllLessons(token: string): Promise<ApiRes<Lesson[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('lessons');
  all.sort((a, b) => a.order - b.order);
  return ok(all);
}

export async function apiAdminGetAllQuestions(token: string): Promise<ApiRes<Question[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('questions');
  all.sort((a, b) => a.order - b.order);
  return ok(all);
}

export async function apiAdminGetAllSigns(token: string): Promise<ApiRes<Sign[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('signs');
  all.sort((a, b) => a.order - b.order);
  return ok(all);
}

export async function apiAdminGetAllSignSections(token: string): Promise<ApiRes<SignSection[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('signSections');
  all.sort((a, b) => a.order - b.order);
  return ok(all);
}

export async function apiAdminGetAllDictSections(token: string): Promise<ApiRes<DictionarySection[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('dictionarySections');
  all.sort((a, b) => a.order - b.order);
  return ok(all);
}

export async function apiAdminGetAllDictEntries(token: string): Promise<ApiRes<DictionaryEntry[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('dictionaryEntries');
  all.sort((a, b) => a.order - b.order);
  return ok(all);
}

export type { ApiRes };
