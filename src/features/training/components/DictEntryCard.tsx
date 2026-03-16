import type { DictionaryEntry } from '@/infrastructure/database/database';
import { Button } from '@/shared/ui/Button';
import { TTSButton } from '@/shared/ui/TTSButton';
import { useTranslation } from '@/i18n';

interface Props {
  item: DictionaryEntry;
  lang: string;
  showAnswer: boolean;
  onShowAnswer: () => void;
  onNext: (correct: boolean) => void;
}

export function DictEntryCard({ item, lang, showAnswer, onShowAnswer, onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark:bg-surface-100 rounded-2xl border border-surface-100 overflow-hidden mb-4 p-6">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2">
          <p className="text-2xl font-bold text-primary-600" dir="ltr">{item.termIt}</p>
          <TTSButton text={item.termIt} size="sm" />
        </div>
        <p className="text-xs text-surface-400 mt-2">{t('training.term_question')}</p>
      </div>

      {!showAnswer ? (
        <div className="text-center">
          <Button onClick={onShowAnswer}>{t('training.show_translation')}</Button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          {(lang === 'ar' || lang === 'both') && (
            <h3 className="text-lg font-bold text-surface-900" dir="rtl">{item.termAr}</h3>
          )}
          {(lang === 'ar' || lang === 'both') && item.definitionAr && (
            <p className="text-sm text-surface-500" dir="rtl">{item.definitionAr}</p>
          )}
          {(lang === 'it' || lang === 'both') && item.definitionIt && (
            <div className="flex items-center justify-center gap-1" dir="ltr">
              <p className="text-xs text-surface-400">{item.definitionIt}</p>
              <TTSButton text={item.definitionIt} size="sm" />
            </div>
          )}
          <div className="flex gap-2 justify-center pt-2">
            <Button variant="secondary" onClick={() => onNext(false)} className="!bg-danger-50 !text-danger-600">
              {t('training.did_not_know')}
            </Button>
            <Button onClick={() => onNext(true)} className="!bg-success-500">
              {t('training.knew_it')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
