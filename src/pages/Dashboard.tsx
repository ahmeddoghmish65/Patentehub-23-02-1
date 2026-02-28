import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

interface DashboardProps {
  onNavigate: (page: string, data?: Record<string, string>) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user, loadSections, loadLessons, loadMistakes, loadQuestions, practiceMistake, mistakes, sections, lessons, questions } = useAuthStore();

  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceChosen, setPracticeChosen] = useState<boolean | null>(null);
  const [practiceResult, setPracticeResult] = useState<'correct' | 'wrong' | null>(null);

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

  // Calculate comprehensive exam readiness
  useEffect(() => {
    if (!user) return;
    const quizFactor = Math.min(100, progress.totalQuizzes * 5); // 20 quizzes = 100
    const accuracyFactor = accuracy;
    const lessonFactor = sections.length > 0 ? Math.min(100, Math.round((progress.completedLessons.length / Math.max(1, lessons.length)) * 100)) : 0;
    const streakFactor = Math.min(100, progress.currentStreak * 14); // 7 days = 100
    const questionCoverage = questions.length > 0 ? Math.min(100, Math.round((totalAnswers / Math.max(1, questions.length)) * 100)) : 0;
    
    const readiness = Math.round(
      accuracyFactor * 0.35 +    // 35% accuracy weight
      quizFactor * 0.20 +        // 20% total quizzes
      lessonFactor * 0.20 +      // 20% lessons completed
      questionCoverage * 0.15 +  // 15% question coverage
      streakFactor * 0.10        // 10% streak consistency
    );
    
    if (readiness !== progress.examReadiness && readiness > 0) {
      // Update exam readiness in DB
      import('@/db/database').then(({ getDB }) => {
        getDB().then(db => {
          db.get('users', user.id).then(u => {
            if (u) {
              u.progress.examReadiness = readiness;
              db.put('users', u);
            }
          });
        });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.totalQuizzes, accuracy, progress.completedLessons.length, progress.currentStreak, totalAnswers, sections.length, lessons.length, questions.length]);

  // Get greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء الخير';

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
              <span className="text-[10px] text-primary-200">يوم متتالي</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon name="military_tech" size={18} className="text-yellow-300" filled />
                <span className="text-lg font-bold">{progress.level}</span>
              </div>
              <span className="text-[10px] text-primary-200">المستوى</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon name="target" size={18} className="text-green-300" filled />
                <span className="text-lg font-bold">{accuracy}%</span>
              </div>
              <span className="text-[10px] text-primary-200">الدقة</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-blue-200 hover:shadow-md transition-all text-right group"
          onClick={() => onNavigate('lessons')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-blue-50">
            <Icon name="school" size={24} className="text-blue-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-blue-600 transition-colors">الدروس</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{progress.completedLessons.length} درس مكتمل</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-purple-200 hover:shadow-md transition-all text-right group"
          onClick={() => onNavigate('questions-browse')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-purple-50">
            <Icon name="quiz" size={24} className="text-purple-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-purple-600 transition-colors">الأسئلة</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">{questions.length} سؤال متاح</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-red-200 hover:shadow-md transition-all text-right group"
          onClick={() => onNavigate('signs')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-red-50">
            <Icon name="traffic" size={24} className="text-red-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-red-600 transition-colors">الإشارات</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">إشارات المرور</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-cyan-200 hover:shadow-md transition-all text-right group"
          onClick={() => onNavigate('dictionary')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-cyan-50">
            <Icon name="menu_book" size={24} className="text-cyan-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-cyan-600 transition-colors">القاموس</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">مصطلحات مرورية</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-amber-200 hover:shadow-md transition-all text-right group"
          onClick={() => onNavigate('training')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-amber-50">
            <Icon name="fitness_center" size={24} className="text-amber-500" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-amber-600 transition-colors">التدريب</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">تمرّن وتعلّم</p>
        </button>

        <button
          className="bg-white rounded-xl p-4 border border-surface-100 hover:border-green-200 hover:shadow-md transition-all text-right group"
          onClick={() => onNavigate('exam-simulator')}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-green-50">
            <Icon name="assignment" size={24} className="text-green-600" filled />
          </div>
          <h3 className="font-bold text-surface-900 text-sm group-hover:text-green-600 transition-colors">محاكي الامتحان</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">جاهزيتك: {progress.examReadiness}%</p>
        </button>
      </div>

      {/* أخطائي */}
      <div>
        <button
          className="w-full bg-white rounded-xl p-4 border border-surface-100 hover:border-red-200 hover:shadow-md transition-all text-right flex items-center gap-4 group"
          onClick={() => !practiceActive && onNavigate('mistakes')}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-50 shrink-0">
            <Icon name="error_outline" size={26} className="text-red-500" filled />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-surface-900 text-sm group-hover:text-red-600 transition-colors">أخطائي</h3>
            <p className="text-[11px] text-surface-400 mt-0.5">
              {mistakes.length > 0 ? `${mistakes.length} خطأ — راجعها لتتحسن` : 'لا توجد أخطاء بعد'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {mistakes.length > 0 && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (practiceActive) {
                      setPracticeActive(false); setPracticeChosen(null); setPracticeResult(null);
                    } else {
                      setPracticeActive(true); setPracticeIdx(0); setPracticeChosen(null); setPracticeResult(null);
                    }
                  }}
                  className={cn('flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all border', practiceActive ? 'bg-surface-100 text-surface-500 border-surface-200' : 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100')}>
                  <Icon name={practiceActive ? 'close' : 'fitness_center'} size={13} />
                  {practiceActive ? 'إنهاء' : 'تدريب'}
                </button>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{mistakes.length}</span>
              </>
            )}
            {!practiceActive && <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-red-400" />}
          </div>
        </button>

        {/* Practice panel — expands below the card */}
        {practiceActive && mistakes.length > 0 && (
          <div className="mt-1 bg-white rounded-xl border border-primary-100 overflow-hidden shadow-sm">
            {practiceIdx < mistakes.length ? (() => {
              const q = mistakes[practiceIdx];
              return (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 bg-surface-100 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full transition-all" style={{ width: `${(practiceIdx / mistakes.length) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-surface-400 shrink-0">{practiceIdx + 1}/{mistakes.length}</span>
                    <span className="text-[10px] bg-danger-50 text-danger-500 px-1.5 py-0.5 rounded-full font-semibold">×{q.count}</span>
                  </div>
                  <div className="bg-surface-50 rounded-xl p-3 mb-3">
                    <p className="text-sm font-semibold text-surface-800 leading-relaxed mb-1">{q.questionAr}</p>
                    <p className="text-xs text-surface-400" dir="ltr">{q.questionIt}</p>
                  </div>
                  {practiceResult === null ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={async () => { const c = true; setPracticeChosen(c); const ok = c === q.correctAnswer; setPracticeResult(ok ? 'correct' : 'wrong'); if (ok) await practiceMistake(q.questionId, true); }}
                        className="py-2.5 rounded-xl border-2 border-success-200 hover:bg-success-50 text-success-700 font-bold text-sm transition-all">✓ صحيح</button>
                      <button onClick={async () => { const c = false; setPracticeChosen(c); const ok = c === q.correctAnswer; setPracticeResult(ok ? 'correct' : 'wrong'); if (ok) await practiceMistake(q.questionId, true); }}
                        className="py-2.5 rounded-xl border-2 border-danger-200 hover:bg-danger-50 text-danger-700 font-bold text-sm transition-all">✗ خطأ</button>
                    </div>
                  ) : (
                    <div className={cn('rounded-xl p-3 border text-center', practiceResult === 'correct' ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200')}>
                      <Icon name={practiceResult === 'correct' ? 'check_circle' : 'cancel'} size={24} className={cn('mx-auto mb-1', practiceResult === 'correct' ? 'text-success-500' : 'text-danger-500')} filled />
                      <p className={cn('font-bold text-xs mb-2', practiceResult === 'correct' ? 'text-success-700' : 'text-danger-700')}>
                        {practiceResult === 'correct' ? '🎉 صحيح! تم تخفيض الخطأ' : '❌ خطأ! الصحيح: ' + (q.correctAnswer ? 'صحيح ✓' : 'خطأ ✗')}
                      </p>
                      <button onClick={() => { setPracticeChosen(null); setPracticeResult(null); const next = practiceIdx + 1; if (next >= mistakes.length) { setPracticeActive(false); } else { setPracticeIdx(next); } }}
                        className="text-xs font-semibold bg-white border border-surface-200 px-4 py-1.5 rounded-xl hover:bg-surface-50">
                        {practiceIdx + 1 < mistakes.length ? 'التالي ←' : 'إنهاء'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="p-5 text-center">
                <Icon name="celebration" size={32} className="text-success-400 mx-auto mb-2" filled />
                <p className="font-bold text-surface-800 text-sm mb-1">أحسنت! انتهيت من التدريب</p>
                <button onClick={() => setPracticeActive(false)}
                  className="mt-1 text-xs font-semibold bg-primary-500 text-white px-4 py-1.5 rounded-xl hover:bg-primary-600">إغلاق</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Study Progress Summary */}
      {(sections.length > 0 || lessons.length > 0) && (
        <div className="bg-white rounded-xl p-4 border border-surface-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-surface-900 text-sm flex items-center gap-2">
              <Icon name="insights" size={18} className="text-primary-500" filled />
              ملخص التقدم
            </h3>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full',
              progress.examReadiness >= 70 ? 'bg-success-50 text-success-600' :
              progress.examReadiness >= 40 ? 'bg-warning-50 text-warning-600' :
              'bg-surface-100 text-surface-500'
            )}>
              جاهزية: {progress.examReadiness}%
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
              <p className="text-[10px] text-surface-400">دروس مكتملة</p>
            </div>
            <div>
              <p className="text-base font-bold text-surface-900">{progress.totalQuizzes}</p>
              <p className="text-[10px] text-surface-400">اختبارات</p>
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
