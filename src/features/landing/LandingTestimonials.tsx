import { useState, useEffect, useRef } from 'react';
import { Icon } from '@/shared/ui/Icon';
import { cn } from '@/shared/utils/cn';
import { useTranslation } from '@/i18n';

interface LandingTestimonialsProps {
  isVisible: (id: string) => boolean;
}

export function LandingTestimonials({ isVisible }: LandingTestimonialsProps) {
  const { t, dir } = useTranslation();
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const [testimonialDragOffset, setTestimonialDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const testimonialTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const testimonialDragStartX = useRef(0);

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

  const onDragStart = (clientX: number) => {
    testimonialDragStartX.current = clientX;
    setIsDragging(true);
  };
  const onDragMove = (clientX: number) => {
    if (!isDragging) return;
    setTestimonialDragOffset(clientX - testimonialDragStartX.current);
  };
  const onDragEnd = (clientX: number) => {
    if (!isDragging) return;
    setIsDragging(false);
    setTestimonialDragOffset(0);
    const diff = testimonialDragStartX.current - clientX;
    if (Math.abs(diff) > 50) { if (diff > 0) nextTestimonial(); else prevTestimonial(); }
  };

  return (
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

        {/* Carousel */}
        <div
          className={cn('overflow-hidden', isDragging ? 'cursor-grabbing' : 'cursor-grab')}
          dir="ltr"
          onMouseDown={(e) => onDragStart(e.clientX)}
          onMouseMove={(e) => onDragMove(e.clientX)}
          onMouseUp={(e) => onDragEnd(e.clientX)}
          onMouseLeave={(e) => onDragEnd(e.clientX)}
          onTouchStart={(e) => onDragStart(e.touches[0].clientX)}
          onTouchMove={(e) => onDragMove(e.touches[0].clientX)}
          onTouchEnd={(e) => onDragEnd(e.changedTouches[0].clientX)}
        >
          <div
            className="flex select-none"
            style={{
              transform: `translateX(calc(-${testimonialIndex} * 100% / ${visibleCount} + ${testimonialDragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 0.5s ease-in-out',
            }}
          >
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="shrink-0 px-2.5"
                style={{ width: `calc(100% / ${visibleCount})` }}
              >
                <div
                  dir={dir}
                  className={cn(
                    'bg-white/6 backdrop-blur-sm rounded-2xl p-6 border border-white/10 h-full flex flex-col transition-opacity duration-700',
                    isVisible('testimonials') ? 'opacity-100' : 'opacity-0'
                  )}
                >
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
  );
}
