/**
 * useAdminPosts — loads and exposes post / comment management state via TanStack Query.
 */
import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminStore, useDataStore } from '@/store';
import { queryKeys } from '@/shared/lib/queryKeys';
import type { Comment } from '@/infrastructure/database/database';

export function useAdminPosts() {
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
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: queryKeys.admin.posts,
    queryFn: async () => {
      await Promise.all([loadPosts(), loadDeletedPosts(), loadDeletedComments()]);
      const ds = useDataStore.getState();
      const as_ = useAdminStore.getState();
      return { posts: ds.posts, deletedPosts: as_.deletedPosts, deletedComments: as_.deletedComments };
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const posts = data?.posts ?? [];
  const deletedPosts = data?.deletedPosts ?? [];
  const deletedComments = data?.deletedComments ?? [];

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

  const reload = () => queryClient.invalidateQueries({ queryKey: queryKeys.admin.posts });

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
    reload,
  };
}
