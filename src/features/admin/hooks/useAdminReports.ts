/**
 * useAdminReports — loads and exposes report management state.
 */
import { useEffect } from 'react';
import { useAdminStore } from '@/store';

export function useAdminReports() {
  const adminReports = useAdminStore(s => s.adminReports);
  const loadAdminReports = useAdminStore(s => s.loadAdminReports);
  const updateReport = useAdminStore(s => s.updateReport);

  useEffect(() => {
    loadAdminReports();
  }, [loadAdminReports]);

  return {
    adminReports,
    updateReport,
    reload: loadAdminReports,
  };
}
