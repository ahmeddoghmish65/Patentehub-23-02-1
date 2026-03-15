/**
 * queryKeys.ts
 * Centralized TanStack Query key factory.
 * Keeps query keys consistent and easy to invalidate.
 */
import type { PostSortMode } from '@/infrastructure/database/api';

export const queryKeys = {
  // Community — posts
  posts: {
    all: ['posts'] as const,
    list: (sortMode: PostSortMode, hashtag?: string, lang?: string) =>
      ['posts', 'list', sortMode, hashtag, lang] as const,
  },

  // Community — comments
  comments: {
    all: ['comments'] as const,
    byPost: (postId: string) => ['comments', postId] as const,
  },

  // Community — hashtags
  hashtags: {
    trending: (limit: number) => ['hashtags', 'trending', limit] as const,
    suggestions: (prefix: string) => ['hashtags', 'suggestions', prefix] as const,
  },

  // Profile
  profile: {
    all: ['profile'] as const,
    socialStats: (userId: string) => ['profile', 'socialStats', userId] as const,
    public: (userId: string) => ['profile', 'public', userId] as const,
    publicByUsername: (username: string) => ['profile', 'publicByUsername', username] as const,
    changeDates: (userId: string) => ['profile', 'changeDates', userId] as const,
    examReadiness: (userId: string) => ['profile', 'examReadiness', userId] as const,
  },

  // Admin
  admin: {
    users: ['admin', 'users'] as const,
    posts: ['admin', 'posts'] as const,
    stats: ['admin', 'stats'] as const,
    reports: ['admin', 'reports'] as const,
  },
};
