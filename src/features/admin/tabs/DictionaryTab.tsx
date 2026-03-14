/**
 * DictionaryTab — Dictionary Sections + Entries CRUD tab.
 */
import React from 'react';
import { AdminTable } from '../components/common/AdminTable';
import type { ContentView, AnyItem } from '../types/admin.types';
import { useTranslation } from '@/i18n';

interface DictionaryTabProps {
  allDictSections: AnyItem[];
  allDictEntries: AnyItem[];
  contentView: ContentView;
  setContentView: (v: ContentView) => void;
  search: string;
  setSearch: (s: string) => void;
  selectedIds: Set<string>;
  setSelectedIds: (s: Set<string>) => void;
  filterDictSectionId: string;
  setFilterDictSectionId: (id: string) => void;
  onAddDictSection: () => void;
  onEditDictSection: (item: AnyItem) => void;
  onDeleteDictSection: (id: string) => void;
  onPermanentDeleteDictSection: (id: string) => void;
  onArchiveDictSection: (id: string, archive: boolean) => Promise<boolean>;
  onRestoreDictSection: (id: string) => Promise<boolean>;
  onBulkDeleteDictSection: (ids: string[]) => Promise<void>;
  onBulkPermanentDeleteDictSection: (ids: string[]) => Promise<void>;
  onBulkArchiveDictSection: (ids: string[]) => Promise<void>;
  onBulkRestoreDictSection: (ids: string[]) => Promise<void>;
  onExportDictSections: () => void;
  onImportDictSections: () => void;
  onAddDictEntry: () => void;
  onEditDictEntry: (item: AnyItem) => void;
  onDeleteDictEntry: (id: string) => void;
  onPermanentDeleteDictEntry: (id: string) => void;
  onArchiveDictEntry: (id: string, archive: boolean) => Promise<boolean>;
  onRestoreDictEntry: (id: string) => Promise<boolean>;
  onBulkDeleteDictEntry: (ids: string[]) => Promise<void>;
  onBulkPermanentDeleteDictEntry: (ids: string[]) => Promise<void>;
  onBulkArchiveDictEntry: (ids: string[]) => Promise<void>;
  onBulkRestoreDictEntry: (ids: string[]) => Promise<void>;
  onExportDictEntries: () => void;
  onImportDictEntries: () => void;
}

export const DictionaryTab = React.memo(function DictionaryTab({
  allDictSections, allDictEntries, contentView, setContentView,
  search, setSearch, selectedIds, setSelectedIds,
  filterDictSectionId, setFilterDictSectionId,
  onAddDictSection, onEditDictSection, onDeleteDictSection, onPermanentDeleteDictSection,
  onArchiveDictSection, onRestoreDictSection,
  onBulkDeleteDictSection, onBulkPermanentDeleteDictSection, onBulkArchiveDictSection, onBulkRestoreDictSection,
  onExportDictSections, onImportDictSections,
  onAddDictEntry, onEditDictEntry, onDeleteDictEntry, onPermanentDeleteDictEntry,
  onArchiveDictEntry, onRestoreDictEntry,
  onBulkDeleteDictEntry, onBulkPermanentDeleteDictEntry, onBulkArchiveDictEntry, onBulkRestoreDictEntry,
  onExportDictEntries, onImportDictEntries,
}: DictionaryTabProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <AdminTable
        title={t('admin.dict_sections_title')} icon="menu_book" iconColor="teal"
        contentView={contentView} setContentView={setContentView}
        activeItems={allDictSections.filter(s => !s.status || s.status === 'active')}
        archivedItems={allDictSections.filter(s => s.status === 'archived')}
        deletedItems={allDictSections.filter(s => s.status === 'deleted')}
        search={search} setSearch={setSearch}
        selectedIds={selectedIds} setSelectedIds={setSelectedIds}
        columns={[
          { key: 'nameAr', label: t('admin.col_name') },
          { key: 'nameIt', label: t('admin.col_name_it') },
        ]}
        filterFn={(item) => !search || item.nameAr?.includes(search) || item.nameIt?.toLowerCase().includes(search.toLowerCase())}
        onAdd={onAddDictSection}
        onEdit={onEditDictSection}
        onDelete={onDeleteDictSection}
        onPermanentDelete={onPermanentDeleteDictSection}
        onArchive={(id) => onArchiveDictSection(id, true)}
        onUnarchive={(id) => onArchiveDictSection(id, false)}
        onRestore={onRestoreDictSection}
        onBulkDelete={onBulkDeleteDictSection}
        onBulkPermanentDelete={onBulkPermanentDeleteDictSection}
        onBulkArchive={onBulkArchiveDictSection}
        onBulkRestore={onBulkRestoreDictSection}
        onExport={onExportDictSections}
        onImport={onImportDictSections}
      />
      <AdminTable
        title={t('admin.dict_entries_title')} icon="menu_book" iconColor="cyan"
        filterSlot={
          <select value={filterDictSectionId} onChange={e => setFilterDictSectionId(e.target.value)}
            className="border border-surface-200 rounded-lg px-2 py-1.5 text-xs text-surface-700 bg-surface-50 focus:outline-none focus:border-primary-400 cursor-pointer max-w-[140px]">
            <option value="">{t('admin.all_sections')}</option>
            {allDictSections.filter(s => !s.status || s.status === 'active').map((sec: AnyItem) => (
              <option key={sec.id} value={sec.id}>{sec.nameAr} ({allDictEntries.filter(e => e.sectionId === sec.id).length})</option>
            ))}
          </select>
        }
        contentView={contentView} setContentView={setContentView}
        activeItems={allDictEntries.filter(s => (!s.status || s.status === 'active') && (!filterDictSectionId || s.sectionId === filterDictSectionId))}
        archivedItems={allDictEntries.filter(s => s.status === 'archived' && (!filterDictSectionId || s.sectionId === filterDictSectionId))}
        deletedItems={allDictEntries.filter(s => s.status === 'deleted' && (!filterDictSectionId || s.sectionId === filterDictSectionId))}
        search={search} setSearch={setSearch}
        selectedIds={selectedIds} setSelectedIds={setSelectedIds}
        columns={[
          { key: 'termAr', label: t('admin.col_term') },
          { key: 'termIt', label: t('admin.col_name_it') },
          { key: 'sectionId', label: t('admin.col_section'), render: (v: unknown) => allDictSections.find(s => s.id === v)?.nameAr || '' },
        ]}
        filterFn={(item) => !search || item.termAr?.includes(search) || item.termIt?.toLowerCase().includes(search.toLowerCase())}
        onAdd={onAddDictEntry}
        onEdit={onEditDictEntry}
        onDelete={onDeleteDictEntry}
        onPermanentDelete={onPermanentDeleteDictEntry}
        onArchive={(id) => onArchiveDictEntry(id, true)}
        onUnarchive={(id) => onArchiveDictEntry(id, false)}
        onRestore={onRestoreDictEntry}
        onBulkDelete={onBulkDeleteDictEntry}
        onBulkPermanentDelete={onBulkPermanentDeleteDictEntry}
        onBulkArchive={onBulkArchiveDictEntry}
        onBulkRestore={onBulkRestoreDictEntry}
        onExport={onExportDictEntries}
        onImport={onImportDictEntries}
      />
    </div>
  );
});
