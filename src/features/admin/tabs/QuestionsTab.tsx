/**
 * QuestionsTab — Questions CRUD tab with bulk operations.
 */
import React from 'react';
import { AdminTable } from '../components/common/AdminTable';
import type { ContentView, AnyItem } from '../types/admin.types';
import { useTranslation } from '@/i18n';

interface QuestionsTabProps {
  allQuestions: AnyItem[];
  allSections: AnyItem[];
  allLessons: AnyItem[];
  contentView: ContentView;
  setContentView: (v: ContentView) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedIds: Set<string>;
  setSelectedIds: (s: Set<string>) => void;
  filterSectionId: string;
  setFilterSectionId: (id: string) => void;
  onAdd: () => void;
  onEdit: (item: AnyItem) => void;
  onDelete: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onArchive: (id: string, archive: boolean) => Promise<boolean>;
  onRestore: (id: string) => Promise<boolean>;
  onBulkDelete: (ids: string[]) => Promise<boolean>;
  onBulkPermanentDelete: (ids: string[]) => Promise<boolean>;
  onBulkArchive: (ids: string[], archive: boolean) => Promise<boolean>;
  onBulkRestore: (ids: string[]) => Promise<boolean>;
  onExport: () => void;
  onImport: () => void;
}

export const QuestionsTab = React.memo(function QuestionsTab({
  allQuestions, allSections, allLessons, contentView, setContentView,
  search, setSearch, selectedIds, setSelectedIds, filterSectionId, setFilterSectionId,
  onAdd, onEdit, onDelete, onPermanentDelete, onArchive, onRestore,
  onBulkDelete, onBulkPermanentDelete, onBulkArchive, onBulkRestore, onExport, onImport,
}: QuestionsTabProps) {
  const { t } = useTranslation();
  return (
    <AdminTable
      title={t('admin.questions_title')} icon="quiz" iconColor="purple"
      filterSlot={
        <select value={filterSectionId} onChange={e => setFilterSectionId(e.target.value)}
          className="border border-surface-200 rounded-lg px-2 py-1.5 text-xs text-surface-700 bg-surface-50 focus:outline-none focus:border-primary-400 cursor-pointer max-w-[140px]">
          <option value="">{t('admin.all_sections')}</option>
          {allSections.filter(s => !s.status || s.status === 'active').map((sec: AnyItem) => {
            const sectionLessonIds = allLessons.filter(l => l.sectionId === sec.id).map(l => l.id);
            const count = allQuestions.filter(q => sectionLessonIds.includes(q.lessonId)).length;
            return <option key={sec.id} value={sec.id}>{sec.nameAr} ({count})</option>;
          })}
        </select>
      }
      contentView={contentView} setContentView={setContentView}
      activeItems={allQuestions.filter(s => (!s.status || s.status === 'active') && (!filterSectionId || allLessons.find(l => l.id === s.lessonId)?.sectionId === filterSectionId))}
      archivedItems={allQuestions.filter(s => s.status === 'archived' && (!filterSectionId || allLessons.find(l => l.id === s.lessonId)?.sectionId === filterSectionId))}
      deletedItems={allQuestions.filter(s => s.status === 'deleted' && (!filterSectionId || allLessons.find(l => l.id === s.lessonId)?.sectionId === filterSectionId))}
      search={search} setSearch={setSearch}
      selectedIds={selectedIds} setSelectedIds={setSelectedIds}
      columns={[
        { key: 'questionAr', label: t('admin.col_question'), render: (v: unknown) => String(v || '').substring(0, 50) + '...' },
        { key: 'isTrue', label: t('admin.col_answer'), render: (v) => v ? `✓ ${t('admin.answer_true_label')}` : `✗ ${t('admin.answer_false_label')}` },
        { key: 'difficulty', label: t('admin.col_difficulty') },
      ]}
      filterFn={(item) => !search || item.questionAr?.includes(search) || item.questionIt?.toLowerCase().includes(search.toLowerCase())}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      onPermanentDelete={onPermanentDelete}
      onArchive={(id) => onArchive(id, true)}
      onUnarchive={(id) => onArchive(id, false)}
      onRestore={onRestore}
      onBulkDelete={async (ids) => { await onBulkDelete(ids); setSelectedIds(new Set()); }}
      onBulkPermanentDelete={async (ids) => { await onBulkPermanentDelete(ids); setSelectedIds(new Set()); }}
      onBulkArchive={async (ids) => { await onBulkArchive(ids, true); setSelectedIds(new Set()); }}
      onBulkRestore={async (ids) => { await onBulkRestore(ids); setSelectedIds(new Set()); }}
      onExport={onExport}
      onImport={onImport}
    />
  );
});
