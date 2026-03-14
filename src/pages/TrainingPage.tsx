import { useEffect } from 'react';
import { useAuthStore, useDataStore, useUIStore } from '@/store';
import { useTranslation } from '@/i18n';
import { useTrainingSession } from '@/features/training/hooks/useTrainingSession';
import { TrainingModeSelect } from '@/features/training/components/TrainingModeSelect';
import { TrainingSession } from '@/features/training/components/TrainingSession';
import { TrainingResult } from '@/features/training/components/TrainingResult';

export function TrainingPage() {
  const { user } = useAuthStore();
  const { loadQuestions, loadSigns, loadDictEntries, loadMistakes } = useDataStore();
  const setHideBottomNav = useUIStore(s => s.setHideBottomNav);
  const { t, contentLang } = useTranslation();

  const lang = user?.settings.language || contentLang;
  const trueLabel  = lang === 'ar' ? 'صحيح' : lang === 'it' ? 'Vero'  : 'صحيح / Vero';
  const falseLabel = lang === 'ar' ? 'خطأ'  : lang === 'it' ? 'Falso' : 'خطأ / Falso';

  const session = useTrainingSession();

  // Load data on mount
  useEffect(() => {
    loadQuestions();
    loadSigns();
    loadDictEntries();
    loadMistakes();
  }, [loadQuestions, loadSigns, loadDictEntries, loadMistakes]);

  // Hide bottom nav during active training
  useEffect(() => {
    setHideBottomNav(session.phase === 'training');
    return () => setHideBottomNav(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.phase]);

  // Mode labels for result screen
  const modeLabels: Record<string, string> = {
    questions:    t('training.mode_questions'),
    signs:        t('training.mode_signs'),
    dictionary:   t('training.mode_dictionary'),
    'weak-points': t('training.mode_weak'),
    timed:        t('training.mode_timed'),
    marathon:     t('training.mode_marathon'),
    daily:        t('training.mode_daily'),
    mixed:        t('training.mode_mixed'),
  };

  if (session.phase === 'select') {
    return <TrainingModeSelect onSelect={session.startTraining} />;
  }

  if (session.phase === 'result') {
    return (
      <TrainingResult
        mode={session.mode}
        score={session.score}
        total={session.total}
        timedElapsed={session.timedElapsed}
        modeLabel={modeLabels[session.mode] ?? session.mode}
        onRetry={() => session.startTraining(session.mode)}
        onChooseOther={() => session.setPhase('select')}
      />
    );
  }

  return (
    <TrainingSession
      mode={session.mode}
      index={session.index}
      total={session.total}
      score={session.score}
      items={session.items}
      showAnswer={session.showAnswer}
      userAnswer={session.userAnswer}
      timedElapsed={session.timedElapsed}
      lang={lang}
      trueLabel={trueLabel}
      falseLabel={falseLabel}
      onClose={() => session.setPhase('select')}
      onNext={session.handleNext}
      onQuestionAnswer={session.handleQuestionAnswer}
      onShowAnswer={() => session.setShowAnswer(true)}
    />
  );
}
