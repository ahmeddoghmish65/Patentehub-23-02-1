import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useDataStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { ROUTES } from '@/constants';
import { calculateExamReadiness } from '@/services/examReadinessService';
import type { ExamReadinessLevel } from '@/services/examReadinessService';

// ─── Level colours (Tailwind utility strings) ─────────────────────────────────
const LEVEL_STYLE: Record<ExamReadinessLevel, { bg: string; text: string; bar: string; badge: string }> = {
  not_ready:  { bg: 'bg-red-50',     text: 'text-red-600',     bar: 'bg-red-400',     badge: 'bg-red-100 text-red-600' },
  beginner:   { bg: 'bg-orange-50',  text: 'text-orange-600',  bar: 'bg-orange-400',  badge: 'bg-orange-100 text-orange-600' },
  developing: { bg: 'bg-yellow-50',  text: 'text-yellow-600',  bar: 'bg-yellow-400',  badge: 'bg-yellow-100 text-yellow-700' },
  ready:      { bg: 'bg-green-50',   text: 'text-green-600',   bar: 'bg-green-500',   badge: 'bg-green-100 text-green-700' },
  excellent:  { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
};

// ─── Mini factor bar ──────────────────────────────────────────────────────────
function FactorBar({ label, value, barClass }: { label: string; value: number; barClass: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-surface-500">{label}</span>
        <span className="text-[10px] font-bold text-surface-700">{value}%</span>
      </div>
      <div className="w-full bg-surface-100 rounded-full h-1.5">
        <div
          className={cn('rounded-full h-1.5 transition-all duration-700', barClass)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    loadSections, loadLessons, loadMistakes, loadQuestions, loadQuizHistory,
    mistakes, sections, lessons, questions, quizHistory,
  } = useDataStore();
  const { t } = useTranslation();

  useEffect(() => {
    loadSections();
    loadLessons();
    loadMistakes();
    loadQuestions();
    loadQuizHistory();
  }, [loadSections, loadLessons, loadMistakes, loadQuestions, loadQuizHistory]);

  if (!user) return null;

  const { progress } = user;
  const totalAnswers = progress.correctAnswers + progress.wrongAnswers;
  const accuracy = totalAnswers > 0 ? Math.round((progress.correctAnswers / totalAnswers) * 100) : 0;

  // ─── Run the advanced exam readiness algorithm ───────────────────────────
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const readiness = useMemo(() => calculateExamReadiness({
    quizHistory,
    mistakes,
    progress,
    totalLessons:   lessons.length,
    totalQuestions: questions.length,
  }), [quizHistory, mistakes, progress, lessons.length, questions.length]);

  // Persist computed score back to IndexedDB (only when it changes)
  useEffect(() => {
    if (readiness.score === progress.examReadiness) return;
    import('@/db/database').then(({ getDB }) => {
      getDB().then(db => {
        db.get('users', user.id).then(u => {
          if (u) { u.progress.examReadiness = readiness.score; db.put('users', u); }
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readiness.score]);

  const levelStyle = LEVEL_STYLE[readiness.level];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.greeting_morning') : t('dashboard.greeting_afternoon');

  const factors = [
    { key: 'exam',        value: readiness.factors.examSimulation, label: t('dashboard.readiness_factor_exam') },
    { key: 'accuracy',    value: readiness.factors.quizAccuracy,   label: t('dashboard.readiness_factor_accuracy') },
    { key: 'coverage',    value: readiness.factors.coverage,       label: t('dashboard.readiness_factor_coverage') },
    { key: 'consistency', value: readiness.factors.consistency,    label: t('dashboard.readiness_factor_consistency') },
    { key: 'trend',       value: readiness.factors.trend,          label: t('dashboard.readiness_factor_trend') },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-1/4 translate-y-1/4" />
        <div className="absolute top-4 left-4 w-16 h-16 bg-white/5 rounded-full" />
        <div className="relative">
          <div className="flex items-center gap-4 mb-4">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-14 h-14 rounded-xl object-cover border-2 border-white/30 shadow-lg" />
            ) : (
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 shadow-lg">
                <span className="text-xl font-bold">{user.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="text-primary-200 text-sm">{greeting} 👋</p>
              <h1 className="text-xl font-bold">{user.name}</h1>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon name="local_fire_department" size={18} className="text-orange-300" filled />
                <span className="text-lg font-bold">{progress.currentStreak}</span>
              </div>
              <span className="text-[10px] text-primary-200">{t('dashboard.streak_days')}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon name="military_tech" size={18} className="text-yellow-300" filled />
                <span className="text-lg font-bold">{progress.level}</span>
              </div>
              <span className="text-[10px] text-primary-200">{t('dashboard.level')}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon name="target" size={18} className="text-green-300" filled />
                <span className="text-lg font-bold">{accuracy}%</span>
              </div>
              <span className="text-[10px] text-primary-200">{t('dashboard.accuracy')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Exam Readiness Card ──────────────────────────────────────────────── */}
      <div className={cn('rounded-2xl border p-5 space-y-4', levelStyle.bg,
        readiness.level === 'excellent' ? 'border-emerald-200' :
        readiness.level === 'ready'     ? 'border-green-200' :
        readiness.level === 'developing'? 'border-yellow-200' :
        readiness.level === 'beginner'  ? 'border-orange-200' :
        'border-red-200'
      )}>
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="assignment_turned_in" size={20} className={levelStyle.text} filled />
            <h3 className={cn('font-bold text-sm', levelStyle.text)}>
              {t('dashboard.readiness_card_title')}
            </h3>
          </div>
          <span className={cn('text-xs font-bold px-2.5 py-1 rounded-full', levelStyle.badge)}>
            {t(`dashboard.readiness_level_${readiness.level}`)}
          </span>
        </div>

        {/* Score circle + main bar */}
        <div className="flex items-center gap-4">
          {/* Circle */}
          <div className="relative shrink-0 w-20 h-20">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" strokeWidth="7" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                strokeWidth="7" strokeLinecap="round"
                className={cn('transition-all duration-1000',
                  readiness.level === 'excellent' ? 'stroke-emerald-500' :
                  readiness.level === 'ready'     ? 'stroke-green-500' :
                  readiness.level === 'developing'? 'stroke-yellow-400' :
                  readiness.level === 'beginner'  ? 'stroke-orange-400' :
                  'stroke-red-400'
                )}
                strokeDasharray={`${readiness.score * 2.01} ${201 - readiness.score * 2.01}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-xl font-extrabold leading-none', levelStyle.text)}>
                {readiness.score}%
              </span>
            </div>
          </div>

          {/* Factor bars */}
          <div className="flex-1 space-y-2">
            {factors.map(f => (
              <FactorBar key={f.key} label={f.label} value={f.value} barClass={levelStyle.bar} />
            ))}
          </div>
        </div>

        {/* Weakness penalty */}
        {readiness.weaknessPenalty > 0 && (
          <div className="flex items-center gap-2 bg-white/60 rounded-xl px-3 py-2">
            <Icon name="remove_circle" size={14} className="text-danger-500 shrink-0" filled />
            <span className="text-[11px] text-danger-600 font-medium">
              {t('dashboard.readiness_penalty')}: -{readiness.weaknessPenalty} {t('dashboard.readiness_weakness_label')} ({mistakes.length})
            </span>
          </div>
        )}

        {/* Tips */}
        {readiness.tips.length > 0 && (
          <div className="bg-white/60 rounded-xl p-3 space-y-1.5">
            <p className="text-[10px] font-bold text-surface-500 uppercase tracking-wide">
              {t('dashboard.readiness_tips_title')}
            </p>
            {readiness.tips.map(tip => (
              <div key={tip} className="flex items-start gap-1.5">
                <Icon name="arrow_right" size={14} className={cn('shrink-0 mt-0.5', levelStyle.text)} />
                <p className={cn('text-[11px] leading-snug', levelStyle.text)}>
                  {t(`dashboard.readiness_tip_${tip}`)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-blue-200 hover:shadow-md transition-all text-start group"
          onClick={() => navigate(ROUTES.LESSONS)}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-blue-50">
            <Icon name="school" size={24} className="text-blue-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-blue-600 transition-colors">{t('dashboard.lessons')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{progress.completedLessons.length} {t('dashboard.lesson_completed')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-purple-200 hover:shadow-md transition-all text-start group"
          onClick={() => navigate(ROUTES.QUESTIONS_BROWSE)}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-purple-50">
            <Icon name="quiz" size={24} className="text-purple-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-purple-600 transition-colors">{t('dashboard.questions')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{questions.length} {t('dashboard.questions_available')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-red-200 hover:shadow-md transition-all text-start group"
          onClick={() => navigate(ROUTES.SIGNS)}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-red-50">
            <Icon name="traffic" size={24} className="text-red-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-red-600 transition-colors">{t('dashboard.signs')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{t('dashboard.signs_desc')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-cyan-200 hover:shadow-md transition-all text-start group"
          onClick={() => navigate(ROUTES.DICTIONARY)}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-cyan-50">
            <Icon name="menu_book" size={24} className="text-cyan-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-cyan-600 transition-colors">{t('dashboard.dictionary')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{t('dashboard.dictionary_desc')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-amber-200 hover:shadow-md transition-all text-start group"
          onClick={() => navigate(ROUTES.TRAINING)}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-amber-50">
            <Icon name="fitness_center" size={24} className="text-amber-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-amber-600 transition-colors">{t('dashboard.training')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{t('dashboard.training_desc')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-green-200 hover:shadow-md transition-all text-start group"
          onClick={() => navigate(ROUTES.EXAM_SIMULATOR)}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-green-50">
            <Icon name="assignment" size={24} className="text-green-600" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-green-600 transition-colors">{t('dashboard.exam_simulator')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{t('dashboard.exam_readiness')}: {readiness.score}%</p>
        </button>
      </div>

      {/* Mistakes button */}
      <button
        className="w-full bg-white rounded-xl p-4 border border-surface-100 hover:border-red-200 hover:shadow-md transition-all text-start flex items-center gap-4 group"
        onClick={() => navigate(ROUTES.MISTAKES)}
      >
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 shrink-0">
          <Icon name="error_outline" size={26} className="text-red-500" filled />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-red-600 transition-colors">{t('dashboard.mistakes')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">
            {mistakes.length > 0 ? `${mistakes.length} ${t('dashboard.mistakes_count')}` : t('dashboard.no_mistakes')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {mistakes.length > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{mistakes.length}</span>
          )}
          <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-red-400 ltr:rotate-180" />
        </div>
      </button>

      {/* Study Progress Summary */}
      {(sections.length > 0 || lessons.length > 0) && (
        <div className="bg-white rounded-xl p-4 border border-surface-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-surface-900 text-sm flex items-center gap-2">
              <Icon name="insights" size={18} className="text-primary-500" filled />
              {t('dashboard.progress_summary')}
            </h3>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
              readiness.score >= 70 ? 'bg-success-50 text-success-600' :
              readiness.score >= 40 ? 'bg-warning-50 text-warning-600' :
              'bg-surface-100 text-surface-500'
            )}>
              {t('dashboard.readiness')}: {readiness.score}%
            </span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-2.5 mb-3">
            <div className={cn('rounded-full h-2.5 transition-all duration-700', levelStyle.bar)}
              style={{ width: `${readiness.score}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-base font-bold text-surface-900">{progress.completedLessons.length}</p>
              <p className="text-[10px] text-surface-400">{t('dashboard.completed_lessons')}</p>
            </div>
            <div>
              <p className="text-base font-bold text-surface-900">{progress.totalQuizzes}</p>
              <p className="text-[10px] text-surface-400">{t('dashboard.quizzes')}</p>
            </div>
            <div>
              <p className="text-base font-bold text-surface-900">{progress.xp}</p>
              <p className="text-[10px] text-surface-400">XP</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
