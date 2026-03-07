import type { Post } from '@/db/database';

/**
 * Viral detection service.
 *
 * viral_score = engagement_last_hour / max(1, average_hourly_engagement)
 *
 * A post is considered "trending" when viral_score >= VIRAL_THRESHOLD.
 */

export const VIRAL_THRESHOLD = 3.0; // 3× average hourly engagement

export interface EngagementSnapshot {
  postId: string;
  timestamp: number;     // epoch ms
  likesCount: number;
  commentsCount: number;
}

// In-memory ring buffer: postId -> list of snapshots (last 24 h)
const snapshots = new Map<string, EngagementSnapshot[]>();

/** Record a new engagement snapshot for a post (call after any like/comment). */
export function recordEngagement(post: Post): void {
  const list = snapshots.get(post.id) ?? [];
  list.push({
    postId: post.id,
    timestamp: Date.now(),
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
  });
  // Trim to last 24 h
  const cutoff = Date.now() - 24 * 3_600_000;
  snapshots.set(post.id, list.filter(s => s.timestamp > cutoff));
}

/** Compute total engagement for a post within the last `windowMs` milliseconds. */
function engagementInWindow(postId: string, windowMs: number): number {
  const list = snapshots.get(postId) ?? [];
  const cutoff = Date.now() - windowMs;
  const recent = list.filter(s => s.timestamp > cutoff);
  if (recent.length < 2) return 0;
  const first = recent[0];
  const last = recent[recent.length - 1];
  return (last.likesCount - first.likesCount) + (last.commentsCount - first.commentsCount);
}

/** Compute average hourly engagement over the last 24 h. */
function averageHourlyEngagement(postId: string): number {
  const hourlyWindow = 3_600_000;
  const total24h = engagementInWindow(postId, 24 * hourlyWindow);
  return total24h / 24;
}

/**
 * Compute the viral score for a post.
 * Returns a number >= 0; values >= VIRAL_THRESHOLD indicate a trending post.
 */
export function computeViralScore(post: Post): number {
  const lastHour = engagementInWindow(post.id, 3_600_000);
  const avg = averageHourlyEngagement(post.id);
  const score = lastHour / Math.max(1, avg);
  return Math.round(score * 100) / 100;
}

/**
 * Filter and sort posts by viral score, returning those that are trending.
 */
export function getTrendingPosts(posts: Post[]): Post[] {
  return posts
    .filter(p => !p.shadowBanned && (p.viralScore ?? 0) >= VIRAL_THRESHOLD)
    .sort((a, b) => (b.viralScore ?? 0) - (a.viralScore ?? 0));
}

/** Update viral scores on a batch of posts (mutates in place, also returns array). */
export function refreshViralScores(posts: Post[]): Post[] {
  for (const post of posts) {
    post.viralScore = computeViralScore(post);
  }
  return posts;
}
