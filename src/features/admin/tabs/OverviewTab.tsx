/**
 * OverviewTab — Dashboard overview with stats, charts, and quick links.
 * Extracted from AdminPage.tsx overview section.
 */
import React from 'react';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import type { AdminTab, AnyItem } from '../types/admin.types';

interface OverviewTabProps {
  adminStats: {
    totalUsers: number; totalPosts: number; totalQuestions: number;
    totalSections: number; totalLessons: number; totalSigns: number;
    totalReports: number; activeToday: number;
  };
  adminUsers: AnyItem[];
  adminReports: AnyItem[];
  adminLogs: AnyItem[];
  allDictSections: AnyItem[];
  allDictEntries: AnyItem[];
  isFullAdmin: boolean;
  userPerms: string[];
  allTabsConfig: { id: AdminTab; permKey?: string }[];
  onNavigateTab: (tab: AdminTab) => void;
}

export const OverviewTab = React.memo(function OverviewTab({
  adminStats, adminUsers, adminReports, adminLogs,
  allDictSections, allDictEntries,
  isFullAdmin, userPerms, allTabsConfig, onNavigateTab,
}: OverviewTabProps) {
  const { t, uiLang } = useTranslation();

  const pendingReports = adminReports.filter(r => r.status === 'pending').length;
  const bannedUsers = adminUsers.filter(u => u.isBanned).length;
  const verifiedUsers = adminUsers.filter(u => u.verified).length;
  const managersCount = adminUsers.filter(u => u.role === 'manager').length;
  const dictTotal = allDictSections.length;
  const dictEntriesTotal = allDictEntries.length;
  const totalQuizzes = adminUsers.reduce((s: number, u: AnyItem) => s + u.progress.totalQuizzes, 0);
  const readyForExam = adminUsers.filter(u => u.progress.examReadiness >= 70).length;
  const avgReadiness = adminUsers.length > 0
    ? Math.round(adminUsers.reduce((s: number, u: AnyItem) => s + (u.progress.examReadiness || 0), 0) / adminUsers.length)
    : 0;

  const now = Date.now();
  const day = 86400000;
  const last7Reg = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * day);
    const key = d.toISOString().slice(0, 10);
    const dayNames = ['أح', 'اث', 'ثل', 'أر', 'خم', 'جم', 'سب'];
    return {
      day: dayNames[d.getDay()],
      count: adminUsers.filter((u: AnyItem) => u.createdAt.slice(0, 10) === key).length,
    };
  });
  const maxReg = Math.max(...last7Reg.map(d => d.count), 1);

  return (
    <div className="space-y-5">
      {/* Hero gradient banner */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute -top-8 -left-8 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
              <Icon name="admin_panel_settings" size={26} className="text-white" filled />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('admin.overview_welcome')}</h2>
              <p className="text-primary-200 text-xs">{t('admin.overview_overview')}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: t('admin.stat_total_users'), value: adminStats.totalUsers, icon: 'group', sub: `${adminStats.activeToday} ${t('admin.stat_active_today')}` },
              { label: t('admin.stat_posts'), value: adminStats.totalPosts, icon: 'forum', sub: t('admin.stat_in_community') },
              { label: t('admin.stat_edu_questions'), value: adminStats.totalQuestions, icon: 'quiz', sub: `${adminStats.totalSections} ${t('admin.stat_sections')}` },
              { label: t('admin.stat_pending_reports'), value: pendingReports, icon: 'flag', sub: pendingReports > 0 ? t('admin.stat_waiting_review') : t('admin.stat_no_reports') },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <div className="flex items-center gap-2 mb-1">
                  <Icon name={s.icon} size={16} className="text-white/70" />
                  <p className="text-[10px] text-white/70 leading-none">{s.label}</p>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-[10px] text-white/50 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick KPIs row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('admin.kpi_verified'), value: verifiedUsers, icon: 'verified', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: t('admin.kpi_managers'), value: managersCount, icon: 'manage_accounts', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
          { label: t('admin.kpi_banned'), value: bannedUsers, icon: 'block', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100' },
          { label: t('admin.kpi_ready'), value: readyForExam, icon: 'emoji_events', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        ].map((s, i) => (
          <div key={i} className={cn('bg-white rounded-xl p-4 border flex items-center gap-3', s.border)}>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', s.bg)}>
              <Icon name={s.icon} size={22} className={s.color} filled />
            </div>
            <div>
              <p className="text-xl font-bold text-surface-900">{s.value}</p>
              <p className="text-xs text-surface-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Registrations chart + Exam readiness */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-surface-100 p-5">
          <h3 className="font-bold text-surface-900 mb-1 flex items-center gap-2">
            <Icon name="person_add" size={18} className="text-primary-500" filled />
            {t('admin.chart_reg_title')}
          </h3>
          <p className="text-xs text-surface-400 mb-4">{t('admin.chart_new_total')} {last7Reg.reduce((s, d) => s + d.count, 0)} {t('admin.chart_new_users')}</p>
          <div className="flex items-end gap-1.5 h-24">
            {last7Reg.map((d, i) => {
              const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#22c55e','#06b6d4','#3b82f6'];
              const h = Math.max(4, Math.round((d.count / maxReg) * 80));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-surface-500 font-medium">{d.count > 0 ? d.count : ''}</span>
                  <div className="w-full rounded-t-lg transition-all" style={{ height: h, backgroundColor: colors[i] + (i === 6 ? 'ff' : '80') }} />
                  <span className="text-[9px] text-surface-400">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-surface-100 p-5">
          <h3 className="font-bold text-surface-900 mb-1 flex items-center gap-2">
            <Icon name="school" size={18} className="text-purple-500" filled />
            {t('admin.chart_readiness_title')}
          </h3>
          <p className="text-xs text-surface-400 mb-4">{t('admin.chart_avg_readiness')} <strong className="text-surface-700">{avgReadiness}%</strong></p>
          <div className="space-y-2.5">
            {[
              { label: t('admin.readiness_high'), count: readyForExam, color: '#22c55e', max: adminUsers.length },
              { label: t('admin.readiness_mid'), count: adminUsers.filter((u: AnyItem) => u.progress.examReadiness >= 40 && u.progress.examReadiness < 70).length, color: '#f59e0b', max: adminUsers.length },
              { label: t('admin.readiness_low'), count: adminUsers.filter((u: AnyItem) => u.progress.examReadiness < 40).length, color: '#ef4444', max: adminUsers.length },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-surface-600 w-24 shrink-0">{item.label}</span>
                <div className="flex-1 bg-surface-100 rounded-full h-2">
                  <div className="h-2 rounded-full transition-all" style={{ width: `${item.max > 0 ? Math.round(item.count / item.max * 100) : 0}%`, backgroundColor: item.color }} />
                </div>
                <span className="text-xs font-bold text-surface-700 w-8 text-left">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('admin.tab_sections'), value: adminStats.totalSections, icon: 'folder', color: 'text-purple-500', bg: 'bg-purple-50', tab: 'sections' as AdminTab },
          { label: t('admin.tab_lessons'), value: adminStats.totalLessons, icon: 'school', color: 'text-green-500', bg: 'bg-green-50', tab: 'lessons' as AdminTab },
          { label: t('admin.tab_questions'), value: adminStats.totalQuestions, icon: 'quiz', color: 'text-orange-500', bg: 'bg-orange-50', tab: 'questions' as AdminTab },
          { label: t('admin.tab_signs'), value: adminStats.totalSigns, icon: 'traffic', color: 'text-red-500', bg: 'bg-red-50', tab: 'signs' as AdminTab },
          { label: t('admin.stat_dict_sections'), value: dictTotal, icon: 'menu_book', color: 'text-cyan-500', bg: 'bg-cyan-50', tab: 'dictionary' as AdminTab },
          { label: t('admin.stat_terms'), value: dictEntriesTotal, icon: 'translate', color: 'text-indigo-500', bg: 'bg-indigo-50', tab: 'dictionary' as AdminTab },
          { label: t('admin.stat_total_quizzes'), value: totalQuizzes, icon: 'history_edu', color: 'text-pink-500', bg: 'bg-pink-50', tab: 'overview' as AdminTab },
          { label: t('admin.stat_total_reports_all'), value: adminStats.totalReports, icon: 'flag', color: 'text-red-500', bg: 'bg-red-50', tab: 'reports' as AdminTab },
        ].map((s, i) => {
          const tabCfg = allTabsConfig.find(tc => tc.id === s.tab);
          const canAccess = isFullAdmin || !tabCfg?.permKey || userPerms.includes(tabCfg.permKey || '');
          return (
            <button key={i}
              className={cn('bg-white rounded-xl p-4 border border-surface-100 text-right transition-all',
                canAccess ? 'hover:border-primary-200 hover:shadow-md cursor-pointer' : 'opacity-60 cursor-not-allowed')}
              onClick={() => canAccess && onNavigateTab(s.tab)}>
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', s.bg)}>
                <Icon name={s.icon} size={22} className={s.color} filled />
              </div>
              <p className="text-2xl font-bold text-surface-900">{s.value}</p>
              <p className="text-xs text-surface-500">{s.label}</p>
              {!canAccess && <p className="text-[10px] text-surface-300 mt-0.5">{t('admin.no_access')}</p>}
            </button>
          );
        })}
      </div>

      {/* Pending Reports */}
      {pendingReports > 0 && (
        <div className="bg-white rounded-xl border border-danger-100 p-5">
          <h3 className="font-bold text-surface-900 mb-3 flex items-center gap-2">
            <Icon name="flag" size={20} className="text-danger-500" filled />
            {t('admin.pending_reports')} ({pendingReports})
          </h3>
          <div className="space-y-2">
            {adminReports.filter(r => r.status === 'pending').slice(0, 3).map((r: AnyItem) => (
              <div key={r.id} className="flex items-center justify-between bg-danger-50 rounded-lg p-3">
                <div>
                  <p className="text-sm text-surface-800">{r.reason.substring(0, 60)}...</p>
                  <p className="text-xs text-surface-400">
                    {r.type === 'post' ? t('admin.report_type_post') : r.type === 'comment' ? t('admin.report_type_comment') : t('admin.report_type_user')} — {new Date(r.createdAt).toLocaleDateString(uiLang === 'it' ? 'it' : uiLang === 'en' ? 'en' : 'ar')}
                  </p>
                </div>
                <Button size="sm" onClick={() => onNavigateTab('reports')}>{t('admin.review')}</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Users + Recent Logs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {adminUsers.length > 0 && (
          <div className="bg-white rounded-xl border border-surface-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-surface-900 flex items-center gap-2">
                <Icon name="group" size={18} className="text-blue-500" filled />
                {t('admin.recent_users')}
              </h3>
              <button className="text-xs text-primary-500 font-medium" onClick={() => onNavigateTab('users')}>{t('admin.view_all')}</button>
            </div>
            <div className="space-y-2">
              {adminUsers.sort((a: AnyItem, b: AnyItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5).map((u: AnyItem) => (
                <div key={u.id} className="flex items-center gap-3 py-1.5">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                    {u.avatar ? <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" /> : <span className="text-xs font-bold text-primary-700">{u.name.charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-surface-800 truncate">{u.name}</p>
                    <p className="text-[10px] text-surface-400">{new Date(u.createdAt).toLocaleDateString(uiLang === 'it' ? 'it' : uiLang === 'en' ? 'en' : 'ar')}</p>
                  </div>
                  <span className={cn('text-[9px] px-1.5 py-0.5 rounded-full font-bold',
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    u.role === 'manager' ? 'bg-amber-100 text-amber-700' :
                    u.isBanned ? 'bg-danger-50 text-danger-600' : 'bg-success-50 text-success-600')}>
                    {u.role === 'admin' ? t('admin.role_admin_badge') : u.role === 'manager' ? t('admin.role_manager_badge') : u.isBanned ? t('admin.role_banned_badge') : t('admin.role_active_badge')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminLogs.length > 0 && (
          <div className="bg-white rounded-xl border border-surface-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-surface-900 flex items-center gap-2">
                <Icon name="history" size={18} className="text-surface-400" />
                {t('admin.recent_actions')}
              </h3>
              <button className="text-xs text-primary-500 font-medium" onClick={() => onNavigateTab('logs')}>{t('admin.view_all')}</button>
            </div>
            <div className="space-y-2">
              {adminLogs.slice(0, 5).map((l: AnyItem) => {
                const isCreate = l.action.includes('إنشاء') || l.action.includes('إضافة') || l.action.includes('create') || l.action.includes('add');
                const isDelete = l.action.includes('حذف') || l.action.includes('delete');
                const isExport = l.action.includes('تصدير') || l.action.includes('استيراد') || l.action.includes('export') || l.action.includes('import');
                return (
                  <div key={l.id} className="flex items-center gap-2 py-1.5">
                    <div className={cn('w-6 h-6 rounded-lg flex items-center justify-center shrink-0',
                      isCreate ? 'bg-success-50' : isDelete ? 'bg-danger-50' : isExport ? 'bg-purple-50' : 'bg-surface-100')}>
                      <Icon name={isCreate ? 'add' : isDelete ? 'delete' : isExport ? 'download' : 'edit'} size={12}
                        className={isCreate ? 'text-success-500' : isDelete ? 'text-danger-500' : isExport ? 'text-purple-500' : 'text-surface-400'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-surface-700 truncate">{l.action}: {l.details}</p>
                      <p className="text-[10px] text-surface-400">{new Date(l.createdAt).toLocaleString(uiLang === 'it' ? 'it' : uiLang === 'en' ? 'en' : 'ar')}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
