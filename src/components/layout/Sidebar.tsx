import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { ROUTES } from '@/constants';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

export function Sidebar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, dir } = useTranslation();

  if (!user) return null;

  const isAdmin = user.role === 'admin' || user.role === 'manager';

  const navItems: NavItem[] = [
    { path: ROUTES.DASHBOARD, icon: 'home', label: t('nav.home') },
    { path: ROUTES.LESSONS, icon: 'school', label: t('nav.lessons') },
    { path: ROUTES.SIGNS, icon: 'traffic', label: t('nav.signs') },
    { path: ROUTES.DICTIONARY, icon: 'menu_book', label: t('nav.dictionary') },
    { path: ROUTES.TRAINING, icon: 'fitness_center', label: t('nav.training') },
    { path: ROUTES.COMMUNITY, icon: 'forum', label: t('nav.community') },
    { path: ROUTES.PROFILE, icon: 'person', label: t('nav.profile') },
    ...(isAdmin ? [{ path: ROUTES.ADMIN, icon: 'admin_panel_settings', label: t('nav.admin') }] : []),
  ];

  const sidebarPositionClass = dir === 'rtl'
    ? 'top-0 right-0 border-l'
    : 'top-0 left-0 border-r';

  const navButtonAlign = dir === 'rtl' ? 'text-right' : 'text-left';

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <aside className={cn(
      'hidden lg:flex fixed z-50 h-full w-72 bg-white flex-col border-surface-100',
      sidebarPositionClass,
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-surface-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
            <Icon name="directions_car" size={22} className="text-white" filled />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight">
              <span className="text-surface-900">Patente </span>
              <span className="text-primary-500">Hub</span>
            </h1>
            <p className="text-xs text-surface-400">{t('nav.subtitle')}</p>
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="p-4">
        <div className="flex items-center gap-3 bg-surface-50 rounded-xl p-3">
          {user.avatar ? (
            <img src={user.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-800 truncate">{user.name}</p>
            <p className="text-xs text-surface-400">{t('nav.level')} {user.progress.level}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
                navButtonAlign,
                active
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-surface-500 hover:bg-surface-50',
              )}
              onClick={() => navigate(item.path)}
            >
              <Icon
                name={item.icon}
                size={22}
                filled={active}
                className={active ? 'text-primary-600' : 'text-surface-400'}
              />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Streak + Language Switcher */}
      <div className="p-4 space-y-3">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="local_fire_department" size={20} className="text-orange-500" filled />
            <span className="text-sm font-semibold text-orange-700">{t('nav.streak')}</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{user.progress.currentStreak}</p>
          <p className="text-xs text-orange-400 mt-1">
            {t('nav.exam_readiness')}: {user.progress.examReadiness}%
          </p>
        </div>
        <div className="flex items-center justify-center">
          <LanguageSwitcher variant="full" />
        </div>
      </div>
    </aside>
  );
}
