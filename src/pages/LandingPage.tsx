import { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@/components/ui/Icon';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';
import { getConsentLevel, type ConsentLevel } from '@/utils/cookieManager';
import { PageMeta } from '@/hooks/usePageMeta';
import { initAnalytics } from '@/services/analytics';
import { LandingNavbar } from '@/features/landing/LandingNavbar';
import { LandingHero } from '@/features/landing/LandingHero';
import { LandingStats } from '@/features/landing/LandingStats';
import { LandingFeatures } from '@/features/landing/LandingFeatures';
import { LandingHowItWorks } from '@/features/landing/LandingHowItWorks';
import { LandingAppPreview } from '@/features/landing/LandingAppPreview';
import { LandingTestimonials } from '@/features/landing/LandingTestimonials';
import { LandingFAQ } from '@/features/landing/LandingFAQ';
import { LandingCTA } from '@/features/landing/LandingCTA';
import { LandingFooter } from '@/features/landing/LandingFooter';

export function LandingPage() {
  const { t, dir, uiLang } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [consentLevel, setConsentLevel] = useState<ConsentLevel | null>(() => getConsentLevel());
  const showConsentBanner = consentLevel === null;
  const handleConsent = useCallback((level: ConsentLevel) => {
    setConsentLevel(level);
    if (level === 'all') initAnalytics();
  }, []);

  const features = [
    { icon: 'translate', title: t('landing.f1_title'), desc: t('landing.f1_desc'), bg: 'from-blue-500 to-blue-600' },
    { icon: 'quiz', title: t('landing.f2_title'), desc: t('landing.f2_desc'), bg: 'from-violet-500 to-violet-600' },
    { icon: 'school', title: t('landing.f3_title'), desc: t('landing.f3_desc'), bg: 'from-green-500 to-green-600' },
    { icon: 'traffic', title: t('landing.f4_title'), desc: t('landing.f4_desc'), bg: 'from-red-500 to-red-600' },
    { icon: 'menu_book', title: t('landing.f5_title'), desc: t('landing.f5_desc'), bg: 'from-amber-500 to-amber-600' },
    { icon: 'forum', title: t('landing.f6_title'), desc: t('landing.f6_desc'), bg: 'from-cyan-500 to-cyan-600' },
    { icon: 'trending_up', title: t('landing.f7_title'), desc: t('landing.f7_desc'), bg: 'from-pink-500 to-pink-600' },
    { icon: 'fitness_center', title: t('landing.f8_title'), desc: t('landing.f8_desc'), bg: 'from-orange-500 to-orange-600' },
  ];

  const stats = [
    { value: '+5,000', label: t('landing.stat1_label'), icon: 'group', colorfrom: 'from-blue-500', colorto: 'to-blue-600' },
    { value: '92%', label: t('landing.stat2_label'), icon: 'verified', colorfrom: 'from-green-500', colorto: 'to-green-600' },
    { value: '+10,000', label: t('landing.stat3_label'), icon: 'quiz', colorfrom: 'from-violet-500', colorto: 'to-violet-600' },
    { value: '4.9★', label: t('landing.stat4_label'), icon: 'star', colorfrom: 'from-amber-500', colorto: 'to-amber-600' },
  ];

  const navLinks = [
    { id: 'features', label: t('landing.nav_features'), icon: 'auto_awesome' },
    { id: 'how', label: t('landing.nav_how'), icon: 'route' },
    { id: 'testimonials', label: t('landing.nav_testimonials'), icon: 'format_quote' },
    { id: 'faq', label: t('landing.nav_faq'), icon: 'help_outline' },
  ];

  const steps = [
    { step: '01', icon: 'person_add', title: t('landing.step1_title'), titleIt: t('landing.step1_title_it'), desc: t('landing.step1_desc'), color: 'from-blue-500 to-blue-600' },
    { step: '02', icon: 'menu_book', title: t('landing.step2_title'), titleIt: t('landing.step2_title_it'), desc: t('landing.step2_desc'), color: 'from-violet-500 to-violet-600' },
    { step: '03', icon: 'workspace_premium', title: t('landing.step3_title'), titleIt: t('landing.step3_title_it'), desc: t('landing.step3_desc'), color: 'from-green-500 to-green-600' },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('[data-animate]').forEach((el) => {
      observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <>
      <PageMeta
        title={uiLang === 'it'
          ? 'Patente Hub – Quiz Patente B Gratis | Simulatore Esame e Segnali Stradali'
          : 'Patente Hub – تطبيق تعليم رخصة القيادة الإيطالية | Quiz Patente B'}
        description={uiLang === 'it'
          ? 'Patente Hub: quiz patente B gratuiti, segnali stradali con spiegazioni, simulazioni d\'esame complete e lezioni sul codice della strada. Disponibile in italiano e arabo. Inizia gratis!'
          : 'تطبيق Patente Hub: اختبارات رخصة القيادة الإيطالية مجاناً، شرح إشارات المرور، محاكاة الاختبار ودروس قانون المرور بالعربية والإيطالية.'}
        canonical={`https://patentehub.com/${uiLang}`}
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Patente Hub',
            url: 'https://patentehub.com',
            description: 'Piattaforma gratuita per prepararsi all\'esame della patente B in Italia. Quiz, segnali stradali, simulazioni e lezioni in italiano e arabo.',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://patentehub.com/it/quiz-patente-b',
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'SiteLinksSearchBox',
            url: 'https://patentehub.com',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://patentehub.com/it/quiz-patente-b?q={search_term_string}',
              'query-input': 'required name=search_term_string',
            },
          },
        ]}
      />
      <div className="min-h-screen bg-white overflow-x-hidden" dir={dir}>
      <LandingNavbar scrolled={scrolled} navLinks={navLinks} />
      <LandingHero features={features} />
      <LandingStats stats={stats} />
      <LandingFeatures isVisible={isVisible} />
      <LandingHowItWorks isVisible={isVisible} steps={steps} />
      <LandingAppPreview isVisible={isVisible} />
      <LandingTestimonials isVisible={isVisible} />
      <LandingFAQ isVisible={isVisible} />
      <LandingCTA />
      <LandingFooter />

      {showConsentBanner && <CookieConsentBanner onConsent={handleConsent} />}

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="العودة لأعلى"
        className={cn(
          'fixed bottom-6 z-50 w-11 h-11 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-primary-700 hover:scale-110 active:scale-95',
          dir === 'rtl' ? 'left-6' : 'right-6',
          scrolled ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        <Icon name="keyboard_arrow_up" size={24} />
      </button>
    </div>
  </>
  );
}
