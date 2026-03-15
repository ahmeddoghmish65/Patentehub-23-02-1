import { useLocaleNavigate } from '@/shared/hooks/useLocaleNavigate';
import { Icon } from '@/shared/ui/Icon';
import { useTranslation } from '@/i18n';
import { ROUTES } from '@/shared/constants';

export function NotFoundPage() {
  const { navigate } = useLocaleNavigate();
  const { t, uiLang } = useTranslation();
  const isIt = uiLang === 'it';

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Large 404 number */}
        <div className="relative mb-8">
          <p className="text-[120px] font-black text-surface-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center shadow-sm">
              <Icon name="search_off" size={40} className="text-primary-500" filled />
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-surface-900 mb-3">
          {t('not_found.title')}
        </h1>
        <p className="text-surface-500 text-sm mb-8 leading-relaxed">
          {t('not_found.desc')}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(ROUTES.DASHBOARD)}
            className="flex items-center justify-center gap-2 bg-primary-500 text-white rounded-xl px-6 py-3 font-semibold hover:bg-primary-600 transition-colors"
          >
            <Icon name="home" size={18} className="text-white" filled />
            {t('not_found.go_home')}
          </button>
          <button
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-white text-surface-700 rounded-xl px-6 py-3 font-semibold border border-surface-200 hover:bg-surface-50 transition-colors"
          >
            <Icon name={isIt ? 'arrow_back' : 'arrow_forward'} size={18} className="text-surface-500" />
            {isIt ? 'Torna indietro' : uiLang === 'en' ? 'Go back' : 'رجوع'}
          </button>
        </div>

        {/* Quick links */}
        <div className="mt-10 grid grid-cols-3 gap-3">
          {[
            { icon: 'school', label: t('nav.lessons'), route: ROUTES.LESSONS },
            { icon: 'forum',  label: t('nav.community'), route: ROUTES.COMMUNITY },
            { icon: 'person', label: t('nav.profile'),   route: ROUTES.PROFILE },
          ].map(item => (
            <button
              key={item.route}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center gap-1.5 bg-white rounded-xl p-3 border border-surface-100 hover:border-primary-200 hover:bg-primary-50 transition-all group"
            >
              <Icon name={item.icon} size={22} className="text-surface-400 group-hover:text-primary-500 transition-colors" filled />
              <span className="text-xs text-surface-500 group-hover:text-primary-600 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
