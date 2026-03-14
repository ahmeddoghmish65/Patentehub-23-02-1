import type { Question } from '@/db/database';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
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
}

export function QuestionCard({ item, lang, showAnswer, userAnswer, trueLabel, falseLabel, isLast, onAnswer, onNext }: Props) {
  const { t } = useTranslation();

  return (
    <>
      <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden mb-4 p-6">
        {item.image && (
          <img src={item.image} alt="" className="w-full rounded-xl mb-4 max-h-40 object-contain bg-surface-50" />
        )}
        {lang === 'ar' && <h2 className="text-base font-bold text-surface-900 mb-1" dir="rtl">{item.questionAr}</h2>}
        {lang === 'it' && <h2 className="text-base font-bold text-surface-900 mb-1" dir="ltr">{item.questionIt}</h2>}
        {lang === 'both' && (
          <>
            <h2 className="text-base font-bold text-surface-900 mb-1" dir="ltr">{item.questionIt}</h2>
            <p className="text-base text-surface-500" dir="rtl">{item.questionAr}</p>
          </>
        )}
      </div>

      {!showAnswer && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            className="py-4 rounded-2xl border-2 border-surface-900 bg-teal-50 hover:bg-teal-100 text-surface-900 font-bold text-base transition-all"
            onClick={() => onAnswer(true)}
          >
            ✓ {trueLabel}
          </button>
          <button
            className="py-4 rounded-2xl border-2 border-surface-900 bg-rose-50 hover:bg-rose-100 text-surface-900 font-bold text-base transition-all"
            onClick={() => onAnswer(false)}
          >
            ✗ {falseLabel}
          </button>
        </div>
      )}

      {showAnswer && (
        <div className="space-y-3 mb-4">
          <div className={cn('p-4 rounded-xl border', userAnswer === item.isTrue ? 'bg-success-50 border-success-200' : 'bg-danger-50 border-danger-200')}>
            <p className="font-semibold text-sm flex items-center gap-2">
              <Icon
                name={userAnswer === item.isTrue ? 'check_circle' : 'cancel'}
                size={18}
                className={userAnswer === item.isTrue ? 'text-success-500' : 'text-danger-500'}
                filled
              />
              {userAnswer === item.isTrue ? t('training.correct_answer') : t('training.wrong_answer')}
            </p>
            <p className="text-xs text-surface-600 mt-1">{t('training.correct_is')} {item.isTrue ? trueLabel : falseLabel}</p>
            {(lang === 'ar' || lang === 'both') && item.explanationAr && (
              <p className="text-xs text-surface-500 mt-2" dir="rtl">{item.explanationAr}</p>
            )}
            {(lang === 'it' || lang === 'both') && item.explanationIt && (
              <p className="text-xs text-surface-500 mt-2" dir="ltr">{item.explanationIt}</p>
            )}
          </div>
          <Button fullWidth onClick={() => onNext(userAnswer === item.isTrue)}>
            {isLast ? t('training.show_result') : t('training.next')}
            <Icon name="arrow_back" size={18} className="mr-1" />
          </Button>
        </div>
      )}
    </>
  );
}
