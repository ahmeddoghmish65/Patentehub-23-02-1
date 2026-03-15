import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore, useDataStore } from '@/store';
import { getSocialStats } from '../services/profileService';
import { queryKeys } from '@/shared/lib/queryKeys';
import type { SocialUser } from '../types/profile.types';

export function useProfile() {
  const { user } = useAuthStore();
  const { posts, loadPosts, loadMistakes, loadQuestions, loadQuizHistory, loadLessons } =
    useDataStore();

  // Lazy-load store data only if not yet populated
  const loadStoreData = useCallback(() => {
    const s = useDataStore.getState();
    if (!s.posts.length) loadPosts();
    if (!s.mistakes.length) loadMistakes();
    if (!s.questions.length) loadQuestions();
    if (!s.quizHistory.length) loadQuizHistory();
    if (!s.lessons.length) loadLessons();
  }, [loadPosts, loadMistakes, loadQuestions, loadQuizHistory, loadLessons]);

  // Trigger lazy load once on first render
  useState(() => { loadStoreData(); });

  // Social stats via TanStack Query — auto-cached and refetch-aware
  const { data: socialData } = useQuery({
    queryKey: queryKeys.profile.socialStats(user?.id ?? ''),
    queryFn: () => getSocialStats(user!.id),
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const followerCount = socialData?.followersList.length ?? 0;
  const followingCount = socialData?.followingList.length ?? 0;
  const followersList: SocialUser[] = socialData?.followersList ?? [];
  const followingList: SocialUser[] = socialData?.followingList ?? [];
  const followingIds: string[] = socialData?.followingIds ?? [];

  const [myFollowing, setMyFollowing] = useState<string[]>(() => {
    if (!user) return [];
    try { return JSON.parse(localStorage.getItem(`following_${user.id}`) || '[]'); } catch { return []; }
  });

  // Keep local myFollowing in sync with query data
  if (followingIds.length && myFollowing.length === 0) {
    setMyFollowing(followingIds);
  }

  const toggleFollowUser = useCallback(
    (targetId: string, targetName: string, targetAvatar?: string, targetUsername?: string) => {
      if (!user) return;
      const raw = localStorage.getItem(`following_${user.id}`);
      let arr: string[] = raw ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : [];
      const isFollowing = arr.includes(targetId);
      arr = isFollowing ? arr.filter(id => id !== targetId) : [...arr, targetId];
      localStorage.setItem(`following_${user.id}`, JSON.stringify(arr));
      setMyFollowing(arr);
      void targetName; void targetAvatar; void targetUsername;
    },
    [user],
  );

  return {
    user,
    posts,
    followerCount,
    followingCount,
    followersList,
    followingList,
    myFollowing,
    toggleFollowUser,
  };
}
