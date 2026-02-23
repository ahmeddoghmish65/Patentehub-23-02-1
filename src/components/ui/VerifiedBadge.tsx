import { cn } from '@/utils/cn';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  tooltip?: boolean;
}

export function VerifiedBadge({ size = 'sm', className, tooltip = false }: VerifiedBadgeProps) {
  const dims: Record<string, number> = { xs: 14, sm: 18, md: 24, lg: 32 };
  const px = dims[size] ?? 18;

  const badge = (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0 inline-block', className)}
      aria-label="حساب موثق"
      role="img"
    >
      <defs>
        <linearGradient id="vbg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      {/* Circle background — like Facebook */}
      <circle cx="12" cy="12" r="11" fill="url(#vbg)" />
      {/* White checkmark */}
      <path
        d="M7 12.5l3.5 3.5 6.5-7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  if (!tooltip) return badge;

  return (
    <span className="relative group inline-flex items-center">
      {badge}
      <span className="pointer-events-none absolute bottom-full mb-1.5 right-1/2 translate-x-1/2 bg-gray-900 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl">
        حساب موثق ✓
        <span className="absolute top-full right-1/2 translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}
