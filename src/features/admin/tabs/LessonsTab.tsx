/**
 * LessonsTab — Lessons CRUD tab.
 */
import React from 'react';
import { AdminTable } from '../components/common/AdminTable';
import type { ContentView, AnyItem } from '../types/admin.types';
import { useTranslation } from '@/i18n';

interface LessonsTabProps {
  allLessons: AnyItem[];
  allSections: AnyItem[];
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
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkPermanentDelete: (ids: string[]) => Promise<void>;
  onBulkArchive: (ids: string[]) => Promise<void>;
  onBulkRestore: (ids: string[]) => Promise<void>;
  onExport: () => void;
  onImport: () => void;
}

export const LessonsTab = React.memo(function LessonsTab({
  allLessons, allSections, contentView, setContentView, search, setSearch,
  selectedIds, setSelectedIds, filterSectionId, setFilterSectionId,
  onAdd, onEdit, onDelete, onPermanentDelete, onArchive, onRestore,
  onBulkDelete, onBulkPermanentDelete, onBulkArchive, onBulkRestore, onExport, onImport,
}: LessonsTabProps) {
  const { t } = useTranslation();
  return (
    <AdminTable
      title={t('admin.lessons_title')} icon="school" iconColor="primary"
      filterSlot={
        <select value={filterSectionId} onChange={e => setFilterSectionId(e.target.value)}
          className="border border-surface-200 rounded-lg px-2 py-1.5 text-xs text-surface-700 bg-surface-50 focus:outline-none focus:border-primary-400 cursor-pointer max-w-[140px]">
          <option value="">{t('admin.all_sections')}</option>
          {allSections.filter(s => !s.status || s.status === 'active').map((sec: AnyItem) => (
            <option key={sec.id} value={sec.id}>{sec.nameAr} ({allLessons.filter(l => l.sectionId === sec.id).length})</option>
          ))}
        </select>
      }
      contentView={contentView} setContentView={setContentView}
      activeItems={allLessons.filter(s => (!s.status || s.status === 'active') && (!filterSectionId || s.sectionId === filterSectionId))}
      archivedItems={allLessons.filter(s => s.status === 'archived' && (!filterSectionId || s.sectionId === filterSectionId))}
      deletedItems={allLessons.filter(s => s.status === 'deleted' && (!filterSectionId || s.sectionId === filterSectionId))}
      search={search} setSearch={setSearch}
      selectedIds={selectedIds} setSelectedIds={setSelectedIds}
      columns={[
        { key: 'titleAr', label: t('admin.col_title') },
        { key: 'sectionId', label: t('admin.col_section'), render: (v: unknown) => allSections.find(s => s.id === v)?.nameAr || String(v) },
        { key: 'order', label: t('admin.col_order') },
      ]}
      filterFn={(item) => !search || item.titleAr?.includes(search) || item.titleIt?.toLowerCase().includes(search.toLowerCase())}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      onPermanentDelete={onPermanentDelete}
      onArchive={(id) => onArchive(id, true)}
      onUnarchive={(id) => onArchive(id, false)}
      onRestore={onRestore}
      onBulkDelete={onBulkDelete}
      onBulkPermanentDelete={onBulkPermanentDelete}
      onBulkArchive={onBulkArchive}
      onBulkRestore={onBulkRestore}
      onExport={onExport}
      onImport={onImport}
    />
  );
});
