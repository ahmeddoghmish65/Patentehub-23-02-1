import {
  getDB, generateId,
  type Post, type Comment, type Like, type Report,
} from '../database';
import { getAuthUser, isAdmin, sanitize, ok, err } from './_shared';
import type { ApiRes } from './_shared';
import { computeHotScore, sortPostsByHot, sortPostsByNew, sortPostsByViral } from '../services/rankingService';
import { evaluateSpam } from '../services/spamDetectionService';
import { recordEngagement, computeViralScore } from '../services/viralDetectionService';
import { recalculateReputation, getCachedReputation } from '../services/reputationService';
import { computeCommentScore } from '../services/commentRankingService';
import { extractHashtags, indexHashtags, decrementHashtags, getTrendingHashtags, suggestHashtags } from '../services/hashtagService';

export type PostSortMode = 'hot' | 'new' | 'viral';

function detectPostLang(content: string): 'ar' | 'it' {
  return /[\u0600-\u06FF]/.test(content) ? 'ar' : 'it';
}

export async function apiGetPosts(sortMode: PostSortMode = 'hot', hashtag?: string, userLang?: 'ar' | 'it' | 'both'): Promise<ApiRes<Post[]>> {
  const db = await getDB();
  let all = await db.getAll('posts');

  all = all.filter(p => !p.status || p.status === 'active');

  if (hashtag) {
    all = all.filter(p => p.hashtags?.includes(hashtag.toLowerCase()));
  }

  const users = await db.getAll('users');
  const userMap: Record<string, { name: string; avatar: string; reputation?: number }> = {};
  for (const u of users) userMap[u.id] = { name: u.name, avatar: u.avatar || '', reputation: u.reputation };
  for (const p of all) {
    const u = userMap[p.userId];
    if (u) { p.userName = u.name; p.userAvatar = u.avatar; }
  }

  const allComments = await db.getAll('comments');
  const replyMap: Record<string, number> = {};
  for (const c of allComments) {
    if (c.parentId) {
      replyMap[c.postId] = (replyMap[c.postId] ?? 0) + 1;
    }
  }

  for (const p of all) {
    const authorRep = userMap[p.userId]?.reputation ?? 0;
    p.hotScore = computeHotScore(p, replyMap[p.id] ?? 0, authorRep);
    p.viralScore = computeViralScore(p);
  }

  let sorted: Post[];
  switch (sortMode) {
    case 'viral': sorted = sortPostsByViral(all); break;
    case 'new':   sorted = sortPostsByNew(all); break;
    case 'hot':
    default:      sorted = sortPostsByHot(all); break;
  }

  if (userLang === 'ar' || userLang === 'it') {
    const pinned    = sorted.filter(p => p.pinned);
    const nonPinned = sorted.filter(p => !p.pinned);
    const match     = nonPinned.filter(p => detectPostLang(p.content) === userLang);
    const other     = nonPinned.filter(p => detectPostLang(p.content) !== userLang);
    sorted = [...pinned, ...match, ...other];
  }

  return ok(sorted);
}

export async function apiCreatePost(token: string, content: string, image: string): Promise<ApiRes<Post>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  if (user.isBanned) return err('حسابك محظور', 403);
  if (!content.trim()) return err('المحتوى فارغ');

  const spamResult = evaluateSpam(user.id, content);
  const hashtags = extractHashtags(content);

  // SECURITY FIX (VULN-017): Enforce image-upload permission at the API layer.
  const imagesEnabled = typeof localStorage !== 'undefined' && localStorage.getItem('communityAllowImages') === 'true';
  const isPrivilegedUser = user.role === 'admin' || user.role === 'manager';
  const safeImage = (image && (imagesEnabled || isPrivilegedUser)) ? image : '';

  const p: Post = {
    id: generateId(), userId: user.id, userName: user.name, userAvatar: user.avatar,
    content: sanitize(content), image: safeImage, type: 'post',
    quizQuestion: '', quizAnswer: false, quizStats: { trueCount: 0, falseCount: 0 },
    pinned: false,
    likesCount: 0, commentsCount: 0,
    createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    hotScore: 0, viralScore: 0,
    spamScore: spamResult.spamScore,
    shadowBanned: spamResult.shadowBan,
    featured: false, locked: false,
    hashtags,
  };
  const db = await getDB();
  await db.put('posts', p);

  indexHashtags(hashtags).catch(() => {});

  return ok(p, 201);
}

export async function apiUpdatePost(token: string, id: string, content: string): Promise<ApiRes<Post>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const db = await getDB();
  const p = await db.get('posts', id); if (!p) return err('منشور غير موجود', 404);
  if (p.userId !== user.id && user.role !== 'admin') return err('غير مصرح', 403);
  const oldHashtags = p.hashtags ?? [];
  const newHashtags = extractHashtags(content);
  p.content = sanitize(content);
  p.hashtags = newHashtags;
  p.updatedAt = new Date().toISOString();
  await db.put('posts', p);
  decrementHashtags(oldHashtags).catch(() => {});
  indexHashtags(newHashtags).catch(() => {});
  return ok(p);
}

export async function apiDeletePost(token: string, id: string): Promise<ApiRes> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const db = await getDB();
  const p = await db.get('posts', id); if (!p) return err('غير موجود', 404);
  if (p.userId !== user.id && user.role !== 'admin') return err('غير مصرح', 403);
  decrementHashtags(p.hashtags ?? []).catch(() => {});
  await db.delete('posts', id);
  const comments = await db.getAllFromIndex('comments', 'postId', id);
  for (const c of comments) await db.delete('comments', c.id);
  const likes = await db.getAllFromIndex('likes', 'postId', id);
  for (const l of likes) await db.delete('likes', l.id);
  return ok(null);
}

export async function apiGetComments(postId: string): Promise<ApiRes<Comment[]>> {
  const db = await getDB();
  const allRaw = await db.getAllFromIndex('comments', 'postId', postId);
  const all = allRaw.filter(c => !c.status || c.status === 'active');
  const users = await db.getAll('users');
  const userMap: Record<string, { name: string; avatar: string; reputation?: number }> = {};
  for (const u of users) userMap[u.id] = { name: u.name, avatar: u.avatar || '', reputation: u.reputation };
  for (const c of all) {
    const u = userMap[c.userId];
    if (u) { c.userName = u.name; c.userAvatar = u.avatar; }
  }
  const replyMap: Record<string, number> = {};
  for (const c of all) {
    if (c.parentId) replyMap[c.parentId] = (replyMap[c.parentId] ?? 0) + 1;
  }
  for (const c of all) {
    const rep = userMap[c.userId]?.reputation ?? 0;
    c.rankScore = computeCommentScore(c, replyMap[c.id] ?? 0, rep);
  }
  all.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  return ok(all);
}

export async function apiCreateComment(token: string, postId: string, content: string): Promise<ApiRes<Comment>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  if (user.isBanned) return err('حسابك محظور', 403);
  const db = await getDB();
  const post = await db.get('posts', postId); if (!post) return err('منشور غير موجود', 404);
  const c: Comment = { id: generateId(), postId, userId: user.id, userName: user.name, userAvatar: user.avatar, content: sanitize(content), createdAt: new Date().toISOString() };
  await db.put('comments', c);
  post.commentsCount++;
  await db.put('posts', post);
  return ok(c, 201);
}

export async function apiDeleteComment(token: string, id: string): Promise<ApiRes> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const db = await getDB();
  const c = await db.get('comments', id); if (!c) return err('غير موجود', 404);
  if (c.userId !== user.id && user.role !== 'admin') return err('غير مصرح', 403);
  await db.delete('comments', id);
  const post = await db.get('posts', c.postId);
  if (post) { post.commentsCount = Math.max(0, post.commentsCount - 1); await db.put('posts', post); }
  return ok(null);
}

export async function apiToggleLike(token: string, postId: string): Promise<ApiRes<{ liked: boolean; count: number }>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const db = await getDB();
  const post = await db.get('posts', postId); if (!post) return err('غير موجود', 404);
  const allLikes = await db.getAllFromIndex('likes', 'postId', postId);
  const existing = allLikes.find(l => l.userId === user.id);
  if (existing) {
    await db.delete('likes', existing.id);
    post.likesCount = Math.max(0, post.likesCount - 1);
    await db.put('posts', post);
    recordEngagement(post);
    recalculateReputation(post.userId).catch(() => {});
    return ok({ liked: false, count: post.likesCount });
  } else {
    const like: Like = { id: generateId(), postId, userId: user.id, createdAt: new Date().toISOString() };
    await db.put('likes', like);
    post.likesCount++;
    await db.put('posts', post);
    recordEngagement(post);
    recalculateReputation(post.userId).catch(() => {});
    return ok({ liked: true, count: post.likesCount });
  }
}

export async function apiCheckLike(token: string, postId: string): Promise<ApiRes<boolean>> {
  const user = await getAuthUser(token);
  if (!user) return ok(false);
  const db = await getDB();
  const allLikes = await db.getAllFromIndex('likes', 'postId', postId);
  return ok(allLikes.some(l => l.userId === user.id));
}

export async function apiCreateReport(token: string, type: Report['type'], targetId: string, reason: string): Promise<ApiRes<Report>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const r: Report = { id: generateId(), type, targetId, userId: user.id, reason: sanitize(reason), status: 'pending', createdAt: new Date().toISOString() };
  const db = await getDB(); await db.put('reports', r);
  return ok(r, 201);
}

// ---- Moderator tools ----

export async function apiPinPost(token: string, postId: string, pinned: boolean): Promise<ApiRes<Post>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const p = await db.get('posts', postId); if (!p) return err('غير موجود', 404);
  p.pinned = pinned;
  await db.put('posts', p);
  return ok(p);
}

export async function apiFeaturePost(token: string, postId: string, featured: boolean): Promise<ApiRes<Post>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const p = await db.get('posts', postId); if (!p) return err('غير موجود', 404);
  p.featured = featured;
  await db.put('posts', p);
  return ok(p);
}

export async function apiLockPost(token: string, postId: string, locked: boolean): Promise<ApiRes<Post>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const p = await db.get('posts', postId); if (!p) return err('غير موجود', 404);
  p.locked = locked;
  await db.put('posts', p);
  return ok(p);
}

export async function apiShadowBanPost(token: string, postId: string, shadowBanned: boolean): Promise<ApiRes<Post>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const p = await db.get('posts', postId); if (!p) return err('غير موجود', 404);
  p.shadowBanned = shadowBanned;
  await db.put('posts', p);
  return ok(p);
}

export async function apiPinComment(token: string, commentId: string, pinned: boolean): Promise<ApiRes<Comment>> {
  if (!(await isAdmin(token))) return err('غير مصرح', 403);
  const db = await getDB();
  const c = await db.get('comments', commentId); if (!c) return err('غير موجود', 404);
  c.pinned = pinned;
  await db.put('comments', c);
  return ok(c);
}

// ---- Hashtag API ----

export async function apiGetTrendingHashtags(limit = 10): Promise<ApiRes<import('../database').Hashtag[]>> {
  const tags = await getTrendingHashtags(limit);
  return ok(tags);
}

export async function apiSuggestHashtags(prefix: string): Promise<ApiRes<import('../database').Hashtag[]>> {
  const tags = await suggestHashtags(prefix);
  return ok(tags);
}

export async function apiGetUserReputation(userId: string): Promise<ApiRes<{ reputation: number; tier: string }>> {
  const db = await getDB();
  const user = await db.get('users', userId);
  if (!user) return err('مستخدم غير موجود', 404);
  const { getReputationTier } = await import('../services/reputationService');
  const rep = getCachedReputation(user);
  const tier = getReputationTier(rep);
  return ok({ reputation: rep, tier: tier.label });
}

export type { ApiRes };
