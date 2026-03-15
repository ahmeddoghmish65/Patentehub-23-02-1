/**
 * hashtagService.ts
 * Hashtag trending and suggestion queries.
 */
import { apiGetTrendingHashtags, apiSuggestHashtags } from '@/infrastructure/database/api';
import type { Hashtag } from '../types';

export async function getTrendingHashtags(limit = 8): Promise<Hashtag[]> {
  const r = await apiGetTrendingHashtags(limit);
  return r.success && r.data ? r.data : [];
}

export async function suggestHashtags(prefix: string): Promise<Hashtag[]> {
  const r = await apiSuggestHashtags(prefix);
  return r.success && r.data ? r.data : [];
}
