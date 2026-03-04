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
        <linearGradient id="vbg2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      {/* Seal / badge shape — 12-point star */}
      <path
        d="M12 2
           l2.09 3.26 3.76-1.12-1.12 3.76L20 10l-3.26 2.09 1.12 3.76-3.76-1.12L12 18
           l-2.09-3.26-3.76 1.12 1.12-3.76L4 10l3.26-2.09-1.12-3.76 3.76 1.12Z"
        fill="url(#vbg2)"
      />
      {/* White checkmark */}
      <path
        d="M8.5 12l2.5 2.5 4.5-5"
        stroke="white"
        strokeWidth="1.8"
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
