import { useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { Button } from '@/shared/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import { useLocaleNavigate } from '@/shared/hooks/useLocaleNavigate';
import { ROUTES } from '@/shared/constants';

interface NavLink {
  id: string;
  label: string;
  icon: string;
}

interface LandingNavbarProps {
  scrolled: boolean;
  navLinks: NavLink[];
}

export function LandingNavbar({ scrolled, navLinks }: LandingNavbarProps) {
  const { navigate } = useLocaleNavigate();
  const { t, dir, uiLang } = useTranslation();
  const [mobileMenu, setMobileMenu] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenu(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 10);
  };

  return (
    <>
      {/* Mobile menu backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden transition-all duration-300',
          mobileMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileMenu(false)}
      />

      <nav className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled ? 'bg-white/95 dark:bg-surface-100/95 backdrop-blur-2xl shadow-lg shadow-surface-900/5 border-b border-surface-100' : 'bg-white/80 dark:bg-surface-100/80 backdrop-blur-md border-b border-surface-100/60'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20 overflow-hidden">
            <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative shrink-0" dir="ltr">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Icon name="directions_car" size={20} className="text-white" filled />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-surface-100" />
              </div>
              <span className="text-lg font-black tracking-tight whitespace-nowrap" dir="ltr">
                <span className="text-surface-900">Patente </span>
                <span className="text-primary-500">Hub</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <button key={l.id} onClick={() => document.getElementById(l.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    'text-surface-600 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30')}>
                  {l.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher variant="dropdown" />
              <button onClick={() => navigate(ROUTES.LOGIN)}
                className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  'text-surface-600 hover:bg-surface-100')}>
                {t('landing.login')}
              </button>
              <Button size="sm" onClick={() => navigate(ROUTES.REGISTER)} icon={<Icon name="rocket_launch" size={15} />}>
                {t('landing.register_free')}
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden shrink-0">
              <button
                onClick={() => navigate(ROUTES.LOGIN)}
                className="px-3 py-1.5 rounded-xl text-sm font-semibold text-primary-600 border border-primary-200 bg-primary-50 hover:bg-primary-100 transition-all whitespace-nowrap"
              >
                {t('landing.login')}
              </button>
              <button
                className={cn(
                  'relative p-2 rounded-xl transition-all duration-200',
                  mobileMenu ? 'bg-primary-50 text-primary-600' : 'hover:bg-surface-100 text-surface-800'
                )}
                onClick={() => setMobileMenu(!mobileMenu)}
                aria-expanded={mobileMenu}
                aria-label="القائمة"
              >
                <Icon name={mobileMenu ? 'close' : 'menu'} size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={cn(
          'md:hidden absolute inset-x-3 top-[calc(100%+8px)] z-50 transition-all duration-300 ease-out',
          mobileMenu
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-3 pointer-events-none'
        )}>
          <div className="bg-white dark:bg-surface-100 rounded-2xl shadow-2xl border border-surface-100 overflow-hidden">
            <div className="p-2 pb-1">
              {navLinks.map((l, i) => (
                <button
                  key={l.id}
                  onClick={() => scrollToSection(l.id)}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-surface-700 font-medium hover:bg-primary-50 hover:text-primary-700 transition-all group"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="w-9 h-9 bg-primary-50 group-hover:bg-primary-100 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                    <Icon name={l.icon} size={18} className="text-primary-500" />
                  </div>
                  <span className="flex-1 text-start">{l.label}</span>
                  <Icon
                    name={dir === 'rtl' ? 'chevron_left' : 'chevron_right'}
                    size={18}
                    className="text-surface-300 group-hover:text-primary-400 transition-colors"
                  />
                </button>
              ))}
            </div>

            <div className="mx-3 border-t border-surface-100 my-1" />

            <div className="px-3 py-2">
              <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest mb-2 px-1">
                {uiLang === 'ar' ? 'اللغة' : uiLang === 'it' ? 'Lingua' : 'Language'}
              </p>
              <LanguageSwitcher variant="full" className="w-full justify-around" />
            </div>

            <div className="mx-3 border-t border-surface-100 my-1" />

            <div className="p-3 space-y-2">
              <Button
                fullWidth
                variant="outline"
                onClick={() => { setMobileMenu(false); navigate(ROUTES.LOGIN); }}
              >
                {t('landing.login')}
              </Button>
              <Button
                fullWidth
                onClick={() => { setMobileMenu(false); navigate(ROUTES.REGISTER); }}
                icon={<Icon name="rocket_launch" size={15} />}
              >
                {t('landing.register_free')}
              </Button>
            </div>

            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {[
                { icon: 'check_circle', label: t('landing.badge_free') },
                ...(uiLang !== 'it' ? [{ icon: 'check_circle', label: t('landing.badge_arabic') }] : []),
                { icon: 'check_circle', label: t('landing.badge_updated') },
              ].map((b, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-[11px] text-surface-500 bg-surface-50 border border-surface-100 px-2.5 py-1 rounded-full">
                  <Icon name={b.icon} size={11} className="text-green-500" filled />
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
