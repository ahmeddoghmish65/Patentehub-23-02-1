import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';

interface Props {
  onNavigate: (page: string, data?: Record<string, string>) => void;
  initialSectionId?: string;
}

export function LessonsPage({ onNavigate, initialSectionId }: Props) {
  const { sections, lessons, loadSections, loadLessons, user } = useAuthStore();
  const completed = user?.progress.completedLessons || [];
  const [selectedSection, setSelectedSection] = useState<string | null>(initialSectionId || null);
  const lang = user?.settings.language || 'both';
  const { t } = useTranslation();

  useEffect(() => { loadSections(); loadLessons(); }, [loadSections, loadLessons]);

  // Only show active items to regular users
  const activeSections = sections.filter(s => !s.status || s.status === 'active');
  const activeLessons = lessons.filter(l => !l.status || l.status === 'active');

  // Inside a section - show lessons
  if (selectedSection) {
    const section = activeSections.find(s => s.id === selectedSection);
    const sectionLessons = activeLessons.filter(l => l.sectionId === selectedSection).sort((a, b) => a.order - b.order);
    const completedCount = sectionLessons.filter(l => completed.includes(l.id)).length;
    const pct = sectionLessons.length > 0 ? Math.round((completedCount / sectionLessons.length) * 100) : 0;

    return (
      <div>
        {/* Back button + Section header */}
        <button onClick={() => setSelectedSection(null)} className="flex items-center gap-2 text-surface-500 hover:text-primary-600 mb-5 transition-colors">
          <Icon name="arrow_forward" size={20} className="ltr:rotate-180" />
          <span className="text-sm font-medium">{t('lessons_page.back_to_sections')}</span>
        </button>

        <div className="bg-white rounded-2xl p-5 border border-surface-100 mb-6">
          <div className="flex items-center gap-4 mb-4" dir="ltr">
            <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
              style={{ backgroundColor: (section?.color || '#3b82f6') + '12' }}>
              {section?.image ? (
                <img src={section.image} alt={section.nameAr} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Icon name={section?.icon || 'school'} size={28} style={{ color: section?.color || '#3b82f6' }} filled />
              )}
            </div>
            <div className="flex-1 min-w-0">
              {lang === 'ar' && <h1 className="text-xl font-bold text-surface-900" dir="rtl">{section?.nameAr}</h1>}
              {lang === 'it' && <h1 className="text-xl font-bold text-surface-900" dir="ltr">{section?.nameIt}</h1>}
              {lang === 'both' && <h1 className="text-xl font-bold text-surface-900" dir="ltr">{section?.nameIt}</h1>}
              {lang === 'both' && <p className="text-sm text-primary-500" dir="rtl">{section?.nameAr}</p>}
            </div>
          </div>
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-surface-100 rounded-full h-2">
              <div className={cn('rounded-full h-2 transition-all', pct === 100 ? 'bg-success-500' : 'bg-primary-500')} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-surface-500 font-medium shrink-0">{completedCount}/{sectionLessons.length} {t('lessons_page.completed')}</span>
          </div>
        </div>

        {sectionLessons.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-surface-100">
            <Icon name="school" size={40} className="text-surface-300 mx-auto mb-3" />
            <p className="text-surface-500">{t('lessons_page.no_lessons')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sectionLessons.map((lesson, idx) => {
              const isCompleted = completed.includes(lesson.id);
              return (
                <button
                  key={lesson.id}
                  className={cn(
                    'w-full rounded-xl p-4 border hover:shadow-sm transition-all text-start flex items-center gap-3 group',
                    'bg-white border-surface-100 hover:border-primary-200'
                  )}
                  onClick={() => onNavigate('lesson-detail', { lessonId: lesson.id, sectionId: selectedSection })}
                >
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative bg-surface-100">
                    {lesson.image ? (
                      <img src={lesson.image} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-sm font-bold text-surface-500">{idx + 1}</span>
                    )}
                    {isCompleted && (
                      <div className="absolute bottom-0.5 end-0.5 w-5 h-5 bg-success-500 rounded-full flex items-center justify-center">
                        <Icon name="check" size={12} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {lang === 'ar' && <h4 className="text-sm font-semibold text-surface-800 group-hover:text-primary-600 transition-colors" dir="rtl">{lesson.titleAr}</h4>}
                    {lang === 'it' && <h4 className="text-sm font-semibold text-surface-800 group-hover:text-primary-600 transition-colors" dir="ltr">{lesson.titleIt}</h4>}
                    {lang === 'both' && <h4 className="text-sm font-semibold text-surface-800 group-hover:text-primary-600 transition-colors" dir="ltr">{lesson.titleIt}</h4>}
                    {lang === 'both' && <p className="text-xs text-surface-400 truncate mt-0.5" dir="rtl">{lesson.titleAr}</p>}
                  </div>

                  <Icon name="chevron_left" size={18} className="text-surface-300 group-hover:text-primary-400 shrink-0 ltr:rotate-180" />
                </button>
              );
            })}

            {/* Quiz for whole section */}
            <div className="pt-3">
              <Button fullWidth variant="outline"
                onClick={() => onNavigate('quiz', { sectionId: selectedSection })}
                icon={<Icon name="quiz" size={18} />}>
                {t('lessons_page.section_quiz_btn')} ({sectionLessons.length > 0 ? `${sectionLessons.length} ${t('lessons_page.lesson_label')}` : ''})
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Sections list
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 mb-1">{t('lessons_page.title')}</h1>
        <p className="text-surface-500 text-sm">{t('lessons_page.subtitle')}</p>
      </div>

      {activeSections.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
          <Icon name="school" size={48} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500 mb-2">{t('lessons_page.no_sections')}</p>
          <p className="text-sm text-surface-400">{t('lessons_page.no_sections_desc')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeSections.map(section => {
            const sectionLessons = activeLessons.filter(l => l.sectionId === section.id);
            const completedCount = sectionLessons.filter(l => completed.includes(l.id)).length;
            const totalCount = sectionLessons.length;
            const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <button
                key={section.id}
                className="w-full bg-white rounded-xl p-4 border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all text-start flex items-center gap-4 group"
                onClick={() => setSelectedSection(section.id)}
              >
                {/* Thumbnail on right - bigger */}
                <div className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative"
                  style={{ backgroundColor: section.color + '12' }}>
                  {section.image ? (
                    <img src={section.image} alt={section.nameAr} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Icon name={section.icon || 'school'} size={36} style={{ color: section.color }} filled />
                  )}
                  {/* Completed badge — top-left corner of thumbnail */}
                  {pct === 100 && (
                    <span className="absolute top-1 left-1 w-6 h-6 bg-success-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Icon name="check" size={15} className="text-white" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5" dir="ltr">
                    {lang === 'ar' && <h3 className="font-bold text-surface-800 text-sm group-hover:text-primary-600 transition-colors" dir="rtl">{section.nameAr}</h3>}
                    {lang === 'it' && <h3 className="font-bold text-surface-800 text-sm group-hover:text-primary-600 transition-colors" dir="ltr">{section.nameIt}</h3>}
                    {lang === 'both' && <h3 className="font-bold text-surface-800 text-sm group-hover:text-primary-600 transition-colors" dir="ltr">{section.nameIt}</h3>}
                  </div>
                  {lang === 'both' && <p className="text-xs text-surface-400 mb-2" dir="rtl">{section.nameAr}</p>}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-surface-100 rounded-full h-1.5 max-w-[180px]">
                      <div className={cn('rounded-full h-1.5 transition-all', pct === 100 ? 'bg-success-500' : 'bg-primary-500')} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[11px] text-surface-400">{completedCount}/{totalCount}</span>
                  </div>
                </div>

                <Icon name="chevron_left" size={20} className="text-surface-300 group-hover:text-primary-400 shrink-0 ltr:rotate-180" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
