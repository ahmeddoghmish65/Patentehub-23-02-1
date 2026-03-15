/**
 * PostList.tsx
 * Renders the full list of posts. Memoized to avoid re-rendering unchanged cards.
 */
import { memo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/i18n';
import { PostCard } from './PostCard';
import type { Post, PostLiker, CommunityUser } from '../types';

interface PostListProps {
  posts: Post[];
  likes: Record<string, boolean>;
  postLikers: Record<string, PostLiker[]>;
  activeTab: 'discover' | 'following';
  mentionSuggestions: CommunityUser[];
  onMentionClick: (username: string) => void;
  onHashtagClick: (tag: string) => void;
  onOpenDetail: (postId: string) => void;
  onOpenComments: (postId: string) => void;
  onSubmitComment: (postId: string) => void;
  onUserClick: (userId: string) => void;
  onInsertMention: (username: string, text: string, setter: (t: string) => void) => void;
  onTextChange: (text: string, setter: (t: string) => void) => void;
}

export const PostList = memo(function PostList({
  posts,
  likes,
  postLikers,
  activeTab,
  mentionSuggestions,
  onMentionClick,
  onHashtagClick,
  onOpenDetail,
  onOpenComments,
  onSubmitComment,
  onUserClick,
  onInsertMention,
  onTextChange,
}: PostListProps) {
  const { t } = useTranslation();

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-surface-100 rounded-2xl border border-surface-100">
        <Icon
          name={activeTab === 'following' ? 'people' : 'forum'}
          size={48}
          className="text-surface-300 mx-auto mb-4"
        />
        <p className="text-surface-500">
          {activeTab === 'following' ? t('community.no_following_posts') : t('community.no_posts')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          liked={likes[post.id] || false}
          likers={postLikers[post.id] || []}
          mentionSuggestions={mentionSuggestions}
          onMentionClick={onMentionClick}
          onHashtagClick={onHashtagClick}
          onOpenDetail={onOpenDetail}
          onOpenComments={onOpenComments}
          onSubmitComment={onSubmitComment}
          onUserClick={onUserClick}
          onInsertMention={onInsertMention}
          onTextChange={onTextChange}
        />
      ))}
    </div>
  );
});
