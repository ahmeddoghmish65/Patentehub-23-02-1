/**
 * PostActions.tsx
 * Like / comment / bookmark action bar shown below a post.
 */
import { memo, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import type { Post, PostLiker, LikersModalState } from '../types';

interface PostActionsProps {
  post: Post;
  liked: boolean;
  likers: PostLiker[];
  saved: boolean;
  showAllComments?: boolean;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onViewDetail: () => void;
  onShowLikers: (state: LikersModalState) => void;
}

export const PostActions = memo(function PostActions({
  post,
  liked,
  likers,
  saved,
  showAllComments = false,
  onLike,
  onComment,
  onSave,
  onViewDetail,
  onShowLikers,
}: PostActionsProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const lang = window.location.pathname.split('/')[1] || 'ar';
    const url = `${window.location.origin}/${lang}/community/post/${post.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border-t border-surface-100 px-5 py-3 flex items-center gap-3">
      {/* Like */}
      <button
        className={cn('flex items-center gap-1 text-sm', liked ? 'text-red-500' : 'text-surface-400 hover:text-red-400')}
        onClick={onLike}
      >
        <Icon name="favorite" size={20} filled={liked} />
        {post.likesCount}
      </button>

      {/* Liker avatars */}
      {likers.length > 0 && (
        <button
          className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
          onClick={() => onShowLikers({ postId: post.id, likers })}
          title={t('community.likers_title')}
        >
          <div className="flex -space-x-1.5 rtl:space-x-reverse">
            {likers.slice(0, 3).map((liker, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-sm"
                style={{ zIndex: 3 - i }}
              >
                {liker.userAvatar ? (
                  <img src={liker.userAvatar} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <span className="text-[7px] font-bold text-white">{liker.userName.charAt(0)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </button>
      )}

      {/* Comment */}
      <button
        className={cn(
          'flex items-center gap-1 text-sm',
          post.locked ? 'text-surface-400 hover:text-surface-600' : 'text-surface-400 hover:text-primary-500',
        )}
        onClick={onComment}
        title={post.locked ? t('community.comments_locked_label') : undefined}
      >
        <Icon name={post.locked ? 'lock' : 'chat_bubble'} size={20} />
        {post.commentsCount}
      </button>

      {/* Bookmark */}
      <button
        className={cn(
          'flex items-center gap-1 text-sm mr-auto',
          saved ? 'text-primary-500' : 'text-surface-400 hover:text-primary-400',
        )}
        onClick={onSave}
        title={saved ? t('community.unsave_post') : t('community.save_post')}
      >
        <Icon name="bookmark" size={20} filled={saved} />
      </button>

      {/* Share / copy link */}
      <button
        className={cn('flex items-center gap-1 text-sm transition-colors', copied ? 'text-success-500' : 'text-surface-400 hover:text-primary-500')}
        onClick={handleShare}
        title={t('community.copy_link') || 'Copy link'}
      >
        <Icon name={copied ? 'check' : 'link'} size={18} />
      </button>

      {/* View all comments link */}
      {!showAllComments && post.commentsCount > 3 && (
        <button
          className="text-xs text-primary-500 font-medium hover:text-primary-700"
          onClick={onViewDetail}
        >
          {t('community.view_all_comments')}
        </button>
      )}
    </div>
  );
});
