import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocaleNavigate } from '@/hooks/useLocaleNavigate';
import { useAuthStore, useDataStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { getDB } from '@/db/database';
import { calculateExamReadiness } from '@/services/examReadinessService';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { apiCreateCommunityNotif } from '@/db/api';
import { ROUTES } from '@/constants';
import { buildUserProfileUrl } from '@/constants';

function getTextDir(text: string): 'rtl' | 'ltr' {
  return /[\u0600-\u06FF]/.test(text) ? 'rtl' : 'ltr';
}

interface UserData {
  name: string; username: string; avatar: string; bio: string; verified: boolean;
  postsCount: number; followersCount: number; followingCount: number;
  hideStats: boolean; joinedAt?: string;
  examReadiness?: number; totalQuizzes?: number; correctAnswers?: number;
  wrongAnswers?: number; level?: number; xp?: number;
}

type TabType = 'posts' | 'quizzes';
type StatView = 'followers' | 'following' | null;

export function UserProfilePage() {
  const { navigate, goBack } = useLocaleNavigate();
  const { userId = '' } = useParams<{ userId: string }>();
  const { t, uiLang } = useTranslation();
  const { user } = useAuthStore();
  const { posts } = useDataStore();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [tab, setTab] = useState<TabType>('posts');
  const [statView, setStatView] = useState<StatView>(null);
  const [followers, setFollowers] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [followingList, setFollowingList] = useState<{ id: string; name: string; avatar: string }[]>([]);
  const [following, setFollowing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load current user's following list
  useEffect(() => {
    if (!user) return;
    try {
      const f = localStorage.getItem(`following_${user.id}`);
      if (f) setFollowing(JSON.parse(f));
    } catch { /* */ }
  }, [user]);

  // Load viewed user's data
  useEffect(() => {
    (async () => {
      setLoading(true);
      const db = await getDB();
      const u = await db.get('users', userId);
      if (!u) { setLoading(false); return; }
      const allUsers = await db.getAll('users');

      const followersList = allUsers.filter(x => {
        try {
          const f = localStorage.getItem(`following_${x.id}`);
          if (f) { const arr = JSON.parse(f); return Array.isArray(arr) && arr.includes(userId); }
        } catch { /* */ }
        return false;
      }).map(x => ({ id: x.id, name: x.name, avatar: x.avatar || '' }));

      const followingIds: string[] = (() => {
        try {
          const f = localStorage.getItem(`following_${userId}`);
          if (f) { const arr = JSON.parse(f); return Array.isArray(arr) ? arr : []; }
        } catch { /* */ }
        return [];
      })();
      const followingListData = allUsers.filter(x => followingIds.includes(x.id)).map(x => ({ id: x.id, name: x.name, avatar: x.avatar || '' }));

      setFollowers(followersList);
      setFollowingList(followingListData);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawProg = (u as any).progress || {};
      const prog = {
        totalQuizzes: 0, correctAnswers: 0, wrongAnswers: 0,
        completedLessons: [], completedTopics: [], currentStreak: 0,
        bestStreak: 0, lastStudyDate: '', totalStudyDays: 0,
        level: 1, xp: 0, badges: [], examReadiness: 0,
        ...rawProg,
      };
      const userPosts = posts.filter(p => p.userId === userId && p.type !== 'quiz');

      // Calculate examReadiness using the same advanced algorithm as Dashboard
      let examReadiness = prog.examReadiness || 0;
      try {
        const allResults = await db.getAllFromIndex('quizResults', 'userId', userId);
        const allMistakes = await db.getAllFromIndex('userMistakes', 'userId', userId);
        const allLessons = await db.getAll('lessons');
        const allQuestions = await db.getAll('questions');
        const result = calculateExamReadiness({
          quizHistory: allResults,
          mistakes: allMistakes,
          progress: prog,
          totalLessons: allLessons.length,
          totalQuestions: allQuestions.length,
        });
        examReadiness = result.score;
      } catch { /* fallback to stored value */ }

      setUserData({
        name: u.name, username: u.username || '', avatar: u.avatar || '', bio: u.bio || '',
        verified: u.verified || false,
        postsCount: userPosts.length,
        followersCount: followersList.length,
        followingCount: followingListData.length,
        hideStats: u.privacyHideStats || false,
        joinedAt: u.createdAt || undefined,
        examReadiness,
        totalQuizzes: prog.totalQuizzes || 0,
        correctAnswers: prog.correctAnswers || 0,
        wrongAnswers: prog.wrongAnswers || 0,
        level: prog.level || 1,
        xp: prog.xp || 0,
      });
      setLoading(false);
    })();
  }, [userId, posts]);

  const toggleFollow = async (targetId: string) => {
    if (!user) return;
    const wasFollowing = following.includes(targetId);
    const newF = wasFollowing ? following.filter(id => id !== targetId) : [...following, targetId];
    setFollowing(newF);
    localStorage.setItem(`following_${user.id}`, JSON.stringify(newF));
    if (!wasFollowing) {
      await apiCreateCommunityNotif({
        toUserId: targetId, fromUserId: user.id,
        fromUserName: user.name, fromUserAvatar: user.avatar || '',
        type: 'follow',
      });
    }
    // Update followers count on main user
    if (targetId === userId && userData) {
      setUserData(prev => prev ? { ...prev, followersCount: prev.followersCount + (wasFollowing ? -1 : 1) } : prev);
      if (wasFollowing) setFollowers(prev => prev.filter(f => f.id !== user.id));
      else setFollowers(prev => [...prev, { id: user.id, name: user.name, avatar: user.avatar || '' }]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Icon name="person_off" size={40} className="text-surface-300" />
        <p className="text-surface-400">{t('community.user_not_found') || 'User not found'}</p>
        <button onClick={() => navigate(ROUTES.COMMUNITY)} className="text-primary-500 text-sm font-semibold">
          {t('community.back') || 'Back'}
        </button>
      </div>
    );
  }

  const userPosts = posts.filter(p => p.userId === userId && (tab === 'posts' ? p.type !== 'quiz' : p.type === 'quiz'));
  const isFollowing = following.includes(userId);
  const isOwn = user?.id === userId;

  const renderAvatar = (avatar: string, name: string, size: 'lg' | 'sm' = 'lg') => {
    const dim = size === 'lg' ? 'w-24 h-24' : 'w-9 h-9';
    const text = size === 'lg' ? 'text-3xl' : 'text-sm';
    return avatar ? (
      <img src={avatar} className={cn(dim, 'rounded-2xl object-cover')} alt="" />
    ) : (
      <div className={cn(dim, 'rounded-2xl flex items-center justify-center')} style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
        <span className={cn('font-black text-white', text)}>{name.charAt(0)}</span>
      </div>
    );
  };

  return (
    <div className="-mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 pb-20">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-surface-100 flex items-center gap-3 px-4 py-3">
        <button onClick={() => goBack(ROUTES.COMMUNITY)}
          className="w-9 h-9 rounded-xl hover:bg-surface-100 flex items-center justify-center transition-colors">
          <Icon name="arrow_back" size={20} className={cn('text-surface-700', uiLang === 'ar' ? 'rotate-180' : '')} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h1 className="font-bold text-surface-900 text-base truncate">{userData.name}</h1>
            {userData.verified && <VerifiedBadge size="sm" tooltip />}
          </div>
          {userData.username && <p className="text-xs text-primary-500">@{userData.username}</p>}
        </div>
      </div>

      {/* Cover + Avatar */}
      <div className="relative">
        <div className="h-36 bg-gradient-to-br from-primary-400 via-blue-500 to-indigo-600" />
        {/* Avatar */}
        <div className="absolute -bottom-12 right-5 border-4 border-white rounded-2xl shadow-lg overflow-hidden">
          {renderAvatar(userData.avatar, userData.name, 'lg')}
        </div>
        {/* Follow / Edit button */}
        {!isOwn && (
          <div className="absolute -bottom-6 left-5">
            <button onClick={() => toggleFollow(userId)}
              className={cn('px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm', isFollowing
                ? 'bg-surface-100 text-surface-600 hover:bg-surface-200 border border-surface-200'
                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-200')}>
              {isFollowing ? t('community.following_btn') : t('community.follow_btn')}
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-5 pt-16 pb-4">
        <div className="flex items-center gap-1.5">
          <h2 className="text-xl font-black text-surface-900">{userData.name}</h2>
          {userData.verified && <VerifiedBadge size="md" tooltip />}
        </div>
        {userData.username && <p className="text-sm text-primary-500 font-medium">@{userData.username}</p>}
        {userData.bio && <p className="text-sm text-surface-500 mt-2 leading-relaxed">{userData.bio}</p>}
        {userData.joinedAt && (
          <p className="text-xs text-surface-400 mt-1 flex items-center gap-1">
            <Icon name="calendar_month" size={12} />
            {t('community.joined')} {new Date(userData.joinedAt).toLocaleDateString(uiLang === 'it' ? 'it' : 'ar', { month: 'long', year: 'numeric' })}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: t('community.posts_stat'), value: userData.postsCount, icon: 'article', color: 'text-primary-600', bg: 'bg-primary-50', stat: null as StatView },
            { label: t('community.questions_stat'), value: posts.filter(p => p.userId === userId && p.type === 'quiz').length, icon: 'quiz', color: 'text-purple-600', bg: 'bg-purple-50', stat: null as StatView },
            { label: t('community.followers_stat'), value: userData.followersCount, icon: 'group', color: 'text-green-600', bg: 'bg-green-50', stat: 'followers' as StatView },
            { label: t('community.following_stat'), value: userData.followingCount, icon: 'person_add', color: 'text-blue-600', bg: 'bg-blue-50', stat: 'following' as StatView },
          ].map(s => (
            <div key={s.label}
              className={cn('rounded-xl p-2.5 text-center transition-all', s.bg, s.stat ? 'cursor-pointer hover:ring-2 hover:ring-inset hover:ring-current/20 active:scale-95' : '')}
              onClick={() => s.stat && setStatView(s.stat)}>
              <Icon name={s.icon} size={16} className={cn('mx-auto mb-1', s.color)} />
              <p className={cn('text-base font-black', s.color)}>{s.value}</p>
              <p className="text-[9px] text-surface-500 leading-tight">{s.label}</p>
              {s.stat && <Icon name="chevron_right" size={10} className={cn('mx-auto mt-0.5 rotate-90', s.color)} />}
            </div>
          ))}
        </div>

        {/* Learning stats */}
        {userData.hideStats ? (
          <div className="bg-surface-50 rounded-xl px-3 py-2 mt-3 border border-surface-100 flex items-center gap-2">
            <Icon name="lock" size={14} className="text-surface-300" />
            <p className="text-xs text-surface-400">{t('community.hidden_stats')}</p>
          </div>
        ) : (userData.totalQuizzes || 0) > 0 ? (
          <div className="mt-3 bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-3 border border-primary-100">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="school" size={13} className="text-primary-500" />
              <p className="text-[11px] font-bold text-surface-700">{t('community.learning_stats')}</p>
              <span className="mr-auto text-[10px] bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full font-semibold">{t('community.level_label')} {userData.level || 1}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <div className="bg-white/70 rounded-lg p-1.5 text-center">
                <p className="text-sm font-black text-primary-700">{userData.examReadiness || 0}%</p>
                <p className="text-[9px] text-surface-400">{t('community.readiness_label')}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-1.5 text-center">
                <p className="text-sm font-black text-success-600">{userData.correctAnswers || 0}</p>
                <p className="text-[9px] text-surface-400">{t('community.correct_label')}</p>
              </div>
              <div className="bg-white/70 rounded-lg p-1.5 text-center">
                <p className="text-sm font-black text-surface-600">{userData.totalQuizzes || 0}</p>
                <p className="text-[9px] text-surface-400">{t('community.quiz_label')}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Followers / Following panel */}
      {statView && (
        <div className="border-t border-surface-100">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-surface-100 bg-surface-50 sticky top-[57px] z-10">
            <button onClick={() => setStatView(null)}
              className="w-7 h-7 rounded-lg hover:bg-surface-200 flex items-center justify-center transition-colors">
              <Icon name="arrow_back" size={16} className="text-surface-600 rotate-180" />
            </button>
            <h4 className="text-sm font-bold text-surface-800">
              {statView === 'followers'
                ? `${t('community.followers_title')} (${followers.length})`
                : `${t('community.following_title')} (${followingList.length})`}
            </h4>
          </div>
          <div className="divide-y divide-surface-50">
            {(statView === 'followers' ? followers : followingList).length === 0 ? (
              <div className="py-10 text-center">
                <Icon name={statView === 'followers' ? 'group' : 'person_add'} size={32} className="text-surface-200 mx-auto mb-2" />
                <p className="text-xs text-surface-400">{statView === 'followers' ? t('community.no_followers') : t('community.no_following_user')}</p>
              </div>
            ) : (
              (statView === 'followers' ? followers : followingList).map(u => (
                <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 cursor-pointer"
                    style={{ background: u.avatar ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                    onClick={() => navigate(buildUserProfileUrl(u.id))}>
                    {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" alt="" /> : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-sm font-bold text-white">{u.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <span className="flex-1 text-sm font-semibold text-surface-800 truncate cursor-pointer"
                    onClick={() => navigate(buildUserProfileUrl(u.id))}>
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

      {/* Posts Tabs */}
      {!statView && (
        <div className="border-t border-surface-100">
          <div className="flex border-b border-surface-100 sticky top-[57px] bg-white z-10">
            {(['posts', 'quizzes'] as const).map(tabKey => (
              <button key={tabKey} onClick={() => setTab(tabKey)}
                className={cn('flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all border-b-2',
                  tab === tabKey ? 'border-primary-500 text-primary-600' : 'border-transparent text-surface-400 hover:text-surface-600')}>
                <Icon name={tabKey === 'posts' ? 'article' : 'quiz'} size={14} />
                {tabKey === 'posts' ? t('community.posts_tab') : t('community.quizzes_tab')}
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-bold', tab === tabKey ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-400')}>
                  {posts.filter(p => p.userId === userId && (tabKey === 'posts' ? p.type !== 'quiz' : p.type === 'quiz')).length}
                </span>
              </button>
            ))}
          </div>

          <div className="p-4 space-y-2">
            {userPosts.slice(0, 20).map(p => (
              <div key={p.id}
                className="bg-surface-50 rounded-xl p-3 cursor-pointer hover:bg-surface-100 transition-colors border border-surface-100"
                onClick={() => navigate(ROUTES.COMMUNITY, { state: { openPostId: p.id } })}>
                <div className="flex items-center gap-1.5 mb-1">
                  {p.type === 'quiz' && (
                    <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full font-medium">{t('community.quiz_badge')}</span>
                  )}
                  <span className="text-[10px] text-surface-400 mr-auto">
                    {new Date(p.createdAt).toLocaleDateString(uiLang === 'it' ? 'it' : 'ar', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p dir={getTextDir(p.type === 'quiz' ? p.quizQuestion : p.content)}
                  className="text-xs text-surface-700 line-clamp-2 leading-relaxed">
                  {p.type === 'quiz' ? p.quizQuestion : p.content}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Icon name="favorite" size={10} className="text-red-400" filled />{p.likesCount}</span>
                  <span className="text-[10px] text-surface-400 flex items-center gap-0.5"><Icon name="chat_bubble" size={10} />{p.commentsCount}</span>
                </div>
              </div>
            ))}
            {userPosts.length === 0 && (
              <div className="text-center py-10">
                <Icon name={tab === 'posts' ? 'article' : 'quiz'} size={32} className="text-surface-200 mx-auto mb-2" />
                <p className="text-xs text-surface-400">{tab === 'posts' ? t('community.no_posts_tab') : t('community.no_quizzes_tab')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
