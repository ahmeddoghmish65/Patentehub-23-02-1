import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';

interface LandingAppPreviewProps {
  isVisible: (id: string) => boolean;
}

export function LandingAppPreview({ isVisible }: LandingAppPreviewProps) {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-white dark:bg-surface-50 overflow-hidden" data-animate id="preview">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn('text-center mb-16 transition-all duration-700', isVisible('preview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          <span className="inline-flex items-center gap-2 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 border border-violet-100 dark:border-violet-800 px-5 py-2 rounded-full text-sm font-semibold mb-5">
            <Icon name="phone_iphone" size={16} filled />
            {t('landing.preview_tag')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">{t('landing.preview_title')}</h2>
          <p className="text-surface-500 mt-4 max-w-xl mx-auto">{t('landing.preview_desc')}</p>
        </div>

        <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-1000', isVisible('preview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12')}>
          {/* Quiz Card */}
          <div className="rounded-3xl p-[2px] bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 shadow-2xl group hover:-translate-y-2 transition-all duration-500">
            <div className="bg-white dark:bg-surface-100 rounded-[22px] p-6 h-full">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-red-50 dark:bg-red-950/40 rounded-xl flex items-center justify-center">
                  <Icon name="quiz" className="text-red-500" size={22} filled />
                </div>
                <div>
                  <h3 className="font-bold text-surface-900 text-sm">{t('landing.preview_quiz_title')}</h3>
                  <p className="text-xs text-surface-400">{t('landing.preview_quiz_q')}</p>
                </div>
                <span className="ms-auto bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-lg">85%</span>
              </div>
              <div className="bg-surface-50 rounded-2xl p-4 mb-4 border border-surface-100">
                <p className="text-sm font-semibold text-surface-800 leading-relaxed">{t('landing.preview_quiz_question')}</p>
                <p className="text-xs text-surface-400 mt-1.5" dir="ltr">I segnali di pericolo sono triangolari</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="py-3.5 px-3 rounded-2xl border-2 border-surface-900 bg-teal-50 dark:bg-teal-900/30 text-center font-bold text-sm text-surface-900">
                  ✓ {t('landing.preview_quiz_correct')}
                </div>
                <div className="py-3.5 px-3 rounded-2xl border-2 border-surface-900 bg-rose-50 dark:bg-rose-900/30 text-center font-bold text-sm text-surface-900 opacity-45">
                  ✗ {t('landing.preview_quiz_wrong')}
                </div>
              </div>
            </div>
          </div>

          {/* Sections Card */}
          <div className="rounded-3xl p-[2px] bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl group hover:-translate-y-2 transition-all duration-500">
            <div className="bg-white dark:bg-surface-100 rounded-[22px] p-6 h-full">
              <h3 className="font-bold text-surface-900 mb-5">{t('landing.preview_sections_title')}</h3>
              <div className="space-y-3">
                {[
                  { icon: 'warning', name: t('landing.preview_s1'), pct: 85, color: '#ef4444' },
                  { icon: 'block', name: t('landing.preview_s2'), pct: 62, color: '#dc2626' },
                  { icon: 'speed', name: t('landing.preview_s3'), pct: 48, color: '#8b5cf6' },
                  { icon: 'directions', name: t('landing.preview_s4'), pct: 31, color: '#3b82f6' },
                ].map((s, j) => (
                  <div key={j} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + '18' }}>
                      <Icon name={s.icon} size={17} style={{ color: s.color }} filled />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-surface-700">{s.name}</span>
                        <span className="text-xs text-surface-400">{s.pct}%</span>
                      </div>
                      <div className="w-full bg-surface-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Exam Readiness Card */}
          <div className="rounded-3xl p-[2px] bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 shadow-2xl group hover:-translate-y-2 transition-all duration-500 md:col-span-2 lg:col-span-1">
            <div className="bg-white dark:bg-surface-100 rounded-[22px] p-6 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center">
                  <Icon name="verified" className="text-emerald-500" size={22} filled />
                </div>
                <div>
                  <h3 className="font-bold text-surface-900 text-sm">{t('dashboard.readiness_card_title')}</h3>
                  <p className="text-xs text-surface-400">{t('dashboard.readiness_level_ready')}</p>
                </div>
              </div>

              {/* Circular progress */}
              <div className="flex items-center justify-center mb-5">
                <div className="relative w-28 h-28">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" className="stroke-surface-200" strokeWidth="8" />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="url(#readinessGrad)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 40 * 0.73} ${2 * Math.PI * 40 * 0.27}`}
                    />
                    <defs>
                      <linearGradient id="readinessGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-surface-900">73%</span>
                    <span className="text-[10px] text-surface-400 font-medium">{t('landing.preview_progress_readiness')}</span>
                  </div>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-2.5 flex-1">
                {[
                  { label: t('dashboard.readiness_factor_accuracy'), pct: 88, color: '#10b981' },
                  { label: t('dashboard.readiness_factor_coverage'), pct: 65, color: '#06b6d4' },
                  { label: t('dashboard.readiness_factor_consistency'), pct: 70, color: '#8b5cf6' },
                ].map((f, j) => (
                  <div key={j}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-surface-600">{f.label}</span>
                      <span className="text-[11px] text-surface-400">{f.pct}%</span>
                    </div>
                    <div className="w-full bg-surface-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full" style={{ width: `${f.pct}%`, backgroundColor: f.color }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl px-3 py-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <Icon name="tips_and_updates" size={13} className="text-emerald-500 shrink-0" filled />
                {t('dashboard.readiness_tip_keep_going')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
