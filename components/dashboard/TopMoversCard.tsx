'use client';

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn, formatGold } from '@/lib/utils';
import Link from 'next/link';
import { GoldAmount } from '@/components/ui/GoldAmount';

export interface TopMoverItem {
  id: number;
  name: string;
  price: number;
  change: number;
  volume?: number;
  icon?: string;
}

interface TopMoversCardProps {
  title?: string;
  description?: string;
  items: TopMoverItem[];
  isLoading?: boolean;
  type?: 'gainers' | 'losers';
  footer?: ReactNode;
}

/**
 * Card displaying top gainers or losers
 */
export function TopMoversCard({
  title = 'Top Movers',
  description,
  items,
  isLoading,
  type = 'gainers',
  footer,
}: TopMoversCardProps) {
  const isGainers = type === 'gainers';
  const TrendIcon = isGainers ? TrendingUp : TrendingDown;
  const trendColor = isGainers ? 'text-success' : 'text-destructive';
  const bgColor = isGainers ? 'bg-success/10' : 'bg-destructive/10';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendIcon className={cn('h-5 w-5', trendColor)} />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-surface rounded animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <>
            <div className="space-y-3">
              {items.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface hover:bg-surface/80 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={cn('w-8 h-8 rounded flex items-center justify-center text-sm', bgColor)}>
                        {item.icon ? (
                          <img src={item.icon} alt="" className="h-8 w-8 rounded object-cover" loading="lazy" />
                        ) : isGainers ? '📈' : '📉'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium line-clamp-1">{item.name}</div>
                        <div className="text-xs text-text-secondary">
                          <GoldAmount copper={item.price || 0} />
                        </div>
                      </div>
                    </div>
                    <div className={cn('text-right font-medium', trendColor)}>
                      {isGainers ? '+' : ''}{item.change.toFixed(1)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {footer && <div className="mt-4">{footer}</div>}
          </>
        ) : (
          <div className="text-center py-8 text-text-secondary text-sm">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
