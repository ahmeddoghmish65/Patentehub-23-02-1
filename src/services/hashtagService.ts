import type { Hashtag } from '@/db/database';
import { getDB, generateId } from '@/db/database';

/** Extract hashtags from post content. Returns lowercase tags without '#'. */
export function extractHashtags(content: string): string[] {
  const matches = content.match(/#([a-zA-Z\u0600-\u06FF\u0750-\u077F\w]{2,30})/g) ?? [];
  return [...new Set(matches.map(m => m.slice(1).toLowerCase()))];
}

/** Index a list of hashtags after a new post is created. */
export async function indexHashtags(tags: string[]): Promise<void> {
  if (tags.length === 0) return;
  const db = await getDB();
  const now = new Date().toISOString();

  for (const tag of tags) {
    // Try to find existing hashtag by tag name
    let existing: Hashtag | undefined;
    try {
      existing = await db.getFromIndex('hashtags', 'tag', tag);
    } catch {
      existing = undefined;
    }

    if (existing) {
      existing.postCount += 1;
      existing.weeklyCount += 1;
      existing.lastUsed = now;
      existing.trendScore = computeTrendScore(existing);
      await db.put('hashtags', existing);
    } else {
      const hashtag: Hashtag = {
        id: generateId(),
        tag,
        postCount: 1,
        weeklyCount: 1,
        trendScore: 1,
        lastUsed: now,
        createdAt: now,
      };
      await db.put('hashtags', hashtag);
    }
  }
}

/** Decrement hashtag counts when a post is deleted. */
export async function decrementHashtags(tags: string[]): Promise<void> {
  if (tags.length === 0) return;
  const db = await getDB();
  for (const tag of tags) {
    let existing: Hashtag | undefined;
    try {
      existing = await db.getFromIndex('hashtags', 'tag', tag);
    } catch {
      existing = undefined;
    }
    if (existing) {
      existing.postCount = Math.max(0, existing.postCount - 1);
      existing.weeklyCount = Math.max(0, existing.weeklyCount - 1);
      existing.trendScore = computeTrendScore(existing);
      await db.put('hashtags', existing);
    }
  }
}

/**
 * trend_score = weeklyCount * 2 + log(postCount + 1) * recency_factor
 * recency_factor decays from 1 to 0 over 7 days.
 */
export function computeTrendScore(hashtag: Hashtag): number {
  const daysSinceUsed = (Date.now() - new Date(hashtag.lastUsed).getTime()) / 86_400_000;
  const recencyFactor = Math.max(0, 1 - daysSinceUsed / 7);
  const score = hashtag.weeklyCount * 2 + Math.log(hashtag.postCount + 1) * recencyFactor;
  return Math.round(score * 100) / 100;
}

/** Get top N trending hashtags. */
export async function getTrendingHashtags(limit = 10): Promise<Hashtag[]> {
  const db = await getDB();
  const all: Hashtag[] = await db.getAll('hashtags');
  // Refresh trend scores
  for (const h of all) {
    h.trendScore = computeTrendScore(h);
  }
  return all
    .filter(h => h.postCount > 0)
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit);
}

/** Suggest hashtags matching a prefix (for autocomplete). */
export async function suggestHashtags(prefix: string, limit = 8): Promise<Hashtag[]> {
  if (!prefix || prefix.length < 1) return [];
  const db = await getDB();
  const all: Hashtag[] = await db.getAll('hashtags');
  const lower = prefix.toLowerCase();
  return all
    .filter(h => h.tag.startsWith(lower) && h.postCount > 0)
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, limit);
}

/** Decay weekly counts (should be called once per day via a scheduled check). */
export async function decayWeeklyCounts(): Promise<void> {
  const db = await getDB();
  const all: Hashtag[] = await db.getAll('hashtags');
  const cutoff = Date.now() - 7 * 86_400_000;
  for (const h of all) {
    if (new Date(h.lastUsed).getTime() < cutoff) {
      h.weeklyCount = 0;
      h.trendScore = computeTrendScore(h);
      await db.put('hashtags', h);
    }
  }
}
