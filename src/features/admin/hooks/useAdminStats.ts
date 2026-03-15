/**
 * useAdminStats — loads and exposes admin statistics via TanStack Query.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/store';
import { queryKeys } from '@/shared/lib/queryKeys';

export function useAdminStats() {
  const loadAdminStats = useAdminStore(s => s.loadAdminStats);
  const queryClient = useQueryClient();

  const { data: adminStats } = useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: async () => {
      await loadAdminStats();
      return useAdminStore.getState().adminStats;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes — stats don't change that fast
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });

  return { adminStats: adminStats ?? null, reload };
}
