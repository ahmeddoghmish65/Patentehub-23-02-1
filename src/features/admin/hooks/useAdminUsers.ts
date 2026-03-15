/**
 * useAdminUsers — loads and exposes admin user management state via TanStack Query.
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminStore } from '@/store';
import { queryKeys } from '@/shared/lib/queryKeys';

export function useAdminUsers() {
  const loadAdminUsers = useAdminStore(s => s.loadAdminUsers);
  const loadDeletedUsers = useAdminStore(s => s.loadDeletedUsers);
  const banUser = useAdminStore(s => s.banUser);
  const deleteUser = useAdminStore(s => s.deleteUser);
  const restoreUser = useAdminStore(s => s.restoreUser);
  const permanentDeleteUser = useAdminStore(s => s.permanentDeleteUser);
  const setCommunityRestrictions = useAdminStore(s => s.setCommunityRestrictions);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: queryKeys.admin.users,
    queryFn: async () => {
      await Promise.all([loadAdminUsers(), loadDeletedUsers()]);
      const s = useAdminStore.getState();
      return { adminUsers: s.adminUsers, deletedUsers: s.deletedUsers };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const reload = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });

  return {
    adminUsers: data?.adminUsers ?? [],
    deletedUsers: data?.deletedUsers ?? [],
    banUser,
    deleteUser,
    restoreUser,
    permanentDeleteUser,
    setCommunityRestrictions,
    reload,
  };
}
