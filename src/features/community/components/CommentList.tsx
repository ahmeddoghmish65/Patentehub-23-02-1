/**
 * CommentList.tsx
 * Renders a list of comments with nested replies for a given post.
 */
import { memo, useMemo } from 'react';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/i18n';
import { CommentItem } from './CommentItem';
import { CommentComposer } from './CommentComposer';
import { isReply, groupCommentReplies } from '../utils/commentUtils';
import type { Comment, CommunityUser } from '../types';

interface CommentListProps {
  comments: Comment[];
  postId: string;
  postLocked: boolean;
  isDetail: boolean;
  mentionSuggestions: CommunityUser[];
  onOpenDetail: (postId: string) => void;
  onMentionClick: (username: string) => void;
  onHashtagClick: (tag: string) => void;
  onSubmitComment: (postId: string) => void;
  onInsertMention: (username: string, currentText: string, setter: (t: string) => void) => void;
  onTextChange: (text: string, setter: (t: string) => void) => void;
}

export const CommentList = memo(function CommentList({
  comments,
  postId,
  postLocked,
  isDetail,
  mentionSuggestions,
  onOpenDetail,
  onMentionClick,
  onHashtagClick,
  onSubmitComment,
  onInsertMention,
  onTextChange,
}: CommentListProps) {
  const { t } = useTranslation();

  const { rootComments, replyMap } = useMemo(() => {
    const root = comments.filter(c => !isReply(c));
    const map = groupCommentReplies(comments);
    return { rootComments: root, replyMap: map };
  }, [comments]);

  const visibleComments = isDetail ? rootComments : rootComments.slice(0, 3);
  const hasMore = !isDetail && rootComments.length > 3;

  return (
    <div className="border-t border-surface-100 p-4 bg-surface-50 space-y-3">
      {postLocked && (
        <div className="flex items-center gap-2 bg-surface-100 rounded-xl px-3 py-2 border border-surface-200">
          <Icon name="lock" size={14} className="text-surface-400" />
          <span className="text-xs text-surface-500">{t('community.comments_locked_notice')}</span>
        </div>
      )}

      {visibleComments.map(c => (
        <CommentItem
          key={c.id}
          comment={c}
          replies={replyMap.get(c.id) || []}
          postId={postId}
          isDetail={isDetail}
          onOpenDetail={onOpenDetail}
          onMentionClick={onMentionClick}
          onHashtagClick={onHashtagClick}
        />
      ))}

      {hasMore && (
        <button
          className="w-full text-center text-sm text-primary-500 font-medium py-2 hover:text-primary-700"
          onClick={() => onOpenDetail(postId)}
        >
          {t('community.view_all_comments')} ({rootComments.length})
        </button>
      )}

      {!postLocked && (
        <CommentComposer
          postId={postId}
          mentionSuggestions={mentionSuggestions}
          onSubmit={onSubmitComment}
          onInsertMention={onInsertMention}
          onTextChange={onTextChange}
        />
      )}
    </div>
  );
});
