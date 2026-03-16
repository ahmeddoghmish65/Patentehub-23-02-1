import type { Question } from '@/infrastructure/database/database';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { TTSButton } from '@/shared/ui/TTSButton';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';

interface Props {
  item: Question;
  lang: string;
  showAnswer: boolean;
  userAnswer: boolean | null;
  trueLabel: string;
  falseLabel: string;
  isLast: boolean;
  onAnswer: (ans: boolean) => void;
  onNext: (correct: boolean) => void;
  /** When true, renders in larger, centred focus mode style */
  focusMode?: boolean;
}

export function QuestionCard({
  item, lang, showAnswer, userAnswer,
  trueLabel, falseLabel, isLast,
  onAnswer, onNext,
  focusMode = false,
}: Props) {
  const { t } = useTranslation();

  const isCorrect = userAnswer === item.isTrue;

  return (
    <>
      {/* Question card */}
      <div className={cn(
        'bg-white dark:bg-surface-100 rounded-2xl border border-surface-100 overflow-hidden mb-4',
        focusMode ? 'p-8' : 'p-6',
        'transition-colors duration-200',
      )}>
        {item.image && (
          <img
            src={item.image}
            alt=""
            className={cn(
              'w-full rounded-xl bg-surface-50 object-contain mb-4',
              focusMode ? 'max-h-56' : 'max-h-40',
            )}
          />
        )}

        {/* Question text */}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            {lang === 'ar' && (
              <h2 className={cn(
                'font-bold text-surface-900 mb-1',
                focusMode ? 'text-2xl leading-relaxed' : 'text-base',
              )} dir="rtl">
                {item.questionAr}
              </h2>
            )}
            {lang === 'it' && (
              <h2 className={cn(
                'font-bold text-surface-900 mb-1',
                focusMode ? 'text-2xl leading-relaxed' : 'text-base',
              )} dir="ltr">
                {item.questionIt}
              </h2>
            )}
            {lang === 'both' && (
              <>
                <h2 className={cn(
                  'font-bold text-surface-900 mb-1',
                  focusMode ? 'text-xl leading-relaxed' : 'text-base',
                )} dir="ltr">
                  {item.questionIt}
                </h2>
                <p className={cn(
                  'text-surface-500',
                  focusMode ? 'text-lg' : 'text-base',
                )} dir="rtl">
                  {item.questionAr}
                </p>
              </>
            )}
          </div>
          {(lang === 'it' || lang === 'both') && (
            <TTSButton text={item.questionIt} size={focusMode ? 'md' : 'sm'} className="mt-0.5" />
          )}
        </div>
      </div>

      {/* Answer buttons */}
      {!showAnswer && (
        <div className={cn('grid grid-cols-2 gap-4 mb-4', focusMode && 'gap-6')}>
          <button
            className={cn(
              'rounded-2xl border-2 border-surface-200 bg-teal-50 dark:bg-surface-100',
              'hover:border-teal-400 hover:bg-teal-100',
              'text-surface-900 font-bold transition-all duration-200',
              focusMode ? 'py-7 text-xl' : 'py-4 text-base',
            )}
            onClick={() => onAnswer(true)}
          >
            ✓ {trueLabel}
          </button>
          <button
            className={cn(
              'rounded-2xl border-2 border-surface-200 bg-rose-50 dark:bg-surface-100',
              'hover:border-rose-400 hover:bg-rose-100',
              'text-surface-900 font-bold transition-all duration-200',
              focusMode ? 'py-7 text-xl' : 'py-4 text-base',
            )}
            onClick={() => onAnswer(false)}
          >
            ✗ {falseLabel}
          </button>
        </div>
      )}

      {/* Answer reveal + explanation */}
      {showAnswer && (
        <div className="space-y-3 mb-4">
          <div className={cn(
            'rounded-xl border',
            isCorrect ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200',
            focusMode ? 'p-6' : 'p-4',
          )}>
            {/* Correct / wrong indicator */}
            <p className={cn(
              'font-semibold flex items-center gap-2',
              focusMode ? 'text-base mb-2' : 'text-sm',
            )}>
              <Icon
                name={isCorrect ? 'check_circle' : 'cancel'}
                size={focusMode ? 22 : 18}
                className={isCorrect ? 'text-success-500' : 'text-danger-500'}
                filled
              />
              {isCorrect ? t('training.correct_answer') : t('training.wrong_answer')}
            </p>

            {/* Correct value */}
            <p className={cn(
              'text-surface-600 mt-1',
              focusMode ? 'text-sm' : 'text-xs',
            )}>
              {t('training.correct_is')} {item.isTrue ? trueLabel : falseLabel}
            </p>

            {/* Explanation */}
            {(lang === 'ar' || lang === 'both') && item.explanationAr && (
              <p className={cn(
                'text-surface-500 mt-2 leading-relaxed',
                focusMode ? 'text-sm' : 'text-xs',
              )} dir="rtl">
                {item.explanationAr}
              </p>
            )}
            {(lang === 'it' || lang === 'both') && item.explanationIt && (
              <p className={cn(
                'text-surface-500 mt-2 leading-relaxed',
                focusMode ? 'text-sm' : 'text-xs',
              )} dir="ltr">
                {item.explanationIt}
              </p>
            )}
          </div>

          <Button
            fullWidth
            size={focusMode ? 'lg' : 'md'}
            onClick={() => onNext(isCorrect)}
          >
            {isLast ? t('training.show_result') : t('training.next')}
            <Icon name="arrow_back" size={18} className="mr-1" />
          </Button>
        </div>
      )}
    </>
  );
}
