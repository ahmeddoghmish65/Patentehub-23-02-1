import { cn } from '@/shared/utils/cn';

interface SkeletonProps {
  className?: string;
}

/** Base skeleton pulse block */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse bg-surface-100 rounded-xl', className)} />
  );
}

/** Card-shaped skeleton — used on list pages */
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-surface-100 p-5 space-y-3">
      <div className="flex items-start gap-3">
        <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

/** Grid of skeleton cards */
export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/** List row skeleton */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-surface-100">
      <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

/** Profile page skeleton */
export function SkeletonProfile() {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-6 flex items-center gap-4 border border-surface-100">
        <Skeleton className="w-20 h-20 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-52" />
        </div>
      </div>
      <SkeletonGrid count={4} />
    </div>
  );
}
