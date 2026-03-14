/**
 * useComments.ts
 * Opens/closes the inline comment section for a post and manages the detail view.
 */
import { useCallback } from 'react';
import { useCommentStore } from '../store/commentStore';
import { useCommunityUIStore } from '../store/communityUIStore';

export function useComments() {
  const { loadComments, loadDetailComments, comments, detailComments } = useCommentStore();
  const {
    showComments, setShowComments,
    detailPostId, setDetailPostId,
    setReplyingTo, setReplyContent,
  } = useCommunityUIStore();

  const openComments = useCallback(async (postId: string) => {
    if (showComments === postId) {
      setShowComments(null);
      return;
    }
    await loadComments(postId);
    setShowComments(postId);
    setReplyingTo(null);
    setReplyContent('');
  }, [showComments, loadComments, setShowComments, setReplyingTo, setReplyContent]);

  const openPostDetail = useCallback(async (postId: string) => {
    await loadDetailComments(postId);
    setDetailPostId(postId);
    setShowComments(postId);
  }, [loadDetailComments, setDetailPostId, setShowComments]);

  const closeDetail = useCallback(() => {
    setDetailPostId(null);
    setShowComments(null);
  }, [setDetailPostId, setShowComments]);

  return {
    comments,
    detailComments,
    showComments,
    detailPostId,
    openComments,
    openPostDetail,
    closeDetail,
  };
}
