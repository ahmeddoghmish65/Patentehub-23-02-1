/**
 * PostComposer.tsx
 * The new post creation form — supports regular posts and quiz posts.
 */
import { memo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import { useAuthStore } from '@/store/auth.store';
import { useCommunityUIStore } from '../store/communityUIStore';
import { MentionDropdown } from './MentionDropdown';
import { HashtagSuggestions } from './HashtagSuggestions';
import type { CommunityUser, Hashtag } from '../types';

interface PostComposerProps {
  mentionSuggestions: CommunityUser[];
  hashtagSuggestions: Hashtag[];
  posting: boolean;
  onPost: () => void;
  onTextChange: (text: string, setter: (t: string) => void) => void;
  onInsertMention: (username: string, currentText: string, setter: (t: string) => void) => void;
  onInsertHashtag: (tag: string, currentText: string, setter: (t: string) => void) => void;
}

export const PostComposer = memo(function PostComposer({
  mentionSuggestions,
  hashtagSuggestions,
  posting,
  onPost,
  onTextChange,
  onInsertMention,
  onInsertHashtag,
}: PostComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const {
    newPost, setNewPost,
    postType, setPostType,
    quizQuestion, setQuizQuestion,
    quizAnswer, setQuizAnswer,
    postImage, setPostImage,
    communityAllowImages,
    allUsers,
  } = useCommunityUIStore();

  const restrictions = (user as Record<string, unknown> | undefined)?.communityRestrictions as Record<string, boolean> | undefined;
  const canPost = !restrictions || restrictions.canPost !== false;

  const liveAvatar = user ? (allUsers.find(u => u.id === user.id)?.avatar || user.avatar || '') : '';
  const isQuiz = postType === 'quiz';

  return (
    <div className="bg-white dark:bg-surface-100 rounded-2xl border border-surface-100 mb-6 overflow-hidden">
      {/* Row 1: avatar + type tabs */}
      <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
          style={{ background: liveAvatar ? undefined : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          {liveAvatar
            ? <img src={liveAvatar} className="w-7 h-7 rounded-full object-cover" alt="" />
            : <span className="text-[10px] font-bold text-white">{(user?.name || '?').charAt(0)}</span>}
        </div>
        <div className="flex items-center gap-1">
          <button
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
              postType === 'post' ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200',
            )}
            onClick={() => setPostType('post')}
          >
            <Icon name="edit_note" size={13} /> {t('community.post_type')}
          </button>
          <button
            className={cn(
              'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
              postType === 'quiz' ? 'bg-purple-500 text-white' : 'bg-surface-100 text-surface-500 hover:bg-surface-200',
            )}
            onClick={() => setPostType('quiz')}
          >
            <Icon name="quiz" size={13} /> {t('community.quiz_type')}
          </button>
        </div>
      </div>

      {/* Row 2: content */}
      <div className="px-3.5 pb-2">
        {isQuiz ? (
          <div className="space-y-2">
            <div className="relative">
              <textarea
                dir="auto"
                className="w-full border border-purple-200 dark:border-purple-700 rounded-xl px-3 py-2 text-sm resize-none focus:border-purple-400 focus:outline-none bg-purple-50/30 dark:bg-surface-200 dark:text-surface-900"
                rows={2}
                placeholder={t('community.quiz_q_placeholder')}
                value={quizQuestion}
                onChange={e => onTextChange(e.target.value, setQuizQuestion)}
              />
              {mentionSuggestions.length > 0 && (
                <MentionDropdown
                  suggestions={mentionSuggestions}
                  onSelect={u => onInsertMention(u.username || u.name, quizQuestion, setQuizQuestion)}
                />
              )}
            </div>
            <div className="flex gap-2">
              <button
                className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all',
                  quizAnswer ? 'border-success-500 bg-success-50 text-success-700' : 'border-surface-200 text-surface-400 hover:border-success-300')}
                onClick={() => setQuizAnswer(true)}
              >
                {t('community.correct_quiz')}
              </button>
              <button
                className={cn('flex-1 py-1.5 rounded-lg text-xs font-bold border-2 transition-all',
                  !quizAnswer ? 'border-danger-500 bg-danger-50 text-danger-700' : 'border-surface-200 text-surface-400 hover:border-danger-300')}
                onClick={() => setQuizAnswer(false)}
              >
                {t('community.wrong_quiz')}
              </button>
            </div>
            <textarea
              dir="auto"
              className="w-full border border-surface-200 dark:border-surface-300 dark:bg-surface-200 dark:text-surface-900 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-surface-300"
              rows={1}
              placeholder={t('community.quiz_optional')}
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
            />
          </div>
        ) : (
          <div className="relative">
            <textarea
              dir="auto"
              className="w-full border border-surface-200 dark:border-surface-300 dark:bg-surface-200 dark:text-surface-900 rounded-xl px-3 py-2 text-sm resize-none focus:border-primary-400 focus:outline-none"
              rows={3}
              placeholder={t('community.post_placeholder')}
              value={newPost}
              onChange={e => onTextChange(e.target.value, setNewPost)}
            />
            {mentionSuggestions.length > 0 && (
              <MentionDropdown
                suggestions={mentionSuggestions}
                onSelect={u => onInsertMention(u.username || u.name, newPost, setNewPost)}
              />
            )}
            {hashtagSuggestions.length > 0 && (
              <HashtagSuggestions
                suggestions={hashtagSuggestions}
                onSelect={h => onInsertHashtag(h.tag, newPost, setNewPost)}
              />
            )}
          </div>
        )}
      </div>

      {/* Image preview */}
      {communityAllowImages && postImage && (
        <div className="px-3.5 pb-2">
          <div className="relative rounded-xl overflow-hidden border border-surface-200">
            <img src={postImage} alt="" className="w-full max-h-40 object-cover" />
            <button
              className="absolute top-1.5 left-1.5 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center"
              onClick={() => setPostImage('')}
            >
              <Icon name="close" size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Row 3: tools + publish */}
      <div className="flex items-center gap-2 px-3.5 pb-3 border-t border-surface-50 pt-2">
        {communityAllowImages && !postImage && (
          <label className="flex items-center gap-1 text-xs text-surface-400 hover:text-primary-600 cursor-pointer px-2 py-1 rounded-lg hover:bg-surface-50 transition-colors">
            <Icon name="image" size={15} />
            <span>{t('community.image')}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => setPostImage(reader.result as string);
                reader.readAsDataURL(file);
                e.target.value = '';
              }}
            />
          </label>
        )}
        {!canPost && (
          <p className="text-[11px] text-red-500 flex items-center gap-1">
            <Icon name="block" size={11} /> {t('community.restricted')}
          </p>
        )}
        <div className="flex-1" />
        <Button
          size="sm"
          onClick={onPost}
          loading={posting}
          disabled={!canPost || (isQuiz ? !quizQuestion.trim() : !newPost.trim())}
          className={cn('!text-xs !px-4', isQuiz ? '!bg-purple-500 hover:!bg-purple-600' : '')}
        >
          {t('community.publish')}
        </Button>
      </div>
    </div>
  );
});
