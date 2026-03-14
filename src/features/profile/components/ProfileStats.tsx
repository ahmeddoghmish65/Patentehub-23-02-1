import React, { useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { useLocaleNavigate } from '@/hooks/useLocaleNavigate';
import { ROUTES } from '@/constants';
import { buildUserProfileUrl } from '@/constants';
import type { Post } from '@/types';
import type { SocialUser, ActiveStatView } from '../types/profile.types';
import { getTextDir } from '../utils/profileUtils';

interface ProfileStatsProps {
  activeStatView: ActiveStatView;
  onClose: () => void;
  posts: Post[];
  userId: string;
  followersList: SocialUser[];
  followingList: SocialUser[];
  myFollowing: string[];
  onToggleFollow: (id: string, name: string, avatar?: string, username?: string) => void;
}

export const ProfileStats = React.memo(function ProfileStats({
  activeStatView,
  onClose,
  posts,
  userId,
  followersList,
  followingList,
  myFollowing,
  onToggleFollow,
}: ProfileStatsProps) {
  const { t } = useTranslation();
  const { navigate } = useLocaleNavigate();

  const title = {
    posts:     t('profile.my_posts'),
    quizzes:   t('profile.my_quizzes'),
    followers: t('profile.followers_modal'),
    following: t('profile.following_modal'),
  }[activeStatView ?? 'posts'];

  const renderUserRow = useCallback(
    (u: SocialUser) => (
      <div key={u.id} className="p-4 flex items-center gap-3">
        {u.avatar ? (
          <img
            src={u.avatar}
            className="w-10 h-10 rounded-full object-cover shrink-0 cursor-pointer"
            alt=""
            onClick={() => navigate(buildUserProfileUrl(u.username || u.id))}
          />
        ) : (
          <div
            className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
            onClick={() => navigate(buildUserProfileUrl(u.username || u.id))}
          >
            <span className="font-bold text-primary-700">{u.name.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(buildUserProfileUrl(u.username || u.id))}>
          <p className="text-sm font-semibold text-surface-800 truncate">{u.name}</p>
          {u.username && <p className="text-xs text-primary-500">@{u.username}</p>}
        </div>
        {u.id !== userId && (
          <button
            onClick={() => onToggleFollow(u.id, u.name, u.avatar, u.username)}
            className={cn(
              'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all',
              myFollowing.includes(u.id)
                ? 'bg-surface-100 text-surface-600 hover:bg-danger-50 hover:text-danger-600 border border-surface-200'
                : 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm',
            )}
          >
            {myFollowing.includes(u.id) ? t('profile.following_btn') : t('profile.follow_btn')}
          </button>
        )}
      </div>
    ),
    [userId, myFollowing, onToggleFollow, navigate, t],
  );

  if (!activeStatView) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[70vh] overflow-hidden shadow-2xl flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-100 shrink-0">
          <h3 className="font-bold text-surface-900">{title}</h3>
          <button className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400" onClick={onClose}>
            <Icon name="close" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Posts tab */}
          {activeStatView === 'posts' && (() => {
            const myPosts = posts.filter(p => p.userId === userId && p.type === 'post');
            return myPosts.length === 0 ? (
              <div className="p-8 text-center text-surface-400">
                <Icon name="forum" size={36} className="mx-auto mb-2 opacity-30" />
                <p>{t('profile.no_posts')}</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-50">
                {myPosts.map(p => (
                  <div
                    key={p.id}
                    className="p-4 cursor-pointer hover:bg-surface-50 transition-colors"
                    onClick={() => { onClose(); navigate(ROUTES.COMMUNITY, { state: { openPostId: p.id } }); }}
                  >
                    <p dir={getTextDir(p.content)} className="text-sm text-surface-800 line-clamp-3">{p.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-surface-400 flex items-center gap-0.5">
                        <Icon name="favorite" size={11} /> {p.likesCount}
                      </span>
                      <span className="text-[10px] text-surface-400 flex items-center gap-0.5">
                        <Icon name="chat_bubble" size={11} /> {p.commentsCount}
                      </span>
                      <span className="text-[10px] text-surface-400 mr-auto">
                        {new Date(p.createdAt).toLocaleDateString('ar')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Quizzes tab */}
          {activeStatView === 'quizzes' && (() => {
            const myQuizzes = posts.filter(p => p.userId === userId && p.type === 'quiz');
            return myQuizzes.length === 0 ? (
              <div className="p-8 text-center text-surface-400">
                <Icon name="quiz" size={36} className="mx-auto mb-2 opacity-30" />
                <p>{t('profile.no_quizzes')}</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-50">
                {myQuizzes.map(p => (
                  <div
                    key={p.id}
                    className="p-4 cursor-pointer hover:bg-surface-50 transition-colors"
                    onClick={() => { onClose(); navigate(ROUTES.COMMUNITY, { state: { openPostId: p.id } }); }}
                  >
                    <span className="text-[10px] bg-purple-50 text-purple-600 px-1.5 rounded-full mb-1 inline-block">
                      {t('community.quiz_badge')}
                    </span>
                    <p dir={getTextDir(p.content || p.quizQuestion)} className="text-sm text-surface-800 line-clamp-3">
                      {p.content || p.quizQuestion}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-surface-400 flex items-center gap-0.5">
                        <Icon name="chat_bubble" size={11} /> {p.commentsCount}
                      </span>
                      <span className="text-[10px] text-surface-400 mr-auto">
                        {new Date(p.createdAt).toLocaleDateString('ar')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Followers tab */}
          {activeStatView === 'followers' && (
            followersList.length === 0 ? (
              <div className="p-8 text-center text-surface-400">
                <Icon name="people" size={36} className="mx-auto mb-2 opacity-30" />
                <p>{t('profile.no_followers')}</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-50">{followersList.map(renderUserRow)}</div>
            )
          )}

          {/* Following tab */}
          {activeStatView === 'following' && (
            followingList.length === 0 ? (
              <div className="p-8 text-center text-surface-400">
                <Icon name="person_add" size={36} className="mx-auto mb-2 opacity-30" />
                <p>{t('profile.no_following')}</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-50">{followingList.map(renderUserRow)}</div>
            )
          )}
        </div>
      </div>
    </div>
  );
});
