/**
 * usePostsQuery.ts
 * TanStack Query hook for fetching posts with likes and likers.
 * Replaces the manual useEffect + Zustand store pattern.
 */
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { useAuthStore } from '@/store/auth.store';
import { getDB } from '@/infrastructure/database/database';
import * as postService from '../services/postService';
import type { PostSortMode } from '@/infrastructure/database/api';
import type { Post, PostLiker } from '../types';

export interface PostsQueryData {
  posts: Post[];
  likes: Record<string, boolean>;
  postLikers: Record<string, PostLiker[]>;
}

export function usePostsQuery(sortMode: PostSortMode = 'hot', hashtag?: string) {
  const token = useAuthStore(s => s.token);
  const lang = useAuthStore(s => s.user?.settings.language);

  return useQuery<PostsQueryData>({
    queryKey: queryKeys.posts.list(sortMode, hashtag, lang),
    queryFn: async () => {
      const r = await postService.getPosts(sortMode, hashtag, lang);
      const posts: Post[] = r.success && r.data ? r.data : [];

      // Batch-check likes for all posts
      const likes: Record<string, boolean> = {};
      if (token && posts.length) {
        const results = await Promise.all(posts.map(p => postService.checkLike(token, p.id)));
        posts.forEach((p, i) => { likes[p.id] = results[i]; });
      }

      // Load likers from IndexedDB
      const postLikers: Record<string, PostLiker[]> = {};
      if (posts.length) {
        const db = await getDB();
        const [allLikes, allUsers] = await Promise.all([db.getAll('likes'), db.getAll('users')]);
        const userMap: Record<string, { name: string; avatar: string }> = {};
        for (const u of allUsers) userMap[u.id] = { name: u.name, avatar: u.avatar || '' };
        for (const l of allLikes) {
          if (!postLikers[l.postId]) postLikers[l.postId] = [];
          postLikers[l.postId].push({
            userId: l.userId,
            userName: userMap[l.userId]?.name || 'مستخدم',
            userAvatar: userMap[l.userId]?.avatar || '',
          });
        }
      }

      return { posts, likes, postLikers };
    },
    staleTime: 1000 * 30, // 30 seconds — posts are relatively fresh
  });
}
