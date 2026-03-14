/**
 * SignsTab — Sign Sections + Signs CRUD tab.
 */
import React from 'react';
import { AdminTable } from '../components/common/AdminTable';
import type { ContentView, AnyItem } from '../types/admin.types';
import { useTranslation } from '@/i18n';

interface SignsTabProps {
  allSigns: AnyItem[];
  allSignSections: AnyItem[];
  contentView: ContentView;
  setContentView: (v: ContentView) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedIds: Set<string>;
  setSelectedIds: (s: Set<string>) => void;
  filterSignCategory: string;
  setFilterSignCategory: (id: string) => void;
  onAddSign: () => void;
  onEditSign: (item: AnyItem) => void;
  onDeleteSign: (id: string) => void;
  onPermanentDeleteSign: (id: string) => void;
  onArchiveSign: (id: string, archive: boolean) => Promise<boolean>;
  onRestoreSign: (id: string) => Promise<boolean>;
  onBulkDeleteSign: (ids: string[]) => Promise<void>;
  onBulkPermanentDeleteSign: (ids: string[]) => Promise<void>;
  onBulkArchiveSign: (ids: string[]) => Promise<void>;
  onBulkRestoreSign: (ids: string[]) => Promise<void>;
  onExportSigns: () => void;
  onImportSigns: () => void;
  onAddSignSection: () => void;
  onEditSignSection: (item: AnyItem) => void;
  onDeleteSignSection: (id: string) => void;
  onPermanentDeleteSignSection: (id: string) => void;
  onArchiveSignSection: (id: string, archive: boolean) => Promise<boolean>;
  onRestoreSignSection: (id: string) => Promise<boolean>;
  onBulkDeleteSignSection: (ids: string[]) => Promise<void>;
  onBulkPermanentDeleteSignSection: (ids: string[]) => Promise<void>;
  onBulkArchiveSignSection: (ids: string[]) => Promise<void>;
  onBulkRestoreSignSection: (ids: string[]) => Promise<void>;
}

export const SignsTab = React.memo(function SignsTab({
  allSigns, allSignSections, contentView, setContentView,
  search, setSearch, selectedIds, setSelectedIds,
  filterSignCategory, setFilterSignCategory,
  onAddSign, onEditSign, onDeleteSign, onPermanentDeleteSign, onArchiveSign, onRestoreSign,
  onBulkDeleteSign, onBulkPermanentDeleteSign, onBulkArchiveSign, onBulkRestoreSign,
  onExportSigns, onImportSigns,
  onAddSignSection, onEditSignSection, onDeleteSignSection, onPermanentDeleteSignSection,
  onArchiveSignSection, onRestoreSignSection,
  onBulkDeleteSignSection, onBulkPermanentDeleteSignSection, onBulkArchiveSignSection, onBulkRestoreSignSection,
}: SignsTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <AdminTable
        title={t('admin.sign_sections_title')} icon="traffic" iconColor="orange"
        contentView={contentView} setContentView={setContentView}
        activeItems={allSignSections.filter(s => !s.status || s.status === 'active')}
        archivedItems={allSignSections.filter(s => s.status === 'archived')}
        deletedItems={allSignSections.filter(s => s.status === 'deleted')}
        search={search} setSearch={setSearch}
        selectedIds={selectedIds} setSelectedIds={setSelectedIds}
        columns={[
          { key: 'nameAr', label: t('admin.col_name') },
          { key: 'nameIt', label: t('admin.col_name_it') },
        ]}
        filterFn={(item) => !search || item.nameAr?.includes(search) || item.nameIt?.toLowerCase().includes(search.toLowerCase())}
        onAdd={onAddSignSection}
        onEdit={onEditSignSection}
        onDelete={onDeleteSignSection}
        onPermanentDelete={onPermanentDeleteSignSection}
        onArchive={(id) => onArchiveSignSection(id, true)}
        onUnarchive={(id) => onArchiveSignSection(id, false)}
        onRestore={onRestoreSignSection}
        onBulkDelete={onBulkDeleteSignSection}
        onBulkPermanentDelete={onBulkPermanentDeleteSignSection}
        onBulkArchive={onBulkArchiveSignSection}
        onBulkRestore={onBulkRestoreSignSection}
        onExport={() => {}}
        onImport={() => {}}
      />
      <AdminTable
        title={t('admin.signs_title')} icon="traffic" iconColor="red"
        filterSlot={
          <select value={filterSignCategory} onChange={e => setFilterSignCategory(e.target.value)}
            className="border border-surface-200 rounded-lg px-2 py-1.5 text-xs text-surface-700 bg-surface-50 focus:outline-none focus:border-primary-400 cursor-pointer max-w-[140px]">
            <option value="">{t('admin.all_sections')}</option>
            {allSignSections.filter(s => !s.status || s.status === 'active').map((sec: AnyItem) => (
              <option key={sec.id} value={sec.id}>{sec.nameAr} ({allSigns.filter(s => s.sectionId === sec.id).length})</option>
            ))}
          </select>
        }
        contentView={contentView} setContentView={setContentView}
        activeItems={allSigns.filter(s => (!s.status || s.status === 'active') && (!filterSignCategory || s.sectionId === filterSignCategory))}
        archivedItems={allSigns.filter(s => s.status === 'archived' && (!filterSignCategory || s.sectionId === filterSignCategory))}
        deletedItems={allSigns.filter(s => s.status === 'deleted' && (!filterSignCategory || s.sectionId === filterSignCategory))}
        search={search} setSearch={setSearch}
        selectedIds={selectedIds} setSelectedIds={setSelectedIds}
        columns={[
          { key: 'nameAr', label: t('admin.col_name') },
          { key: 'nameIt', label: t('admin.col_name_it') },
          { key: 'sectionId', label: t('admin.col_section'), render: (v: unknown) => allSignSections.find(s => s.id === v)?.nameAr || '' },
        ]}
        filterFn={(item) => !search || item.nameAr?.includes(search)}
        onAdd={onAddSign}
        onEdit={onEditSign}
        onDelete={onDeleteSign}
        onPermanentDelete={onPermanentDeleteSign}
        onArchive={(id) => onArchiveSign(id, true)}
        onUnarchive={(id) => onArchiveSign(id, false)}
        onRestore={onRestoreSign}
        onBulkDelete={onBulkDeleteSign}
        onBulkPermanentDelete={onBulkPermanentDeleteSign}
        onBulkArchive={onBulkArchiveSign}
        onBulkRestore={onBulkRestoreSign}
        onExport={onExportSigns}
        onImport={onImportSigns}
      />
    </div>
  );
});
