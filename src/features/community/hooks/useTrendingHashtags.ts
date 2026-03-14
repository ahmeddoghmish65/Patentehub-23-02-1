/**
 * useTrendingHashtags.ts
 * Loads trending hashtags and keeps them in the UI store.
 */
import { useEffect, useCallback } from 'react';
import { useCommunityUIStore } from '../store/communityUIStore';
import { getTrendingHashtags } from '../services/hashtagService';

export function useTrendingHashtags(postCount: number) {
  const { trendingHashtags, setTrendingHashtags } = useCommunityUIStore();

  const refresh = useCallback(async () => {
    const tags = await getTrendingHashtags(8);
    setTrendingHashtags(tags);
  }, [setTrendingHashtags]);

  // Reload whenever the number of posts changes (new posts may create new tags)
  useEffect(() => {
    refresh().catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postCount]);

  return { trendingHashtags, refresh };
}
