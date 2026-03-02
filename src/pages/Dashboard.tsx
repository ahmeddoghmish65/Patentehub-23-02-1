import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';

interface DashboardProps {
  onNavigate: (page: string, data?: Record<string, string>) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, loadSections, loadLessons, loadMistakes, loadQuestions, mistakes, sections, lessons, questions } = useAuthStore();
  const { t } = useTranslation();

  useEffect(() => {
    loadSections();
    loadLessons();
    loadMistakes();
    loadQuestions();
  }, [loadSections, loadLessons, loadMistakes, loadQuestions]);

  if (!user) return null;

  const { progress } = user;
  const totalAnswers = progress.correctAnswers + progress.wrongAnswers;
  const accuracy = totalAnswers > 0 ? Math.round((progress.correctAnswers / totalAnswers) * 100) : 0;

  // Calculate exam readiness
  useEffect(() => {
    if (!user) return;
    const quizFactor     = Math.min(100, progress.totalQuizzes * 5);
    const accuracyFactor = totalAnswers > 0 ? accuracy : 0;
    const lessonFactor   = Math.min(100, progress.completedLessons.length * 5);
    const questionFactor = Math.min(100, Math.round(totalAnswers / 2));
    const streakFactor   = Math.min(100, progress.currentStreak * 14);

    const readiness = Math.round(
      accuracyFactor  * 0.35 +
      quizFactor      * 0.20 +
      lessonFactor    * 0.20 +
      questionFactor  * 0.15 +
      streakFactor    * 0.10
    );

    if (progress.totalQuizzes === 0 && progress.completedLessons.length === 0 && totalAnswers === 0) return;
    if (readiness === progress.examReadiness) return;

    import('@/db/database').then(({ getDB }) => {
      getDB().then(db => {
        db.get('users', user.id).then(u => {
          if (u) { u.progress.examReadiness = readiness; db.put('users', u); }
        });
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.totalQuizzes, progress.correctAnswers, progress.wrongAnswers, progress.completedLessons.length, progress.currentStreak]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.greeting_morning') : t('dashboard.greeting_afternoon');

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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-blue-200 hover:shadow-md transition-all text-start group"
          onClick={() => onNavigate('lessons')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-blue-50">
            <Icon name="school" size={24} className="text-blue-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-blue-600 transition-colors">{t('dashboard.lessons')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{progress.completedLessons.length} {t('dashboard.lesson_completed')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-purple-200 hover:shadow-md transition-all text-start group"
          onClick={() => onNavigate('questions-browse')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-purple-50">
            <Icon name="quiz" size={24} className="text-purple-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-purple-600 transition-colors">{t('dashboard.questions')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{questions.length} {t('dashboard.questions_available')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-red-200 hover:shadow-md transition-all text-start group"
          onClick={() => onNavigate('signs')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-red-50">
            <Icon name="traffic" size={24} className="text-red-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-red-600 transition-colors">{t('dashboard.signs')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{t('dashboard.signs_desc')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-cyan-200 hover:shadow-md transition-all text-start group"
          onClick={() => onNavigate('dictionary')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-cyan-50">
            <Icon name="menu_book" size={24} className="text-cyan-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-cyan-600 transition-colors">{t('dashboard.dictionary')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{t('dashboard.dictionary_desc')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-amber-200 hover:shadow-md transition-all text-start group"
          onClick={() => onNavigate('training')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-amber-50">
            <Icon name="fitness_center" size={24} className="text-amber-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-amber-600 transition-colors">{t('dashboard.training')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{t('dashboard.training_desc')}</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-green-200 hover:shadow-md transition-all text-start group"
          onClick={() => onNavigate('exam-simulator')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-green-50">
            <Icon name="assignment" size={24} className="text-green-600" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-green-600 transition-colors">{t('dashboard.exam_simulator')}</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{t('dashboard.exam_readiness')}: {progress.examReadiness}%</p>
        </button>
      </div>

      {/* أخطائي */}
      <button
        className="w-full bg-white rounded-xl p-4 border border-surface-100 hover:border-red-200 hover:shadow-md transition-all text-start flex items-center gap-4 group"
        onClick={() => onNavigate('mistakes')}
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
          <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-red-400" />
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
              progress.examReadiness >= 70 ? 'bg-success-50 text-success-600' :
              progress.examReadiness >= 40 ? 'bg-warning-50 text-warning-600' :
              'bg-surface-100 text-surface-500'
            )}>
              {t('dashboard.readiness')}: {progress.examReadiness}%
            </span>
          </div>
          <div className="w-full bg-surface-100 rounded-full h-2.5 mb-3">
            <div className={cn('rounded-full h-2.5 transition-all duration-700',
              progress.examReadiness >= 70 ? 'bg-success-500' :
              progress.examReadiness >= 40 ? 'bg-warning-500' : 'bg-primary-500'
            )} style={{ width: `${progress.examReadiness}%` }} />
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
