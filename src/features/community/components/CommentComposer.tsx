/**
 * CommentComposer.tsx
 * The inline text input for writing a new comment.
 */
import { memo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/i18n';
import { useAuthStore } from '@/store/auth.store';
import { useCommunityUIStore } from '../store/communityUIStore';
import { MentionDropdown } from './MentionDropdown';
import type { CommunityUser } from '../types';

interface CommentComposerProps {
  postId: string;
  mentionSuggestions: CommunityUser[];
  onSubmit: (postId: string) => void;
  onInsertMention: (username: string, currentText: string, setter: (t: string) => void) => void;
  onTextChange: (text: string, setter: (t: string) => void) => void;
}

export const CommentComposer = memo(function CommentComposer({
  postId,
  mentionSuggestions,
  onSubmit,
  onInsertMention,
  onTextChange,
}: CommentComposerProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { newComment, setNewComment, allUsers } = useCommunityUIStore();

  const liveAvatar = user
    ? (allUsers.find(u => u.id === user.id)?.avatar || user.avatar || '')
    : '';

  return (
    <div className="flex gap-2 items-center relative">
      {/* Current user avatar */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: liveAvatar ? undefined : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
      >
        {liveAvatar ? (
          <img src={liveAvatar} className="w-7 h-7 rounded-full object-cover" alt="" />
        ) : (
          <span className="text-[10px] font-bold text-white">{(user?.name || '?').charAt(0)}</span>
        )}
      </div>

      <div className="flex-1 relative">
        <input
          dir="auto"
          className="w-full border border-surface-200 dark:border-surface-300 dark:bg-surface-200 dark:text-surface-900 rounded-lg px-3 py-2 text-sm focus:border-primary-500"
          placeholder={t('community.comment_placeholder')}
          value={newComment}
          onChange={e => onTextChange(e.target.value, setNewComment)}
          onKeyDown={e => { if (e.key === 'Enter') onSubmit(postId); }}
        />
        {mentionSuggestions.length > 0 && (
          <MentionDropdown
            suggestions={mentionSuggestions}
            onSelect={u => onInsertMention(u.username || u.name, newComment, setNewComment)}
          />
        )}
      </div>

      <Button size="sm" onClick={() => onSubmit(postId)} disabled={!newComment.trim()}>
        <Icon name="send" size={14} />
      </Button>
    </div>
  );
});
