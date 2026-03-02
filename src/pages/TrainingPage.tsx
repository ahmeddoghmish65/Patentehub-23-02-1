import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import type { Question, Sign, DictionaryEntry } from '@/db/database';

interface Props { onNavigate: (page: string, data?: Record<string, string>) => void; }

type TrainMode = 'questions' | 'signs' | 'dictionary' | 'weak-points' | 'timed' | 'marathon' | 'daily' | 'mixed';
type Phase = 'select' | 'training' | 'result';

export function TrainingPage({ onNavigate }: Props) {
  const { questions, signs, dictEntries, mistakes, loadQuestions, loadSigns, loadDictEntries, loadMistakes, user } = useAuthStore();
  const { t } = useTranslation();
  const lang = user?.settings.language || 'both';
  const trueLabel  = lang === 'ar' ? 'صحيح' : lang === 'it' ? 'Vero'  : 'صحيح / Vero';
  const falseLabel = lang === 'ar' ? 'خطأ'  : lang === 'it' ? 'Falso' : 'خطأ / Falso';
  void onNavigate;
  const [mode, setMode] = useState<TrainMode>('questions');
  const [phase, setPhase] = useState<Phase>('select');
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [items, setItems] = useState<(Question | Sign | DictionaryEntry)[]>([]);
  // Timed mode
  const [timedStart, setTimedStart] = useState(0);
  const [timedElapsed, setTimedElapsed] = useState(0);
  const TIMED_LIMIT = 120; // 2 minutes
  // User answer tracking for questions
  const [userAnswer, setUserAnswer] = useState<boolean | null>(null);

  useEffect(() => { loadQuestions(); loadSigns(); loadDictEntries(); loadMistakes(); }, [loadQuestions, loadSigns, loadDictEntries, loadMistakes]);

  // Timer for timed mode
  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (phase === 'training' && mode === 'timed') {
      iv = setInterval(() => {
        const e = Math.floor((Date.now() - timedStart) / 1000);
        setTimedElapsed(e);
        if (e >= TIMED_LIMIT) setPhase('result');
      }, 1000);
    }
    return () => clearInterval(iv);
  }, [phase, mode, timedStart]);

  const startTraining = useCallback((m: TrainMode) => {
    setMode(m); setPhase('training'); setIndex(0); setScore(0); setShowAnswer(false); setUserAnswer(null);
    let arr: (Question | Sign | DictionaryEntry)[] = [];
    const count = m === 'marathon' ? 50 : m === 'timed' ? 20 : m === 'daily' ? 15 : 10;

    switch (m) {
      case 'questions':
        arr = [...questions].sort(() => Math.random() - 0.5).slice(0, count);
        break;
      case 'signs':
        arr = [...signs].sort(() => Math.random() - 0.5).slice(0, count);
        break;
      case 'dictionary':
        arr = [...dictEntries].sort(() => Math.random() - 0.5).slice(0, count);
        break;
      case 'weak-points': {
        const weakIds = mistakes.map(m => m.questionId);
        const weakQs = questions.filter(q => weakIds.includes(q.id));
        arr = weakQs.length > 0 ? [...weakQs].sort(() => Math.random() - 0.5).slice(0, count) : [...questions].sort(() => Math.random() - 0.5).slice(0, count);
        break;
      }
      case 'timed':
        arr = [...questions].sort(() => Math.random() - 0.5).slice(0, count);
        setTimedStart(Date.now());
        setTimedElapsed(0);
        break;
      case 'marathon':
        arr = [...questions].sort(() => Math.random() - 0.5).slice(0, count);
        break;
      case 'daily': {
        // Mix of everything
        const qs = [...questions].sort(() => Math.random() - 0.5).slice(0, 5);
        const ss = [...signs].sort(() => Math.random() - 0.5).slice(0, 5);
        const ds = [...dictEntries].sort(() => Math.random() - 0.5).slice(0, 5);
        arr = [...qs, ...ss, ...ds].sort(() => Math.random() - 0.5);
        break;
      }
      case 'mixed': {
        const qs2 = [...questions].sort(() => Math.random() - 0.5).slice(0, 4);
        const ss2 = [...signs].sort(() => Math.random() - 0.5).slice(0, 3);
        const ds2 = [...dictEntries].sort(() => Math.random() - 0.5).slice(0, 3);
        arr = [...qs2, ...ss2, ...ds2].sort(() => Math.random() - 0.5);
        break;
      }
    }
    setItems(arr); setTotal(arr.length);
  }, [questions, signs, dictEntries, mistakes]);

  const handleNext = (correct: boolean) => {
    if (correct) setScore(s => s + 1);
    if (index < items.length - 1) { setIndex(i => i + 1); setShowAnswer(false); setUserAnswer(null); }
    else setPhase('result');
  };

  const handleQuestionAnswer = (ans: boolean) => {
    if (userAnswer !== null) return;
    setUserAnswer(ans);
    setShowAnswer(true);
  };

  const isQuestion = (item: Question | Sign | DictionaryEntry): item is Question => 'questionAr' in item;
  const isSign = (item: Question | Sign | DictionaryEntry): item is Sign => 'nameAr' in item && !('questionAr' in item) && !('termIt' in item);
  const isDictEntry = (item: Question | Sign | DictionaryEntry): item is DictionaryEntry => 'termIt' in item;

  const trainModes: { id: TrainMode; icon: string; label: string; desc: string; count: number; color: string; gradient: string }[] = [
    { id: 'questions', icon: 'quiz', label: t('training.mode_questions'), desc: t('training.mode_questions_desc'), count: questions.length, color: '#3b82f6', gradient: 'from-blue-500 to-blue-600' },
    { id: 'signs', icon: 'traffic', label: t('training.mode_signs'), desc: t('training.mode_signs_desc'), count: signs.length, color: '#ef4444', gradient: 'from-red-500 to-red-600' },
    { id: 'dictionary', icon: 'translate', label: t('training.mode_dictionary'), desc: t('training.mode_dictionary_desc'), count: dictEntries.length, color: '#8b5cf6', gradient: 'from-purple-500 to-purple-600' },
    { id: 'weak-points', icon: 'psychology', label: t('training.mode_weak'), desc: t('training.mode_weak_desc'), count: mistakes.length, color: '#f59e0b', gradient: 'from-amber-500 to-amber-600' },
    { id: 'timed', icon: 'timer', label: t('training.mode_timed'), desc: t('training.mode_timed_desc'), count: questions.length, color: '#10b981', gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'marathon', icon: 'directions_run', label: t('training.mode_marathon'), desc: t('training.mode_marathon_desc'), count: questions.length, color: '#ec4899', gradient: 'from-pink-500 to-pink-600' },
    { id: 'daily', icon: 'today', label: t('training.mode_daily'), desc: t('training.mode_daily_desc'), count: questions.length + signs.length + dictEntries.length, color: '#06b6d4', gradient: 'from-cyan-500 to-cyan-600' },
    { id: 'mixed', icon: 'shuffle', label: t('training.mode_mixed'), desc: t('training.mode_mixed_desc'), count: questions.length + signs.length + dictEntries.length, color: '#6366f1', gradient: 'from-indigo-500 to-indigo-600' },
  ];

  // SELECT MODE
  if (phase === 'select') return (
    <div>
      <h1 className="text-2xl font-bold text-surface-900 mb-2">{t('training.title')}</h1>
      <p className="text-surface-500 mb-6 text-sm">{t('training.desc')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {trainModes.map(item => (
          <button key={item.id}
            className="bg-white rounded-xl p-4 border border-surface-100 hover:border-primary-200 hover:shadow-lg transition-all text-right group flex items-start gap-4"
            onClick={() => startTraining(item.id)} disabled={item.count === 0}>
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

  // RESULT
  if (phase === 'result') {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="max-w-lg mx-auto text-center">
        <div className="bg-white rounded-2xl p-8 border border-surface-100">
          <div className={cn('w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6', pct >= 70 ? 'bg-success-50' : pct >= 40 ? 'bg-warning-50' : 'bg-danger-50')}>
            <Icon name={pct >= 70 ? 'emoji_events' : pct >= 40 ? 'thumb_up' : 'psychology'} size={40} className={pct >= 70 ? 'text-success-500' : pct >= 40 ? 'text-warning-500' : 'text-danger-500'} filled />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 mb-2">{t('training.result_title')}</h2>
          <p className="text-surface-500 text-sm mb-2">{trainModes.find(m => m.id === mode)?.label}</p>
          <p className="text-4xl font-bold text-primary-600 mb-1">{score}/{total}</p>
          <p className="text-surface-500 mb-2">{pct}% {t('training.result_pct')}</p>
          {mode === 'timed' && <p className="text-sm text-surface-400 mb-4">{t('training.result_time_label')}: {Math.floor(timedElapsed / 60)}:{(timedElapsed % 60).toString().padStart(2, '0')}</p>}
          <div className="w-full bg-surface-100 rounded-full h-3 mb-8">
            <div className={cn('rounded-full h-3 transition-all', pct >= 70 ? 'bg-success-500' : pct >= 40 ? 'bg-warning-500' : 'bg-danger-500')} style={{ width: `${pct}%` }} />
          </div>
          <div className="space-y-3">
            <Button fullWidth onClick={() => startTraining(mode)} icon={<Icon name="replay" size={20} />}>{t('training.retry')}</Button>
            <Button fullWidth variant="outline" onClick={() => setPhase('select')}>{t('training.choose_other')}</Button>
          </div>
        </div>
      </div>
    );
  }

  // TRAINING
  const item = items[index];
  if (!item) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setPhase('select')} className="text-surface-400 hover:text-surface-600">
          <Icon name="close" size={24} />
        </button>
        <div className="flex items-center gap-3">
          {mode === 'timed' && (
            <span className={cn('text-sm font-mono font-bold px-3 py-1 rounded-lg',
              TIMED_LIMIT - timedElapsed < 30 ? 'bg-danger-50 text-danger-600 animate-pulse' : 'bg-surface-100 text-surface-600'
            )}>
              <Icon name="timer" size={14} className="inline ml-1" />
              {Math.floor((TIMED_LIMIT - timedElapsed) / 60)}:{((TIMED_LIMIT - timedElapsed) % 60).toString().padStart(2, '0')}
            </span>
          )}
          <span className="text-sm font-semibold text-surface-500 bg-surface-100 px-3 py-1 rounded-lg">{score} ✓</span>
          <span className="text-sm font-semibold text-surface-700">{index + 1}/{total}</span>
        </div>
      </div>
      <div className="w-full bg-surface-100 rounded-full h-2 mb-6">
        <div className="bg-primary-500 rounded-full h-2 transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden mb-4">
        {/* Question training — card shows question only */}
        {isQuestion(item) && (
          <div className="p-6">
            {item.image && <img src={item.image} alt="" className="w-full rounded-xl mb-4 max-h-40 object-contain bg-surface-50" />}
            {(lang === 'ar' || lang === 'both') && <h2 className="text-base font-bold text-surface-900 mb-1" dir="rtl">{item.questionAr}</h2>}
            {(lang === 'it' || lang === 'both') && <p className="text-base text-surface-500" dir="ltr">{item.questionIt}</p>}
          </div>
        )}

        {/* Sign training */}
        {isSign(item) && (
          <div className="p-6">
            <div className="w-36 h-36 mx-auto mb-4 bg-surface-50 rounded-xl flex items-center justify-center overflow-hidden">
              {item.image ? <img src={item.image} alt="" className="w-full h-full object-contain" /> : <Icon name="traffic" size={60} className="text-surface-300" />}
            </div>
            {!showAnswer ? (
              <div className="text-center">
                <p className="text-surface-500 mb-4">{t('training.sign_question')}</p>
                <Button onClick={() => setShowAnswer(true)}>{t('training.show_answer')}</Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                {(lang === 'ar' || lang === 'both') && <h3 className="text-lg font-bold text-surface-900" dir="rtl">{item.nameAr}</h3>}
                {(lang === 'it' || lang === 'both') && <p className="text-base text-primary-500 font-medium" dir="ltr">{item.nameIt}</p>}
                {(lang === 'ar' || lang === 'both') && <p className="text-sm text-surface-500" dir="rtl">{item.descriptionAr}</p>}
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="secondary" onClick={() => handleNext(false)} className="!bg-danger-50 !text-danger-600">{t('training.did_not_know')}</Button>
                  <Button onClick={() => handleNext(true)} className="!bg-success-500">{t('training.knew_it')}</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dictionary training */}
        {isDictEntry(item) && (
          <div className="p-6">
            <div className="text-center mb-4">
              <p className="text-2xl font-bold text-primary-600" dir="ltr">{item.termIt}</p>
              <p className="text-xs text-surface-400 mt-2">{t('training.term_question')}</p>
            </div>
            {!showAnswer ? (
              <div className="text-center">
                <Button onClick={() => setShowAnswer(true)}>{t('training.show_translation')}</Button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                {(lang === 'ar' || lang === 'both') && <h3 className="text-lg font-bold text-surface-900" dir="rtl">{item.termAr}</h3>}
                {(lang === 'ar' || lang === 'both') && item.definitionAr && <p className="text-sm text-surface-500" dir="rtl">{item.definitionAr}</p>}
                {(lang === 'it' || lang === 'both') && item.definitionIt && <p className="text-xs text-surface-400" dir="ltr">{item.definitionIt}</p>}
                <div className="flex gap-2 justify-center pt-2">
                  <Button variant="secondary" onClick={() => handleNext(false)} className="!bg-danger-50 !text-danger-600">{t('training.did_not_know')}</Button>
                  <Button onClick={() => handleNext(true)} className="!bg-success-500">{t('training.knew_it')}</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Vero/Falso buttons outside the card — questions only */}
      {isQuestion(item) && !showAnswer && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            className="py-4 rounded-2xl border-2 border-surface-900 bg-teal-50 hover:bg-teal-100 text-surface-900 font-bold text-base transition-all"
            onClick={() => handleQuestionAnswer(true)}>
            ✓ {trueLabel}
          </button>
          <button
            className="py-4 rounded-2xl border-2 border-surface-900 bg-rose-50 hover:bg-rose-100 text-surface-900 font-bold text-base transition-all"
            onClick={() => handleQuestionAnswer(false)}>
            ✗ {falseLabel}
          </button>
        </div>
      )}

      {/* Feedback outside the card — questions only */}
      {isQuestion(item) && showAnswer && (
        <div className="space-y-3 mb-4">
          <div className={cn('p-4 rounded-xl border', userAnswer === item.isTrue ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200')}>
            <p className="font-semibold text-sm flex items-center gap-2">
              <Icon name={userAnswer === item.isTrue ? 'check_circle' : 'cancel'} size={18} className={userAnswer === item.isTrue ? 'text-success-500' : 'text-danger-500'} filled />
              {userAnswer === item.isTrue ? t('training.correct_answer') : t('training.wrong_answer')}
            </p>
            <p className="text-xs text-surface-600 mt-1">{t('training.correct_is')} {item.isTrue ? trueLabel : falseLabel}</p>
            {(lang === 'ar' || lang === 'both') && item.explanationAr && <p className="text-xs text-surface-500 mt-2" dir="rtl">{item.explanationAr}</p>}
            {(lang === 'it' || lang === 'both') && item.explanationIt && <p className="text-xs text-surface-500 mt-2" dir="ltr">{item.explanationIt}</p>}
          </div>
          <Button fullWidth onClick={() => handleNext(userAnswer === item.isTrue)}>
            {index < items.length - 1 ? t('training.next') : t('training.show_result')}
            <Icon name="arrow_back" size={18} className="mr-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
