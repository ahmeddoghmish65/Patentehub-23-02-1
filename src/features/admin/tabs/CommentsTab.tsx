/**
 * CommentsTab — Community comments management.
 */
import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';
import type { AnyItem, ConfirmDelete } from '../types/admin.types';
import type { Comment } from '@/db/database';

interface CommentsTabProps {
  allComments: (Comment & { postContent?: string })[];
  deletedComments: AnyItem[];
  search: string;
  setSearch: (s: string) => void;
  restoreComment: (id: string) => Promise<boolean>;
  setConfirmDel: (d: ConfirmDelete | null) => void;
}

export const CommentsTab = React.memo(function CommentsTab({
  allComments, deletedComments, search, setSearch, restoreComment, setConfirmDel,
}: CommentsTabProps) {
  const [contentView, setContentView] = useState<'active' | 'deleted'>('active');

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex gap-2">
        {(['active', 'deleted'] as const).map(v => (
          <button key={v} onClick={() => setContentView(v)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border',
              contentView === v ? (v === 'deleted' ? 'bg-danger-500 text-white border-danger-500' : 'bg-primary-500 text-white border-primary-500') : 'bg-white text-surface-600 border-surface-200 hover:border-primary-200')}>
            <Icon name={v === 'deleted' ? 'delete' : 'chat_bubble'} size={14} />
            {v === 'active' ? `نشط (${allComments.length})` : `محذوف (${deletedComments.length})`}
          </button>
        ))}
      </div>

      {/* Deleted comments */}
      {contentView === 'deleted' && (
        <div className="bg-white rounded-xl border border-danger-100 overflow-hidden">
          <div className="p-4 border-b border-danger-100 bg-danger-50 flex items-center gap-2">
            <Icon name="delete" size={18} className="text-danger-500" />
            <h3 className="font-bold text-danger-700">التعليقات المحذوفة ({deletedComments.length})</h3>
            <span className="text-xs text-danger-400 mr-1">يمكن استعادتها أو حذفها نهائياً</span>
          </div>
          {deletedComments.length === 0 ? (
            <div className="p-8 text-center text-surface-400"><Icon name="delete" size={36} className="mx-auto mb-2 opacity-30" /><p>لا توجد تعليقات محذوفة</p></div>
          ) : (
            <div className="divide-y divide-surface-50 max-h-[500px] overflow-y-auto">
              {deletedComments.map((c: AnyItem) => (
                <div key={c.id} className="p-4 flex items-start gap-3 hover:bg-danger-50/50 transition-colors">
                  <div className="w-8 h-8 bg-danger-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-danger-600">{c.userName.charAt(0)}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-surface-700">{c.userName}</span>
                      {c.parentId && <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 rounded-full">رد</span>}
                      <span className="text-[10px] text-danger-400 mr-auto">حُذف: {c.deletedAt ? new Date(c.deletedAt).toLocaleDateString('ar') : '—'}</span>
                    </div>
                    <p className="text-sm text-surface-600">{c.content}</p>
                    {c.postContent && (
                      <p className="text-xs text-surface-400 mt-1 flex items-center gap-1 bg-surface-50 rounded-lg px-2 py-1">
                        <Icon name="reply" size={12} />على: {c.postContent}...
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button title="استعادة" className="p-1.5 rounded-lg bg-success-50 hover:bg-success-100 text-success-600 transition-colors" onClick={() => restoreComment(c.id)}>
                      <Icon name="restore" size={16} />
                    </button>
                    <button title="حذف نهائي" className="p-1.5 rounded-lg bg-danger-50 hover:bg-danger-100 text-danger-600 transition-colors" onClick={() => setConfirmDel({ type: 'comment-permanent', id: c.id })}>
                      <Icon name="delete_forever" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active comments */}
      {contentView === 'active' && (
        <div className="bg-white rounded-xl border border-surface-100 overflow-hidden">
          <div className="p-4 border-b border-surface-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-surface-900 flex items-center gap-2">
                <Icon name="chat_bubble" size={20} className="text-primary-500" />
                التعليقات
                <span className="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">
                  {allComments.filter(c => !search || c.content.includes(search) || c.userName.includes(search)).length}/{allComments.length}
                </span>
              </h2>
            </div>
            <input className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm" placeholder="بحث في التعليقات..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {allComments.length === 0 ? (
            <div className="p-8 text-center text-surface-400">لا توجد تعليقات</div>
          ) : (
            <div className="divide-y divide-surface-50 max-h-[600px] overflow-y-auto">
              {allComments
                .filter(c => !search || c.content.includes(search) || c.userName.includes(search))
                .map(c => (
                  <div key={c.id} className="p-4 hover:bg-surface-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary-700">{c.userName.charAt(0)}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-surface-800">{c.userName}</span>
                            {c.parentId && <span className="text-[10px] bg-blue-50 text-blue-500 px-1.5 rounded-full">رد</span>}
                            <span className="text-[10px] text-surface-400 mr-auto">{new Date(c.createdAt).toLocaleDateString('ar')}</span>
                          </div>
                          <p className="text-sm text-surface-700">{c.content}</p>
                          {c.postContent && (
                            <p className="text-xs text-surface-400 mt-1 flex items-center gap-1 bg-surface-50 rounded-lg px-2 py-1">
                              <Icon name="reply" size={12} />
                              على: {c.postContent}...
                            </p>
                          )}
                        </div>
                      </div>
                      <button className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-400 hover:text-danger-600 shrink-0"
                        onClick={() => setConfirmDel({ type: 'comment', id: c.id })}>
                        <Icon name="delete" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
});
