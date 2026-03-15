import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';

interface LandingFeaturesProps {
  isVisible: (id: string) => boolean;
}

export function LandingFeatures({ isVisible }: LandingFeaturesProps) {
  const { t, uiLang } = useTranslation();

  return (
    <section id="features" className="py-24 bg-gradient-to-b from-white dark:from-gray-900 to-surface-50 dark:to-gray-800" data-animate>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className={cn('text-center mb-14 transition-all duration-700', isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          <span className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-100 dark:border-primary-800 px-5 py-2 rounded-full text-sm font-semibold mb-5">
            <Icon name="stars" size={16} filled />
            {t('landing.features_tag')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">{t('landing.features_title')}</h2>
          <p className="text-surface-500 mt-4 max-w-2xl mx-auto text-lg">{t('landing.features_desc')}</p>
        </div>

        <div className={cn(
          'grid grid-cols-2 lg:grid-cols-4 lg:auto-rows-[248px] gap-4 transition-all duration-700',
          isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
        )}>

          {/* F1: Bilingual — large (2 col × 2 row) */}
          <div className="col-span-2 lg:row-span-2 rounded-3xl bg-gradient-to-br from-blue-50 via-primary-50/60 to-indigo-50 dark:from-blue-950 dark:via-slate-900 dark:to-indigo-950 border border-blue-100 dark:border-blue-800/60 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:shadow-blue-100/60 dark:hover:shadow-blue-900/30 transition-all duration-500"
            style={{ transitionDelay: '0ms' }}>
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
                <Icon name="translate" size={26} className="text-white" filled />
              </div>
              <h3 className="text-xl font-black text-surface-900 mb-1.5">{t('landing.f1_title')}</h3>
              <p className="text-surface-500 text-sm leading-relaxed max-w-xs">{t('landing.f1_desc')}</p>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3.5 border border-blue-100 dark:border-blue-900/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">العربية</span>
                  <div className="w-7 h-7 bg-blue-500 rounded-xl flex items-center justify-center">
                    <span className="text-white font-black text-xs">ع</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-blue-100 dark:bg-blue-800/60 rounded-full w-full" />
                  <div className="h-1.5 bg-blue-100 dark:bg-blue-800/60 rounded-full w-4/5" />
                  <div className="h-1.5 bg-blue-100 dark:bg-blue-800/60 rounded-full w-3/5" />
                </div>
              </div>
              <div className="w-8 h-8 bg-white dark:bg-surface-100 border border-surface-200 rounded-full flex items-center justify-center shadow-sm shrink-0">
                <Icon name="swap_horiz" size={15} className="text-surface-400" />
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3.5 border border-blue-100 dark:border-blue-900/50 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Italiano</span>
                  <div className="w-7 h-7 bg-surface-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                    <span className="text-surface-600 dark:text-gray-300 font-black text-xs">IT</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="h-1.5 bg-surface-100 dark:bg-gray-600/60 rounded-full w-full" />
                  <div className="h-1.5 bg-surface-100 dark:bg-gray-600/60 rounded-full w-3/4" />
                  <div className="h-1.5 bg-surface-100 dark:bg-gray-600/60 rounded-full w-1/2" />
                </div>
              </div>
            </div>
          </div>

          {/* F2: Quiz */}
          <div className="col-span-1 rounded-3xl bg-gradient-to-br from-violet-50 dark:from-violet-950/40 to-purple-50 dark:to-purple-950/40 border border-violet-100 dark:border-violet-900/50 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-violet-100/60 transition-all duration-500"
            style={{ transitionDelay: '60ms' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 mb-4 shrink-0">
              <Icon name="quiz" size={20} className="text-white" filled />
            </div>
            <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f2_title')}</h3>
            <p className="text-[11px] text-surface-400 leading-snug">{t('landing.f2_desc')}</p>
            <div className="mt-auto flex gap-2 pt-4">
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-violet-100 dark:border-violet-900/50 shadow-sm text-center">
                <p className="text-xl font-black text-violet-600">92%</p>
                <p className="text-[10px] text-surface-400 leading-tight mt-0.5">{t('landing.stat2_label')}</p>
              </div>
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 border border-violet-100 dark:border-violet-900/50 shadow-sm text-center">
                <p className="text-xl font-black text-surface-800">+10K</p>
                <p className="text-[10px] text-surface-400 leading-tight mt-0.5">{t('landing.stat3_label')}</p>
              </div>
            </div>
          </div>

          {/* F3: Lessons */}
          <div className="col-span-1 rounded-3xl bg-gradient-to-br from-emerald-50 dark:from-emerald-950/40 to-teal-50 dark:to-teal-950/40 border border-emerald-100/70 dark:border-emerald-900/40 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500"
            style={{ transitionDelay: '120ms' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20 mb-4 shrink-0">
              <Icon name="school" size={20} className="text-white" filled />
            </div>
            <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f3_title')}</h3>
            <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f3_desc')}</p>
            <div className="mt-auto space-y-2">
              {([
                { lbl: 'Segnali', pct: 85 },
                { lbl: 'Precedenza', pct: 62 },
                { lbl: 'Velocità', pct: 48 },
              ] as const).map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] text-surface-500" dir="ltr">{item.lbl}</span>
                    <span className="text-[10px] font-bold text-teal-600">{item.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white dark:bg-gray-700 rounded-full overflow-hidden border border-emerald-100 dark:border-emerald-900/50">
                    <div className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full" style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* F4: Traffic Signs */}
          <div className="col-span-1 rounded-3xl bg-gradient-to-br from-red-50 dark:from-red-950/40 to-rose-50 dark:to-rose-950/40 border border-red-100/60 dark:border-red-900/40 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-red-100/40 transition-all duration-500"
            style={{ transitionDelay: '180ms' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-400/20 mb-4 shrink-0">
              <Icon name="traffic" size={20} className="text-white" filled />
            </div>
            <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f4_title')}</h3>
            <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f4_desc')}</p>
            <div className="mt-auto grid grid-cols-3 gap-2">
              {([
                { icon: 'warning', iconClass: 'text-yellow-700 dark:text-yellow-400', bgClass: 'bg-yellow-50 dark:bg-yellow-900/25' },
                { icon: 'block', iconClass: 'text-red-600 dark:text-red-400', bgClass: 'bg-red-50 dark:bg-red-900/25' },
                { icon: 'speed', iconClass: 'text-violet-700 dark:text-violet-400', bgClass: 'bg-violet-50 dark:bg-violet-900/25' },
                { icon: 'directions', iconClass: 'text-blue-700 dark:text-blue-400', bgClass: 'bg-blue-50 dark:bg-blue-900/25' },
                { icon: 'stop_circle', iconClass: 'text-rose-700 dark:text-rose-400', bgClass: 'bg-rose-50 dark:bg-rose-900/25' },
                { icon: 'turn_right', iconClass: 'text-emerald-800 dark:text-emerald-400', bgClass: 'bg-emerald-50 dark:bg-emerald-900/25' },
              ] as const).map((s, i) => (
                <div key={i} className={cn('aspect-square rounded-xl flex items-center justify-center', s.bgClass)}>
                  <Icon name={s.icon} size={15} className={s.iconClass} filled />
                </div>
              ))}
            </div>
          </div>

          {/* F5: Dictionary */}
          <div className="col-span-1 rounded-3xl bg-gradient-to-br from-yellow-50 dark:from-yellow-950/40 to-amber-50/80 dark:to-amber-950/30 border border-yellow-100/70 dark:border-yellow-900/40 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-yellow-100/50 transition-all duration-500"
            style={{ transitionDelay: '240ms' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/20 mb-4 shrink-0">
              <Icon name="menu_book" size={20} className="text-white" filled />
            </div>
            <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f5_title')}</h3>
            <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f5_desc')}</p>
            <div className="mt-auto space-y-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-yellow-100/80 dark:border-yellow-900/40 shadow-sm">
                <p className="text-xs font-black text-surface-800" dir="ltr">Precedenza</p>
                <p className="text-xs text-surface-500 mt-0.5">الأولوية في المرور</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-yellow-100/80 dark:border-yellow-900/40 shadow-sm opacity-55">
                <p className="text-xs font-black text-surface-800" dir="ltr">Segnaletica</p>
                <p className="text-xs text-surface-500 mt-0.5">إشارات الطريق</p>
              </div>
            </div>
          </div>

          {/* F6: Community */}
          <div className="col-span-1 lg:row-start-3 rounded-3xl bg-gradient-to-br from-cyan-50 dark:from-cyan-950/40 to-sky-50 dark:to-sky-950/40 border border-cyan-100 dark:border-cyan-900/50 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-cyan-100/60 transition-all duration-500"
            style={{ transitionDelay: '300ms' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4 shrink-0">
              <Icon name="forum" size={20} className="text-white" filled />
            </div>
            <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f6_title')}</h3>
            <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f6_desc')}</p>
            <div className="mt-auto">
              <div className="flex items-center mb-3">
                {(['bg-blue-400', 'bg-violet-400', 'bg-green-400', 'bg-pink-400', 'bg-amber-400'] as const).map((bg, i) => (
                  <div key={i} className={cn('w-7 h-7 rounded-full border-2 border-white shrink-0', bg, i > 0 ? '-ml-1.5' : '')} />
                ))}
                <span className="text-xs text-surface-500 ms-2 font-semibold">+5K</span>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-2.5 border border-cyan-100 dark:border-cyan-900/50 shadow-sm">
                <div className="flex justify-between text-[10px] text-surface-400 mb-1.5">
                  <span>{uiLang === 'ar' ? 'نسبة النشاط' : 'Attività'}</span>
                  <span>80%</span>
                </div>
                <div className="h-1.5 bg-cyan-50 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* F8: Practice Mode */}
          <div className="col-span-1 lg:col-start-4 lg:row-start-3 rounded-3xl bg-gradient-to-br from-orange-50 dark:from-orange-950/40 to-rose-50/60 dark:to-rose-950/30 border border-orange-100/60 dark:border-orange-900/40 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-orange-100/40 transition-all duration-500"
            style={{ transitionDelay: '420ms' }}>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-400/20 mb-4 shrink-0">
              <Icon name="fitness_center" size={20} className="text-white" filled />
            </div>
            <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f8_title')}</h3>
            <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f8_desc')}</p>
            <div className="mt-auto space-y-2">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-orange-100/60 dark:border-orange-900/40 shadow-sm text-center">
                <p className="text-2xl font-black text-orange-400">7 🔥</p>
                <p className="text-[10px] text-surface-400 mt-0.5">{uiLang === 'ar' ? 'يوم متتالي' : 'giorni di fila'}</p>
              </div>
              <div className="flex gap-1 justify-center">
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <div key={d} className="w-5 h-5 rounded-md bg-amber-400" style={{ opacity: d <= 7 ? 0.25 + d * 0.11 : 0.25 }} />
                ))}
              </div>
            </div>
          </div>

          {/* F7: Progress Tracking — wide (2 col × 1 row) */}
          <div className="col-span-2 lg:col-start-2 lg:row-start-3 rounded-3xl bg-gradient-to-br from-violet-50 dark:from-violet-950/40 to-indigo-50 dark:to-indigo-950/40 border border-violet-100/70 dark:border-violet-900/40 p-6 flex items-center gap-5 shadow-sm hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-500"
            style={{ transitionDelay: '360ms' }}>
            <div className="shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-400/20 mb-3">
                <Icon name="trending_up" size={20} className="text-white" filled />
              </div>
              <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f7_title')}</h3>
              <p className="text-[11px] text-surface-400 max-w-[108px] leading-snug">{t('landing.f7_desc')}</p>
            </div>
            {/* Weekly bar chart */}
            <div className="flex-1 min-w-0">
              <div className="flex items-end gap-1.5 h-[72px] mb-1.5">
                {[35, 52, 44, 68, 58, 78, 72].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-400 to-indigo-300"
                    style={{ height: `${h}%`, opacity: 0.75 + i * 0.04 }}
                  />
                ))}
              </div>
              <div className="flex">
                {(uiLang === 'ar'
                  ? ['ج', 'خ', 'ع', 'ث', 'ث', 'إ', 'أ']
                  : ['L', 'M', 'M', 'G', 'V', 'S', 'D']
                ).map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[9px] text-surface-400">{d}</span>
                ))}
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-surface-400">{uiLang === 'ar' ? 'هذا الأسبوع' : 'Questa settimana'}</span>
                <span className="text-[10px] font-bold text-violet-600">↑ 28%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
