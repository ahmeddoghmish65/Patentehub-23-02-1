/**
 * PostCard.tsx
 * Renders a single post card with quiz support, inline editing, and comment section.
 */
import { memo, useCallback } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import { useAuthStore } from '@/store/auth.store';
import { VerifiedBadge } from '@/shared/ui/VerifiedBadge';
import { getDB } from '@/infrastructure/database/database';
import { MentionText } from './MentionText';
import { PostActions } from './PostActions';
import { CommentList } from './CommentList';
import { getTextDir, relativeTime } from '../utils/textUtils';
import { usePostStore } from '../store/postStore';
import { useCommunityUIStore } from '../store/communityUIStore';
import { useCommentStore } from '../store/commentStore';
import type { Post, PostLiker, CommunityUser } from '../types';

interface PostCardProps {
  post: Post;
  liked: boolean;
  likers: PostLiker[];
  showAllComments?: boolean;
  onMentionClick: (username: string) => void;
  onHashtagClick: (tag: string) => void;
  onOpenDetail: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onSubmitComment: (postId: string) => void;
  onUserClick: (userId: string) => void;
  mentionSuggestions: CommunityUser[];
  onInsertMention: (username: string, text: string, setter: (t: string) => void) => void;
  onTextChange: (text: string, setter: (t: string) => void) => void;
}

export const PostCard = memo(function PostCard({
  post,
  liked,
  likers,
  showAllComments = false,
  onMentionClick,
  onHashtagClick,
  onOpenDetail,
  onOpenComments,
  onSubmitComment,
  onUserClick,
  mentionSuggestions,
  onInsertMention,
  onTextChange,
}: PostCardProps) {
  const { t, uiLang } = useTranslation();
  const { user } = useAuthStore();
  const { toggleLike, pinPost, featurePost, lockPost, loadPosts } = usePostStore();
  const {
    showComments, editingPost, editContent, expandedTexts,
    activeHashtag, savedPosts, postSortMode, allUsers, verifiedUsers,
    quizVoted, quizSelected,
    setEditingPost, setEditContent, setConfirmDelete, setReportModal, setLikersModal,
    toggleSavePost, toggleExpandText, recordQuizVote,
    setActiveHashtag,
  } = useCommunityUIStore();
  const { comments, detailComments } = useCommentStore();

  const isAdminUser = user?.role === 'admin' || user?.role === 'manager';
  const isQuiz = post.type === 'quiz';
  const isPostLocked = post.locked || false;

  const stats = post.quizStats || { trueCount: 0, falseCount: 0 };
  const totalAns = stats.trueCount + stats.falseCount;
  const truePct  = totalAns > 0 ? Math.round((stats.trueCount / totalAns) * 100) : 50;
  const falsePct = totalAns > 0 ? Math.round((stats.falseCount / totalAns) * 100) : 50;
  const hasVoted = quizVoted[post.id] || false;

  const isExpanded = expandedTexts[post.id];
  const isSaved = savedPosts.includes(post.id);

  const currentComments = showAllComments ? detailComments : comments;

  // ── User display helpers ──────────────────────────────────────────────────

  const getLiveAvatar = (userId: string, fallback: string) =>
    allUsers.find(u => u.id === userId)?.avatar || fallback || '';

  const getUsername = (userId: string) =>
    allUsers.find(u => u.id === userId)?.username || '';

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLike = useCallback(async () => {
    const result = await toggleLike(post.id);
    if (result?.liked && user) {
      const { createNotification } = await import('../services/notificationService');
      if (post.userId !== user.id) {
        createNotification({
          toUserId: post.userId,
          fromUserId: user.id,
          fromUserName: user.name,
          fromUserAvatar: user.avatar || '',
          type: 'like',
          postId: post.id,
        }).catch(() => {});
      }
    }
  }, [toggleLike, post, user]);

  const handleQuizAnswer = useCallback(async (answer: boolean) => {
    if (!user || quizVoted[post.id]) return;
    recordQuizVote(post.id, answer, user.id);
    const db = await getDB();
    const p = await db.get('posts', post.id);
    if (p) {
      const s = p.quizStats || { trueCount: 0, falseCount: 0 };
      if (answer) s.trueCount++; else s.falseCount++;
      p.quizStats = s;
      await db.put('posts', p);
      await loadPosts(postSortMode, activeHashtag ?? undefined);
    }
  }, [user, quizVoted, post.id, recordQuizVote, loadPosts, postSortMode, activeHashtag]);

  const handleAdminPin = useCallback(async () => {
    await pinPost(post.id, !post.pinned);
    await loadPosts(postSortMode, activeHashtag ?? undefined);
  }, [pinPost, post, loadPosts, postSortMode, activeHashtag]);

  const handleAdminFeature = useCallback(async () => {
    await featurePost(post.id, !post.featured);
    await loadPosts(postSortMode, activeHashtag ?? undefined);
  }, [featurePost, post, loadPosts, postSortMode, activeHashtag]);

  const handleAdminLock = useCallback(async () => {
    await lockPost(post.id, !post.locked);
    await loadPosts(postSortMode, activeHashtag ?? undefined);
  }, [lockPost, post, loadPosts, postSortMode, activeHashtag]);

  const handleEdit = useCallback(async () => {
    const { updatePost } = usePostStore.getState();
    await updatePost(post.id, editContent);
    setEditingPost(null);
  }, [post.id, editContent, setEditingPost]);

  // ── Post text rendering ───────────────────────────────────────────────────

  const renderPostText = () => {
    const text = post.content;
    if (!text) return null;
    const isLong = text.length > 180 || text.split('\n').length > 3;

    const textElement = (content: string) => (
      <p dir={getTextDir(text)} className="text-surface-700 text-sm leading-relaxed whitespace-pre-wrap mb-3">
        <MentionText text={content} onMentionClick={onMentionClick} onHashtagClick={onHashtagClick} />
      </p>
    );

    if (!isLong) return textElement(text);

    if (isExpanded) {
      return (
        <div className="mb-3">
          <p dir={getTextDir(text)} className="text-surface-700 text-sm leading-relaxed whitespace-pre-wrap">
            <MentionText text={text} onMentionClick={onMentionClick} onHashtagClick={onHashtagClick} />
          </p>
          <button className="text-primary-500 text-xs font-medium mt-1 hover:text-primary-700" onClick={() => toggleExpandText(post.id)}>
            {t('community.show_less')}
          </button>
        </div>
      );
    }

    const truncated = text.length > 180
      ? text.slice(0, 180) + '...'
      : text.split('\n').slice(0, 3).join('\n') + '...';

    return (
      <div className="mb-3">
        <p dir={getTextDir(text)} className="text-surface-700 text-sm leading-relaxed whitespace-pre-wrap">
          <MentionText text={truncated} onMentionClick={onMentionClick} onHashtagClick={onHashtagClick} />
        </p>
        <button className="text-primary-500 text-xs font-medium mt-1 hover:text-primary-700" onClick={() => toggleExpandText(post.id)}>
          {t('community.show_more')}
        </button>
      </div>
    );
  };

  // ── Hashtag pills ─────────────────────────────────────────────────────────

  const renderHashtagPills = () => {
    if (!post.hashtags || post.hashtags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {post.hashtags.map(tag => (
          <button
            key={tag}
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors',
              activeHashtag === tag
                ? 'bg-primary-500 text-white'
                : 'bg-primary-50 text-primary-600 hover:bg-primary-100',
            )}
            onClick={() => setActiveHashtag(activeHashtag === tag ? null : tag)}
          >
            #{tag}
          </button>
        ))}
      </div>
    );
  };

  const postLikerAvatar = getLiveAvatar(post.userId, post.userAvatar);

  return (
    <div
      id={!showAllComments ? `post-${post.id}` : undefined}
      className={cn(
        'bg-white dark:bg-surface-100 rounded-2xl border overflow-hidden',
        post.pinned  ? 'border-amber-200 ring-1 ring-amber-100'  :
        post.featured ? 'border-blue-200 ring-1 ring-blue-100'  :
        'border-surface-100',
      )}
    >
      {/* Status banners */}
      {post.pinned && (
        <div className="bg-amber-50 px-4 py-1.5 flex items-center gap-1.5 border-b border-amber-100">
          <Icon name="push_pin" size={14} className="text-amber-500" filled />
          <span className="text-xs font-semibold text-amber-600">{t('community.pinned')}</span>
        </div>
      )}
      {post.featured && !post.pinned && (
        <div className="bg-blue-50 px-4 py-1.5 flex items-center gap-1.5 border-b border-blue-100">
          <Icon name="star" size={14} className="text-blue-500" filled />
          <span className="text-xs font-semibold text-blue-600">{t('community.featured')}</span>
        </div>
      )}
      {post.locked && (
        <div className="bg-surface-50 px-4 py-1 flex items-center gap-1.5 border-b border-surface-100">
          <Icon name="lock" size={12} className="text-surface-400" />
          <span className="text-[11px] text-surface-400">{t('community.comments_locked_label')}</span>
        </div>
      )}

      <div className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
              style={{ background: postLikerAvatar ? undefined : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
              onClick={() => onUserClick(post.userId)}
            >
              {postLikerAvatar
                ? <img src={postLikerAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
                : <span className="text-sm font-bold text-white">{post.userName.charAt(0)}</span>}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="inline-flex items-center gap-1">
                  <button className="font-semibold text-sm text-surface-900 hover:text-primary-600" onClick={() => onUserClick(post.userId)}>{post.userName}</button>
                  {verifiedUsers[post.userId] && <VerifiedBadge size="xs" tooltip />}
                </span>
                {isQuiz && (
                  <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">
                    {t('community.quiz_badge')}
                  </span>
                )}
              </div>
              {getUsername(post.userId) && (
                <p className="text-[11px] text-surface-400">@{getUsername(post.userId)}</p>
              )}
              <p className="text-xs text-surface-400">{relativeTime(post.createdAt, uiLang)}</p>
            </div>
          </div>

          {/* Admin + owner actions */}
          <div className="flex items-center gap-1">
            {isAdminUser && (
              <>
                <button
                  className={cn('p-1.5 rounded-lg hover:bg-surface-100', post.pinned ? 'text-amber-500' : 'text-surface-400')}
                  onClick={handleAdminPin}
                  title={post.pinned ? 'Rimuovi pin' : 'Fissa'}
                >
                  <Icon name="push_pin" size={18} filled={post.pinned} />
                </button>
                <button
                  className={cn('p-1.5 rounded-lg hover:bg-surface-100', post.featured ? 'text-blue-500' : 'text-surface-400')}
                  onClick={handleAdminFeature}
                  title={post.featured ? 'Togli evidenza' : 'Evidenzia'}
                >
                  <Icon name="star" size={18} filled={post.featured} />
                </button>
                <button
                  className={cn('p-1.5 rounded-lg hover:bg-surface-100', post.locked ? 'text-surface-600' : 'text-surface-400')}
                  onClick={handleAdminLock}
                  title={post.locked ? 'Sblocca commenti' : 'Blocca commenti'}
                >
                  <Icon name={post.locked ? 'lock' : 'lock_open'} size={18} />
                </button>
              </>
            )}
            {(post.userId === user?.id || isAdminUser) && (
              <>
                {post.userId === user?.id && !isQuiz && (
                  <button
                    className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"
                    onClick={() => { setEditingPost(post.id); setEditContent(post.content); }}
                  >
                    <Icon name="edit" size={18} />
                  </button>
                )}
                <button
                  className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"
                  onClick={() => setConfirmDelete({ type: 'post', id: post.id })}
                >
                  <Icon name="delete" size={18} />
                </button>
              </>
            )}
            <button
              className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"
              onClick={() => setReportModal({ type: 'post', id: post.id })}
            >
              <Icon name="flag" size={18} />
            </button>
          </div>
        </div>

        {/* Inline edit */}
        {editingPost === post.id ? (
          <div className="space-y-2">
            <textarea
              dir="auto"
              className="w-full border border-surface-200 dark:border-surface-300 dark:bg-surface-200 dark:text-surface-900 rounded-xl p-3 text-sm resize-none"
              rows={3}
              value={editContent}
              onChange={e => setEditContent(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setEditingPost(null)}>{t('common.cancel')}</Button>
              <Button size="sm" onClick={handleEdit}>{t('common.save')}</Button>
            </div>
          </div>
        ) : (
          <>
            {renderPostText()}
          </>
        )}

        {/* Quiz block */}
        {isQuiz && post.quizQuestion && (
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-100 dark:border-purple-800/40 mt-2">
            <p dir={getTextDir(post.quizQuestion)} className="text-sm font-semibold text-purple-900 dark:text-purple-200 mb-3">
              {post.quizQuestion}
            </p>
            {hasVoted ? (
              <div className="space-y-2">
                {/* True option */}
                <div className={cn('flex items-center justify-between p-2.5 rounded-lg border',
                  post.quizAnswer === true ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800/40'
                  : quizSelected[post.id] === true ? 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800/40'
                  : 'bg-white dark:bg-surface-700 border-surface-200 dark:border-surface-600')}>
                  <span className="text-sm font-medium">{t('community.quiz_correct_opt')}</span>
                  <div className="flex items-center gap-2">
                    {post.quizAnswer === true && <Icon name="check_circle" size={16} className="text-success-500" filled />}
                    <div className="w-20 bg-surface-200 rounded-full h-1.5">
                      <div className="bg-primary-500 rounded-full h-1.5" style={{ width: `${truePct}%` }} />
                    </div>
                    <span className="text-xs text-surface-600 w-8 text-left">{truePct}%</span>
                  </div>
                </div>
                {/* False option */}
                <div className={cn('flex items-center justify-between p-2.5 rounded-lg border',
                  post.quizAnswer === false ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800/40'
                  : quizSelected[post.id] === false ? 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800/40'
                  : 'bg-white dark:bg-surface-700 border-surface-200 dark:border-surface-600')}>
                  <span className="text-sm font-medium">{t('community.quiz_wrong_opt')}</span>
                  <div className="flex items-center gap-2">
                    {post.quizAnswer === false && <Icon name="check_circle" size={16} className="text-success-500" filled />}
                    <div className="w-20 bg-surface-200 rounded-full h-1.5">
                      <div className="bg-primary-500 rounded-full h-1.5" style={{ width: `${falsePct}%` }} />
                    </div>
                    <span className="text-xs text-surface-600 w-8 text-left">{falsePct}%</span>
                  </div>
                </div>
                <p className="text-xs text-surface-400 text-center mt-1">{totalAns} {t('community.quiz_voted')}</p>
                {quizSelected[post.id] !== post.quizAnswer && (
                  <div className="bg-danger-50 dark:bg-danger-900/20 rounded-lg p-2 border border-danger-100 dark:border-danger-800/40 mt-2">
                    <p className="text-xs text-danger-600 flex items-center gap-1">
                      <Icon name="info" size={14} />
                      {t('community.quiz_wrong_feedback')} {post.quizAnswer ? t('community.quiz_correct_opt') : t('community.quiz_wrong_opt')}
                    </p>
                  </div>
                )}
                {quizSelected[post.id] === post.quizAnswer && (
                  <div className="bg-success-50 dark:bg-success-900/20 rounded-lg p-2 border border-success-100 dark:border-success-800/40 mt-2">
                    <p className="text-xs text-success-600 flex items-center gap-1">
                      <Icon name="check_circle" size={14} /> {t('community.quiz_right_feedback')}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  className="py-2 px-3 rounded-xl border-2 border-teal-300 dark:border-teal-700/60 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-900 dark:text-teal-300 transition-all font-semibold text-sm text-center"
                  onClick={() => handleQuizAnswer(true)}
                >
                  {t('community.correct_quiz')}
                </button>
                <button
                  className="py-2 px-3 rounded-xl border-2 border-rose-300 dark:border-rose-700/60 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-900 dark:text-rose-300 transition-all font-semibold text-sm text-center"
                  onClick={() => handleQuizAnswer(false)}
                >
                  {t('community.wrong_quiz')}
                </button>
              </div>
            )}
          </div>
        )}

        {post.image && <img src={post.image} alt="" className="mt-3 rounded-xl w-full" />}
      </div>

      {/* Action bar */}
      <PostActions
        post={post}
        liked={liked}
        likers={likers}
        saved={isSaved}
        showAllComments={showAllComments}
        onLike={handleLike}
        onComment={() => onOpenComments(post.id)}
        onSave={() => user && toggleSavePost(post.id, user.id)}
        onViewDetail={() => onOpenDetail(post.id)}
        onShowLikers={setLikersModal}
      />

      {/* Comment section */}
      {(showAllComments || showComments === post.id) && (
        <CommentList
          comments={currentComments}
          postId={post.id}
          postLocked={isPostLocked}
          isDetail={showAllComments}
          mentionSuggestions={mentionSuggestions}
          onOpenDetail={onOpenDetail}
          onMentionClick={onMentionClick}
          onHashtagClick={onHashtagClick}
          onUserClick={onUserClick}
          onSubmitComment={onSubmitComment}
          onInsertMention={onInsertMention}
          onTextChange={onTextChange}
        />
      )}
    </div>
  );
});
