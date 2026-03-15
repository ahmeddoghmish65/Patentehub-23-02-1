/**
 * TrendingHashtags.tsx
 * Dropdown panel showing trending hashtags.
 */
import { memo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import { useCommunityUIStore } from '../store/communityUIStore';

export const TrendingHashtags = memo(function TrendingHashtags() {
  const { t } = useTranslation();
  const { trendingHashtags, activeHashtag, setActiveHashtag, setShowTrending } = useCommunityUIStore();

  return (
    <div
      className="absolute end-0 top-12 bg-white dark:bg-surface-100 rounded-2xl shadow-2xl border border-surface-100 z-50 overflow-hidden"
      style={{ width: 300 }}
    >
      <div className="flex items-center gap-2 p-4 border-b border-surface-100 bg-surface-50 dark:bg-surface-200">
        <Icon name="trending_up" size={18} className="text-primary-500" filled />
        <h3 className="font-bold text-surface-900">{t('community.trending_title')}</h3>
      </div>
      <div className="p-3">
        {trendingHashtags.length === 0 ? (
          <div className="py-6 text-center">
            <Icon name="tag" size={32} className="text-surface-200 mx-auto mb-2" />
            <p className="text-sm text-surface-400">{t('community.no_trending')}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {trendingHashtags.map(h => (
              <button
                key={h.id}
                className={cn(
                  'flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
                  activeHashtag === h.tag
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-surface-50 hover:bg-primary-50 text-surface-600 hover:text-primary-600 border-surface-200 hover:border-primary-200',
                )}
                onClick={() => {
                  setActiveHashtag(activeHashtag === h.tag ? null : h.tag);
                  setShowTrending(false);
                }}
              >
                <span className={activeHashtag === h.tag ? 'text-white/70' : 'text-primary-400'}>#</span>
                {h.tag}
                <span className={activeHashtag === h.tag ? 'text-white/60' : 'text-surface-400 text-[10px]'}>
                  {h.postCount}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
