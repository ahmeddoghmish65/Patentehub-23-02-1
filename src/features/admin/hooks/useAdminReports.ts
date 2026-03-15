/**
 * useAdminReports — loads and exposes report management state via TanStack Query.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/store';
import { queryKeys } from '@/shared/lib/queryKeys';

export function useAdminReports() {
  const loadAdminReports = useAdminStore(s => s.loadAdminReports);
  const updateReport = useAdminStore(s => s.updateReport);
  const queryClient = useQueryClient();

  const { data: adminReports } = useQuery({
    queryKey: queryKeys.admin.reports,
    queryFn: async () => {
      await loadAdminReports();
      return useAdminStore.getState().adminReports;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.reports });

  return {
    adminReports: adminReports ?? [],
    updateReport,
    reload,
  };
}
