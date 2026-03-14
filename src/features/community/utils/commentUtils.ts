/**
 * commentUtils.ts
 * Pure helpers for comment threading and reply parsing.
 */
import type { Comment } from '../types';

/** Returns true for a reply comment (has parentId or uses legacy REPLY_TO: prefix). */
export function isReply(c: Comment): boolean {
  return !!c.parentId || c.content.startsWith('REPLY_TO:');
}

/** Extract the effective parent comment id, supporting both modern and legacy formats. */
export function getParentId(c: Comment): string | null {
  if (c.parentId) return c.parentId;
  if (!c.content.startsWith('REPLY_TO:')) return null;
  const match = c.content.match(/^REPLY_TO:([^:]+):/);
  return match ? match[1] : null;
}

/** Strip the REPLY_TO prefix to get the visible reply content. */
export function getReplyContent(c: Comment): string {
  if (c.parentId) return c.content;
  return c.content.replace(/^REPLY_TO:[^:]+:/, '');
}

/** Group flat comments into top-level + nested replies. */
export function groupCommentReplies(
  comments: Comment[],
): Map<string, Comment[]> {
  const map = new Map<string, Comment[]>();
  for (const c of comments) {
    const pid = getParentId(c);
    if (pid) {
      if (!map.has(pid)) map.set(pid, []);
      map.get(pid)!.push(c);
    }
  }
  return map;
}
