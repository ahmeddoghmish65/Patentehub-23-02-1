/**
 * CommunityPage.tsx — Refactored Feature Entry Point
 *
 * Slim orchestrator: initialises stores, wires up hooks, delegates UI to components.
 * All business logic lives in hooks; all rendering lives in components.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useLocaleNavigate } from '@/shared/hooks/useLocaleNavigate';
import { useAuthStore } from '@/store/auth.store';
import { useDataStore } from '@/store';          // backward-compat community notifs
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import { getDB } from '@/infrastructure/database/database';
import type { PostSortMode } from '@/infrastructure/database/api';
import { createNotification } from './services/notificationService';

// Stores
import { usePostStore }        from './store/postStore';
import { useCommentStore }     from './store/commentStore';
import { useCommunityUIStore } from './store/communityUIStore';

// Hooks
import { usePosts }            from './hooks/usePosts';
import { useCreatePost }       from './hooks/useCreatePost';
import { useComments }         from './hooks/useComments';
import { useCreateComment }    from './hooks/useCreateComment';
import { useTrendingHashtags } from './hooks/useTrendingHashtags';
import { useMentionParser }    from './hooks/useMentionParser';

// Components
import { PostComposer }        from './components/PostComposer';
import { PostList }            from './components/PostList';
import { PostCard }            from './components/PostCard';
import { TrendingHashtags }    from './components/TrendingHashtags';

export function CommunityPage() {
  const { navigate }  = useLocaleNavigate();
  const { state }     = useLocation();
  const { postId: postIdParam } = useParams<{ postId: string }>();
  const openPostId    = postIdParam || (state as { openPostId?: string } | null)?.openPostId;
  const { t, uiLang } = useTranslation();
  const { user }      = useAuthStore();

  // ── Stores ─────────────────────────────────────────────────────────────────
  const { checkAllLikes, loadPosts } = usePostStore();
  const { initFromStorage: initCommentStorage } = useCommentStore();
  const ui = useCommunityUIStore();

  // Backward-compat: community notifications still live in data.store
  const {
    communityNotifs, loadCommunityNotifs, markNotifRead, markAllNotifsRead, createReport,
  } = useDataStore();

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { posts, allPosts, likes, postLikers, postSortMode, activeHashtag } = usePosts();
  const { openComments, openPostDetail: _openPostDetail, closeDetail: _closeDetail, detailPostId } = useComments();

  const openPostDetail = useCallback(async (postId: string) => {
    await _openPostDetail(postId);
    navigate(`/community/post/${postId}`);
  }, [_openPostDetail, navigate]);

  const closeDetail = useCallback(() => {
    _closeDetail();
    navigate('/community');
  }, [_closeDetail, navigate]);
  const { mentionSuggestions, hashtagSuggestions, handleTextChange, insertMention, insertHashtag, sendMentionNotifs } = useMentionParser();
  useTrendingHashtags(allPosts.length);

  const { handlePost, posting } = useCreatePost(sendMentionNotifs);
  const {
    handleComment,
    handleDeleteItem,
  } = useCreateComment(sendMentionNotifs, loadCommunityNotifs);

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  // Initial posts load
  useEffect(() => {
    loadPosts(postSortMode, activeHashtag ?? undefined);
  }, [loadPosts, postSortMode, activeHashtag]);

  // Check likes for all loaded posts
  useEffect(() => {
    if (allPosts.length) checkAllLikes(allPosts.map(p => p.id));
  }, [allPosts, checkAllLikes]);

  // Init user-specific localStorage data
  useEffect(() => {
    if (!user) return;
    ui.initFromStorage(user.id);
    initCommentStorage(user.id);
    loadCommunityNotifs();
  }, [user?.id]);

  // Load all users + verified map for mention autocomplete and avatars
  useEffect(() => {
    (async () => {
      const db = await getDB();
      const allDbUsers = await db.getAll('users');
      const vMap: Record<string, boolean> = {};
      for (const u of allDbUsers) { if (u.verified) vMap[u.id] = true; }
      ui.setVerifiedUsers(vMap);
      ui.setAllUsers(allDbUsers.map(u => ({
        id: u.id,
        name: u.name,
        username: u.username || '',
        avatar: u.avatar || '',
      })));
    })();
  }, []);

  // Sync communityAllowImages when admin toggles it in another tab
  useEffect(() => {
    const handler = () => {
      ui.communityAllowImages; // trigger re-read
      useCommunityUIStore.setState({
        communityAllowImages: localStorage.getItem('communityAllowImages') === 'true',
      });
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  // Auto-open a post linked from ProfilePage
  const openedPostIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!openPostId || allPosts.length === 0) return;
    if (openedPostIdRef.current === openPostId) return;
    openedPostIdRef.current = openPostId;
    openPostDetail(openPostId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPostId, allPosts.length]);

  // Close panels on outside click
  const bookmarkRef = useRef<HTMLDivElement>(null);
  const trendingRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bookmarkRef.current && !bookmarkRef.current.contains(e.target as Node)) ui.setShowBookmarks(false);
      if (trendingRef.current && !trendingRef.current.contains(e.target as Node)) ui.setShowTrending(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getUsernameById = useCallback((id: string) => {
    const found = ui.allUsers.find(u => u.id === id);
    return found?.username || id;
  }, [ui.allUsers]);

  const handleMentionClick = useCallback((username: string) => {
    const found = ui.allUsers.find(u =>
      (u.username || '').toLowerCase() === username.toLowerCase() ||
      u.name.toLowerCase() === username.toLowerCase(),
    );
    if (found && found.id !== user?.id) navigate(`/profile/${found.username || found.id}`);
  }, [ui.allUsers, user, navigate]);

  const handleUserClick = useCallback((userId: string) => {
    if (userId !== user?.id) navigate(`/profile/${getUsernameById(userId)}`);
  }, [user, navigate, getUsernameById]);

  const handleHashtagClick = useCallback((tag: string) => {
    ui.setActiveHashtag(tag);
  }, []);

  const handleToggleFollow = useCallback(async (userId: string) => {
    if (!user) return;
    const wasFollowing = ui.following.includes(userId);
    const newF = wasFollowing ? ui.following.filter(id => id !== userId) : [...ui.following, userId];
    ui.setFollowing(newF);
    localStorage.setItem(`following_${user.id}`, JSON.stringify(newF));
    if (!wasFollowing) {
      await createNotification({
        toUserId: userId,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserAvatar: user.avatar || '',
        type: 'follow',
      });
    }
  }, [user, ui]);

  const handleReport = async () => {
    if (!ui.reportModal || !ui.reportReason.trim()) return;
    await createReport(ui.reportModal.type, ui.reportModal.id, ui.reportReason);
    ui.setReportModal(null);
    ui.setReportReason('');
    ui.setReportSuccess(true);
    setTimeout(() => ui.setReportSuccess(false), 3000);
  };

  // Relative time util (used in notifications)
  const relativeTime = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    const isIt = uiLang === 'it';
    if (mins < 1) return isIt ? 'adesso' : 'الآن';
    if (mins < 60) return isIt ? `${mins} min fa` : `منذ ${mins} د`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return isIt ? `${hours} h fa` : `منذ ${hours} س`;
    const days = Math.floor(hours / 24);
    if (days < 7) return isIt ? `${days} giorni fa` : `منذ ${days} يوم`;
    return new Date(iso).toLocaleDateString(isIt ? 'it' : 'ar');
  };

  const unreadNotifs = (communityNotifs as { read?: boolean }[]).filter(n => !n.read).length;

  const notifIcon: Record<string, string> = {
    like: 'favorite', comment: 'chat_bubble', reply: 'reply',
    mention: 'alternate_email', follow: 'person_add',
  };
  const notifColor: Record<string, string> = {
    like: 'text-red-500 bg-red-50', comment: 'text-blue-500 bg-blue-50',
    reply: 'text-green-500 bg-green-50', mention: 'text-purple-500 bg-purple-50',
    follow: 'text-primary-500 bg-primary-50',
  };

  const handleNotifClick = (n: Record<string, unknown>) => {
    markNotifRead(String(n.id));
    ui.setShowNotifs(false);
    if (n.type === 'follow' && n.fromUserId) {
      navigate(`/profile/${getUsernameById(String(n.fromUserId))}`);
      return;
    }
    if (n.postId) {
      openPostDetail(String(n.postId));
      setTimeout(() => {
        const el = document.getElementById(`post-${String(n.postId)}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  // ── Post detail view ──────────────────────────────────────────────────────

  if (detailPostId) {
    const post = allPosts.find(p => p.id === detailPostId);
    if (!post) return null;
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={closeDetail}
          className="flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-4"
        >
          <Icon name="arrow_forward" size={20} className="ltr:rotate-180" />
          <span className="text-sm">{t('community.back')}</span>
        </button>

        <PostCard
          post={post}
          liked={likes[post.id] || false}
          likers={postLikers[post.id] || []}
          showAllComments
          mentionSuggestions={mentionSuggestions}
          onMentionClick={handleMentionClick}
          onHashtagClick={handleHashtagClick}
          onOpenDetail={openPostDetail}
          onOpenComments={openComments}
          onSubmitComment={handleComment}
          onUserClick={handleUserClick}
          onInsertMention={insertMention}
          onTextChange={handleTextChange}
        />

        {/* Likers Modal */}
        {ui.likersModal && (
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => ui.setLikersModal(null)}
          >
            <div className="bg-white rounded-2xl w-full max-w-xs max-h-[60vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                <h3 className="font-bold text-surface-900 flex items-center gap-2">
                  <Icon name="favorite" size={18} className="text-red-500" filled />
                  {ui.likersModal.likers.length} {t('community.likers_title')}
                </h3>
                <button onClick={() => ui.setLikersModal(null)} className="w-8 h-8 rounded-xl hover:bg-surface-100 flex items-center justify-center">
                  <Icon name="close" size={18} className="text-surface-500" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {ui.likersModal.likers.length === 0 && (
                  <p className="text-sm text-surface-400 text-center py-4">{t('community.no_likers')}</p>
                )}
                {ui.likersModal.likers.map(liker => (
                  <div key={liker.userId} className="flex items-center gap-3 hover:bg-surface-50 rounded-xl p-2 transition-colors">
                    <div
                      className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm cursor-pointer"
                      style={{ background: liker.userAvatar ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                      onClick={() => { ui.setLikersModal(null); navigate(`/profile/${getUsernameById(liker.userId)}`); }}
                    >
                      {liker.userAvatar
                        ? <img src={liker.userAvatar} className="w-full h-full object-cover" alt="" />
                        : <div className="w-full h-full flex items-center justify-center"><span className="text-sm font-bold text-white">{liker.userName.charAt(0)}</span></div>}
                    </div>
                    <span
                      className="text-sm font-semibold text-surface-800 flex-1 cursor-pointer"
                      onClick={() => { ui.setLikersModal(null); navigate(`/profile/${getUsernameById(liker.userId)}`); }}
                    >
                      {liker.userName}
                    </span>
                    {liker.userId !== user?.id && (
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleFollow(liker.userId); }}
                        className={cn(
                          'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all',
                          ui.following.includes(liker.userId)
                            ? 'bg-surface-100 text-surface-600 hover:bg-danger-50 hover:text-danger-600 border border-surface-200'
                            : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm',
                        )}
                      >
                        {ui.following.includes(liker.userId) ? t('community.following_btn') : t('community.follow_btn')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Main feed ─────────────────────────────────────────────────────────────

  return (
    <div className="max-w-2xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">{t('community.title')}</h1>
          <p className="text-surface-500 text-sm">{t('community.desc')}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            className={cn('w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-200 transition-colors', ui.showSearch ? 'bg-primary-100' : 'bg-surface-100')}
            onClick={() => { ui.setShowSearch(!ui.showSearch); if (ui.showSearch) ui.setSearchQuery(''); ui.closeAllPanels(); }}
            title={t('community.search_placeholder')}
          >
            <Icon name="search" size={22} className={ui.showSearch ? 'text-primary-600' : 'text-surface-600'} />
          </button>

          {/* Bookmarks */}
          <div className="relative" ref={bookmarkRef}>
            <button
              className={cn('relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-200 transition-colors', ui.showBookmarks ? 'bg-primary-100' : 'bg-surface-100')}
              onClick={() => { ui.setShowBookmarks(!ui.showBookmarks); ui.setShowNotifs(false); }}
              title={t('community.bookmarks_title')}
            >
              <Icon name="bookmark" size={22} className={ui.showBookmarks ? 'text-primary-600' : 'text-surface-600'} filled={ui.showBookmarks} />
              {ui.savedPosts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {ui.savedPosts.length > 9 ? '9+' : ui.savedPosts.length}
                </span>
              )}
            </button>

            {ui.showBookmarks && (
              <div className="absolute end-0 top-12 bg-white rounded-2xl shadow-2xl border border-surface-100 z-50 overflow-hidden" style={{ width: 320 }}>
                <div className="flex items-center justify-between p-4 border-b border-surface-100 bg-surface-50">
                  <div className="flex items-center gap-2">
                    <Icon name="bookmark" size={18} className="text-primary-500" filled />
                    <h3 className="font-bold text-surface-900">{t('community.bookmarks_title')}</h3>
                    <span className="bg-primary-100 text-primary-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{ui.savedPosts.length}</span>
                  </div>
                  {ui.savedPosts.length > 0 && (
                    <button className="text-xs text-danger-500 hover:text-danger-700 font-medium" onClick={() => ui.setConfirmClearBookmarks(true)}>
                      {t('community.clear_all')}
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-surface-50">
                  {ui.savedPosts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Icon name="bookmark_border" size={36} className="text-surface-200 mx-auto mb-2" />
                      <p className="text-sm text-surface-400">{t('community.no_saved')}</p>
                      <p className="text-xs text-surface-300 mt-1">{t('community.press_to_save')}</p>
                    </div>
                  ) : (() => {
                    const savedList = allPosts.filter(p => ui.savedPosts.includes(p.id));
                    if (savedList.length === 0) return (
                      <div className="p-6 text-center text-sm text-surface-400">{t('community.saved_unavailable')}</div>
                    );
                    return savedList.map(p => (
                      <div key={p.id}>
                        {ui.confirmDeleteBookmarkId === p.id ? (
                          <div className="p-3 bg-danger-50 border-b border-danger-100">
                            <p className="text-xs font-semibold text-danger-700 mb-2 text-center">{t('community.confirm_remove_bookmark')}</p>
                            <div className="flex gap-2">
                              <button
                                className="flex-1 py-1.5 rounded-lg bg-danger-500 text-white text-xs font-bold hover:bg-danger-600 transition-colors"
                                onClick={e => { e.stopPropagation(); user && ui.toggleSavePost(p.id, user.id); ui.setConfirmDeleteBookmarkId(null); ui.setBookmarkRemovedToast(true); setTimeout(() => ui.setBookmarkRemovedToast(false), 2500); }}
                              >
                                {t('community.delete_btn')}
                              </button>
                              <button
                                className="flex-1 py-1.5 rounded-lg bg-white border border-surface-200 text-xs font-medium text-surface-600 hover:bg-surface-50 transition-colors"
                                onClick={e => { e.stopPropagation(); ui.setConfirmDeleteBookmarkId(null); }}
                              >
                                {t('common.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 hover:bg-surface-50 cursor-pointer border-b border-surface-50 last:border-0" onClick={() => { openPostDetail(p.id); ui.setShowBookmarks(false); }}>
                            <div className="flex items-start gap-2">
                              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-primary-100 flex items-center justify-center">
                                {p.userAvatar ? <img src={p.userAvatar} className="w-full h-full object-cover" alt="" /> :
                                  <span className="text-[10px] font-bold text-primary-700">{p.userName.charAt(0)}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-surface-800">{p.userName}</p>
                                <p className="text-xs text-surface-500 line-clamp-2 mt-0.5">{p.content}</p>
                              </div>
                              <button className="p-1 rounded-lg hover:bg-danger-50 text-surface-300 hover:text-danger-500 shrink-0"
                                onClick={e => { e.stopPropagation(); ui.setConfirmDeleteBookmarkId(p.id); }}>
                                <Icon name="close" size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Trending */}
          <div className="relative" ref={trendingRef}>
            <button
              className={cn('relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-200 transition-colors', ui.showTrending ? 'bg-primary-100' : 'bg-surface-100')}
              onClick={() => { ui.setShowTrending(!ui.showTrending); ui.setShowBookmarks(false); ui.setShowNotifs(false); }}
              title={t('community.trending_title')}
            >
              <Icon name="trending_up" size={22} className={ui.showTrending ? 'text-primary-600' : 'text-surface-600'} filled={ui.showTrending} />
            </button>
            {ui.showTrending && <TrendingHashtags />}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              className="relative w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors"
              onClick={() => ui.setShowNotifs(!ui.showNotifs)}
            >
              <Icon name="notifications" size={22} className="text-surface-600" />
              {unreadNotifs > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifs > 9 ? '9+' : unreadNotifs}
                </span>
              )}
            </button>
            {ui.showNotifs && (
              <div className="absolute end-0 top-12 bg-white rounded-2xl shadow-2xl border border-surface-100 z-50 overflow-hidden" style={{ width: 320 }}>
                <div className="flex items-center justify-between p-4 border-b border-surface-100 bg-surface-50">
                  <div className="flex items-center gap-2">
                    <Icon name="notifications" size={18} className="text-primary-500" filled />
                    <h3 className="font-bold text-surface-900">{t('community.notifications_title')}</h3>
                    {unreadNotifs > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>
                    )}
                  </div>
                  {unreadNotifs > 0 && (
                    <button className="text-xs text-primary-600 hover:text-primary-700 font-medium" onClick={() => markAllNotifsRead()}>
                      {t('community.mark_read')}
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-surface-50">
                  {(communityNotifs as unknown[]).length === 0 ? (
                    <div className="p-8 text-center">
                      <Icon name="notifications_none" size={36} className="text-surface-200 mx-auto mb-2" />
                      <p className="text-sm text-surface-400">{t('community.no_notifications')}</p>
                    </div>
                  ) : (communityNotifs as Record<string, unknown>[]).map(n => {
                    const type = String(n.type);
                    const colorClass = notifColor[type] || 'text-surface-500 bg-surface-100';
                    return (
                      <div
                        key={String(n.id)}
                        className={cn('p-3 flex items-start gap-3 cursor-pointer transition-colors',
                          !n.read ? 'bg-primary-50/40 hover:bg-primary-50' : 'hover:bg-surface-50')}
                        onClick={() => handleNotifClick(n)}
                      >
                        <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', colorClass.split(' ')[1])}>
                          <Icon name={notifIcon[type] || 'notifications'} size={16} className={colorClass.split(' ')[0]} filled />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {n.fromUserAvatar ? (
                              <img src={String(n.fromUserAvatar)} className="w-5 h-5 rounded-full object-cover shrink-0" alt="" />
                            ) : (
                              <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-[8px] font-bold text-primary-700">{String(n.fromUserName || '?').charAt(0)}</span>
                              </div>
                            )}
                            <p className="text-xs text-surface-800 leading-snug">
                              <span className="font-semibold">{String(n.fromUserName)}</span>
                              {type === 'like'    && ` ${t('community.notif_liked')}`}
                              {type === 'comment' && ` ${t('community.notif_commented')}`}
                              {type === 'reply'   && ` ${t('community.notif_replied')}`}
                              {type === 'mention' && ` ${t('community.notif_mentioned')}`}
                              {type === 'follow'  && ` ${t('community.notif_followed')}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] text-surface-400">{relativeTime(String(n.createdAt))}</p>
                            {type === 'follow' && (
                              <span className="text-[10px] text-primary-500 font-medium flex items-center gap-0.5">
                                <Icon name="person" size={10} /> {t('community.open_profile')}
                              </span>
                            )}
                            {type !== 'follow' && !!n.postId && (
                              <span className="text-[10px] text-primary-500 font-medium flex items-center gap-0.5">
                                <Icon name="open_in_new" size={10} /> {t('community.open_post')}
                              </span>
                            )}
                          </div>
                        </div>
                        {!n.read && <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2 animate-pulse" />}
                      </div>
                    );
                  })}
                </div>
                {(communityNotifs as unknown[]).length > 0 && (
                  <div className="p-2 border-t border-surface-100 bg-surface-50 text-center">
                    <p className="text-[10px] text-surface-400">{t('community.notif_footer')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      {ui.showSearch && (
        <div className="mb-4">
          <div className="relative">
            <Icon name="search" size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-surface-400 pointer-events-none" />
            <input
              type="text"
              value={ui.searchQuery}
              onChange={e => ui.setSearchQuery(e.target.value)}
              placeholder={t('community.search_placeholder')}
              className="w-full bg-white border border-surface-200 rounded-xl pr-10 pl-10 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              dir="auto"
              autoFocus
            />
            {ui.searchQuery && (
              <button className="absolute top-1/2 -translate-y-1/2 left-3 text-surface-400 hover:text-surface-600" onClick={() => ui.setSearchQuery('')}>
                <Icon name="close" size={18} />
              </button>
            )}
          </div>
          {ui.searchQuery && (
            <p className="text-xs text-surface-400 mt-1.5 pr-1">
              {posts.length === 0 ? t('community.no_results') : `${posts.length} ${t('community.results_count')}`}
            </p>
          )}
        </div>
      )}

      {/* ── Toasts ─────────────────────────────────────────────────────────── */}
      {ui.reportSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-success-500 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <Icon name="check_circle" size={20} filled />
          <span className="text-sm font-medium">{t('community.report_success')}</span>
        </div>
      )}
      {ui.bookmarkRemovedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-surface-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <Icon name="bookmark_remove" size={20} filled />
          <span className="text-sm font-medium">{t('community.bookmark_removed')}</span>
        </div>
      )}

      {/* ── Feed sort controls + tab toggle ─────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-0.5 no-scrollbar">
        {([
          { mode: 'hot'   as PostSortMode, icon: 'local_fire_department', label: t('community.sort_hot') },
          { mode: 'new'   as PostSortMode, icon: 'schedule',              label: t('community.sort_new') },
          { mode: 'viral' as PostSortMode, icon: 'trending_up',           label: t('community.sort_viral') },
        ]).map(({ mode, icon, label }) => (
          <button
            key={mode}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border shrink-0',
              postSortMode === mode
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-surface-500 border-surface-200 hover:border-primary-300 hover:text-primary-600',
            )}
            onClick={() => ui.setPostSortMode(mode)}
          >
            <Icon name={icon} size={14} filled={postSortMode === mode} />
            {label}
          </button>
        ))}

        <button
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border shrink-0',
            ui.activeTab === 'following'
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-surface-500 border-surface-200 hover:border-primary-300 hover:text-primary-600',
          )}
          onClick={() => ui.setActiveTab(ui.activeTab === 'following' ? 'discover' : 'following')}
        >
          <Icon name="people" size={14} filled={ui.activeTab === 'following'} />
          {t('community.following_tab')}
          {ui.following.length > 0 && (
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', ui.activeTab === 'following' ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600')}>
              {ui.following.length}
            </span>
          )}
        </button>

        {activeHashtag && (
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200 mr-auto"
            onClick={() => ui.setActiveHashtag(null)}
          >
            #{activeHashtag}
            <Icon name="close" size={12} />
          </button>
        )}
      </div>

      {/* ── Post Composer ───────────────────────────────────────────────────── */}
      <PostComposer
        mentionSuggestions={mentionSuggestions}
        hashtagSuggestions={hashtagSuggestions}
        posting={posting}
        onPost={handlePost}
        onTextChange={handleTextChange}
        onInsertMention={insertMention}
        onInsertHashtag={insertHashtag}
      />

      {/* ── Post List ───────────────────────────────────────────────────────── */}
      <PostList
        posts={posts}
        likes={likes}
        postLikers={postLikers}
        activeTab={ui.activeTab}
        mentionSuggestions={mentionSuggestions}
        onMentionClick={handleMentionClick}
        onHashtagClick={handleHashtagClick}
        onOpenDetail={openPostDetail}
        onOpenComments={openComments}
        onSubmitComment={handleComment}
        onUserClick={handleUserClick}
        onInsertMention={insertMention}
        onTextChange={handleTextChange}
      />

      {/* ── Confirm Delete Modal ─────────────────────────────────────────────── */}
      {ui.confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => ui.setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <Icon name="warning" size={40} className="text-warning-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 text-center mb-2">{t('community.delete_title')}</h3>
            <p className="text-sm text-surface-500 text-center mb-6">
              {ui.confirmDelete.type === 'post'
                ? t('community.delete_post_confirm')
                : ui.confirmDelete.type === 'reply'
                  ? t('community.delete_reply_confirm')
                  : t('community.delete_comment_confirm')}
            </p>
            <div className="flex gap-3">
              <Button fullWidth variant="ghost" onClick={() => ui.setConfirmDelete(null)}>{t('common.cancel')}</Button>
              <Button fullWidth variant="danger" onClick={handleDeleteItem}>{t('community.delete_btn')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Clear Bookmarks Confirm ──────────────────────────────────────────── */}
      {ui.confirmClearBookmarks && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => ui.setConfirmClearBookmarks(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <Icon name="warning" size={40} className="text-warning-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 text-center mb-2">{t('community.clear_bookmarks_title')}</h3>
            <p className="text-sm text-surface-500 text-center mb-6">{t('community.clear_bookmarks_desc')}</p>
            <div className="flex gap-3">
              <Button fullWidth variant="ghost" onClick={() => ui.setConfirmClearBookmarks(false)}>{t('common.cancel')}</Button>
              <Button fullWidth variant="danger" onClick={() => {
                if (user) ui.setSavedPosts([], user.id);
                ui.setConfirmClearBookmarks(false);
                ui.setShowBookmarks(false);
              }}>{t('community.clear_all')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Report Modal ─────────────────────────────────────────────────────── */}
      {ui.reportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => ui.setReportModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="flag" size={22} className="text-warning-500" />
              <h3 className="text-lg font-bold text-surface-900">{t('community.report_title')}</h3>
            </div>
            <textarea
              className="w-full border border-surface-200 rounded-xl p-3 text-sm resize-none mb-4"
              rows={3}
              placeholder={t('community.report_placeholder')}
              value={ui.reportReason}
              onChange={e => ui.setReportReason(e.target.value)}
            />
            <div className="flex gap-3">
              <Button fullWidth variant="ghost" onClick={() => ui.setReportModal(null)}>{t('common.cancel')}</Button>
              <Button fullWidth variant="danger" onClick={handleReport} disabled={!ui.reportReason.trim()}>{t('community.send_report')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Likers Modal (main feed) ─────────────────────────────────────────── */}
      {ui.likersModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => ui.setLikersModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xs max-h-[60vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <h3 className="font-bold text-surface-900 flex items-center gap-2">
                <Icon name="favorite" size={18} className="text-red-500" filled />
                {ui.likersModal.likers.length} {t('community.likers_title')}
              </h3>
              <button onClick={() => ui.setLikersModal(null)} className="w-8 h-8 rounded-xl hover:bg-surface-100 flex items-center justify-center">
                <Icon name="close" size={18} className="text-surface-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {ui.likersModal.likers.length === 0 && (
                <p className="text-sm text-surface-400 text-center py-4">{t('community.no_likers')}</p>
              )}
              {ui.likersModal.likers.map((liker, i) => (
                <div key={i} className="flex items-center gap-3 hover:bg-surface-50 rounded-xl p-2 transition-colors">
                  <div
                    className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm cursor-pointer"
                    style={{ background: liker.userAvatar ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                    onClick={() => { ui.setLikersModal(null); navigate(`/profile/${getUsernameById(liker.userId)}`); }}
                  >
                    {liker.userAvatar
                      ? <img src={liker.userAvatar} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center"><span className="text-sm font-bold text-white">{liker.userName.charAt(0)}</span></div>}
                  </div>
                  <span className="text-sm font-semibold text-surface-800 flex-1 cursor-pointer"
                    onClick={() => { ui.setLikersModal(null); navigate(`/profile/${getUsernameById(liker.userId)}`); }}>
                    {liker.userName}
                  </span>
                  {liker.userId !== user?.id && (
                    <button
                      onClick={e => { e.stopPropagation(); handleToggleFollow(liker.userId); }}
                      className={cn('shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all',
                        ui.following.includes(liker.userId)
                          ? 'bg-surface-100 text-surface-600 hover:bg-danger-50 hover:text-danger-600 border border-surface-200'
                          : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm')}
                    >
                      {ui.following.includes(liker.userId) ? t('community.following_btn') : t('community.follow_btn')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
