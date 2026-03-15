import {
  getDB, generateId,
  type Section, type Lesson, type Question, type Sign, type SignSection,
  type DictionarySection, type DictionaryEntry,
} from '../database';
import { isAdmin, logAdmin, ok, err } from './_shared';
import type { ApiRes } from './_shared';

// ============ SECTIONS API ============
export async function apiGetSections(): Promise<ApiRes<Section[]>> {
  const db = await getDB();
  const all = await db.getAll('sections');
  all.sort((a, b) => a.order - b.order);
  return ok(all.filter(s => !s.status || s.status === 'active'));
}

export async function apiCreateSection(token: string, data: Omit<Section, 'id' | 'createdAt'>): Promise<ApiRes<Section>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const s: Section = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('sections', s);
  await logAdmin(token, 'إنشاء قسم', s.nameAr);
  return ok(s, 201);
}

export async function apiUpdateSection(token: string, id: string, data: Partial<Section>): Promise<ApiRes<Section>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('sections', id);
  if (!s) return err('قسم غير موجود', 404);
  Object.assign(s, data);
  await db.put('sections', s);
  return ok(s);
}

export async function apiDeleteSection(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('sections', id);
  if (!s) return err('غير موجود', 404);
  s.status = 'deleted';
  s.deletedAt = new Date().toISOString();
  await db.put('sections', s);
  await logAdmin(token, 'حذف قسم', s.nameAr);
  return ok(null);
}

export async function apiArchiveSection(token: string, id: string, archive: boolean): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('sections', id);
  if (!s) return err('غير موجود', 404);
  s.status = archive ? 'archived' : 'active';
  if (!archive) s.deletedAt = undefined;
  await db.put('sections', s);
  await logAdmin(token, archive ? 'أرشفة قسم' : 'استعادة قسم', s.nameAr);
  return ok(null);
}

export async function apiRestoreSection(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('sections', id);
  if (!s) return err('غير موجود', 404);
  s.status = 'active';
  s.deletedAt = undefined;
  await db.put('sections', s);
  await logAdmin(token, 'استعادة قسم', s.nameAr);
  return ok(null);
}

export async function apiPermanentDeleteSection(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  await db.delete('sections', id);
  await logAdmin(token, 'حذف نهائي قسم', id);
  return ok(null);
}

// ============ LESSONS API ============
export async function apiGetLessons(sectionId?: string): Promise<ApiRes<Lesson[]>> {
  const db = await getDB();
  let all: Lesson[];
  if (sectionId) { all = await db.getAllFromIndex('lessons', 'sectionId', sectionId); }
  else { all = await db.getAll('lessons'); }
  all.sort((a, b) => a.order - b.order);
  return ok(all.filter(l => !l.status || l.status === 'active'));
}

export async function apiGetLesson(id: string): Promise<ApiRes<Lesson>> {
  const db = await getDB();
  const l = await db.get('lessons', id);
  if (!l) return err('درس غير موجود', 404);
  return ok(l);
}

export async function apiCreateLesson(token: string, data: Omit<Lesson, 'id' | 'createdAt'>): Promise<ApiRes<Lesson>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const l: Lesson = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('lessons', l);
  await logAdmin(token, 'إنشاء درس', l.titleAr);
  return ok(l, 201);
}

export async function apiUpdateLesson(token: string, id: string, data: Partial<Lesson>): Promise<ApiRes<Lesson>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const l = await db.get('lessons', id);
  if (!l) return err('درس غير موجود', 404);
  Object.assign(l, data);
  await db.put('lessons', l);
  return ok(l);
}

export async function apiDeleteLesson(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const l = await db.get('lessons', id);
  if (!l) return err('غير موجود', 404);
  l.status = 'deleted';
  l.deletedAt = new Date().toISOString();
  await db.put('lessons', l);
  await logAdmin(token, 'حذف درس', l.titleAr);
  return ok(null);
}

export async function apiArchiveLesson(token: string, id: string, archive: boolean): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const l = await db.get('lessons', id);
  if (!l) return err('غير موجود', 404);
  l.status = archive ? 'archived' : 'active';
  if (!archive) l.deletedAt = undefined;
  await db.put('lessons', l);
  await logAdmin(token, archive ? 'أرشفة درس' : 'استعادة درس', l.titleAr);
  return ok(null);
}

export async function apiRestoreLesson(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const l = await db.get('lessons', id);
  if (!l) return err('غير موجود', 404);
  l.status = 'active';
  l.deletedAt = undefined;
  await db.put('lessons', l);
  await logAdmin(token, 'استعادة درس', l.titleAr);
  return ok(null);
}

export async function apiPermanentDeleteLesson(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  await db.delete('lessons', id);
  await logAdmin(token, 'حذف نهائي درس', id);
  return ok(null);
}

// ============ QUESTIONS API ============
export async function apiGetQuestions(lessonId?: string, sectionId?: string): Promise<ApiRes<Question[]>> {
  const db = await getDB();
  let all: Question[];
  if (lessonId) { all = await db.getAllFromIndex('questions', 'lessonId', lessonId); }
  else if (sectionId) { all = await db.getAllFromIndex('questions', 'sectionId', sectionId); }
  else { all = await db.getAll('questions'); }
  all.sort((a, b) => a.order - b.order);
  return ok(all.filter(q => !q.status || q.status === 'active'));
}

export async function apiCreateQuestion(token: string, data: Omit<Question, 'id' | 'createdAt'>): Promise<ApiRes<Question>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const q: Question = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('questions', q);
  await logAdmin(token, 'إنشاء سؤال', q.questionAr.substring(0, 50));
  return ok(q, 201);
}

export async function apiUpdateQuestion(token: string, id: string, data: Partial<Question>): Promise<ApiRes<Question>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const q = await db.get('questions', id);
  if (!q) return err('سؤال غير موجود', 404);
  Object.assign(q, data);
  await db.put('questions', q);
  return ok(q);
}

export async function apiDeleteQuestion(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const q = await db.get('questions', id);
  if (!q) return err('غير موجود', 404);
  q.status = 'deleted';
  q.deletedAt = new Date().toISOString();
  await db.put('questions', q);
  await logAdmin(token, 'حذف سؤال', q.questionAr.substring(0, 40));
  return ok(null);
}

export async function apiArchiveQuestion(token: string, id: string, archive: boolean): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const q = await db.get('questions', id);
  if (!q) return err('غير موجود', 404);
  q.status = archive ? 'archived' : 'active';
  if (!archive) q.deletedAt = undefined;
  await db.put('questions', q);
  await logAdmin(token, archive ? 'أرشفة سؤال' : 'استعادة سؤال', q.questionAr.substring(0, 40));
  return ok(null);
}

export async function apiRestoreQuestion(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const q = await db.get('questions', id);
  if (!q) return err('غير موجود', 404);
  q.status = 'active';
  q.deletedAt = undefined;
  await db.put('questions', q);
  await logAdmin(token, 'استعادة سؤال', q.questionAr.substring(0, 40));
  return ok(null);
}

export async function apiPermanentDeleteQuestion(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  await db.delete('questions', id);
  await logAdmin(token, 'حذف نهائي سؤال', id);
  return ok(null);
}

// ============ BULK QUESTIONS API (single transaction) ============
export async function apiBulkDeleteQuestions(token: string, ids: string[]): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const tx = db.transaction('questions', 'readwrite');
  const now = new Date().toISOString();
  for (const id of ids) {
    const q = await tx.store.get(id);
    if (q) { q.status = 'deleted'; q.deletedAt = now; await tx.store.put(q); }
  }
  await tx.done;
  await logAdmin(token, 'حذف مجموعة أسئلة', `${ids.length} سؤال`);
  return ok(null);
}

export async function apiBulkPermanentDeleteQuestions(token: string, ids: string[]): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const tx = db.transaction('questions', 'readwrite');
  for (const id of ids) { await tx.store.delete(id); }
  await tx.done;
  await logAdmin(token, 'حذف نهائي مجموعة أسئلة', `${ids.length} سؤال`);
  return ok(null);
}

export async function apiBulkArchiveQuestions(token: string, ids: string[], archive: boolean): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const tx = db.transaction('questions', 'readwrite');
  for (const id of ids) {
    const q = await tx.store.get(id);
    if (q) { q.status = archive ? 'archived' : 'active'; if (!archive) q.deletedAt = undefined; await tx.store.put(q); }
  }
  await tx.done;
  await logAdmin(token, archive ? 'أرشفة مجموعة أسئلة' : 'استعادة أرشيف أسئلة', `${ids.length} سؤال`);
  return ok(null);
}

export async function apiBulkRestoreQuestions(token: string, ids: string[]): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const tx = db.transaction('questions', 'readwrite');
  for (const id of ids) {
    const q = await tx.store.get(id);
    if (q) { q.status = 'active'; q.deletedAt = undefined; await tx.store.put(q); }
  }
  await tx.done;
  await logAdmin(token, 'استعادة مجموعة أسئلة', `${ids.length} سؤال`);
  return ok(null);
}

// ============ SIGNS API ============
export async function apiGetSigns(category?: string): Promise<ApiRes<Sign[]>> {
  const db = await getDB();
  let all: Sign[];
  if (category) { all = await db.getAllFromIndex('signs', 'category', category); }
  else { all = await db.getAll('signs'); }
  all.sort((a, b) => a.order - b.order);
  return ok(all.filter(s => !s.status || s.status === 'active'));
}

export async function apiCreateSign(token: string, data: Omit<Sign, 'id' | 'createdAt'>): Promise<ApiRes<Sign>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const s: Sign = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('signs', s);
  return ok(s, 201);
}

export async function apiUpdateSign(token: string, id: string, data: Partial<Sign>): Promise<ApiRes<Sign>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('signs', id); if (!s) return err('إشارة غير موجودة', 404);
  Object.assign(s, data); await db.put('signs', s);
  return ok(s);
}

export async function apiDeleteSign(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('signs', id);
  if (!s) return err('غير موجود', 404);
  s.status = 'deleted';
  s.deletedAt = new Date().toISOString();
  await db.put('signs', s);
  await logAdmin(token, 'حذف إشارة', s.nameAr);
  return ok(null);
}

export async function apiArchiveSign(token: string, id: string, archive: boolean): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('signs', id);
  if (!s) return err('غير موجود', 404);
  s.status = archive ? 'archived' : 'active';
  if (!archive) s.deletedAt = undefined;
  await db.put('signs', s);
  await logAdmin(token, archive ? 'أرشفة إشارة' : 'استعادة إشارة', s.nameAr);
  return ok(null);
}

export async function apiRestoreSign(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('signs', id);
  if (!s) return err('غير موجود', 404);
  s.status = 'active';
  s.deletedAt = undefined;
  await db.put('signs', s);
  await logAdmin(token, 'استعادة إشارة', s.nameAr);
  return ok(null);
}

export async function apiPermanentDeleteSign(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  await db.delete('signs', id);
  await logAdmin(token, 'حذف نهائي إشارة', id);
  return ok(null);
}

// ============ SIGN SECTIONS API ============
export async function apiGetSignSections(): Promise<ApiRes<SignSection[]>> {
  const db = await getDB();
  const all = await db.getAll('signSections');
  all.sort((a, b) => a.order - b.order);
  return ok(all.filter(s => !s.status || s.status === 'active'));
}
export async function apiCreateSignSection(token: string, data: Omit<SignSection, 'id' | 'createdAt'>): Promise<ApiRes<SignSection>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const s: SignSection = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('signSections', s);
  return ok(s, 201);
}
export async function apiUpdateSignSection(token: string, id: string, data: Partial<SignSection>): Promise<ApiRes<SignSection>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('signSections', id); if (!s) return err('غير موجود', 404);
  Object.assign(s, data); await db.put('signSections', s);
  return ok(s);
}
export async function apiSoftDeleteSignSection(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('signSections', id); if (!s) return err('غير موجود', 404);
  s.status = 'deleted'; await db.put('signSections', s); return ok(null);
}
export async function apiArchiveSignSection(token: string, id: string, archive: boolean): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('signSections', id); if (!s) return err('غير موجود', 404);
  s.status = archive ? 'archived' : 'active'; await db.put('signSections', s); return ok(null);
}
export async function apiRestoreSignSection(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('signSections', id); if (!s) return err('غير موجود', 404);
  s.status = 'active'; await db.put('signSections', s); return ok(null);
}
export async function apiPermanentDeleteSignSection(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB(); await db.delete('signSections', id); return ok(null);
}

// ============ DICTIONARY API ============
export async function apiGetDictSections(): Promise<ApiRes<DictionarySection[]>> {
  const db = await getDB();
  const all = await db.getAll('dictionarySections');
  all.sort((a, b) => a.order - b.order);
  return ok(all.filter(s => !s.status || s.status === 'active'));
}

export async function apiCreateDictSection(token: string, data: Omit<DictionarySection, 'id' | 'createdAt'>): Promise<ApiRes<DictionarySection>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const s: DictionarySection = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('dictionarySections', s);
  return ok(s, 201);
}

export async function apiUpdateDictSection(token: string, id: string, data: Partial<DictionarySection>): Promise<ApiRes<DictionarySection>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('dictionarySections', id); if (!s) return err('غير موجود', 404);
  Object.assign(s, data); await db.put('dictionarySections', s);
  return ok(s);
}

export async function apiSoftDeleteDictSection(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('dictionarySections', id); if (!s) return err('غير موجود', 404);
  s.status = 'deleted'; await db.put('dictionarySections', s);
  return ok(null);
}

export async function apiArchiveDictSection(token: string, id: string, archive: boolean): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('dictionarySections', id); if (!s) return err('غير موجود', 404);
  s.status = archive ? 'archived' : 'active'; await db.put('dictionarySections', s);
  return ok(null);
}

export async function apiRestoreDictSection(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const s = await db.get('dictionarySections', id); if (!s) return err('غير موجود', 404);
  s.status = 'active'; await db.put('dictionarySections', s);
  return ok(null);
}

export async function apiPermanentDeleteDictSection(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB(); await db.delete('dictionarySections', id);
  return ok(null);
}

export async function apiSoftDeleteDictEntry(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const e = await db.get('dictionaryEntries', id); if (!e) return err('غير موجود', 404);
  e.status = 'deleted'; await db.put('dictionaryEntries', e);
  return ok(null);
}

export async function apiArchiveDictEntry(token: string, id: string, archive: boolean): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const e = await db.get('dictionaryEntries', id); if (!e) return err('غير موجود', 404);
  e.status = archive ? 'archived' : 'active'; await db.put('dictionaryEntries', e);
  return ok(null);
}

export async function apiRestoreDictEntry(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const e = await db.get('dictionaryEntries', id); if (!e) return err('غير موجود', 404);
  e.status = 'active'; await db.put('dictionaryEntries', e);
  return ok(null);
}

export async function apiPermanentDeleteDictEntry(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB(); await db.delete('dictionaryEntries', id);
  return ok(null);
}

export async function apiGetDictEntries(sectionId?: string): Promise<ApiRes<DictionaryEntry[]>> {
  const db = await getDB();
  let all: DictionaryEntry[];
  if (sectionId) { all = await db.getAllFromIndex('dictionaryEntries', 'sectionId', sectionId); }
  else { all = await db.getAll('dictionaryEntries'); }
  all.sort((a, b) => a.order - b.order);
  return ok(all.filter(e => !e.status || e.status === 'active'));
}

export async function apiCreateDictEntry(token: string, data: Omit<DictionaryEntry, 'id' | 'createdAt'>): Promise<ApiRes<DictionaryEntry>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const e: DictionaryEntry = { ...data, id: generateId(), createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('dictionaryEntries', e);
  return ok(e, 201);
}

export async function apiUpdateDictEntry(token: string, id: string, data: Partial<DictionaryEntry>): Promise<ApiRes<DictionaryEntry>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const e = await db.get('dictionaryEntries', id); if (!e) return err('غير موجود', 404);
  Object.assign(e, data); await db.put('dictionaryEntries', e);
  return ok(e);
}

export type { ApiRes };
