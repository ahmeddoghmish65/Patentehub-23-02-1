/**
 * AnalyticsTab — Page visit stats and learning analytics.
 */
import React, { useEffect, useState } from 'react';
import { cn } from '@/shared/utils/cn';
import { Icon } from '@/shared/ui/Icon';
import type { AnyItem, VisitStats } from '../types/admin.types';
import { fetchPageVisitStats } from '../services/adminAnalytics.service';

interface AnalyticsTabProps {
  adminUsers: AnyItem[];
  adminStats: { activeToday: number } | null;
  posts: AnyItem[];
}

export const AnalyticsTab = React.memo(function AnalyticsTab({
  adminUsers, adminStats, posts,
}: AnalyticsTabProps) {
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);

  useEffect(() => {
    fetchPageVisitStats().then(setVisitStats);
  }, []);

  const totalUsers = adminUsers.length;
  const activeToday = adminStats?.activeToday || 0;
  const totalPosts = posts.length;
  const totalQuizzes = adminUsers.reduce((sum: number, u: AnyItem) => sum + u.progress.totalQuizzes, 0);
  const avgQuizzes = totalUsers > 0 ? Math.round(totalQuizzes / totalUsers) : 0;

  const now = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayNames = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return { key, day: dayNames[d.getDay()], visits: visitStats?.dailyBreakdown?.[key] || 0 };
  });

  const pageEntries = Object.entries(visitStats?.pageBreakdown || {})
    .sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxPageViews = Math.max(...pageEntries.map(([, v]) => v), 1);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'إجمالي الزيارات', value: visitStats?.totalVisits || 0, icon: 'visibility', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'زيارات آخر 7 أيام', value: visitStats?.last7DaysVisits || 0, icon: 'calendar_today', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
          { label: 'جلسات نشطة (7 أيام)', value: visitStats?.sessions7 || 0, icon: 'devices', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/30' },
          { label: 'مستخدمون نشطون اليوم', value: activeToday, icon: 'group', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-surface-100 rounded-xl p-4 border border-surface-100">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center mb-3', stat.bg)}>
              <Icon name={stat.icon} size={22} className={stat.color} filled />
            </div>
            <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
            <p className="text-xs text-surface-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Chart */}
      <div className="bg-white dark:bg-surface-100 rounded-xl border border-surface-100 p-5">
        <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
          <Icon name="bar_chart" size={20} className="text-primary-500" filled />
          الزيارات خلال آخر 7 أيام (بيانات حقيقية)
        </h3>
        {!visitStats ? (
          <div className="py-10 text-center text-surface-400">جاري التحميل...</div>
        ) : (
          <div className="relative">
            <svg width="100%" height="180" viewBox={`0 0 ${last7.length * 60} 180`} preserveAspectRatio="none">
              {last7.map((d, i) => {
                const maxV = Math.max(...last7.map(w => w.visits), 1);
                const barH = Math.max(4, (d.visits / maxV) * 120);
                const isToday = i === 6;
                const colors = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#22c55e','#06b6d4','#3b82f6'];
                const x = i * 60 + 8;
                const barW = 44;
                const y = 130 - barH;
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={barW} height={barH} rx="6"
                      fill={isToday ? colors[i % colors.length] : colors[i % colors.length] + '60'}
                      stroke={isToday ? colors[i % colors.length] : 'transparent'} strokeWidth="2" />
                    <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize="11" fontWeight="bold"
                      fill={isToday ? colors[i % colors.length] : '#64748b'}>{d.visits}</text>
                    <text x={x + barW / 2} y="150" textAnchor="middle" fontSize="10"
                      fill={isToday ? colors[i % colors.length] : '#94a3b8'}
                      fontWeight={isToday ? 'bold' : 'normal'}>
                      {d.day.substring(0, 3)}
                    </text>
                    {isToday && <rect x={x} y="155" width={barW} height="3" rx="1.5" fill={colors[i % colors.length]} />}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Page Breakdown + Learning Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-surface-100 rounded-xl border border-surface-100 p-5">
          <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Icon name="web" size={18} className="text-primary-500" />
            أكثر الصفحات زيارة (حقيقي)
          </h3>
          {pageEntries.length === 0 ? (
            <p className="text-sm text-surface-400 text-center py-6">لا توجد بيانات بعد — ابدأ التصفح لتتراكم البيانات</p>
          ) : (
            <div className="space-y-3">
              {pageEntries.map(([page, views]) => (
                <div key={page} className="flex items-center gap-3">
                  <span className="text-xs text-surface-600 w-28 truncate">{page}</span>
                  <div className="flex-1 bg-surface-100 rounded-full h-2">
                    <div className="bg-primary-500 rounded-full h-2" style={{ width: `${Math.round((views / maxPageViews) * 100)}%` }} />
                  </div>
                  <span className="text-xs font-semibold text-surface-700 w-10 text-left">{views}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-surface-100 rounded-xl border border-surface-100 p-5">
          <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
            <Icon name="school" size={18} className="text-primary-500" />
            إحصائيات التعلم التفصيلية
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-surface-600 mb-2">مستوى المستخدمين</p>
              <div className="flex gap-2">
                {[
                  { label: 'مبتدئ (1-3)', count: adminUsers.filter((u: AnyItem) => u.progress.level <= 3).length, icon: 'star_border' },
                  { label: 'متوسط (4-7)', count: adminUsers.filter((u: AnyItem) => u.progress.level >= 4 && u.progress.level <= 7).length, icon: 'star_half' },
                  { label: 'متقدم (8+)', count: adminUsers.filter((u: AnyItem) => u.progress.level >= 8).length, icon: 'star' },
                ].map(d => (
                  <div key={d.label} className="flex-1 bg-surface-50 rounded-lg p-2 text-center">
                    <Icon name={d.icon} size={18} className="text-surface-400 mx-auto mb-1" />
                    <p className="text-sm font-bold text-surface-900">{d.count}</p>
                    <p className="text-[10px] text-surface-400">{d.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-surface-600 mb-2">جاهزية الامتحان</p>
              <div className="space-y-1.5">
                {[
                  { name: 'جاهز (70%+)', count: adminUsers.filter((u: AnyItem) => u.progress.examReadiness >= 70).length, color: 'bg-success-500' },
                  { name: 'متقدم (40-69%)', count: adminUsers.filter((u: AnyItem) => u.progress.examReadiness >= 40 && u.progress.examReadiness < 70).length, color: 'bg-warning-500' },
                  { name: 'مبتدئ (0-39%)', count: adminUsers.filter((u: AnyItem) => u.progress.examReadiness < 40).length, color: 'bg-danger-500' },
                ].map(b => {
                  const pct = totalUsers > 0 ? Math.round((b.count / totalUsers) * 100) : 0;
                  return (
                    <div key={b.name} className="flex items-center gap-2">
                      <span className="text-xs text-surface-600 w-28">{b.name}</span>
                      <div className="flex-1 bg-surface-100 rounded-full h-1.5">
                        <div className={cn('rounded-full h-1.5', b.color)} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-surface-500 w-12 text-left">{b.count} ({pct}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Activity Summary */}
      <div className="bg-white dark:bg-surface-100 rounded-xl border border-surface-100 p-5">
        <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
          <Icon name="insights" size={18} className="text-primary-500" filled />
          ملخص نشاط المستخدمين
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalQuizzes}</p>
            <p className="text-[10px] text-blue-500 dark:text-blue-400">اختبار أُجري</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{adminUsers.reduce((s: number, u: AnyItem) => s + u.progress.completedLessons.length, 0)}</p>
            <p className="text-[10px] text-green-500 dark:text-green-400">درس مكتمل</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{totalPosts}</p>
            <p className="text-[10px] text-purple-500 dark:text-purple-400">منشور</p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-3 text-center">
            <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round(adminUsers.reduce((s: number, u: AnyItem) => s + (u.progress.examReadiness || 0), 0) / Math.max(1, totalUsers))}%
            </p>
            <p className="text-[10px] text-orange-500 dark:text-orange-400">متوسط الجاهزية</p>
          </div>
        </div>
      </div>

      {/* Suppress unused warning */}
      {avgQuizzes === 0 && null}
    </div>
  );
});
