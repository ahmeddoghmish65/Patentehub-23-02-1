import React, { useMemo } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import type { UserProgress, UserMistake } from '@/shared/types';
import type { ExamReadinessLevel } from '@/infrastructure/database/services/examReadinessService';
import { LEVEL_STYLE } from '../utils/profileUtils';

interface ReadinessResult {
  score: number;
  level: ExamReadinessLevel;
  factors: {
    examSimulation: number;
    quizAccuracy: number;
    coverage: number;
    consistency: number;
    trend: number;
  };
  weaknessPenalty: number;
}

interface ProfileExamReadinessProps {
  readiness: ReadinessResult;
  progress: UserProgress;
  mistakes: UserMistake[];
}

const FACTOR_ICONS = ['quiz', 'check_circle', 'book', 'schedule', 'trending_up'];
const FACTOR_COLORS = [
  { icon: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-950/40',     border: 'border-blue-100 dark:border-blue-900/50' },
  { icon: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-950/40',   border: 'border-green-100 dark:border-green-900/50' },
  { icon: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-100 dark:border-purple-900/50' },
  { icon: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-100 dark:border-orange-900/50' },
  { icon: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-950/40',     border: 'border-teal-100 dark:border-teal-900/50' },
];

const CIRCLE_COLOR: Record<ExamReadinessLevel, string> = {
  not_ready:  '#ef4444',
  beginner:   '#f97316',
  developing: '#eab308',
  ready:      '#22c55e',
  excellent:  '#10b981',
};

const METRIC_ITEMS = (progress: UserProgress, t: (k: string) => string) => [
  { label: t('profile.total_quizzes'),          value: progress.totalQuizzes,              icon: 'quiz',                   color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-950/40',     border: 'border-blue-100 dark:border-blue-900/50' },
  { label: t('profile.current_streak'),          value: `${progress.currentStreak} ${t('profile.streak_days')}`, icon: 'local_fire_department', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/40', border: 'border-orange-100 dark:border-orange-900/50' },
  { label: t('profile.xp_points'),               value: progress.xp,                        icon: 'stars',                  color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-950/40',   border: 'border-amber-100 dark:border-amber-900/50' },
  { label: t('profile.completed_lessons_label'), value: progress.completedLessons.length,   icon: 'school',                 color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-950/40',   border: 'border-green-100 dark:border-green-900/50' },
  { label: t('profile.best_streak'),             value: `${progress.bestStreak} ${t('profile.streak_days')}`,   icon: 'emoji_events',          color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/40', border: 'border-purple-100 dark:border-purple-900/50' },
  { label: t('profile.learning_days'),           value: progress.totalStudyDays || 0,       icon: 'calendar_month',         color: 'text-teal-600',   bg: 'bg-teal-50 dark:bg-teal-950/40',     border: 'border-teal-100 dark:border-teal-900/50' },
];

export const ProfileExamReadiness = React.memo(function ProfileExamReadiness({
  readiness,
  progress,
  mistakes,
}: ProfileExamReadinessProps) {
  const { t } = useTranslation();

  const levelStyle = LEVEL_STYLE[readiness.level];
  const circleStroke = CIRCLE_COLOR[readiness.level] ?? '#3b82f6';
  const totalAnswers = progress.correctAnswers + progress.wrongAnswers;
  const accuracy = totalAnswers > 0 ? Math.round((progress.correctAnswers / totalAnswers) * 100) : 0;

  const factors = useMemo(() => [
    { key: 'exam',        value: readiness.factors.examSimulation, label: t('dashboard.readiness_factor_exam') },
    { key: 'accuracy',    value: readiness.factors.quizAccuracy,   label: t('dashboard.readiness_factor_accuracy') },
    { key: 'coverage',    value: readiness.factors.coverage,       label: t('dashboard.readiness_factor_coverage') },
    { key: 'consistency', value: readiness.factors.consistency,    label: t('dashboard.readiness_factor_consistency') },
    { key: 'trend',       value: readiness.factors.trend,          label: t('dashboard.readiness_factor_trend') },
  ], [readiness.factors, t]);

  const metrics = useMemo(() => METRIC_ITEMS(progress, t), [progress, t]);

  return (
    <div className="bg-white dark:bg-surface-100 rounded-xl p-5 border border-surface-100">
      <h2 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
        <Icon name="trending_up" size={20} className="text-primary-500" />
        {t('profile.progress_stats')}
      </h2>

      {/* Exam Readiness Card */}
      <div className="rounded-xl mb-4">
        <div className="flex items-center gap-4 mb-4 bg-surface-50 dark:bg-surface-200 rounded-xl p-4">
          <div className="relative w-20 h-20 shrink-0" dir="ltr">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="7" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke={circleStroke} strokeWidth="7" strokeLinecap="round"
                strokeDasharray={`${readiness.score * 2.01} ${201 - readiness.score * 2.01}`}
                style={{ transition: 'stroke-dasharray 1.2s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-surface-800 leading-none">{readiness.score}</span>
              <span className="text-xs font-bold text-surface-400">%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0', levelStyle.bg)}>
                <Icon name="assignment_turned_in" size={14} className={levelStyle.text} filled />
              </div>
              <p className="text-sm font-semibold text-surface-700">{t('dashboard.readiness_card_title')}</p>
            </div>
            <span className={cn('text-xs font-bold px-3 py-1 rounded-full', levelStyle.badge)}>
              {t(`dashboard.readiness_level_${readiness.level}`)}
            </span>
          </div>
        </div>

        {/* Factors grid */}
        <div className="grid grid-cols-2 gap-2">
          {factors.map((f, i) => {
            const c = FACTOR_COLORS[i] ?? FACTOR_COLORS[0];
            return (
              <div key={f.key} className={cn('rounded-xl p-3 border flex items-center gap-2.5', c.bg, c.border)}>
                <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-surface-200/80 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon name={FACTOR_ICONS[i] ?? 'star'} size={18} className={c.icon} filled />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-surface-900 leading-none mb-0.5">{f.value}%</p>
                  <p className="text-xs text-surface-500 truncate leading-tight">{f.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {readiness.weaknessPenalty > 0 && (
          <div className="mt-2 flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 rounded-xl px-3 py-2">
            <Icon name="remove_circle" size={14} className="text-red-500 shrink-0" filled />
            <span className="text-xs text-red-600 font-medium">
              -{readiness.weaknessPenalty} {t('dashboard.readiness_weakness_label')} ({mistakes.length})
            </span>
          </div>
        )}
      </div>

      {/* Answer Distribution */}
      {totalAnswers > 0 ? (
        <div className="mb-4 bg-surface-50 dark:bg-surface-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-surface-800">{t('profile.answer_dist')}</span>
            <span className="text-xs font-semibold bg-white dark:bg-surface-100 text-surface-600 px-2.5 py-0.5 rounded-full border border-surface-200">
              {totalAnswers} {t('profile.total_label')}
            </span>
          </div>
          <div className="w-full bg-danger-100 rounded-full h-2.5 overflow-hidden flex mb-3">
            <div
              className="h-full bg-success-500 rounded-full transition-all duration-700"
              style={{ width: `${accuracy}%` }}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-success-500 shrink-0 inline-block" />
              <span className="text-xs text-surface-600">{t('profile.correct_label')}</span>
              <strong className="text-xs text-success-600">{progress.correctAnswers}</strong>
            </div>
            <span className="text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full border border-primary-100 dark:border-primary-800/50">
              {accuracy}%
            </span>
            <div className="flex items-center gap-1.5">
              <strong className="text-xs text-danger-500">{progress.wrongAnswers}</strong>
              <span className="text-xs text-surface-600">{t('profile.wrong_label')}</span>
              <span className="w-2.5 h-2.5 rounded-full bg-danger-400 shrink-0 inline-block" />
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-4 bg-surface-50 dark:bg-surface-200 rounded-xl p-4 text-center">
          <Icon name="quiz" size={28} className="text-surface-300 mx-auto mb-2" />
          <p className="text-sm text-surface-400">{t('profile.no_quizzes_label')}</p>
        </div>
      )}

      {/* Key metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((m, i) => (
          <div key={i} className={cn('rounded-xl p-3 border flex items-center gap-2.5', m.bg, m.border)}>
            <div className="w-9 h-9 rounded-xl bg-white/80 dark:bg-surface-300/80 flex items-center justify-center shrink-0 shadow-sm">
              <Icon name={m.icon} size={18} className={m.color} filled />
            </div>
            <div className="min-w-0">
              <p className="text-base font-bold text-surface-900 leading-none mb-0.5 truncate">{m.value}</p>
              <p className="text-xs text-surface-500 truncate">{m.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
