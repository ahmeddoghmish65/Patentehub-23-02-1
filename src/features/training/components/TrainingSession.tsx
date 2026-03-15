import type { Question, Sign, DictionaryEntry } from '@/infrastructure/database/database';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import type { TrainMode, TrainItem } from '../types';
import { TIMED_LIMIT } from '../constants';
import { QuestionCard } from './QuestionCard';
import { SignCard } from './SignCard';
import { DictEntryCard } from './DictEntryCard';
import { useFocusMode } from '@/features/focus-mode';
import { FocusToggle } from '@/features/focus-mode';

function isQuestion(item: TrainItem): item is Question {
  return 'questionAr' in item;
}
function isSign(item: TrainItem): item is Sign {
  return 'nameAr' in item && !('questionAr' in item) && !('termIt' in item);
}
function isDictEntry(item: TrainItem): item is DictionaryEntry {
  return 'termIt' in item;
}

interface Props {
  mode: TrainMode;
  index: number;
  total: number;
  score: number;
  items: TrainItem[];
  showAnswer: boolean;
  userAnswer: boolean | null;
  timedElapsed: number;
  lang: string;
  trueLabel: string;
  falseLabel: string;
  onClose: () => void;
  onNext: (correct: boolean) => void;
  onQuestionAnswer: (ans: boolean) => void;
  onShowAnswer: () => void;
}

export function TrainingSession({
  mode, index, total, score, items,
  showAnswer, userAnswer, timedElapsed,
  lang, trueLabel, falseLabel,
  onClose, onNext, onQuestionAnswer, onShowAnswer,
}: Props) {
  const item = items[index];
  const { isActive: focusActive } = useFocusMode();

  if (!item) return null;

  const remaining = TIMED_LIMIT - timedElapsed;
  const progress = ((index + 1) / total) * 100;

  // ─── Focus Mode layout ─────────────────────────────────────────────────────
  if (focusActive) {
    return (
      <div className="space-y-6">
        {/* Minimal focus mode header */}
        <div className="flex items-center justify-between">
          {/* Progress fraction */}
          <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
            {index + 1} / {total}
          </span>

          <div className="flex items-center gap-2">
            {/* Timer — only for timed mode */}
            {mode === 'timed' && (
              <span className={cn(
                'text-sm font-mono font-bold px-3 py-1 rounded-xl tabular-nums',
                remaining < 30
                  ? 'bg-danger-50 text-danger-600 animate-pulse'
                  : 'bg-surface-100 text-surface-600',
              )}>
                <Icon name="timer" size={14} className="inline ml-1" />
                {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
              </span>
            )}

            {/* Score */}
            <span className="text-sm font-semibold text-success-600 bg-success-50 dark:bg-surface-200 px-3 py-1 rounded-xl">
              {score} ✓
            </span>

            {/* Focus mode toggle */}
            <FocusToggle variant="icon" />
          </div>
        </div>

        {/* Slim progress bar */}
        <div className="h-1 bg-surface-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Card content — larger, more padding, centred */}
        {isQuestion(item) && (
          <QuestionCard
            item={item}
            lang={lang}
            showAnswer={showAnswer}
            userAnswer={userAnswer}
            trueLabel={trueLabel}
            falseLabel={falseLabel}
            isLast={index === items.length - 1}
            onAnswer={onQuestionAnswer}
            onNext={onNext}
            focusMode
          />
        )}
        {isSign(item) && (
          <SignCard
            item={item}
            lang={lang}
            showAnswer={showAnswer}
            onShowAnswer={onShowAnswer}
            onNext={onNext}
          />
        )}
        {isDictEntry(item) && (
          <DictEntryCard
            item={item}
            lang={lang}
            showAnswer={showAnswer}
            onShowAnswer={onShowAnswer}
            onNext={onNext}
          />
        )}
      </div>
    );
  }

  // ─── Standard layout ───────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="text-surface-400 hover:text-surface-600 p-1 rounded-lg hover:bg-surface-100 transition-colors">
            <Icon name="close" size={24} />
          </button>
          {/* Focus mode toggle — enter distraction-free mode */}
          <FocusToggle variant="icon" />
        </div>

        <div className="flex items-center gap-3">
          {mode === 'timed' && (
            <span className={cn(
              'text-sm font-mono font-bold px-3 py-1 rounded-lg tabular-nums',
              remaining < 30 ? 'bg-danger-50 text-danger-600 animate-pulse' : 'bg-surface-100 text-surface-600'
            )}>
              <Icon name="timer" size={14} className="inline ml-1" />
              {Math.floor(remaining / 60)}:{(remaining % 60).toString().padStart(2, '0')}
            </span>
          )}
          <span className="text-sm font-semibold text-surface-500 bg-surface-100 px-3 py-1 rounded-lg">{score} ✓</span>
          <span className="text-sm font-semibold text-surface-700">{index + 1}/{total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-surface-100 rounded-full h-2 mb-6">
        <div
          className="bg-primary-500 rounded-full h-2 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Item cards */}
      {isQuestion(item) && (
        <QuestionCard
          item={item}
          lang={lang}
          showAnswer={showAnswer}
          userAnswer={userAnswer}
          trueLabel={trueLabel}
          falseLabel={falseLabel}
          isLast={index === items.length - 1}
          onAnswer={onQuestionAnswer}
          onNext={onNext}
        />
      )}
      {isSign(item) && (
        <SignCard
          item={item}
          lang={lang}
          showAnswer={showAnswer}
          onShowAnswer={onShowAnswer}
          onNext={onNext}
        />
      )}
      {isDictEntry(item) && (
        <DictEntryCard
          item={item}
          lang={lang}
          showAnswer={showAnswer}
          onShowAnswer={onShowAnswer}
          onNext={onNext}
        />
      )}
    </div>
  );
}
