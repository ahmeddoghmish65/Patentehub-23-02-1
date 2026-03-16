import { useEffect, useState } from 'react';
import { useAuthStore, useDataStore } from '@/store';
import { Icon } from '@/shared/ui/Icon';
import { TTSButton } from '@/shared/ui/TTSButton';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';

export function DictionaryPage() {
  const { user } = useAuthStore();
  const { dictSections, dictEntries, loadDictSections, loadDictEntries } = useDataStore();
  const { t, uiLang, contentLang } = useTranslation();
  const lang = user?.settings.language || contentLang;
  const [activeSec, setActiveSec] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { loadDictSections(); loadDictEntries(); }, [loadDictSections, loadDictEntries]);

  useEffect(() => { if (dictSections.length > 0 && !activeSec) setActiveSec(dictSections[0].id); }, [dictSections, activeSec]);

  const entries = dictEntries.filter(e => {
    if (activeSec && e.sectionId !== activeSec) return false;
    if (search && !e.termAr.includes(search) && !e.termIt.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 mb-2">{t('dictionary_page.title')}</h1>
        <p className="text-surface-500">{t('dictionary_page.subtitle')}</p>
      </div>

      <div className="bg-white dark:bg-surface-100 rounded-xl p-4 border border-surface-100 mb-6">
        <div className="relative mb-3">
          <Icon name="search" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-200 text-sm" placeholder={t('dictionary_page.search_placeholder')} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {dictSections.map(s => (
            <button key={s.id} className={cn('shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1',
              activeSec === s.id ? 'bg-primary-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600')} onClick={() => setActiveSec(s.id)}>
              <Icon name={s.icon || 'menu_book'} size={16} />{(lang === 'it' || uiLang === 'it') ? (s.nameIt || s.nameAr) : s.nameAr}
            </button>
          ))}
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-surface-100 rounded-2xl border border-surface-100">
          <Icon name="menu_book" size={48} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500">{t('dictionary_page.no_terms')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(entry => (
            <div key={entry.id} className="bg-white dark:bg-surface-100 rounded-xl p-5 border border-surface-100 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {lang === 'ar' && (
                      <span className="text-lg font-bold text-surface-900" dir="rtl">{entry.termAr}</span>
                    )}
                    {lang === 'it' && (
                      <>
                        <span className="text-lg font-bold text-primary-600" dir="ltr">{entry.termIt}</span>
                        <TTSButton text={entry.termIt} size="sm" />
                      </>
                    )}
                    {lang === 'both' && (
                      <>
                        <span className="text-lg font-bold text-primary-600" dir="ltr">{entry.termIt}</span>
                        <TTSButton text={entry.termIt} size="sm" />
                        <span className="text-surface-300">—</span>
                        <span className="text-lg font-bold text-surface-900" dir="rtl">{entry.termAr}</span>
                      </>
                    )}
                  </div>
                  {lang === 'ar' && (
                    <p className="text-sm text-surface-500" dir="rtl">{entry.definitionAr}</p>
                  )}
                  {(lang === 'it' || lang === 'both') && entry.definitionIt && (
                    <div className="flex items-start gap-1 mb-1" dir="ltr">
                      <p className="text-sm text-surface-400 flex-1">{entry.definitionIt}</p>
                      <TTSButton text={entry.definitionIt} size="sm" />
                    </div>
                  )}
                  {lang === 'both' && (
                    <p className="text-sm text-surface-500" dir="rtl">{entry.definitionAr}</p>
                  )}
                </div>
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Icon name="translate" size={20} className="text-primary-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
