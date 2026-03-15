import { useDataStore } from '@/store';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import type { TrainMode, TrainModeConfig } from '../types';

interface Props {
  onSelect: (mode: TrainMode) => void;
}

export function TrainingModeSelect({ onSelect }: Props) {
  const { questions, signs, dictEntries, mistakes } = useDataStore();
  const { t } = useTranslation();

  const modes: TrainModeConfig[] = [
    { id: 'questions',   icon: 'quiz',           label: t('training.mode_questions'),  desc: t('training.mode_questions_desc'),  count: questions.length,                              color: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
    { id: 'signs',       icon: 'traffic',         label: t('training.mode_signs'),      desc: t('training.mode_signs_desc'),      count: signs.length,                                  color: '#ef4444', gradient: 'from-red-500 to-red-600' },
    { id: 'dictionary',  icon: 'translate',       label: t('training.mode_dictionary'), desc: t('training.mode_dictionary_desc'), count: dictEntries.length,                            color: '#8b5cf6', gradient: 'from-purple-500 to-purple-600' },
    { id: 'weak-points', icon: 'psychology',      label: t('training.mode_weak'),       desc: t('training.mode_weak_desc'),       count: mistakes.length,                               color: '#f59e0b', gradient: 'from-amber-500 to-amber-600' },
    { id: 'timed',       icon: 'timer',           label: t('training.mode_timed'),      desc: t('training.mode_timed_desc'),      count: questions.length,                              color: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'marathon',    icon: 'directions_run',  label: t('training.mode_marathon'),   desc: t('training.mode_marathon_desc'),   count: questions.length,                              color: '#ec4899', gradient: 'from-pink-500 to-pink-600' },
    { id: 'daily',       icon: 'today',           label: t('training.mode_daily'),      desc: t('training.mode_daily_desc'),      count: questions.length + signs.length + dictEntries.length, color: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600' },
    { id: 'mixed',       icon: 'shuffle',         label: t('training.mode_mixed'),      desc: t('training.mode_mixed_desc'),      count: questions.length + signs.length + dictEntries.length, color: '#6366f1', gradient: 'from-indigo-500 to-indigo-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">{t('training.title')}</h1>
      <p className="text-surface-500 mb-6 text-sm">{t('training.desc')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modes.map(item => (
          <button
            key={item.id}
            className="bg-white rounded-xl p-4 border border-surface-100 hover:border-primary-200 hover:shadow-lg transition-all text-start group flex items-start gap-4"
            onClick={() => onSelect(item.id)}
            disabled={item.count === 0}
          >
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br text-white shadow-lg', item.gradient)}>
              <Icon name={item.icon} size={24} filled />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-surface-900 text-sm group-hover:text-primary-600 transition-colors">{item.label}</h3>
              <p className="text-xs text-surface-400 mt-0.5">{item.desc}</p>
              <p className="text-[10px] text-primary-500 font-medium mt-1">{item.count} {t('training.items_available')}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
