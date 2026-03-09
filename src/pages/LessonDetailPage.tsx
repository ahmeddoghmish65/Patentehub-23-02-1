import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useLocaleNavigate } from '@/hooks/useLocaleNavigate';
import { useAuthStore, useDataStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { ROUTES, buildLessonUrl } from '@/constants';

export function LessonDetailPage() {
  const { navigate } = useLocaleNavigate();
  const { lessonId = '' } = useParams<{ lessonId: string }>();
  const { state } = useLocation();
  const sectionIdFromState = (state as { sectionId?: string } | null)?.sectionId;
  const { user } = useAuthStore();
  const { lessons, questions, sections, loadLessons, loadQuestions } = useDataStore();
  const [activeTab, setActiveTab] = useState<'content' | 'questions'>('content');

  const { t, contentLang } = useTranslation();
  const lang = user?.settings.language || contentLang;

  useEffect(() => { loadLessons(); loadQuestions(lessonId); }, [loadLessons, loadQuestions, lessonId]);

  const lesson = lessons.find(l => l.id === lessonId);
  const section = lesson ? sections.find(s => s.id === lesson.sectionId) : null;
  const lessonQuestions = questions.filter(q => q.lessonId === lessonId);
  const sectionLessons = lesson ? lessons.filter(l => l.sectionId === lesson.sectionId).sort((a, b) => a.order - b.order) : [];
  const isCompleted = user?.progress.completedLessons.includes(lessonId);

  if (!lesson) return (
    <div className="text-center py-20">
      <Icon name="error" size={48} className="text-surface-300 mx-auto mb-4" />
      <p className="text-surface-500">{t('lessons_page.lesson_not_found')}</p>
      <Button className="mt-4" onClick={() => navigate(ROUTES.LESSONS)}>{t('lessons_page.go_back')}</Button>
    </div>
  );

  return (
    <div>
      <button onClick={() => navigate(ROUTES.LESSONS, { state: { sectionId: lesson.sectionId } })} className="flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-6">
        <Icon name="arrow_forward" size={20} className="ltr:rotate-180" />
        <span className="text-sm">{t('lessons_page.back_to_lessons')}</span>
      </button>

      <div className="bg-white rounded-2xl p-6 border border-surface-100 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: (section?.color || '#3b82f6') + '15' }}>
            {lesson.image ? (
              <img src={lesson.image} className="w-full h-full object-cover" alt="" />
            ) : (
              <Icon name={section?.icon || 'school'} size={28} style={{ color: section?.color || '#3b82f6' }} filled />
            )}
          </div>
          <div className="flex-1">
            {lang === 'ar' && <h1 className="text-xl font-bold text-surface-900" dir="rtl">{lesson.titleAr}</h1>}
            {lang === 'it' && <h1 className="text-xl font-bold text-surface-900" dir="ltr">{lesson.titleIt}</h1>}
            {lang === 'both' && <h1 className="text-xl font-bold text-surface-900" dir="ltr">{lesson.titleIt}</h1>}
            {lang === 'both' && <p className="text-sm text-primary-500" dir="rtl">{lesson.titleAr}</p>}
            {isCompleted && <span className="inline-flex items-center gap-1 mt-2 text-xs bg-success-50 text-success-600 px-2 py-1 rounded-full"><Icon name="check" size={14} /> {t('lessons_page.completed')}</span>}
          </div>
        </div>

      </div>

      {/* Tabs - Modern gradient design */}
      <div className="bg-white rounded-2xl p-1.5 border border-surface-100 mb-6 flex gap-1">
        <button className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all', 
          activeTab === 'content' ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200' : 'text-surface-500 hover:bg-surface-50')}
          onClick={() => setActiveTab('content')}>
          <Icon name="article" size={20} filled={activeTab === 'content'} /> {t('lessons_page.tab_content')}
        </button>
        <button className={cn('flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all',
          activeTab === 'questions' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200' : 'text-surface-500 hover:bg-surface-50')}
          onClick={() => setActiveTab('questions')}>
          <Icon name="quiz" size={20} filled={activeTab === 'questions'} /> {t('lessons_page.tab_questions')} <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-xs">{lessonQuestions.length}</span>
        </button>
      </div>

      {activeTab === 'content' ? (
        <div className="bg-white rounded-2xl p-6 border border-surface-100 space-y-6">
          {lesson.image && <img src={lesson.image} alt="" className="w-full rounded-xl" />}
          
          {(lang === 'it' || lang === 'both') && (
            <div>
              <h3 className="text-sm font-semibold text-primary-600 mb-2 flex items-center gap-1.5" dir="ltr">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-700 text-[10px] font-extrabold leading-none">IT</span>
              </h3>
              <div className="text-base text-surface-700 leading-relaxed prose-sm" dir="ltr" dangerouslySetInnerHTML={{ __html: lesson.contentIt }} />
            </div>
          )}

          {lang === 'both' && <hr className="border-surface-100" />}

          {(lang === 'ar' || lang === 'both') && (
            <div dir="rtl">
              <h3 className="text-sm font-semibold text-primary-600 mb-2 flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-orange-100 text-orange-700 text-[10px] font-extrabold leading-none">ع</span>
              </h3>
              <div className="text-base text-surface-700 leading-relaxed prose-sm" dangerouslySetInnerHTML={{ __html: lesson.contentAr }} />
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {lessonQuestions.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-surface-100">
              <Icon name="quiz" size={40} className="text-surface-300 mx-auto mb-3" />
              <p className="text-surface-500">{t('lessons_page.no_lesson_questions')}</p>
            </div>
          ) : (
            <>
              {lessonQuestions.map((q, i) => (
                <div key={q.id} className="bg-white rounded-xl p-4 border border-surface-100">
                  <div className="flex items-start gap-3" dir="ltr">
                    <div className="flex flex-col items-center shrink-0 gap-0.5">
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
                        {i + 1}
                      </span>
                    </div>
                    <div>
                      {lang === 'ar' && (
                        <p className="text-sm font-medium text-surface-800" dir="rtl">{q.questionAr}</p>
                      )}
                      {lang === 'it' && (
                        <p className="text-sm font-medium text-surface-800" dir="ltr">{q.questionIt}</p>
                      )}
                      {lang === 'both' && (
                        <p className="text-sm font-medium text-surface-800" dir="ltr">{q.questionIt}</p>
                      )}
                      {lang === 'both' && (
                        <p className="text-sm text-surface-500 mt-1" dir="rtl">{q.questionAr}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {/* Quiz button at the bottom */}
              <div className="pt-4">
                <Button fullWidth size="lg" onClick={() => navigate(ROUTES.QUIZ, { state: { lessonId, sectionId: lesson.sectionId } })} icon={<Icon name="play_arrow" size={22} />}>
                  {t('lessons_page.start_lesson_quiz')} ({lessonQuestions.length} {t('lessons_page.questions_suffix')})
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
