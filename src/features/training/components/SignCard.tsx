import type { Sign } from '@/db/database';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useTranslation } from '@/i18n';

interface Props {
  item: Sign;
  lang: string;
  showAnswer: boolean;
  onShowAnswer: () => void;
  onNext: (correct: boolean) => void;
}

export function SignCard({ item, lang, showAnswer, onShowAnswer, onNext }: Props) {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden mb-4 p-6">
      <div className="w-36 h-36 mx-auto mb-4 bg-surface-50 rounded-xl flex items-center justify-center overflow-hidden">
        {item.image
          ? <img src={item.image} alt="" className="w-full h-full object-contain" />
          : <Icon name="traffic" size={60} className="text-surface-300" />
        }
      </div>

      {!showAnswer ? (
        <div className="text-center">
          <p className="text-surface-500 mb-4">{t('training.sign_question')}</p>
          <Button onClick={onShowAnswer}>{t('training.show_answer')}</Button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          {lang === 'ar' && <h3 className="text-lg font-bold text-surface-900" dir="rtl">{item.nameAr}</h3>}
          {lang === 'it' && <h3 className="text-lg font-bold text-surface-900" dir="ltr">{item.nameIt}</h3>}
          {lang === 'both' && (
            <>
              <h3 className="text-lg font-bold text-surface-900" dir="ltr">{item.nameIt}</h3>
              <p className="text-base text-primary-500 font-medium" dir="rtl">{item.nameAr}</p>
            </>
          )}
          {(lang === 'ar' || lang === 'both') && (
            <p className="text-sm text-surface-500" dir="rtl">{item.descriptionAr}</p>
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
