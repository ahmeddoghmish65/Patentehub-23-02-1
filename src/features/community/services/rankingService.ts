/**
 * rankingService.ts
 * Re-exports from the shared comment ranking service.
 */
export {
  computeCommentScore,
  sortComments,
  buildCommentThreads,
} from '@/infrastructure/database/services/commentRankingService';

export type { CommentSortMode, CommentThread } from '@/infrastructure/database/services/commentRankingService';
