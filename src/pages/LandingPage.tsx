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
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('[data-animate]').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const isVisible = (id: string) => visibleSections.has(id);

  const features = [
    { icon: 'translate', title: 'ثنائي اللغة', titleIt: 'Bilingue', desc: 'كل سؤال وشرح بالعربية والإيطالية معاً — تعلّم المصطلحات الحقيقية التي ستواجهها في الامتحان', color: 'from-blue-500 to-blue-600' },
    { icon: 'quiz', title: 'اختبارات حقيقية', titleIt: 'Quiz reali', desc: 'أسئلة صح/خطأ مطابقة لنمط الامتحان الحقيقي مع شرح مفصل لكل إجابة بالعربية', color: 'from-purple-500 to-purple-600' },
    { icon: 'school', title: 'دروس منظمة', titleIt: 'Lezioni organizzate', desc: 'محتوى مقسم لأقسام ودروس مرتبة — من إشارات الخطر حتى التأمين والوثائق', color: 'from-green-500 to-green-600' },
    { icon: 'traffic', title: 'إشارات مرورية', titleIt: 'Segnali stradali', desc: 'مكتبة شاملة للإشارات المرورية الإيطالية مع صور وشرح لكل إشارة', color: 'from-red-500 to-red-600' },
    { icon: 'menu_book', title: 'قاموس مروري', titleIt: 'Dizionario stradale', desc: 'قاموس مصطلحات رخصة القيادة — كل مصطلح إيطالي مترجم ومشروح بالعربية', color: 'from-orange-500 to-orange-600' },
    { icon: 'forum', title: 'مجتمع تعليمي', titleIt: 'Comunità', desc: 'شارك تجربتك واسأل المجتمع — آلاف العرب في إيطاليا يدرسون معك', color: 'from-cyan-500 to-cyan-600' },
    { icon: 'trending_up', title: 'تتبع ذكي', titleIt: 'Monitoraggio', desc: 'إحصائيات دقيقة — تتبع أخطائك وتقدمك ونسبة جاهزيتك للامتحان', color: 'from-pink-500 to-pink-600' },
    { icon: 'fitness_center', title: 'تدريب مستمر', titleIt: 'Allenamento', desc: '3 أنواع تدريب: أسئلة + إشارات + مصطلحات — تمرّن يومياً واحصل على سلسلة أيام', color: 'from-amber-500 to-amber-600' },
  ];

  const testimonials = [
    { name: 'أحمد محمد', text: 'نجحت في الامتحان من أول مرة بفضل هذا التطبيق! الشرح بالعربية سهّل عليّ فهم القوانين الإيطالية المعقدة. أنصح الجميع به.', rating: 5, city: 'Milano', role: 'طالب جامعي' },
    { name: 'فاطمة علي', text: 'كنت خائفة من الامتحان لأن لغتي الإيطالية ضعيفة، لكن التطبيق ساعدني بالشرح العربي المفصل. أسئلة التدريب كانت مشابهة جداً للامتحان الحقيقي.', rating: 5, city: 'Roma', role: 'ربة منزل' },
    { name: 'يوسف حسن', text: 'نظام تتبع الأخطاء ممتاز — ساعدني أركز على النقاط الضعيفة. بعد أسبوعين من التدريب اليومي نجحت بسهولة!', rating: 5, city: 'Torino', role: 'عامل' },
    { name: 'سارة خالد', text: 'قسم الإشارات المرورية مع الصور رائع. تعلمت كل الإشارات بسرعة. والقاموس ساعدني أفهم المصطلحات الصعبة.', rating: 5, city: 'Napoli', role: 'موظفة' },
    { name: 'محمد رضا', text: 'أفضل ميزة هي أسئلة صح/خطأ مثل الامتحان بالضبط. درست 3 أسابيع فقط ونجحت. شكراً Patente Hub!', rating: 5, city: 'Bologna', role: 'مهندس' },
    { name: 'نور الهدى', text: 'التطبيق بسيط ومرتب. المجتمع فيه ناس مساعدة. كنت أسأل عن الأشياء اللي ما فهمتها وأحصل إجابة بسرعة.', rating: 5, city: 'Firenze', role: 'طالبة' },
  ];

  const faqs = [
    { q: 'هل التطبيق مجاني؟', a: 'نعم، التطبيق مجاني بالكامل. جميع الدروس والأسئلة والإشارات والقاموس متاحة بدون أي رسوم أو اشتراكات.' },
    { q: 'هل الأسئلة مشابهة للامتحان الحقيقي؟', a: 'نعم، الأسئلة بنمط صح/خطأ (Vero/Falso) وهو نفس نمط الامتحان الرسمي في إيطاليا. المحتوى مبني على المنهج الرسمي.' },
    { q: 'ما هو نوع الرخصة المدعوم؟', a: 'التطبيق يغطي جميع مواضيع رخصة القيادة من الفئة B (Patente B) وهي الرخصة الأكثر شيوعاً للسيارات العادية.' },
    { q: 'هل يمكنني الدراسة بالعربية فقط؟', a: 'نعم، يمكنك اختيار العرض بالعربية فقط أو الإيطالية فقط أو كلاهما معاً. لكننا ننصح بالتعلم بكلا اللغتين لأن الامتحان بالإيطالية.' },
    { q: 'كم يوماً أحتاج للاستعداد؟', a: 'يختلف حسب الشخص، لكن معظم المستخدمين ينجحون بعد 2-4 أسابيع من الدراسة اليومية المنتظمة. نظام التتبع يساعدك تعرف متى تكون جاهزاً.' },
    { q: 'ماذا أفعل إذا نسيت كلمة المرور؟', a: 'يمكنك إعادة تعيين كلمة المرور من صفحة تسجيل الدخول عبر خيار "نسيت كلمة المرور".' },
    { q: 'هل يوجد تطبيق للجوال؟', a: 'التطبيق مصمم ليعمل بشكل مثالي على متصفح الجوال. يمكنك إضافته للشاشة الرئيسية واستخدامه كتطبيق عادي.' },
  ];

  const stats = [
    { value: '+5,000', label: 'مستخدم نشط', icon: 'group' },
    { value: '92%', label: 'نسبة النجاح', icon: 'verified' },
    { value: '+10,000', label: 'اختبار مكتمل', icon: 'quiz' },
    { value: '4.9/5', label: 'تقييم المستخدمين', icon: 'star' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-surface-100' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
                <Icon name="directions_car" size={22} className="text-white" filled />
              </div>
              <span className="text-xl font-bold text-surface-900">Patente Hub</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-surface-600 hover:text-primary-600 transition-colors text-sm font-medium">المميزات</a>
              <a href="#how" className="text-surface-600 hover:text-primary-600 transition-colors text-sm font-medium">كيف يعمل</a>
              <a href="#testimonials" className="text-surface-600 hover:text-primary-600 transition-colors text-sm font-medium">آراء المستخدمين</a>
              <a href="#faq" className="text-surface-600 hover:text-primary-600 transition-colors text-sm font-medium">الأسئلة الشائعة</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Button size="sm" variant="ghost" onClick={() => onNavigate('login')}>تسجيل الدخول</Button>
              <Button size="sm" onClick={() => onNavigate('register')}>ابدأ مجاناً</Button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => onNavigate('login')}
                className="text-sm font-semibold text-primary-600 border border-primary-200 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
              >
                دخول
              </button>
              <button className="p-2 rounded-lg hover:bg-surface-100" onClick={() => setMobileMenu(!mobileMenu)}>
                <Icon name={mobileMenu ? 'close' : 'menu'} />
              </button>
            </div>
          </div>
        </div>

        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-surface-100 p-4 space-y-3 shadow-xl">
            <a href="#features" className="block py-2 text-surface-600 font-medium" onClick={() => setMobileMenu(false)}>المميزات</a>
            <a href="#how" className="block py-2 text-surface-600 font-medium" onClick={() => setMobileMenu(false)}>كيف يعمل</a>
            <a href="#testimonials" className="block py-2 text-surface-600 font-medium" onClick={() => setMobileMenu(false)}>آراء المستخدمين</a>
            <a href="#faq" className="block py-2 text-surface-600 font-medium" onClick={() => setMobileMenu(false)}>الأسئلة الشائعة</a>
            <div className="pt-2 space-y-2">
              <Button fullWidth variant="outline" onClick={() => onNavigate('login')}>تسجيل الدخول</Button>
              <Button fullWidth onClick={() => onNavigate('register')}>ابدأ مجاناً</Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-100 to-purple-100 rounded-full blur-3xl opacity-20" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-primary-200 text-primary-700 px-5 py-2.5 rounded-full text-sm font-medium mb-8 shadow-sm animate-fade-in-up">
              <Icon name="auto_awesome" size={18} filled className="text-primary-500" />
              <span>🇮🇹 التطبيق الأول للعرب في إيطاليا — مدعوم بالذكاء الاصطناعي 🤖</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-surface-900 leading-tight mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              احصل على رخصة القيادة
              <br />
              <span className="gradient-text">الإيطالية بسهولة</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-surface-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              تعلّم واستعد لامتحان الباتينتي بالعربية والإيطالية.
              <br className="hidden sm:block" />
              دروس شاملة، أسئلة حقيقية، إشارات مرورية، وتتبع ذكي لتقدمك.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" onClick={() => onNavigate('register')} icon={<Icon name="rocket_launch" size={22} />} className="animate-pulse-glow text-lg px-8">
                ابدأ التعلم مجاناً
              </Button>
              <Button size="lg" variant="outline" onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }} icon={<Icon name="arrow_downward" size={22} />}>
                تعرّف على المزيد
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative -mt-10 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-surface-200/50 border border-surface-100 p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <Icon name={stat.icon} size={28} className="text-primary-500 mx-auto mb-2" filled />
                  <p className="text-2xl sm:text-3xl font-black text-surface-900">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-surface-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 sm:py-32" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Icon name="stars" size={16} filled />
              لماذا Patente Hub؟
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 mt-3">كل ما تحتاجه في تطبيق واحد</h2>
            <p className="text-surface-500 mt-4 max-w-2xl mx-auto text-lg">أدوات متكاملة صُممت خصيصاً لمساعدة العرب في إيطاليا على النجاح في امتحان رخصة القيادة</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <div key={i} className={cn(
                'bg-white rounded-2xl p-6 border border-surface-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-50 transition-all duration-500 group cursor-default',
                isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center mb-5 bg-gradient-to-br shadow-lg', f.color)}>
                  <Icon name={f.icon} size={26} className="text-white" filled />
                </div>
                <h3 className="text-lg font-bold text-surface-900 mb-1 group-hover:text-primary-600 transition-colors">{f.title}</h3>
                <p className="text-xs text-primary-500 font-medium mb-3">{f.titleIt}</p>
                <p className="text-surface-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24 sm:py-32 bg-gradient-to-br from-surface-50 to-white" data-animate>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('how') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Icon name="route" size={16} filled />
              كيف تبدأ؟
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 mt-3">3 خطوات فقط</h2>
            <p className="text-surface-500 mt-4 max-w-xl mx-auto text-lg">ابدأ رحلتك نحو رخصة القيادة الإيطالية</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { step: '1', icon: 'person_add', title: 'سجّل حسابك مجاناً', titleIt: 'Registrati gratis', desc: 'أنشئ حساباً في ثوانٍ — بريد إلكتروني وكلمة مرور فقط', color: 'from-blue-500 to-blue-600' },
              { step: '2', icon: 'menu_book', title: 'ادرس الدروس والأسئلة', titleIt: 'Studia le lezioni', desc: 'اختر القسم وابدأ بالدروس ثم حل أسئلة صح/خطأ مع الشرح', color: 'from-purple-500 to-purple-600' },
              { step: '3', icon: 'workspace_premium', title: 'انجح في الامتحان!', titleIt: 'Supera l\'esame!', desc: 'تدرّب يومياً وتابع نسبة جاهزيتك حتى تصل 100% وتنجح', color: 'from-green-500 to-green-600' },
            ].map((step, i) => (
              <div key={i} className={cn(
                'text-center relative transition-all duration-700',
                isVisible('how') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )} style={{ transitionDelay: `${i * 200}ms` }}>
                <div className="relative inline-block mb-8">
                  <div className={cn('w-24 h-24 mx-auto bg-gradient-to-br rounded-3xl flex items-center justify-center shadow-2xl', step.color)}>
                    <Icon name={step.icon} size={44} className="text-white" filled />
                  </div>
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-primary-200">
                    <span className="text-lg font-black text-primary-600">{step.step}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-1">{step.title}</h3>
                <p className="text-xs text-primary-500 font-medium mb-3">{step.titleIt}</p>
                <p className="text-surface-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview / Screenshots */}
      <section className="py-24 sm:py-32 overflow-hidden" data-animate id="preview">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('preview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Icon name="phone_iphone" size={16} filled />
              واجهة التطبيق
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-surface-900 mt-3">تصميم بسيط وسهل الاستخدام</h2>
            <p className="text-surface-500 mt-4 max-w-xl mx-auto text-lg">واجهة عربية مريحة مع دعم كامل للإيطالية</p>
          </div>

          <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000', isVisible('preview') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12')}>
            {/* Preview Card 1 - Quiz */}
            <div className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-danger-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-success-500" />
              </div>
              <div className="bg-white rounded-xl p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Icon name="quiz" className="text-red-500" size={22} filled />
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 text-sm">اختبار: إشارات الخطر</h3>
                    <p className="text-xs text-surface-400">Segnali di pericolo</p>
                  </div>
                </div>
                <div className="bg-surface-50 rounded-lg p-3 mb-3">
                  <p className="text-sm font-semibold text-surface-800">إشارات الخطر لها شكل مثلث بحافة حمراء</p>
                  <p className="text-xs text-surface-400 mt-1" dir="ltr">I segnali di pericolo hanno forma triangolare</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-lg border-2 border-success-400 bg-success-50 text-center">
                    <Icon name="check_circle" size={24} className="text-success-500 mx-auto mb-1" filled />
                    <span className="text-xs font-bold text-success-600">صحيح ✓</span>
                  </div>
                  <div className="p-3 rounded-lg border-2 border-surface-200 text-center opacity-50">
                    <Icon name="cancel" size={24} className="text-surface-300 mx-auto mb-1" />
                    <span className="text-xs font-bold text-surface-400">خطأ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Card 2 - Sections */}
            <div className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-danger-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-success-500" />
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-bold text-surface-900 mb-4">الأقسام الدراسية</h3>
                {[
                  { icon: 'warning', name: 'إشارات الخطر', color: '#ef4444', pct: 80 },
                  { icon: 'block', name: 'إشارات المنع', color: '#dc2626', pct: 60 },
                  { icon: 'arrow_circle_up', name: 'إشارات الإلزام', color: '#2563eb', pct: 40 },
                  { icon: 'speed', name: 'حدود السرعة', color: '#8b5cf6', pct: 20 },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 mb-2 rounded-lg hover:bg-surface-50">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '15' }}>
                      <Icon name={s.icon} size={18} style={{ color: s.color }} filled />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-surface-800">{s.name}</p>
                      <div className="w-full bg-surface-100 rounded-full h-1.5 mt-1">
                        <div className="bg-primary-500 rounded-full h-1.5" style={{ width: `${s.pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-surface-400">{s.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Card 3 - Stats */}
            <div className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2.5 h-2.5 rounded-full bg-danger-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-warning-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-success-500" />
              </div>
              <div className="bg-white rounded-xl p-5">
                <h3 className="font-bold text-surface-900 mb-4">تتبع تقدمك</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-28 h-28">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="8" strokeLinecap="round" strokeDasharray="198 66" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-success-500">75%</span>
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm text-surface-500 mb-3">جاهزية الامتحان</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-blue-600">12</p>
                    <p className="text-xs text-blue-400">اختبار</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-orange-600">5</p>
                    <p className="text-xs text-orange-400">أيام متتالية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 sm:py-32 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden" data-animate>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm border border-white/20">
              <Icon name="favorite" size={16} filled />
              آراء المستخدمين
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3">نجحوا بفضل Patente Hub</h2>
            <p className="text-primary-200 mt-4 max-w-xl mx-auto text-lg">قصص نجاح حقيقية من مستخدمين عرب في إيطاليا</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {testimonials.map((t, i) => (
              <div key={i} className={cn(
                'bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-500',
                isVisible('testimonials') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              )} style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Icon key={j} name="star" size={18} className="text-yellow-400" filled />
                  ))}
                </div>
                <p className="text-white/90 mb-5 leading-relaxed text-sm">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="font-bold text-white text-sm">{t.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-primary-200 text-xs">{t.role} — {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 sm:py-32" data-animate>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={cn('text-center mb-16 transition-all duration-700', isVisible('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8')}>
            <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
              <Icon name="help" size={16} filled />
              أسئلة شائعة
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-surface-900 mt-3">هل لديك سؤال؟</h2>
            <p className="text-surface-500 mt-3">إليك الإجابات على الأسئلة الأكثر شيوعاً</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className={cn(
                'bg-white rounded-2xl border border-surface-100 overflow-hidden transition-all duration-500',
                faqOpen === i ? 'shadow-lg shadow-primary-50 border-primary-200' : 'hover:border-surface-200',
                isVisible('faq') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              )} style={{ transitionDelay: `${i * 60}ms` }}>
                <button
                  className="w-full flex items-center justify-between p-5 sm:p-6 text-right hover:bg-surface-50 transition-colors"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                >
                  <span className="font-bold text-surface-800 text-sm sm:text-base">{faq.q}</span>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-3 transition-all', faqOpen === i ? 'bg-primary-500 rotate-180' : 'bg-surface-100')}>
                    <Icon name="expand_more" size={20} className={faqOpen === i ? 'text-white' : 'text-surface-400'} />
                  </div>
                </button>
                <div className={cn('overflow-hidden transition-all duration-300', faqOpen === i ? 'max-h-96' : 'max-h-0')}>
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-surface-500 leading-relaxed border-t border-surface-100 pt-4">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-primary-500/30">
            <Icon name="directions_car" size={40} className="text-white" filled />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6">
            جاهز لبدء رحلتك؟
          </h2>
          <p className="text-surface-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            انضم لآلاف العرب الذين نجحوا في امتحان الباتينتي.
            <br />
            سجّل مجاناً الآن وابدأ التعلم فوراً!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => onNavigate('register')} icon={<Icon name="rocket_launch" size={22} />} className="text-lg px-8">
              سجّل مجاناً الآن
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('login')} className="!border-white/30 !text-white hover:!bg-white/10">
              لديك حساب؟ سجّل دخول
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 border-t border-surface-800 pt-10 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8 mb-8">
            {/* Brand */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <Icon name="directions_car" size={20} className="text-white" filled />
              </div>
              <div>
                <span className="text-white font-bold text-lg">Patente Hub</span>
                <p className="text-surface-500 text-xs">تطبيق تعليم رخصة القيادة الإيطالية</p>
              </div>
            </div>

            {/* Navigation columns */}
            <div className="flex flex-wrap gap-10 text-sm">
              {/* App links */}
              <div>
                <p className="text-surface-400 font-semibold mb-3 text-xs uppercase tracking-wider">التطبيق</p>
                <div className="space-y-2">
                  <a href="#features" className="block text-surface-500 hover:text-white transition-colors">المميزات</a>
                  <a href="#testimonials" className="block text-surface-500 hover:text-white transition-colors">آراء المستخدمين</a>
                  <a href="#faq" className="block text-surface-500 hover:text-white transition-colors">الأسئلة الشائعة</a>
                </div>
              </div>
              {/* Legal links */}
              <div>
                <p className="text-surface-400 font-semibold mb-3 text-xs uppercase tracking-wider">قانوني</p>
                <div className="space-y-2">
                  <button onClick={() => onNavigate('privacy-policy')} className="block text-surface-500 hover:text-white transition-colors text-right w-full">سياسة الخصوصية</button>
                  <button onClick={() => onNavigate('terms-of-service')} className="block text-surface-500 hover:text-white transition-colors text-right w-full">شروط الاستخدام</button>
                  <button onClick={() => onNavigate('contact')} className="block text-surface-500 hover:text-white transition-colors text-right w-full">تواصل معنا</button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-surface-800 pt-5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-surface-600 text-xs">© {new Date().getFullYear()} Patente Hub. جميع الحقوق محفوظة.</p>
            <div className="flex items-center gap-4 text-xs text-surface-600">
              <button onClick={() => onNavigate('privacy-policy')} className="hover:text-surface-400 transition-colors">الخصوصية</button>
              <span>·</span>
              <button onClick={() => onNavigate('terms-of-service')} className="hover:text-surface-400 transition-colors">الشروط</button>
              <span>·</span>
              <button onClick={() => onNavigate('contact')} className="hover:text-surface-400 transition-colors">الاتصال</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
