import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';

interface TermsOfServicePageProps {
  onNavigate: (page: string) => void;
}

const sections = [
  { id: 'acceptance', title: 'قبول الشروط', icon: 'handshake' },
  { id: 'purpose', title: 'هدف التطبيق', icon: 'school' },
  { id: 'eligibility', title: 'شروط الأهلية', icon: 'person_check' },
  { id: 'account', title: 'قواعد الحساب', icon: 'manage_accounts' },
  { id: 'responsibilities', title: 'مسؤوليات المستخدم', icon: 'assignment' },
  { id: 'ip', title: 'الملكية الفكرية', icon: 'copyright' },
  { id: 'liability', title: 'حدود المسؤولية', icon: 'gavel' },
  { id: 'termination', title: 'إنهاء الوصول', icon: 'block' },
  { id: 'updates', title: 'تحديثات الشروط', icon: 'update' },
  { id: 'contact', title: 'معلومات الاتصال', icon: 'contact_mail' },
];

export function TermsOfServicePage({ onNavigate }: TermsOfServicePageProps) {
  const [activeSection, setActiveSection] = useState('acceptance');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 24;
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
          <h1 className="text-base font-bold text-surface-900">شروط الاستخدام</h1>
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
      <div className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl p-8 text-center text-white mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="relative">
          <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/20">
            <Icon name="gavel" size={32} className="text-white" filled />
          </div>
          <h1 className="text-3xl font-black mb-2">شروط الاستخدام</h1>
          <p className="text-surface-300 text-sm">
            آخر تحديث: يناير 2025 · يرجى القراءة قبل الاستخدام
          </p>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-warning-50 border border-warning-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
        <Icon name="warning" size={20} className="text-warning-500 shrink-0 mt-0.5" filled />
        <p className="text-sm text-warning-700 leading-relaxed">
          <strong>مهم:</strong> باستخدامك لتطبيق Patente Hub، فإنك تؤكد قراءتك لهذه الشروط وموافقتك عليها. إذا كنت لا توافق على هذه الشروط، يرجى التوقف عن استخدام التطبيق.
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
                      ? 'bg-surface-900 text-white font-semibold'
                      : 'text-surface-500 hover:text-surface-800 hover:bg-surface-50'
                  }`}
                >
                  <Icon name={section.icon} size={14} className={activeSection === section.id ? 'text-white' : 'text-surface-400'} />
                  <span className="leading-tight">{section.title}</span>
                </button>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t border-surface-100">
              <button
                onClick={() => onNavigate('contact')}
                className="w-full flex items-center justify-center gap-1.5 text-xs bg-surface-800 text-white px-3 py-2 rounded-xl hover:bg-surface-900 transition-colors font-medium"
              >
                <Icon name="mail" size={14} />
                تواصل معنا
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 space-y-5">

          {/* 1. Acceptance */}
          <section id="acceptance" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="handshake" size={18} className="text-surface-600" filled />
              </span>
              قبول الشروط
            </h2>
            <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
              <p>
                تُمثّل هذه الوثيقة اتفاقية قانونية ملزمة بينك وبين <strong className="text-surface-900">Patente Hub</strong>. بتسجيلك في التطبيق أو استخدامه بأي طريقة، فإنك تؤكد:
              </p>
              <ul className="space-y-2 mr-4">
                {[
                  'أنك قرأت هذه الشروط وفهمتها بالكامل',
                  'أنك توافق على الالتزام بجميع بنودها',
                  'أن عمرك لا يقل عن 16 سنة، أو أنك تحت إشراف ولي أمر يوافق على هذه الشروط',
                  'أن لديك الصلاحية القانونية لإبرام هذه الاتفاقية',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 bg-success-50 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <Icon name="check" size={12} className="text-success-600" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 2. Purpose */}
          <section id="purpose" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="school" size={18} className="text-surface-600" filled />
              </span>
              هدف التطبيق
            </h2>
            <p className="text-sm text-surface-600 leading-relaxed mb-4">
              <strong>Patente Hub</strong> هو تطبيق تعليمي مجاني مصمم حصراً لمساعدة الناطقين بالعربية على الاستعداد لامتحان رخصة القيادة الإيطالية (Esame di Guida).
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: 'menu_book', title: 'محتوى تعليمي', desc: 'دروس نظرية متوافقة مع منهج وزارة البنية التحتية الإيطالية' },
                { icon: 'quiz', title: 'اختبارات تدريبية', desc: 'أسئلة صح/خطأ تحاكي الامتحان الرسمي الإيطالي' },
                { icon: 'traffic', title: 'إشارات المرور', desc: 'مكتبة شاملة لإشارات المرور الإيطالية بشرح بالعربية' },
                { icon: 'translate', title: 'دعم ثنائي اللغة', desc: 'محتوى بالعربية والإيطالية لتيسير الفهم' },
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
            <div className="mt-4 bg-danger-50 rounded-xl p-3 border border-danger-100">
              <p className="text-xs text-danger-700 flex items-start gap-2">
                <Icon name="warning" size={14} className="text-danger-500 shrink-0 mt-0.5" filled />
                <span>
                  <strong>تنبيه:</strong> التطبيق أداة تعليمية مساعدة فقط. لا يُغني عن التدريب العملي مع مدرب معتمد، ولا يضمن اجتيازك للامتحان الرسمي.
                </span>
              </p>
            </div>
          </section>

          {/* 3. Eligibility */}
          <section id="eligibility" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="person_check" size={18} className="text-surface-600" filled />
              </span>
              شروط الأهلية
            </h2>
            <p className="text-sm text-surface-600 leading-relaxed mb-3">
              يمكن استخدام التطبيق من قِبل:
            </p>
            <ul className="space-y-2 text-sm text-surface-600">
              {[
                'الأفراد الذين بلغوا سن 16 عاماً فأكثر',
                'من يرغبون في التحضير لامتحان رخصة القيادة الإيطالية',
                'المقيمون في إيطاليا أو الدول الأوروبية',
                'من يمكنهم قبول هذه الشروط بشكل قانوني في بلدهم',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Icon name="check_circle" size={16} className="text-success-500" filled />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-3 bg-surface-50 rounded-xl p-3 border border-surface-100">
              <p className="text-xs text-surface-500">
                للقاصرين دون 16 سنة: يجب الحصول على موافقة صريحة من ولي الأمر قبل إنشاء الحساب.
              </p>
            </div>
          </section>

          {/* 4. Account Rules */}
          <section id="account" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="manage_accounts" size={18} className="text-surface-600" filled />
              </span>
              قواعد الحساب
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-surface-800 text-sm mb-2">عند إنشاء الحساب، أنت تلتزم بـ:</h3>
                <ul className="space-y-2 text-sm text-surface-600">
                  {[
                    'تقديم معلومات صحيحة ودقيقة عند التسجيل',
                    'الحفاظ على تحديث معلوماتك الشخصية',
                    'الحفاظ على سرية كلمة مرورك وعدم مشاركتها',
                    'إخطارنا فوراً في حال الاشتباه باختراق حسابك',
                    'عدم إنشاء أكثر من حساب واحد لنفس الشخص',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-400 shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-danger-50 rounded-xl p-4 border border-danger-100">
                <h3 className="font-semibold text-danger-800 text-sm mb-2 flex items-center gap-2">
                  <Icon name="cancel" size={16} className="text-danger-500" filled />
                  محظور تماماً:
                </h3>
                <ul className="space-y-1.5 text-sm text-danger-700">
                  {[
                    'مشاركة حسابك مع أشخاص آخرين',
                    'إنشاء حسابات وهمية أو مجهولة الهوية',
                    'انتحال شخصية مستخدمين آخرين',
                    'بيع أو نقل الحساب لطرف ثالث',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-danger-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 5. Responsibilities */}
          <section id="responsibilities" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="assignment" size={18} className="text-surface-600" filled />
              </span>
              مسؤوليات المستخدم
            </h2>
            <p className="text-sm text-surface-600 leading-relaxed mb-4">
              أنت مسؤول مسؤولية كاملة عن استخدامك للتطبيق والتزام بما يلي:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { icon: 'verified', title: 'الاستخدام الشخصي فقط', desc: 'استخدام التطبيق لأغراض تعليمية شخصية حصراً' },
                { icon: 'forum', title: 'سلوك المجتمع', desc: 'الاحترام وعدم إرسال محتوى مسيء في المجتمع' },
                { icon: 'report', title: 'الإبلاغ عن المشاكل', desc: 'الإبلاغ عن أي محتوى مخالف أو مشاكل تقنية' },
                { icon: 'update', title: 'تحديث المعلومات', desc: 'الحفاظ على دقة بياناتك الشخصية وتحديثها' },
                { icon: 'no_adult_content', title: 'محتوى لائق', desc: 'عدم نشر محتوى عنصري أو مسيء أو غير لائق' },
                { icon: 'code_off', title: 'عدم الاختراق', desc: 'عدم محاولة اختراق النظام أو تعطيله' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 bg-surface-50 rounded-xl p-3">
                  <Icon name={item.icon} size={18} className="text-surface-500 shrink-0 mt-0.5" filled />
                  <div>
                    <p className="text-sm font-semibold text-surface-800">{item.title}</p>
                    <p className="text-xs text-surface-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Intellectual Property */}
          <section id="ip" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="copyright" size={18} className="text-surface-600" filled />
              </span>
              الملكية الفكرية
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-surface-600 leading-relaxed">
                جميع المحتويات المتوفرة في Patente Hub — بما تشمل الدروس، الأسئلة، الشروحات، التصاميم، والشعار — هي ملكية فكرية حصرية لـ <strong className="text-surface-900">Patente Hub</strong> وتخضع لحقوق النشر والملكية الفكرية.
              </p>
              <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                <h3 className="font-semibold text-surface-800 text-sm mb-3">ما يُسمح به:</h3>
                <ul className="space-y-2 text-sm text-surface-600">
                  {[
                    'استخدام المحتوى للتعلم الشخصي',
                    'مشاركة روابط التطبيق مع الأصدقاء',
                    'الاقتباس من المحتوى مع الإشارة للمصدر',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Icon name="check_circle" size={14} className="text-success-500" filled />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-danger-50 rounded-xl p-4 border border-danger-100">
                <h3 className="font-semibold text-danger-800 text-sm mb-3">ما لا يُسمح به:</h3>
                <ul className="space-y-2 text-sm text-danger-700">
                  {[
                    'نسخ المحتوى أو إعادة نشره دون إذن خطي',
                    'استخدام المحتوى لأغراض تجارية',
                    'إنشاء تطبيقات أو مواقع مبنية على محتوانا',
                    'ادعاء ملكية أي جزء من محتوى التطبيق',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Icon name="cancel" size={14} className="text-danger-500" filled />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Limitation of Liability */}
          <section id="liability" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="gavel" size={18} className="text-surface-600" filled />
              </span>
              حدود المسؤولية
            </h2>
            <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
              <p>
                يُقدَّم التطبيق <strong>"كما هو"</strong> ونسعى لتقديم أفضل تجربة ممكنة، غير أننا لا نضمن:
              </p>
              <ul className="space-y-2 mr-4">
                {[
                  'دقة المحتوى التعليمي بنسبة 100% في جميع الأوقات',
                  'توافر التطبيق المستمر بدون انقطاع',
                  'اجتيازك للامتحان الرسمي بناءً على استخدام التطبيق وحده',
                  'ملاءمة المحتوى لجميع الحالات والمناطق في إيطاليا',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-surface-400 shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="bg-surface-50 rounded-xl p-4 border border-surface-100">
                <p className="text-xs text-surface-500">
                  <strong className="text-surface-700">ملاحظة:</strong> Patente Hub لا يتحمل أي مسؤولية عن الأضرار المباشرة أو غير المباشرة الناجمة عن استخدام أو عدم القدرة على استخدام التطبيق، بما في ذلك الرسوب في الامتحان الرسمي.
                </p>
              </div>
            </div>
          </section>

          {/* 8. Termination */}
          <section id="termination" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="block" size={18} className="text-surface-600" filled />
              </span>
              إنهاء الوصول
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-surface-800 text-sm mb-2">حق المستخدم في إنهاء الاشتراك:</h3>
                <p className="text-sm text-surface-600 leading-relaxed">
                  يمكنك حذف حسابك في أي وقت من إعدادات الملف الشخصي. سيتم حذف جميع بياناتك المخزنة محلياً.
                </p>
              </div>
              <div className="bg-warning-50 rounded-xl p-4 border border-warning-100">
                <h3 className="font-semibold text-warning-800 text-sm mb-2 flex items-center gap-2">
                  <Icon name="warning" size={16} className="text-warning-500" filled />
                  حق Patente Hub في تعليق الحساب:
                </h3>
                <p className="text-sm text-warning-700 mb-2">نحتفظ بالحق في تعليق أو إنهاء حسابك فوراً في حالة:</p>
                <ul className="space-y-1.5 text-sm text-warning-700">
                  {[
                    'انتهاك هذه الشروط أو سياسة الخصوصية',
                    'السلوك المسيء أو إزعاج المستخدمين الآخرين',
                    'محاولة اختراق النظام أو التلاعب بالبيانات',
                    'نشر محتوى مضلل أو ضار',
                    'الإبلاغ المتعمد الكاذب عن مستخدمين آخرين',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning-500 shrink-0 mt-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 9. Updates */}
          <section id="updates" className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            <h2 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-surface-100 rounded-lg flex items-center justify-center shrink-0">
                <Icon name="update" size={18} className="text-surface-600" filled />
              </span>
              تحديثات الشروط
            </h2>
            <div className="space-y-3 text-sm text-surface-600 leading-relaxed">
              <p>
                نحتفظ بالحق في تعديل هذه الشروط في أي وقت. عند إجراء تغييرات جوهرية:
              </p>
              <ul className="space-y-2">
                {[
                  { icon: 'notifications_active', text: 'سيتم إشعارك داخل التطبيق أو عبر البريد الإلكتروني' },
                  { icon: 'edit_calendar', text: 'سيتم تحديث تاريخ "آخر تحديث" في أعلى هذه الصفحة' },
                  { icon: 'timer', text: 'ستمنح مهلة 30 يوماً للمراجعة قبل سريان التغييرات' },
                  { icon: 'thumb_up', text: 'استمرارك في استخدام التطبيق يُعدّ موافقة ضمنية على الشروط المحدثة' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon name={item.icon} size={15} className="text-primary-600" filled />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-surface-50 rounded-xl p-3 border border-surface-100 mt-2">
                <p className="text-xs text-surface-500">
                  نوصي بمراجعة هذه الصفحة بشكل دوري للاطلاع على أي تغييرات. يمكنك الوصول إليها دائماً من صفحة الحساب أو التذييل.
                </p>
              </div>
            </div>
          </section>

          {/* 10. Contact */}
          <section id="contact" className="bg-gradient-to-br from-surface-800 to-surface-900 rounded-2xl p-6 text-white">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Icon name="contact_mail" size={22} className="text-surface-300" filled />
              معلومات الاتصال
            </h2>
            <p className="text-surface-300 text-sm leading-relaxed mb-5">
              إذا كان لديك أي سؤال حول هذه الشروط أو احتجت لمزيد من التوضيح، لا تتردد في التواصل معنا:
            </p>
            <div className="space-y-3">
              <a
                href="mailto:legal@patentehub.com"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-colors border border-white/10"
              >
                <Icon name="email" size={20} className="text-surface-300" />
                <div>
                  <p className="text-xs text-surface-400">للاستفسارات القانونية</p>
                  <p className="text-sm font-semibold" dir="ltr">legal@patentehub.com</p>
                </div>
              </a>
              <a
                href="mailto:support@patentehub.com"
                className="flex items-center gap-3 bg-white/10 hover:bg-white/20 rounded-xl px-4 py-3 transition-colors border border-white/10"
              >
                <Icon name="support_agent" size={20} className="text-surface-300" />
                <div>
                  <p className="text-xs text-surface-400">الدعم الفني العام</p>
                  <p className="text-sm font-semibold" dir="ltr">support@patentehub.com</p>
                </div>
              </a>
              <button
                onClick={() => onNavigate('contact')}
                className="w-full flex items-center justify-center gap-2 bg-white text-surface-900 font-semibold rounded-xl px-4 py-3 hover:bg-surface-100 transition-colors text-sm"
              >
                <Icon name="chat" size={18} className="text-surface-700" />
                فتح صفحة التواصل
              </button>
            </div>
          </section>

          {/* Navigation between legal pages */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('privacy-policy')}
              className="flex-1 flex items-center justify-between gap-2 bg-white rounded-2xl px-5 py-4 border border-surface-100 hover:border-primary-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                  <Icon name="privacy_tip" size={20} className="text-surface-400 group-hover:text-primary-500 transition-colors" />
                </div>
                <div className="text-right">
                  <p className="text-xs text-surface-400">شاهد أيضاً</p>
                  <p className="text-sm font-bold text-surface-900">سياسة الخصوصية</p>
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
