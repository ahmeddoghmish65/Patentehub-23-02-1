import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import {
  setCookie,
  clearActivityCookies,
  COOKIE_NAMES,
  COOKIE_EXPIRY,
  type ConsentLevel,
} from '@/utils/cookieManager';

interface CookieConsentBannerProps {
  /** Called once the user makes a consent choice. */
  onConsent: (level: ConsentLevel) => void;
}

export function CookieConsentBanner({ onConsent }: CookieConsentBannerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleConsent = (level: ConsentLevel) => {
    // Persist the consent decision itself (always allowed — it's essential metadata)
    setCookie(COOKIE_NAMES.CONSENT, level, {
      days: COOKIE_EXPIRY.CONSENT,
      sameSite: 'Lax',
    });

    // If user chose "essential only" wipe any non-essential cookies that may
    // already exist from a previous session where they had consented.
    if (level === 'essential') {
      clearActivityCookies();
    }

    onConsent(level);
  };

  const cookieGroups = [
    {
      title: 'أساسية (مطلوبة دائماً)',
      icon: 'lock',
      colorClass: 'text-success-600',
      bgClass: 'bg-success-50 border-success-100',
      items: [
        { name: 'ph_auth', desc: 'الحفاظ على جلسة تسجيل الدخول (30 يوماً)' },
        { name: 'ph_lang', desc: 'تذكُّر تفضيل اللغة (1 سنة)' },
        { name: 'ph_theme', desc: 'تذكُّر السمة المختارة (1 سنة)' },
        { name: 'ph_consent', desc: 'حفظ قرار الموافقة (1 سنة)' },
      ],
    },
    {
      title: 'اختيارية (بموافقتك فقط)',
      icon: 'tune',
      colorClass: 'text-primary-600',
      bgClass: 'bg-primary-50 border-primary-100',
      items: [
        { name: 'ph_last_page', desc: 'آخر صفحة زرتها — للمتابعة من حيث توقفت (7 أيام)' },
        { name: 'ph_last_quiz', desc: 'آخر اختبار أجريته (7 أيام)' },
        { name: 'ph_last_lesson', desc: 'آخر درس فتحته (7 أيام)' },
      ],
    },
  ];

  return (
    <div
      className="fixed bottom-0 inset-x-0 z-[9999] p-3 sm:p-4 lg:p-6"
      role="dialog"
      aria-label="إشعار ملفات الارتباط"
      aria-live="polite"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-surface-200 overflow-hidden animate-fade-in-up">
        {/* Main row */}
        <div className="flex items-start gap-3 p-5 pb-4">
          <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <Icon name="cookie" size={22} className="text-primary-600" filled />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-surface-900 text-sm sm:text-base mb-1">
              نستخدم ملفات الارتباط (Cookies)
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 leading-relaxed">
              نحتاج إلى ملفات ارتباط أساسية لحفظ جلسة الدخول وتفضيلاتك.
              بموافقتك، نحفظ نشاطك الأخير لتستمر من حيث توقفت.
              يمكنك قراءة{' '}
              <span className="text-primary-600 font-medium">سياسة الخصوصية</span>
              {' '}للمزيد.
            </p>
          </div>
        </div>

        {/* Expandable details */}
        {showDetails && (
          <div className="px-5 pb-4">
            <div className="grid sm:grid-cols-2 gap-3">
              {cookieGroups.map((group, gi) => (
                <div
                  key={gi}
                  className={`rounded-xl p-3 border ${group.bgClass}`}
                >
                  <div className="flex items-center gap-2 mb-2.5">
                    <Icon name={group.icon} size={15} className={group.colorClass} />
                    <p className={`text-xs font-bold ${group.colorClass}`}>
                      {group.title}
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {group.items.map((item, ii) => (
                      <li key={ii} className="text-xs text-surface-600">
                        <span className="font-mono font-medium text-surface-800">{item.name}</span>
                        <span className="text-surface-400"> — </span>
                        {item.desc}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action bar */}
        <div className="px-5 py-3.5 bg-surface-50 border-t border-surface-100 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => setShowDetails(v => !v)}
            className="text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1 sm:mr-auto self-start sm:self-auto transition-colors"
          >
            <Icon name={showDetails ? 'expand_less' : 'info'} size={15} />
            {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
          </button>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => handleConsent('essential')}
              className="flex-1 sm:flex-none text-xs font-semibold px-4 py-2.5 rounded-xl border-2 border-surface-300 text-surface-600 hover:border-surface-400 hover:bg-white transition-all"
            >
              الضروري فقط
            </button>
            <Button
              onClick={() => handleConsent('all')}
              size="sm"
              className="flex-1 sm:flex-none !text-xs !py-2.5 !px-4"
              icon={<Icon name="check_circle" size={15} />}
            >
              قبول الجميع
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
