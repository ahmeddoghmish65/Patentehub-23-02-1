/**
 * SectionsTab — Sections CRUD tab.
 */
import React from 'react';
import { AdminTable } from '../components/common/AdminTable';
import type { ContentView, AnyItem } from '../types/admin.types';
import { useTranslation } from '@/i18n';

interface SectionsTabProps {
  allSections: AnyItem[];
  contentView: ContentView;
  setContentView: (v: ContentView) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedIds: Set<string>;
  setSelectedIds: (s: Set<string>) => void;
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

export const SectionsTab = React.memo(function SectionsTab({
  allSections, contentView, setContentView, search, setSearch,
  selectedIds, setSelectedIds, onAdd, onEdit, onDelete, onPermanentDelete,
  onArchive, onRestore, onBulkDelete, onBulkPermanentDelete,
  onBulkArchive, onBulkRestore, onExport, onImport,
}: SectionsTabProps) {
  const { t } = useTranslation();
  return (
    <AdminTable
      title={t('admin.sections_title')} icon="folder" iconColor="indigo"
      contentView={contentView} setContentView={setContentView}
      activeItems={allSections.filter(s => !s.status || s.status === 'active')}
      archivedItems={allSections.filter(s => s.status === 'archived')}
      deletedItems={allSections.filter(s => s.status === 'deleted')}
      search={search} setSearch={setSearch}
      selectedIds={selectedIds} setSelectedIds={setSelectedIds}
      columns={[
        { key: 'nameAr', label: t('admin.col_name') },
        { key: 'nameIt', label: t('admin.col_name_it') },
        { key: 'order', label: t('admin.col_order') },
      ]}
      filterFn={(item) => !search || item.nameAr.includes(search) || item.nameIt?.toLowerCase().includes(search.toLowerCase())}
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
