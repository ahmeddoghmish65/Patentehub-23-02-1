/**
 * notificationService.ts
 * Community notification helpers (like, comment, reply, mention, follow).
 */
import { apiCreateCommunityNotif, apiGetCommunityNotifs, apiMarkNotifRead, apiMarkAllNotifsRead } from '@/db/api';

export interface NotifPayload {
  toUserId: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  type: 'like' | 'comment' | 'reply' | 'mention' | 'follow';
  postId?: string;
  commentId?: string;
}

export async function createNotification(payload: NotifPayload): Promise<void> {
  try {
    await apiCreateCommunityNotif(payload);
  } catch {
    // Notifications are non-critical — swallow errors silently
  }
}

export async function getNotifications(userId: string): Promise<unknown[]> {
  return apiGetCommunityNotifs(userId);
}

export async function markRead(id: string): Promise<void> {
  await apiMarkNotifRead(id);
}

export async function markAllRead(userId: string): Promise<void> {
  await apiMarkAllNotifsRead(userId);
}
