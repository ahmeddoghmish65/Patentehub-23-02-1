/**
 * useCreateComment.ts
 * Handles comment and reply creation with notifications and post refresh.
 */
import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { usePostStore } from '../store/postStore';
import { useCommentStore } from '../store/commentStore';
import { useCommunityUIStore } from '../store/communityUIStore';
import { createNotification } from '../services/notificationService';

export function useCreateComment(
  sendMentionNotifs: (text: string, postId?: string, commentId?: string) => Promise<void>,
  loadNotifs: () => Promise<void>,
) {
  const { user } = useAuthStore();
  const { posts, loadPosts } = usePostStore();
  const { loadComments, loadDetailComments, createComment, deleteComment } = useCommentStore();
  const {
    newComment, setNewComment,
    replyContent, setReplyContent,
    replyingTo, setReplyingTo,
    showComments, detailPostId,
    setConfirmDelete, confirmDelete,
  } = useCommunityUIStore();

  const restrictions = (user as Record<string, unknown> | undefined)?.communityRestrictions as Record<string, boolean> | undefined;
  const canComment = !restrictions || restrictions.canComment !== false;
  const canReply   = !restrictions || restrictions.canReply !== false;

  const handleComment = useCallback(async (postId: string) => {
    if (!canComment || !newComment.trim() || !user) return;

    await createComment(postId, newComment);
    await sendMentionNotifs(newComment, postId);

    const post = posts.find(p => p.id === postId);
    if (post && post.userId !== user.id) {
      await createNotification({
        toUserId: post.userId,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserAvatar: user.avatar || '',
        type: 'comment',
        postId,
      });
    }

    setNewComment('');
    if (detailPostId === postId) await loadDetailComments(postId);
    else await loadComments(postId);
    await loadPosts();
    await loadNotifs();
  }, [canComment, newComment, user, posts, createComment, sendMentionNotifs, loadComments, loadDetailComments, loadPosts, loadNotifs, detailPostId, setNewComment]);

  const handleReply = useCallback(async (postId: string) => {
    if (!canReply || !replyContent.trim() || !replyingTo || !user) return;

    await createComment(postId, `REPLY_TO:${replyingTo.commentId}:${replyContent}`);
    await sendMentionNotifs(replyContent, postId);

    const freshComments = await loadComments(postId);
    const parent = freshComments.find(c => c.id === replyingTo.commentId);
    if (parent && parent.userId !== user.id) {
      await createNotification({
        toUserId: parent.userId,
        fromUserId: user.id,
        fromUserName: user.name,
        fromUserAvatar: user.avatar || '',
        type: 'reply',
        postId,
        commentId: replyingTo.commentId,
      });
    }

    setReplyContent('');
    setReplyingTo(null);
    if (detailPostId === postId) await loadDetailComments(postId);
    await loadPosts();
  }, [canReply, replyContent, replyingTo, user, createComment, sendMentionNotifs, loadComments, loadDetailComments, loadPosts, detailPostId, setReplyContent, setReplyingTo]);

  const handleDeleteItem = useCallback(async () => {
    if (!confirmDelete) return;

    if (confirmDelete.type === 'post') {
      await usePostStore.getState().deletePost(confirmDelete.id);
    } else {
      await deleteComment(confirmDelete.id);
      const activePostId = detailPostId || showComments;
      if (activePostId) {
        if (detailPostId) await loadDetailComments(detailPostId);
        else await loadComments(activePostId);
      }
      await loadPosts();
    }
    setConfirmDelete(null);
  }, [confirmDelete, deleteComment, loadComments, loadDetailComments, loadPosts, showComments, detailPostId, setConfirmDelete]);

  return {
    newComment, setNewComment,
    replyContent, setReplyContent,
    replyingTo, setReplyingTo,
    canComment, canReply,
    handleComment,
    handleReply,
    handleDeleteItem,
  };
}
