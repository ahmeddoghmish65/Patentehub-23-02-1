import {
  getDB,
  type User, type Post, type Comment, type Report, type AdminLog,
} from '../database';
import { isAdmin, logAdmin, ok, err } from './_shared';
import type { ApiRes } from './_shared';
import { calculateExamReadiness } from '../services/examReadinessService';
import { decrementHashtags } from '../services/hashtagService';

export async function apiAdminGetUsers(token: string): Promise<ApiRes<Omit<User, 'password'>[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('users');
  const allLessons = await db.getAll('lessons');
  const activeUsers = all.filter(u => !u.status || u.status === 'active');

  const allQuestions = await db.getAll('questions');
  const usersWithReadiness = await Promise.all(activeUsers.map(async (user) => {
    const allResults = await db.getAllFromIndex('quizResults', 'userId', user.id);
    const allMistakes = await db.getAllFromIndex('userMistakes', 'userId', user.id);
    const readiness = calculateExamReadiness({
      quizHistory: allResults,
      mistakes: allMistakes,
      progress: user.progress,
      totalLessons: allLessons.length,
      totalQuestions: allQuestions.length,
    });
    user.progress.examReadiness = readiness.score;
    const { password: _, ...safe } = user; void _;
    return safe;
  }));

  return ok(usersWithReadiness);
}

export async function apiAdminBanUser(token: string, userId: string, banned: boolean): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const user = await db.get('users', userId); if (!user) return err('مستخدم غير موجود', 404);
  user.isBanned = banned;
  await db.put('users', user);
  await logAdmin(token, banned ? 'حظر مستخدم' : 'إلغاء حظر', user.email);
  return ok(null);
}

export async function apiAdminDeleteUser(token: string, userId: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const u = await db.get('users', userId); if (!u) return err('غير موجود', 404);
  u.status = 'deleted';
  u.deletedAt = new Date().toISOString();
  await db.put('users', u);
  await logAdmin(token, 'حذف مستخدم (ناعم)', userId);
  return ok(null);
}

export async function apiAdminRestoreUser(token: string, userId: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const u = await db.get('users', userId); if (!u) return err('غير موجود', 404);
  u.status = 'active';
  delete u.deletedAt;
  await db.put('users', u);
  await logAdmin(token, 'استعادة مستخدم', userId);
  return ok(null);
}

export async function apiAdminPermanentDeleteUser(token: string, userId: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  await db.delete('users', userId);
  await logAdmin(token, 'حذف مستخدم نهائياً', userId);
  return ok(null);
}

export async function apiAdminGetDeletedUsers(token: string): Promise<ApiRes<Omit<User, 'password'>[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('users');
  return ok(all.filter(u => u.status === 'deleted').map(u => { const { password: _, ...safe } = u; void _; return safe; }));
}

export async function apiAdminSoftDeletePost(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const p = await db.get('posts', id); if (!p) return err('غير موجود', 404);
  p.status = 'deleted';
  p.deletedAt = new Date().toISOString();
  await db.put('posts', p);
  await logAdmin(token, 'حذف منشور (ناعم)', id);
  return ok(null);
}

export async function apiAdminRestorePost(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const p = await db.get('posts', id); if (!p) return err('غير موجود', 404);
  p.status = 'active';
  delete p.deletedAt;
  await db.put('posts', p);
  await logAdmin(token, 'استعادة منشور', id);
  return ok(null);
}

export async function apiAdminPermanentDeletePost(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const p = await db.get('posts', id); if (!p) return err('غير موجود', 404);
  decrementHashtags(p.hashtags ?? []).catch(() => {});
  await db.delete('posts', id);
  const comments = await db.getAllFromIndex('comments', 'postId', id);
  for (const c of comments) await db.delete('comments', c.id);
  const likes = await db.getAllFromIndex('likes', 'postId', id);
  for (const l of likes) await db.delete('likes', l.id);
  await logAdmin(token, 'حذف منشور نهائياً', id);
  return ok(null);
}

export async function apiAdminGetDeletedPosts(token: string): Promise<ApiRes<Post[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('posts');
  const deleted = all.filter(p => p.status === 'deleted');
  deleted.sort((a, b) => new Date(b.deletedAt!).getTime() - new Date(a.deletedAt!).getTime());
  return ok(deleted);
}

export async function apiAdminSoftDeleteComment(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const c = await db.get('comments', id); if (!c) return err('غير موجود', 404);
  c.status = 'deleted';
  c.deletedAt = new Date().toISOString();
  await db.put('comments', c);
  const post = await db.get('posts', c.postId);
  if (post) { post.commentsCount = Math.max(0, post.commentsCount - 1); await db.put('posts', post); }
  await logAdmin(token, 'حذف تعليق (ناعم)', id);
  return ok(null);
}

export async function apiAdminRestoreComment(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const c = await db.get('comments', id); if (!c) return err('غير موجود', 404);
  c.status = 'active';
  delete c.deletedAt;
  await db.put('comments', c);
  const post = await db.get('posts', c.postId);
  if (post) { post.commentsCount++; await db.put('posts', post); }
  await logAdmin(token, 'استعادة تعليق', id);
  return ok(null);
}

export async function apiAdminPermanentDeleteComment(token: string, id: string): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  await db.delete('comments', id);
  await logAdmin(token, 'حذف تعليق نهائياً', id);
  return ok(null);
}

export async function apiAdminGetDeletedComments(token: string): Promise<ApiRes<(Comment & { postContent?: string })[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('comments');
  const posts = await db.getAll('posts');
  const postMap: Record<string, string> = {};
  for (const p of posts) postMap[p.id] = p.content.slice(0, 40);
  const deleted = all
    .filter(c => c.status === 'deleted')
    .map(c => ({ ...c, postContent: postMap[c.postId] }));
  deleted.sort((a, b) => new Date((b as Comment & { deletedAt?: string }).deletedAt!).getTime() - new Date((a as Comment & { deletedAt?: string }).deletedAt!).getTime());
  return ok(deleted);
}

export async function apiAdminGetReports(token: string): Promise<ApiRes<Report[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('reports');
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return ok(all);
}

export async function apiAdminUpdateReport(token: string, id: string, status: Report['status']): Promise<ApiRes> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const r = await db.get('reports', id); if (!r) return err('غير موجود', 404);
  r.status = status; await db.put('reports', r);
  return ok(null);
}

export async function apiAdminGetLogs(token: string, limit = 500): Promise<ApiRes<AdminLog[]>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('adminLogs');
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return ok(limit > 0 ? all.slice(0, limit) : all);
}

export async function apiAdminDeleteLogsByDateRange(token: string, from: string, to: string): Promise<ApiRes<{ deleted: number }>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const all = await db.getAll('adminLogs');
  const fromTime = new Date(from).getTime();
  const toTime = new Date(to + 'T23:59:59.999Z').getTime();
  let deleted = 0;
  for (const log of all) {
    const t = new Date(log.createdAt).getTime();
    if (t >= fromTime && t <= toTime) {
      await db.delete('adminLogs', log.id);
      deleted++;
    }
  }
  return ok({ deleted });
}

export async function apiAdminGetStats(token: string): Promise<ApiRes<{
  totalUsers: number; totalPosts: number; totalQuestions: number; totalSections: number;
  totalLessons: number; totalSigns: number; totalReports: number; activeToday: number;
}>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const users = await db.getAll('users');
  const today = new Date().toDateString();
  return ok({
    totalUsers: users.length,
    totalPosts: (await db.getAll('posts')).length,
    totalQuestions: (await db.getAll('questions')).length,
    totalSections: (await db.getAll('sections')).length,
    totalLessons: (await db.getAll('lessons')).length,
    totalSigns: (await db.getAll('signs')).length,
    totalReports: (await db.getAll('reports')).length,
    activeToday: users.filter(u => new Date(u.lastLogin).toDateString() === today).length,
  });
}

export type { ApiRes };
