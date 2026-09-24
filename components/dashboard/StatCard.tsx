'use client';

import { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  icon?: ReactNode;
  title: string;
  value: ReactNode;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  className?: string;
}

/**
 * Reusable stat card for dashboard
 */
export function StatCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  isLoading,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-text-secondary">{icon}</div>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <div className="h-8 bg-surface rounded animate-pulse mb-1" />
            <div className="h-3 w-24 bg-surface rounded animate-pulse" />
          </>
        ) : (
          <>
            <div className="flex items-baseline gap-2">
              <div className="text-2xl font-bold">{value}</div>
              {trend && (
                <div
                  className={cn(
                    'text-xs font-medium',
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
