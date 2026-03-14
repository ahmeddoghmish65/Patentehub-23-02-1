import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/i18n';
import { useLocaleNavigate } from '@/hooks/useLocaleNavigate';
import { ROUTES } from '@/constants';

export function LandingCTA() {
  const { navigate } = useLocaleNavigate();
  const { t } = useTranslation();

  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700" />
      <div className="absolute inset-0 opacity-25"
        style={{ backgroundImage: 'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(255,255,255,0.25) 0%, transparent 55%)' }} />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur-sm rounded-3xl mb-8 shadow-2xl border border-white/20">
          <Icon name="directions_car" size={40} className="text-white" filled />
        </div>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
          {t('landing.cta_title')}
        </h2>
        <p className="text-white/65 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          {t('landing.cta_desc')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button onClick={() => navigate(ROUTES.REGISTER)}
            className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-white text-primary-700 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1">
            <Icon name="rocket_launch" size={22} />
            {t('landing.cta_register')}
          </button>
          <button onClick={() => navigate(ROUTES.LOGIN)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300">
            {t('landing.cta_login')}
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          {[t('landing.cta_badge1'), t('landing.cta_badge2'), t('landing.cta_badge3'), t('landing.cta_badge4')].map((b, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/70 text-sm px-4 py-2 rounded-full">
              <Icon name="check_circle" size={14} className="text-green-400" filled />
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
