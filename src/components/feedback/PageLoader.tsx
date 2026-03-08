import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/i18n';

/**
 * Full-screen loading state — shown while auth is initialising or
 * a lazy route is being loaded.
 */
export function PageLoader() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl shadow-primary-200 mb-4 animate-pulse">
          <Icon name="directions_car" size={32} className="text-white" filled />
        </div>
        <h1 className="text-xl font-black tracking-tight mb-2">
          <span className="text-surface-900">Patente </span>
          <span className="text-primary-500">Hub</span>
        </h1>
        <div className="flex items-center justify-center gap-2 text-surface-400">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">{t('common.loading')}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Inline spinner — use inside cards or sections.
 */
export function Spinner({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      className={`animate-spin text-primary-500 ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
