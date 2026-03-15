/**
 * LogsTab — Admin action logs with search, type filter, pagination, and date-range delete.
 */
import React, { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import type { AnyItem } from '../types/admin.types';

interface LogsTabProps {
  adminLogs: AnyItem[];
  adminUsers: AnyItem[];
  search: string;
  setSearch: (s: string) => void;
  deleteAdminLogsByDateRange: (from: string, to: string) => Promise<number>;
}

export const LogsTab = React.memo(function LogsTab({
  adminLogs, adminUsers, search, setSearch, deleteAdminLogsByDateRange,
}: LogsTabProps) {
  const [logTypeFilter, setLogTypeFilter] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logDeleteFrom, setLogDeleteFrom] = useState('');
  const [logDeleteTo, setLogDeleteTo] = useState('');
  const [showDeleteLogsConfirm, setShowDeleteLogsConfirm] = useState(false);

  const getLogStyle = (action: string) => {
    if (action.includes('حذف')) return { color: 'text-danger-500', bg: 'bg-danger-50', icon: 'delete' };
    if (action.includes('إنشاء') || action.includes('إضافة')) return { color: 'text-success-500', bg: 'bg-success-50', icon: 'add_circle' };
    if (action.includes('تعديل')) return { color: 'text-blue-500', bg: 'bg-blue-50', icon: 'edit' };
    if (action.includes('حظر')) return { color: 'text-orange-500', bg: 'bg-orange-50', icon: 'block' };
    if (action.includes('تصدير')) return { color: 'text-purple-500', bg: 'bg-purple-50', icon: 'download' };
    if (action.includes('استيراد')) return { color: 'text-indigo-500', bg: 'bg-indigo-50', icon: 'upload' };
    if (action.includes('أرشفة') || action.includes('استعادة')) return { color: 'text-amber-500', bg: 'bg-amber-50', icon: 'archive' };
    if (action.includes('تسجيل') || action.includes('دخول')) return { color: 'text-green-500', bg: 'bg-green-50', icon: 'login' };
    if (action.includes('كلمة المرور')) return { color: 'text-cyan-500', bg: 'bg-cyan-50', icon: 'lock_reset' };
    if (action.includes('تهيئة')) return { color: 'text-cyan-500', bg: 'bg-cyan-50', icon: 'data_object' };
    return { color: 'text-surface-500', bg: 'bg-surface-100', icon: 'info' };
  };

  const filtered = adminLogs.filter(l => {
    const adminName = adminUsers.find((u: AnyItem) => u.id === l.adminId)?.name || '';
    const matchSearch = !search || l.action.includes(search) || l.details.includes(search) || adminName.includes(search);
    const matchType = !logTypeFilter || logTypeFilter === 'الكل' || l.action.includes(logTypeFilter);
    return matchSearch && matchType;
  });

  const PAGE_SIZE = 50;
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((logPage - 1) * PAGE_SIZE, logPage * PAGE_SIZE);

  const handleExportLogs = () => {
    const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-xl border border-surface-100 overflow-hidden">
        <div className="p-3.5 border-b border-surface-100 space-y-2.5">
          {/* Row 1: title + search + export */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 mr-auto">
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <Icon name="history" size={15} className="text-slate-500" filled />
              </div>
              <span className="font-bold text-surface-900 text-sm">سجلات الإدارة</span>
              <span className="text-xs text-surface-400 bg-surface-100 px-1.5 py-0.5 rounded-full">
                {filtered.length} / {adminLogs.length}
              </span>
            </div>
            <input
              className="border border-surface-200 rounded-lg px-2.5 py-1.5 text-xs w-40 focus:outline-none focus:border-primary-400"
              placeholder="بحث في السجلات..."
              value={search}
              onChange={e => { setSearch(e.target.value); setLogPage(1); }}
            />
            <button
              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 border border-surface-200"
              title="تصدير السجلات"
              onClick={handleExportLogs}>
              <Icon name="download" size={18} />
            </button>
          </div>
          {/* Row 2: type filter pills */}
          <div className="flex gap-1.5 flex-wrap">
            {['الكل', 'إنشاء', 'تعديل', 'حذف', 'حظر', 'تصدير', 'استيراد', 'أرشفة', 'تسجيل', 'كلمة مرور'].map(type => (
              <button key={type}
                className={cn('px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border',
                  (logTypeFilter === type || (!logTypeFilter && type === 'الكل'))
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-surface-50 text-surface-500 border-surface-200 hover:border-primary-300'
                )}
                onClick={() => { setLogTypeFilter(type === 'الكل' ? '' : type); setLogPage(1); }}>
                {type}
              </button>
            ))}
          </div>
          {/* Row 3: delete by date range */}
          <div className="pt-2 border-t border-surface-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-surface-500 flex items-center gap-1">
              <Icon name="delete_sweep" size={14} className="text-danger-400" /> حذف بالتاريخ:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-surface-400">من:</span>
              <input type="date" value={logDeleteFrom} onChange={e => setLogDeleteFrom(e.target.value)}
                className="border border-surface-200 rounded-lg px-2 py-1 text-xs text-surface-700 focus:outline-none focus:border-primary-400" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-surface-400">إلى:</span>
              <input type="date" value={logDeleteTo} onChange={e => setLogDeleteTo(e.target.value)}
                className="border border-surface-200 rounded-lg px-2 py-1 text-xs text-surface-700 focus:outline-none focus:border-primary-400" />
            </div>
            <button
              disabled={!logDeleteFrom || !logDeleteTo}
              onClick={() => setShowDeleteLogsConfirm(true)}
              className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border',
                logDeleteFrom && logDeleteTo
                  ? 'bg-danger-500 text-white border-danger-500 hover:bg-danger-600'
                  : 'bg-surface-100 text-surface-400 border-surface-200 cursor-not-allowed')}>
              <Icon name="delete_sweep" size={13} /> حذف
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        {showDeleteLogsConfirm && (
          <div className="mx-4 mb-3 p-3 bg-danger-50 border border-danger-200 rounded-xl">
            <p className="text-sm font-semibold text-danger-700 mb-1">تأكيد الحذف</p>
            <p className="text-xs text-danger-600 mb-3">
              سيتم حذف جميع السجلات من <strong>{logDeleteFrom}</strong> إلى <strong>{logDeleteTo}</strong>. هذا الإجراء لا يمكن التراجع عنه.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteLogsConfirm(false)}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-white border border-surface-200 text-surface-600 hover:bg-surface-50">
                إلغاء
              </button>
              <button onClick={async () => {
                const deleted = await deleteAdminLogsByDateRange(logDeleteFrom, logDeleteTo);
                setShowDeleteLogsConfirm(false);
                setLogDeleteFrom(''); setLogDeleteTo('');
                alert(`تم حذف ${deleted} سجل بنجاح`);
              }} className="flex-1 py-1.5 rounded-lg text-xs font-medium bg-danger-500 text-white hover:bg-danger-600">
                تأكيد الحذف
              </button>
            </div>
          </div>
        )}

        <div className="divide-y divide-surface-50 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Icon name="search_off" size={40} className="text-surface-200 mx-auto mb-3" />
              <p className="text-surface-400">لا توجد سجلات تطابق البحث</p>
            </div>
          ) : (
            <>
              {paginated.map((l: AnyItem) => {
                const admin = adminUsers.find((u: AnyItem) => u.id === l.adminId);
                const style = getLogStyle(l.action);
                return (
                  <div key={l.id} className="p-3 flex items-start gap-3 hover:bg-surface-50 transition-colors">
                    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', style.bg)}>
                      <Icon name={style.icon} size={18} className={style.color} filled />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <div className="flex items-center gap-1.5">
                          {admin?.avatar
                            ? <img src={admin.avatar} className="w-5 h-5 rounded-full object-cover" alt="" />
                            : <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-[9px] font-bold text-primary-700">{(admin?.name || '?').charAt(0)}</span></div>
                          }
                          <span className="text-xs font-semibold text-primary-700">{admin?.name || 'نظام'}</span>
                        </div>
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', style.bg, style.color)}>{l.action}</span>
                        <span className="text-[10px] text-surface-400 mr-auto">{new Date(l.createdAt).toLocaleString('ar')}</span>
                      </div>
                      <p className="text-xs text-surface-600 leading-relaxed">{l.details}</p>
                    </div>
                  </div>
                );
              })}
              {totalPages > 1 && (
                <div className="p-3 flex items-center justify-center gap-2 border-t border-surface-100">
                  <button disabled={logPage === 1} onClick={() => setLogPage(p => p - 1)}
                    className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all',
                      logPage === 1 ? 'text-surface-300 border-surface-100 cursor-not-allowed' : 'text-surface-600 border-surface-200 hover:bg-surface-100')}>
                    <Icon name="chevron_right" size={18} />
                  </button>
                  <span className="text-xs text-surface-500 font-medium">{logPage} / {totalPages}</span>
                  <span className="text-xs text-surface-400">({filtered.length} سجل)</span>
                  <button disabled={logPage === totalPages} onClick={() => setLogPage(p => p + 1)}
                    className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-sm border transition-all',
                      logPage === totalPages ? 'text-surface-300 border-surface-100 cursor-not-allowed' : 'text-surface-600 border-surface-200 hover:bg-surface-100')}>
                    <Icon name="chevron_left" size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});
