import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';

interface Step {
  step: string;
  icon: string;
  title: string;
  titleIt: string;
  desc: string;
  color: string;
}

interface LandingHowItWorksProps {
  isVisible: (id: string) => boolean;
  steps: Step[];
}

export function LandingHowItWorks({ isVisible, steps }: LandingHowItWorksProps) {
  const { t, dir } = useTranslation();

  return (
    <section id="how" className="py-24 bg-surface-50" data-animate>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn('text-center mb-16 transition-all duration-700', isVisible('how') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          <span className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800 px-5 py-2 rounded-full text-sm font-semibold mb-5">
            <Icon name="route" size={16} filled />
            {t('landing.how_tag')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">{t('landing.how_title')}</h2>
          <p className="text-surface-500 mt-4 max-w-xl mx-auto text-lg">{t('landing.how_desc')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((s, i) => (
            <div key={i}
              className={cn('flex flex-col items-center text-center transition-all duration-700', isVisible('how') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}
              style={{ transitionDelay: `${i * 180}ms` }}>
              <div className="relative mb-7">
                <div className={cn('w-24 h-24 mx-auto bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-default', s.color)}>
                  <Icon name={s.icon} size={44} className="text-white" filled />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-surface-100 rounded-xl shadow-lg flex items-center justify-center border border-surface-100">
                  <span className="text-sm font-black text-surface-400">{s.step}</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-1">{s.title}</h3>
              {dir === 'rtl' && <p className="text-xs text-primary-500 font-medium mb-3">{s.titleIt}</p>}
              <p className="text-surface-500 leading-relaxed text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
