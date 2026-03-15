/**
 * usePosts.ts
 * Returns the filtered and sorted post list for the current feed state.
 * Uses TanStack Query for caching and automatic background refetching.
 */
import { useMemo } from 'react';
import { useCommunityUIStore } from '../store/communityUIStore';
import { usePostsQuery } from './usePostsQuery';
import type { PostSortMode } from '@/infrastructure/database/api';

export function usePosts() {
  const { activeTab, following, searchQuery, postSortMode, activeHashtag } = useCommunityUIStore();

  const { data, isLoading: loadingPosts, refetch: loadPosts } = usePostsQuery(
    postSortMode as PostSortMode,
    activeHashtag ?? undefined,
  );

  const posts = data?.posts ?? [];
  const likes = data?.likes ?? {};
  const postLikers = data?.postLikers ?? {};

  const filteredPosts = useMemo(() => {
    // Tab filter
    const tabFiltered = activeTab === 'following'
      ? posts.filter(p => following.includes(p.userId) || p.userId === '')
      : posts;

    // Search filter
    if (!searchQuery.trim()) return tabFiltered;
    const q = searchQuery.toLowerCase();
    return tabFiltered.filter(p =>
      (p.content?.toLowerCase().includes(q)) ||
      (p.quizQuestion?.toLowerCase().includes(q)) ||
      (p.userName?.toLowerCase().includes(q)),
    );
  }, [posts, activeTab, following, searchQuery]);

  return {
    posts: filteredPosts,
    allPosts: posts,
    loadingPosts,
    likes,
    postLikers,
    loadPosts,
    checkAllLikes: async (_postIds: string[]) => { await loadPosts(); },
    postSortMode,
    activeHashtag,
  };
}
