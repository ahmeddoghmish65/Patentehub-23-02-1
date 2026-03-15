import { useEffect } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { useTranslation } from '@/i18n';
import { cn } from '@/shared/utils/cn';

interface StreakModalProps {
  currentStreak: number;
  bestStreak: number;
  onStartLesson: () => void;
  onClose: () => void;
}

export function StreakModal({ currentStreak, bestStreak, onStartLesson, onClose }: StreakModalProps) {
  const { t } = useTranslation();

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-sm bg-white dark:bg-surface-100 rounded-3xl shadow-2xl overflow-hidden',
        'animate-fade-in-up',
      )}>
        {/* Top orange accent */}
        <div className="h-2 bg-gradient-to-r from-orange-400 to-amber-400" />

        <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center gap-5">
          {/* Fire icon */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center">
              <Icon name="local_fire_department" size={44} className="text-orange-500" filled />
            </div>
            {/* Streak badge */}
            {currentStreak > 0 && (
              <span className="absolute -top-1 -end-1 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                {currentStreak}
              </span>
            )}
          </div>

          {/* Title & subtitle */}
          <div className="space-y-2">
            <h2 className="text-xl font-black text-surface-900 leading-snug">
              {t('dashboard.streak_modal_title')}
            </h2>
            <p className="text-sm text-surface-500 leading-relaxed">
              {t('dashboard.streak_modal_subtitle')}
            </p>
          </div>

          {/* Stats row */}
          <div className="w-full grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl p-4 border border-orange-100 dark:border-orange-800/30">
              <p className="text-3xl font-black text-orange-600">{currentStreak}</p>
              <p className="text-xs text-orange-500 mt-1">{t('dashboard.streak_modal_current')}</p>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl p-4 border border-primary-100 dark:border-primary-800/30">
              <p className="text-3xl font-black text-primary-600">{bestStreak}</p>
              <p className="text-xs text-primary-500 mt-1">{t('dashboard.streak_modal_best')}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="w-full flex flex-col gap-3 pt-1">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={onStartLesson}
              icon={<Icon name="play_arrow" size={22} className="text-white" filled />}
            >
              {t('dashboard.streak_modal_start_lesson')}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
