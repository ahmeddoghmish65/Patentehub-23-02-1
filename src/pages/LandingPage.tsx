import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/utils/cn';
import { useTranslation } from '@/i18n';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { t, dir, uiLang } = useTranslation();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeFeature, setActiveFeature] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const testimonialTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3200);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const maxIdx = testimonials.length - visibleCount;
    testimonialTimerRef.current = setInterval(() => {
      setTestimonialIndex(i => (i >= maxIdx ? 0 : i + 1));
    }, 4000);
    return () => { if (testimonialTimerRef.current) clearInterval(testimonialTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount]);

  const isVisible = (id: string) => visibleSections.has(id);

  const testimonials = [
    { name: 'أحمد محمد', text: t('landing.t1_text'), rating: 5, city: 'Milano', role: t('landing.t1_role'), initials: 'أم' },
    { name: 'فاطمة علي', text: t('landing.t2_text'), rating: 5, city: 'Roma', role: t('landing.t2_role'), initials: 'فع' },
    { name: 'يوسف حسن', text: t('landing.t3_text'), rating: 5, city: 'Torino', role: t('landing.t3_role'), initials: 'يح' },
    { name: 'سارة خالد', text: t('landing.t4_text'), rating: 5, city: 'Napoli', role: t('landing.t4_role'), initials: 'سخ' },
    { name: 'محمد رضا', text: t('landing.t5_text'), rating: 5, city: 'Bologna', role: t('landing.t5_role'), initials: 'مر' },
    { name: 'نور الهدى', text: t('landing.t6_text'), rating: 5, city: 'Firenze', role: t('landing.t6_role'), initials: 'نه' },
  ];

  const maxTestimonialIndex = Math.max(0, testimonials.length - visibleCount);
  const prevTestimonial = () => setTestimonialIndex(i => (i <= 0 ? maxTestimonialIndex : i - 1));
  const nextTestimonial = () => setTestimonialIndex(i => (i >= maxTestimonialIndex ? 0 : i + 1));

  const faqs = [
    { q: t('landing.faq1_q'), a: t('landing.faq1_a') },
    { q: t('landing.faq2_q'), a: t('landing.faq2_a') },
    { q: t('landing.faq3_q'), a: t('landing.faq3_a') },
    { q: t('landing.faq4_q'), a: t('landing.faq4_a') },
    { q: t('landing.faq5_q'), a: t('landing.faq5_a') },
    { q: t('landing.faq6_q'), a: t('landing.faq6_a') },
  ];

  const stats = [
    { value: '+5,000', label: t('landing.stat1_label'), icon: 'group', colorfrom: 'from-blue-500', colorto: 'to-blue-600', textcolor: 'text-blue-600' },
    { value: '92%', label: t('landing.stat2_label'), icon: 'verified', colorfrom: 'from-green-500', colorto: 'to-green-600', textcolor: 'text-green-600' },
    { value: '+10,000', label: t('landing.stat3_label'), icon: 'quiz', colorfrom: 'from-violet-500', colorto: 'to-violet-600', textcolor: 'text-violet-600' },
    { value: '4.9★', label: t('landing.stat4_label'), icon: 'star', colorfrom: 'from-amber-500', colorto: 'to-amber-600', textcolor: 'text-amber-600' },
  ];

  const navLinks = [
    { href: '#features', label: t('landing.nav_features') },
    { href: '#how', label: t('landing.nav_how') },
    { href: '#testimonials', label: t('landing.nav_testimonials') },
    { href: '#faq', label: t('landing.nav_faq') },
  ];

  const steps = [
    { step: '01', icon: 'person_add', title: t('landing.step1_title'), titleIt: t('landing.step1_title_it'), desc: t('landing.step1_desc'), color: 'from-blue-500 to-blue-600' },
    { step: '02', icon: 'menu_book', title: t('landing.step2_title'), titleIt: t('landing.step2_title_it'), desc: t('landing.step2_desc'), color: 'from-violet-500 to-violet-600' },
    { step: '03', icon: 'workspace_premium', title: t('landing.step3_title'), titleIt: t('landing.step3_title_it'), desc: t('landing.step3_desc'), color: 'from-green-500 to-green-600' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir={dir}>

      {/* ═══ NAVBAR ═══ */}
      <nav className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-500',
        scrolled ? 'bg-white/95 backdrop-blur-2xl shadow-lg shadow-surface-900/5 border-b border-surface-100' : 'bg-white/80 backdrop-blur-md border-b border-surface-100/60'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <Icon name="directions_car" size={20} className="text-white" filled />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <span className="text-lg font-black tracking-tight">
                <span className="text-surface-900">Patente </span>
                <span className="text-primary-500">Hub</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map(l => (
                <a key={l.href} href={l.href}
                  className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    'text-surface-600 hover:text-primary-600 hover:bg-primary-50')}>
                  {l.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
              <button onClick={() => onNavigate('login')}
                className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  'text-surface-600 hover:bg-surface-100')}>
                {t('landing.login')}
              </button>
              <Button size="sm" onClick={() => onNavigate('register')} icon={<Icon name="rocket_launch" size={15} />}>
                {t('landing.register_free')}
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <LanguageSwitcher />
              <button onClick={() => onNavigate('login')}
                className="text-sm font-semibold text-primary-700 border border-primary-200 px-3 py-1.5 rounded-xl hover:bg-primary-50 transition-colors bg-white/80">
                {t('landing.login_short')}
              </button>
              <button className={cn('p-2 rounded-xl transition-colors hover:bg-surface-100')}
                onClick={() => setMobileMenu(!mobileMenu)}>
                <Icon name={mobileMenu ? 'close' : 'menu'} size={22} className="text-surface-800" />
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-surface-100 shadow-xl">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-surface-700 font-medium hover:bg-surface-50 transition-colors">
                  {l.label}
                </a>
              ))}
              <div className="pt-3 space-y-2 border-t border-surface-100">
                <Button fullWidth variant="outline" onClick={() => onNavigate('login')}>{t('landing.login')}</Button>
                <Button fullWidth onClick={() => onNavigate('register')}>{t('landing.register_free')}</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/70 to-blue-50/80" />
        <div className="absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(ellipse 80% 55% at 60% 0%, rgba(59,130,246,0.12), transparent)' }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.6) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-2/3 left-1/2 w-56 h-56 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Content */}
            <div className={cn('text-center order-2 lg:order-1', dir === 'rtl' ? 'lg:text-right' : 'lg:text-left')}>
              <div className="inline-flex items-center gap-2.5 bg-primary-50 border border-primary-200/70 text-primary-700 px-5 py-2.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up shadow-sm">
                <Icon name="auto_awesome" size={18} filled className="text-primary-500" />
                <span>{t('landing.hero_badge')}</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-surface-900 leading-[1.05] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                {t('landing.hero_title_1')}<br />
                <span className="bg-gradient-to-l from-primary-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  {t('landing.hero_title_2')}
                </span><br />
                <span className="text-surface-500">{t('landing.hero_title_3')}</span>
              </h1>

              <p className="text-lg text-surface-500 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                {t('landing.hero_desc')}
              </p>

              <div className={cn('flex flex-col sm:flex-row items-center gap-4 animate-fade-in-up', dir === 'rtl' ? 'justify-center lg:justify-start' : 'justify-center lg:justify-start')} style={{ animationDelay: '0.3s' }}>
                <button onClick={() => onNavigate('register')}
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-l from-primary-600 to-primary-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-l from-primary-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon name="rocket_launch" size={20} className="relative shrink-0" />
                  <span className="relative">{t('landing.cta_start')}</span>
                </button>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 border-2 border-primary-200 text-primary-700 font-semibold text-base rounded-2xl hover:bg-primary-50 hover:border-primary-300 transition-all duration-300">
                  <Icon name="play_circle" size={20} />
                  {t('landing.cta_discover')}
                </button>
              </div>

              {/* Mini badges */}
              <div className={cn('flex flex-wrap items-center gap-3 mt-10 animate-fade-in-up', dir === 'rtl' ? 'justify-center lg:justify-start' : 'justify-center lg:justify-start')} style={{ animationDelay: '0.4s' }}>
                {[t('landing.badge_free'), ...(uiLang !== 'it' ? [t('landing.badge_arabic')] : []), t('landing.badge_updated'), t('landing.badge_success')].map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-white border border-surface-200 text-surface-600 text-xs px-3 py-1.5 rounded-full shadow-sm">
                    <Icon name="check_circle" size={12} className="text-green-500" filled />
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive feature wheel */}
            <div className="order-1 lg:order-2 hidden lg:flex items-center justify-center">
              <div className="relative w-[420px] h-[420px]">
                <div className="absolute inset-1/4 bg-primary-400/15 rounded-full blur-3xl" />
                <div className="absolute inset-8 rounded-full border border-primary-200/40" />
                <div className="absolute inset-16 rounded-full border border-primary-200/60" />
                <div className="absolute inset-[30%] bg-white backdrop-blur-2xl rounded-3xl border border-primary-100 flex flex-col items-center justify-center p-4 shadow-xl shadow-primary-500/10">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br mb-3 shadow-lg transition-all duration-500', features[activeFeature].bg)}>
                    <Icon name={features[activeFeature].icon} size={28} className="text-white" filled />
                  </div>
                  <p className="text-surface-800 font-bold text-sm text-center leading-tight">{features[activeFeature].title}</p>
                </div>
                {features.map((f, i) => {
                  const angle = (i / features.length) * 360 - 90;
                  const rad = (angle * Math.PI) / 180;
                  const rx = 46, ry = 46;
                  const x = 50 + rx * Math.cos(rad);
                  const y = 50 + ry * Math.sin(rad);
                  return (
                    <button key={i} onClick={() => setActiveFeature(i)}
                      className={cn('absolute w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-300',
                        activeFeature === i ? 'bg-primary-500 shadow-xl shadow-primary-500/30 scale-115' : 'bg-white border border-surface-200 hover:border-primary-300 hover:bg-primary-50 shadow-sm')}
                      style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%)` }}>
                      <Icon name={f.icon} size={18} className={activeFeature === i ? 'text-white' : 'text-surface-500'} filled={activeFeature === i} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 inset-x-0">
          <svg viewBox="0 0 1440 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0,70 L1440,70 L1440,35 C1200,70 960,0 720,18 C480,36 240,70 0,35 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center group">
                <div className={cn('w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110 shadow-sm', s.colorfrom, s.colorto)}>
                  <Icon name={s.icon} size={26} className="text-white" filled />
                </div>
                <p className="text-3xl font-black text-surface-900">{s.value}</p>
                <p className="text-sm text-surface-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — BENTO GRID ═══ */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-surface-50" data-animate>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className={cn('text-center mb-14 transition-all duration-700', isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-100 px-5 py-2 rounded-full text-sm font-semibold mb-5">
              <Icon name="stars" size={16} filled />
              {t('landing.features_tag')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">{t('landing.features_title')}</h2>
            <p className="text-surface-500 mt-4 max-w-2xl mx-auto text-lg">{t('landing.features_desc')}</p>
          </div>

          {/*
            Bento Grid — 4-col desktop / 2-col mobile.
            DOM order: F1 F2 F3 F4 F5 F6 F8 F7
            Desktop:  [F1:2×2][F2][F3] / [F1][F4][F5] / [F6][F7:wide][F8]
            Mobile:   F1 full / F2+F3 / F4+F5 / F6+F8 / F7 full
          */}
          <div className={cn(
            'grid grid-cols-2 lg:grid-cols-4 lg:auto-rows-[248px] gap-4 transition-all duration-700',
            isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10',
          )}>

            {/* ── F1: Bilingual — large (2 col × 2 row) ────────────────── */}
            <div className="col-span-2 lg:row-span-2 rounded-3xl bg-gradient-to-br from-blue-50 via-primary-50/60 to-indigo-50 border border-blue-100 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:shadow-blue-100/60 transition-all duration-500"
              style={{ transitionDelay: '0ms' }}>
              <div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-4">
                  <Icon name="translate" size={26} className="text-white" filled />
                </div>
                <h3 className="text-xl font-black text-surface-900 mb-1.5">{t('landing.f1_title')}</h3>
                <p className="text-surface-500 text-sm leading-relaxed max-w-xs">{t('landing.f1_desc')}</p>
              </div>
              {/* Language toggle visual */}
              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 bg-white rounded-2xl p-3.5 border border-blue-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">العربية</span>
                    <div className="w-7 h-7 bg-blue-500 rounded-xl flex items-center justify-center">
                      <span className="text-white font-black text-xs">ع</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-blue-100 rounded-full w-full" />
                    <div className="h-1.5 bg-blue-100 rounded-full w-4/5" />
                    <div className="h-1.5 bg-blue-100 rounded-full w-3/5" />
                  </div>
                </div>
                <div className="w-8 h-8 bg-white border border-surface-200 rounded-full flex items-center justify-center shadow-sm shrink-0">
                  <Icon name="swap_horiz" size={15} className="text-surface-400" />
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3.5 border border-blue-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-surface-400 uppercase tracking-wider">Italiano</span>
                    <div className="w-7 h-7 bg-surface-100 rounded-xl flex items-center justify-center">
                      <span className="text-surface-600 font-black text-xs">IT</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-1.5 bg-surface-100 rounded-full w-full" />
                    <div className="h-1.5 bg-surface-100 rounded-full w-3/4" />
                    <div className="h-1.5 bg-surface-100 rounded-full w-1/2" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── F2: Quiz ──────────────────────────────────────────────── */}
            <div className="col-span-1 rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-violet-100/60 transition-all duration-500"
              style={{ transitionDelay: '60ms' }}>
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 mb-4 shrink-0">
                <Icon name="quiz" size={20} className="text-white" filled />
              </div>
              <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f2_title')}</h3>
              <p className="text-[11px] text-surface-400 leading-snug">{t('landing.f2_desc')}</p>
              <div className="mt-auto flex gap-2 pt-4">
                <div className="flex-1 bg-white rounded-2xl p-3 border border-violet-100 shadow-sm text-center">
                  <p className="text-xl font-black text-violet-600">92%</p>
                  <p className="text-[10px] text-surface-400 leading-tight mt-0.5">{t('landing.stat2_label')}</p>
                </div>
                <div className="flex-1 bg-white rounded-2xl p-3 border border-violet-100 shadow-sm text-center">
                  <p className="text-xl font-black text-surface-800">+10K</p>
                  <p className="text-[10px] text-surface-400 leading-tight mt-0.5">{t('landing.stat3_label')}</p>
                </div>
              </div>
            </div>

            {/* ── F3: Lessons ───────────────────────────────────────────── */}
            <div className="col-span-1 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/70 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500"
              style={{ transitionDelay: '120ms' }}>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-400/20 mb-4 shrink-0">
                <Icon name="school" size={20} className="text-white" filled />
              </div>
              <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f3_title')}</h3>
              <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f3_desc')}</p>
              <div className="mt-auto space-y-2">
                {([
                  { lbl: 'Segnali', pct: 85 },
                  { lbl: 'Precedenza', pct: 62 },
                  { lbl: 'Velocità', pct: 48 },
                ] as const).map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[10px] text-surface-500" dir="ltr">{item.lbl}</span>
                      <span className="text-[10px] font-bold text-teal-600">{item.pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden border border-emerald-100">
                      <div className="h-full bg-gradient-to-r from-emerald-300 to-teal-400 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── F4: Traffic Signs ─────────────────────────────────────── */}
            <div className="col-span-1 rounded-3xl bg-gradient-to-br from-red-50 to-rose-50 border border-red-100/60 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-red-100/40 transition-all duration-500"
              style={{ transitionDelay: '180ms' }}>
              <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-400/20 mb-4 shrink-0">
                <Icon name="traffic" size={20} className="text-white" filled />
              </div>
              <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f4_title')}</h3>
              <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f4_desc')}</p>
              <div className="mt-auto grid grid-cols-3 gap-2">
                {([
                  { icon: 'warning', color: '#b45309', bg: '#fefce8' },
                  { icon: 'block', color: '#dc2626', bg: '#fff1f2' },
                  { icon: 'speed', color: '#6d28d9', bg: '#f5f3ff' },
                  { icon: 'directions', color: '#1d4ed8', bg: '#eff6ff' },
                  { icon: 'stop_circle', color: '#be123c', bg: '#fff1f2' },
                  { icon: 'turn_right', color: '#065f46', bg: '#f0fdf4' },
                ] as const).map((s, i) => (
                  <div key={i} className="aspect-square rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                    <Icon name={s.icon} size={15} style={{ color: s.color }} filled />
                  </div>
                ))}
              </div>
            </div>

            {/* ── F5: Dictionary ────────────────────────────────────────── */}
            <div className="col-span-1 rounded-3xl bg-gradient-to-br from-yellow-50 to-amber-50/80 border border-yellow-100/70 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-yellow-100/50 transition-all duration-500"
              style={{ transitionDelay: '240ms' }}>
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/20 mb-4 shrink-0">
                <Icon name="menu_book" size={20} className="text-white" filled />
              </div>
              <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f5_title')}</h3>
              <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f5_desc')}</p>
              <div className="mt-auto space-y-2">
                <div className="bg-white rounded-2xl p-3 border border-yellow-100/80 shadow-sm">
                  <p className="text-xs font-black text-surface-800" dir="ltr">Precedenza</p>
                  <p className="text-xs text-surface-500 mt-0.5">الأولوية في المرور</p>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-yellow-100/80 shadow-sm opacity-55">
                  <p className="text-xs font-black text-surface-800" dir="ltr">Segnaletica</p>
                  <p className="text-xs text-surface-500 mt-0.5">إشارات الطريق</p>
                </div>
              </div>
            </div>

            {/* ── F6: Community ─────────────────────────────────────────── */}
            {/* Note: F6 & F8 appear before F7 in the DOM so they pair on mobile */}
            <div className="col-span-1 lg:row-start-3 rounded-3xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-cyan-100/60 transition-all duration-500"
              style={{ transitionDelay: '300ms' }}>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4 shrink-0">
                <Icon name="forum" size={20} className="text-white" filled />
              </div>
              <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f6_title')}</h3>
              <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f6_desc')}</p>
              <div className="mt-auto">
                <div className="flex items-center mb-3">
                  {(['bg-blue-400', 'bg-violet-400', 'bg-green-400', 'bg-pink-400', 'bg-amber-400'] as const).map((bg, i) => (
                    <div key={i} className={cn('w-7 h-7 rounded-full border-2 border-white shrink-0', bg, i > 0 ? '-ml-1.5' : '')} />
                  ))}
                  <span className="text-xs text-surface-500 ms-2 font-semibold">+5K</span>
                </div>
                <div className="bg-white rounded-xl p-2.5 border border-cyan-100 shadow-sm">
                  <div className="flex justify-between text-[10px] text-surface-400 mb-1.5">
                    <span>{uiLang === 'ar' ? 'نسبة النشاط' : 'Attività'}</span>
                    <span>80%</span>
                  </div>
                  <div className="h-1.5 bg-cyan-50 rounded-full overflow-hidden">
                    <div className="h-full w-4/5 bg-gradient-to-r from-cyan-400 to-sky-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── F8: Practice Mode ─────────────────────────────────────── */}
            {/* Placed before F7 in DOM to pair with F6 on mobile (2-col grid) */}
            <div className="col-span-1 lg:col-start-4 lg:row-start-3 rounded-3xl bg-gradient-to-br from-orange-50 to-rose-50/60 border border-orange-100/60 p-5 flex flex-col shadow-sm hover:shadow-2xl hover:shadow-orange-100/40 transition-all duration-500"
              style={{ transitionDelay: '420ms' }}>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-400/20 mb-4 shrink-0">
                <Icon name="fitness_center" size={20} className="text-white" filled />
              </div>
              <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f8_title')}</h3>
              <p className="text-[11px] text-surface-400 leading-snug mb-3">{t('landing.f8_desc')}</p>
              <div className="mt-auto space-y-2">
                <div className="bg-white rounded-2xl p-3 border border-orange-100/60 shadow-sm text-center">
                  <p className="text-2xl font-black text-orange-400">7 🔥</p>
                  <p className="text-[10px] text-surface-400 mt-0.5">{uiLang === 'ar' ? 'يوم متتالي' : 'giorni di fila'}</p>
                </div>
                <div className="flex gap-1 justify-center">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <div key={d} className="w-5 h-5 rounded-md bg-amber-400" style={{ opacity: d <= 7 ? 0.25 + d * 0.11 : 0.25 }} />
                  ))}
                </div>
              </div>
            </div>

            {/* ── F7: Progress Tracking — wide (2 col × 1 row) ─────────── */}
            {/* Placed last in DOM, explicitly positioned on desktop */}
            <div className="col-span-2 lg:col-start-2 lg:row-start-3 rounded-3xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100/70 p-6 flex items-center gap-5 shadow-sm hover:shadow-2xl hover:shadow-violet-100/50 transition-all duration-500"
              style={{ transitionDelay: '360ms' }}>
              <div className="shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-400/20 mb-3">
                  <Icon name="trending_up" size={20} className="text-white" filled />
                </div>
                <h3 className="text-sm font-bold text-surface-900 mb-1">{t('landing.f7_title')}</h3>
                <p className="text-[11px] text-surface-400 max-w-[108px] leading-snug">{t('landing.f7_desc')}</p>
              </div>
              {/* Weekly bar chart */}
              <div className="flex-1 min-w-0">
                <div className="flex items-end gap-1.5 h-[72px] mb-1.5">
                  {[35, 52, 44, 68, 58, 78, 72].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-lg bg-gradient-to-t from-violet-400 to-indigo-300"
                      style={{ height: `${h}%`, opacity: 0.75 + i * 0.04 }}
                    />
                  ))}
                </div>
                <div className="flex">
                  {(dir === 'rtl'
                    ? ['ج', 'خ', 'ع', 'ث', 'ث', 'إ', 'أ']
                    : ['L', 'M', 'M', 'G', 'V', 'S', 'D']
                  ).map((d, i) => (
                    <span key={i} className="flex-1 text-center text-[9px] text-surface-400">{d}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-surface-400">{uiLang === 'ar' ? 'هذا الأسبوع' : 'Questa settimana'}</span>
                  <span className="text-[10px] font-bold text-violet-600">↑ 28%</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="py-24 bg-surface-50" data-animate>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('how') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-100 px-5 py-2 rounded-full text-sm font-semibold mb-5">
              <Icon name="route" size={16} filled />
              {t('landing.how_tag')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">{t('landing.how_title')}</h2>
            <p className="text-surface-500 mt-4 max-w-xl mx-auto text-lg">{t('landing.how_desc')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((s, i) => (
              <div key={i}
                className={cn('flex flex-col items-center text-center transition-all duration-700', isVisible('how') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}
                style={{ transitionDelay: `${i * 180}ms` }}>
                <div className="relative mb-7">
                  <div className={cn('w-24 h-24 mx-auto bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-2xl hover:scale-105 transition-transform cursor-default', s.color)}>
                    <Icon name={s.icon} size={44} className="text-white" filled />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border border-surface-100">
                    <span className="text-sm font-black text-surface-400">{s.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-1">{s.title}</h3>
                {dir === 'rtl' && <p className="text-xs text-primary-500 font-medium mb-3">{s.titleIt}</p>}
                <p className="text-surface-500 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ APP PREVIEW ═══ */}
      <section className="py-24 bg-white overflow-hidden" data-animate id="preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('preview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <span className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 border border-violet-100 px-5 py-2 rounded-full text-sm font-semibold mb-5">
              <Icon name="phone_iphone" size={16} filled />
              {t('landing.preview_tag')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">{t('landing.preview_title')}</h2>
            <p className="text-surface-500 mt-4 max-w-xl mx-auto">{t('landing.preview_desc')}</p>
          </div>

          <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000', isVisible('preview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12')}>
            {/* Quiz Card */}
            <div className="rounded-3xl p-[2px] bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 shadow-2xl group hover:-translate-y-2 transition-all duration-500">
              <div className="bg-white rounded-[22px] p-6 h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                    <Icon name="quiz" className="text-red-500" size={22} filled />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 text-sm">{t('landing.preview_quiz_title')}</h3>
                    <p className="text-xs text-surface-400">{t('landing.preview_quiz_q')}</p>
                  </div>
                  <span className="ms-auto bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-lg">85%</span>
                </div>
                <div className="bg-surface-50 rounded-2xl p-4 mb-4 border border-surface-100">
                  <p className="text-sm font-semibold text-surface-800 leading-relaxed">{t('landing.preview_quiz_question')}</p>
                  <p className="text-xs text-surface-400 mt-1.5" dir="ltr">I segnali di pericolo sono triangolari</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="py-3.5 px-3 rounded-2xl border-2 border-surface-900 bg-teal-50 text-center font-bold text-sm text-surface-900">
                    ✓ {t('landing.preview_quiz_correct')}
                  </div>
                  <div className="py-3.5 px-3 rounded-2xl border-2 border-surface-900 bg-rose-50 text-center font-bold text-sm text-surface-900 opacity-45">
                    ✗ {t('landing.preview_quiz_wrong')}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="rounded-3xl p-[2px] bg-gradient-to-br from-green-400 to-primary-600 shadow-2xl group hover:-translate-y-2 transition-all duration-500">
              <div className="bg-white rounded-[22px] p-6 h-full">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-surface-900">{t('landing.preview_progress_title')}</h3>
                  <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-lg font-semibold">{t('landing.preview_progress_ready')}</span>
                </div>
                <div className="flex items-center justify-center mb-5">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                      <circle cx="60" cy="60" r="50" fill="none" strokeWidth="10" strokeLinecap="round"
                        stroke="url(#pgrad)"
                        strokeDasharray={`${2 * Math.PI * 50 * 0.78} ${2 * Math.PI * 50}`} />
                      <defs>
                        <linearGradient id="pgrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-surface-900">78%</span>
                      <span className="text-[10px] text-surface-400">{t('landing.preview_progress_readiness')}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: '12', lbl: t('landing.preview_progress_quizzes'), bg: 'bg-blue-50', tc: 'text-blue-600' },
                    { val: '7', lbl: t('landing.preview_progress_days'), bg: 'bg-orange-50', tc: 'text-orange-600' },
                    { val: '94%', lbl: t('landing.preview_progress_accuracy'), bg: 'bg-green-50', tc: 'text-green-600' },
                  ].map((x, j) => (
                    <div key={j} className={cn('rounded-xl p-2.5 text-center', x.bg)}>
                      <p className={cn('text-lg font-bold', x.tc)}>{x.val}</p>
                      <p className="text-[10px] text-surface-500">{x.lbl}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sections Card */}
            <div className="rounded-3xl p-[2px] bg-gradient-to-br from-amber-400 to-orange-500 shadow-2xl group hover:-translate-y-2 transition-all duration-500">
              <div className="bg-white rounded-[22px] p-6 h-full">
                <h3 className="font-bold text-surface-900 mb-5">{t('landing.preview_sections_title')}</h3>
                <div className="space-y-3">
                  {[
                    { icon: 'warning', name: t('landing.preview_s1'), pct: 85, color: '#ef4444' },
                    { icon: 'block', name: t('landing.preview_s2'), pct: 62, color: '#dc2626' },
                    { icon: 'speed', name: t('landing.preview_s3'), pct: 48, color: '#8b5cf6' },
                    { icon: 'directions', name: t('landing.preview_s4'), pct: 31, color: '#3b82f6' },
                  ].map((s, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + '18' }}>
                        <Icon name={s.icon} size={17} style={{ color: s.color }} filled />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-semibold text-surface-700">{s.name}</span>
                          <span className="text-xs text-surface-400">{s.pct}%</span>
                        </div>
                        <div className="w-full bg-surface-100 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimonials" className="py-24 relative overflow-hidden" data-animate>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900" />
        <div className="absolute inset-0 opacity-15"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 80%, #8b5cf6 0%, transparent 50%)' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white border border-white/20 px-5 py-2 rounded-full text-sm font-semibold mb-5">
              <Icon name="favorite" size={16} filled className="text-red-400" />
              {t('landing.testimonials_tag')}
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">{t('landing.testimonials_title')}</h2>
            <p className="text-white/45 mt-4 max-w-xl mx-auto text-lg">{t('landing.testimonials_desc')}</p>
          </div>

          {/* Carousel track */}
          <div className="relative">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  width: `${(testimonials.length / visibleCount) * 100}%`,
                  transform: `translateX(calc(-${testimonialIndex} / ${testimonials.length} * 100%))`,
                }}
              >
                {testimonials.map((item, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 px-2.5"
                    style={{ width: `${100 / testimonials.length}%` }}
                  >
                    <div className={cn(
                      'relative bg-white/6 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-1 h-full flex flex-col',
                      isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    )}>
                      <div className="text-6xl text-white/8 font-black leading-none mb-2 select-none">"</div>
                      <div className="flex gap-1 mb-3">
                        {Array.from({ length: item.rating }).map((_, j) => (
                          <Icon key={j} name="star" size={14} className="text-amber-400" filled />
                        ))}
                      </div>
                      <p className="text-white/75 text-sm leading-relaxed mb-5 flex-1">{item.text}</p>
                      <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-500 rounded-full flex items-center justify-center shrink-0">
                          <span className="font-bold text-white text-sm">{item.initials}</span>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{item.name}</p>
                          <p className="text-white/35 text-xs">{item.role} — {item.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prev button */}
            <button
              onClick={prevTestimonial}
              className="absolute top-1/2 -translate-y-1/2 -left-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-all duration-200 text-white hover:scale-110 focus:outline-none"
              aria-label="Previous"
            >
              <Icon name={dir === 'rtl' ? 'chevron_right' : 'chevron_left'} size={20} />
            </button>

            {/* Next button */}
            <button
              onClick={nextTestimonial}
              className="absolute top-1/2 -translate-y-1/2 -right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-all duration-200 text-white hover:scale-110 focus:outline-none"
              aria-label="Next"
            >
              <Icon name={dir === 'rtl' ? 'chevron_left' : 'chevron_right'} size={20} />
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxTestimonialIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setTestimonialIndex(i)}
                className={cn(
                  'h-2 rounded-full transition-all duration-300 focus:outline-none',
                  testimonialIndex === i ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/55'
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══ */}
      <section id="faq" className="py-24 bg-white" data-animate>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <span className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-100 px-5 py-2 rounded-full text-sm font-semibold mb-5">
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
                  faqOpen === i ? 'border-primary-200 shadow-lg shadow-primary-50/50 bg-primary-50/20' : 'border-surface-100 bg-white hover:border-surface-200',
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

      {/* ═══ CTA ═══ */}
      <section className="py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700" />
        <div className="absolute inset-0 opacity-25"
          style={{ backgroundImage: 'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(255,255,255,0.25) 0%, transparent 55%)' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)', backgroundSize: '44px 44px' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 backdrop-blur-sm rounded-3xl mb-8 shadow-2xl border border-white/20">
            <Icon name="directions_car" size={40} className="text-white" filled />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-tight">
            {t('landing.cta_title')}
          </h2>
          <p className="text-white/65 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            {t('landing.cta_desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onNavigate('register')}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-white text-primary-700 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1">
              <Icon name="rocket_launch" size={22} />
              {t('landing.cta_register')}
            </button>
            <button onClick={() => onNavigate('login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300">
              {t('landing.cta_login')}
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            {[t('landing.cta_badge1'), t('landing.cta_badge2'), t('landing.cta_badge3'), t('landing.cta_badge4')].map((b, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 bg-white/10 border border-white/15 text-white/70 text-sm px-4 py-2 rounded-full">
                <Icon name="check_circle" size={14} className="text-green-400" filled />
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-white/5" style={{ backgroundColor: '#06101e' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-10 mb-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <Icon name="directions_car" size={20} className="text-white" filled />
                </div>
                <span className="text-white font-black text-xl">Patente Hub</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                {t('landing.footer_tagline')}
              </p>
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
                  <button onClick={() => onNavigate('register')} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_register')}</button>
                  <button onClick={() => onNavigate('login')} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_login')}</button>
                </div>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-widest">{t('landing.footer_legal')}</p>
                <div className="space-y-3">
                  <button onClick={() => onNavigate('privacy-policy')} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_privacy')}</button>
                  <button onClick={() => onNavigate('terms-of-service')} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_terms')}</button>
                  <button onClick={() => onNavigate('contact')} className={cn('block text-slate-500 hover:text-white transition-colors w-full', dir === 'rtl' ? 'text-right' : 'text-left')}>{t('landing.footer_contact')}</button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Patente Hub. {t('landing.footer_rights')}</p>
            <div className="flex items-center gap-5 text-xs text-slate-600">
              <button onClick={() => onNavigate('privacy-policy')} className="hover:text-slate-400 transition-colors">{t('landing.footer_privacy_short')}</button>
              <span className="text-slate-800">·</span>
              <button onClick={() => onNavigate('terms-of-service')} className="hover:text-slate-400 transition-colors">{t('landing.footer_terms_short')}</button>
              <span className="text-slate-800">·</span>
              <button onClick={() => onNavigate('contact')} className="hover:text-slate-400 transition-colors">{t('landing.footer_contact_short')}</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
