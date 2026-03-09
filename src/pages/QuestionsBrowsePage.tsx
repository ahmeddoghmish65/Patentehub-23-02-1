import { useEffect, useState } from 'react';
import { useAuthStore, useDataStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';

export function QuestionsBrowsePage() {
  const { user } = useAuthStore();
  const { sections, questions, loadSections, loadQuestions } = useDataStore();
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [expandedQ, setExpandedQ] = useState<string | null>(null);

  const lang = user?.settings.language || 'both';

  useEffect(() => { loadSections(); loadQuestions(); }, [loadSections, loadQuestions]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [selectedSection]);

  const sectionQuestions = selectedSection
    ? questions.filter(q => q.sectionId === selectedSection)
    : [];

  if (selectedSection) {
    const section = sections.find(s => s.id === selectedSection);

    return (
      <div>
        <button onClick={() => setSelectedSection(null)} className="flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-5 transition-colors">
          <Icon name="arrow_forward" size={20} className="ltr:rotate-180" />
          <span className="text-sm font-medium">{t('questions_page.back')}</span>
        </button>

        <div className="bg-white rounded-2xl p-5 border border-surface-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ backgroundColor: (section?.color || '#8b5cf6') + '15' }}>
              {section?.image ? (
                <img src={section.image} alt={section.nameAr} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Icon name={section?.icon || 'quiz'} size={26} style={{ color: section?.color || '#8b5cf6' }} filled />
              )}
            </div>
            <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              {lang === 'ar' && <h1 className="text-xl font-bold text-surface-900" dir="rtl">{section?.nameAr || ''}</h1>}
              {lang === 'it' && <h1 className="text-xl font-bold text-surface-900 text-left" dir="ltr">{section?.nameIt || section?.nameAr || ''}</h1>}
              {lang === 'both' && <h1 className="text-xl font-bold text-surface-900 text-left" dir="ltr">{section?.nameIt || ''}</h1>}
              {lang === 'both' && <p className="text-sm text-surface-400" dir="rtl">{section?.nameAr}</p>}
              <p className="text-sm text-surface-500 text-right">{sectionQuestions.length} {t('questions_page.questions_count')}</p>
            </div>
          </div>
        </div>

        {sectionQuestions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
            <Icon name="quiz" size={40} className="text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500">{t('questions_page.no_questions')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sectionQuestions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-xl border border-surface-100 overflow-hidden">
                <button
                  className="w-full p-4 text-start flex items-start gap-3 hover:bg-surface-50 transition-colors"
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                  onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                >
                  <div className="flex flex-col items-center shrink-0 mt-0.5 gap-0.5">
                    <span className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black',
                      q.isTrue ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    )}>
                      {q.isTrue ? 'V' : 'F'}
                    </span>
                    <span className={cn(
                      'text-[8px] font-semibold opacity-50',
                      q.isTrue ? 'text-emerald-600' : 'text-rose-600'
                    )}>
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {q.image && (
                      <img src={q.image} alt="" className="w-full rounded-lg mb-2 max-h-36 object-contain bg-white" />
                    )}
                    {lang === 'ar' && (
                      <p className="text-sm font-medium text-surface-800 leading-relaxed" dir="rtl">{q.questionAr}</p>
                    )}
                    {lang === 'it' && (
                      <p className="text-sm font-medium text-surface-800 leading-relaxed" dir="ltr">{q.questionIt}</p>
                    )}
                    {lang === 'both' && (
                      <p className="text-sm font-medium text-surface-800 leading-relaxed" dir="ltr">{q.questionIt}</p>
                    )}
                    {lang === 'both' && (
                      <p className="text-sm text-surface-500 leading-relaxed mt-1" dir="rtl">{q.questionAr}</p>
                    )}
                  </div>
                </button>

                {expandedQ === q.id && (
                  <div className="px-4 pb-4 border-t border-surface-50 pt-3 ms-11">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <p className="text-xs font-semibold text-blue-600 mb-1 flex items-center gap-1">
                        <Icon name="lightbulb" size={14} filled />
                        {t('questions_page.explanation')}
                      </p>
                      {lang === 'ar' && (
                        <p className="text-sm text-surface-700 leading-relaxed" dir="rtl">{q.explanationAr}</p>
                      )}
                      {lang === 'it' && (
                        <p className="text-sm text-surface-700 leading-relaxed" dir="ltr">{q.explanationIt}</p>
                      )}
                      {lang === 'both' && (
                        <p className="text-sm text-surface-700 leading-relaxed" dir="ltr">{q.explanationIt}</p>
                      )}
                      {lang === 'both' && (
                        <p className="text-sm text-surface-500 leading-relaxed mt-1" dir="rtl">{q.explanationAr}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-surface-400">
                      <span className="flex items-center gap-1">
                        <Icon name="signal_cellular_alt" size={12} />
                        {q.difficulty === 'easy' ? t('questions_page.difficulty_easy') : q.difficulty === 'medium' ? t('questions_page.difficulty_medium') : t('questions_page.difficulty_hard')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name={q.isTrue ? 'check_circle' : 'cancel'} size={12} />
                        {t('questions_page.answer_label')} {q.isTrue ? t('questions_page.answer_true') : t('questions_page.answer_false')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 mb-1">{t('questions_page.title')}</h1>
        <p className="text-surface-500 text-sm">{t('questions_page.subtitle')} — {questions.length} {t('questions_page.available')}</p>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
          <Icon name="quiz" size={48} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">{t('questions_page.no_sections')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map(section => {
            const sectionQs = questions.filter(q => q.sectionId === section.id);
            return (
              <button
                key={section.id}
                className="w-full bg-white rounded-xl p-4 border border-surface-100 hover:border-purple-200 hover:shadow-md transition-all text-start flex items-center gap-4 group"
                onClick={() => setSelectedSection(section.id)}
              >
                <div className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative"
                  style={{ backgroundColor: section.color + '12' }}>
                  {section.image ? (
                    <img src={section.image} alt={section.nameAr} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Icon name={section.icon || 'quiz'} size={32} style={{ color: section.color }} filled />
                  )}
                  {/* Count badge — top-left corner of thumbnail */}
                  <span className="absolute top-1 left-1 bg-white/75 text-purple-600 text-[9px] font-bold px-1.5 py-0.5 rounded-md leading-none">
                    {sectionQs.length}
                  </span>
                </div>
                <div className="flex-1 min-w-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                  {lang === 'ar' && <h3 className="font-bold text-surface-800 text-sm group-hover:text-purple-600 transition-colors">{section.nameAr}</h3>}
                  {lang === 'it' && <h3 className="font-bold text-surface-800 text-sm group-hover:text-purple-600 transition-colors">{section.nameIt}</h3>}
                  {lang === 'both' && <h3 className="font-bold text-surface-800 text-sm group-hover:text-purple-600 transition-colors">{section.nameIt}</h3>}
                  {lang === 'both' && <p className="text-xs text-surface-400 mt-0.5" dir="rtl">{section.nameAr}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Icon name="chevron_left" size={18} className="text-surface-300 group-hover:text-purple-400 ltr:rotate-180" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
