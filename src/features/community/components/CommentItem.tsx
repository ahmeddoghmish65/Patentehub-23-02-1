/**
 * CommentItem.tsx
 * A single comment with its inline replies and reply composer.
 */
import { memo } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { useAuthStore } from '@/store/auth.store';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { MentionText } from './MentionText';
import { getTextDir, relativeTime } from '../utils/textUtils';
import { getReplyContent } from '../utils/commentUtils';
import { useCommunityUIStore } from '../store/communityUIStore';
import { useCommentStore } from '../store/commentStore';
import type { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
  postId: string;
  isDetail: boolean;
  onOpenDetail: (postId: string) => void;
  onMentionClick: (username: string) => void;
  onHashtagClick: (tag: string) => void;
}

export const CommentItem = memo(function CommentItem({
  comment: c,
  replies,
  postId,
  isDetail,
  onOpenDetail,
  onMentionClick,
  onHashtagClick,
}: CommentItemProps) {
  const { t, uiLang } = useTranslation();
  const { user } = useAuthStore();
  const { commentLikes, commentLikeCounts, toggleCommentLike } = useCommentStore();
  const {
    verifiedUsers, allUsers, replyingTo, replyContent,
    setReplyingTo, setReplyContent, setReportModal, setConfirmDelete,
  } = useCommunityUIStore();

  const isAdminUser = user?.role === 'admin' || user?.role === 'manager';

  const visibleReplies = isDetail ? replies : replies.slice(0, 3);
  const hasMoreReplies = !isDetail && replies.length > 3;

  const UserAvatar = ({ userId, avatar, name }: { userId?: string; avatar?: string; name: string }) => {
    const liveAvatar = userId ? (allUsers.find(u => u.id === userId)?.avatar || avatar || '') : (avatar || '');
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: liveAvatar ? undefined : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        {liveAvatar
          ? <img src={liveAvatar} className="w-7 h-7 rounded-full object-cover" alt="" />
          : <span className="text-[10px] font-bold text-white">{name.charAt(0)}</span>}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Top-level comment */}
      <div className="flex items-start gap-2">
        <UserAvatar userId={c.userId} avatar={c.userAvatar} name={c.userName} />
        <div className="flex-1 bg-white rounded-xl px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1">
              <button className="text-xs font-semibold text-surface-800 hover:text-primary-600">{c.userName}</button>
              {verifiedUsers[c.userId] && <VerifiedBadge size="xs" tooltip />}
            </span>
            <span className="text-[10px] text-surface-400">{relativeTime(c.createdAt, uiLang)}</span>
          </div>
          <p dir={getTextDir(c.content)} className="text-sm text-surface-600 mt-0.5">
            <MentionText text={c.content} onMentionClick={onMentionClick} onHashtagClick={onHashtagClick} />
          </p>
          <div className="flex items-center gap-3 mt-1.5">
            <button
              className={cn('flex items-center gap-0.5 text-[11px]', commentLikes[c.id] ? 'text-red-500' : 'text-surface-400 hover:text-red-400')}
              onClick={() => user && toggleCommentLike(c.id, user.id)}
            >
              <Icon name="favorite" size={13} filled={commentLikes[c.id]} />
              {(commentLikeCounts[c.id] || 0) > 0 && <span>{commentLikeCounts[c.id]}</span>}
            </button>
            <button
              className="text-[11px] text-surface-400 hover:text-primary-500 flex items-center gap-0.5"
              onClick={() => setReplyingTo({ commentId: c.id, userName: c.userName })}
            >
              <Icon name="reply" size={13} /> رد
              {replies.length > 0 && (
                <span className="text-[10px] bg-primary-50 text-primary-500 px-1 rounded-full">{replies.length}</span>
              )}
            </button>
            <button
              className="text-[11px] text-surface-400 hover:text-orange-500"
              onClick={() => setReportModal({ type: 'comment', id: c.id })}
            >
              <Icon name="flag" size={12} />
            </button>
            {(c.userId === user?.id || isAdminUser) && (
              <button
                className="text-[11px] text-surface-400 hover:text-danger-500"
                onClick={() => setConfirmDelete({ type: 'comment', id: c.id })}
              >
                <Icon name="delete" size={12} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {visibleReplies.length > 0 && (
        <div className="mr-8 space-y-2 border-r-2 border-primary-100 pr-3">
          {visibleReplies.map(r => (
            <div key={r.id} className="flex items-start gap-2">
              <UserAvatar userId={r.userId} avatar={r.userAvatar} name={r.userName} />
              <div className="flex-1 bg-white rounded-xl px-3 py-2">
                <div className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-1">
                    <button className="text-xs font-semibold text-surface-800 hover:text-primary-600">{r.userName}</button>
                    {verifiedUsers[r.userId] && <VerifiedBadge size="xs" tooltip />}
                  </span>
                  <Icon name="arrow_back" size={10} className="text-surface-300" />
                  <span className="text-[10px] text-primary-500">{c.userName}</span>
                  <span className="text-[10px] text-surface-400 mr-auto">{relativeTime(r.createdAt, uiLang)}</span>
                </div>
                <p dir={getTextDir(getReplyContent(r))} className="text-sm text-surface-600 mt-0.5">
                  <MentionText text={getReplyContent(r)} onMentionClick={onMentionClick} onHashtagClick={onHashtagClick} />
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <button
                    className={cn('flex items-center gap-0.5 text-[11px]', commentLikes[r.id] ? 'text-red-500' : 'text-surface-400 hover:text-red-400')}
                    onClick={() => user && toggleCommentLike(r.id, user.id)}
                  >
                    <Icon name="favorite" size={13} filled={commentLikes[r.id]} />
                    {(commentLikeCounts[r.id] || 0) > 0 && <span>{commentLikeCounts[r.id]}</span>}
                  </button>
                  <button
                    className="text-[11px] text-surface-400 hover:text-orange-500"
                    onClick={() => setReportModal({ type: 'comment', id: r.id })}
                  >
                    <Icon name="flag" size={12} />
                  </button>
                  {(r.userId === user?.id || isAdminUser) && (
                    <button
                      className="text-[11px] text-surface-400 hover:text-danger-500"
                      onClick={() => setConfirmDelete({ type: 'reply', id: r.id })}
                    >
                      <Icon name="delete" size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {hasMoreReplies && (
            <button
              className="text-xs text-primary-500 font-medium mr-8 hover:text-primary-700"
              onClick={() => onOpenDetail(postId)}
            >
              {t('community.show_all_replies')} ({replies.length})
            </button>
          )}
        </div>
      )}

      {/* Reply composer */}
      {replyingTo?.commentId === c.id && (
        <div className="mr-8 flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              dir="auto"
              className="w-full border border-primary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-100 pr-16"
              placeholder={`${t('community.reply')} ${replyingTo.userName}...`}
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              autoFocus
            />
            <button
              className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-surface-400 hover:text-surface-600 px-2"
              onClick={() => { setReplyingTo(null); setReplyContent(''); }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
