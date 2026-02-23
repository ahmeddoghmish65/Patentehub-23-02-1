/**
 * Anti-spam detection service.
 *
 * spam_score = (post_frequency * 2) + (duplicate_content * 5) + (link_ratio * 3) + (hashtag_spam * 4)
 * Posts with spam_score >= SPAM_THRESHOLD are shadow-banned automatically.
 */

export const SPAM_THRESHOLD = 15;

// In-memory store: userId -> list of recent post timestamps
const recentPostTimestamps = new Map<string, number[]>();
// In-memory store: userId -> list of recent post content hashes
const recentContentHashes = new Map<string, string[]>();

/** Simple djb2-like hash for content deduplication */
function hashContent(text: string): string {
  const normalised = text.toLowerCase().replace(/\s+/g, ' ').trim();
  let h = 5381;
  for (let i = 0; i < normalised.length; i++) {
    h = ((h << 5) + h) ^ normalised.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

/** Count URLs / links in content */
function countLinks(text: string): number {
  const urlRe = /https?:\/\/\S+|www\.\S+/gi;
  return (text.match(urlRe) ?? []).length;
}

/** Count hashtags in content */
function countHashtags(text: string): number {
  return (text.match(/#\w+/g) ?? []).length;
}

export interface SpamResult {
  spamScore: number;
  shadowBan: boolean;
  reasons: string[];
}

/**
 * Evaluate spam score for a new post.
 * Call this BEFORE persisting the post to IndexedDB.
 */
export function evaluateSpam(userId: string, content: string): SpamResult {
  const now = Date.now();
  const reasons: string[] = [];
  let score = 0;

  // --- 1. Post frequency (last 10 minutes) ---
  const windowMs = 10 * 60 * 1000;
  const timestamps = (recentPostTimestamps.get(userId) ?? []).filter(t => now - t < windowMs);
  const postFrequency = timestamps.length; // posts in the window
  if (postFrequency >= 3) {
    const freqScore = Math.min(postFrequency * 2, 10);
    score += freqScore;
    reasons.push(`تكرار النشر (${postFrequency} مرات في 10 دقائق)`);
  }

  // --- 2. Duplicate content ---
  const hash = hashContent(content);
  const hashes = recentContentHashes.get(userId) ?? [];
  const duplicates = hashes.filter(h => h === hash).length;
  if (duplicates >= 1) {
    score += duplicates * 5;
    reasons.push('محتوى مكرر');
  }

  // --- 3. Link ratio ---
  const words = content.trim().split(/\s+/).length;
  const links = countLinks(content);
  if (words > 0 && links > 0) {
    const linkRatio = links / words;
    if (linkRatio > 0.3 || links > 3) {
      const linkScore = Math.min(links * 3, 9);
      score += linkScore;
      reasons.push(`روابط مفرطة (${links} رابط)`);
    }
  }

  // --- 4. Hashtag spam ---
  const hashtagCount = countHashtags(content);
  if (hashtagCount > 5) {
    const hashtagScore = Math.min((hashtagCount - 5) * 4, 12);
    score += hashtagScore;
    reasons.push(`وسوم مفرطة (${hashtagCount} وسم)`);
  }

  // Update in-memory state for this user
  timestamps.push(now);
  recentPostTimestamps.set(userId, timestamps.slice(-20)); // keep last 20
  hashes.push(hash);
  recentContentHashes.set(userId, hashes.slice(-10)); // keep last 10

  return {
    spamScore: Math.round(score * 100) / 100,
    shadowBan: score >= SPAM_THRESHOLD,
    reasons,
  };
}

/** Clear spam tracking state for a user (e.g. after admin review). */
export function clearSpamState(userId: string): void {
  recentPostTimestamps.delete(userId);
  recentContentHashes.delete(userId);
}
