/**
 * MentionText.tsx
 * Renders text with clickable @mentions (blue) and #hashtags (primary color).
 */
import { memo } from 'react';
import { cn } from '@/shared/utils/cn';
import { parseTextTokens } from '../utils/textUtils';

interface MentionTextProps {
  text: string;
  className?: string;
  onMentionClick?: (username: string) => void;
  onHashtagClick?: (tag: string) => void;
}

export const MentionText = memo(function MentionText({
  text,
  className,
  onMentionClick,
  onHashtagClick,
}: MentionTextProps) {
  const tokens = parseTextTokens(text);

  return (
    <>
      {tokens.map((token, i) => {
        if (token.type === 'mention') {
          return (
            <span
              key={i}
              className={cn(
                'text-blue-600 font-semibold cursor-pointer hover:text-blue-700 hover:underline underline-offset-2',
                className,
              )}
              onClick={e => { e.stopPropagation(); onMentionClick?.(token.value.slice(1)); }}
            >
              {token.value}
            </span>
          );
        }
        if (token.type === 'hashtag') {
          const tag = token.value.slice(1).toLowerCase();
          return (
            <span
              key={i}
              className={cn(
                'text-primary-600 font-semibold cursor-pointer hover:text-primary-700 hover:underline underline-offset-2',
                className,
              )}
              onClick={e => { e.stopPropagation(); onHashtagClick?.(tag); }}
            >
              {token.value}
            </span>
          );
        }
        return <span key={i}>{token.value}</span>;
      })}
    </>
  );
});
