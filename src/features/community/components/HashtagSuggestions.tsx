/**
 * HashtagSuggestions.tsx
 * Dropdown for #hashtag autocomplete.
 */
import { memo } from 'react';
import { useTranslation } from '@/i18n';
import type { Hashtag } from '../types';

interface HashtagSuggestionsProps {
  suggestions: Hashtag[];
  onSelect: (tag: Hashtag) => void;
}

export const HashtagSuggestions = memo(function HashtagSuggestions({
  suggestions,
  onSelect,
}: HashtagSuggestionsProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-full left-0 right-0 bg-white border border-surface-200 rounded-xl shadow-2xl z-[200] overflow-hidden mb-1 max-h-40 overflow-y-auto">
      <div className="px-3 py-1.5 bg-surface-50 border-b border-surface-100">
        <p className="text-[10px] text-surface-400 font-medium">{t('community.hashtag_suggestions')}</p>
      </div>
      {suggestions.map(h => (
        <button
          key={h.id}
          type="button"
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-primary-50 text-right transition-colors"
          onMouseDown={e => { e.preventDefault(); onSelect(h); }}
        >
          <span className="text-xs font-semibold text-primary-600">#{h.tag}</span>
          <span className="text-[10px] text-surface-400">{h.postCount} {t('community.hashtag_posts')}</span>
        </button>
      ))}
    </div>
  );
});
