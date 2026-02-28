import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';

export function MistakesPage() {
  const { mistakes, loadMistakes, practiceMistake, user } = useAuthStore();
  const lang = user?.settings.language || 'both';
  const trueLabel  = lang === 'ar' ? 'صحيح' : lang === 'it' ? 'Vero'  : 'صحيح / Vero';
  const falseLabel = lang === 'ar' ? 'خطأ'  : lang === 'it' ? 'Falso' : 'خطأ / Falso';

  const [practiceActive, setPracticeActive] = useState(false);
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceResult, setPracticeResult] = useState<'correct' | 'wrong' | null>(null);

  useEffect(() => { loadMistakes(); }, [loadMistakes]);

  const startPractice = () => { setPracticeActive(true); setPracticeIdx(0); setPracticeResult(null); };
  const stopPractice  = () => { setPracticeActive(false); setPracticeResult(null); };

  const handleAnswer = async (chosen: boolean) => {
    const q = mistakes[practiceIdx];
    const isCorrect = chosen === q.correctAnswer;
    setPracticeResult(isCorrect ? 'correct' : 'wrong');
    await practiceMistake(q.questionId, isCorrect);
  };

  const nextQuestion = () => {
    setPracticeResult(null);
    if (practiceIdx + 1 >= mistakes.length) { stopPractice(); }
    else { setPracticeIdx(i => i + 1); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 mb-1">أخطائي</h1>
          <p className="text-surface-500 text-sm">الأسئلة التي أخطأت فيها — ركز عليها!</p>
        </div>
        {mistakes.length > 0 && (
          !practiceActive ? (
            <button onClick={startPractice}
              className="flex items-center gap-2 bg-primary-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary-600 transition-colors shadow-sm shrink-0">
              <Icon name="fitness_center" size={18} />
              تدريب على الأخطاء
            </button>
          ) : (
            <button onClick={stopPractice}
              className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-danger-500 font-medium transition-colors shrink-0">
              <Icon name="close" size={16} /> إنهاء التدريب
            </button>
          )
        )}
      </div>

      {/* Empty state */}
      {mistakes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
          <Icon name="check_circle" size={48} className="text-success-300 mx-auto mb-4" />
          <p className="text-surface-500 text-lg mb-2">لا توجد أخطاء!</p>
          <p className="text-sm text-surface-400">ابدأ بحل الاختبارات وسيتم تتبع أخطائك هنا</p>
        </div>

      /* Practice mode */
      ) : practiceActive && practiceIdx < mistakes.length ? (() => {
        const q = mistakes[practiceIdx];
        return (
          <div className="space-y-4">
            {/* Progress bar */}
            <div className="bg-white rounded-xl border border-surface-100 px-4 py-3 flex items-center gap-3">
              <div className="flex-1 bg-surface-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full transition-all duration-300"
                  style={{ width: `${(practiceIdx / mistakes.length) * 100}%` }} />
              </div>
              <span className="text-xs text-surface-400 shrink-0 font-medium">{practiceIdx + 1} / {mistakes.length}</span>
              <span className="text-xs bg-danger-50 text-danger-600 border border-danger-100 px-2 py-0.5 rounded-full font-bold shrink-0">
                ×{q.count}
              </span>
            </div>

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-surface-100 p-5">
              {(lang === 'ar' || lang === 'both') && (
                <p className="font-semibold text-surface-800 text-base leading-relaxed mb-2">{q.questionAr}</p>
              )}
              {(lang === 'it' || lang === 'both') && (
                <p className="text-sm text-surface-400 leading-relaxed" dir="ltr">{q.questionIt}</p>
              )}
            </div>

            {/* Answer buttons or result */}
            {practiceResult === null ? (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => handleAnswer(true)}
                  className="py-4 rounded-2xl border-2 border-success-200 bg-success-50/50 hover:bg-success-50 text-success-700 font-bold text-base transition-all active:scale-[.97]">
                  ✓ {lang === 'it' ? 'Vero' : 'صحيح'}
                </button>
                <button onClick={() => handleAnswer(false)}
                  className="py-4 rounded-2xl border-2 border-danger-200 bg-danger-50/50 hover:bg-danger-50 text-danger-700 font-bold text-base transition-all active:scale-[.97]">
                  ✗ {lang === 'it' ? 'Falso' : 'خطأ'}
                </button>
              </div>
            ) : (
              <div className={cn('rounded-2xl p-5 border-2 text-center', practiceResult === 'correct' ? 'bg-success-50 border-success-300' : 'bg-danger-50 border-danger-300')}>
                <Icon name={practiceResult === 'correct' ? 'check_circle' : 'cancel'} size={36}
                  className={cn('mx-auto mb-2', practiceResult === 'correct' ? 'text-success-500' : 'text-danger-500')} filled />
                <p className={cn('font-bold text-base mb-1', practiceResult === 'correct' ? 'text-success-700' : 'text-danger-700')}>
                  {practiceResult === 'correct'
                    ? (lang === 'it' ? '🎉 Corretto! Errori ridotti.' : '🎉 إجابة صحيحة! تم تخفيض عدد الأخطاء')
                    : (lang === 'it' ? `❌ Sbagliato! Giusto: ${q.correctAnswer ? 'Vero' : 'Falso'}` : `❌ خطأ! الإجابة الصحيحة: ${q.correctAnswer ? 'صحيح ✓' : 'خطأ ✗'}`)}
                </p>
                {lang === 'both' && practiceResult === 'wrong' && (
                  <p className="text-sm text-danger-600 mb-2" dir="ltr">Risposta corretta: {q.correctAnswer ? 'Vero' : 'Falso'}</p>
                )}
                <p className={cn('text-xs mb-4', practiceResult === 'correct' ? 'text-success-600' : 'text-danger-600')}>
                  {practiceResult === 'correct'
                    ? `عدد الأخطاء أصبح: ${Math.max(0, q.count - 1)}`
                    : `عدد الأخطاء أصبح: ${q.count + 1}`}
                </p>
                <button onClick={nextQuestion}
                  className="bg-white border border-surface-200 text-surface-700 font-semibold text-sm px-6 py-2 rounded-xl hover:bg-surface-50 transition-colors">
                  {practiceIdx + 1 < mistakes.length ? (lang === 'it' ? 'Prossimo →' : 'التالي ←') : (lang === 'it' ? 'Fine' : 'إنهاء')}
                </button>
              </div>
            )}
          </div>
        );
      })()

      : (
        <div className="space-y-3">
          {mistakes.map(m => (
            <div key={m.id} className="bg-white rounded-xl p-5 border border-surface-100">
              <div className="flex items-start gap-3">
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', m.count >= 3 ? 'bg-danger-50' : 'bg-warning-50')}>
                  <span className={cn('text-sm font-black', m.count >= 3 ? 'text-danger-600' : 'text-warning-600')}>×{m.count}</span>
                </div>
                <div className="flex-1">
                  {(lang === 'ar' || lang === 'both') && <p className="font-semibold text-surface-800 text-sm mb-1">{m.questionAr}</p>}
                  {(lang === 'it' || lang === 'both') && <p className="text-sm text-surface-400 mb-2" dir="ltr">{m.questionIt}</p>}
                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    <span className="text-danger-500 flex items-center gap-1">
                      <Icon name="close" size={14} />
                      {lang === 'it' ? 'Tua risposta' : 'إجابتك'}: {m.userAnswer ? trueLabel : falseLabel}
                    </span>
                    <span className="text-success-500 flex items-center gap-1">
                      <Icon name="check" size={14} />
                      {lang === 'it' ? 'Corretto' : 'الصحيح'}: {m.correctAnswer ? trueLabel : falseLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
