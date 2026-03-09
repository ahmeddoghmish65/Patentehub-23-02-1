import { useEffect, useState } from 'react';
import { useAuthStore, useDataStore } from '@/store';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';

export function SignsPage() {
  const { user } = useAuthStore();
  const { signs, loadSigns, signSections, loadSignSections } = useDataStore();
  const { t, uiLang, contentLang } = useTranslation();
  const lang = user?.settings.language || contentLang;
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSign, setSelectedSign] = useState<string | null>(null);

  useEffect(() => { loadSigns(); loadSignSections(); }, [loadSigns, loadSignSections]);

  // Only show active signs
  const activeSigns = signs.filter(s => !s.status || s.status === 'active');

  // Active sections that have at least one sign
  const activeSections = signSections
    .filter(sec => !sec.status || sec.status === 'active')
    .filter(sec => activeSigns.some(s => s.sectionId === sec.id))
    .sort((a, b) => a.order - b.order);

  const filtered = activeSigns.filter(s => {
    if (filter !== 'all' && s.sectionId !== filter) return false;
    if (search && !s.nameAr.includes(search) && !s.nameIt.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const catLabels: Record<string, { labelAr: string; labelIt: string; color: string; icon: string }> = {
    pericolo: { labelAr: 'إشارات الخطر', labelIt: 'Pericolo', color: '#ef4444', icon: 'warning' },
    divieto: { labelAr: 'إشارات المنع', labelIt: 'Divieto', color: '#dc2626', icon: 'block' },
    obbligo: { labelAr: 'إشارات الإلزام', labelIt: 'Obbligo', color: '#2563eb', icon: 'arrow_circle_up' },
    indicazione: { labelAr: 'إشارات الإرشاد', labelIt: 'Indicazione', color: '#16a34a', icon: 'info' },
    precedenza: { labelAr: 'أولوية المرور', labelIt: 'Precedenza', color: '#f59e0b', icon: 'swap_vert' },
  };

  const selectedSignData = activeSigns.find(s => s.id === selectedSign);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-surface-900 mb-1">{t('signs_page.title')}</h1>
        <p className="text-surface-500 text-sm">{t('signs_page.subtitle_prefix')} {activeSigns.length} {t('signs_page.signs_count_label')}</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 border border-surface-100 mb-6 space-y-3">
        <div className="relative">
          <Icon name="search" size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:border-primary-500 transition-colors"
            placeholder={t('signs_page.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            className={cn('shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all',
              filter === 'all' ? 'bg-primary-500 text-white shadow-sm' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            )}
            onClick={() => setFilter('all')}
          >
            {t('signs_page.all_filter')} ({activeSigns.length})
          </button>
          {activeSections.length > 0 ? activeSections.map(sec => {
            const count = activeSigns.filter(s => s.sectionId === sec.id).length;
            return (
              <button
                key={sec.id}
                className={cn('shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all',
                  filter === sec.id ? 'bg-primary-500 text-white shadow-sm' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                )}
                onClick={() => setFilter(sec.id)}
              >
                <Icon name={sec.icon || 'label'} size={14} />
                {(lang === 'it' || uiLang === 'it') ? sec.nameIt : sec.nameAr} ({count})
              </button>
            );
          }) : null}
        </div>
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-surface-500 mb-4">
          {filtered.length > 0 ? `${t('signs_page.found_count_prefix')} ${filtered.length} ${t('signs_page.signs_count_label')}` : t('signs_page.no_results')}
        </p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-surface-100">
          <Icon name="traffic" size={48} className="text-surface-300 mx-auto mb-4" />
          <p className="text-surface-500 mb-2">{t('signs_page.no_signs')}</p>
          <p className="text-xs text-surface-400">{t('signs_page.no_signs_desc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map(sign => {
            const catData = catLabels[sign.category];
            const catInfo = { label: catData ? (lang === 'it' ? catData.labelIt : catData.labelAr) : sign.category, color: catData?.color || '#64748b', icon: catData?.icon || 'label' };
            return (
              <button
                key={sign.id}
                className="bg-white rounded-xl border border-surface-100 hover:border-primary-200 hover:shadow-lg transition-all text-center group overflow-hidden"
                onClick={() => setSelectedSign(sign.id)}
              >
                {/* Image area */}
                <div className="w-full aspect-square relative overflow-hidden">
                  {sign.image ? (
                    <img src={sign.image} alt={sign.nameAr} className="w-full h-full object-contain" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: catInfo.color + '12' }}>
                      <Icon name="traffic" size={40} style={{ color: catInfo.color }} />
                    </div>
                  )}
                  {/* Category badge */}
                  <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: catInfo.color }}>
                    {catInfo.label}
                  </span>
                </div>

                {/* Info */}
                <div className="p-3 border-t border-surface-50">
                  {lang === 'ar' && (
                    <h3 className="font-bold text-surface-900 text-sm mb-0.5 group-hover:text-primary-600 transition-colors line-clamp-1" dir="rtl">{sign.nameAr}</h3>
                  )}
                  {lang !== 'ar' && (
                    <h3 className="font-bold text-surface-900 text-sm mb-0.5 group-hover:text-primary-600 transition-colors line-clamp-1" dir="ltr">{sign.nameIt}</h3>
                  )}
                  {lang === 'both' && (
                    <p className="text-xs text-surface-500 line-clamp-1" dir="rtl">{sign.nameAr}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Sign Detail Modal */}
      {selectedSignData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setSelectedSign(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Image */}
            <div className="w-full aspect-square relative overflow-hidden">
              {selectedSignData.image ? (
                <img src={selectedSignData.image} alt={selectedSignData.nameAr} className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: (catLabels[selectedSignData.category]?.color || '#64748b') + '12' }}>
                  <Icon name="traffic" size={80} style={{ color: catLabels[selectedSignData.category]?.color || '#64748b' }} />
                </div>
              )}
              <button className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg"
                onClick={() => setSelectedSign(null)}>
                <Icon name="close" size={22} className="text-surface-600" />
              </button>
              <span className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full text-white"
                style={{ backgroundColor: catLabels[selectedSignData.category]?.color || '#64748b' }}>
                {(() => { const c = catLabels[selectedSignData.category]; return c ? (lang === 'it' ? c.labelIt : c.labelAr) : selectedSignData.category; })()}
              </span>
            </div>

            {/* Details */}
            <div className="p-6">
              {lang === 'ar' && (
                <h2 className="text-xl font-bold text-surface-900 mb-4" dir="rtl">{selectedSignData.nameAr}</h2>
              )}
              {lang === 'it' && (
                <h2 className="text-xl font-bold text-surface-900 mb-4" dir="ltr">{selectedSignData.nameIt}</h2>
              )}
              {lang === 'both' && (
                <>
                  <h2 className="text-xl font-bold text-surface-900 mb-1" dir="ltr">{selectedSignData.nameIt}</h2>
                  <p className="text-lg text-primary-500 font-medium mb-4" dir="rtl">{selectedSignData.nameAr}</p>
                </>
              )}

              <div className="bg-surface-50 rounded-xl p-4 space-y-3">
                {(lang === 'it' || lang === 'both') && selectedSignData.descriptionIt && (
                  <div dir="ltr">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-700 text-[10px] font-extrabold leading-none mb-1">IT</span>
                    <p className="text-sm text-surface-700 leading-relaxed">{selectedSignData.descriptionIt}</p>
                  </div>
                )}
                {(lang === 'ar' || lang === 'both') && (
                  <div dir="rtl">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-orange-100 text-orange-700 text-[10px] font-extrabold leading-none mb-1">ع</span>
                    <p className="text-sm text-surface-700 leading-relaxed">{selectedSignData.descriptionAr}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
