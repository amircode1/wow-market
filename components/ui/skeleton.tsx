'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Loading skeleton placeholder
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('bg-surface animate-pulse rounded', className)}
      aria-label="Loading"
    />
  );
}

/**
 * Card skeleton
 */
export function CardSkeleton() {
  return (
    <div className="p-4 rounded-lg border bg-background">
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-32 mb-4" />
      <Skeleton className="h-12 w-full mb-2" />
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

/**
 * Chart skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32 mb-4" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

/**
 * Table skeleton
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

/**
 * Stat cards skeleton
 */
export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
