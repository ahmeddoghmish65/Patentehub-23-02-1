/**
 * useMentionParser.ts
 * Handles @mention and #hashtag autocomplete in text inputs.
 * Also provides sendMentionNotifs for notifying mentioned users.
 */
import { useCallback } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useCommunityUIStore } from '../store/communityUIStore';
import { suggestHashtags } from '../services/hashtagService';
import { createNotification } from '../services/notificationService';

export function useMentionParser() {
  const { user } = useAuthStore();
  const {
    allUsers,
    setMentionSuggestions,
    setHashtagSuggestions,
    mentionSuggestions,
    hashtagSuggestions,
  } = useCommunityUIStore();

  /**
   * Call on every keystroke in a text input.
   * Updates mention/hashtag suggestions based on the last word typed.
   */
  const handleTextChange = useCallback(
    (text: string, setter: (t: string) => void) => {
      setter(text);
      const lastWord = text.split(/\s/).pop() || '';
      if (lastWord.startsWith('@') && lastWord.length > 1) {
        const q = lastWord.slice(1).toLowerCase();
        setMentionSuggestions(
          allUsers
            .filter(u =>
              u.id !== user?.id &&
              (u.name.toLowerCase().includes(q) ||
               (u.username && u.username.toLowerCase().includes(q))),
            )
            .slice(0, 6),
        );
        setHashtagSuggestions([]);
      } else if (lastWord.startsWith('#') && lastWord.length > 1) {
        const q = lastWord.slice(1).toLowerCase();
        setMentionSuggestions([]);
        suggestHashtags(q)
          .then(tags => setHashtagSuggestions(tags))
          .catch(() => {});
      } else {
        setMentionSuggestions([]);
        setHashtagSuggestions([]);
      }
    },
    [allUsers, user, setMentionSuggestions, setHashtagSuggestions],
  );

  /** Replace the last @-word in text with @username + space. */
  const insertMention = useCallback(
    (username: string, currentText: string, setter: (t: string) => void) => {
      const words = currentText.split(/\s/);
      words[words.length - 1] = `@${username} `;
      setter(words.join(' '));
      setMentionSuggestions([]);
    },
    [setMentionSuggestions],
  );

  /** Replace the last #-word in text with #tag + space. */
  const insertHashtag = useCallback(
    (tag: string, currentText: string, setter: (t: string) => void) => {
      const words = currentText.split(/\s/);
      words[words.length - 1] = `#${tag} `;
      setter(words.join(' '));
      setHashtagSuggestions([]);
    },
    [setHashtagSuggestions],
  );

  /** Parse @mentions from text and fire community notifications. */
  const sendMentionNotifs = useCallback(
    async (text: string, postId?: string, commentId?: string) => {
      if (!user) return;
      const mentionMatches = text.match(/@(\w+)/g) || [];
      for (const mention of mentionMatches) {
        const uname = mention.slice(1).toLowerCase();
        const mentioned = allUsers.find(
          u =>
            (u.username || '').toLowerCase() === uname ||
            u.name.toLowerCase() === uname,
        );
        if (mentioned && mentioned.id !== user.id) {
          await createNotification({
            toUserId: mentioned.id,
            fromUserId: user.id,
            fromUserName: user.name,
            fromUserAvatar: user.avatar || '',
            type: 'mention',
            postId,
            commentId,
          });
        }
      }
    },
    [user, allUsers],
  );

  return {
    mentionSuggestions,
    hashtagSuggestions,
    handleTextChange,
    insertMention,
    insertHashtag,
    sendMentionNotifs,
  };
}
