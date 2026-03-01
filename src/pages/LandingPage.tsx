import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [activeFeature, setActiveFeature] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const features = [
    { icon: 'translate', title: 'ثنائي اللغة', desc: 'كل سؤال وشرح بالعربية والإيطالية معاً', bg: 'from-blue-500 to-blue-600' },
    { icon: 'quiz', title: 'اختبارات حقيقية', desc: 'أسئلة صح/خطأ مطابقة لنمط الامتحان', bg: 'from-violet-500 to-violet-600' },
    { icon: 'school', title: 'دروس منظمة', desc: 'محتوى مقسم لأقسام ودروس مرتبة', bg: 'from-green-500 to-green-600' },
    { icon: 'traffic', title: 'إشارات مرورية', desc: 'مكتبة شاملة لجميع الإشارات مع شرح', bg: 'from-red-500 to-red-600' },
    { icon: 'menu_book', title: 'قاموس مروري', desc: 'كل مصطلح إيطالي مترجم بالعربية', bg: 'from-amber-500 to-amber-600' },
    { icon: 'forum', title: 'مجتمع تعليمي', desc: 'تواصل مع آلاف العرب في إيطاليا', bg: 'from-cyan-500 to-cyan-600' },
    { icon: 'trending_up', title: 'تتبع ذكي', desc: 'إحصائيات دقيقة لتقدمك ونسبة جاهزيتك', bg: 'from-pink-500 to-pink-600' },
    { icon: 'fitness_center', title: 'تدريب يومي', desc: 'سلسلة أيام وتحديات لتحفيزك', bg: 'from-orange-500 to-orange-600' },
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
    const t = setInterval(() => setActiveFeature(p => (p + 1) % features.length), 3200);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  const testimonials = [
    { name: 'أحمد محمد', text: 'نجحت من أول مرة! الشرح بالعربية سهّل عليّ فهم القوانين الإيطالية.', rating: 5, city: 'Milano', role: 'طالب جامعي', initials: 'أم' },
    { name: 'فاطمة علي', text: 'كنت خائفة من الامتحان، لكن أسئلة التدريب كانت مشابهة جداً للامتحان الحقيقي.', rating: 5, city: 'Roma', role: 'ربة منزل', initials: 'فع' },
    { name: 'يوسف حسن', text: 'نظام تتبع الأخطاء رائع. بعد أسبوعين من التدريب اليومي نجحت بسهولة!', rating: 5, city: 'Torino', role: 'عامل', initials: 'يح' },
    { name: 'سارة خالد', text: 'قسم الإشارات المرورية مع الصور رائع. والقاموس ساعدني أفهم المصطلحات الصعبة.', rating: 5, city: 'Napoli', role: 'موظفة', initials: 'سخ' },
    { name: 'محمد رضا', text: 'درست 3 أسابيع فقط ونجحت. شكراً Patente Hub! أفضل تطبيق للعرب.', rating: 5, city: 'Bologna', role: 'مهندس', initials: 'مر' },
    { name: 'نور الهدى', text: 'المجتمع فيه ناس مساعدة جداً. كنت أسأل وأحصل إجابة بسرعة.', rating: 5, city: 'Firenze', role: 'طالبة', initials: 'نه' },
  ];

  const faqs = [
    { q: 'هل التطبيق مجاني؟', a: 'نعم، التطبيق مجاني بالكامل. جميع الدروس والأسئلة والإشارات والقاموس متاحة بدون أي رسوم.' },
    { q: 'هل الأسئلة مشابهة للامتحان الحقيقي؟', a: 'نعم، الأسئلة بنمط صح/خطأ (Vero/Falso) وهو نفس نمط الامتحان الرسمي في إيطاليا.' },
    { q: 'ما هو نوع الرخصة المدعوم؟', a: 'التطبيق يغطي جميع مواضيع رخصة الفئة B (Patente B) وهي الأكثر شيوعاً.' },
    { q: 'هل يمكنني الدراسة بالعربية فقط؟', a: 'نعم، يمكنك الدراسة بالعربية أو الإيطالية أو كلاهما. لكننا ننصح بكلا اللغتين لأن الامتحان بالإيطالية.' },
    { q: 'كم يوماً أحتاج للاستعداد؟', a: 'معظم المستخدمين ينجحون بعد 2-4 أسابيع من الدراسة اليومية. نظام التتبع يساعدك تعرف متى تكون جاهزاً.' },
    { q: 'هل يوجد تطبيق للجوال؟', a: 'التطبيق مصمم ليعمل بشكل مثالي على متصفح الجوال. يمكنك إضافته للشاشة الرئيسية واستخدامه كتطبيق.' },
  ];

  const stats = [
    { value: '+5,000', label: 'مستخدم نشط', icon: 'group', colorfrom: 'from-blue-500', colorto: 'to-blue-600', textcolor: 'text-blue-600' },
    { value: '92%', label: 'نسبة النجاح', icon: 'verified', colorfrom: 'from-green-500', colorto: 'to-green-600', textcolor: 'text-green-600' },
    { value: '+10,000', label: 'اختبار مكتمل', icon: 'quiz', colorfrom: 'from-violet-500', colorto: 'to-violet-600', textcolor: 'text-violet-600' },
    { value: '4.9★', label: 'تقييم المستخدمين', icon: 'star', colorfrom: 'from-amber-500', colorto: 'to-amber-600', textcolor: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden" dir="rtl">

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
              {[
                { href: '#features', label: 'المميزات' },
                { href: '#how', label: 'كيف يعمل' },
                { href: '#testimonials', label: 'آراء المستخدمين' },
                { href: '#faq', label: 'الأسئلة الشائعة' },
              ].map(l => (
                <a key={l.href} href={l.href}
                  className={cn('px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    'text-surface-600 hover:text-primary-600 hover:bg-primary-50')}>
                  {l.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => onNavigate('login')}
                className={cn('px-4 py-2 rounded-xl text-sm font-semibold transition-all',
                  'text-surface-600 hover:bg-surface-100')}>
                تسجيل الدخول
              </button>
              <Button size="sm" onClick={() => onNavigate('register')} icon={<Icon name="rocket_launch" size={15} />}>
                ابدأ مجاناً
              </Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => onNavigate('login')}
                className="text-sm font-semibold text-primary-700 border border-primary-200 px-3 py-1.5 rounded-xl hover:bg-primary-50 transition-colors bg-white/80">
                دخول
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
              {[
                { href: '#features', label: 'المميزات' },
                { href: '#how', label: 'كيف يعمل' },
                { href: '#testimonials', label: 'آراء المستخدمين' },
                { href: '#faq', label: 'الأسئلة الشائعة' },
              ].map(l => (
                <a key={l.href} href={l.href} onClick={() => setMobileMenu(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-surface-700 font-medium hover:bg-surface-50 transition-colors">
                  {l.label}
                </a>
              ))}
              <div className="pt-3 space-y-2 border-t border-surface-100">
                <Button fullWidth variant="outline" onClick={() => onNavigate('login')}>تسجيل الدخول</Button>
                <Button fullWidth onClick={() => onNavigate('register')}>ابدأ مجاناً</Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Light background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-primary-50/70 to-blue-50/80" />
        <div className="absolute inset-0 opacity-60"
          style={{ backgroundImage: 'radial-gradient(ellipse 80% 55% at 60% 0%, rgba(59,130,246,0.12), transparent)' }} />
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.6) 1px,transparent 1px)', backgroundSize: '64px 64px' }} />

        {/* Light blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-2/3 left-1/2 w-56 h-56 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Content */}
            <div className="text-center lg:text-right order-2 lg:order-1">
              <div className="inline-flex items-center gap-2.5 bg-primary-50 border border-primary-200/70 text-primary-700 px-5 py-2.5 rounded-full text-sm font-medium mb-8 animate-fade-in-up shadow-sm">
              <Icon name="auto_awesome" size={18} filled className="text-primary-500" />
              <span>قريبًا سيكون التطبيق مدعومًا بالذكاء الاصطناعي </span>
            </div>



              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-surface-900 leading-[1.05] mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                احصل على<br />
                <span className="bg-gradient-to-l from-primary-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  رخصة القيادة
                </span><br />
                <span className="text-surface-500">الإيطالية</span>
              </h1>

              <p className="text-lg text-surface-500 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                تعلّم بالعربية والإيطالية معاً. دروس شاملة، أسئلة حقيقية، إشارات مرورية، وتتبع ذكي لتقدمك.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <button onClick={() => onNavigate('register')}
                  className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 bg-gradient-to-l from-primary-600 to-primary-500 text-white font-bold text-base rounded-2xl shadow-xl shadow-primary-500/30 hover:shadow-primary-500/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-l from-primary-500 to-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon name="rocket_launch" size={20} className="relative shrink-0" />
                  <span className="relative">ابدأ التعلم مجاناً</span>
                </button>
                <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 border-2 border-primary-200 text-primary-700 font-semibold text-base rounded-2xl hover:bg-primary-50 hover:border-primary-300 transition-all duration-300">
                  <Icon name="play_circle" size={20} />
                  اكتشف المزيد
                </button>
              </div>

              {/* Mini badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mt-10 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                {['مجاني 100%', 'بالعربية', '+5000 مستخدم', '92% نجاح'].map((b, i) => (
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
                {/* Glow */}
                <div className="absolute inset-1/4 bg-primary-400/15 rounded-full blur-3xl" />
                {/* Ring */}
                <div className="absolute inset-8 rounded-full border border-primary-200/40" />
                <div className="absolute inset-16 rounded-full border border-primary-200/60" />
                {/* Center */}
                <div className="absolute inset-[30%] bg-white backdrop-blur-2xl rounded-3xl border border-primary-100 flex flex-col items-center justify-center p-4 shadow-xl shadow-primary-500/10">
                  <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br mb-3 shadow-lg transition-all duration-500', features[activeFeature].bg)}>
                    <Icon name={features[activeFeature].icon} size={28} className="text-white" filled />
                  </div>
                  <p className="text-surface-800 font-bold text-sm text-center leading-tight">{features[activeFeature].title}</p>
                </div>
                {/* Orbit buttons */}
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

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="py-24 bg-gradient-to-b from-white to-surface-50" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <span className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 border border-primary-100 px-5 py-2 rounded-full text-sm font-semibold mb-5">
              <Icon name="stars" size={16} filled />
              لماذا Patente Hub؟
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">كل ما تحتاجه في مكان واحد</h2>
            <p className="text-surface-500 mt-4 max-w-2xl mx-auto text-lg">أدوات متكاملة صُممت خصيصاً للعرب في إيطاليا</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i}
                className={cn(
                  'group relative bg-white rounded-2xl p-6 border border-surface-100 cursor-default transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-surface-900/8 overflow-hidden',
                  isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                )}
                style={{ transitionDelay: `${i * 55}ms` }}>
                <div className={cn('absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity bg-gradient-to-br', f.bg)} />
                <div className={cn('w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br shadow-md transition-transform group-hover:scale-110 duration-300', f.bg)}>
                  <Icon name={f.icon} size={24} className="text-white" filled />
                </div>
                <h3 className="text-base font-bold text-surface-900 mb-2 group-hover:text-primary-600 transition-colors">{f.title}</h3>
                <p className="text-surface-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how" className="py-24 bg-surface-50" data-animate>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('how') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <span className="inline-flex items-center gap-2 bg-green-50 text-green-700 border border-green-100 px-5 py-2 rounded-full text-sm font-semibold mb-5">
              <Icon name="route" size={16} filled />
              كيف تبدأ؟
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">ثلاث خطوات فقط</h2>
            <p className="text-surface-500 mt-4 max-w-xl mx-auto text-lg">ابدأ رحلتك نحو رخصة القيادة الإيطالية اليوم</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '01', icon: 'person_add', title: 'سجّل مجاناً', titleIt: 'Registrati gratis', desc: 'أنشئ حساباً في ثوانٍ — بريد إلكتروني وكلمة مرور فقط', color: 'from-blue-500 to-blue-600' },
              { step: '02', icon: 'menu_book', title: 'ادرس الدروس', titleIt: 'Studia le lezioni', desc: 'اختر القسم وابدأ بالدروس ثم حل أسئلة صح/خطأ مع الشرح', color: 'from-violet-500 to-violet-600' },
              { step: '03', icon: 'workspace_premium', title: 'انجح في الامتحان!', titleIt: 'Supera l\'esame!', desc: 'تدرّب يومياً وتابع جاهزيتك حتى تصل 100%', color: 'from-green-500 to-green-600' },
            ].map((s, i) => (
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
                <p className="text-xs text-primary-500 font-medium mb-3">{s.titleIt}</p>
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
              داخل التطبيق
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">تصميم حديث وسهل الاستخدام</h2>
            <p className="text-surface-500 mt-4 max-w-xl mx-auto">واجهة عربية مريحة مع دعم كامل للإيطالية</p>
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
                    <h3 className="font-bold text-surface-900 text-sm">اختبار يومي</h3>
                    <p className="text-xs text-surface-400">سؤال ١ من ٤٠</p>
                  </div>
                  <span className="mr-auto bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-lg">85%</span>
                </div>
                <div className="bg-surface-50 rounded-2xl p-4 mb-4 border border-surface-100">
                  <p className="text-sm font-semibold text-surface-800 leading-relaxed">إشارات الخطر لها شكل مثلث بحافة حمراء</p>
                  <p className="text-xs text-surface-400 mt-1.5" dir="ltr">I segnali di pericolo sono triangolari</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border-2 border-green-400 bg-green-50 text-center">
                    <Icon name="check_circle" size={24} className="text-green-500 mx-auto mb-1" filled />
                    <span className="text-xs font-bold text-green-600">صحيح ✓</span>
                  </div>
                  <div className="p-3.5 rounded-xl border-2 border-surface-200 text-center opacity-50">
                    <Icon name="cancel" size={24} className="text-surface-300 mx-auto mb-1" />
                    <span className="text-xs font-bold text-surface-400">خطأ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Card */}
            <div className="rounded-3xl p-[2px] bg-gradient-to-br from-green-400 to-primary-600 shadow-2xl group hover:-translate-y-2 transition-all duration-500">
              <div className="bg-white rounded-[22px] p-6 h-full">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-bold text-surface-900">تقدمك</h3>
                  <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2.5 py-1 rounded-lg font-semibold">جاهز ✓</span>
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
                      <span className="text-[10px] text-surface-400">جاهزية</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: '12', lbl: 'اختبار', bg: 'bg-blue-50', tc: 'text-blue-600' },
                    { val: '7', lbl: 'أيام', bg: 'bg-orange-50', tc: 'text-orange-600' },
                    { val: '94%', lbl: 'دقة', bg: 'bg-green-50', tc: 'text-green-600' },
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
                <h3 className="font-bold text-surface-900 mb-5">الأقسام الدراسية</h3>
                <div className="space-y-3">
                  {[
                    { icon: 'warning', name: 'إشارات الخطر', pct: 85, color: '#ef4444' },
                    { icon: 'block', name: 'إشارات المنع', pct: 62, color: '#dc2626' },
                    { icon: 'speed', name: 'حدود السرعة', pct: 48, color: '#8b5cf6' },
                    { icon: 'directions', name: 'قواعد المرور', pct: 31, color: '#3b82f6' },
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
              آراء المستخدمين
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-2">نجحوا بفضل Patente Hub</h2>
            <p className="text-white/45 mt-4 max-w-xl mx-auto text-lg">قصص نجاح حقيقية من مستخدمين عرب في إيطاليا</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i}
                className={cn(
                  'relative bg-white/6 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/18 transition-all duration-500 hover:-translate-y-1',
                  isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                )}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="text-6xl text-white/8 font-black leading-none mb-2 select-none">"</div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Icon key={j} name="star" size={14} className="text-amber-400" filled />
                  ))}
                </div>
                <p className="text-white/75 text-sm leading-relaxed mb-5">{t.text}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-violet-500 rounded-full flex items-center justify-center shrink-0">
                    <span className="font-bold text-white text-sm">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-white/35 text-xs">{t.role} — {t.city}</p>
                  </div>
                </div>
              </div>
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
              الأسئلة الشائعة
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-surface-900 mt-2">لديك سؤال؟</h2>
            <p className="text-surface-400 mt-3">إليك الإجابات على الأسئلة الأكثر شيوعاً</p>
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
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-right gap-3"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  <span className="font-bold text-surface-800 text-sm sm:text-base text-right flex-1">{faq.q}</span>
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                    faqOpen === i ? 'bg-primary-500 rotate-45' : 'bg-surface-100')}>
                    <Icon name="add" size={18} className={faqOpen === i ? 'text-white' : 'text-surface-400'} />
                  </div>
                </button>
                <div className={cn('overflow-hidden transition-all duration-300', faqOpen === i ? 'max-h-60' : 'max-h-0')}>
                  <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-surface-500 leading-relaxed text-sm border-t border-surface-100 pt-4">
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
            جاهز لبدء رحلتك؟
          </h2>
          <p className="text-white/65 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            انضم لآلاف العرب الذين نجحوا في امتحان الباتينتي. سجّل مجاناً وابدأ فوراً!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => onNavigate('register')}
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 bg-white text-primary-700 font-bold text-lg rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1">
              <Icon name="rocket_launch" size={22} />
              سجّل مجاناً الآن
            </button>
            <button onClick={() => onNavigate('login')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 border-2 border-white/30 text-white font-bold text-lg rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all duration-300">
              لديك حساب؟ سجّل دخول
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
            {['مجاني 100%', 'بالعربية والإيطالية', 'أسئلة حقيقية', 'إشارات مرورية'].map((b, i) => (
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
                التطبيق الأول والأفضل لمساعدة العرب في إيطاليا على اجتياز امتحان رخصة القيادة.
              </p>
            </div>

            <div className="flex flex-wrap gap-12 text-sm">
              <div>
                <p className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-widest">التطبيق</p>
                <div className="space-y-3">
                  <a href="#features" className="block text-slate-500 hover:text-white transition-colors">المميزات</a>
                  <a href="#testimonials" className="block text-slate-500 hover:text-white transition-colors">آراء المستخدمين</a>
                  <a href="#faq" className="block text-slate-500 hover:text-white transition-colors">الأسئلة الشائعة</a>
                </div>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-widest">الحساب</p>
                <div className="space-y-3">
                  <button onClick={() => onNavigate('register')} className="block text-slate-500 hover:text-white transition-colors text-right w-full">إنشاء حساب</button>
                  <button onClick={() => onNavigate('login')} className="block text-slate-500 hover:text-white transition-colors text-right w-full">تسجيل الدخول</button>
                </div>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-4 text-xs uppercase tracking-widest">قانوني</p>
                <div className="space-y-3">
                  <button onClick={() => onNavigate('privacy-policy')} className="block text-slate-500 hover:text-white transition-colors text-right w-full">سياسة الخصوصية</button>
                  <button onClick={() => onNavigate('terms-of-service')} className="block text-slate-500 hover:text-white transition-colors text-right w-full">شروط الاستخدام</button>
                  <button onClick={() => onNavigate('contact')} className="block text-slate-500 hover:text-white transition-colors text-right w-full">تواصل معنا</button>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Patente Hub. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-5 text-xs text-slate-600">
              <button onClick={() => onNavigate('privacy-policy')} className="hover:text-slate-400 transition-colors">الخصوصية</button>
              <span className="text-slate-800">·</span>
              <button onClick={() => onNavigate('terms-of-service')} className="hover:text-slate-400 transition-colors">الشروط</button>
              <span className="text-slate-800">·</span>
              <button onClick={() => onNavigate('contact')} className="hover:text-slate-400 transition-colors">الاتصال</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
