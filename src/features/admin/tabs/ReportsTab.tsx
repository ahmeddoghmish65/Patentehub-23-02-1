/**
 * ReportsTab — Report management with detail modal.
 */
import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import type { AnyItem } from '../types/admin.types';
import type { Report, Comment } from '@/db/database';

interface ReportsTabProps {
  adminReports: Report[];
  adminUsers: AnyItem[];
  posts: AnyItem[];
  allComments: (Comment & { postContent?: string })[];
  search: string;
  setSearch: (s: string) => void;
  updateReport: (id: string, status: 'reviewed' | 'dismissed') => Promise<boolean>;
}

export const ReportsTab = React.memo(function ReportsTab({
  adminReports, adminUsers, posts, allComments, search, setSearch, updateReport,
}: ReportsTabProps) {
  const [viewedReport, setViewedReport] = useState<Report | null>(null);

  const filtered = adminReports.filter(r => !search || r.status === search);

  return (
    <>
      {/* Report detail modal */}
      {viewedReport && (() => {
        const r = viewedReport;
        const reporter = adminUsers.find((u: AnyItem) => u.id === r.userId);
        const reportedPost = r.type === 'post' ? posts.find(p => p.id === r.targetId) : null;
        const reportedComment = r.type === 'comment' ? allComments.find(c => c.id === r.targetId) : null;
        const reportedUser = r.type === 'user' ? adminUsers.find((u: AnyItem) => u.id === r.targetId) : null;
        return (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setViewedReport(null)}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-5 border-b border-surface-100">
                <div className="flex items-center gap-2">
                  <Icon name="flag" size={20} className="text-warning-500" />
                  <h3 className="font-bold text-surface-900">تفاصيل البلاغ</h3>
                </div>
                <button className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400" onClick={() => setViewedReport(null)}>
                  <Icon name="close" size={18} />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold',
                    r.status === 'pending' ? 'bg-warning-50 text-warning-700 border border-warning-200' :
                    r.status === 'reviewed' ? 'bg-success-50 text-success-700 border border-success-200' :
                    'bg-surface-100 text-surface-600 border border-surface-200')}>
                    {r.status === 'pending' ? '⏳ قيد المراجعة' : r.status === 'reviewed' ? '✓ تمت المراجعة' : '✗ مرفوض'}
                  </span>
                  <span className={cn('text-xs px-2.5 py-1 rounded-full font-semibold',
                    r.type === 'post' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    r.type === 'comment' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                    'bg-orange-50 text-orange-700 border border-orange-200')}>
                    {r.type === 'post' ? '📝 منشور' : r.type === 'comment' ? '💬 تعليق' : '👤 مستخدم'}
                  </span>
                  <span className="text-xs text-surface-400 mr-auto">{new Date(r.createdAt).toLocaleDateString('ar')}</span>
                </div>
                <div className="bg-warning-50 rounded-xl p-3 border border-warning-100">
                  <p className="text-[10px] text-warning-600 font-semibold mb-1">سبب البلاغ</p>
                  <p className="text-sm text-surface-800">"{r.reason}"</p>
                </div>
                {reportedPost && (
                  <div>
                    <p className="text-[10px] font-semibold text-surface-500 mb-2">المنشور المُبلَّغ عنه</p>
                    <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 space-y-2">
                      <div className="flex items-center gap-2">
                        {reportedPost.userAvatar ? <img src={reportedPost.userAvatar} className="w-7 h-7 rounded-full object-cover" alt="" /> :
                          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-primary-700">{reportedPost.userName.charAt(0)}</span></div>}
                        <span className="text-sm font-semibold text-surface-800">{reportedPost.userName}</span>
                      </div>
                      <p className="text-sm text-surface-700 leading-relaxed">{reportedPost.content || reportedPost.quizQuestion}</p>
                    </div>
                  </div>
                )}
                {reportedComment && (
                  <div>
                    <p className="text-[10px] font-semibold text-surface-500 mb-2">التعليق المُبلَّغ عنه</p>
                    <div className="bg-surface-50 rounded-xl p-3 border border-surface-200">
                      <span className="text-sm font-semibold text-surface-800">{reportedComment.userName}</span>
                      <p className="text-sm text-surface-700 mt-1">{reportedComment.content}</p>
                    </div>
                  </div>
                )}
                {reportedUser && (
                  <div>
                    <p className="text-[10px] font-semibold text-surface-500 mb-2">المستخدم المُبلَّغ عنه</p>
                    <div className="bg-surface-50 rounded-xl p-3 border border-surface-200 flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center"><span className="text-sm font-bold text-orange-700">{reportedUser.name.charAt(0)}</span></div>
                      <div>
                        <p className="font-semibold text-surface-800">{reportedUser.name}</p>
                        <p className="text-xs text-surface-500">{reportedUser.email}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-surface-500 bg-surface-50 rounded-lg p-2.5">
                  <Icon name="person" size={14} className="text-surface-400" />
                  <span>البلاغ من:</span>
                  <span className="font-semibold text-surface-700">{reporter?.name || 'مجهول'}</span>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 pt-1">
                    <Button fullWidth size="sm" onClick={() => { updateReport(r.id, 'reviewed'); setViewedReport(null); }}>
                      <Icon name="check" size={15} /> قبول البلاغ
                    </Button>
                    <Button fullWidth size="sm" variant="ghost" onClick={() => { updateReport(r.id, 'dismissed'); setViewedReport(null); }}>
                      رفض البلاغ
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="bg-white rounded-xl border border-surface-100 overflow-hidden">
        <div className="p-4 border-b border-surface-100">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-bold text-surface-900 flex items-center gap-2">
              <Icon name="flag" size={20} className="text-warning-500" />
              البلاغات
              <span className="text-xs bg-warning-50 text-warning-600 px-2 py-0.5 rounded-full font-medium">
                {adminReports.filter(r => r.status === 'pending').length} قيد المراجعة
              </span>
            </h2>
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'pending', 'reviewed', 'dismissed'] as const).map(s => (
                <button key={s} onClick={() => setSearch(s === 'all' ? '' : s)}
                  className={cn('text-[11px] px-2.5 py-1 rounded-lg border font-medium',
                    (s === 'all' && !search) || search === s
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-surface-500 border-surface-200 hover:border-primary-300')}>
                  {s === 'all' ? 'الكل' : s === 'pending' ? 'قيد المراجعة' : s === 'reviewed' ? 'مراجعة' : 'مرفوض'}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="divide-y divide-surface-50 max-h-[600px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-surface-400">لا توجد بلاغات</div>
          ) : filtered.map(r => {
            const reporter = adminUsers.find((u: AnyItem) => u.id === r.userId);
            const reportedPost = r.type === 'post' ? posts.find(p => p.id === r.targetId) : null;
            const reportedComment = r.type === 'comment' ? allComments.find(c => c.id === r.targetId) : null;
            const reportedUser = r.type === 'user' ? adminUsers.find((u: AnyItem) => u.id === r.targetId) : null;
            const contentPreview = reportedPost
              ? (reportedPost.content || reportedPost.quizQuestion || '').substring(0, 100)
              : reportedComment ? reportedComment.content.substring(0, 100) : reportedUser ? reportedUser.name : null;
            return (
              <div key={r.id} className="p-4 hover:bg-surface-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    r.type === 'post' ? 'bg-blue-50' : r.type === 'comment' ? 'bg-purple-50' : 'bg-orange-50')}>
                    <Icon name={r.type === 'post' ? 'article' : r.type === 'comment' ? 'chat_bubble' : 'person'}
                      size={18} className={r.type === 'post' ? 'text-blue-500' : r.type === 'comment' ? 'text-purple-500' : 'text-orange-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-semibold',
                        r.status === 'pending' ? 'bg-warning-50 text-warning-700' : r.status === 'reviewed' ? 'bg-success-50 text-success-700' : 'bg-surface-100 text-surface-500')}>
                        {r.status === 'pending' ? '⏳ قيد المراجعة' : r.status === 'reviewed' ? '✓ مراجعة' : '✗ مرفوض'}
                      </span>
                      <span className="text-[10px] text-surface-400 mr-auto">{new Date(r.createdAt).toLocaleDateString('ar')}</span>
                    </div>
                    <p className="text-sm font-semibold text-surface-800 mb-1.5">"{r.reason}"</p>
                    {contentPreview && (
                      <div className="bg-surface-50 rounded-lg px-3 py-2 text-xs text-surface-600 border border-surface-100 line-clamp-2 mb-2">
                        {contentPreview}{contentPreview.length >= 100 ? '...' : ''}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-surface-400">
                      <Icon name="person" size={12} />
                      <span>البلاغ من: <span className="font-medium text-surface-600">{reporter?.name || 'مجهول'}</span></span>
                      {reportedPost && <span className="text-surface-300">|</span>}
                      {reportedPost && <span>بواسطة: <span className="font-medium text-surface-600">{reportedPost.userName}</span></span>}
                    </div>
                  </div>
                  <button
                    className="p-2 rounded-xl hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-colors shrink-0 border border-surface-200 hover:border-primary-200"
                    onClick={() => setViewedReport(r)}>
                    <Icon name="open_in_new" size={15} />
                  </button>
                </div>
                {r.status === 'pending' && (
                  <div className="flex gap-2 mt-3 mr-12">
                    <Button size="sm" onClick={() => updateReport(r.id, 'reviewed')}>
                      <Icon name="check" size={14} /> قبول
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateReport(r.id, 'dismissed')}>رفض</Button>
                    <button className="flex items-center gap-1 text-[11px] text-primary-600 hover:text-primary-700 font-medium mr-auto"
                      onClick={() => setViewedReport(r)}>
                      <Icon name="visibility" size={13} /> عرض المحتوى
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
});
