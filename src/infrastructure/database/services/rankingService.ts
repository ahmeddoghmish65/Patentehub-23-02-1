import type { Post } from '@/infrastructure/database/database';

/**
 * HOT score formula:
 * score = (likes * 2) + (comments * 3) + (replies * 1) + tag_score + recency_boost + reputation_boost
 * recency_boost = max(0, 48 - hours_since_post)
 */
export function computeHotScore(post: Post, replyCount: number, authorReputation: number): number {
  const now = Date.now();
  const hoursSincePost = (now - new Date(post.createdAt).getTime()) / 3_600_000;
  const recencyBoost = Math.max(0, 48 - hoursSincePost);
  const tagScore = (post.hashtags?.length ?? 0) * 0.5;
  const reputationBoost = Math.min(authorReputation / 100, 10); // cap at 10
  const score =
    (post.likesCount * 2) +
    (post.commentsCount * 3) +
    (replyCount * 1) +
    tagScore +
    recencyBoost +
    reputationBoost;
  return Math.round(score * 100) / 100;
}

/**
 * Sort posts by HOT score, with pinned posts always at the top.
 */
export function sortPostsByHot(posts: Post[]): Post[] {
  const pinned = posts.filter(p => p.pinned && !p.shadowBanned);
  const featured = posts.filter(p => p.featured && !p.pinned && !p.shadowBanned);
  const rest = posts.filter(p => !p.pinned && !p.featured && !p.shadowBanned);

  const byHot = (a: Post, b: Post) => (b.hotScore ?? 0) - (a.hotScore ?? 0);
  return [...pinned, ...featured.sort(byHot), ...rest.sort(byHot)];
}

/**
 * Sort posts chronologically (newest first), shadow-banned excluded.
 */
export function sortPostsByNew(posts: Post[]): Post[] {
  const visible = posts.filter(p => !p.shadowBanned);
  return visible.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/**
 * Sort posts by viral score (descending).
 */
export function sortPostsByViral(posts: Post[]): Post[] {
  const visible = posts.filter(p => !p.shadowBanned);
  return visible.sort((a, b) => (b.viralScore ?? 0) - (a.viralScore ?? 0));
}
