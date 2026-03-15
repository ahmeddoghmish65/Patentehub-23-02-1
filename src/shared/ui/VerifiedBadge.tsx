import { cn } from '@/shared/utils/cn';

interface VerifiedBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  tooltip?: boolean;
}

export function VerifiedBadge({ size = 'sm', className, tooltip = false }: VerifiedBadgeProps) {
  const dims: Record<string, number> = { xs: 14, sm: 18, md: 24, lg: 32 };
  const px = dims[size] ?? 18;

  // 10-bump smooth scalloped badge using quadratic bezier curves.
  // Peaks (r=11) connected via control points pulled inward (r=8.5),
  // creating soft rounded dips between bumps — no sharp corners.
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
      <path
        d="M12 1
           Q14.63 3.91 18.47 3.1
           Q18.88 7    22.46 8.6
           Q20.5  12   22.46 15.4
           Q18.88 17   18.47 20.9
           Q14.63 20.09 12  23
           Q9.37  20.09 5.53 20.9
           Q5.12  17    1.54 15.4
           Q3.5   12    1.54 8.6
           Q5.12  7     5.53 3.1
           Q9.37  3.91  12   1Z"
        fill="#3b82f6"
      />
      <path
        d="M7.5 12.5L10.5 15.5L16.5 9"
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
