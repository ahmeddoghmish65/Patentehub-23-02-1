import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';
import { useLocaleNavigate } from '@/shared/hooks/useLocaleNavigate';
import { ROUTES } from '@/shared/constants';

const SOCIAL_LINKS = [
  {
    label: 'WhatsApp',
    href: 'https://wa.me/393000000000',
    hoverBg: '#25D366',
    svg: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
  },
  {
    label: 'Instagram',
    href: 'https://instagram.com/patentehub',
    hoverBg: '#E1306C',
    svg: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
  },
  {
    label: 'Facebook',
    href: 'https://facebook.com/patentehub',
    hoverBg: '#1877F2',
    svg: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
  },
  {
    label: 'TikTok',
    href: 'https://tiktok.com/@patentehub',
    hoverBg: '#010101',
    svg: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@patentehub',
    hoverBg: '#FF0000',
    svg: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>,
  },
  {
    label: 'Telegram',
    href: 'https://t.me/patentehub',
    hoverBg: '#2CA5E0',
    svg: <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.820 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.800-.984-.631-.346-1.174.234-1.738.161-.155 2.957-2.718 3.012-2.95.007-.029.014-.14-.054-.198-.068-.057-.169-.037-.242-.022-.103.022-1.745 1.1-4.923 3.23-.466.32-.888.476-1.265.467-.416-.009-1.217-.235-1.813-.428-.730-.237-1.311-.363-1.260-.767.026-.209.325-.422.898-.640 3.523-1.533 5.87-2.545 7.040-3.036 3.352-1.395 4.050-1.638 4.503-1.646z"/></svg>,
  },
];

export function LandingFooter() {
  const { navigate } = useLocaleNavigate();
  const { t, dir } = useTranslation();

  return (
    <footer className="border-t border-white/5" style={{ backgroundColor: '#06101e' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0" dir="ltr">
                <Icon name="directions_car" size={20} className="text-white" filled />
              </div>
              <span className="text-white font-black text-xl" dir="ltr">Patente Hub</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              {t('landing.footer_tagline')}
            </p>

            {/* Social media icons */}
            <div className="flex items-center gap-2.5 mt-4">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = s.hoverBg; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#64748b' }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-12 text-sm">
            <div>
              <p className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-widest">{t('landing.footer_app')}</p>
              <div className="space-y-3">
                <a href="#features" className="block text-slate-500 hover:text-white transition-colors">{t('landing.footer_features')}</a>
                <a href="#testimonials" className="block text-slate-500 hover:text-white transition-colors">{t('landing.footer_testimonials')}</a>
                <a href="#faq" className="block text-slate-500 hover:text-white transition-colors">{t('landing.footer_faq')}</a>
              </div>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-widest">{t('landing.footer_account')}</p>
              <div className="space-y-3">
                <button onClick={() => navigate(ROUTES.REGISTER)} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_register')}</button>
                <button onClick={() => navigate(ROUTES.LOGIN)} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_login')}</button>
              </div>
            </div>
            <div>
              <p className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-widest">{t('landing.footer_legal')}</p>
              <div className="space-y-3">
                <button onClick={() => navigate(ROUTES.PRIVACY_POLICY)} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_privacy')}</button>
                <button onClick={() => navigate(ROUTES.TERMS_OF_SERVICE)} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_terms')}</button>
                <button onClick={() => navigate(ROUTES.CONTACT)} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_contact')}</button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Patente Hub. {t('landing.footer_rights')}</p>
          <div className="flex items-center gap-5 text-xs text-slate-600">
            <button onClick={() => navigate(ROUTES.PRIVACY_POLICY)} className="hover:text-slate-400 transition-colors">{t('landing.footer_privacy_short')}</button>
            <span className="text-slate-800">·</span>
            <button onClick={() => navigate(ROUTES.TERMS_OF_SERVICE)} className="hover:text-slate-400 transition-colors">{t('landing.footer_terms_short')}</button>
            <span className="text-slate-800">·</span>
            <button onClick={() => navigate(ROUTES.CONTACT)} className="hover:text-slate-400 transition-colors">{t('landing.footer_contact_short')}</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
