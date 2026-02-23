import type { Comment } from '@/db/database';

/**
 * Smart comment ranking service.
 *
 * comment_score = (likes * 2) + (replies * 2) + reputation_bonus + recency_boost
 *
 * recency_boost = max(0, 24 - hours_since_comment)
 */

export type CommentSortMode = 'top' | 'newest' | 'oldest';

export function computeCommentScore(
  comment: Comment,
  replyCount: number,
  authorReputation: number,
): number {
  const now = Date.now();
  const hoursSince = (now - new Date(comment.createdAt).getTime()) / 3_600_000;
  const recencyBoost = Math.max(0, 24 - hoursSince);
  const reputationBonus = Math.min(authorReputation / 50, 5); // cap at 5

  const score =
    ((comment.likes ?? 0) * 2) +
    (replyCount * 2) +
    reputationBonus +
    recencyBoost;

  return Math.round(score * 100) / 100;
}

/**
 * Sort a flat list of comments (top-level + replies) by the given mode.
 * Pinned comments always appear first.
 */
export function sortComments(comments: Comment[], mode: CommentSortMode = 'top'): Comment[] {
  const pinned = comments.filter(c => c.pinned);
  const rest = comments.filter(c => !c.pinned);

  let sorted: Comment[];
  switch (mode) {
    case 'top':
      sorted = rest.sort((a, b) => (b.rankScore ?? 0) - (a.rankScore ?? 0));
      break;
    case 'newest':
      sorted = rest.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
    default:
      sorted = rest.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
  }

  return [...pinned, ...sorted];
}

/**
 * Separate top-level comments from replies and nest them.
 * Returns top-level comments sorted by mode; each has a `replies` field.
 */
export interface CommentThread {
  comment: Comment;
  replies: Comment[];
}

export function buildCommentThreads(
  comments: Comment[],
  mode: CommentSortMode = 'top',
): CommentThread[] {
  const topLevel = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => !!c.parentId);

  const replyMap: Record<string, Comment[]> = {};
  for (const r of replies) {
    const pid = r.parentId!;
    if (!replyMap[pid]) replyMap[pid] = [];
    replyMap[pid].push(r);
  }

  const sorted = sortComments(topLevel, mode);

  return sorted.map(c => ({
    comment: c,
    replies: (replyMap[c.id] ?? []).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    ),
  }));
}
