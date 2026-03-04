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
      {/* Scalloped rosette badge shape — same as the image */}
      <path
        d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2L12 21.04l3.4 1.47 1.89-3.2 3.61-.82-.34-3.69Z"
        fill="#3b82f6"
      />
      {/* White checkmark */}
      <path
        d="M7.5 12.5l3 3 6-6"
        stroke="white"
        strokeWidth="2.2"
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
