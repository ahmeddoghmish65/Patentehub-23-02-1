import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

interface PrivacyPolicyPageProps {
  onNavigate: (page: string) => void;
}

const sections = [
  { id: 'intro', title: 'مقدمة', icon: 'info' },
  { id: 'collect', title: 'المعلومات التي نجمعها', icon: 'manage_search' },
  { id: 'use', title: 'كيفية استخدام المعلومات', icon: 'settings' },
  { id: 'cookies', title: 'ملفات الارتباط والتخزين', icon: 'data_object' },
  { id: 'storage', title: 'تخزين البيانات', icon: 'storage' },
  { id: 'third-party', title: 'خدمات الطرف الثالث', icon: 'share' },
  { id: 'rights', title: 'حقوق المستخدم (GDPR)', icon: 'verified_user' },
  { id: 'protection', title: 'حماية البيانات', icon: 'security' },
  { id: 'contact', title: 'التواصل بشأن الخصوصية', icon: 'contact_mail' },
];

export function PrivacyPolicyPage({ onNavigate }: PrivacyPolicyPageProps) {
  const [activeSection, setActiveSection] = useState('intro');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const offset = 24;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 animate-fade-in-up">
      {/* App Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-surface-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-1.5 text-surface-500 hover:text-primary-600 transition-colors"
          >
            <Icon name="arrow_forward" size={20} className="ltr:rotate-180" />
            <span className="text-sm font-medium">رجوع</span>
          </button>
          <h1 className="text-base font-bold text-surface-900">سياسة الخصوصية</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
              <Icon name="directions_car" size={16} className="text-white" filled />
            </div>
            <span className="text-sm font-bold text-surface-900 hidden sm:block">Patente Hub</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">

      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-900 rounded-2xl p-8 text-center text-white mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          <div className="w-16 h-16 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-4 border border-white/30">
            <Icon name="privacy_tip" size={32} className="text-white" filled />
          </div>
          <h1 className="text-3xl font-black mb-2">سياسة الخصوصية</h1>
          <p className="text-primary-200 text-sm">
            آخر تحديث: يناير 2025 · متوافقة مع اللائحة الأوروبية GDPR
          </p>
        </div>
      </div>

      {/* Notice banner */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
        <Icon name="info" size={20} className="text-primary-500 shrink-0 mt-0.5" filled />
        <p className="text-sm text-primary-700 leading-relaxed">
          باستخدامك لتطبيق <strong>Patente Hub</strong>، فإنك توافق على الشروط الواردة في هذه السياسة. نوصي بقراءتها بعناية قبل الاستخدام.
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-6">
        {/* Table of Contents — desktop sidebar */}
        <div className="hidden lg:block">
          <div className="bg-white rounded-2xl p-4 border border-surface-100 shadow-sm sticky top-6">
            <p className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">المحتويات</p>
            <nav className="space-y-0.5">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full text-right flex items-center gap-2 text-xs px-3 py-2 rounded-lg transition-all ${
                    activeSection === section.id
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-surface-500 hover:text-primary-600 hover:bg-surface-50'
                  }`}
                >
                  <Icon name={section.icon} size={14} className={activeSection === section.id ? 'text-primary-500' : 'text-surface-400'} />
                  <span className="leading-tight">{section.title}</span>
                </button>
              ))}
            </nav>

            <div className="mt-4 pt-4 border-t border-surface-100">
              <button
                onClick={() => onNavigate('contact')}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-primary-600 text-white px-3 py-2 rounded-xl hover:bg-primary-700 transition-colors font-medium"
              >
                <Icon name="mail" size={14} />
                تواصل معنا
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-5">

          {/* 1. Intro */}
          <section id="intro" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="info" size={18} className="text-primary-600" filled />
              </span>
              مقدمة
            </h2>
            <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
              <p>
                مرحباً بك في <strong className="text-surface-900">Patente Hub</strong>. نحن نُدرك أهمية خصوصيتك ونلتزم بحمايتها. توضح هذه الوثيقة كيفية جمع بياناتك الشخصية واستخدامها والحفاظ عليها عند استخدامك للتطبيق.
              </p>
              <p>
                Patente Hub هو تطبيق تعليمي يساعد الناطقين بالعربية على الاستعداد لامتحان رخصة القيادة الإيطالية (Patente di Guida). نحن نحترم خصوصيتك ونعمل وفقاً لأفضل الممارسات الدولية في مجال حماية البيانات.
              </p>
              <p>
                هذه السياسة متوافقة مع <strong className="text-surface-900">اللائحة الأوروبية العامة لحماية البيانات (GDPR)</strong> ولوائح الخصوصية الإيطالية المعمول بها.
              </p>
            </div>
          </section>

          {/* 2. What we collect */}
          <section id="collect" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="manage_search" size={18} className="text-primary-600" filled />
              </span>
              المعلومات التي نجمعها
            </h2>
            <div className="space-y-4">
              <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                <h3 className="font-semibold text-surface-800 text-sm mb-3 flex items-center gap-2">
                  <Icon name="person" size={16} className="text-primary-500" filled />
                  معلومات الحساب الشخصي
                </h3>
                <ul className="space-y-2 text-sm text-surface-600">
                  {[
                    'الاسم الأول والأخير',
                    'عنوان البريد الإلكتروني',
                    'اسم المستخدم (اختياري)',
                    'كلمة المرور (مُشفَّرة)',
                    'تاريخ الميلاد',
                    'رقم الهاتف (اختياري)',
                    'الجنس والمحافظة الإيطالية (للإحصائيات)',
                    'الصورة الشخصية (اختيارية)',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                <h3 className="font-semibold text-surface-800 text-sm mb-3 flex items-center gap-2">
                  <Icon name="analytics" size={16} className="text-primary-500" filled />
                  بيانات الاستخدام والتقدم
                </h3>
                <ul className="space-y-2 text-sm text-surface-600">
                  {[
                    'نتائج الاختبارات والأسئلة المجاب عليها',
                    'الدروس المكتملة والتقدم في كل قسم',
                    'جلسات التدريب ومستوى الأداء',
                    'الأخطاء المتكررة لتحسين خطة التعلم',
                    'سلسلة أيام الدراسة (Streak)',
                    'نشاط المجتمع (المنشورات والتعليقات)',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                <h3 className="font-semibold text-surface-800 text-sm mb-3 flex items-center gap-2">
                  <Icon name="devices" size={16} className="text-primary-500" filled />
                  معلومات تقنية
                </h3>
                <ul className="space-y-2 text-sm text-surface-600">
                  {[
                    'نوع المتصفح والجهاز (للإحصائيات)',
                    'إحصائيات عدد الزيارات لتطوير التطبيق',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 3. How we use */}
          <section id="use" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="settings" size={18} className="text-primary-600" filled />
              </span>
              كيفية استخدام المعلومات
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: 'person_add', title: 'إدارة الحساب', desc: 'إنشاء حسابك وتسجيل دخولك وإدارة ملفك الشخصي' },
                { icon: 'school', title: 'التجربة التعليمية', desc: 'تتبع تقدمك وتقديم محتوى مخصص لمستواك' },
                { icon: 'trending_up', title: 'تحليل الأداء', desc: 'تحسين خوارزميات الاختبارات بناءً على أدائك' },
                { icon: 'notifications', title: 'الإشعارات', desc: 'إرسال تذكيرات الدراسة وإشعارات الإنجازات' },
                { icon: 'security', title: 'الأمان', desc: 'حماية حسابك من الوصول غير المصرح به' },
                { icon: 'support_agent', title: 'الدعم الفني', desc: 'تقديم المساعدة عند التواصل مع فريق الدعم' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3 border border-surface-100">
                  <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon name={item.icon} size={18} className="text-primary-600" filled />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{item.title}</p>
                    <p className="text-xs text-surface-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Cookies */}
          <section id="cookies" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="data_object" size={18} className="text-primary-600" filled />
              </span>
              ملفات الارتباط والتخزين المحلي
            </h2>
            <p className="text-sm text-surface-600 leading-relaxed mb-4">
              يستخدم التطبيق <strong>localStorage</strong> و <strong>IndexedDB</strong> للتخزين المحلي على جهازك بدلاً من ملفات الارتباط التقليدية (Cookies). هذا النهج يمنحك تحكماً أكبر في بياناتك.
            </p>
            <div className="space-y-3">
              {[
                { icon: 'key', title: 'جلسة الدخول', desc: 'حفظ رمز المصادقة لإبقائك مسجلاً دون إعادة تسجيل دخول متكررة', color: 'text-primary-500' },
                { icon: 'sync', title: 'بيانات التقدم', desc: 'مزامنة تقدمك التعليمي وإتاحته بدون اتصال بالإنترنت', color: 'text-success-500' },
                { icon: 'tune', title: 'الإعدادات والتفضيلات', desc: 'حفظ لغة المحتوى وتفضيلات واجهة المستخدم', color: 'text-warning-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3">
                  <Icon name={item.icon} size={20} className={`${item.color} shrink-0 mt-0.5`} filled />
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{item.title}</p>
                    <p className="text-xs text-surface-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-warning-50 rounded-xl p-3 border border-warning-100">
              <p className="text-xs text-warning-700 flex items-start gap-2">
                <Icon name="info" size={16} className="text-warning-500 shrink-0 mt-0.5" />
                يمكنك مسح هذه البيانات في أي وقت من إعدادات متصفحك. سيؤدي ذلك إلى تسجيل خروجك وحذف بيانات التطبيق المحلية من هذا الجهاز.
              </p>
            </div>
          </section>

          {/* 5. Storage */}
          <section id="storage" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="storage" size={18} className="text-primary-600" filled />
              </span>
              تخزين البيانات
            </h2>
            <p className="text-sm text-surface-600 leading-relaxed mb-4">
              في النسخة الحالية، تُخزَّن جميع بيانات Patente Hub <strong className="text-surface-900">محلياً على جهازك</strong> فقط باستخدام IndexedDB. لا يتم إرسال بياناتك لخوادم خارجية.
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="bg-success-50 rounded-xl p-4 border border-success-100">
                <Icon name="lock" size={24} className="text-success-600 mb-2" filled />
                <h3 className="font-semibold text-success-800 text-sm mb-1">بيانات محفوظة محلياً</h3>
                <p className="text-xs text-success-700">تبقى بياناتك على جهازك ولا تُرسَل لأي خادم</p>
              </div>
              <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
                <Icon name="wifi_off" size={24} className="text-primary-600 mb-2" filled />
                <h3 className="font-semibold text-primary-800 text-sm mb-1">يعمل بدون إنترنت</h3>
                <p className="text-xs text-primary-700">جميع ميزات التطبيق متاحة بدون اتصال</p>
              </div>
              <div className="bg-warning-50 rounded-xl p-4 border border-warning-100 sm:col-span-2">
                <Icon name="backup" size={24} className="text-warning-600 mb-2" filled />
                <h3 className="font-semibold text-warning-800 text-sm mb-1">النسخ الاحتياطي</h3>
                <p className="text-xs text-warning-700">
                  نوصيك بعدم مسح بيانات المتصفح لتجنب فقدان تقدمك. في حالات الضرورة، يمكنك تصدير بياناتك من صفحة الحساب.
                </p>
              </div>
            </div>
          </section>

          {/* 6. Third Party */}
          <section id="third-party" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="share" size={18} className="text-primary-600" filled />
              </span>
              خدمات الطرف الثالث
            </h2>
            <p className="text-sm text-surface-600 leading-relaxed mb-4">
              يستخدم التطبيق الخدمات الخارجية التالية. هذه الخدمات تعمل بسياسات خصوصية خاصة بها:
            </p>
            <div className="space-y-3">
              {[
                { name: 'Google Fonts', desc: 'لتحميل خط Cairo للعربية وخط Inter للإنجليزية', icon: 'text_fields', url: 'fonts.google.com' },
                { name: 'Material Symbols (Google)', desc: 'مكتبة الأيقونات المستخدمة في واجهة التطبيق', icon: 'interests', url: 'fonts.google.com/icons' },
              ].map((service, i) => (
                <div key={i} className="flex items-center gap-3 bg-surface-50 rounded-xl p-4 border border-surface-100">
                  <div className="w-10 h-10 bg-white rounded-xl border border-surface-200 flex items-center justify-center shrink-0">
                    <Icon name={service.icon} size={20} className="text-surface-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-surface-800">{service.name}</p>
                    <p className="text-xs text-surface-500">{service.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-surface-50 rounded-xl p-3 border border-surface-100">
              <p className="text-xs text-surface-500 flex items-start gap-2">
                <Icon name="verified_user" size={14} className="text-success-500 shrink-0 mt-0.5" filled />
                <span>
                  <strong>التزامنا:</strong> لا نبيع أو نشارك أو نؤجر بياناتك الشخصية لأي طرف ثالث لأغراض تجارية أو تسويقية.
                </span>
              </p>
            </div>
          </section>

          {/* 7. Rights (GDPR) */}
          <section id="rights" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="verified_user" size={18} className="text-primary-600" filled />
              </span>
              حقوق المستخدم بموجب GDPR
            </h2>
            <p className="text-sm text-surface-600 leading-relaxed mb-4">
              بموجب اللائحة الأوروبية العامة لحماية البيانات، لديك الحقوق التالية ويمكنك ممارستها في أي وقت:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: 'visibility', title: 'حق الوصول', desc: 'الاطلاع على جميع بياناتك الشخصية المخزنة' },
                { icon: 'edit', title: 'حق التصحيح', desc: 'تعديل أي معلومات غير دقيقة أو غير مكتملة' },
                { icon: 'delete_forever', title: 'حق الحذف', desc: 'طلب حذف حسابك وجميع بياناتك نهائياً' },
                { icon: 'pause_circle', title: 'حق القيد', desc: 'تقييد معالجة بياناتك في حالات محددة' },
                { icon: 'download', title: 'حق النقل', desc: 'الحصول على نسخة من بياناتك بصيغة قابلة للقراءة' },
                { icon: 'thumb_down', title: 'حق الاعتراض', desc: 'الاعتراض على معالجة بياناتك لأغراض معينة' },
              ].map((right, i) => (
                <div key={i} className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Icon name={right.icon} size={15} className="text-primary-600" filled />
                    </div>
                    <h3 className="font-semibold text-surface-800 text-sm">{right.title}</h3>
                  </div>
                  <p className="text-xs text-surface-500 leading-relaxed">{right.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-primary-50 rounded-xl p-3 border border-primary-100">
              <p className="text-xs text-primary-700 flex items-start gap-2">
                <Icon name="info" size={14} className="text-primary-500 shrink-0 mt-0.5" />
                لممارسة أي من هذه الحقوق، تواصل معنا عبر صفحة التواصل أو أرسل بريداً إلكترونياً إلى privacy@patentehub.com
              </p>
            </div>
          </section>

          {/* 8. Protection */}
          <section id="protection" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="security" size={18} className="text-primary-600" filled />
              </span>
              حماية البيانات
            </h2>
            <p className="text-sm text-surface-600 leading-relaxed mb-4">
              نتخذ تدابير تقنية وتنظيمية صارمة لحماية بياناتك:
            </p>
            <ul className="space-y-3">
              {[
                { icon: 'shield', text: 'تخزين البيانات محلياً على جهازك دون إرسالها لخوادم خارجية' },
                { icon: 'password', text: 'تشفير كلمات المرور قبل التخزين باستخدام خوارزميات آمنة' },
                { icon: 'token', text: 'نظام توكن للجلسات مع صلاحية زمنية محدودة للأمان المستمر' },
                { icon: 'visibility_off', text: 'عدم عرض كلمات المرور أو البيانات الحساسة في الواجهة' },
                { icon: 'admin_panel_settings', text: 'تقييد الوصول للبيانات الحساسة حسب صلاحيات المستخدم' },
                { icon: 'gpp_good', text: 'مراجعة دورية لإجراءات الأمان وتحديثها باستمرار' },
              ].map((measure, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-success-50 rounded-lg flex items-center justify-center shrink-0">
                    <Icon name={measure.icon} size={16} className="text-success-600" filled />
                  </div>
                  <span className="text-sm text-surface-600">{measure.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 9. Contact for Privacy */}
          <section id="contact" className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Icon name="contact_mail" size={22} className="text-primary-200" filled />
              التواصل بشأن الخصوصية
            </h2>
            <p className="text-primary-100 text-sm leading-relaxed mb-5">
              إذا كان لديك أي استفسار حول هذه السياسة، أو أردت ممارسة حقوقك القانونية، أو الإبلاغ عن انتهاك للخصوصية، يرجى التواصل معنا:
            </p>
            <div className="space-y-3">
              <a
                href="mailto:privacy@patentehub.com"
                className="flex items-center gap-3 bg-white/15 hover:bg-white/25 rounded-xl px-4 py-3 transition-colors border border-white/20"
              >
                <Icon name="email" size={20} className="text-primary-200" />
                <div>
                  <p className="text-xs text-primary-200">البريد الإلكتروني للخصوصية</p>
                  <p className="text-sm font-semibold" dir="ltr">privacy@patentehub.com</p>
                </div>
              </a>
              <button
                onClick={() => onNavigate('contact')}
                className="w-full flex items-center justify-center gap-2 bg-white text-primary-700 font-semibold rounded-xl px-4 py-3 hover:bg-primary-50 transition-colors text-sm"
              >
                <Icon name="chat" size={18} className="text-primary-600" />
                صفحة التواصل معنا
              </button>
            </div>
            <p className="text-primary-300 text-xs mt-4">
              نلتزم بالرد على جميع الاستفسارات المتعلقة بالخصوصية خلال 30 يوماً من استلام طلبك.
            </p>
          </section>

          {/* Navigation between legal pages */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('terms-of-service')}
              className="flex-1 flex items-center justify-between gap-2 bg-white rounded-2xl px-5 py-4 border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <Icon name="gavel" size={20} className="text-surface-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-400">الصفحة التالية</p>
                  <p className="text-sm font-bold text-surface-900">شروط الاستخدام</p>
                </div>
              </div>
              <Icon name="arrow_back" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="flex-1 flex items-center justify-between gap-2 bg-white rounded-2xl px-5 py-4 border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <Icon name="mail" size={20} className="text-surface-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-400">تواصل معنا</p>
                  <p className="text-sm font-bold text-surface-900">صفحة الاتصال</p>
                </div>
              </div>
              <Icon name="arrow_back" size={20} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
