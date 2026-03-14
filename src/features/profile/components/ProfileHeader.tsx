import React, { useCallback } from 'react';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { useTranslation } from '@/i18n';
import { useAuthStore } from '@/store';
import type { User as FullUser } from '@/types';

type User = Omit<FullUser, 'password'>;
import type { ActiveStatView } from '../types/profile.types';
import { ProfileAvatarUpload } from './ProfileAvatarUpload';

interface ProfileHeaderProps {
  user: User;
  followerCount: number;
  followingCount: number;
  postsCount: number;
  quizzesCount: number;
  onStatClick: (view: ActiveStatView) => void;
  onCompleteProfileClick: () => void;
  storedBio: string;
}

export const ProfileHeader = React.memo(function ProfileHeader({
  user,
  followerCount,
  followingCount,
  postsCount,
  quizzesCount,
  onStatClick,
  onCompleteProfileClick,
  storedBio,
}: ProfileHeaderProps) {
  const { t } = useTranslation();
  const { updateProfile } = useAuthStore();

  const handleAvatarChange = useCallback(
    (dataUrl: string) => updateProfile({ avatar: dataUrl }),
    [updateProfile],
  );
  const handleAvatarDelete = useCallback(
    () => updateProfile({ avatar: '' }),
    [updateProfile],
  );

  const statsItems: { label: string; value: number; view: ActiveStatView }[] = [
    { label: t('profile.posts_stat'),     value: postsCount,     view: 'posts' },
    { label: t('profile.questions_stat'), value: quizzesCount,   view: 'quizzes' },
    { label: t('profile.followers_stat'), value: followerCount,  view: 'followers' },
    { label: t('profile.following_stat'), value: followingCount, view: 'following' },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-surface-100">
      <div className="flex items-start gap-4">
        <ProfileAvatarUpload
          avatar={user.avatar}
          name={user.name}
          onAvatarChange={handleAvatarChange}
          onAvatarDelete={handleAvatarDelete}
          onFileTooLarge={() => alert(t('profile.photo_too_large'))}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold text-surface-900">{user.name}</h1>
            {user.verified && <VerifiedBadge size="md" tooltip />}
          </div>
          {user.username && (
            <p className="text-sm text-primary-500 font-medium mb-0.5">@{user.username}</p>
          )}
          <p className="text-xs text-surface-400">{user.email}</p>
          {storedBio && (
            <p className="text-sm text-surface-600 mt-1 line-clamp-2">{storedBio}</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-medium">
              {t('profile.level_label')} {user.progress.level}
            </span>
            <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full font-medium">
              {user.progress.xp} XP
            </span>
            {!user.profileComplete && (
              <button
                className="text-xs bg-warning-50 text-warning-600 px-2 py-0.5 rounded-full font-medium animate-pulse"
                onClick={onCompleteProfileClick}
              >
                {t('profile.complete_badge')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Social stats row */}
      <div className="grid grid-cols-4 gap-1.5 mt-4 border-t border-surface-50 pt-4">
        {statsItems.map(s => (
          <button
            key={s.view}
            className="text-center py-1 rounded-xl hover:bg-surface-50 transition-colors"
            onClick={() => onStatClick(s.view)}
          >
            <p className="text-lg font-black text-surface-900 leading-tight">{s.value}</p>
            <p className="text-[11px] text-primary-500 font-medium">{s.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
});
