/**
 * PostsTab — Community posts management: active posts list + deleted posts.
 */
import React, { useState } from 'react';
import { cn } from '@/utils/cn';
import { Icon } from '@/components/ui/Icon';
import type { AnyItem, ConfirmDelete } from '../types/admin.types';

interface PostsTabProps {
  posts: AnyItem[];
  deletedPosts: AnyItem[];
  search: string;
  setSearch: (s: string) => void;
  adminDeletePost: (id: string) => Promise<boolean>;
  restorePost: (id: string) => Promise<boolean>;
  setConfirmDel: (d: ConfirmDelete | null) => void;
}

export const PostsTab = React.memo(function PostsTab({
  posts, deletedPosts, search, setSearch,
  adminDeletePost, restorePost, setConfirmDel,
}: PostsTabProps) {
  const [contentView, setContentView] = useState<'active' | 'deleted'>('active');
  const [postSelectedIds, setPostSelectedIds] = useState<Set<string>>(new Set());
  const [communityAllowImages, setCommunityAllowImages] = useState(
    () => localStorage.getItem('communityAllowImages') === 'true'
  );

  const filtered = posts.filter(p => !search || p.content.includes(search) || p.userName.includes(search));

  const toggleCommunityImages = () => {
    const next = !communityAllowImages;
    setCommunityAllowImages(next);
    localStorage.setItem('communityAllowImages', String(next));
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-4">
      {/* View toggle */}
      <div className="flex gap-2">
        {(['active', 'deleted'] as const).map(v => (
          <button key={v} onClick={() => setContentView(v)}
            className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border',
              contentView === v ? (v === 'deleted' ? 'bg-danger-500 text-white border-danger-500' : 'bg-primary-500 text-white border-primary-500') : 'bg-white text-surface-600 border-surface-200 hover:border-primary-200')}>
            <Icon name={v === 'deleted' ? 'delete' : 'forum'} size={14} />
            {v === 'active' ? `نشط (${posts.length})` : `محذوف (${deletedPosts.length})`}
          </button>
        ))}
      </div>

      {/* Deleted posts */}
      {contentView === 'deleted' && (
        <div className="bg-white rounded-xl border border-danger-100 overflow-hidden">
          <div className="p-4 border-b border-danger-100 bg-danger-50 flex items-center gap-2">
            <Icon name="delete" size={18} className="text-danger-500" />
            <h3 className="font-bold text-danger-700">المنشورات المحذوفة ({deletedPosts.length})</h3>
            <span className="text-xs text-danger-400 mr-1">يمكن استعادتها أو حذفها نهائياً</span>
          </div>
          {deletedPosts.length === 0 ? (
            <div className="p-8 text-center text-surface-400"><Icon name="delete" size={36} className="mx-auto mb-2 opacity-30" /><p>لا توجد منشورات محذوفة</p></div>
          ) : (
            <div className="divide-y divide-surface-50 max-h-[500px] overflow-y-auto">
              {deletedPosts.map((p: AnyItem) => (
                <div key={p.id} className="p-4 flex items-start gap-3 hover:bg-danger-50/50 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {p.userAvatar ? <img src={p.userAvatar} className="w-6 h-6 rounded-full object-cover" alt="" /> :
                        <div className="w-6 h-6 bg-danger-100 rounded-full flex items-center justify-center shrink-0"><span className="text-[10px] font-bold text-danger-600">{p.userName.charAt(0)}</span></div>}
                      <span className="text-sm font-semibold text-surface-700">{p.userName}</span>
                      <span className="text-[10px] text-danger-400 mr-auto">حُذف: {p.deletedAt ? new Date(p.deletedAt).toLocaleDateString('ar') : '—'}</span>
                    </div>
                    <p className="text-sm text-surface-500 line-clamp-2">{p.content}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button title="استعادة" className="p-1.5 rounded-lg bg-success-50 hover:bg-success-100 text-success-600 transition-colors" onClick={() => restorePost(p.id)}>
                      <Icon name="restore" size={16} />
                    </button>
                    <button title="حذف نهائي" className="p-1.5 rounded-lg bg-danger-50 hover:bg-danger-100 text-danger-600 transition-colors" onClick={() => setConfirmDel({ type: 'post-permanent', id: p.id })}>
                      <Icon name="delete_forever" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Active posts */}
      {contentView === 'active' && (
        <>
          {/* Community settings */}
          <div className="bg-white rounded-xl border border-surface-100 p-4">
            <h3 className="text-sm font-bold text-surface-800 flex items-center gap-2 mb-3">
              <Icon name="settings" size={16} className="text-primary-500" />
              إعدادات المجتمع
            </h3>
            <div className="flex items-center justify-between p-3 bg-surface-50 rounded-xl border border-surface-200">
              <div className="flex items-center gap-3">
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', communityAllowImages ? 'bg-primary-100' : 'bg-surface-200')}>
                  <Icon name="image" size={18} className={communityAllowImages ? 'text-primary-600' : 'text-surface-400'} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-800">رفع الصور في المنشورات</p>
                  <p className="text-xs text-surface-500">السماح للمستخدمين برفع صور عند إنشاء منشور</p>
                </div>
              </div>
              <button
                className={cn('relative w-12 h-6 rounded-full transition-colors shrink-0', communityAllowImages ? 'bg-primary-500' : 'bg-surface-300')}
                onClick={toggleCommunityImages}>
                <span className={cn('absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform', communityAllowImages ? 'translate-x-6 left-0.5' : 'translate-x-0 left-0.5')} />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-surface-100 overflow-hidden">
            <div className="p-4 border-b border-surface-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-surface-900 flex items-center gap-2">
                  <Icon name="forum" size={20} className="text-primary-500" />
                  المنشورات
                  <span className="text-xs bg-surface-100 text-surface-500 px-2 py-0.5 rounded-full">{filtered.length}/{posts.length}</span>
                </h2>
                {postSelectedIds.size > 0 && (
                  <button onClick={async () => {
                    if (confirm(`حذف ${postSelectedIds.size} منشور؟`)) {
                      for (const id of postSelectedIds) await adminDeletePost(id);
                      setPostSelectedIds(new Set());
                    }
                  }} className="flex items-center gap-1.5 text-xs text-danger-600 bg-danger-50 hover:bg-danger-100 px-3 py-1.5 rounded-lg font-medium">
                    <Icon name="delete" size={14} /> حذف المحدد ({postSelectedIds.size})
                  </button>
                )}
              </div>
              <input className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm" placeholder="بحث في المنشورات..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-surface-400">لا توجد منشورات</div>
            ) : (
              <div className="divide-y divide-surface-50 max-h-[600px] overflow-y-auto">
                {filtered.map((p: AnyItem) => (
                  <div key={p.id} className={cn('p-4 flex items-start gap-3 hover:bg-surface-50 transition-colors', postSelectedIds.has(p.id) && 'bg-primary-50')}>
                    <input type="checkbox" className="mt-1 rounded" checked={postSelectedIds.has(p.id)}
                      onChange={e => { const s = new Set(postSelectedIds); e.target.checked ? s.add(p.id) : s.delete(p.id); setPostSelectedIds(s); }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {p.userAvatar ? <img src={p.userAvatar} className="w-7 h-7 rounded-full object-cover" alt="" /> :
                          <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center shrink-0"><span className="text-xs font-bold text-primary-700">{p.userName.charAt(0)}</span></div>}
                        <span className="text-sm font-semibold text-surface-800">{p.userName}</span>
                        {p.pinned && <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 rounded-full">مثبت</span>}
                        {p.type === 'quiz' && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 rounded-full">سؤال</span>}
                        <span className="text-[10px] text-surface-400 mr-auto">{new Date(p.createdAt).toLocaleDateString('ar')}</span>
                      </div>
                      <p className="text-sm text-surface-600 line-clamp-2">{p.content}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Icon name="favorite" size={11} /> {p.likesCount}</span>
                        <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Icon name="chat_bubble" size={11} /> {p.commentsCount}</span>
                      </div>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-danger-50 text-danger-400 hover:text-danger-600 shrink-0"
                      onClick={() => setConfirmDel({ type: 'post', id: p.id })}>
                      <Icon name="delete" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
});
