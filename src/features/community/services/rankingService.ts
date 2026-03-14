/**
 * rankingService.ts
 * Re-exports from the shared comment ranking service.
 */
export {
  computeCommentScore,
  sortComments,
  buildCommentThreads,
} from '@/services/commentRankingService';

export type { CommentSortMode, CommentThread } from '@/services/commentRankingService';
