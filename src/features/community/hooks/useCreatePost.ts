/**
 * useCreatePost.ts
 * Handles post and quiz creation, including mention notifications and hashtag indexing.
 */
import { useState, useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { getDB } from '@/db/database';
import { extractHashtags, indexHashtags } from '@/services/hashtagService';
import type { Post } from '../types';
import { usePostStore } from '../store/postStore';
import { useCommunityUIStore } from '../store/communityUIStore';

export function useCreatePost(
  sendMentionNotifs: (text: string, postId?: string) => Promise<void>,
) {
  const [posting, setPosting] = useState(false);

  const { user } = useAuthStore();
  const { createPost, loadPosts } = usePostStore();
  const {
    newPost, postType, quizQuestion, quizAnswer, postImage,
    setNewPost, setPostType, setQuizQuestion, setQuizAnswer, setPostImage,
    postSortMode, activeHashtag,
  } = useCommunityUIStore();

  const handlePost = useCallback(async () => {
    if (!user) return;

    const restrictions = (user as Record<string, unknown>)?.communityRestrictions as Record<string, boolean> | undefined;
    if (restrictions?.canPost === false) return;

    if (postType === 'post' && !newPost.trim()) return;
    if (postType === 'quiz' && !quizQuestion.trim()) return;

    setPosting(true);

    if (postType === 'quiz') {
      const db = await getDB();
      const postId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
      const quizHashtags = extractHashtags(quizQuestion + ' ' + newPost);
      const quizPost: Post = {
        id: postId,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar || '',
        content: newPost.trim() || '',
        image: postImage,
        type: 'quiz',
        quizQuestion: quizQuestion.trim(),
        quizAnswer,
        quizStats: { trueCount: 0, falseCount: 0 },
        hashtags: quizHashtags,
        pinned: false,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.put('posts', quizPost);
      indexHashtags(quizHashtags).catch(() => {});
      await sendMentionNotifs(quizQuestion, postId);
      setQuizQuestion('');
      setQuizAnswer(true);
      setNewPost('');
      setPostType('post');
      setPostImage('');
      await loadPosts(postSortMode, activeHashtag ?? undefined);
    } else {
      const ok = await createPost(newPost, postImage);
      if (ok) {
        await sendMentionNotifs(newPost);
      }
      setNewPost('');
      setPostImage('');
    }

    setPosting(false);
  }, [user, postType, newPost, quizQuestion, quizAnswer, postImage, createPost, loadPosts, sendMentionNotifs, setNewPost, setPostType, setQuizQuestion, setQuizAnswer, setPostImage, postSortMode, activeHashtag]);

  return { handlePost, posting };
}
