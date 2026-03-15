import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import type { TrainMode } from '../types';

interface Props {
  mode: TrainMode;
  score: number;
  total: number;
  timedElapsed: number;
  modeLabel: string;
  onRetry: () => void;
  onChooseOther: () => void;
}

export function TrainingResult({ mode, score, total, timedElapsed, modeLabel, onRetry, onChooseOther }: Props) {
  const { t } = useTranslation();
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const resultIcon = pct >= 70 ? 'emoji_events' : pct >= 40 ? 'thumb_up' : 'psychology';
  const resultColor = pct >= 70 ? 'bg-success-50' : pct >= 40 ? 'bg-warning-50' : 'bg-danger-50';
  const iconColor = pct >= 70 ? 'text-success-500' : pct >= 40 ? 'text-warning-500' : 'text-danger-500';
  const barColor = pct >= 70 ? 'bg-success-500' : pct >= 40 ? 'bg-warning-500' : 'bg-danger-500';

  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="bg-white rounded-2xl p-8 border border-surface-100">
        <div className={cn('w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6', resultColor)}>
          <Icon name={resultIcon} size={40} className={iconColor} filled />
        </div>

        <h2 className="text-2xl font-bold text-surface-900 mb-2">{t('training.result_title')}</h2>
        <p className="text-surface-500 text-sm mb-2">{modeLabel}</p>
        <p className="text-4xl font-bold text-primary-600 mb-1">{score}/{total}</p>
        <p className="text-surface-500 mb-2">{pct}% {t('training.result_pct')}</p>

        {mode === 'timed' && (
          <p className="text-sm text-surface-400 mb-4">
            {t('training.result_time_label')}: {Math.floor(timedElapsed / 60)}:{(timedElapsed % 60).toString().padStart(2, '0')}
          </p>
        )}

        <div className="w-full bg-surface-100 rounded-full h-3 mb-8">
          <div className={cn('rounded-full h-3 transition-all', barColor)} style={{ width: `${pct}%` }} />
        </div>

        <div className="space-y-3">
          <Button fullWidth onClick={onRetry} icon={<Icon name="replay" size={20} />}>
            {t('training.retry')}
          </Button>
          <Button fullWidth variant="outline" onClick={onChooseOther}>
            {t('training.choose_other')}
          </Button>
        </div>
      </div>
    </div>
  );
}
