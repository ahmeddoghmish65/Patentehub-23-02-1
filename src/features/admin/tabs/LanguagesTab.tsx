/**
 * LanguagesTab — Language management (default language, enable/disable languages).
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation, type UiLang } from '@/i18n';

export const LanguagesTab = React.memo(function LanguagesTab() {
  const { t, uiLang, setUiLang } = useTranslation();
  const rawNavigate = useNavigate();
  const { pathname } = useLocation();

  const [langDefault, setLangDefault] = useState<UiLang>(
    () => (localStorage.getItem('ph_admin_default_lang') as UiLang) || 'ar'
  );
  const [langEnabled, setLangEnabled] = useState<Record<UiLang, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('ph_admin_lang_enabled') || '{"ar":true,"it":true,"en":true}'); }
    catch { return { ar: true, it: true, en: true }; }
  });

  const saveAdminLangSettings = (defaultLang: UiLang, enabled: Record<UiLang, boolean>) => {
    localStorage.setItem('ph_admin_default_lang', defaultLang);
    localStorage.setItem('ph_admin_lang_enabled', JSON.stringify(enabled));
  };

  const handleSetDefault = (lang: UiLang) => {
    setLangDefault(lang);
    setUiLang(lang);
    saveAdminLangSettings(lang, langEnabled);
    const pathWithoutLang = pathname.replace(`/${uiLang}`, '') || '';
    rawNavigate(`/${lang}${pathWithoutLang}`, { replace: true });
  };

  const handleToggleLang = (lang: UiLang) => {
    if (lang === 'ar') return;
    const next = { ...langEnabled, [lang]: !langEnabled[lang] };
    setLangEnabled(next);
    saveAdminLangSettings(langDefault, next);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-surface-100 rounded-xl border border-surface-100 p-6">
        <h2 className="text-lg font-bold text-surface-900 mb-1 flex items-center gap-2">
          <Icon name="translate" size={20} className="text-primary-500" filled />
          {t('admin.lang_title')}
        </h2>
        <p className="text-sm text-surface-400 mb-6">{t('admin.lang_desc')}</p>

        <div className="space-y-4">
          {/* Arabic */}
          <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-lg font-black text-green-700">ع</span>
              </div>
              <div>
                <p className="font-semibold text-surface-900">{t('admin.lang_ar_name')}</p>
                <p className="text-xs text-surface-400">{t('admin.lang_rtl')} · ar</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {langDefault === 'ar' && (
                <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-1 rounded-full font-semibold">
                  {t('admin.lang_current_default')}
                </span>
              )}
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-semibold">
                {t('admin.lang_enabled')}
              </span>
              {langDefault !== 'ar' && (
                <button onClick={() => handleSetDefault('ar')}
                  className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                  {t('admin.lang_set_default')}
                </button>
              )}
            </div>
          </div>

          {/* Italian */}
          <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-sm font-black text-blue-700">IT</span>
              </div>
              <div>
                <p className="font-semibold text-surface-900">{t('admin.lang_it_name')}</p>
                <p className="text-xs text-surface-400">{t('admin.lang_ltr')} · it</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {langDefault === 'it' && (
                <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-1 rounded-full font-semibold">
                  {t('admin.lang_current_default')}
                </span>
              )}
              <button onClick={() => handleToggleLang('it')}
                className={cn('text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors',
                  langEnabled.it
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                )}>
                {langEnabled.it ? t('admin.lang_enabled') : t('admin.lang_disabled')}
              </button>
              {langDefault !== 'it' && langEnabled.it && (
                <button onClick={() => handleSetDefault('it')}
                  className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                  {t('admin.lang_set_default')}
                </button>
              )}
            </div>
          </div>

          {/* English */}
          <div className="flex items-center justify-between p-4 bg-surface-50 rounded-xl border border-surface-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="text-sm font-black text-green-700">EN</span>
              </div>
              <div>
                <p className="font-semibold text-surface-900">{t('admin.lang_en_name')}</p>
                <p className="text-xs text-surface-400">{t('admin.lang_ltr')} · en</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {langDefault === 'en' && (
                <span className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-2.5 py-1 rounded-full font-semibold">
                  {t('admin.lang_current_default')}
                </span>
              )}
              <button onClick={() => handleToggleLang('en')}
                className={cn('text-xs px-2.5 py-1 rounded-full font-semibold border transition-colors',
                  langEnabled.en
                    ? 'bg-green-50 text-green-700 border-green-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                    : 'bg-red-50 text-red-700 border-red-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                )}>
                {langEnabled.en ? t('admin.lang_enabled') : t('admin.lang_disabled')}
              </button>
              {langDefault !== 'en' && langEnabled.en && (
                <button onClick={() => handleSetDefault('en')}
                  className="text-xs bg-primary-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-primary-600 transition-colors">
                  {t('admin.lang_set_default')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center gap-3">
        <Icon name="language" size={20} className="text-primary-500" filled />
        <div>
          <p className="text-sm font-semibold text-primary-800">{t('admin.lang_active_users')}</p>
          <p className="text-xs text-primary-600">
            {uiLang === 'ar' ? t('admin.lang_ar_name') : uiLang === 'en' ? t('admin.lang_en_name') : t('admin.lang_it_name')} ·
            {uiLang === 'ar' ? ' RTL' : ' LTR'}
          </p>
        </div>
      </div>
    </div>
  );
});
