/**
 * useTrendingHashtags.ts
 * Loads trending hashtags using TanStack Query for automatic caching and refetching.
 */
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/shared/lib/queryKeys';
import { getTrendingHashtags } from '../services/hashtagService';

export function useTrendingHashtags(_postCount?: number) {
  const { data: trendingHashtags = [], refetch: refresh } = useQuery({
    queryKey: queryKeys.hashtags.trending(8),
    queryFn: () => getTrendingHashtags(8),
    staleTime: 1000 * 60 * 2, // 2 minutes — hashtags change with new posts
  });

  return { trendingHashtags, refresh };
}
