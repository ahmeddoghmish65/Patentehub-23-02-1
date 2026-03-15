/**
 * community/types/index.ts
 * All shared types for the community feature.
 */
import type { Post, Comment } from '@/shared/types';
import type { Hashtag } from '@/infrastructure/database/database';
import type { PostSortMode } from '@/infrastructure/database/api';

export type { Post, Comment, Hashtag, PostSortMode };

// ── Users ─────────────────────────────────────────────────────────────────────

export interface CommunityUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

// ── Likers ────────────────────────────────────────────────────────────────────

export interface PostLiker {
  userId: string;
  userName: string;
  userAvatar: string;
}

// ── Modal states ──────────────────────────────────────────────────────────────

export interface LikersModalState {
  postId: string;
  likers: PostLiker[];
}

export interface ReportModalState {
  type: 'post' | 'comment';
  id: string;
}

export interface ConfirmDeleteState {
  type: 'post' | 'comment' | 'reply';
  id: string;
}

export interface ReplyingToState {
  commentId: string;
  userName: string;
}

// ── Quiz ──────────────────────────────────────────────────────────────────────

export interface QuizVoteMap {
  voted: Record<string, boolean>;
  selected: Record<string, boolean>;
}
