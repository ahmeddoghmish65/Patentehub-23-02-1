/**
 * AdminTable (ContentWithTrash) — reusable CRUD table with active / archived / deleted views.
 * Extracted verbatim from AdminPage.tsx to preserve all existing functionality.
 */
import React from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import type { ContentView, AnyItem, TableColumn } from '../../types/admin.types';

interface AdminTableProps {
  title: string;
  icon?: string;
  iconColor?: string;
  contentView: ContentView;
  setContentView: (v: ContentView) => void;
  activeItems: AnyItem[];
  archivedItems: AnyItem[];
  deletedItems: AnyItem[];
  search: string;
  setSearch: (s: string) => void;
  columns: TableColumn[];
  filterFn: (item: AnyItem) => boolean;
  onAdd: () => void;
  onEdit: (item: AnyItem) => void;
  onDelete: (id: string) => void;
  onPermanentDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUnarchive: (id: string) => void;
  onRestore: (id: string) => void;
  onBulkDelete: (ids: string[]) => Promise<void>;
  onBulkPermanentDelete: (ids: string[]) => Promise<void>;
  onBulkArchive: (ids: string[]) => Promise<void>;
  onBulkRestore: (ids: string[]) => Promise<void>;
  onExport: () => void;
  onImport: () => void;
  selectedIds: Set<string>;
  setSelectedIds: (s: Set<string>) => void;
  filterSlot?: React.ReactNode;
}

export const AdminTable = React.memo(function AdminTable({
  title, icon, iconColor, contentView, setContentView,
  activeItems, archivedItems, deletedItems,
  search, setSearch, columns, filterFn,
  onAdd, onEdit, onDelete, onPermanentDelete, onArchive, onUnarchive, onRestore,
  onBulkDelete, onBulkPermanentDelete, onBulkArchive, onBulkRestore,
  onExport, onImport, selectedIds, setSelectedIds, filterSlot,
}: AdminTableProps) {
  const items = contentView === 'active' ? activeItems : contentView === 'archived' ? archivedItems : deletedItems;
  const filtered = items.filter(filterFn);
  const allSelected = filtered.length > 0 && filtered.every(i => selectedIds.has(i.id));

  const daysLeft = (item: AnyItem) => {
    if (!item.deletedAt) return 30;
    const diff = Date.now() - new Date(item.deletedAt).getTime();
    return Math.max(0, 30 - Math.floor(diff / 86400000));
  };

  return (
    <div className="space-y-0">
      <div className="bg-white rounded-xl border border-surface-100 overflow-hidden">
        <div className="border-b border-surface-100">
          {/* Row 1: icon+title | view tabs */}
          <div className="flex items-center gap-0 border-b border-surface-50">
            <div className="flex items-center gap-2 px-3.5 py-2.5 shrink-0 border-l border-surface-100">
              {icon && (
                <div className={cn('w-6 h-6 rounded-md flex items-center justify-center shrink-0', iconColor ? `bg-${iconColor}-50` : 'bg-surface-100')}>
                  <Icon name={icon} size={14} className={iconColor ? `text-${iconColor}-500` : 'text-surface-500'} filled />
                </div>
              )}
              <span className="font-bold text-surface-800 text-sm whitespace-nowrap">{title}</span>
              <span className="text-[10px] text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded-full shrink-0">{filtered.length}</span>
            </div>
            <div className="flex flex-1 h-full">
              {([
                { id: 'active', label: 'نشط', count: activeItems.length, activeClass: 'border-primary-500 text-primary-600 bg-primary-50/50' },
                { id: 'archived', label: 'مؤرشف', count: archivedItems.length, activeClass: 'border-amber-500 text-amber-600 bg-amber-50/50' },
                { id: 'deleted', label: 'محذوف', count: deletedItems.length, activeClass: 'border-danger-500 text-danger-600 bg-danger-50/50' },
              ] as { id: ContentView; label: string; count: number; activeClass: string }[]).map(v => (
                <button key={v.id}
                  onClick={() => { setContentView(v.id); setSelectedIds(new Set()); }}
                  className={cn('flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap',
                    contentView === v.id ? v.activeClass : 'border-transparent text-surface-400 hover:text-surface-600 hover:bg-surface-50')}>
                  {v.label}
                  {v.count > 0 && (
                    <span className={cn('rounded-full text-[9px] px-1.5 py-0 font-bold min-w-[16px] text-center',
                      contentView === v.id ? 'bg-current/10' : 'bg-surface-100 text-surface-500')}>
                      {v.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Row 2: filter | search | import | export | add | bulk actions */}
          <div className="flex items-center gap-1.5 px-3 py-2 flex-wrap bg-surface-50/50">
            {filterSlot}
            <input
              className="border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs w-28 focus:outline-none focus:border-primary-400 bg-white"
              placeholder="بحث..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <div className="flex-1" />
            {contentView === 'active' && (
              <>
                <button className="p-1.5 rounded-lg hover:bg-white text-surface-400 border border-surface-200 bg-white" onClick={onImport} title="استيراد"><Icon name="upload" size={15} /></button>
                <button className="p-1.5 rounded-lg hover:bg-white text-surface-400 border border-surface-200 bg-white" onClick={onExport} title="تصدير"><Icon name="download" size={15} /></button>
                <Button size="sm" onClick={onAdd} icon={<Icon name="add" size={14} />}>إضافة</Button>
              </>
            )}
            {selectedIds.size > 0 && contentView === 'active' && (
              <>
                <button className="px-2.5 py-1.5 text-[11px] font-semibold bg-amber-500 text-white rounded-lg hover:bg-amber-600 flex items-center gap-1"
                  onClick={async () => { if (!confirm(`أرشفة ${selectedIds.size} عناصر؟`)) return; await onBulkArchive(Array.from(selectedIds)); }}>
                  <Icon name="inventory_2" size={12} /> أرشفة ({selectedIds.size})
                </button>
                <button className="px-2.5 py-1.5 text-[11px] font-semibold bg-danger-500 text-white rounded-lg hover:bg-danger-600 flex items-center gap-1"
                  onClick={async () => { if (!confirm(`حذف ${selectedIds.size} عناصر؟`)) return; await onBulkDelete(Array.from(selectedIds)); }}>
                  🗑 حذف ({selectedIds.size})
                </button>
              </>
            )}
            {selectedIds.size > 0 && contentView === 'archived' && (
              <button className="px-2.5 py-1.5 text-[11px] font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                onClick={async () => { if (!confirm(`استعادة ${selectedIds.size} عناصر؟`)) return; await onBulkRestore(Array.from(selectedIds)); }}>
                <Icon name="restore" size={12} /> إعادة نشر ({selectedIds.size})
              </button>
            )}
            {selectedIds.size > 0 && contentView === 'deleted' && (
              <>
                <button className="px-2.5 py-1.5 text-[11px] font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-1"
                  onClick={async () => { if (!confirm(`استعادة ${selectedIds.size} عناصر؟`)) return; await onBulkRestore(Array.from(selectedIds)); }}>
                  <Icon name="restore" size={12} /> استعادة ({selectedIds.size})
                </button>
                <button className="px-2.5 py-1.5 text-[11px] font-semibold bg-danger-700 text-white rounded-lg hover:bg-danger-800 flex items-center gap-1"
                  onClick={async () => { if (!confirm(`حذف نهائي ${selectedIds.size} عناصر؟ لا يمكن التراجع!`)) return; await onBulkPermanentDelete(Array.from(selectedIds)); }}>
                  🗑 نهائي ({selectedIds.size})
                </button>
              </>
            )}
            {contentView === 'deleted' && deletedItems.length > 0 && selectedIds.size === 0 && (
              <span className="text-[10px] text-danger-400">⏱ تُحذف بعد 30 يوماً</span>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-50">
              <tr>
                <th className="p-3 w-8">
                  <input type="checkbox" className="rounded" checked={!!allSelected}
                    onChange={e => {
                      if (e.target.checked) setSelectedIds(new Set(filtered.map(i => i.id)));
                      else setSelectedIds(new Set());
                    }} />
                </th>
                {columns.map(c => <th key={c.key} className="text-right p-3 font-semibold text-surface-600">{c.label}</th>)}
                {contentView === 'deleted' && <th className="text-right p-3 font-semibold text-surface-600">يُحذف بعد</th>}
                <th className="text-right p-3 font-semibold text-surface-600 w-28">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item: AnyItem) => (
                <tr key={String(item.id)} className={cn('border-t border-surface-50 hover:bg-surface-50',
                  selectedIds.has(item.id) && 'bg-primary-50',
                  contentView === 'archived' && 'opacity-75',
                  contentView === 'deleted' && 'opacity-60'
                )}>
                  <td className="p-3">
                    <input type="checkbox" className="rounded" checked={selectedIds.has(item.id)}
                      onChange={e => {
                        const s = new Set(selectedIds);
                        e.target.checked ? s.add(item.id) : s.delete(item.id);
                        setSelectedIds(s);
                      }} />
                  </td>
                  {columns.map(c => (
                    <td key={c.key} className="p-3 max-w-xs truncate">{String(c.render ? c.render(item[c.key]) : (item[c.key] ?? ''))}</td>
                  ))}
                  {contentView === 'deleted' && (
                    <td className="p-3">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
                        daysLeft(item) <= 7 ? 'bg-danger-50 text-danger-600' :
                        daysLeft(item) <= 14 ? 'bg-warning-50 text-warning-600' : 'bg-surface-100 text-surface-500')}>
                        {daysLeft(item)} يوم
                      </span>
                    </td>
                  )}
                  <td className="p-3">
                    <div className="flex gap-1">
                      {contentView === 'active' && (
                        <>
                          <button className="p-1 rounded hover:bg-surface-100" title="تعديل" onClick={() => onEdit(item)}><Icon name="edit" size={16} className="text-primary-500" /></button>
                          <button className="p-1 rounded hover:bg-amber-50" title="أرشفة" onClick={() => onArchive(item.id)}><Icon name="inventory_2" size={16} className="text-amber-500" /></button>
                          <button className="p-1 rounded hover:bg-danger-50" title="حذف" onClick={() => onDelete(item.id)}><Icon name="delete" size={16} className="text-danger-500" /></button>
                        </>
                      )}
                      {contentView === 'archived' && (
                        <>
                          <button className="p-1 rounded hover:bg-green-50" title="إعادة نشر" onClick={() => onUnarchive(item.id)}><Icon name="restore" size={16} className="text-green-600" /></button>
                          <button className="p-1 rounded hover:bg-danger-50" title="حذف" onClick={() => onDelete(item.id)}><Icon name="delete" size={16} className="text-danger-500" /></button>
                        </>
                      )}
                      {contentView === 'deleted' && (
                        <>
                          <button className="p-1 rounded hover:bg-green-50" title="استعادة" onClick={() => onRestore(item.id)}><Icon name="restore" size={16} className="text-green-600" /></button>
                          <button className="p-1 rounded hover:bg-danger-50" title="حذف نهائي" onClick={() => onPermanentDelete(item.id)}><Icon name="delete_forever" size={16} className="text-danger-700" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-10 text-center">
              <Icon name={contentView === 'deleted' ? 'delete' : contentView === 'archived' ? 'inventory_2' : 'folder_open'} size={40} className="text-surface-200 mx-auto mb-3" />
              <p className="text-surface-400 text-sm">
                {contentView === 'deleted' ? 'لا توجد عناصر محذوفة' : contentView === 'archived' ? 'لا توجد عناصر مؤرشفة' : 'لا توجد بيانات'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
