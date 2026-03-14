/**
 * useAdminPosts — loads and exposes post / comment management state.
 */
import { useEffect, useState, useCallback } from 'react';
import { useAdminStore, useDataStore } from '@/store';
import type { Comment } from '@/db/database';

export function useAdminPosts() {
  const posts = useDataStore(s => s.posts);
  const deletedPosts = useAdminStore(s => s.deletedPosts);
  const deletedComments = useAdminStore(s => s.deletedComments);
  const loadPosts = useDataStore(s => s.loadPosts);
  const loadDeletedPosts = useAdminStore(s => s.loadDeletedPosts);
  const loadDeletedComments = useAdminStore(s => s.loadDeletedComments);
  const adminDeletePost = useAdminStore(s => s.adminDeletePost);
  const adminDeleteComment = useAdminStore(s => s.adminDeleteComment);
  const restorePost = useAdminStore(s => s.restorePost);
  const permanentDeletePost = useAdminStore(s => s.permanentDeletePost);
  const restoreComment = useAdminStore(s => s.restoreComment);
  const permanentDeleteComment = useAdminStore(s => s.permanentDeleteComment);
  const getComments = useDataStore(s => s.getComments);

  const [allComments, setAllComments] = useState<(Comment & { postContent?: string })[]>([]);

  const loadAllComments = useCallback(async () => {
    const comments: (Comment & { postContent?: string })[] = [];
    for (const post of posts) {
      const postComments = await getComments(post.id);
      for (const c of postComments) {
        comments.push({ ...c, postContent: post.content.substring(0, 60) });
      }
    }
    comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setAllComments(comments);
  }, [posts, getComments]);

  useEffect(() => {
    loadPosts();
    loadDeletedPosts();
    loadDeletedComments();
  }, [loadPosts, loadDeletedPosts, loadDeletedComments]);

  return {
    posts,
    deletedPosts,
    deletedComments,
    allComments,
    loadAllComments,
    adminDeletePost,
    adminDeleteComment,
    restorePost,
    permanentDeletePost,
    restoreComment,
    permanentDeleteComment,
  };
}
