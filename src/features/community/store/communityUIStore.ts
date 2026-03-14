/**
 * communityUIStore.ts
 * All transient UI state: filters, modals, panels, user preferences.
 */
import { create } from 'zustand';
import type {
  PostSortMode,
  Hashtag,
  LikersModalState,
  ReportModalState,
  ConfirmDeleteState,
  ReplyingToState,
  CommunityUser,
} from '../types';

interface CommunityUIState {
  postSortMode: PostSortMode;
  activeHashtag: string | null;
  activeTab: 'discover' | 'following';
  searchQuery: string;
  showSearch: boolean;

  following: string[];
  allUsers: CommunityUser[];
  verifiedUsers: Record<string, boolean>;

  showNotifs: boolean;
  showBookmarks: boolean;
  showTrending: boolean;
  trendingHashtags: Hashtag[];
  hashtagSuggestions: Hashtag[];
  mentionSuggestions: CommunityUser[];

  showComments: string | null;
  detailPostId: string | null;
  replyingTo: ReplyingToState | null;
  newComment: string;
  replyContent: string;

  newPost: string;
  postType: 'post' | 'quiz';
  quizQuestion: string;
  quizAnswer: boolean;
  postImage: string;
  communityAllowImages: boolean;

  quizVoted: Record<string, boolean>;
  quizSelected: Record<string, boolean>;

  savedPosts: string[];
  confirmDeleteBookmarkId: string | null;
  confirmClearBookmarks: boolean;
  bookmarkRemovedToast: boolean;

  editingPost: string | null;
  editContent: string;

  expandedTexts: Record<string, boolean>;

  reportModal: ReportModalState | null;
  reportReason: string;
  reportSuccess: boolean;
  confirmDelete: ConfirmDeleteState | null;
  likersModal: LikersModalState | null;

  setPostSortMode: (mode: PostSortMode) => void;
  setActiveHashtag: (tag: string | null) => void;
  setActiveTab: (tab: 'discover' | 'following') => void;
  setSearchQuery: (q: string) => void;
  setShowSearch: (v: boolean) => void;
  setFollowing: (ids: string[]) => void;
  setAllUsers: (users: CommunityUser[]) => void;
  setVerifiedUsers: (map: Record<string, boolean>) => void;
  setShowNotifs: (v: boolean) => void;
  setShowBookmarks: (v: boolean) => void;
  setShowTrending: (v: boolean) => void;
  setTrendingHashtags: (tags: Hashtag[]) => void;
  setHashtagSuggestions: (tags: Hashtag[]) => void;
  setMentionSuggestions: (users: CommunityUser[]) => void;
  setShowComments: (postId: string | null) => void;
  setDetailPostId: (postId: string | null) => void;
  setReplyingTo: (state: ReplyingToState | null) => void;
  setNewComment: (v: string) => void;
  setReplyContent: (v: string) => void;
  setNewPost: (v: string) => void;
  setPostType: (t: 'post' | 'quiz') => void;
  setQuizQuestion: (v: string) => void;
  setQuizAnswer: (v: boolean) => void;
  setPostImage: (v: string) => void;
  recordQuizVote: (postId: string, answer: boolean, userId: string) => void;
  setSavedPosts: (ids: string[], userId: string) => void;
  toggleSavePost: (postId: string, userId: string) => void;
  setConfirmDeleteBookmarkId: (id: string | null) => void;
  setConfirmClearBookmarks: (v: boolean) => void;
  setBookmarkRemovedToast: (v: boolean) => void;
  setEditingPost: (id: string | null) => void;
  setEditContent: (v: string) => void;
  toggleExpandText: (postId: string) => void;
  setReportModal: (state: ReportModalState | null) => void;
  setReportReason: (v: string) => void;
  setReportSuccess: (v: boolean) => void;
  setConfirmDelete: (state: ConfirmDeleteState | null) => void;
  setLikersModal: (state: LikersModalState | null) => void;
  initFromStorage: (userId: string) => void;
  closeAllPanels: () => void;
}

export const useCommunityUIStore = create<CommunityUIState>((set) => ({
  postSortMode: 'hot',
  activeHashtag: null,
  activeTab: 'discover',
  searchQuery: '',
  showSearch: false,
  following: [],
  allUsers: [],
  verifiedUsers: {},
  showNotifs: false,
  showBookmarks: false,
  showTrending: false,
  trendingHashtags: [],
  hashtagSuggestions: [],
  mentionSuggestions: [],
  showComments: null,
  detailPostId: null,
  replyingTo: null,
  newComment: '',
  replyContent: '',
  newPost: '',
  postType: 'post',
  quizQuestion: '',
  quizAnswer: true,
  postImage: '',
  communityAllowImages: localStorage.getItem('communityAllowImages') === 'true',
  quizVoted: {},
  quizSelected: {},
  savedPosts: [],
  confirmDeleteBookmarkId: null,
  confirmClearBookmarks: false,
  bookmarkRemovedToast: false,
  editingPost: null,
  editContent: '',
  expandedTexts: {},
  reportModal: null,
  reportReason: '',
  reportSuccess: false,
  confirmDelete: null,
  likersModal: null,

  setPostSortMode: (mode) => set({ postSortMode: mode }),
  setActiveHashtag: (tag) => set({ activeHashtag: tag }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setShowSearch: (v) => set({ showSearch: v }),
  setFollowing: (ids) => set({ following: ids }),
  setAllUsers: (users) => set({ allUsers: users }),
  setVerifiedUsers: (map) => set({ verifiedUsers: map }),
  setShowNotifs: (v) => set({ showNotifs: v }),
  setShowBookmarks: (v) => set({ showBookmarks: v }),
  setShowTrending: (v) => set({ showTrending: v }),
  setTrendingHashtags: (tags) => set({ trendingHashtags: tags }),
  setHashtagSuggestions: (tags) => set({ hashtagSuggestions: tags }),
  setMentionSuggestions: (users) => set({ mentionSuggestions: users }),
  setShowComments: (postId) => set({ showComments: postId }),
  setDetailPostId: (postId) => set({ detailPostId: postId }),
  setReplyingTo: (s) => set({ replyingTo: s }),
  setNewComment: (v) => set({ newComment: v }),
  setReplyContent: (v) => set({ replyContent: v }),
  setNewPost: (v) => set({ newPost: v }),
  setPostType: (t) => set({ postType: t }),
  setQuizQuestion: (v) => set({ quizQuestion: v }),
  setQuizAnswer: (v) => set({ quizAnswer: v }),
  setPostImage: (v) => set({ postImage: v }),
  setEditingPost: (id) => set({ editingPost: id, editContent: '' }),
  setEditContent: (v) => set({ editContent: v }),
  toggleExpandText: (postId) =>
    set(state => ({ expandedTexts: { ...state.expandedTexts, [postId]: !state.expandedTexts[postId] } })),
  setReportModal: (s) => set({ reportModal: s }),
  setReportReason: (v) => set({ reportReason: v }),
  setReportSuccess: (v) => set({ reportSuccess: v }),
  setConfirmDelete: (s) => set({ confirmDelete: s }),
  setLikersModal: (s) => set({ likersModal: s }),
  setConfirmDeleteBookmarkId: (id) => set({ confirmDeleteBookmarkId: id }),
  setConfirmClearBookmarks: (v) => set({ confirmClearBookmarks: v }),
  setBookmarkRemovedToast: (v) => set({ bookmarkRemovedToast: v }),

  recordQuizVote: (postId, answer, userId) => {
    set(state => {
      const quizVoted = { ...state.quizVoted, [postId]: true };
      const quizSelected = { ...state.quizSelected, [postId]: answer };
      try {
        localStorage.setItem(`quizVotes_${userId}`, JSON.stringify({ voted: quizVoted, selected: quizSelected }));
      } catch { /* ignore */ }
      return { quizVoted, quizSelected };
    });
  },

  setSavedPosts: (ids, userId) => {
    set({ savedPosts: ids });
    try { localStorage.setItem(`savedPosts_${userId}`, JSON.stringify(ids)); } catch { /* ignore */ }
  },

  toggleSavePost: (postId, userId) => {
    set(state => {
      const isSaved = state.savedPosts.includes(postId);
      const savedPosts = isSaved
        ? state.savedPosts.filter(id => id !== postId)
        : [...state.savedPosts, postId];
      try { localStorage.setItem(`savedPosts_${userId}`, JSON.stringify(savedPosts)); } catch { /* ignore */ }
      return { savedPosts };
    });
  },

  closeAllPanels: () => set({ showNotifs: false, showBookmarks: false, showTrending: false }),

  initFromStorage: (userId) => {
    try {
      const sf = localStorage.getItem(`following_${userId}`);
      if (sf) set({ following: JSON.parse(sf) });
    } catch { /* ignore */ }
    try {
      const sv = localStorage.getItem(`quizVotes_${userId}`);
      if (sv) {
        const p = JSON.parse(sv);
        set({ quizVoted: p.voted || {}, quizSelected: p.selected || {} });
      }
    } catch { /* ignore */ }
    try {
      const sp = localStorage.getItem(`savedPosts_${userId}`);
      if (sp) set({ savedPosts: JSON.parse(sp) });
    } catch { /* ignore */ }
  },
}));
