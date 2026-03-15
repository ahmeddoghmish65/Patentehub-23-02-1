/**
 * UsersTab — User management: list, detail view, banning, permissions, community restrictions.
 * Extracted from AdminPage.tsx users section.
 */
import React, { useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { VerifiedBadge } from '@/shared/ui/VerifiedBadge';
import { useTranslation } from '@/i18n';
import type { ContentView, AnyItem, ConfirmDelete } from '../types/admin.types';

interface UsersTabProps {
  adminUsers: AnyItem[];
  deletedUsers: AnyItem[];
  search: string;
  setSearch: (s: string) => void;
  banUser: (id: string, banned: boolean) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  restoreUser: (id: string) => Promise<boolean>;
  permanentDeleteUser: (id: string) => Promise<boolean>;
  setCommunityRestrictions: (userId: string, r: Record<string, boolean>) => Promise<boolean>;
  loadAdminUsers: () => Promise<void>;
  setConfirmDel: (d: ConfirmDelete | null) => void;
}

export const UsersTab = React.memo(function UsersTab({
  adminUsers, deletedUsers, search, setSearch, banUser,
  deleteUser, restoreUser, permanentDeleteUser, setCommunityRestrictions, loadAdminUsers, setConfirmDel,
}: UsersTabProps) {
  const { t, uiLang } = useTranslation();
  const [contentView, setContentView] = useState<ContentView>('active');
  const [viewUser, setViewUser] = useState<string | null>(null);
  const [userSelectedIds, setUserSelectedIds] = useState<Set<string>>(new Set());

  const selectedUser = adminUsers.find(u => u.id === viewUser);

  // ── User detail view ─────────────────────────────────────────────────────
  if (selectedUser) {
    const totalAns = selectedUser.progress.correctAnswers + selectedUser.progress.wrongAnswers;
    const acc = totalAns > 0 ? Math.round((selectedUser.progress.correctAnswers / totalAns) * 100) : 0;
    return (
      <div className="space-y-4">
        <button onClick={() => setViewUser(null)} className="flex items-center gap-2 text-surface-500 hover:text-primary-600">
          <Icon name="arrow_forward" size={20} /><span className="text-sm">{t('admin.back_to_users')}</span>
        </button>
        <div className="bg-white rounded-xl border border-surface-100 p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            {selectedUser.avatar ? (
              <img src={selectedUser.avatar} className="w-16 h-16 rounded-xl object-cover" alt="" />
            ) : (
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-primary-700">{selectedUser.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-surface-900">{selectedUser.name}</h2>
              <p className="text-sm text-surface-500">{selectedUser.email}</p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className={cn('text-xs px-2 py-0.5 rounded-full', selectedUser.isBanned ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-600')}>
                  {selectedUser.isBanned ? 'محظور' : 'نشط'}
                </span>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', selectedUser.role === 'admin' ? 'bg-purple-50 text-purple-600' : selectedUser.role === 'manager' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600')}>
                  {selectedUser.role === 'admin' ? 'مسؤول رئيسي' : selectedUser.role === 'manager' ? 'مدير' : 'مستخدم'}
                </span>
                {selectedUser.verified && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 flex items-center gap-1">
                    <VerifiedBadge size="xs" /> موثق
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { v: selectedUser.progress.level, l: 'المستوى' },
              { v: selectedUser.progress.xp, l: 'XP' },
              { v: `${acc}%`, l: 'الدقة' },
              { v: `${selectedUser.progress.examReadiness}%`, l: 'الجاهزية' },
            ].map(({ v, l }) => (
              <div key={l} className="bg-surface-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-surface-900">{v}</p>
                <p className="text-[10px] text-surface-400">{l}</p>
              </div>
            ))}
          </div>

          {/* Manager Permissions */}
          {selectedUser.role === 'manager' && (
            <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
              <h3 className="text-sm font-bold text-amber-800 mb-3 flex items-center gap-1">
                <Icon name="tune" size={18} /> صلاحيات المدير
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'overview', label: 'نظرة عامة', icon: 'dashboard' },
                  { key: 'users', label: 'المستخدمين', icon: 'group' },
                  { key: 'sections', label: 'الأقسام', icon: 'folder' },
                  { key: 'lessons', label: 'الدروس', icon: 'school' },
                  { key: 'questions', label: 'الأسئلة', icon: 'quiz' },
                  { key: 'signs', label: 'الإشارات', icon: 'traffic' },
                  { key: 'dictionary', label: 'القاموس', icon: 'menu_book' },
                  { key: 'posts', label: 'المنشورات', icon: 'forum' },
                  { key: 'comments', label: 'التعليقات', icon: 'chat_bubble' },
                  { key: 'reports', label: 'البلاغات', icon: 'flag' },
                  { key: 'logs', label: 'السجلات', icon: 'history' },
                  { key: 'analytics', label: 'الزيارات', icon: 'analytics' },
                ].map(perm => {
                  const perms: string[] = (selectedUser as Record<string, unknown>).permissions as string[] || [];
                  const has = perms.includes(perm.key);
                  return (
                    <button key={perm.key}
                      className={cn('flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all',
                        has ? 'bg-amber-200 text-amber-900' : 'bg-white text-surface-500 border border-surface-200')}
                      onClick={async () => {
                        const db = await import('@/infrastructure/database/database').then(m => m.getDB());
                        const u = await db.get('users', selectedUser.id);
                        if (u) {
                          const current: string[] = u.permissions || [];
                          u.permissions = has ? current.filter((p: string) => p !== perm.key) : [...current, perm.key];
                          await db.put('users', u);
                          loadAdminUsers();
                        }
                      }}>
                      <Icon name={perm.icon} size={14} />
                      {perm.label}
                      {has && <Icon name="check" size={12} className="mr-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personal Info */}
          <div className="border-t border-surface-100 pt-4 mt-4">
            <h3 className="text-sm font-bold text-surface-900 mb-3 flex items-center gap-1">
              <Icon name="person" size={16} className="text-primary-500" /> المعلومات الشخصية
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                { l: 'الاسم الأول', v: selectedUser.firstName || '—' },
                { l: 'اسم العائلة', v: selectedUser.lastName || '—' },
                { l: 'اسم المستخدم', v: `@${selectedUser.username || '—'}` },
                { l: 'البريد', v: selectedUser.email },
                { l: 'تاريخ الميلاد', v: selectedUser.birthDate || '—' },
                { l: 'الجنس', v: selectedUser.gender === 'male' ? 'ذكر' : selectedUser.gender === 'female' ? 'أنثى' : '—' },
                { l: 'الهاتف', v: selectedUser.phone ? `${selectedUser.phoneCode || ''} ${selectedUser.phone}` : '—' },
                { l: 'الدولة / المحافظة', v: selectedUser.province ? `${selectedUser.province}, Italia` : '—' },
              ].map(({ l, v }) => (
                <div key={l} className="bg-surface-50 rounded-lg p-2.5">
                  <p className="text-[10px] text-surface-400">{l}</p>
                  <p className="font-medium text-surface-800">{v}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Stats */}
          <div className="border-t border-surface-100 pt-4 mt-4">
            <h3 className="text-sm font-bold text-surface-900 mb-3 flex items-center gap-1">
              <Icon name="school" size={16} className="text-primary-500" /> إحصائيات التعلم
            </h3>
            <div className="space-y-2 text-sm">
              {[
                { l: 'الاختبارات', v: selectedUser.progress.totalQuizzes },
                { l: 'إجابات صحيحة', v: selectedUser.progress.correctAnswers, cls: 'text-success-600' },
                { l: 'إجابات خاطئة', v: selectedUser.progress.wrongAnswers, cls: 'text-danger-600' },
                { l: 'الدقة', v: `${acc}%` },
                { l: 'الدروس المكتملة', v: selectedUser.progress.completedLessons.length },
                { l: 'سلسلة الأيام', v: `${selectedUser.progress.currentStreak} (أفضل: ${selectedUser.progress.bestStreak})` },
                { l: 'XP', v: selectedUser.progress.xp },
                { l: 'جاهزية الامتحان', v: `${selectedUser.progress.examReadiness}%`, cls: selectedUser.progress.examReadiness >= 70 ? 'text-success-600' : 'text-warning-600' },
              ].map(({ l, v, cls }) => (
                <div key={l} className="flex justify-between py-1 border-b border-surface-50">
                  <span className="text-surface-500">{l}</span>
                  <span className={cn('font-medium', cls)}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-surface-100">
            {selectedUser.role !== 'admin' && (
              <Button size="sm" variant={selectedUser.isBanned ? 'primary' : 'danger'}
                onClick={() => banUser(selectedUser.id, !selectedUser.isBanned)}
                icon={<Icon name={selectedUser.isBanned ? 'lock_open' : 'block'} size={16} />}>
                {selectedUser.isBanned ? 'إلغاء الحظر الكامل' : 'حظر المستخدم كاملاً'}
              </Button>
            )}
            {selectedUser.email !== 'admin@patente.com' && (
              <>
                <Button size="sm" variant="secondary"
                  onClick={async () => {
                    const db = await import('@/infrastructure/database/database').then(m => m.getDB());
                    const u = await db.get('users', selectedUser.id);
                    if (u) {
                      u.role = u.role === 'manager' ? 'user' : 'manager';
                      u.permissions = [];
                      await db.put('users', u);
                      loadAdminUsers();
                    }
                  }}
                  icon={<Icon name="admin_panel_settings" size={16} />}>
                  {selectedUser.role === 'manager' ? 'إزالة صلاحيات المدير' : 'تعيين كمدير (بدون صلاحيات)'}
                </Button>
                <Button size="sm" variant="secondary"
                  onClick={async () => {
                    const db = await import('@/infrastructure/database/database').then(m => m.getDB());
                    const u = await db.get('users', selectedUser.id);
                    if (u) { u.verified = !u.verified; await db.put('users', u); loadAdminUsers(); }
                  }}
                  icon={<Icon name={selectedUser.verified ? 'verified' : 'new_releases'} size={16} />}>
                  {selectedUser.verified ? 'إلغاء التحقق' : 'تحقق من المستخدم ✓'}
                </Button>
                <Button size="sm" variant="danger"
                  onClick={() => { setConfirmDel({ type: 'user', id: selectedUser.id }); setViewUser(null); }}
                  icon={<Icon name="delete" size={16} />}>
                  حذف الحساب
                </Button>
              </>
            )}
          </div>

          {/* Community Restrictions */}
          <div className="mt-5 p-4 bg-orange-50 rounded-xl border border-orange-100">
            <h3 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-1">
              <Icon name="shield" size={16} /> قيود المجتمع
              <span className="text-[10px] font-normal text-orange-500 mr-1">(تطبق فوراً على الحساب)</span>
            </h3>
            {(() => {
              const cr = (selectedUser as Record<string, unknown>).communityRestrictions as { canPost?: boolean; canComment?: boolean; canReply?: boolean } || {};
              const canPost = cr.canPost !== false;
              const canComment = cr.canComment !== false;
              const canReply = cr.canReply !== false;
              return (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'canPost', label: 'النشر', icon: 'edit_note', allowed: canPost },
                    { key: 'canComment', label: 'التعليق', icon: 'chat_bubble', allowed: canComment },
                    { key: 'canReply', label: 'الرد', icon: 'reply', allowed: canReply },
                  ].map(item => (
                    <button key={item.key}
                      className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-semibold',
                        item.allowed ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')}
                      onClick={() => setCommunityRestrictions(selectedUser.id, { [item.key]: !item.allowed })}>
                      <Icon name={item.icon} size={18} />
                      {item.label}
                      <span className={cn('text-[10px] font-bold', item.allowed ? 'text-green-600' : 'text-red-600')}>
                        {item.allowed ? '✓ مسموح' : '✗ محظور'}
                      </span>
                    </button>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  // ── Users list ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex gap-2 flex-wrap">
        {([
          { v: 'active', icon: 'group', label: `نشط (${adminUsers.filter(u => !u.isBanned).length})`, color: 'bg-primary-500 border-primary-500' },
          { v: 'banned', icon: 'block', label: `محظور (${adminUsers.filter(u => u.isBanned).length})`, color: 'bg-danger-500 border-danger-500' },
          { v: 'deleted', icon: 'delete', label: `محذوف (${deletedUsers.length})`, color: 'bg-danger-500 border-danger-500' },
        ] as { v: ContentView; icon: string; label: string; color: string }[]).map(({ v, icon, label, color }) => (
          <button key={v} onClick={() => setContentView(v)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border',
              contentView === v ? `${color} text-white` : 'bg-white text-surface-600 border-surface-200 hover:border-primary-200')}>
            <Icon name={icon} size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Deleted users */}
      {contentView === 'deleted' && (
        <div className="bg-white rounded-xl border border-danger-100 overflow-hidden">
          <div className="p-4 border-b border-danger-100 bg-danger-50 flex items-center gap-2">
            <Icon name="delete" size={18} className="text-danger-500" />
            <h3 className="font-bold text-danger-700">المستخدمين المحذوفين ({deletedUsers.length})</h3>
            <span className="text-xs text-danger-400 mr-1">يمكن استعادتهم أو حذفهم نهائياً</span>
          </div>
          {deletedUsers.length === 0 ? (
            <div className="p-8 text-center text-surface-400"><Icon name="delete" size={36} className="mx-auto mb-2 opacity-30" /><p>لا توجد مستخدمين محذوفين</p></div>
          ) : (
            <div className="divide-y divide-surface-50 max-h-[500px] overflow-y-auto">
              {deletedUsers.map((u: AnyItem) => (
                <div key={u.id} className="p-4 flex items-center gap-3 hover:bg-danger-50/50 transition-colors">
                  {u.avatar ? <img src={u.avatar} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" /> : (
                    <div className="w-9 h-9 bg-danger-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-danger-600">{u.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-700 truncate">{u.name}</p>
                    <p className="text-xs text-surface-400 truncate">{u.email}</p>
                    <p className="text-[10px] text-danger-400">حُذف: {u.deletedAt ? new Date(u.deletedAt).toLocaleDateString('ar') : '—'}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button title="استعادة" className="p-1.5 rounded-lg bg-success-50 hover:bg-success-100 text-success-600 transition-colors" onClick={() => restoreUser(u.id)}>
                      <Icon name="restore" size={16} />
                    </button>
                    <button title="حذف نهائي" className="p-1.5 rounded-lg bg-danger-50 hover:bg-danger-100 text-danger-600 transition-colors" onClick={() => setConfirmDel({ type: 'user-permanent', id: u.id })}>
                      <Icon name="delete_forever" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Banned users */}
      {contentView === 'banned' && (
        <div className="bg-white rounded-xl border border-danger-100 overflow-hidden">
          <div className="p-4 border-b border-danger-100 bg-danger-50 flex items-center gap-2">
            <Icon name="block" size={18} className="text-danger-500" />
            <h3 className="font-bold text-danger-700">المستخدمين المحظورين ({adminUsers.filter(u => u.isBanned).length})</h3>
          </div>
          {adminUsers.filter(u => u.isBanned).length === 0 ? (
            <div className="p-8 text-center text-surface-400"><Icon name="block" size={36} className="mx-auto mb-2 opacity-30" /><p>لا يوجد مستخدمين محظورين</p></div>
          ) : (
            <div className="divide-y divide-surface-50">
              {adminUsers.filter(u => u.isBanned).map((u: AnyItem) => (
                <div key={u.id} className="p-4 flex items-center gap-3 hover:bg-danger-50/40 transition-colors">
                  {u.avatar ? <img src={u.avatar} className="w-9 h-9 rounded-full object-cover shrink-0" alt="" /> : (
                    <div className="w-9 h-9 bg-danger-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-danger-600">{u.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-surface-700 truncate">{u.name}</p>
                    <p className="text-xs text-surface-400 truncate">{u.email}</p>
                  </div>
                  <button className="p-1.5 rounded-lg bg-success-50 hover:bg-success-100 text-success-600 transition-colors text-xs font-medium flex items-center gap-1"
                    onClick={() => banUser(u.id, false)}>
                    <Icon name="lock_open" size={15} />
                    رفع الحظر
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active users table */}
      {contentView === 'active' && (
        <div className="bg-white rounded-xl border border-surface-100 overflow-hidden">
          <div className="p-4 border-b border-surface-100 flex items-center justify-between flex-wrap gap-3">
            <h2 className="font-bold text-surface-900">المستخدمين النشطين ({adminUsers.filter(u => !u.isBanned).length})</h2>
            <div className="flex items-center gap-2">
              <input
                className="border border-surface-200 rounded-lg px-3 py-1.5 text-sm w-48"
                placeholder="بحث..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {userSelectedIds.size > 0 && (
                <button className="px-3 py-1.5 text-xs font-semibold bg-danger-500 text-white rounded-lg hover:bg-danger-600"
                  onClick={async () => {
                    if (!confirm(`حذف ${userSelectedIds.size} مستخدم؟`)) return;
                    for (const id of userSelectedIds) await deleteUser(id);
                    setUserSelectedIds(new Set());
                  }}>
                  حذف المحدد ({userSelectedIds.size})
                </button>
              )}
              <button className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400" title="تصدير"
                onClick={() => {
                  const usersToExport = userSelectedIds.size > 0
                    ? adminUsers.filter(u => userSelectedIds.has(u.id))
                    : adminUsers;
                  const rows = usersToExport.map((u: AnyItem) => ({
                    الاسم: u.name, البريد: u.email,
                    الدور: u.role, الحالة: u.isBanned ? 'محظور' : 'نشط',
                    تاريخ_التسجيل: new Date(u.createdAt).toLocaleDateString('ar'),
                  }));
                  const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'users_export.json'; a.click();
                }}>
                <Icon name="download" size={18} />
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-50">
                <tr>
                  <th className="p-3 w-8">
                    <input type="checkbox" className="rounded"
                      checked={userSelectedIds.size === adminUsers.filter(u => !search || u.name.includes(search) || u.email.includes(search)).length && adminUsers.length > 0}
                      onChange={e => {
                        const filtered = adminUsers.filter(u => !search || u.name.includes(search) || u.email.includes(search));
                        if (e.target.checked) setUserSelectedIds(new Set(filtered.map(u => u.id)));
                        else setUserSelectedIds(new Set());
                      }} />
                  </th>
                  <th className="p-3 font-semibold text-surface-600 text-right">{t('admin.tab_users')}</th>
                  <th className="p-3 font-semibold text-surface-600 text-right">Email</th>
                  <th className="p-3 font-semibold text-surface-600 text-right">{uiLang === 'it' ? 'Ruolo' : 'الدور'}</th>
                  <th className="p-3 font-semibold text-surface-600 text-right">{uiLang === 'it' ? 'Livello' : 'المستوى'}</th>
                  <th className="p-3 font-semibold text-surface-600 text-right">{uiLang === 'it' ? 'Stato' : 'الحالة'}</th>
                  <th className="p-3 font-semibold text-surface-600 w-28" />
                </tr>
              </thead>
              <tbody>
                {adminUsers.filter(u => !u.isBanned && (!search || u.name.includes(search) || u.email.includes(search))).map((u: AnyItem) => (
                  <tr key={u.id}
                    className={cn('border-t border-surface-50 hover:bg-surface-50 cursor-pointer', userSelectedIds.has(u.id) && 'bg-primary-50')}
                    onClick={() => setViewUser(u.id)}>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" className="rounded" checked={userSelectedIds.has(u.id)}
                        onChange={e => { const s = new Set(userSelectedIds); e.target.checked ? s.add(u.id) : s.delete(u.id); setUserSelectedIds(s); }} />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {u.avatar ? <img src={u.avatar} className="w-7 h-7 rounded-full object-cover" alt="" /> : (
                          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-700">{u.name.charAt(0)}</span>
                          </div>
                        )}
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-surface-500">{u.email}</td>
                    <td className="p-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                        u.role === 'admin' ? 'bg-purple-50 text-purple-600' : u.role === 'manager' ? 'bg-amber-50 text-amber-600' : 'bg-surface-100 text-surface-500')}>
                        {u.role === 'admin' ? t('admin.role_admin_badge') : u.role === 'manager' ? t('admin.role_manager_badge') : uiLang === 'it' ? 'Utente' : 'مستخدم'}
                      </span>
                    </td>
                    <td className="p-3">{u.progress.level}</td>
                    <td className="p-3">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', u.isBanned ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-600')}>
                        {u.isBanned ? t('admin.role_banned_badge') : t('admin.role_active_badge')}
                      </span>
                    </td>
                    <td className="p-3" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1">
                        <button className="p-1 rounded hover:bg-surface-100" title="عرض التفاصيل" onClick={() => setViewUser(u.id)}>
                          <Icon name="visibility" size={16} className="text-primary-500" />
                        </button>
                        {u.role !== 'admin' && (
                          <button className="p-1 rounded hover:bg-surface-100" onClick={() => banUser(u.id, !u.isBanned)}>
                            <Icon name={u.isBanned ? 'lock_open' : 'block'} size={16} className={u.isBanned ? 'text-success-500' : 'text-warning-500'} />
                          </button>
                        )}
                        {u.email !== 'admin@patente.com' && (
                          <button className="p-1 rounded hover:bg-surface-100" onClick={() => setConfirmDel({ type: 'user', id: u.id })}>
                            <Icon name="delete" size={16} className="text-danger-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
});
