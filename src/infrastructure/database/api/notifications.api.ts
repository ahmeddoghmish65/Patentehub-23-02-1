import { getDB, generateId, type Notification } from '../database';
import { getAuthUser, ok, err } from './_shared';
import type { ApiRes } from './_shared';

// ============ NOTIFICATIONS API ============
export async function apiGetNotifications(token: string): Promise<ApiRes<Notification[]>> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const db = await getDB();
  const all = await db.getAllFromIndex('notifications', 'userId', user.id);
  all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return ok(all);
}

export async function apiMarkNotificationRead(token: string, id: string): Promise<ApiRes> {
  const user = await getAuthUser(token);
  if (!user) return err('غير مصرح', 401);
  const db = await getDB();
  const n = await db.get('notifications', id);
  if (n && n.userId === user.id) { n.read = true; await db.put('notifications', n); }
  return ok(null);
}

// ============ COMMUNITY NOTIFICATIONS ============
export async function apiCreateCommunityNotif(data: {
  toUserId: string; fromUserId: string; fromUserName: string; fromUserAvatar: string;
  type: 'like' | 'comment' | 'reply' | 'mention' | 'follow';
  postId?: string; commentId?: string;
}) {
  if (data.toUserId === data.fromUserId) return;
  const db = await getDB();
  const notif = {
    id: generateId(), ...data, read: false, createdAt: new Date().toISOString()
  };
  await db.put('communityNotifications', notif);
}

export async function apiGetCommunityNotifs(userId: string) {
  const db = await getDB();
  const all = await db.getAll('communityNotifications');
  return all.filter((n: { toUserId: string }) => n.toUserId === userId)
    .sort((a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 50);
}

export async function apiMarkNotifRead(id: string) {
  const db = await getDB();
  const n = await db.get('communityNotifications', id);
  if (n) { n.read = true; await db.put('communityNotifications', n); }
}

export async function apiMarkAllNotifsRead(userId: string) {
  const db = await getDB();
  const all = await db.getAll('communityNotifications');
  for (const n of all.filter((x: { toUserId: string; read: boolean }) => x.toUserId === userId && !x.read)) {
    n.read = true;
    await db.put('communityNotifications', n);
  }
}

export type { ApiRes };
