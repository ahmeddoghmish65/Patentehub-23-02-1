import { useState, useEffect } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { useLocaleNavigate } from '@/hooks/useLocaleNavigate';
import { ROUTES } from '@/constants';

interface Feature {
  icon: string;
  title: string;
  desc: string;
  bg: string;
}

interface LandingHeroProps {
  features: Feature[];
}

export function LandingHero({ features }: LandingHeroProps) {
  const { navigate } = useLocaleNavigate();
  const { t, dir, uiLang } = useTranslation();
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3200);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/70 to-blue-50/80" />
      <div className="absolute inset-0 opacity-60"
        style={{ backgroundImage: 'radial-gradient(ellipse 80% 55% at 60% 0%, rgba(59,130,246,0.12), transparent)' }} />
      <div className="absolute inset-0 opacity-[0.04]"
        style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.6) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-2/3 left-1/2 w-56 h-56 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Content */}
          <div className={cn('text-center order-2 lg:order-1', dir === 'rtl' ? 'lg:text-right' : 'lg:text-left')}>
            <div className="inline-flex items-center gap-2.5 bg-primary-50 border border-primary-200/70 text-primary-700 px-5 py-2.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up shadow-sm">
              <Icon name="auto_awesome" size={18} filled className="text-primary-500" />
              <span>{t('landing.hero_badge')}</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-surface-900 leading-[1.05] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {t('landing.hero_title_1')}<br />
              <span className="bg-gradient-to-l from-primary-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                {t('landing.hero_title_2')}
              </span><br />
              <span className="text-surface-500">{t('landing.hero_title_3')}</span>
            </h1>

            <p className="text-lg text-surface-500 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {t('landing.hero_desc')}
            </p>

            <div className={cn('flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up', dir === 'rtl' ? 'justify-center lg:justify-start' : 'justify-center lg:justify-start')} style={{ animationDelay: '0.3s' }}>
              <button onClick={() => navigate(ROUTES.REGISTER)}
                className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-l from-primary-600 to-primary-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-l from-primary-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon name="rocket_launch" size={20} className="relative shrink-0" />
                <span className="relative">{t('landing.cta_start')}</span>
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 border-2 border-primary-200 text-primary-700 font-semibold text-base rounded-2xl hover:bg-primary-50 hover:border-primary-300 transition-all duration-300">
                <Icon name="play_circle" size={20} />
                {t('landing.cta_discover')}
              </button>
            </div>

            {/* Mini badges */}
            <div className={cn('flex flex-wrap items-center gap-3 mt-10 animate-fade-in-up', dir === 'rtl' ? 'justify-center lg:justify-start' : 'justify-center lg:justify-start')} style={{ animationDelay: '0.4s' }}>
              {[t('landing.badge_free'), ...(uiLang !== 'it' ? [t('landing.badge_arabic')] : []), t('landing.badge_updated'), t('landing.badge_success')].map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 bg-white border border-surface-200 text-surface-600 text-xs px-3 py-1.5 rounded-full shadow-sm">
                  <Icon name="check_circle" size={12} className="text-green-500" filled />
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive feature wheel */}
          <div className="order-1 lg:order-2 hidden lg:flex items-center justify-center">
            <div className="relative w-[420px] h-[420px]">
              <div className="absolute inset-1/4 bg-primary-400/15 rounded-full blur-3xl" />
              <div className="absolute inset-8 rounded-full border border-primary-200/40" />
              <div className="absolute inset-16 rounded-full border border-primary-200/60" />
              <div className="absolute inset-[30%] bg-white backdrop-blur-2xl rounded-3xl border border-primary-100 flex flex-col items-center justify-center p-4 shadow-xl shadow-primary-500/10">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br mb-3 shadow-lg transition-all duration-500', features[activeFeature].bg)}>
                  <Icon name={features[activeFeature].icon} size={28} className="text-white" filled />
                </div>
                <p className="text-surface-800 font-bold text-sm text-center leading-tight">{features[activeFeature].title}</p>
              </div>
              {features.map((f, i) => {
                const angle = (i / features.length) * 360 - 90;
                const rad = (angle * Math.PI) / 180;
                const rx = 46, ry = 46;
                const x = 50 + rx * Math.cos(rad);
                const y = 50 + ry * Math.sin(rad);
                return (
                  <button key={i} onClick={() => setActiveFeature(i)}
                    className={cn('absolute w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300',
                      activeFeature === i ? 'bg-primary-500 shadow-xl shadow-primary-500/30 scale-115' : 'bg-white border border-surface-200 hover:border-primary-300 hover:bg-primary-50 shadow-sm')}
                    style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%)` }}>
                    <Icon name={f.icon} size={18} className={activeFeature === i ? 'text-white' : 'text-surface-500'} filled={activeFeature === i} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 inset-x-0">
        <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,70 L1440,70 L1440,35 C1200,70 960,0 720,18 C480,36 240,70 0,35 Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
