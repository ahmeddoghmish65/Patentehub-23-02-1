/**
 * useAdminQuestions — exposes question CRUD from admin store.
 */
import { useAdminStore } from '@/store';

export function useAdminQuestions() {
  const allQuestions = useAdminStore(s => s.allQuestions);
  const createQuestion = useAdminStore(s => s.createQuestion);
  const updateQuestion = useAdminStore(s => s.updateQuestion);
  const deleteQuestion = useAdminStore(s => s.deleteQuestion);
  const archiveQuestion = useAdminStore(s => s.archiveQuestion);
  const restoreQuestion = useAdminStore(s => s.restoreQuestion);
  const permanentDeleteQuestion = useAdminStore(s => s.permanentDeleteQuestion);
  const bulkDeleteQuestions = useAdminStore(s => s.bulkDeleteQuestions);
  const bulkPermanentDeleteQuestions = useAdminStore(s => s.bulkPermanentDeleteQuestions);
  const bulkArchiveQuestions = useAdminStore(s => s.bulkArchiveQuestions);
  const bulkRestoreQuestions = useAdminStore(s => s.bulkRestoreQuestions);

  return {
    allQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    archiveQuestion,
    restoreQuestion,
    permanentDeleteQuestion,
    bulkDeleteQuestions,
    bulkPermanentDeleteQuestions,
    bulkArchiveQuestions,
    bulkRestoreQuestions,
  };
}
