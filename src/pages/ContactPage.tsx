import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/utils/cn';

interface ContactPageProps {
  onNavigate: (page: string) => void;
}

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactPage({ onNavigate }: ContactPageProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.email.trim()) newErrors.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'بريد إلكتروني غير صالح';
    if (!formData.subject.trim()) newErrors.subject = 'الموضوع مطلوب';
    if (!formData.message.trim()) newErrors.message = 'الرسالة مطلوبة';
    else if (formData.message.trim().length < 20) newErrors.message = 'الرسالة يجب أن تكون 20 حرفاً على الأقل';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!validate()) return;
    setIsLoading(true);
    try {
      // Ready to connect to backend API:
      // await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
      await new Promise(resolve => setTimeout(resolve, 1200));
      setSubmitted(true);
    } catch {
      setSubmitError('حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مجدداً.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setErrors({});
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
          <h1 className="text-base font-bold text-surface-900">تواصل معنا</h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-sm">
              <Icon name="directions_car" size={16} className="text-white" filled />
            </div>
            <span className="text-sm font-bold text-surface-900 hidden sm:block">Patente Hub</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-surface-100 shadow-sm">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 mx-auto bg-success-50 rounded-full flex items-center justify-center mb-6">
                  <Icon name="check_circle" size={48} className="text-success-500" filled />
                </div>
                <h2 className="text-xl font-bold text-surface-900 mb-2">تم الإرسال بنجاح!</h2>
                <p className="text-surface-500 text-sm mb-6 leading-relaxed">
                  شكراً لتواصلك معنا. سنراجع رسالتك ونرد عليك في أقرب وقت ممكن،
                  <br />
                  عادةً خلال 24–48 ساعة.
                </p>
                <Button variant="outline" onClick={handleReset} icon={<Icon name="edit" size={18} />}>
                  إرسال رسالة أخرى
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <h2 className="text-lg font-bold text-surface-900 mb-1">أرسل رسالتك</h2>
                <p className="text-sm text-surface-400 -mt-2">الحقول المشار إليها بـ (*) إلزامية</p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="الاسم الكامل *"
                    placeholder="أدخل اسمك الكامل"
                    icon="person"
                    value={formData.name}
                    onChange={e => handleChange('name', e.target.value)}
                    error={errors.name}
                  />
                  <Input
                    label="البريد الإلكتروني *"
                    type="email"
                    placeholder="example@email.com"
                    icon="email"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    dir="ltr"
                    className="text-left"
                    error={errors.email}
                  />
                </div>

                <Input
                  label="الموضوع *"
                  placeholder="موضوع رسالتك"
                  icon="subject"
                  value={formData.subject}
                  onChange={e => handleChange('subject', e.target.value)}
                  error={errors.subject}
                />

                <div className="w-full">
                  <label className="block text-sm font-medium text-surface-700 mb-1.5">الرسالة *</label>
                  <textarea
                    rows={5}
                    placeholder="اكتب رسالتك هنا... (20 حرف على الأقل)"
                    value={formData.message}
                    onChange={e => handleChange('message', e.target.value)}
                    className={cn(
                      'w-full px-4 py-3 rounded-xl border border-surface-200 bg-white resize-none',
                      'text-surface-800 placeholder:text-surface-400',
                      'focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
                      'transition-all duration-200',
                      errors.message && 'border-danger-500 focus:border-danger-500 focus:ring-danger-100'
                    )}
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-danger-500 flex items-center gap-1">
                      <Icon name="error" size={16} />
                      {errors.message}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-surface-400 text-left" dir="ltr">
                    {formData.message.length} / min 20
                  </p>
                </div>

                {submitError && (
                  <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-xl flex items-center gap-2">
                    <Icon name="error" size={20} />
                    <span className="text-sm">{submitError}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  loading={isLoading}
                  icon={<Icon name="send" size={20} />}
                >
                  إرسال الرسالة
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-4">
          {/* Contact Details */}
          <div className="bg-white rounded-2xl p-5 border border-surface-100 shadow-sm">
            <h3 className="font-bold text-surface-900 mb-4 flex items-center gap-2">
              <Icon name="contact_support" size={20} className="text-primary-500" filled />
              معلومات التواصل
            </h3>
            <div className="space-y-4">
              <a
                href="mailto:support@patentehub.com"
                className="flex items-start gap-3 group"
              >
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-100 transition-colors">
                  <Icon name="email" size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-0.5">البريد الإلكتروني</p>
                  <p className="text-sm font-medium text-surface-800 group-hover:text-primary-600 transition-colors" dir="ltr">
                    support@patentehub.com
                  </p>
                </div>
              </a>

              <a
                href="https://wa.me/393000000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 group"
              >
                <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-success-100 transition-colors">
                  <Icon name="chat" size={20} className="text-success-600" />
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-0.5">واتساب</p>
                  <p className="text-sm font-medium text-surface-800 group-hover:text-success-600 transition-colors" dir="ltr">
                    +39 300 000 0000
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-surface-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="location_on" size={20} className="text-surface-400" />
                </div>
                <div>
                  <p className="text-xs text-surface-400 mb-0.5">الموقع</p>
                  <p className="text-sm font-medium text-surface-700">إيطاليا</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-5 border border-primary-100">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="schedule" size={20} className="text-primary-600" filled />
              <h3 className="font-bold text-primary-900 text-sm">ساعات الدعم</h3>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-primary-700">الأحد – الخميس</p>
              <p className="text-sm font-bold text-primary-800">9:00 ص – 6:00 م</p>
              <p className="text-xs text-primary-500 mt-1">توقيت وسط أوروبا (CET)</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl p-5 border border-surface-100 shadow-sm">
            <h3 className="font-bold text-surface-900 mb-3 flex items-center gap-2">
              <Icon name="link" size={20} className="text-surface-400" />
              روابط مفيدة
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('privacy-policy')}
                className="w-full flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-xl transition-all text-right"
              >
                <Icon name="privacy_tip" size={16} className="text-surface-400" />
                سياسة الخصوصية
              </button>
              <button
                onClick={() => onNavigate('terms-of-service')}
                className="w-full flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-xl transition-all text-right"
              >
                <Icon name="gavel" size={16} className="text-surface-400" />
                شروط الاستخدام
              </button>
              <button
                onClick={() => onNavigate('landing')}
                className="w-full flex items-center gap-2 text-sm text-surface-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-xl transition-all text-right"
              >
                <Icon name="help_outline" size={16} className="text-surface-400" />
                الأسئلة الشائعة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
