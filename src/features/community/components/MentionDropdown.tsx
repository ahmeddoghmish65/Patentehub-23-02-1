/**
 * MentionDropdown.tsx
 * Autocomplete dropdown for @mention suggestions.
 */
import { memo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/i18n';
import type { CommunityUser } from '../types';

interface MentionDropdownProps {
  suggestions: CommunityUser[];
  onSelect: (u: CommunityUser) => void;
}

export const MentionDropdown = memo(function MentionDropdown({
  suggestions,
  onSelect,
}: MentionDropdownProps) {
  const { t } = useTranslation();

  return (
    <div className="absolute bottom-full left-0 right-0 bg-white border border-surface-200 rounded-xl shadow-2xl z-[200] overflow-hidden mb-1 max-h-52 overflow-y-auto">
      <div className="px-3 py-1.5 bg-surface-50 border-b border-surface-100 flex items-center gap-1.5">
        <Icon name="alternate_email" size={12} className="text-surface-400" />
        <p className="text-[10px] text-surface-400 font-medium">{t('community.mention_title')}</p>
      </div>
      {suggestions.map(u => (
        <button
          key={u.id}
          type="button"
          className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-primary-50 text-right transition-colors border-b border-surface-50 last:border-0"
          onMouseDown={e => { e.preventDefault(); onSelect(u); }}
        >
          <div
            className="w-8 h-8 rounded-full overflow-hidden shrink-0"
            style={{ background: u.avatar ? undefined : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
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
});
