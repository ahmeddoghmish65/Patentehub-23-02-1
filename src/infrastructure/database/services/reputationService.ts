import type { User } from '@/infrastructure/database/database';
import { getDB } from '@/infrastructure/database/database';

/**
 * User Reputation Service
 *
 * reputation = total_post_likes + (helpful_comments * 2) + (accepted_answers * 5)
 *
 * "helpful_comments" = comments with 3+ likes (stored as comment.likes >= 3)
 * "accepted_answers" = quiz-type posts answered correctly (quizStats-based proxy)
 */

export function computeReputation(
  totalPostLikes: number,
  helpfulComments: number,
  acceptedAnswers: number,
): number {
  return totalPostLikes + helpfulComments * 2 + acceptedAnswers * 5;
}

export interface ReputationDetails {
  postLikes: number;
  helpfulComments: number;
  acceptedAnswers: number;
  lastCalculated: string;
}

/**
 * Recalculate and persist reputation for a given user.
 * Returns the updated reputation value.
 */
export async function recalculateReputation(userId: string): Promise<number> {
  const db = await getDB();

  // 1. Sum up likes across all posts by this user
  const posts = await db.getAllFromIndex('posts', 'userId', userId);
  const totalPostLikes = posts.reduce((sum, p) => sum + (p.likesCount ?? 0), 0);

  // 2. Count comments with likes >= 3 (helpful comments)
  // getAllFromIndex by userId doesn't exist for comments — iterate all and filter
  const allComments = await db.getAll('comments');
  const userComments = allComments.filter((c) => c.userId === userId);
  const helpfulComments = userComments.filter((c) => (c.likes ?? 0) >= 3).length;

  // 3. Quiz-answer proxy: count quiz posts by user where majority answered correctly
  const quizPosts = posts.filter(p => p.type === 'quiz');
  const acceptedAnswers = quizPosts.filter(p => {
    const { trueCount, falseCount } = p.quizStats ?? { trueCount: 0, falseCount: 0 };
    const total = trueCount + falseCount;
    if (total === 0) return false;
    const correctRatio = p.quizAnswer ? trueCount / total : falseCount / total;
    return correctRatio >= 0.6;
  }).length;

  const reputation = computeReputation(totalPostLikes, helpfulComments, acceptedAnswers);

  // Persist to user record
  const user = await db.get('users', userId);
  if (user) {
    user.reputation = reputation;
    user.reputationDetails = {
      postLikes: totalPostLikes,
      helpfulComments,
      acceptedAnswers,
      lastCalculated: new Date().toISOString(),
    };
    await db.put('users', user);
  }

  return reputation;
}

/** Get cached reputation (fast path — no DB scan). Falls back to 0. */
export function getCachedReputation(user: User): number {
  return user.reputation ?? 0;
}

/** Return a display tier label based on reputation score. */
export function getReputationTier(reputation: number): { label: string; color: string } {
  if (reputation >= 500) return { label: 'خبير', color: 'text-yellow-500' };
  if (reputation >= 200) return { label: 'متقدم', color: 'text-blue-500' };
  if (reputation >= 50) return { label: 'نشط', color: 'text-green-500' };
  return { label: 'مبتدئ', color: 'text-surface-400' };
}
