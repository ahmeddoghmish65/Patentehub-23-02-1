import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocaleNavigate } from '@/hooks/useLocaleNavigate';
import { useAuthStore, useDataStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { getDB } from '@/db/database';
import type { Comment, Post, Hashtag } from '@/db/database';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import * as api from '@/db/api';
import type { PostSortMode } from '@/db/api';
import { apiCreateCommunityNotif, apiGetTrendingHashtags, apiSuggestHashtags } from '@/db/api';
import { extractHashtags, indexHashtags } from '@/services/hashtagService';

function isReply(c: Comment): boolean { return !!c.parentId || c.content.startsWith('REPLY_TO:'); }
function getParentId(c: Comment): string | null {
  if (c.parentId) return c.parentId;
  if (!c.content.startsWith('REPLY_TO:')) return null;
  const match = c.content.match(/^REPLY_TO:([^:]+):/);
  return match ? match[1] : null;
}
function getReplyContent(c: Comment): string {
  if (c.parentId) return c.content;
  return c.content.replace(/^REPLY_TO:[^:]+:/, '');
}
/** Detect text direction: RTL for Arabic content, LTR otherwise. */
function getTextDir(text: string): 'rtl' | 'ltr' {
  return /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
}

// Parse @mentions from text and highlight them in blue — click opens profile
function renderWithMentions(text: string, onMentionClick?: (username: string) => void) {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@') && part.length > 1) {
      return (
        <span key={i}
          className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 hover:underline underline-offset-2"
          onClick={(e) => { e.stopPropagation(); onMentionClick?.(part.slice(1)); }}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Parse @mentions AND #hashtags inline — highlights and makes both clickable
function renderWithMentionsAndHashtags(
  text: string,
  onMentionClick?: (username: string) => void,
  onHashtagClick?: (tag: string) => void,
) {
  // Split on @mentions and #hashtags; \p{L}\p{N} gives full Unicode (Arabic, Italian, English…)
  const parts = text.split(/(#[\p{L}\p{N}_]+|@\w+)/gu);
  return parts.map((part, i) => {
    if (part.startsWith('@') && part.length > 1) {
      return (
        <span key={i}
          className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700 hover:underline underline-offset-2"
          onClick={(e) => { e.stopPropagation(); onMentionClick?.(part.slice(1)); }}>
          {part}
        </span>
      );
    }
    if (part.startsWith('#') && part.length > 1) {
      const tag = part.slice(1).toLowerCase();
      return (
        <span key={i}
          className="text-primary-600 font-semibold cursor-pointer hover:text-primary-700 hover:underline underline-offset-2"
          onClick={(e) => { e.stopPropagation(); onHashtagClick?.(tag); }}>
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

// Relative time formatter — used for posts, comments, replies, notifications
function relativeTime(iso: string, uiLang?: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const isIt = uiLang === 'it';
  if (mins < 1) return isIt ? 'adesso' : 'الآن';
  if (mins < 60) return isIt ? `${mins} min fa` : `منذ ${mins} د`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return isIt ? `${hours} h fa` : `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7) return isIt ? `${days} giorni fa` : `منذ ${days} يوم`;
  return new Date(iso).toLocaleDateString(isIt ? 'it' : 'ar');
}

export function CommunityPage() {
  const { navigate } = useLocaleNavigate();
  const { state } = useLocation();
  const openPostId = (state as { openPostId?: string } | null)?.openPostId;
  const { t, uiLang } = useTranslation();
  const { user } = useAuthStore();
  const { posts, loadPosts, createPost, updatePost, deletePost, toggleLike, checkLike, getComments, createComment, deleteComment, createReport, communityNotifs, loadCommunityNotifs, markNotifRead, markAllNotifsRead } = useDataStore();
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [reportModal, setReportModal] = useState<{ type: 'post' | 'comment'; id: string } | null>(null);
  const [reportReason, setReportReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ type: 'post' | 'comment' | 'reply'; id: string } | null>(null);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [bookmarkRemovedToast, setBookmarkRemovedToast] = useState(false);
  const [confirmDeleteBookmarkId, setConfirmDeleteBookmarkId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; userName: string } | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [commentLikes, setCommentLikes] = useState<Record<string, boolean>>({});
  const [commentLikeCounts, setCommentLikeCounts] = useState<Record<string, number>>({});
  const [postType, setPostType] = useState<'post' | 'quiz'>('post');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizAnswer, setQuizAnswer] = useState<boolean>(true);
  const [quizVoted, setQuizVoted] = useState<Record<string, boolean>>({});
  const [quizSelected, setQuizSelected] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<string[]>([]);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [viewUserData, setViewUserData] = useState<{ name: string; username: string; avatar: string; bio: string; verified: boolean; postsCount: number; followersCount: number; followingCount: number; hideStats: boolean; joinedAt?: string; examReadiness?: number; totalQuizzes?: number; correctAnswers?: number; wrongAnswers?: number; level?: number; xp?: number } | null>(null);
  const [viewProfileTab, setViewProfileTab] = useState<'posts' | 'quizzes'>('posts');
  const [viewProfileStatView, setViewProfileStatView] = useState<'followers' | 'following' | null>(null);
  const [viewProfileFollowers, setViewProfileFollowers] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [viewProfileFollowing, setViewProfileFollowing] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [detailPostId, setDetailPostId] = useState<string | null>(null);
  const [detailComments, setDetailComments] = useState<Comment[]>([]);
  const [verifiedUsers, setVerifiedUsers] = useState<Record<string, boolean>>({});
  const [expandedTexts, setExpandedTexts] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'discover' | 'following'>('discover');
  // Notifications
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  // Saved posts / bookmarks
  const [savedPosts, setSavedPosts] = useState<string[]>([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [confirmClearBookmarks, setConfirmClearBookmarks] = useState(false);
  const bookmarkRef = useRef<HTMLDivElement>(null);
  // Trending hashtags panel
  const [showTrending, setShowTrending] = useState(false);
  const trendingRef = useRef<HTMLDivElement>(null);
  // Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Mention autocomplete
  const [mentionSuggestions, setMentionSuggestions] = useState<{ id: string; name: string; username: string }[]>([]);
  const [allUsers, setAllUsers] = useState<{ id: string; name: string; username: string; avatar: string }[]>([]);
  // Feed ranking & hashtag
  const [postSortMode, setPostSortMode] = useState<PostSortMode>('hot');
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [hashtagSuggestions, setHashtagSuggestions] = useState<Hashtag[]>([]);
  // Community image upload — controlled by admin toggle
  const [communityAllowImages, setCommunityAllowImages] = useState(() =>
    localStorage.getItem('communityAllowImages') === 'true'
  );
  const [postImage, setPostImage] = useState<string>('');
  // Post likers — first 3 avatars shown next to like button
  const [postLikers, setPostLikers] = useState<Record<string, { userId: string; userName: string; userAvatar: string }[]>>({});
  const [likersModal, setLikersModal] = useState<{ postId: string; likers: { userId: string; userName: string; userAvatar: string }[] } | null>(null);

  useEffect(() => { loadPosts(postSortMode, activeHashtag ?? undefined); }, [loadPosts, postSortMode, activeHashtag]);

  // Load likers for all posts to show avatars
  useEffect(() => {
    if (!posts.length) return;
    (async () => {
      const db = await getDB();
      const allLikes = await db.getAll('likes');
      const allDbUsers = await db.getAll('users');
      const userMap: Record<string, { name: string; avatar: string }> = {};
      for (const u of allDbUsers) userMap[u.id] = { name: u.name, avatar: u.avatar || '' };
      const map: Record<string, { userId: string; userName: string; userAvatar: string }[]> = {};
      for (const l of allLikes) {
        if (!map[l.postId]) map[l.postId] = [];
        map[l.postId].push({ userId: l.userId, userName: userMap[l.userId]?.name || t('community.user_label'), userAvatar: userMap[l.userId]?.avatar || '' });
      }
      setPostLikers(map);
    })();
  }, [posts]);

  // Sync communityAllowImages if admin changes it in another tab / same session
  useEffect(() => {
    const handler = () => setCommunityAllowImages(localStorage.getItem('communityAllowImages') === 'true');
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);
  useEffect(() => { if (user) loadCommunityNotifs(); }, [user, loadCommunityNotifs]);

  // Load trending hashtags once on mount and after posts load
  useEffect(() => {
    apiGetTrendingHashtags(8).then(r => { if (r.success && r.data) setTrendingHashtags(r.data); }).catch(() => {});
  }, [posts.length]);

  // Close bookmarks when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bookmarkRef.current && !bookmarkRef.current.contains(e.target as Node)) setShowBookmarks(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close trending panel when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (trendingRef.current && !trendingRef.current.contains(e.target as Node)) setShowTrending(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    posts.forEach(async p => { const liked = await checkLike(p.id); setLikes(prev => ({ ...prev, [p.id]: liked })); });
  }, [posts, checkLike]);

  // Load following, quiz votes, comment likes, verified users
  useEffect(() => {
    if (user) {
      try {
        const sf = localStorage.getItem(`following_${user.id}`);
        if (sf) setFollowing(JSON.parse(sf));
      } catch { /* ignore */ }
      try {
        const sv = localStorage.getItem(`quizVotes_${user.id}`);
        if (sv) {
          const p = JSON.parse(sv);
          setQuizVoted(p.voted || {});
          setQuizSelected(p.selected || {});
        }
      } catch { /* ignore */ }
      try {
        const cl = localStorage.getItem(`commentLikes_${user.id}`);
        if (cl) setCommentLikes(JSON.parse(cl));
      } catch { /* ignore */ }
      try {
        const clc = localStorage.getItem(`commentLikeCounts_${user.id}`);
        if (clc) setCommentLikeCounts(JSON.parse(clc));
      } catch { /* ignore */ }
      try {
        const sp = localStorage.getItem(`savedPosts_${user.id}`);
        if (sp) setSavedPosts(JSON.parse(sp));
      } catch { /* ignore */ }
    }
    (async () => {
      const db = await getDB();
      const allUsersRaw = await db.getAll('users');
      const vMap: Record<string, boolean> = {};
      for (const u of allUsersRaw) { if (u.verified) vMap[u.id] = true; }
      setVerifiedUsers(vMap);
      setAllUsers(allUsersRaw.map((u: { id: string; name: string; username: string; avatar?: string }) => ({ id: u.id, name: u.name, username: u.username || '', avatar: u.avatar || '' })));
    })();
  }, [user]);

  // Save comment likes to localStorage whenever they change
  useEffect(() => {
    if (user && Object.keys(commentLikes).length > 0) {
      localStorage.setItem(`commentLikes_${user.id}`, JSON.stringify(commentLikes));
    }
  }, [commentLikes, user]);

  useEffect(() => {
    if (user && Object.keys(commentLikeCounts).length > 0) {
      localStorage.setItem(`commentLikeCounts_${user.id}`, JSON.stringify(commentLikeCounts));
    }
  }, [commentLikeCounts, user]);

  const isVerified = (userId: string) => verifiedUsers[userId] || false;

  // Open user profile from @mention click
  const handleMentionClick = useCallback(async (username: string) => {
    const found = allUsers.find(u =>
      (u.username || '').toLowerCase() === username.toLowerCase() ||
      u.name.toLowerCase() === username.toLowerCase()
    );
    if (found) {
      openUserProfile(found.id);
    }
  }, [allUsers]);

  // Filter feed by clicked hashtag
  const handleHashtagClick = useCallback((tag: string) => {
    setActiveHashtag(tag);
  }, []);

  // Detect @mentions in text and send notifications
  const sendMentionNotifs = useCallback(async (text: string, postId?: string, commentId?: string) => {
    if (!user) return;
    const mentionMatches = text.match(/@(\w+)/g) || [];
    for (const mention of mentionMatches) {
      const uname = mention.slice(1).toLowerCase();
      const mentioned = allUsers.find(u => (u.username || '').toLowerCase() === uname || u.name.toLowerCase() === uname);
      if (mentioned && mentioned.id !== user.id) {
        await api.apiCreateCommunityNotif({
          toUserId: mentioned.id, fromUserId: user.id,
          fromUserName: user.name, fromUserAvatar: user.avatar || '',
          type: 'mention', postId, commentId,
        });
      }
    }
  }, [user, allUsers]);

  // Mention + hashtag autocomplete handler
  const handleTextChange = useCallback((text: string, setter: (t: string) => void) => {
    setter(text);
    const lastWord = text.split(/\s/).pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      const q = lastWord.slice(1).toLowerCase();
      setMentionSuggestions(allUsers.filter(u =>
        u.id !== user?.id && (
          u.name.toLowerCase().includes(q) ||
          (u.username && u.username.toLowerCase().includes(q))
        )
      ).slice(0, 6));
      setHashtagSuggestions([]);
    } else if (lastWord.startsWith('#') && lastWord.length > 1) {
      const q = lastWord.slice(1).toLowerCase();
      setMentionSuggestions([]);
      apiSuggestHashtags(q).then(r => {
        if (r.success && r.data) setHashtagSuggestions(r.data);
      }).catch(() => {});
    } else {
      setMentionSuggestions([]);
      setHashtagSuggestions([]);
    }
  }, [allUsers, user]);

  const insertMention = useCallback((username: string, currentText: string, setter: (t: string) => void) => {
    const words = currentText.split(/\s/);
    words[words.length - 1] = `@${username} `;
    setter(words.join(' '));
    setMentionSuggestions([]);
  }, []);

  const insertHashtag = useCallback((tag: string, currentText: string, setter: (t: string) => void) => {
    const words = currentText.split(/\s/);
    words[words.length - 1] = `#${tag} `;
    setter(words.join(' '));
    setHashtagSuggestions([]);
  }, []);

  // Check community restrictions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restrictions = (user as Record<string, unknown>)?.communityRestrictions as Record<string, boolean> | undefined;
  const canPost = !restrictions || restrictions.canPost !== false;
  const canComment = !restrictions || restrictions.canComment !== false;
  const canReply = !restrictions || restrictions.canReply !== false;

  const handlePost = async () => {
    if (!canPost) { alert(t('community.restricted_post')); return; }
    if (postType === 'post' && !newPost.trim()) return;
    if (postType === 'quiz' && !quizQuestion.trim()) return;
    setPosting(true);
    if (postType === 'quiz') {
      const db = await getDB();
      const postId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36);
      const quizHashtags = extractHashtags(quizQuestion + ' ' + newPost);
      const quizPost: Post = {
        id: postId, userId: user!.id, userName: user!.name, userAvatar: user!.avatar || '',
        content: newPost.trim() || '', image: postImage, type: 'quiz',
        quizQuestion: quizQuestion.trim(), quizAnswer: quizAnswer,
        quizStats: { trueCount: 0, falseCount: 0 },
        hashtags: quizHashtags,
        pinned: false,
        likesCount: 0, commentsCount: 0,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      await db.put('posts', quizPost);
      indexHashtags(quizHashtags).catch(() => {});
      await sendMentionNotifs(quizQuestion, postId);
      setQuizQuestion(''); setQuizAnswer(true); setNewPost(''); setPostType('post'); setPostImage('');
      await loadPosts();
    } else {
      const ok = await createPost(newPost, postImage);
      if (ok) {
        // Find new post and send mentions
        await sendMentionNotifs(newPost);
      }
      setNewPost(''); setPostImage('');
    }
    setPosting(false);
  };

  const handleLike = async (postId: string) => {
    const result = await toggleLike(postId);
    if (result) {
      setLikes(prev => ({ ...prev, [postId]: result.liked }));
      // Update likers list optimistically
      if (user) {
        setPostLikers(prev => {
          const current = prev[postId] || [];
          if (result.liked) {
            // Add current user if not already present
            if (!current.find(l => l.userId === user.id)) {
              return { ...prev, [postId]: [...current, { userId: user.id, userName: user.name, userAvatar: user.avatar || '' }] };
            }
          } else {
            return { ...prev, [postId]: current.filter(l => l.userId !== user.id) };
          }
          return prev;
        });
      }
      // Send like notification only when liking (not when un-liking)
      if (result.liked && user) {
        const post = posts.find(p => p.id === postId);
        if (post && post.userId !== user.id) {
          apiCreateCommunityNotif({
            toUserId: post.userId, fromUserId: user.id,
            fromUserName: user.name, fromUserAvatar: user.avatar || '',
            type: 'like', postId,
          }).then(() => loadCommunityNotifs()).catch(() => {});
        }
      }
    }
  };

  const toggleCommentLike = (commentId: string) => {
    setCommentLikes(prev => {
      const wasLiked = prev[commentId];
      const updated = { ...prev, [commentId]: !wasLiked };
      if (user) localStorage.setItem(`commentLikes_${user.id}`, JSON.stringify(updated));
      setCommentLikeCounts(prevCounts => ({
        ...prevCounts,
        [commentId]: Math.max(0, (prevCounts[commentId] || 0) + (wasLiked ? -1 : 1)),
      }));
      return updated;
    });
  };

  const openComments = async (postId: string) => {
    // Locked posts: still allow viewing existing comments, just block adding new ones
    if (showComments === postId) { setShowComments(null); return; }
    const c = await getComments(postId);
    setComments(c); setShowComments(postId); setReplyingTo(null); setReplyContent('');
  };

  const handleComment = async (postId: string) => {
    if (!canComment) { alert(t('community.restricted_comment')); return; }
    if (!newComment.trim()) return;
    await createComment(postId, newComment);
    // Send mention notifications
    await sendMentionNotifs(newComment, postId);
    // Send comment notification to post owner
    const post = posts.find(p => p.id === postId);
    if (post && post.userId !== user?.id) {
      await api.apiCreateCommunityNotif({
        toUserId: post.userId, fromUserId: user!.id,
        fromUserName: user!.name, fromUserAvatar: user!.avatar || '',
        type: 'comment', postId,
      });
    }
    setNewComment('');
    const c = await getComments(postId); setComments(c);
    if (detailPostId === postId) setDetailComments(c);
    await loadPosts();
    loadCommunityNotifs();
  };

  const handleReply = async (postId: string) => {
    if (!canReply) { alert(t('community.restricted_reply')); return; }
    if (!replyContent.trim() || !replyingTo) return;
    await createComment(postId, `REPLY_TO:${replyingTo.commentId}:${replyContent}`);
    await sendMentionNotifs(replyContent, postId);
    // Notify the parent comment author
    const allC = await getComments(postId);
    const parent = allC.find(c => c.id === replyingTo.commentId);
    if (parent && parent.userId !== user?.id) {
      await api.apiCreateCommunityNotif({
        toUserId: parent.userId, fromUserId: user!.id,
        fromUserName: user!.name, fromUserAvatar: user!.avatar || '',
        type: 'reply', postId, commentId: replyingTo.commentId,
      });
    }
    setReplyContent(''); setReplyingTo(null);
    const c = await getComments(postId); setComments(c);
    if (detailPostId === postId) setDetailComments(c);
    await loadPosts();
  };

  const handleDeleteItem = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === 'post') {
      await deletePost(confirmDelete.id);
    } else {
      await deleteComment(confirmDelete.id);
      if (showComments) { const c = await getComments(showComments); setComments(c); }
      if (detailPostId) { const c = await getComments(detailPostId); setDetailComments(c); }
      await loadPosts();
    }
    setConfirmDelete(null);
  };

  const handleEdit = async (id: string) => { await updatePost(id, editContent); setEditingPost(null); };

  const handleReport = async () => {
    if (!reportModal || !reportReason.trim()) return;
    await createReport(reportModal.type, reportModal.id, reportReason);
    setReportModal(null); setReportReason('');
    setReportSuccess(true); setTimeout(() => setReportSuccess(false), 3000);
  };

  const handleQuizAnswer = async (postId: string, answer: boolean) => {
    if (quizVoted[postId]) return;
    const newVoted = { ...quizVoted, [postId]: true };
    const newSelected = { ...quizSelected, [postId]: answer };
    setQuizVoted(newVoted);
    setQuizSelected(newSelected);
    if (user) {
      localStorage.setItem(`quizVotes_${user.id}`, JSON.stringify({ voted: newVoted, selected: newSelected }));
    }
    const db = await getDB();
    const post = await db.get('posts', postId);
    if (post) {
      const stats = post.quizStats || { trueCount: 0, falseCount: 0 };
      if (answer) stats.trueCount++; else stats.falseCount++;
      post.quizStats = stats;
      await db.put('posts', post);
      await loadPosts();
    }
  };

  const togglePinPost = async (postId: string) => {
    const { token } = useAuthStore.getState();
    if (!token) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    await api.apiPinPost(token, postId, !post.pinned);
    await loadPosts(postSortMode, activeHashtag ?? undefined);
  };

  const toggleFollow = async (userId: string) => {
    if (!user) return;
    const wasFollowing = following.includes(userId);
    const newF = wasFollowing ? following.filter(id => id !== userId) : [...following, userId];
    setFollowing(newF);
    localStorage.setItem(`following_${user.id}`, JSON.stringify(newF));
    // Send follow notification when newly following
    if (!wasFollowing) {
      await apiCreateCommunityNotif({
        toUserId: userId, fromUserId: user.id,
        fromUserName: user.name, fromUserAvatar: user.avatar || '',
        type: 'follow',
      });
    }
    // Update viewUserData followers count in real-time
    if (viewUserId === userId && viewUserData) {
      setViewUserData(prev => prev ? {
        ...prev,
        followersCount: prev.followersCount + (wasFollowing ? -1 : 1),
      } : prev);
    }
  };

  const toggleSavePost = (postId: string) => {
    if (!user) return;
    const isSaved = savedPosts.includes(postId);
    const newSaved = isSaved ? savedPosts.filter(id => id !== postId) : [...savedPosts, postId];
    setSavedPosts(newSaved);
    localStorage.setItem(`savedPosts_${user.id}`, JSON.stringify(newSaved));
  };

  const openUserProfile = useCallback((userId: string) => {
    if (userId === user?.id) return;
    navigate(`/profile/${userId}`);
  }, [user, navigate]);

  const openPostDetail = async (postId: string) => {
    const c = await getComments(postId);
    setDetailComments(c); setDetailPostId(postId); setShowComments(postId); setComments(c);
  };

  // Auto-open a post when navigated from ProfilePage
  const openedPostIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!openPostId || posts.length === 0) return;
    if (openedPostIdRef.current === openPostId) return;
    openedPostIdRef.current = openPostId;
    openPostDetail(openPostId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openPostId, posts.length]);

  const toggleExpandText = (postId: string) => {
    setExpandedTexts(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const rootComments = comments.filter(c => !isReply(c));
  const detailRootComments = detailComments.filter(c => !isReply(c));
  const getReplies = (commentId: string, cmts: Comment[]) => cmts.filter(c => getParentId(c) === commentId);
  const isAdminUser = user?.role === 'admin' || user?.role === 'manager';

  // Posts from store are already sorted by the API (hot/new/viral) and hashtag-filtered
  const sortedPosts = posts;

  // Filter posts by tab then by search query
  const tabPosts = activeTab === 'following'
    ? sortedPosts.filter(p => following.includes(p.userId) || p.userId === user?.id)
    : sortedPosts;
  const filteredPosts = searchQuery.trim()
    ? tabPosts.filter(p => {
        const q = searchQuery.toLowerCase();
        return (p.content?.toLowerCase().includes(q)) ||
               (p.quizQuestion?.toLowerCase().includes(q)) ||
               (p.userName?.toLowerCase().includes(q));
      })
    : tabPosts;

  const UserAvatar = ({ avatar, name, userId, size = 'md', onClick }: { avatar?: string; name: string; userId?: string; size?: 'sm' | 'md' | 'lg'; onClick?: () => void }) => {
    // Always use the freshest avatar from allUsers
    const liveAvatar = userId ? (allUsers.find(u => u.id === userId)?.avatar || avatar || '') : (avatar || '');
    const sizeClass = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-16 h-16' : 'w-10 h-10';
    const textSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-xl' : 'text-sm';
    return (
      <div className={cn(sizeClass, 'rounded-full flex items-center justify-center shrink-0 overflow-hidden', onClick && 'cursor-pointer')}
        style={{ background: liveAvatar ? undefined : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        onClick={onClick}>
        {liveAvatar ? (
          <img src={liveAvatar} className={cn(sizeClass, 'rounded-full object-cover')} alt="" />
        ) : (
          <span className={cn(textSize, 'font-bold text-white')}>{name.charAt(0)}</span>
        )}
      </div>
    );
  };

  const getUserUsername = (userId: string) => allUsers.find(u => u.id === userId)?.username || '';

  const UserName = ({ userId, name, className, onClick }: { userId: string; name: string; className?: string; onClick?: () => void }) => (
    <span className="inline-flex items-center gap-1">
      <button className={cn('font-semibold hover:text-primary-600', className)} onClick={onClick}>{name}</button>
      {isVerified(userId) && <VerifiedBadge size="xs" tooltip />}
    </span>
  );

  // Render hashtag pills for a post
  const renderHashtagPills = (post: Post) => {
    if (!post.hashtags || post.hashtags.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mb-3">
        {post.hashtags.map(tag => (
          <button
            key={tag}
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-full font-medium transition-colors',
              activeHashtag === tag
                ? 'bg-primary-500 text-white'
                : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
            )}
            onClick={() => setActiveHashtag(activeHashtag === tag ? null : tag)}
          >
            #{tag}
          </button>
        ))}
      </div>
    );
  };

  // Render text with "show more" for long posts + @mention and #hashtag highlighting
  const renderPostText = (post: Post) => {
    const text = post.content;
    if (!text) return null;
    const isLong = text.length > 180 || text.split('\n').length > 3;
    const isExpanded = expandedTexts[post.id];

    const renderText = (t: string) => (
      <p dir={getTextDir(text)} className="text-surface-700 text-sm leading-relaxed whitespace-pre-wrap mb-3">
        {renderWithMentionsAndHashtags(t, handleMentionClick, handleHashtagClick)}
      </p>
    );

    if (!isLong) return renderText(text);

    if (isExpanded) {
      return (
        <div className="mb-3">
          <p dir={getTextDir(text)} className="text-surface-700 text-sm leading-relaxed whitespace-pre-wrap">
            {renderWithMentionsAndHashtags(text, handleMentionClick, handleHashtagClick)}
          </p>
          <button className="text-primary-500 text-xs font-medium mt-1 hover:text-primary-700" onClick={() => toggleExpandText(post.id)}>
            {t('community.show_less')}
          </button>
        </div>
      );
    }

    const truncated = text.length > 180 ? text.slice(0, 180) + '...' : text.split('\n').slice(0, 3).join('\n') + '...';
    return (
      <div className="mb-3">
        <p dir={getTextDir(text)} className="text-surface-700 text-sm leading-relaxed whitespace-pre-wrap">
          {renderWithMentionsAndHashtags(truncated, handleMentionClick, handleHashtagClick)}
        </p>
        <button className="text-primary-500 text-xs font-medium mt-1 hover:text-primary-700" onClick={() => toggleExpandText(post.id)}>
          {t('community.show_more')}
        </button>
      </div>
    );
  };

  const renderComment = (c: Comment, postId: string, cmts: Comment[], isDetail: boolean) => {
    const replies = getReplies(c.id, cmts);
    const visibleReplies = isDetail ? replies : replies.slice(0, 3);
    const isPostLocked = posts.find(p => p.id === postId)?.locked || false;
    const hasMoreReplies = !isDetail && replies.length > 3;

    return (
      <div key={c.id} className="space-y-2">
        <div className="flex items-start gap-2">
          <UserAvatar avatar={c.userAvatar} name={c.userName} userId={c.userId} size="sm" onClick={() => openUserProfile(c.userId)} />
          <div className="flex-1 bg-white rounded-xl px-3 py-2">
            <div className="flex items-center justify-between">
              <UserName userId={c.userId} name={c.userName} className="text-xs text-surface-800" onClick={() => openUserProfile(c.userId)} />
              <span className="text-[10px] text-surface-400">{relativeTime(c.createdAt, uiLang)}</span>
            </div>
            <p dir={getTextDir(c.content)} className="text-sm text-surface-600 mt-0.5">{renderWithMentionsAndHashtags(c.content, handleMentionClick, handleHashtagClick)}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <button className={cn('flex items-center gap-0.5 text-[11px]', commentLikes[c.id] ? 'text-red-500' : 'text-surface-400 hover:text-red-400')}
                onClick={() => toggleCommentLike(c.id)}>
                <Icon name="favorite" size={13} filled={commentLikes[c.id]} />
                {(commentLikeCounts[c.id] || 0) > 0 && <span>{commentLikeCounts[c.id]}</span>}
              </button>
              {!isPostLocked && (
                <button className="text-[11px] text-surface-400 hover:text-primary-500 flex items-center gap-0.5"
                  onClick={() => setReplyingTo({ commentId: c.id, userName: c.userName })}>
                  <Icon name="reply" size={13} /> رد
                  {replies.length > 0 && <span className="text-[10px] bg-primary-50 text-primary-500 px-1 rounded-full">{replies.length}</span>}
                </button>
              )}
              <button className="text-[11px] text-surface-400 hover:text-orange-500" onClick={() => setReportModal({ type: 'comment', id: c.id })}>
                <Icon name="flag" size={12} />
              </button>
              {(c.userId === user?.id || isAdminUser) && (
                <button className="text-[11px] text-surface-400 hover:text-danger-500"
                  onClick={() => setConfirmDelete({ type: 'comment', id: c.id })}>
                  <Icon name="delete" size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {visibleReplies.length > 0 && (
          <div className="mr-8 space-y-2 border-r-2 border-primary-100 pr-3">
            {visibleReplies.map(r => (
              <div key={r.id} className="flex items-start gap-2">
                <UserAvatar avatar={r.userAvatar} name={r.userName} userId={r.userId} size="sm" onClick={() => openUserProfile(r.userId)} />
                <div className="flex-1 bg-white rounded-xl px-3 py-2">
                  <div className="flex items-center gap-1">
                    <UserName userId={r.userId} name={r.userName} className="text-xs text-surface-800" onClick={() => openUserProfile(r.userId)} />
                    <Icon name="arrow_back" size={10} className="text-surface-300" />
                    <span className="text-[10px] text-primary-500">{c.userName}</span>
                    <span className="text-[10px] text-surface-400 mr-auto">{relativeTime(r.createdAt, uiLang)}</span>
                  </div>
                  <p dir={getTextDir(getReplyContent(r))} className="text-sm text-surface-600 mt-0.5">{renderWithMentionsAndHashtags(getReplyContent(r), handleMentionClick, handleHashtagClick)}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <button className={cn('flex items-center gap-0.5 text-[11px]', commentLikes[r.id] ? 'text-red-500' : 'text-surface-400 hover:text-red-400')}
                      onClick={() => toggleCommentLike(r.id)}>
                      <Icon name="favorite" size={13} filled={commentLikes[r.id]} />
                      {(commentLikeCounts[r.id] || 0) > 0 && <span>{commentLikeCounts[r.id]}</span>}
                    </button>
                    <button className="text-[11px] text-surface-400 hover:text-orange-500" onClick={() => setReportModal({ type: 'comment', id: r.id })}>
                      <Icon name="flag" size={12} />
                    </button>
                    {(r.userId === user?.id || isAdminUser) && (
                      <button className="text-[11px] text-surface-400 hover:text-danger-500"
                        onClick={() => setConfirmDelete({ type: 'reply', id: r.id })}>
                        <Icon name="delete" size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {hasMoreReplies && (
              <button className="text-xs text-primary-500 font-medium mr-8 hover:text-primary-700"
                onClick={() => openPostDetail(postId)}>
                {t('community.show_all_replies')} ({replies.length})
              </button>
            )}
          </div>
        )}

        {replyingTo?.commentId === c.id && !isPostLocked && (
          <div className="mr-8 flex gap-2 items-center">
            <div className="flex-1 relative">
              <input dir="auto" className="w-full border border-primary-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-100 pr-16"
                placeholder={`${t('community.reply')} ${replyingTo.userName}...`} value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleReply(isDetail ? detailPostId! : postId); }}
                autoFocus />
              <button className="absolute left-1 top-1/2 -translate-y-1/2 text-xs text-surface-400 hover:text-surface-600 px-2"
                onClick={() => { setReplyingTo(null); setReplyContent(''); }}>{t('common.cancel')}</button>
            </div>
            <Button size="sm" onClick={() => handleReply(isDetail ? detailPostId! : postId)} disabled={!replyContent.trim()}>
              <Icon name="send" size={14} />
            </Button>
          </div>
        )}
      </div>
    );
  };

  const renderPost = (post: Post, showAllComments: boolean = false) => {
    const isQuiz = post.type === 'quiz';
    const stats = post.quizStats || { trueCount: 0, falseCount: 0 };
    const totalAns = stats.trueCount + stats.falseCount;
    const truePct = totalAns > 0 ? Math.round((stats.trueCount / totalAns) * 100) : 50;
    const falsePct = totalAns > 0 ? Math.round((stats.falseCount / totalAns) * 100) : 50;
    const currentCmts = showAllComments ? detailRootComments : rootComments;
    const currentAllCmts = showAllComments ? detailComments : comments;
    const activePost = showAllComments ? detailPostId : showComments;
    const previewCmts = showAllComments ? currentCmts : currentCmts.slice(0, 3);
    const hasMoreCmts = !showAllComments && currentCmts.length > 3;
    const hasVoted = quizVoted[post.id] || false;

    return (
      <div id={!showAllComments ? `post-${post.id}` : undefined} className={cn(
        'bg-white rounded-2xl border overflow-hidden',
        post.pinned ? 'border-amber-200 ring-1 ring-amber-100' :
        post.featured ? 'border-blue-200 ring-1 ring-blue-100' :
        'border-surface-100'
      )}>
        {post.pinned && (
          <div className="bg-amber-50 px-4 py-1.5 flex items-center gap-1.5 border-b border-amber-100">
            <Icon name="push_pin" size={14} className="text-amber-500" filled />
            <span className="text-xs font-semibold text-amber-600">{t('community.pinned')}</span>
          </div>
        )}
        {post.featured && !post.pinned && (
          <div className="bg-blue-50 px-4 py-1.5 flex items-center gap-1.5 border-b border-blue-100">
            <Icon name="star" size={14} className="text-blue-500" filled />
            <span className="text-xs font-semibold text-blue-600">{t('community.featured')}</span>
          </div>
        )}
        {post.locked && (
          <div className="bg-surface-50 px-4 py-1 flex items-center gap-1.5 border-b border-surface-100">
            <Icon name="lock" size={12} className="text-surface-400" />
            <span className="text-[11px] text-surface-400">{t('community.comments_locked_label')}</span>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <UserAvatar avatar={post.userAvatar} name={post.userName} userId={post.userId} size="md" onClick={() => openUserProfile(post.userId)} />
              <div>
                <div className="flex items-center gap-1">
                  <UserName userId={post.userId} name={post.userName} className="text-sm text-surface-900" onClick={() => openUserProfile(post.userId)} />
                  {isQuiz && <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">{t('community.quiz_badge')}</span>}
                </div>
                {getUserUsername(post.userId) && (
                  <p className="text-[11px] text-surface-400">@{getUserUsername(post.userId)}</p>
                )}
                <p className="text-xs text-surface-400">{relativeTime(post.createdAt, uiLang)}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {isAdminUser && (
                <>
                  <button className={cn('p-1.5 rounded-lg hover:bg-surface-100', post.pinned ? 'text-amber-500' : 'text-surface-400')}
                    onClick={() => togglePinPost(post.id)} title={post.pinned ? 'Rimuovi pin' : 'Fissa'}>
                    <Icon name="push_pin" size={18} filled={post.pinned} />
                  </button>
                  <button className={cn('p-1.5 rounded-lg hover:bg-surface-100', post.featured ? 'text-blue-500' : 'text-surface-400')}
                    onClick={async () => { const { token } = useAuthStore.getState(); if (token) { await api.apiFeaturePost(token, post.id, !post.featured); loadPosts(postSortMode, activeHashtag ?? undefined); } }}
                    title={post.featured ? 'Togli evidenza' : 'Evidenzia'}>
                    <Icon name="star" size={18} filled={post.featured} />
                  </button>
                  <button className={cn('p-1.5 rounded-lg hover:bg-surface-100', post.locked ? 'text-surface-600' : 'text-surface-400')}
                    onClick={async () => { const { token } = useAuthStore.getState(); if (token) { await api.apiLockPost(token, post.id, !post.locked); loadPosts(postSortMode, activeHashtag ?? undefined); } }}
                    title={post.locked ? 'Sblocca commenti' : 'Blocca commenti'}>
                    <Icon name={post.locked ? 'lock' : 'lock_open'} size={18} />
                  </button>
                </>
              )}
              {(post.userId === user?.id || isAdminUser) && (
                <>
                  {post.userId === user?.id && !isQuiz && (
                    <button className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400" onClick={() => { setEditingPost(post.id); setEditContent(post.content); }}>
                      <Icon name="edit" size={18} />
                    </button>
                  )}
                  <button className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400" onClick={() => setConfirmDelete({ type: 'post', id: post.id })}>
                    <Icon name="delete" size={18} />
                  </button>
                </>
              )}
              <button className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400" onClick={() => setReportModal({ type: 'post', id: post.id })}>
                <Icon name="flag" size={18} />
              </button>
            </div>
          </div>

          {editingPost === post.id ? (
            <div className="space-y-2">
              <textarea dir="auto" className="w-full border border-surface-200 rounded-xl p-3 text-sm resize-none" rows={3} value={editContent} onChange={e => setEditContent(e.target.value)} />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={() => setEditingPost(null)}>{t('common.cancel')}</Button>
                <Button size="sm" onClick={() => handleEdit(post.id)}>{t('common.save')}</Button>
              </div>
            </div>
          ) : (
            <>{renderPostText(post)}</>
          )}

          {isQuiz && post.quizQuestion && (
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 mt-2">
              <p dir={getTextDir(post.quizQuestion)} className="text-sm font-semibold text-purple-900 mb-3">{post.quizQuestion}</p>
              {hasVoted ? (
                <div className="space-y-2">
                  <div className={cn('flex items-center justify-between p-2.5 rounded-lg border', post.quizAnswer === true ? 'bg-success-50 border-success-200' : quizSelected[post.id] === true ? 'bg-danger-50 border-danger-200' : 'bg-white border-surface-200')}>
                    <span className="text-sm font-medium">{t('community.quiz_correct_opt')}</span>
                    <div className="flex items-center gap-2">
                      {post.quizAnswer === true && <Icon name="check_circle" size={16} className="text-success-500" filled />}
                      <div className="w-20 bg-surface-200 rounded-full h-1.5"><div className="bg-primary-500 rounded-full h-1.5" style={{ width: `${truePct}%` }} /></div>
                      <span className="text-xs text-surface-600 w-8 text-left">{truePct}%</span>
                    </div>
                  </div>
                  <div className={cn('flex items-center justify-between p-2.5 rounded-lg border', post.quizAnswer === false ? 'bg-success-50 border-success-200' : quizSelected[post.id] === false ? 'bg-danger-50 border-danger-200' : 'bg-white border-surface-200')}>
                    <span className="text-sm font-medium">{t('community.quiz_wrong_opt')}</span>
                    <div className="flex items-center gap-2">
                      {post.quizAnswer === false && <Icon name="check_circle" size={16} className="text-success-500" filled />}
                      <div className="w-20 bg-surface-200 rounded-full h-1.5"><div className="bg-primary-500 rounded-full h-1.5" style={{ width: `${falsePct}%` }} /></div>
                      <span className="text-xs text-surface-600 w-8 text-left">{falsePct}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-surface-400 text-center mt-1">{totalAns} {t('community.quiz_voted')}</p>
                  {quizSelected[post.id] !== post.quizAnswer && (
                    <div className="bg-danger-50 rounded-lg p-2 border border-danger-100 mt-2">
                      <p className="text-xs text-danger-600 flex items-center gap-1"><Icon name="info" size={14} /> {t('community.quiz_wrong_feedback')} {post.quizAnswer ? t('community.quiz_correct_opt') : t('community.quiz_wrong_opt')}</p>
                    </div>
                  )}
                  {quizSelected[post.id] === post.quizAnswer && (
                    <div className="bg-success-50 rounded-lg p-2 border border-success-100 mt-2">
                      <p className="text-xs text-success-600 flex items-center gap-1"><Icon name="check_circle" size={14} /> {t('community.quiz_right_feedback')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    className="py-2 px-3 rounded-xl border-2 border-surface-900 bg-teal-50 hover:bg-teal-100 text-surface-900 transition-all font-semibold text-sm text-center"
                    onClick={() => handleQuizAnswer(post.id, true)}
                  >
                    {t('community.correct_quiz')}
                  </button>
                  <button
                    className="py-2 px-3 rounded-xl border-2 border-surface-900 bg-rose-50 hover:bg-rose-100 text-surface-900 transition-all font-semibold text-sm text-center"
                    onClick={() => handleQuizAnswer(post.id, false)}
                  >
                    {t('community.wrong_quiz')}
                  </button>
                </div>
              )}
            </div>
          )}

          {post.image && <img src={post.image} alt="" className="mt-3 rounded-xl w-full" />}
        </div>

        <div className="border-t border-surface-100 px-5 py-3 flex items-center gap-3">
          <button className={cn('flex items-center gap-1 text-sm', likes[post.id] ? 'text-red-500' : 'text-surface-400 hover:text-red-400')} onClick={() => handleLike(post.id)}>
            <Icon name="favorite" size={20} filled={likes[post.id]} />{post.likesCount}
          </button>
          {/* Liker avatars */}
          {(postLikers[post.id] || []).length > 0 && (
            <button
              className="flex items-center gap-0.5 hover:opacity-80 transition-opacity"
              onClick={() => setLikersModal({ postId: post.id, likers: postLikers[post.id] || [] })}
              title={t('community.likers_title')}>
              <div className="flex -space-x-1.5 rtl:space-x-reverse">
                {(postLikers[post.id] || []).slice(0, 3).map((liker, i) => (
                  <div key={i} className="w-5 h-5 rounded-full border-2 border-white overflow-hidden shrink-0 shadow-sm"
                    style={{ zIndex: 3 - i }}>
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
          <button
            className={cn('flex items-center gap-1 text-sm', post.locked ? 'text-surface-400 hover:text-surface-600' : 'text-surface-400 hover:text-primary-500')}
            onClick={() => openComments(post.id)}
            title={post.locked ? t('community.comments_locked_label') : undefined}>
            <Icon name={post.locked ? 'lock' : 'chat_bubble'} size={20} />{post.commentsCount}
          </button>
          <button
            className={cn('flex items-center gap-1 text-sm mr-auto', savedPosts.includes(post.id) ? 'text-primary-500' : 'text-surface-400 hover:text-primary-400')}
            onClick={() => toggleSavePost(post.id)}
            title={savedPosts.includes(post.id) ? t('community.unsave_post') : t('community.save_post')}>
            <Icon name="bookmark" size={20} filled={savedPosts.includes(post.id)} />
          </button>
          {!showAllComments && post.commentsCount > 3 && (
            <button className="text-xs text-primary-500 font-medium hover:text-primary-700" onClick={() => openPostDetail(post.id)}>
              {t('community.view_all_comments')}
            </button>
          )}
        </div>

        {activePost === post.id && (
          <div className="border-t border-surface-100 p-4 bg-surface-50 space-y-3">
            {post.locked && (
              <div className="flex items-center gap-2 bg-surface-100 rounded-xl px-3 py-2 border border-surface-200">
                <Icon name="lock" size={14} className="text-surface-400" />
                <span className="text-xs text-surface-500">{t('community.comments_locked_notice')}</span>
              </div>
            )}
            {previewCmts.map(c => renderComment(c, post.id, currentAllCmts, showAllComments))}
            {hasMoreCmts && (
              <button className="w-full text-center text-sm text-primary-500 font-medium py-2 hover:text-primary-700" onClick={() => openPostDetail(post.id)}>
                {t('community.view_all_comments')} ({currentCmts.length})
              </button>
            )}
            {!post.locked && (
              <div className="flex gap-2 items-center relative">
                <UserAvatar avatar={user?.avatar} name={user?.name || '?'} size="sm" />
                <div className="flex-1 relative">
                  <input dir="auto" className="w-full border border-surface-200 rounded-lg px-3 py-2 text-sm focus:border-primary-500" placeholder={t('community.comment_placeholder')} value={newComment} onChange={e => handleTextChange(e.target.value, setNewComment)}
                    onKeyDown={e => { if (e.key === 'Enter') handleComment(post.id); }} />
                  {mentionSuggestions.length > 0 && <MentionDropdown suggestions={mentionSuggestions} onSelect={u => insertMention(u.username || u.name, newComment, setNewComment)} />}
                </div>
                <Button size="sm" onClick={() => handleComment(post.id)} disabled={!newComment.trim()}>
                  <Icon name="send" size={14} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Post detail view
  if (detailPostId) {
    const post = posts.find(p => p.id === detailPostId);
    if (!post) return null;
    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => { setDetailPostId(null); setDetailComments([]); }} className="flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-4">
          <Icon name="arrow_forward" size={20} className="ltr:rotate-180" /><span className="text-sm">{t('community.back')}</span>
        </button>
        {renderPost(post, true)}
        {/* Likers Modal */}
        {likersModal && (
          <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLikersModal(null)}>
            <div className="bg-white rounded-2xl w-full max-w-xs max-h-[60vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
                <h3 className="font-bold text-surface-900 flex items-center gap-2">
                  <Icon name="favorite" size={18} className="text-red-500" filled />
                  {likersModal.likers.length} {t('community.likers_title')}
                </h3>
                <button onClick={() => setLikersModal(null)} className="w-8 h-8 rounded-xl hover:bg-surface-100 flex items-center justify-center transition-colors">
                  <Icon name="close" size={18} className="text-surface-500" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 space-y-3">
                {likersModal.likers.length === 0 && (
                  <p className="text-sm text-surface-400 text-center py-4">{t('community.no_likers')}</p>
                )}
                {likersModal.likers.map(liker => (
                  <div key={liker.userId} className="flex items-center gap-3 hover:bg-surface-50 rounded-xl p-2 transition-colors">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm cursor-pointer"
                      style={{ background: liker.userAvatar ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                      onClick={() => { setLikersModal(null); openUserProfile(liker.userId); }}>
                      {liker.userAvatar ? (
                        <img src={liker.userAvatar} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-sm font-bold text-white">{liker.userName.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-surface-800 flex-1 cursor-pointer"
                      onClick={() => { setLikersModal(null); openUserProfile(liker.userId); }}>{liker.userName}</span>
                    {liker.userId !== user?.id && (
                      <button
                        onClick={e => { e.stopPropagation(); toggleFollow(liker.userId); }}
                        className={cn('shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all',
                          following.includes(liker.userId)
                            ? 'bg-surface-100 text-surface-600 hover:bg-danger-50 hover:text-danger-600 border border-surface-200'
                            : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm')}>
                        {following.includes(liker.userId) ? t('community.following_btn') : t('community.follow_btn')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unreadNotifs = (communityNotifs as any[]).filter((n: Record<string, unknown>) => !n.read).length;

  const notifIcon: Record<string, string> = {
    like: 'favorite', comment: 'chat_bubble', reply: 'reply',
    mention: 'alternate_email', follow: 'person_add',
  };
  const notifColor: Record<string, string> = {
    like: 'text-red-500 bg-red-50', comment: 'text-blue-500 bg-blue-50',
    reply: 'text-green-500 bg-green-50', mention: 'text-purple-500 bg-purple-50',
    follow: 'text-primary-500 bg-primary-50',
  };

  const handleNotifClick = (n: Record<string, unknown>) => {
    markNotifRead(String(n.id));
    setShowNotifs(false);
    if (n.type === 'follow' && n.fromUserId) {
      openUserProfile(String(n.fromUserId));
      return;
    }
    if (n.postId) {
      openPostDetail(String(n.postId));
      setTimeout(() => {
        const el = document.getElementById(`post-${String(n.postId)}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">{t('community.title')}</h1>
          <p className="text-surface-500 text-sm">{t('community.desc')}</p>
        </div>
        {/* Search + Bookmarks + Trending + Notifications */}
        <div className="flex items-center gap-2">
          {/* Search button */}
          <button
            className={cn('w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-200 transition-colors', showSearch ? 'bg-primary-100' : 'bg-surface-100')}
            onClick={() => { setShowSearch(s => !s); if (showSearch) setSearchQuery(''); setShowBookmarks(false); setShowTrending(false); setShowNotifs(false); }}
            title={t('community.search_placeholder')}>
            <Icon name="search" size={22} className={showSearch ? 'text-primary-600' : 'text-surface-600'} />
          </button>
          {/* Bookmarks */}
          <div className="relative" ref={bookmarkRef}>
            <button
              className={cn('relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-200 transition-colors', showBookmarks ? 'bg-primary-100' : 'bg-surface-100')}
              onClick={() => { setShowBookmarks(!showBookmarks); setShowNotifs(false); }}
              title={t('community.bookmarks_title')}>
              <Icon name="bookmark" size={22} className={showBookmarks ? 'text-primary-600' : 'text-surface-600'} filled={showBookmarks} />
              {savedPosts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{savedPosts.length > 9 ? '9+' : savedPosts.length}</span>
              )}
            </button>
            {showBookmarks && (
              <div className="absolute end-0 top-12 bg-white rounded-2xl shadow-2xl border border-surface-100 z-50 overflow-hidden" style={{ width: 320 }}>
                <div className="flex items-center justify-between p-4 border-b border-surface-100 bg-surface-50">
                  <div className="flex items-center gap-2">
                    <Icon name="bookmark" size={18} className="text-primary-500" filled />
                    <h3 className="font-bold text-surface-900">{t('community.bookmarks_title')}</h3>
                    <span className="bg-primary-100 text-primary-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{savedPosts.length}</span>
                  </div>
                  {savedPosts.length > 0 && (
                    <button className="text-xs text-danger-500 hover:text-danger-700 font-medium"
                      onClick={() => setConfirmClearBookmarks(true)}>
                      {t('community.clear_all')}
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto divide-y divide-surface-50">
                  {savedPosts.length === 0 ? (
                    <div className="p-8 text-center">
                      <Icon name="bookmark_border" size={36} className="text-surface-200 mx-auto mb-2" />
                      <p className="text-sm text-surface-400">{t('community.no_saved')}</p>
                      <p className="text-xs text-surface-300 mt-1">{t('community.press_to_save')}</p>
                    </div>
                  ) : (() => {
                    const savedList = posts.filter(p => savedPosts.includes(p.id));
                    return savedList.length === 0 ? (
                      <div className="p-6 text-center text-sm text-surface-400">{t('community.saved_unavailable')}</div>
                    ) : savedList.map(p => (
                      <div key={p.id}>
                        {confirmDeleteBookmarkId === p.id ? (
                          <div className="p-3 bg-danger-50 border-b border-danger-100">
                            <p className="text-xs font-semibold text-danger-700 mb-2 text-center">{t('community.confirm_remove_bookmark')}</p>
                            <div className="flex gap-2">
                              <button
                                className="flex-1 py-1.5 rounded-lg bg-danger-500 text-white text-xs font-bold hover:bg-danger-600 transition-colors"
                                onClick={e => { e.stopPropagation(); toggleSavePost(p.id); setConfirmDeleteBookmarkId(null); setBookmarkRemovedToast(true); setTimeout(() => setBookmarkRemovedToast(false), 2500); }}>
                                {t('community.delete_btn')}
                              </button>
                              <button
                                className="flex-1 py-1.5 rounded-lg bg-white border border-surface-200 text-xs font-medium text-surface-600 hover:bg-surface-50 transition-colors"
                                onClick={e => { e.stopPropagation(); setConfirmDeleteBookmarkId(null); }}>
                                {t('common.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 hover:bg-surface-50 cursor-pointer border-b border-surface-50 last:border-0" onClick={() => { openPostDetail(p.id); setShowBookmarks(false); }}>
                            <div className="flex items-start gap-2">
                              <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-primary-100 flex items-center justify-center">
                                {p.userAvatar ? <img src={p.userAvatar} className="w-full h-full object-cover" alt="" /> :
                                  <span className="text-[10px] font-bold text-primary-700">{p.userName.charAt(0)}</span>}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-surface-800">{p.userName}</p>
                                <p className="text-xs text-surface-500 line-clamp-2 mt-0.5">{p.content}</p>
                              </div>
                              <button className="p-1 rounded-lg hover:bg-danger-50 text-surface-300 hover:text-danger-500 shrink-0"
                                onClick={e => { e.stopPropagation(); setConfirmDeleteBookmarkId(p.id); }}>
                                <Icon name="close" size={14} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Trending Hashtags */}
          <div className="relative" ref={trendingRef}>
            <button
              className={cn('relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-surface-200 transition-colors', showTrending ? 'bg-primary-100' : 'bg-surface-100')}
              onClick={() => { setShowTrending(!showTrending); setShowBookmarks(false); setShowNotifs(false); }}
              title={t('community.trending_title')}>
              <Icon name="trending_up" size={22} className={showTrending ? 'text-primary-600' : 'text-surface-600'} filled={showTrending} />
            </button>
            {showTrending && (
              <div className="absolute end-0 top-12 bg-white rounded-2xl shadow-2xl border border-surface-100 z-50 overflow-hidden" style={{ width: 300 }}>
                <div className="flex items-center gap-2 p-4 border-b border-surface-100 bg-surface-50">
                  <Icon name="trending_up" size={18} className="text-primary-500" filled />
                  <h3 className="font-bold text-surface-900">{t('community.trending_title')}</h3>
                </div>
                <div className="p-3">
                  {trendingHashtags.length === 0 ? (
                    <div className="py-6 text-center">
                      <Icon name="tag" size={32} className="text-surface-200 mx-auto mb-2" />
                      <p className="text-sm text-surface-400">{t('community.no_trending')}</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {trendingHashtags.map(h => (
                        <button
                          key={h.id}
                          className={cn(
                            'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                            activeHashtag === h.tag
                              ? 'bg-primary-500 text-white border-primary-500'
                              : 'bg-surface-50 hover:bg-primary-50 text-surface-600 hover:text-primary-600 border-surface-200 hover:border-primary-200'
                          )}
                          onClick={() => { setActiveHashtag(activeHashtag === h.tag ? null : h.tag); setShowTrending(false); }}
                        >
                          <span className={activeHashtag === h.tag ? 'text-white/70' : 'text-primary-400'}>#</span>
                          {h.tag}
                          <span className={activeHashtag === h.tag ? 'text-white/60' : 'text-surface-400 text-[10px]'}>{h.postCount}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
          <button
            className="relative w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center hover:bg-surface-200 transition-colors"
            onClick={() => setShowNotifs(!showNotifs)}>
            <Icon name="notifications" size={22} className="text-surface-600" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute end-0 top-12 w-84 bg-white rounded-2xl shadow-2xl border border-surface-100 z-50 overflow-hidden" style={{ width: 320 }}>
              <div className="flex items-center justify-between p-4 border-b border-surface-100 bg-surface-50">
                <div className="flex items-center gap-2">
                  <Icon name="notifications" size={18} className="text-primary-500" filled />
                  <h3 className="font-bold text-surface-900">{t('community.notifications_title')}</h3>
                  {unreadNotifs > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadNotifs}</span>
                  )}
                </div>
                {unreadNotifs > 0 && (
                  <button className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => markAllNotifsRead()}>
                    {t('community.mark_read')}
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto divide-y divide-surface-50">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {(communityNotifs as any[]).length === 0 ? (
                  <div className="p-8 text-center">
                    <Icon name="notifications_none" size={36} className="text-surface-200 mx-auto mb-2" />
                    <p className="text-sm text-surface-400">{t('community.no_notifications')}</p>
                  </div>
                ) : (communityNotifs as Record<string, unknown>[]).map(n => {
                  const type = String(n.type);
                  const colorClass = notifColor[type] || 'text-surface-500 bg-surface-100';
                  return (
                    <div key={String(n.id)}
                      className={cn('p-3 flex items-start gap-3 cursor-pointer transition-colors',
                        !n.read ? 'bg-primary-50/40 hover:bg-primary-50' : 'hover:bg-surface-50')}
                      onClick={() => handleNotifClick(n)}>
                      {/* Type icon */}
                      <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0', colorClass.split(' ')[1])}>
                        <Icon name={notifIcon[type] || 'notifications'} size={16} className={colorClass.split(' ')[0]} filled />
                      </div>
                      {/* Avatar */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          {n.fromUserAvatar ? (
                            <img src={String(n.fromUserAvatar)} className="w-5 h-5 rounded-full object-cover shrink-0" alt="" />
                          ) : (
                            <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-[8px] font-bold text-primary-700">{String(n.fromUserName || '?').charAt(0)}</span>
                            </div>
                          )}
                          <p className="text-xs text-surface-800 leading-snug">
                            <span className="font-semibold">{String(n.fromUserName)}</span>
                            {type === 'like' && ` ${t('community.notif_liked')}`}
                            {type === 'comment' && ` ${t('community.notif_commented')}`}
                            {type === 'reply' && ` ${t('community.notif_replied')}`}
                            {type === 'mention' && ` ${t('community.notif_mentioned')}`}
                            {type === 'follow' && ` ${t('community.notif_followed')}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-surface-400">{relativeTime(String(n.createdAt), uiLang)}</p>
                          {type === 'follow' && (
                            <span className="text-[10px] text-primary-500 font-medium flex items-center gap-0.5">
                              <Icon name="person" size={10} /> {t('community.open_profile')}
                            </span>
                          )}
                          {type !== 'follow' && !!n.postId && (
                            <span className="text-[10px] text-primary-500 font-medium flex items-center gap-0.5">
                              <Icon name="open_in_new" size={10} /> {t('community.open_post')}
                            </span>
                          )}
                        </div>
                      </div>
                      {!n.read && <div className="w-2 h-2 bg-primary-500 rounded-full shrink-0 mt-2 animate-pulse" />}
                    </div>
                  );
                })}
              </div>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(communityNotifs as any[]).length > 0 && (
                <div className="p-2 border-t border-surface-100 bg-surface-50 text-center">
                  <p className="text-[10px] text-surface-400">{t('community.notif_footer')}</p>
                </div>
              )}
            </div>
          )}
        </div>
        </div> {/* end buttons wrapper */}
      </div>

      {/* Search bar — expands when search button is active */}
      {showSearch && (
        <div className="mb-4">
          <div className="relative">
            <Icon name="search" size={18} className="absolute top-1/2 -translate-y-1/2 right-3 text-surface-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t('community.search_placeholder')}
              className="w-full bg-white border border-surface-200 rounded-xl pr-10 pl-10 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all"
              dir="auto"
              autoFocus
            />
            {searchQuery && (
              <button className="absolute top-1/2 -translate-y-1/2 left-3 text-surface-400 hover:text-surface-600" onClick={() => setSearchQuery('')}>
                <Icon name="close" size={18} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-xs text-surface-400 mt-1.5 pr-1">
              {filteredPosts.length === 0 ? t('community.no_results') : `${filteredPosts.length} ${t('community.results_count')}`}
            </p>
          )}
        </div>
      )}

      {reportSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-success-500 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <Icon name="check_circle" size={20} filled />
          <span className="text-sm font-medium">{t('community.report_success')}</span>
        </div>
      )}

      {bookmarkRemovedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-surface-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <Icon name="bookmark_remove" size={20} filled />
          <span className="text-sm font-medium">{t('community.bookmark_removed')}</span>
        </div>
      )}

      {/* Feed Sort Controls + Following toggle — single scrollable row */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-0.5 no-scrollbar">
        {([
          { mode: 'hot' as PostSortMode, icon: 'local_fire_department', label: t('community.sort_hot') },
          { mode: 'new' as PostSortMode, icon: 'schedule', label: t('community.sort_new') },
          { mode: 'viral' as PostSortMode, icon: 'trending_up', label: t('community.sort_viral') },
        ] as const).map(({ mode, icon, label }) => (
          <button
            key={mode}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border shrink-0',
              postSortMode === mode
                ? 'bg-primary-500 text-white border-primary-500'
                : 'bg-white text-surface-500 border-surface-200 hover:border-primary-300 hover:text-primary-600'
            )}
            onClick={() => setPostSortMode(mode)}
          >
            <Icon name={icon} size={14} filled={postSortMode === mode} />
            {label}
          </button>
        ))}

        {/* Following toggle button */}
        <button
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border shrink-0',
            activeTab === 'following'
              ? 'bg-primary-500 text-white border-primary-500'
              : 'bg-white text-surface-500 border-surface-200 hover:border-primary-300 hover:text-primary-600'
          )}
          onClick={() => setActiveTab(activeTab === 'following' ? 'discover' : 'following')}
        >
          <Icon name="people" size={14} filled={activeTab === 'following'} />
          {t('community.following_tab')}
          {following.length > 0 && (
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', activeTab === 'following' ? 'bg-white/20 text-white' : 'bg-primary-100 text-primary-600')}>
              {following.length}
            </span>
          )}
        </button>

        {activeHashtag && (
          <button
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium bg-primary-100 text-primary-700 border border-primary-200 mr-auto"
            onClick={() => setActiveHashtag(null)}
          >
            #{activeHashtag}
            <Icon name="close" size={12} />
          </button>
        )}
      </div>

      {/* New Post — compact composer */}
      <div className="bg-white rounded-2xl border border-surface-100 mb-6 overflow-hidden">
        {/* Row 1: avatar + type tabs */}
        <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
          <UserAvatar avatar={user?.avatar} name={user?.name || '?'} size="sm" />
          <div className="flex items-center gap-1">
            <button
              className={cn('flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                postType === 'post' ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200')}
              onClick={() => setPostType('post')}>
              <Icon name="edit_note" size={13} /> {t('community.post_type')}
            </button>
            <button
              className={cn('flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                postType === 'quiz' ? 'bg-purple-500 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200')}
              onClick={() => setPostType('quiz')}>
              <Icon name="quiz" size={13} /> {t('community.quiz_type')}
            </button>
          </div>
        </div>

        {/* Row 2: content */}
        <div className="px-3.5 pb-2">
          {postType === 'quiz' ? (
            <div className="space-y-2">
              <div className="relative">
                <textarea dir="auto" className="w-full border border-purple-200 rounded-xl px-3 py-2 text-sm resize-none focus:border-purple-400 focus:outline-none bg-purple-50/30" rows={2}
                  placeholder={t('community.quiz_q_placeholder')}
                  value={quizQuestion} onChange={e => handleTextChange(e.target.value, setQuizQuestion)} />
                {mentionSuggestions.length > 0 && <MentionDropdown suggestions={mentionSuggestions} onSelect={u => insertMention(u.username || u.name, quizQuestion, setQuizQuestion)} />}
              </div>
              <div className="flex gap-2">
                <button className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all', quizAnswer ? 'border-success-500 bg-success-50 text-success-700' : 'border-surface-200 text-surface-400 hover:border-success-300')} onClick={() => setQuizAnswer(true)}>{t('community.correct_quiz')}</button>
                <button className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all', !quizAnswer ? 'border-danger-500 bg-danger-50 text-danger-700' : 'border-surface-200 text-surface-400 hover:border-danger-300')} onClick={() => setQuizAnswer(false)}>{t('community.wrong_quiz')}</button>
              </div>
              <textarea dir="auto" className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-surface-300" rows={1}
                placeholder={t('community.quiz_optional')} value={newPost} onChange={e => setNewPost(e.target.value)} />
            </div>
          ) : (
            <div className="relative">
              <textarea dir="auto"
                className="w-full border border-surface-200 rounded-xl px-3 py-2 text-sm resize-none focus:border-primary-400 focus:outline-none"
                rows={3} placeholder={t('community.post_placeholder')}
                value={newPost} onChange={e => handleTextChange(e.target.value, setNewPost)} />
              {mentionSuggestions.length > 0 && <MentionDropdown suggestions={mentionSuggestions} onSelect={u => insertMention(u.username || u.name, newPost, setNewPost)} />}
              {hashtagSuggestions.length > 0 && <HashtagDropdown suggestions={hashtagSuggestions} onSelect={h => insertHashtag(h.tag, newPost, setNewPost)} />}
            </div>
          )}
        </div>

        {/* Attached image preview */}
        {communityAllowImages && postImage && (
          <div className="px-3.5 pb-2">
            <div className="relative rounded-xl overflow-hidden border border-surface-200">
              <img src={postImage} alt="" className="w-full max-h-40 object-cover" />
              <button className="absolute top-1.5 left-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center" onClick={() => setPostImage('')} title="Remove image">
                <Icon name="close" size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Row 3: tools + post button */}
        <div className="flex items-center gap-2 px-3.5 pb-3 border-t border-surface-50 pt-2">
          {communityAllowImages && !postImage && (
            <label className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-600 cursor-pointer px-2 py-1 rounded-lg hover:bg-surface-50 transition-colors">
              <Icon name="image" size={15} />
              <span>{t('community.image')}</span>
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPostImage(reader.result as string);
                reader.readAsDataURL(file);
                e.target.value = '';
              }} />
            </label>
          )}
          {!canPost && (
            <p className="text-[11px] text-red-500 flex items-center gap-1"><Icon name="block" size={11} /> {t('community.restricted')}</p>
          )}
          <div className="flex-1" />
          <Button size="sm" onClick={handlePost} loading={posting}
            disabled={!canPost || (postType === 'quiz' ? !quizQuestion.trim() : !newPost.trim())}
            className={cn('!text-xs !px-4', postType === 'quiz' ? '!bg-purple-500 hover:!bg-purple-600' : '')}>
            {t('community.publish')}
          </Button>
        </div>
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
          <Icon name={activeTab === 'following' ? 'people' : 'forum'} size={48} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">
            {activeTab === 'following' ? t('community.no_following_posts') : t('community.no_posts')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map(post => <div key={post.id}>{renderPost(post)}</div>)}
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <Icon name="warning" size={40} className="text-warning-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 text-center mb-2">{t('community.delete_title')}</h3>
            <p className="text-sm text-surface-500 text-center mb-6">
              {confirmDelete.type === 'post' ? t('community.delete_post_confirm') : confirmDelete.type === 'reply' ? t('community.delete_reply_confirm') : t('community.delete_comment_confirm')}
            </p>
            <div className="flex gap-3">
              <Button fullWidth variant="ghost" onClick={() => setConfirmDelete(null)}>{t('common.cancel')}</Button>
              <Button fullWidth variant="danger" onClick={handleDeleteItem}>{t('community.delete_btn')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Bookmarks Confirmation */}
      {confirmClearBookmarks && (
        <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmClearBookmarks(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <Icon name="warning" size={40} className="text-warning-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-surface-900 text-center mb-2">{t('community.clear_bookmarks_title')}</h3>
            <p className="text-sm text-surface-500 text-center mb-6">{t('community.clear_bookmarks_desc')}</p>
            <div className="flex gap-3">
              <Button fullWidth variant="ghost" onClick={() => setConfirmClearBookmarks(false)}>{t('common.cancel')}</Button>
              <Button fullWidth variant="danger" onClick={() => {
                setSavedPosts([]);
                if (user) localStorage.setItem(`savedPosts_${user.id}`, '[]');
                setConfirmClearBookmarks(false);
                setShowBookmarks(false);
              }}>{t('community.clear_all')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setReportModal(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <Icon name="flag" size={22} className="text-warning-500" />
              <h3 className="text-lg font-bold text-surface-900">{t('community.report_title')}</h3>
            </div>
            <textarea className="w-full border border-surface-200 rounded-xl p-3 text-sm resize-none mb-4" rows={3} placeholder={t('community.report_placeholder')} value={reportReason} onChange={e => setReportReason(e.target.value)} />
            <div className="flex gap-3">
              <Button fullWidth variant="ghost" onClick={() => setReportModal(null)}>{t('common.cancel')}</Button>
              <Button fullWidth variant="danger" onClick={handleReport} disabled={!reportReason.trim()}>{t('community.send_report')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal — removed, now navigates to UserProfilePage */}
      {false && viewUserId && viewUserData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => { setViewUserId(null); setViewUserData(null); }}>
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[88vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>

            {/* Cover + Avatar */}
            <div className="relative shrink-0">
              {/* Cover */}
              <div className="h-28 bg-gradient-to-br from-primary-400 via-blue-500 to-indigo-600" />
              {/* Close button */}
              <button onClick={() => { setViewUserId(null); setViewUserData(null); }}
                className="absolute top-3 left-3 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors">
                <Icon name="close" size={16} className="text-white" />
              </button>
              {/* Avatar overlapping cover */}
              <div className="absolute -bottom-10 right-5">
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden" style={{ background: viewUserData.avatar ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {viewUserData.avatar ? (
                    <img src={viewUserData.avatar} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-2xl font-black text-white">{viewUserData.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                {viewUserData.verified && (
                  <div className="absolute -bottom-1 -left-1">
                    <VerifiedBadge size="sm" tooltip />
                  </div>
                )}
              </div>
              {/* Follow button in header */}
              <div className="absolute -bottom-5 left-5">
                <button onClick={() => toggleFollow(viewUserId!)}
                  className={cn('px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm', following.includes(viewUserId!)
                    ? 'bg-surface-100 text-surface-600 hover:bg-surface-200 border border-surface-200'
                    : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-200')}>
                  {following.includes(viewUserId!) ? t('community.following_btn') : t('community.follow_btn')}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="px-5 pt-14 pb-4 shrink-0">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <h3 className="text-lg font-black text-surface-900">{viewUserData.name}</h3>
                  {viewUserData.username && (
                    <p className="text-sm text-primary-500 font-medium">@{viewUserData.username}</p>
                  )}
                  {viewUserData.bio && (
                    <p className="text-sm text-surface-500 mt-1.5 leading-relaxed">{viewUserData.bio}</p>
                  )}
                  {viewUserData.joinedAt && (
                    <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
                      <Icon name="calendar_month" size={12} />
                      {t('community.joined')} {new Date(viewUserData.joinedAt).toLocaleDateString(uiLang === 'it' ? 'it' : 'ar', { month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Social Stats */}
              <div className="grid grid-cols-4 gap-2 mt-4">
                {[
                  { label: t('community.posts_stat'), value: viewUserData.postsCount, icon: 'article', color: 'text-primary-600', bg: 'bg-primary-50', stat: null as null },
                  { label: t('community.questions_stat'), value: posts.filter(p => p.userId === viewUserId && p.type === 'quiz').length, icon: 'quiz', color: 'text-purple-600', bg: 'bg-purple-50', stat: null as null },
                  { label: t('community.followers_stat'), value: viewUserData.followersCount, icon: 'group', color: 'text-green-600', bg: 'bg-green-50', stat: 'followers' as 'followers' | 'following' | null },
                  { label: t('community.following_stat'), value: viewUserData.followingCount, icon: 'person_add', color: 'text-blue-600', bg: 'bg-blue-50', stat: 'following' as 'followers' | 'following' | null },
                ].map((s) => (
                  <div key={s.label}
                    className={cn('rounded-xl p-2.5 text-center transition-all', s.bg, s.stat ? 'cursor-pointer hover:ring-2 hover:ring-inset hover:ring-current/20 active:scale-95' : '')}
                    onClick={() => s.stat && setViewProfileStatView(s.stat)}>
                    <Icon name={s.icon} size={16} className={cn('mx-auto mb-1', s.color)} />
                    <p className={cn('text-base font-black', s.color)}>{s.value}</p>
                    <p className="text-[9px] text-surface-500 leading-tight">{s.label}</p>
                    {s.stat && <Icon name="chevron_right" size={10} className={cn('mx-auto mt-0.5 rotate-90', s.color)} />}
                  </div>
                ))}
              </div>

              {/* Learning stats — hidden if user chose to hide them */}
              {viewUserData.hideStats ? (
                <div className="bg-surface-50 rounded-xl px-3 py-2 mt-3 border border-surface-100 flex items-center gap-2">
                  <Icon name="lock" size={14} className="text-surface-300" />
                  <p className="text-xs text-surface-400">{t('community.hidden_stats')}</p>
                </div>
              ) : (viewUserData.totalQuizzes || 0) > 0 ? (
                <div className="mt-3 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-3 border border-primary-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="school" size={13} className="text-primary-500" />
                    <p className="text-[11px] font-bold text-surface-700">{t('community.learning_stats')}</p>
                    <span className="mr-auto text-[10px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full font-semibold">{t('community.level_label')} {viewUserData.level || 1}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="bg-white/70 rounded-lg p-1.5 text-center">
                      <p className="text-sm font-black text-primary-700">{viewUserData.examReadiness || 0}%</p>
                      <p className="text-[9px] text-surface-400">{t('community.readiness_label')}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-1.5 text-center">
                      <p className="text-sm font-black text-success-600">{viewUserData.correctAnswers || 0}</p>
                      <p className="text-[9px] text-surface-400">{t('community.correct_label')}</p>
                    </div>
                    <div className="bg-white/70 rounded-lg p-1.5 text-center">
                      <p className="text-sm font-black text-surface-600">{viewUserData.totalQuizzes || 0}</p>
                      <p className="text-[9px] text-surface-400">{t('community.quiz_label')}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Followers / Following sub-panel */}
            {viewProfileStatView && (
              <div className="border-t border-surface-100 flex-1 overflow-y-auto">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-100 bg-surface-50 sticky top-0 z-10">
                  <button onClick={() => setViewProfileStatView(null)}
                    className="w-7 h-7 rounded-lg hover:bg-surface-200 flex items-center justify-center transition-colors">
                    <Icon name="arrow_back" size={16} className="text-surface-600 rotate-180" />
                  </button>
                  <h4 className="text-sm font-bold text-surface-800">
                    {viewProfileStatView === 'followers' ? `${t('community.followers_title')} (${viewProfileFollowers.length})` : `${t('community.following_title')} (${viewProfileFollowing.length})`}
                  </h4>
                </div>
                <div className="divide-y divide-surface-50">
                  {(viewProfileStatView === 'followers' ? viewProfileFollowers : viewProfileFollowing).length === 0 ? (
                    <div className="py-10 text-center">
                      <Icon name={viewProfileStatView === 'followers' ? 'group' : 'person_add'} size={32} className="text-surface-200 mx-auto mb-2" />
                      <p className="text-xs text-surface-400">{viewProfileStatView === 'followers' ? t('community.no_followers') : t('community.no_following_user')}</p>
                    </div>
                  ) : (
                    (viewProfileStatView === 'followers' ? viewProfileFollowers : viewProfileFollowing).map(u => (
                      <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 cursor-pointer"
                          style={{ background: u.avatar ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                          onClick={() => { setViewProfileStatView(null); openUserProfile(u.id); }}>
                          {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-sm font-bold text-white">{u.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <span className="flex-1 text-sm font-semibold text-surface-800 truncate cursor-pointer"
                          onClick={() => { setViewProfileStatView(null); openUserProfile(u.id); }}>
                          {u.name}
                        </span>
                        {u.id !== user?.id && (
                          <button
                            onClick={() => toggleFollow(u.id)}
                            className={cn('shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all',
                              following.includes(u.id)
                                ? 'bg-surface-100 text-surface-600 hover:bg-danger-50 hover:text-danger-600 border border-surface-200'
                                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm')}>
                            {following.includes(u.id) ? t('community.following_btn') : t('community.follow_btn')}
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Tabs + Posts */}
            {!viewProfileStatView && <div className="flex-1 overflow-y-auto border-t border-surface-100">
              <div className="flex border-b border-surface-100 sticky top-0 bg-white z-10">
                {([['posts', t('community.posts_tab'), 'article'], ['quizzes', t('community.quizzes_tab'), 'quiz']] as const).map(([tab, label, icon]) => (
                  <button key={tab} onClick={() => setViewProfileTab(tab)}
                    className={cn('flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2',
                      viewProfileTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-surface-400 hover:text-surface-600')}>
                    <Icon name={icon} size={14} />
                    {label}
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold', viewProfileTab === tab ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-400')}>
                      {tab === 'posts'
                        ? posts.filter(p => p.userId === viewUserId && p.type !== 'quiz').length
                        : posts.filter(p => p.userId === viewUserId && p.type === 'quiz').length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="p-4 space-y-2">
                {posts.filter(p => p.userId === viewUserId && (viewProfileTab === 'posts' ? p.type !== 'quiz' : p.type === 'quiz')).slice(0, 15).map(p => (
                  <div key={p.id} className="bg-surface-50 rounded-xl p-3 cursor-pointer hover:bg-surface-100 transition-colors border border-surface-100"
                    onClick={() => { setViewUserId(null); setViewUserData(null); openPostDetail(p.id); }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      {p.type === 'quiz' && (
                        <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">{t('community.quiz_badge')}</span>
                      )}
                      <span className="text-[10px] text-surface-400 mr-auto">{relativeTime(p.createdAt, uiLang)}</span>
                    </div>
                    <p className="text-xs text-surface-700 line-clamp-2 leading-relaxed" dir={getTextDir(p.type === 'quiz' ? p.quizQuestion : p.content)}>
                      {p.type === 'quiz' ? p.quizQuestion : p.content}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Icon name="favorite" size={10} className="text-red-400" filled />{p.likesCount}</span>
                      <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Icon name="chat_bubble" size={10} />{p.commentsCount}</span>
                    </div>
                  </div>
                ))}
                {posts.filter(p => p.userId === viewUserId && (viewProfileTab === 'posts' ? p.type !== 'quiz' : p.type === 'quiz')).length === 0 && (
                  <div className="text-center py-8">
                    <Icon name={viewProfileTab === 'posts' ? 'article' : 'quiz'} size={32} className="text-surface-200 mx-auto mb-2" />
                    <p className="text-xs text-surface-400">{viewProfileTab === 'posts' ? t('community.no_posts_tab') : t('community.no_quizzes_tab')}</p>
                  </div>
                )}
              </div>
            </div>}
          </div>
        </div>
      )}

      {/* Likers Modal */}
      {likersModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLikersModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-xs max-h-[60vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
              <h3 className="font-bold text-surface-900 flex items-center gap-2">
                <Icon name="favorite" size={18} className="text-red-500" filled />
                {likersModal.likers.length} {t('community.likers_title')}
              </h3>
              <button onClick={() => setLikersModal(null)} className="w-8 h-8 rounded-xl hover:bg-surface-100 flex items-center justify-center transition-colors">
                <Icon name="close" size={18} className="text-surface-500" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-3">
              {likersModal.likers.length === 0 && (
                <p className="text-sm text-surface-400 text-center py-4">{t('community.no_likers')}</p>
              )}
              {likersModal.likers.map((l, i) => (
                <div key={i} className="flex items-center gap-3 hover:bg-surface-50 rounded-xl p-2 transition-colors">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 shadow-sm cursor-pointer"
                    style={{ background: l.userAvatar ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                    onClick={() => { setLikersModal(null); openUserProfile(l.userId); }}>
                    {l.userAvatar ? (
                      <img src={l.userAvatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{l.userName.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-surface-800 flex-1 cursor-pointer"
                    onClick={() => { setLikersModal(null); openUserProfile(l.userId); }}>{l.userName}</span>
                  {l.userId !== user?.id && (
                    <button
                      onClick={e => { e.stopPropagation(); toggleFollow(l.userId); }}
                      className={cn('shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all',
                        following.includes(l.userId)
                          ? 'bg-surface-100 text-surface-600 hover:bg-danger-50 hover:text-danger-600 border border-surface-200'
                          : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm')}>
                      {following.includes(l.userId) ? t('community.following_btn') : t('community.follow_btn')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MentionDropdown Component ─────────────────────────────────────────────────
function MentionDropdown({ suggestions, onSelect }: {
  suggestions: { id: string; name: string; username: string; avatar?: string }[];
  onSelect: (u: { id: string; name: string; username: string }) => void;
}) {
  return (
    <div className="absolute bottom-full left-0 right-0 bg-white border border-surface-200 rounded-xl shadow-2xl z-[200] overflow-hidden mb-1 max-h-52 overflow-y-auto">
      <div className="px-3 py-1.5 bg-surface-50 border-b border-surface-100 flex items-center gap-1.5">
        <Icon name="alternate_email" size={12} className="text-surface-400" />
        <p className="text-[10px] text-surface-400 font-medium">{t('community.mention_title')}</p>
      </div>
      {suggestions.map(u => (
        <button key={u.id} type="button"
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-primary-50 text-right transition-colors border-b border-surface-50 last:border-0"
          onMouseDown={e => { e.preventDefault(); onSelect(u); }}>
          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0" style={{ background: u.avatar ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
            {u.avatar ? (
              <img src={u.avatar} className="w-full h-full object-cover" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">{u.name.charAt(0)}</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-surface-900 truncate">{u.name}</p>
            {u.username && <p className="text-[10px] text-primary-500 truncate">@{u.username}</p>}
          </div>
          <span className="text-[10px] text-surface-300 shrink-0">{t('community.mention_badge')}</span>
        </button>
      ))}
    </div>
  );
}

// ── HashtagDropdown Component ──────────────────────────────────────────────────
function HashtagDropdown({ suggestions, onSelect }: {
  suggestions: import('@/db/database').Hashtag[];
  onSelect: (h: import('@/db/database').Hashtag) => void;
}) {
  return (
    <div className="absolute bottom-full left-0 right-0 bg-white border border-surface-200 rounded-xl shadow-2xl z-[200] overflow-hidden mb-1 max-h-40 overflow-y-auto">
      <div className="px-3 py-1.5 bg-surface-50 border-b border-surface-100">
        <p className="text-[10px] text-surface-400 font-medium">{t('community.hashtag_suggestions')}</p>
      </div>
      {suggestions.map(h => (
        <button key={h.id} type="button"
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-primary-50 text-right transition-colors"
          onMouseDown={e => { e.preventDefault(); onSelect(h); }}>
          <span className="text-xs font-semibold text-primary-600">#{h.tag}</span>
          <span className="text-[10px] text-surface-400">{h.postCount} {t('community.hashtag_posts')}</span>
        </button>
      ))}
    </div>
  );
}
