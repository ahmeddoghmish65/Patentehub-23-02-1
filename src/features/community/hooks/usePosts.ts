/**
 * usePosts.ts
 * Returns the filtered and sorted post list for the current feed state.
 */
import { useMemo } from 'react';
import { usePostStore } from '../store/postStore';
import { useCommunityUIStore } from '../store/communityUIStore';

export function usePosts() {
  const { posts, loadingPosts, likes, postLikers, loadPosts, checkAllLikes } = usePostStore();
  const { activeTab, following, searchQuery, postSortMode, activeHashtag } = useCommunityUIStore();

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
    checkAllLikes,
    postSortMode,
    activeHashtag,
  };
}
