/**
 * useAdminUsers — loads and exposes admin user management state.
 */
import { useEffect } from 'react';
import { useAdminStore } from '@/store';

export function useAdminUsers() {
  const adminUsers = useAdminStore(s => s.adminUsers);
  const deletedUsers = useAdminStore(s => s.deletedUsers);
  const loadAdminUsers = useAdminStore(s => s.loadAdminUsers);
  const loadDeletedUsers = useAdminStore(s => s.loadDeletedUsers);
  const banUser = useAdminStore(s => s.banUser);
  const deleteUser = useAdminStore(s => s.deleteUser);
  const restoreUser = useAdminStore(s => s.restoreUser);
  const permanentDeleteUser = useAdminStore(s => s.permanentDeleteUser);
  const setCommunityRestrictions = useAdminStore(s => s.setCommunityRestrictions);

  useEffect(() => {
    loadAdminUsers();
    loadDeletedUsers();
  }, [loadAdminUsers, loadDeletedUsers]);

  return {
    adminUsers,
    deletedUsers,
    banUser,
    deleteUser,
    restoreUser,
    permanentDeleteUser,
    setCommunityRestrictions,
    reload: () => { loadAdminUsers(); loadDeletedUsers(); },
  };
}
