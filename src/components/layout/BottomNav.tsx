import { useLocation } from 'react-router-dom';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { ROUTES } from '@/constants';
import { useLocaleNavigate } from '@/hooks/useLocaleNavigate';
import { useUIStore } from '@/store';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

export function BottomNav() {
  const { navigate, localePath } = useLocaleNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const hideBottomNav = useUIStore(s => s.hideBottomNav);

  if (hideBottomNav) return null;

  const items: NavItem[] = [
    { path: ROUTES.DASHBOARD, icon: 'home', label: t('nav.home') },
    { path: ROUTES.LESSONS, icon: 'school', label: t('nav.lessons') },
    { path: ROUTES.TRAINING, icon: 'fitness_center', label: t('nav.training') },
    { path: ROUTES.COMMUNITY, icon: 'forum', label: t('nav.community') },
    { path: ROUTES.PROFILE, icon: 'person', label: t('nav.profile') },
  ];

  const isActive = (path: string) => {
    const lp = localePath(path);
    return pathname === lp || pathname.startsWith(lp + '/');
  };

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-surface-100 pb-safe">
      <div className="flex items-center justify-around h-16">
        {items.map(item => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 min-w-0 min-h-[44px] justify-center',
                'transition-colors duration-200',
                active ? 'text-primary-600' : 'text-surface-500',
              )}
              onClick={() => navigate(item.path)}
            >
              <span
                className={cn(
                  'transition-transform duration-200',
                  active ? 'scale-110' : 'scale-100',
                )}
              >
                <Icon name={item.icon} size={22} filled={active} />
              </span>
              <span
                className={cn(
                  'text-xs font-medium leading-tight transition-all duration-200',
                  active ? 'font-semibold' : '',
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
