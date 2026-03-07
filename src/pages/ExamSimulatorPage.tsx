import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { ROUTES } from '@/constants';
import type { Question } from '@/db/database';

export function ExamSimulatorPage() {
  const navigate = useNavigate();
  const { questions, loadQuestions, saveQuizResult, user } = useAuthStore();
  const { t } = useTranslation();
  const lang = user?.settings.language || 'both';
  const trueLabel  = lang === 'ar' ? 'صحيح' : lang === 'it' ? 'Vero'  : 'صحيح / Vero';
  const falseLabel = lang === 'ar' ? 'خطأ'  : lang === 'it' ? 'Falso' : 'خطأ / Falso';
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [phase, setPhase] = useState<'intro' | 'exam' | 'review' | 'result'>('intro');
  const [startTime, setStartTime] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [showSubmitWarning, setShowSubmitWarning] = useState(false);

  const EXAM_QUESTIONS = 30;
  const EXAM_TIME = 30 * 60;
  const MAX_ERRORS = 3;

  useEffect(() => { loadQuestions(); }, [loadQuestions]);

  // Only use active (non-archived, non-deleted) questions
  const activeQuestions = questions.filter(q => !q.status || q.status === 'active');

  useEffect(() => {
    if (activeQuestions.length > 0 && examQuestions.length === 0) {
      const shuffled = [...activeQuestions].sort(() => Math.random() - 0.5).slice(0, EXAM_QUESTIONS);
      setExamQuestions(shuffled);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestions.length, examQuestions.length]);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (phase === 'exam') {
      iv = setInterval(() => {
        const e = Math.floor((Date.now() - startTime) / 1000);
        setElapsed(e);
        if (e >= EXAM_TIME) { finishExam(); }
      }, 1000);
    }
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, startTime]);

  const start = useCallback(() => {
    const shuffled = [...activeQuestions].sort(() => Math.random() - 0.5).slice(0, EXAM_QUESTIONS);
    setExamQuestions(shuffled);
    setPhase('exam');
    setStartTime(Date.now());
    setCurrentIndex(0);
    setAnswers({});
    setElapsed(0);
    setShowGrid(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestions]);

  const handleAnswer = (val: boolean) => {
    setAnswers(prev => ({ ...prev, [currentIndex]: val }));
  };

  const goToQuestion = (idx: number) => { setCurrentIndex(idx); setShowGrid(false); };
  const nextQuestion = () => { if (currentIndex < examQuestions.length - 1) setCurrentIndex(i => i + 1); };
  const prevQuestion = () => { if (currentIndex > 0) setCurrentIndex(i => i - 1); };

  const finishExam = async () => {
    const answeredList = examQuestions.map((q, i) => ({
      questionId: q.id,
      userAnswer: answers[i] ?? false,
      correct: answers[i] === q.isTrue,
    }));
    const correctCount = answeredList.filter(a => a.correct).length;
    const score = Math.round((correctCount / examQuestions.length) * 100);
    await saveQuizResult({
      topicId: 'exam-simulator', lessonId: '', score,
      totalQuestions: examQuestions.length, correctAnswers: correctCount,
      wrongAnswers: examQuestions.length - correctCount,
      timeSpent: Math.floor((Date.now() - startTime) / 1000), answers: answeredList,
    });
    setPhase('result');
  };

  const answeredCount = Object.keys(answers).length;
  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const remaining = Math.max(0, EXAM_TIME - elapsed);

  if (examQuestions.length === 0 && activeQuestions.length === 0) return (
    <div className="text-center py-20">
      <Icon name="assignment" size={48} className="text-surface-300 mx-auto mb-4" />
      <p className="text-surface-500 mb-4">{t('exam.no_questions')}</p>
      <Button onClick={() => navigate(ROUTES.DASHBOARD)}>{t('exam.back')}</Button>
    </div>
  );

  // INTRO
  if (phase === 'intro') return (
    <div className="max-w-md mx-auto">
      <button onClick={() => navigate(ROUTES.DASHBOARD)} className="flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-4">
        <Icon name="arrow_forward" size={18} className="ltr:rotate-180" /><span className="text-sm">{t('exam.back')}</span>
      </button>
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-surface-100">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow shrink-0">
            <Icon name="assignment" size={24} className="text-white" filled />
          </div>
          <div className="text-start">
            <h1 className="text-base font-bold text-surface-900">{t('exam.title')}</h1>
            <p className="text-xs text-surface-400">Simulazione Esame Patente B</p>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Exam details grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: t('exam.q_count_label'), value: String(Math.min(EXAM_QUESTIONS, activeQuestions.length)), icon: 'quiz' },
              { label: t('exam.time_label'), value: t('exam.time_value'), icon: 'timer' },
              { label: t('exam.max_errors_label'), value: `${MAX_ERRORS} ${t('exam.errors_plural')}`, icon: 'close', danger: true },
              { label: t('exam.q_type_label'), value: t('exam.q_type_value'), icon: 'check_circle' },
            ].map(item => (
              <div key={item.label} className="bg-surface-50 rounded-xl p-3 text-start">
                <p className="text-[10px] text-surface-400 mb-0.5">{item.label}</p>
                <p className={cn('text-sm font-bold', item.danger ? 'text-danger-600' : 'text-surface-900')}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Instructions - compact */}
          <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2 border border-amber-100">
            <Icon name="info" size={16} className="text-amber-500 shrink-0 mt-0.5" filled />
            <ul className="text-xs text-amber-700 space-y-0.5 text-start">
              <li>• {t('exam.info1')}</li>
              <li>• {t('exam.errors_detail')} {MAX_ERRORS} {t('exam.errors_allowed')}</li>
            </ul>
          </div>

          <Button size="md" fullWidth onClick={start} icon={<Icon name="play_arrow" size={20} />}>
            {t('exam.start')}
          </Button>
        </div>
      </div>
    </div>
  );

  // RESULT
  if (phase === 'result') {
    const results = examQuestions.map((q, i) => ({
      question: q, answer: answers[i], correct: answers[i] === q.isTrue,
    }));
    const correctCount = results.filter(r => r.correct).length;
    const errors = results.filter(r => !r.correct).length;
    const unanswered = examQuestions.length - answeredCount;
    const passed = errors <= MAX_ERRORS;
    const score = Math.round((correctCount / examQuestions.length) * 100);

    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
          <div className="p-8 text-center">
            <div className={cn('w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6', passed ? 'bg-success-50' : 'bg-danger-50')}>
              <Icon name={passed ? 'celebration' : 'sentiment_dissatisfied'} size={48} className={passed ? 'text-success-500' : 'text-danger-500'} filled />
            </div>
            <h1 className="text-3xl font-bold text-surface-900 mb-1">{passed ? t('exam.passed') : t('exam.failed')}</h1>
            <p className="text-lg text-surface-600 mb-1">{passed ? 'IDONEO' : 'NON IDONEO'}</p>
            <p className="text-surface-500 text-sm mb-6">
              {passed
                ? `${errors} ${errors === 1 ? t('exam.error_singular') : t('exam.errors_plural')}`
                : `${errors} ${t('exam.errors_plural')} — ${t('exam.errors_allowed')} ${MAX_ERRORS}`}
            </p>

            {/* Score circle */}
            <div className="relative w-36 h-36 mx-auto mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={passed ? '#22c55e' : '#ef4444'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${score * 2.64} ${264 - score * 2.64}`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn('text-3xl font-bold', passed ? 'text-success-500' : 'text-danger-500')}>{score}%</span>
              </div>
            </div>

            {/* Error counter - only shown here in results */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-success-50 rounded-xl p-3 border border-success-100">
                <p className="text-xl font-bold text-success-600">{correctCount}</p>
                <p className="text-[10px] text-success-500">{t('exam.correct_label')}</p>
              </div>
              <div className="bg-danger-50 rounded-xl p-3 border border-danger-100">
                <p className="text-xl font-bold text-danger-600">{errors}</p>
                <p className="text-[10px] text-danger-500">{t('exam.errors_label')}</p>
              </div>
              <div className="bg-surface-50 rounded-xl p-3 border border-surface-100">
                <p className="text-xl font-bold text-surface-600">{unanswered}</p>
                <p className="text-[10px] text-surface-500">{t('exam.unanswered_label')}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xl font-bold text-blue-600">{fmt(elapsed)}</p>
                <p className="text-[10px] text-blue-500">{t('exam.time_used')}</p>
              </div>
            </div>

            {/* Error detail bar */}
            <div className={cn('rounded-xl p-4 mb-6 flex items-center justify-center gap-3', passed ? 'bg-success-50 border border-success-100' : 'bg-danger-50 border border-danger-100')}>
              <Icon name={passed ? 'check_circle' : 'error'} size={24} className={passed ? 'text-success-500' : 'text-danger-500'} filled />
              <div className="text-start">
                <p className={cn('text-sm font-bold', passed ? 'text-success-700' : 'text-danger-700')}>
                  {t('exam.errors_of')} {errors} / {MAX_ERRORS} {t('exam.errors_allowed')}
                </p>
                <p className={cn('text-xs', passed ? 'text-success-500' : 'text-danger-500')}>
                  {passed
                    ? `${t('exam.margin')} ${MAX_ERRORS - errors} ${t('exam.extra')}`
                    : `${t('exam.exceeded')} ${errors - MAX_ERRORS} ${errors - MAX_ERRORS === 1 ? t('exam.error_singular') : t('exam.errors_plural')}`}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button fullWidth variant="secondary" onClick={() => setPhase('review')} icon={<Icon name="visibility" size={20} />}>
                {t('exam.review_btn')}
              </Button>
              <Button fullWidth onClick={start} icon={<Icon name="replay" size={20} />}>{t('exam.restart_btn')}</Button>
              <Button fullWidth variant="outline" onClick={() => navigate(ROUTES.DASHBOARD)}>{t('exam.back_home')}</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW
  if (phase === 'review') {
    const totalErrors = Object.entries(answers).filter(([i, a]) => {
      const q = examQuestions[parseInt(i)];
      return q && a !== q.isTrue;
    }).length;

    return (
      <div className="max-w-2xl mx-auto">
        <button onClick={() => setPhase('result')} className="flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-4">
          <Icon name="arrow_forward" size={20} className="ltr:rotate-180" /><span className="text-sm">{t('exam.back_result')}</span>
        </button>
        
        {/* Error summary at top */}
        <div className={cn('rounded-xl p-3 mb-4 flex items-center justify-between', totalErrors <= MAX_ERRORS ? 'bg-success-50 border border-success-100' : 'bg-danger-50 border border-danger-100')}>
          <span className={cn('text-sm font-bold', totalErrors <= MAX_ERRORS ? 'text-success-700' : 'text-danger-700')}>
            {totalErrors <= MAX_ERRORS ? t('exam.passed_badge') : t('exam.failed_badge')}
          </span>
          <span className={cn('text-sm font-bold', totalErrors <= MAX_ERRORS ? 'text-success-600' : 'text-danger-600')}>
            {t('exam.errors_of')} {totalErrors}/{MAX_ERRORS}
          </span>
        </div>

        <h2 className="text-xl font-bold text-surface-900 mb-4">{t('exam.review_title')}</h2>
        <div className="space-y-3">
          {examQuestions.map((q, i) => {
            const userAns = answers[i];
            const correct = userAns === q.isTrue;
            return (
              <div key={q.id} className={cn('bg-white rounded-xl p-4 border-2', correct ? 'border-success-200' : userAns === undefined ? 'border-surface-300' : 'border-red-300')}>
                <div className="flex items-start gap-3" dir="ltr">
                  <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                    correct ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600'
                  )}>{i + 1}</span>
                  <div className="flex-1">
                    {lang === 'ar' && <p className="text-sm font-medium text-surface-800 mb-1" dir="rtl">{q.questionAr}</p>}
                    {lang === 'it' && <p className="text-sm font-medium text-surface-800 mb-1" dir="ltr">{q.questionIt}</p>}
                    {lang === 'both' && <p className="text-sm font-medium text-surface-800 mb-1" dir="ltr">{q.questionIt}</p>}
                    {lang === 'both' && <p className="text-sm text-surface-500 mb-2" dir="rtl">{q.questionAr}</p>}
                    <div className="flex items-center gap-4 text-xs">
                      <span className={cn('px-2 py-0.5 rounded-full', userAns === undefined ? 'bg-surface-100 text-surface-500' : correct ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger-600')}>
                        {t('exam.your_answer')} {userAns === undefined ? t('exam.not_answered') : userAns ? trueLabel : falseLabel}
                      </span>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                        {t('exam.correct')} {q.isTrue ? trueLabel : falseLabel}
                      </span>
                    </div>
                    {lang === 'ar' && q.explanationAr && (
                      <p className="text-xs text-surface-500 mt-2 bg-surface-50 rounded-lg p-2" dir="rtl">{q.explanationAr}</p>
                    )}
                    {lang === 'it' && q.explanationIt && (
                      <p className="text-xs text-surface-500 mt-2 bg-blue-50 rounded-lg p-2" dir="ltr">{q.explanationIt}</p>
                    )}
                    {lang === 'both' && q.explanationIt && (
                      <p className="text-xs text-surface-500 mt-2 bg-blue-50 rounded-lg p-2" dir="ltr">{q.explanationIt}</p>
                    )}
                    {lang === 'both' && q.explanationAr && (
                      <p className="text-xs text-surface-500 mt-1 bg-surface-50 rounded-lg p-2" dir="rtl">{q.explanationAr}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // EXAM MODE - NO error counter, only timer and question number
  const q = examQuestions[currentIndex];
  if (!q) return null;
  const userAnswer = answers[currentIndex];
  const unansweredCount = examQuestions.length - answeredCount;

  const handleSubmitClick = () => {
    if (unansweredCount > 0) {
      setShowSubmitWarning(true);
    } else {
      finishExam();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Submit warning modal */}
      {showSubmitWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 bg-warning-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="warning" size={30} className="text-warning-500" filled />
            </div>
            <h3 className="text-lg font-bold text-surface-900 text-center mb-2">{t('exam.not_answered_warning')}</h3>
            <p className="text-sm text-surface-600 text-center mb-1">
              {t('exam.remaining_q')} <strong className="text-danger-600">{unansweredCount}</strong> {t('exam.q_without_answer')}
            </p>
            <p className="text-xs text-surface-400 text-center mb-5">{t('exam.unanswered_counted')}</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowSubmitWarning(false)}
                className="py-2.5 rounded-xl border-2 border-surface-200 text-sm font-semibold text-surface-600 hover:bg-surface-50 transition-all">
                {t('exam.back_review')}
              </button>
              <button onClick={() => { setShowSubmitWarning(false); finishExam(); }}
                className="py-2.5 rounded-xl bg-danger-500 text-white text-sm font-bold hover:bg-danger-600 transition-all">
                {t('exam.force_submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Header */}
      <div className="bg-white rounded-xl border border-surface-100 p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-surface-700">{t('exam.simulator_label')}</span>
          <button
            onClick={handleSubmitClick}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all',
              answeredCount === examQuestions.length
                ? 'bg-success-500 text-white hover:bg-success-600 shadow-sm shadow-success-200'
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            )}>
            <Icon name="send" size={15} />
            {t('exam.submit_btn')}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold',
            remaining < 300 ? 'bg-danger-50 text-danger-600 animate-pulse' : remaining < 600 ? 'bg-warning-50 text-warning-600' : 'bg-surface-50 text-surface-700'
          )}>
            <Icon name="timer" size={16} />
            {fmt(remaining)}
          </div>
          <div className="text-xs font-semibold text-surface-500 bg-surface-50 px-2.5 py-1.5 rounded-lg">
            {answeredCount}/{examQuestions.length} {t('exam.answered_label')}
          </div>
          <button className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-500" onClick={() => setShowGrid(!showGrid)}>
            <Icon name="grid_view" size={20} />
          </button>
        </div>
      </div>

      {/* Question Navigation Grid */}
      {showGrid && (
        <div className="bg-white rounded-xl border border-surface-100 p-4 mb-3">
          <p className="text-xs font-semibold text-surface-600 mb-3">{t('exam.go_to_q')}</p>
          <div className="grid grid-cols-10 gap-1.5">
            {examQuestions.map((_, i) => {
              const isAnswered = answers[i] !== undefined;
              const isCurrent = i === currentIndex;
              return (
                <button key={i}
                  className={cn('w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center',
                    isCurrent ? 'bg-primary-500 text-white ring-2 ring-primary-300' :
                    isAnswered ? 'bg-primary-50 text-primary-600 border border-primary-200' :
                    'bg-surface-50 text-surface-500 hover:bg-surface-100'
                  )}
                  onClick={() => goToQuestion(i)}
                >{i + 1}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="w-full bg-surface-100 rounded-full h-1.5 mb-3">
        <div className="bg-primary-500 rounded-full h-1.5 transition-all duration-300" style={{ width: `${((currentIndex + 1) / examQuestions.length) * 100}%` }} />
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden flex flex-col">

        {/* Card header */}
        <div className="bg-surface-50 px-5 py-3 flex items-center justify-between border-b border-surface-100 shrink-0">
          <span className="text-sm font-bold text-surface-700">{t('exam.q_number')} {currentIndex + 1} {t('exam.of')} {examQuestions.length}</span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
            q.difficulty === 'easy' ? 'bg-success-50 text-success-600' : q.difficulty === 'medium' ? 'bg-warning-50 text-warning-600' : 'bg-danger-50 text-danger-600'
          )}>
            {q.difficulty === 'easy' ? t('exam.difficulty_easy') : q.difficulty === 'medium' ? t('exam.difficulty_medium') : t('exam.difficulty_hard')}
          </span>
        </div>

        {/* Question content */}
        <div className="p-5 sm:p-6">
          {q.image && <img src={q.image} alt="" className="w-full rounded-xl mb-4 max-h-48 object-contain bg-surface-50" />}
          {lang === 'ar' && <h2 className="text-base font-bold text-surface-900 mb-2 leading-relaxed" dir="rtl">{q.questionAr}</h2>}
          {lang === 'it' && <h2 className="text-base font-bold text-surface-900 mb-2 leading-relaxed" dir="ltr">{q.questionIt}</h2>}
          {lang === 'both' && <h2 className="text-base font-bold text-surface-900 mb-2 leading-relaxed" dir="ltr">{q.questionIt}</h2>}
          {lang === 'both' && <p className="text-base text-surface-600 leading-relaxed" dir="rtl">{q.questionAr}</p>}
        </div>

        {/* VERO / FALSO */}
        <div className="px-5 pb-4 grid grid-cols-2 gap-3 shrink-0">
          <button
            className={cn('py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-base',
              userAnswer === true
                ? 'border-green-500 bg-green-50 text-green-700 shadow-sm'
                : 'border-surface-200 text-surface-400 hover:border-green-400 hover:bg-green-50/50 hover:text-green-600'
            )}
            onClick={() => handleAnswer(true)}
          >
            <Icon name="check_circle" size={22} className={cn(userAnswer === true ? 'text-green-500' : 'text-surface-200')} filled={userAnswer === true} />
            <span>{trueLabel}</span>
          </button>
          <button
            className={cn('py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold text-base',
              userAnswer === false
                ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                : 'border-surface-200 text-surface-400 hover:border-red-400 hover:bg-red-50/50 hover:text-red-600'
            )}
            onClick={() => handleAnswer(false)}
          >
            <Icon name="cancel" size={22} className={cn(userAnswer === false ? 'text-red-500' : 'text-surface-200')} filled={userAnswer === false} />
            <span>{falseLabel}</span>
          </button>
        </div>

        {/* Navigation — pinned to card bottom */}
        <div className="border-t border-surface-100 px-5 py-3 flex items-center justify-between shrink-0">
          <button
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              currentIndex > 0 ? 'text-surface-700 hover:bg-surface-100' : 'text-surface-300 cursor-not-allowed'
            )}
            onClick={prevQuestion}
            disabled={currentIndex === 0}
          >
            <Icon name="chevron_right" size={18} className="ltr:rotate-180" /> {t('exam.prev')}
          </button>
          <span className="text-xs text-surface-400 font-medium tabular-nums">
            {currentIndex + 1} / {examQuestions.length}
          </span>
          <button
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              currentIndex < examQuestions.length - 1 ? 'text-surface-700 hover:bg-surface-100' : 'text-surface-300 cursor-not-allowed'
            )}
            onClick={nextQuestion}
            disabled={currentIndex >= examQuestions.length - 1}
          >
            {t('exam.next')} <Icon name="chevron_left" size={18} className="ltr:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Safe Submit Confirm Button ───────────────────────────────────────────────
// Requires TWO clicks: first shows a warning, second confirms. Resets on blur.
function SubmitConfirmButton({ answeredCount, totalCount, onConfirm }: {
  answeredCount: number;
  totalCount: number;
  onConfirm: () => void;
}) {
  const [step, setStep] = useState<0 | 1>(0);
  const { t } = useTranslation();
  const unanswered = totalCount - answeredCount;

  if (step === 0) {
    return (
      <button
        onClick={() => setStep(1)}
        className="mx-auto flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold border-2 border-surface-300 text-surface-600 hover:border-surface-400 transition-all bg-white"
      >
        <Icon name="send" size={18} />
        {t('exam.submit_exam_btn')}
      </button>
    );
  }

  return (
    <div className="bg-warning-50 border border-warning-200 rounded-xl p-4 space-y-3 text-start">
      <div className="flex items-start gap-2">
        <Icon name="warning" size={20} className="text-warning-500 shrink-0 mt-0.5" filled />
        <div>
          <p className="text-sm font-bold text-warning-800">{t('exam.confirm_submit_title')}</p>
          {unanswered > 0 ? (
            <p className="text-xs text-warning-600 mt-0.5">{t('exam.confirm_unanswered_prefix')} <strong>{unanswered} {t('exam.confirm_unanswered_q')}</strong>. {t('exam.confirm_unanswered_suffix')}</p>
          ) : (
            <p className="text-xs text-warning-600 mt-0.5">{t('exam.confirm_all_answered')}</p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setStep(0)}
          className="flex-1 py-2 rounded-lg text-xs font-semibold border border-surface-300 bg-white text-surface-600 hover:bg-surface-50 transition-all"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg text-xs font-bold bg-danger-500 text-white hover:bg-danger-600 transition-all"
        >
          {t('exam.yes_submit')}
        </button>
      </div>
    </div>
  );
}
