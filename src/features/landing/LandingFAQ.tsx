import { useState } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';

interface LandingFAQProps {
  isVisible: (id: string) => boolean;
}

export function LandingFAQ({ isVisible }: LandingFAQProps) {
  const { t, dir } = useTranslation();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const faqs = [
    { q: t('landing.faq1_q'), a: t('landing.faq1_a') },
    { q: t('landing.faq2_q'), a: t('landing.faq2_a') },
    { q: t('landing.faq3_q'), a: t('landing.faq3_a') },
    { q: t('landing.faq4_q'), a: t('landing.faq4_a') },
    { q: t('landing.faq5_q'), a: t('landing.faq5_a') },
    { q: t('landing.faq6_q'), a: t('landing.faq6_a') },
  ];

  return (
    <section id="faq" className="py-24 bg-white dark:bg-surface-50" data-animate>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={cn('text-center mb-16 transition-all duration-700', isVisible('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
          <span className="inline-flex items-center gap-2 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800 px-5 py-2 rounded-full text-sm font-semibold mb-5">
            <Icon name="help" size={16} filled />
            {t('landing.faq_tag')}
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">{t('landing.faq_title')}</h2>
          <p className="text-surface-400 mt-3">{t('landing.faq_desc')}</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i}
              className={cn(
                'rounded-2xl border overflow-hidden transition-all duration-400',
                faqOpen === i ? 'border-primary-200 dark:border-primary-800 shadow-lg shadow-primary-50/50 bg-primary-50/20 dark:bg-primary-900/10' : 'border-surface-100 bg-white dark:bg-surface-100 hover:border-surface-200',
                isVisible('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )}
              style={{ transitionDelay: `${i * 55}ms` }}>
              <button
                className={cn('w-full flex items-center justify-between p-5 sm:p-6 gap-3', dir === 'rtl' ? 'text-right' : 'text-left')}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                <span className={cn('font-bold text-surface-800 text-sm sm:text-base flex-1', dir === 'rtl' ? 'text-right' : 'text-left')}>{faq.q}</span>
                <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                  faqOpen === i ? 'bg-primary-500 rotate-45' : 'bg-surface-100')}>
                  <Icon name="add" size={18} className={faqOpen === i ? 'text-white' : 'text-surface-400'} />
                </div>
              </button>
              <div className={cn('overflow-hidden transition-all duration-300', faqOpen === i ? 'max-h-60' : 'max-h-0')}>
                <p className={cn('px-5 sm:px-6 pb-5 sm:pb-6 text-surface-500 leading-relaxed text-sm border-t border-surface-100 pt-4', dir === 'rtl' ? 'text-right' : 'text-left')}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
