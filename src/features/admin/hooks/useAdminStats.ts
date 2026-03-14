/**
 * useAdminStats — loads and exposes admin statistics.
 */
import { useEffect } from 'react';
import { useAdminStore } from '@/store';

export function useAdminStats() {
  const adminStats = useAdminStore(s => s.adminStats);
  const loadAdminStats = useAdminStore(s => s.loadAdminStats);

  useEffect(() => {
    loadAdminStats();
  }, [loadAdminStats]);

  return { adminStats, reload: loadAdminStats };
}
