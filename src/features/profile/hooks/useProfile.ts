import { useState, useEffect, useCallback } from 'react';
import { useAuthStore, useDataStore } from '@/store';
import { getSocialStats } from '../services/profileService';
import type { SocialUser } from '../types/profile.types';

export function useProfile() {
  const { user } = useAuthStore();
  const { posts, loadPosts, loadMistakes, loadQuestions, loadQuizHistory, loadLessons } =
    useDataStore();

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersList, setFollowersList] = useState<SocialUser[]>([]);
  const [followingList, setFollowingList] = useState<SocialUser[]>([]);
  const [myFollowing, setMyFollowing] = useState<string[]>(() => {
    if (!user) return [];
    try { return JSON.parse(localStorage.getItem(`following_${user.id}`) || '[]'); } catch { return []; }
  });

  // Lazy-load store data only if not yet populated
  useEffect(() => {
    const s = useDataStore.getState();
    if (!s.posts.length) loadPosts();
    if (!s.mistakes.length) loadMistakes();
    if (!s.questions.length) loadQuestions();
    if (!s.quizHistory.length) loadQuizHistory();
    if (!s.lessons.length) loadLessons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load social stats whenever the logged-in user changes
  useEffect(() => {
    if (!user) return;
    getSocialStats(user.id).then(({ followersList: fl, followingList: wl, followingIds }) => {
      setFollowerCount(fl.length);
      setFollowersList(fl);
      setFollowingCount(wl.length);
      setFollowingList(wl);
      setMyFollowing(followingIds);
    });
  }, [user?.id]);

  const toggleFollowUser = useCallback(
    (targetId: string, targetName: string, targetAvatar?: string, targetUsername?: string) => {
      if (!user) return;
      const raw = localStorage.getItem(`following_${user.id}`);
      let arr: string[] = raw ? (() => { try { return JSON.parse(raw); } catch { return []; } })() : [];
      const isFollowing = arr.includes(targetId);
      arr = isFollowing ? arr.filter(id => id !== targetId) : [...arr, targetId];
      localStorage.setItem(`following_${user.id}`, JSON.stringify(arr));
      setMyFollowing(arr);
      setFollowingCount(arr.length);
      if (!isFollowing) {
        setFollowingList(prev =>
          prev.find(u => u.id === targetId)
            ? prev
            : [...prev, { id: targetId, name: targetName, avatar: targetAvatar, username: targetUsername }],
        );
      } else {
        setFollowingList(prev => prev.filter(u => u.id !== targetId));
      }
    },
    [user],
  );

  return {
    user,
    posts,
    followerCount,
    followingCount,
    followersList,
    followingList,
    myFollowing,
    toggleFollowUser,
  };
}
